import React, { useEffect, useRef, useState } from 'react';
import { useFlights } from '../context/FlightContext';

let L;

const LiveMap = ({ showToast }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const { flights, filteredFlights, selectedFlight, setSelectedFlight, loadFlight, loadTrack, connected, flyToFlight, setFlyToFlight } = useFlights();
  const [currentLayer, setCurrentLayer] = useState('street');
  const [showLayers, setShowLayers] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [showWind, setShowWind] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchingText, setSwitchingText] = useState('');
  const activeTileRef = useRef(null);
  const streetLayerRef = useRef(null);
  const satelliteLayerRef = useRef(null);
  const weatherLayerRef = useRef(null);
  const routeLayerRef = useRef(null);

  // Initialize map
  useEffect(() => {
    if (mapInstanceRef.current) return;

    L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: false,
      fadeAnimation: true,
      preferCanvas: true // CRITICAL: Use Canvas for 10x marker performance
    });

    // PRE-LOAD ALL LAYERS INSTANTLY
    const streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
      zIndex: 1,
      updateWhenIdle: false,
      keepBuffer: 8
    }).addTo(map);

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri',
      maxZoom: 19,
      zIndex: 1,
      opacity: 0.1, // Keep it partially loaded in background
      updateWhenIdle: false,
      keepBuffer: 8
    }).addTo(map);

    streetLayerRef.current = streetLayer;
    satelliteLayerRef.current = satelliteLayer;
    activeTileRef.current = streetLayer;

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapInstanceRef.current = map;

    // Snappy initialization
    setTimeout(() => {
      map.invalidateSize({ animate: false });
    }, 100);

    // Also invalidate on window resize
    const handleResize = () => map.invalidateSize({ animate: false });
    window.addEventListener('resize', handleResize);

    setMapReady(true);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Zero-Lag Layer Toggling
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !streetLayerRef.current || !satelliteLayerRef.current) return;
    
    const isStreet = currentLayer === 'street';
    const isSatellite = currentLayer === 'satellite';
    const isCockpit = currentLayer === 'cockpit';

    // Instant opacity toggle (no network calls)
    streetLayerRef.current.setOpacity(isStreet ? 1 : 0.0001);
    satelliteLayerRef.current.setOpacity((isSatellite || isCockpit) ? 1 : 0.0001);

    // Cinematic Transition Logic for Cockpit
    if (isCockpit && !isSwitching) {
      setIsSwitching(true);
      setSwitchingText('INITIATING PILOT MODE');
      
      setTimeout(() => setSwitchingText('CALIBRATING 3D TERRAIN'), 800);
      setTimeout(() => setSwitchingText('SYNCHRONIZING SATELLITE DATA'), 1600);
      
      // Complete transition
      setTimeout(() => {
        setIsSwitching(false);
        mapInstanceRef.current?.invalidateSize({ animate: false });
      }, 2500); 
    }
  }, [currentLayer, mapReady, isSwitching]);

  // Keep track of the active selected flight globally for the leaflet hooks
  useEffect(() => {
    window.activeSelectedFlight = selectedFlight;
  }, [selectedFlight]);

  // Handle flyToFlight request
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !flyToFlight) return;
    const map = mapInstanceRef.current;
    
    // Find flight by ICAO or just use coords if available
    const flight = flights.find(f => f.icao24 === flyToFlight.icao24);
    if (flight && flight.latitude && flight.longitude) {
       map.flyTo([flight.latitude, flight.longitude], 12, { duration: 2 });
       setFlyToFlight(null); // Reset after actioned
    }
  }, [flyToFlight, flights, mapReady, setFlyToFlight]);

  // Handle Weather Layer (RainViewer)
  useEffect(() => {
    if (!mapReady || !window.L || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (showWeather) {
      if (!weatherLayerRef.current) {
        fetch('https://api.rainviewer.com/public/weather-maps.json')
          .then(res => res.json())
          .then(data => {
            if (!showWeather) return; // User toggled off before load finished
            const latestPath = data.radar?.past?.[data.radar.past.length - 1]?.path;
            if (latestPath) {
              weatherLayerRef.current = L.tileLayer(
                `https://tilecache.rainviewer.com${latestPath}/256/{z}/{x}/{y}/4/1_1.png`, {
                  opacity: 0.75,
                  zIndex: 2,
                  className: 'animate-fade-in'
                }
              ).addTo(map);
            }
          })
          .catch(err => console.log('Weather radar unavailable', err));
      } else {
        if (!map.hasLayer(weatherLayerRef.current)) {
          map.addLayer(weatherLayerRef.current);
        }
      }
    } else {
      if (weatherLayerRef.current && map.hasLayer(weatherLayerRef.current)) {
        map.removeLayer(weatherLayerRef.current);
      }
    }
  }, [showWeather, mapReady]);

  // Handle Flight Route Drawing (Trajectory)
  useEffect(() => {
    if (!mapReady || !window.L || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const { getAirportCoordinates } = require('../utils/airports');

    const drawRoute = async () => {
      // Cleanup previous route layer
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }

      // Only draw if a flight is selected
      const currentFlight = flights.find(f => window.selectedFlightIcao && f.icao24 === window.selectedFlightIcao) || window.activeSelectedFlight;
      if (!currentFlight) return;

      const routeGroup = L.layerGroup().addTo(map);
      routeLayerRef.current = routeGroup;

      const oriIata = currentFlight.departure?.iata;
      const dstIata = currentFlight.arrival?.iata;
      const oriCoords = getAirportCoordinates(oriIata);
      const dstCoords = getAirportCoordinates(dstIata);

      // Attempt to fetch actual track waypoints
      let waypoints = [];
      try {
        const trackData = await loadTrack(currentFlight.icao24);
        if (trackData && trackData.path && trackData.path.length > 0) {
          // OpenSky path: [time, lat, lon, alt, track, ground]
          waypoints = trackData.path
            .filter(p => p[1] !== null && p[2] !== null)
            .map(p => [p[1], p[2]]);
        }
      } catch (err) {
        console.warn('Could not fetch trajectory, falling back to straight line');
      }

      // Final latlngs to draw
      let drawPoints = waypoints;
      
      // Fallback to straight line if no waypoints
      if (drawPoints.length < 2) {
        const currentPos = [currentFlight.latitude, currentFlight.longitude];
        if (oriCoords) drawPoints.push(oriCoords);
        if (currentPos[0] && currentPos[1]) drawPoints.push(currentPos);
        if (dstCoords) drawPoints.push(dstCoords);
      }

      if (drawPoints.length >= 2) {
        // Draw the path
        L.polyline(drawPoints, {
          className: 'premium-flight-path',
          color: '#38bdf8',
          weight: 3,
          opacity: 0.8,
          dashArray: waypoints.length > 0 ? null : '10, 10', // Solid for actual track, dashed for fallback
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(routeGroup);

        // Add Origin Marker
        if (oriCoords) {
          const time = currentFlight.departure?.scheduled || '--:--';
          const oriNode = L.divIcon({
            className: '',
            html: `
              <div style="background:rgba(9,9,11,0.9); border:2px solid #38bdf8; border-radius:12px; padding:4px 8px; font-family:Inter,sans-serif; color:white; font-size:10px; font-weight:bold; white-space:nowrap; box-shadow:0 0 10px rgba(56,189,248,0.5); transform:translate(-50%, -100%); margin-top:-10px;">
                <span style="color:#94a3b8">DEP</span> ${oriIata || 'Origin'} • <span style="color:#a78bfa">${time}</span>
              </div>
              <div style="width:10px; height:10px; background:#38bdf8; border-radius:50%; border:2px solid white; box-shadow:0 0 10px #38bdf8; margin:0 auto;"></div>
            `,
            iconSize: [0, 0]
          });
          L.marker(oriCoords, { icon: oriNode }).addTo(routeGroup);
        }

        // Add Destination Marker
        if (dstCoords) {
          const time = currentFlight.arrival?.scheduled || '--:--';
          const dstNode = L.divIcon({
            className: '',
            html: `
              <div style="background:rgba(9,9,11,0.9); border:2px solid #4ade80; border-radius:12px; padding:4px 8px; font-family:Inter,sans-serif; color:white; font-size:10px; font-weight:bold; white-space:nowrap; box-shadow:0 0 10px rgba(74,222,128,0.5); transform:translate(-50%, -100%); margin-top:-10px;">
                <span style="color:#94a3b8">ARR</span> ${dstIata || 'Dest'} • <span style="color:#4ade80">${time}</span>
              </div>
              <div style="width:10px; height:10px; background:#4ade80; border-radius:50%; border:2px solid white; box-shadow:0 0 10px #4ade80; margin:0 auto;"></div>
            `,
            iconSize: [0, 0]
          });
          L.marker(dstCoords, { icon: dstNode }).addTo(routeGroup);
        }
      }
    };

    drawRoute();
  }, [selectedFlight, flights, mapReady, loadTrack]);

  // Update markers when flights change
  useEffect(() => {
    if (!mapReady || !window.L || !flights.length) return;
    L = window.L;
    const map = mapInstanceRef.current;

    const currentIds = new Set(filteredFlights.map(f => f.icao24));

    // Remove stale markers
    Object.keys(markersRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        mapInstanceRef.current.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });

    // Add/update markers
    filteredFlights.forEach(flight => {
      if (!flight.latitude || !flight.longitude) return;

      const rotation = flight.trueTrack || 0;
      const speed = flight.velocity || 0;
      const alt = flight.baroAltitude || 0;

      // Color by airline or status
      let color = '#38bdf8'; // bright blue
      if (flight.onGround) color = '#a1a1aa'; // gray
      else if (alt > 10000) color = '#a78bfa'; // light purple
      else if (alt > 5000) color = '#38bdf8'; // light sky blue
      else color = '#4ade80'; // bright green

      const icon = L.divIcon({
        className: '',
        html: `<div style="transform:rotate(${rotation}deg); color:${color}; font-size:16px; transition:transform 0.5s; filter:drop-shadow(0 0 4px #000); text-shadow: 0 0 2px #000;">✈</div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const label = flight.callsign || flight.flightNumber || flight.icao24;
      const tooltip = `
        <div style="background:rgba(9,9,11,0.9);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:10px 14px;font-family:Inter,sans-serif;font-size:12px;color:#f4f4f5;min-width:160px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.5);">
          <div style="font-weight:600;font-size:14px;color:#38bdf8">${label}</div>
          <div style="color:#a1a1aa;margin-top:4px">${flight.airline || flight.originCountry || ''}</div>
          <div style="margin-top:6px;display:flex;justify-content:space-between">
            <span>ALT</span><span style="font-weight:500;color:#e4e4e7">${alt ? Math.round(alt).toLocaleString() + ' m' : 'N/A'}</span>
          </div>
          <div style="display:flex;justify-content:space-between">
            <span>SPD</span><span style="font-weight:500;color:#e4e4e7">${speed ? Math.round(speed * 3.6) + ' km/h' : 'N/A'}</span>
          </div>
          ${flight.departure?.iata && flight.arrival?.iata ? `<div style="margin-top:6px;color:#a1a1aa;font-weight:500">${flight.departure.iata} → ${flight.arrival.iata}</div>` : ''}
        </div>
      `;

      if (markersRef.current[flight.icao24]) {
        markersRef.current[flight.icao24].setLatLng([flight.latitude, flight.longitude]);
        markersRef.current[flight.icao24].setIcon(icon);
      } else {
        const marker = L.marker([flight.latitude, flight.longitude], { icon })
          .addTo(map)
          .bindTooltip(L.tooltip({ permanent: false, direction: 'top', opacity: 1, className: '' }).setContent(tooltip));

        marker.on('click', async () => {
          const detail = await loadFlight(flight.callsign || flight.icao24);
          if (detail) setSelectedFlight(detail);
          else setSelectedFlight(flight);
          showToast(`Tracking ${label}`, 2000);
        });

        markersRef.current[flight.icao24] = marker;
      }
    });
  }, [filteredFlights, mapReady, loadFlight, setSelectedFlight, showToast, flights.length]);

  const flyToIndia = () => mapInstanceRef.current?.flyTo([20.5937, 78.9629], 5, { duration: 1.5 });
  const flyToWorld = () => mapInstanceRef.current?.flyTo([25, 75], 3, { duration: 1.5 });

  return (
    <div className={`reveal rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-white/10 glass shine-effect perspective-container ${currentLayer === 'cockpit' ? 'cockpit-mode' : ''}`} style={{ height: 720, background: '#09090b' }}>
      <div ref={mapRef} className="w-full h-full text-zinc-800 transition-all duration-1000 ease-in-out map-viewport" />

      {/* Map controls overlay */}
      <div className="absolute top-6 left-6 glass rounded-3xl p-5 w-72 z-[1000] shadow-2xl border border-white/10 shine-effect">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full status-dot ${connected ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
            <span className="text-[10px] font-black tracking-[0.2em] text-zinc-300 uppercase">{connected ? 'LIVE NETWORK' : 'CHACHED MODE'}</span>
          </div>
          <span className="text-[10px] font-bold text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-full">{filteredFlights.length} AIRCRAFT</span>
        </div>

        {/* Legend */}
        <div className="space-y-2 text-[10px] text-zinc-400 mt-4 border-t border-white/5 pt-4 font-bold tracking-widest uppercase">
          <div className="flex items-center gap-3"><span className="text-xl" style={{ color: '#a78bfa', filter: 'drop-shadow(0 0 5px rgba(167,139,250,0.5))' }}>✈</span> High altitude</div>
          <div className="flex items-center gap-3"><span className="text-xl" style={{ color: '#38bdf8', filter: 'drop-shadow(0 0 5px rgba(56,189,248,0.5))' }}>✈</span> Mid altitude</div>
          <div className="flex items-center gap-3"><span className="text-xl" style={{ color: '#4ade80', filter: 'drop-shadow(0 0 5px rgba(74,222,128,0.5))' }}>✈</span> Low altitude</div>
          <div className="flex items-center gap-3"><span className="text-xl" style={{ color: '#a1a1aa' }}>✈</span> On ground</div>
        </div>
      </div>

      {/* Wind Particles Overlay */}
      {showWind && (
        <div className="absolute inset-0 pointer-events-none z-[1010] overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="wind-particle" 
              style={{ 
                top: `${Math.random() * 100}%`, 
                width: `${Math.random() * 200 + 100}px`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${Math.random() * 3 + 4}s`
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Map nav buttons */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-3 z-[1000]">
        <button onClick={flyToIndia} className="glass text-zinc-100 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all shadow-2xl w-32">India</button>
        <button onClick={flyToWorld} className="glass text-zinc-100 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all shadow-2xl w-32">World</button>
 
        {/* Layer Controls */}
        <div className="relative mt-2">
          <button
            onClick={() => setShowLayers(!showLayers)}
            className="glass text-zinc-100 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all shadow-2xl flex items-center justify-center gap-3 w-32"
          >
            <i className="fa-solid fa-layer-group text-sky-400"></i> Layers
          </button>
 
          {showLayers && (
            <div className="absolute top-full right-0 mt-3 glass rounded-2xl p-2 w-56 shadow-2xl flex flex-col gap-1 overflow-hidden animate-slide-up">
              <button
                onClick={() => { setCurrentLayer('street'); setShowLayers(false); showToast('Switched to Street View', 1500); }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentLayer === 'street' ? 'bg-sky-500 text-white shadow-lg' : 'text-zinc-100 hover:bg-white/5'}`}
              >
                <span>Normal View</span>
                <i className="fa-solid fa-map"></i>
              </button>
              <button
                onClick={() => { setCurrentLayer('satellite'); setShowLayers(false); showToast('Switched to Satellite View', 1500); }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentLayer === 'satellite' ? 'bg-emerald-500 text-white shadow-lg' : 'text-zinc-100 hover:bg-white/5'}`}
              >
                <span>Satellite</span>
                <i className="fa-solid fa-satellite"></i>
              </button>
              <button
                onClick={() => { setCurrentLayer('cockpit'); setShowLayers(false); showToast('Entering Cockpit View: 3D Terrain Activated', 2000); }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentLayer === 'cockpit' ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'text-zinc-100 hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                   <span>Cockpit View</span>
                </div>
                <i className="fa-solid fa-jet-fighter-up"></i>
              </button>
              <div className="h-px bg-zinc-800 my-1 mx-2"></div>
              <button
                onClick={() => { setShowWeather(!showWeather); setShowLayers(false); showToast(showWeather ? 'Weather Radar Disabled' : 'Live Weather Active', 1500); }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showWeather ? 'bg-amber-500 text-white shadow-lg' : 'text-zinc-100 hover:bg-white/5'}`}
              >
                <span>Weather Radar</span>
                <i className={`fa-solid ${showWeather ? 'fa-cloud-sun' : 'fa-cloud'}`}></i>
              </button>
              <button
                onClick={() => { setShowWind(!showWind); setShowLayers(false); showToast(showWind ? 'Wind Overlay Disabled' : 'Global Wind Patterns Active', 1500); }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showWind ? 'bg-indigo-500 text-white shadow-lg' : 'text-zinc-100 hover:bg-white/5'}`}
              >
                <span>Wind Map</span>
                <i className="fa-solid fa-wind"></i>
              </button>
            </div>
          )}
        </div>
      </div>
 
      {/* Cinematic Transition Overlay */}
      {isSwitching && (
        <div className="absolute inset-0 z-[5000] flex flex-col items-center justify-center glass-dark backdrop-blur-3xl animate-fade-in">
          <div className="relative">
            {/* Radar Pulse */}
            <div className="absolute inset-0 -m-8 border border-sky-500/20 rounded-full animate-ping"></div>
            <div className="absolute inset-0 -m-16 border border-sky-500/10 rounded-full animate-ping [animation-delay:0.5s]"></div>
            
            <div className="relative w-32 h-32 flex items-center justify-center">
               <i className="fa-solid fa-jet-fighter-up text-5xl text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]"></i>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <div className="text-[10px] font-black tracking-[0.5em] text-sky-500 uppercase mb-4 animate-pulse">
              System Alert
            </div>
            <div className="logo-font text-3xl font-bold mb-8">
              {switchingText}
            </div>
            
            {/* Premium Progress Bar */}
            <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-500 w-full animate-scanning-pulse"></div>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-6 text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
               <span className="flex items-center gap-2"><i className="fa-solid fa-satellite animate-spin"></i> L-BAND</span>
               <span className="flex items-center gap-2"><i className="fa-solid fa-signal"></i> 3.2 GPS</span>
               <span className="flex items-center gap-2"><i className="fa-solid fa-microchip"></i> GPU-ACC</span>
            </div>
          </div>
        </div>
      )}

      {/* Click hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 glass rounded-full px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 z-[1000] shadow-2xl shine-effect">
        Click any aircraft for live mission intelligence
      </div>
    </div>
  );
};

export default LiveMap;
