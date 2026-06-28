import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSocket } from '../services/socket';
import { flightAPI } from '../services/api';

const FlightContext = createContext();

export const FlightProvider = ({ children }) => {
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [stats, setStats] = useState({ total: 0, airborne: 0, delayed: 0, cargo: 0 });
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [routeFilter, setRouteFilter] = useState({ from: '', to: '' });
  const [flyToFlight, setFlyToFlight] = useState(null);

  // Initial fetch
  const loadFlights = useCallback(async () => {
    try {
      setLoading(true);
      const res = await flightAPI.getAll();
      setFlights(res.data.data || []);
    } catch (err) {
      console.error('Failed to load flights:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load single flight detail
  const loadFlight = useCallback(async (callsign) => {
    try {
      const res = await flightAPI.getByCallsign(callsign);
      setSelectedFlight(res.data.data);
      return res.data.data;
    } catch (err) {
      console.error('Flight not found:', err.message);
      return null;
    }
  }, []);

  // Load aircraft track (trajectory)
  const loadTrack = useCallback(async (icao24) => {
    try {
      const res = await flightAPI.getTrack(icao24);
      return res.data.data;
    } catch (err) {
      console.error('Track data not found:', err.message);
      return null;
    }
  }, []);

  // Load flights by route
  const loadFlightsByRoute = useCallback(async (from, to) => {
    try {
      setLoading(true);
      const res = await flightAPI.getByRoute(from, to);
      const filtered = res.data.data || [];
      // Temporarily update flights list with these results if not many
      if (filtered.length > 0) {
        setFlights(prev => {
          const others = prev.filter(p => !filtered.find(f => f.icao24 === p.icao24));
          return [...filtered, ...others];
        });
      }
      setRouteFilter({ from, to });
      return filtered;
    } catch (err) {
      console.error('Failed to load flights by route:', err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlights();

    const socket = getSocket();

    socket.on('connect', () => {
      setConnected(true);
      console.log('🔌 Socket connected');
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('flights:update', (data) => {
      setFlights(data);
    });

    socket.on('stats:update', (data) => {
      setStats(data);
    });

    // Polling fallback for environments like Vercel where WebSockets might be restricted
    const pollInterval = setInterval(() => {
      if (!socket.connected) {
        console.log('🔄 Socket disconnected, polling for updates...');
        loadFlights();
      }
    }, 60000); // 60 seconds fallback

    return () => {
      socket.off('flights:update');
      socket.off('stats:update');
      socket.off('connect');
      socket.off('disconnect');
      clearInterval(pollInterval);
    };
  }, [loadFlights]);

  const filteredFlights = flights.filter(f => {
    // Priority 1: Route Filter
    if (routeFilter.from || routeFilter.to) {
      const matchFrom = !routeFilter.from || f.departure?.iata?.toUpperCase() === routeFilter.from.toUpperCase();
      const matchTo = !routeFilter.to || f.arrival?.iata?.toUpperCase() === routeFilter.to.toUpperCase();
      if (matchFrom && matchTo) return true;
      return false;
    }

    // Priority 2: General Search Query
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.callsign?.toLowerCase().includes(q) ||
      f.flightNumber?.toLowerCase().includes(q) ||
      f.departure?.iata?.toLowerCase().includes(q) ||
      f.arrival?.iata?.toLowerCase().includes(q) ||
      f.airline?.toLowerCase().includes(q)
    );
  });

  const emergencyFlights = flights.filter(f => f.squawk === '7700' || f.squawk === '7600' || f.squawk === 7700 || f.squawk === 7600);

  return (
    <FlightContext.Provider value={{
      flights,
      filteredFlights,
      selectedFlight,
      setSelectedFlight,
      stats,
      loading,
      connected,
      loadFlight,
      loadFlights,
      loadTrack,
      loadFlightsByRoute,
      searchQuery,
      setSearchQuery,
      routeFilter,
      setRouteFilter,
      emergencyFlights,
      flyToFlight,
      setFlyToFlight
    }}>
      {children}
    </FlightContext.Provider>
  );
};

export const useFlights = () => useContext(FlightContext);
