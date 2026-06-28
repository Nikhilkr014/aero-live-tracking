const axios = require('axios');
const Flight = require('../models/Flight');

// Basic Auth helper for OpenSky Network
const getOpenSkyAuth = () => {
  const username = process.env.OPENSKY_USERNAME;
  const password = process.env.OPENSKY_PASSWORD;
  
  if (username && password) {
    return {
      auth: {
        username: username,
        password: password
      }
    };
  }
  
  console.log("OpenSky: Missing credentials in .env, using anonymous access.");
  return {};
};

// Fetch from OpenSky Network (free, real-time)
const fetchFromOpenSky = async () => {
  const config = {
    timeout: 10000,
    params: {
      // Bounding box for Indian subcontinent + nearby
      lamin: 6.0,
      lomin: 68.0,
      lamax: 35.0,
      lomax: 97.0
    },
    ...getOpenSkyAuth()
  };

  const response = await axios.get('https://opensky-network.org/api/states/all', config);

  if (!response.data || !response.data.states) return [];

  return response.data.states.map(s => ({
    icao24: s[0],
    callsign: (s[1] || '').trim(),
    originCountry: s[2],
    longitude: s[5],
    latitude: s[6],
    baroAltitude: s[7],
    geoAltitude: s[13],
    onGround: s[8],
    velocity: s[9],
    trueTrack: s[10],
    verticalRate: s[11],
    squawk: s[14],
    lastUpdated: new Date(s[4] * 1000)
  })).filter(f => f.latitude && f.longitude && f.callsign);
};

// Fetch specific flight from OpenSky globally (no bounding box)
const fetchSingleFlightFromOpenSky = async (icao24) => {
  const config = { 
    timeout: 10000, 
    params: { icao24 },
    ...getOpenSkyAuth()
  };

  try {
    const response = await axios.get('https://opensky-network.org/api/states/all', config);
    if (!response.data || !response.data.states || response.data.states.length === 0) return null;
    
    const s = response.data.states[0];
    return {
      icao24: s[0],
      callsign: (s[1] || '').trim(),
      originCountry: s[2],
      longitude: s[5],
      latitude: s[6],
      baroAltitude: s[7],
      geoAltitude: s[13],
      onGround: s[8],
      velocity: s[9],
      trueTrack: s[10],
      verticalRate: s[11],
      squawk: s[14],
      lastUpdated: new Date(s[4] * 1000)
    };
  } catch (err) {
    console.error("Error fetching single flight from OpenSky:", err.message);
    return null;
  }
};

// Enrich with AviationStack if API key available
const enrichWithAviationStack = async (input) => {
  const key = process.env.AVIATIONSTACK_KEY;
  if (!key || key === 'your_aviationstack_key_here') return null;

  const trySearch = async (params) => {
    try {
      const res = await axios.get('http://api.aviationstack.com/v1/flights', {
        params: { access_key: key, ...params },
        timeout: 5000
      });
      return res.data && res.data.data && res.data.data.length > 0 ? res.data.data[0] : null;
    } catch (err) {
      if (err.response?.status === 429) {
          console.log("AviationStack: Rate limit reached (429).");
          return null;
      }
      console.error(`AviationStack Error for params ${JSON.stringify(params)}:`, err.message);
      return null;
    }
  };

  const normalized = input.toUpperCase().trim();
  let flightData = null;

  // 1. Try exact ICAO search (most common for callsigns)
  flightData = await trySearch({ flight_icao: normalized });
  
  // 2. Try exact IATA search
  if (!flightData) flightData = await trySearch({ flight_iata: normalized });

  // 3. Handle Radio Callsigns (e.g. IGO625W -> IGO625) 
  // Strip trailing letters only if there's a digit pattern
  const stripped = normalized.replace(/([0-9]+)[A-Z]+$/, '$1');
  if (!flightData && stripped !== normalized) {
      flightData = await trySearch({ flight_icao: stripped }) || await trySearch({ flight_iata: stripped });
  }

  if (flightData) {
    const f = flightData;
    return {
      airline: f.airline?.name,
      flightNumber: f.flight?.iata,
      departure: {
        airport: f.departure?.airport,
        iata: f.departure?.iata,
        scheduled: f.departure?.scheduled,
        actual: f.departure?.actual
      },
      arrival: {
        airport: f.arrival?.airport,
        iata: f.arrival?.iata,
        scheduled: f.arrival?.scheduled,
        estimated: f.arrival?.estimated
      },
      status: f.flight_status,
      aircraft: {
        registration: f.aircraft?.registration,
        model: f.aircraft?.iata,
        icao24: f.aircraft?.icao24?.toLowerCase()
      },
      live: f.live // Include live GPS/Altitude if AviationStack provides it
    };
  }
  return null;
};

let flightCache = [];
let lastFetchTime = 0;
const CACHE_TTL = 15000; // 15 seconds

const fetchAndCacheLiveFlights = async () => {
  const now = Date.now();

  // Return cache if fresh
  if (flightCache.length > 0 && (now - lastFetchTime) < CACHE_TTL) {
    return flightCache;
  }

  try {
    const flights = await fetchFromOpenSky();
    if (flights && flights.length > 0) {
      // Simulate slightly randomised positions for live feel
      flightCache = flights.map(f => ({
        ...f,
        latitude: f.latitude + (Math.random() - 0.5) * 0.01,
        longitude: f.longitude + (Math.random() - 0.5) * 0.01
      }));
      lastFetchTime = now;
      return flightCache;
    }
  } catch (err) {
    console.log('OpenSky unavailable, returning empty list:', err.message);
  }

  // Fallback: return empty array if all fail (Strict mode active)
  flightCache = [];
  lastFetchTime = now;
  return flightCache;
};

// Controller: GET /api/flights
const getFlights = async (req, res) => {
  try {
    const flights = await fetchAndCacheLiveFlights();
    res.json({ success: true, count: flights.length, data: flights });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Controller: GET /api/flights/:callsign
const getFlightByCallsign = async (req, res) => {
  const { callsign } = req.params;
  const input = callsign.toUpperCase().trim();
  
  try {
    // 1. Check local bounding box cache first
    const flights = await fetchAndCacheLiveFlights();
    let flight = flights.find(f =>
      f.callsign?.toUpperCase() === input ||
      f.flightNumber?.toUpperCase() === input
    );

    // 2. Try to grab its data via AviationStack (Global Search)
    let enrichedData = await enrichWithAviationStack(input);
    
    if (enrichedData) {
        if (flight) {
            flight = { ...flight, ...enrichedData };
        } else {
            // It's a real flight but not in our Indian bounding box
            // Try to pinpoint live GPS globally via its transponder hex code (ICAO24)
            if (enrichedData.aircraft?.icao24) {
               const liveGlobal = await fetchSingleFlightFromOpenSky(enrichedData.aircraft.icao24);
               if (liveGlobal) {
                   flight = { ...liveGlobal, ...enrichedData };
               }
            }
            
            // If still no GPS, return the schedule data
            if (!flight) {
                flight = { 
                    callsign: input,
                    ...enrichedData,
                    status: enrichedData.status || 'active'
                };
            }
        }
    }

    if (!flight) {
      console.log(`Flight ${input} not found in live tracking or schedules.`);
      return res.status(404).json({ success: false, message: 'Flight not found in live search.' });
    }

    res.json({ success: true, data: flight });
  } catch (err) {
    console.error(`Search error for ${input}:`, err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Helper for global route search
const searchAviationStackByRoute = async (from, to) => {
  const key = process.env.AVIATIONSTACK_KEY;
  if (!key || key === 'your_aviationstack_key_here') return [];

  try {
    const params = { access_key: key, flight_status: 'active' };
    if (from) params.dep_iata = from.toUpperCase();
    if (to) params.arr_iata = to.toUpperCase();

    const res = await axios.get('http://api.aviationstack.com/v1/flights', { params, timeout: 5000 });
    
    if (res.data && res.data.data) {
      return res.data.data.map(f => ({
        icao24: f.aircraft?.icao24?.toLowerCase() || `fallback-${f.flight?.icao}`,
        callsign: f.flight?.icao,
        flightNumber: f.flight?.iata,
        airline: f.airline?.name,
        departure: {
          iata: f.departure?.iata,
          airport: f.departure?.airport,
          scheduled: f.departure?.scheduled
        },
        arrival: {
          iata: f.arrival?.iata,
          airport: f.arrival?.airport,
          scheduled: f.arrival?.scheduled
        },
        latitude: f.live?.latitude || 0,
        longitude: f.live?.longitude || 0,
        baroAltitude: f.live?.altitude || 0,
        velocity: f.live?.speed || 0,
        trueTrack: f.live?.direction || 0,
        status: f.flight_status,
        isGlobal: true
      })).filter(f => f.latitude !== 0);
    }
  } catch (err) {
    console.error("AviationStack Route Error:", err.message);
  }
  return [];
};

// Controller: GET /api/flights/route?from=DEL&to=BOM
const getFlightsByRoute = async (req, res) => {
  const { from, to } = req.query;
  try {
    // 1. Try local cache first
    const flights = await fetchAndCacheLiveFlights();
    let filtered = flights;
    if (from) filtered = filtered.filter(f => f.departure?.iata?.toUpperCase() === from.toUpperCase());
    if (to) filtered = filtered.filter(f => f.arrival?.iata?.toUpperCase() === to.toUpperCase());

    // 2. If nothing found in cache, try global AviationStack search
    if (filtered.length === 0 && (from || to)) {
        console.log(`No cache hit for ${from}->${to}, trying global search...`);
        filtered = await searchAviationStackByRoute(from, to);
    }

    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Controller: GET /api/flights/stats
const getStats = async (req, res) => {
  try {
    const flights = await fetchAndCacheLiveFlights();
    res.json({
      success: true,
      data: {
        total: flights.length,
        airborne: flights.filter(f => !f.onGround).length,
        onGround: flights.filter(f => f.onGround).length,
        countries: [...new Set(flights.map(f => f.originCountry))].length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Controller: GET /api/flights/track/:icao24
const getFlightTrack = async (req, res) => {
  const { icao24 } = req.params;

  try {
    const config = {
      timeout: 15000,
      params: { icao24: icao24.toLowerCase(), time: 0 },
      ...getOpenSkyAuth()
    };

    const response = await axios.get('https://opensky-network.org/api/tracks/all', config);
    
    if (!response.data || !response.data.path) {
      return res.status(404).json({ success: false, message: 'Track data not found' });
    }

    res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('Error fetching tracks:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getFlights, getFlightByCallsign, getFlightsByRoute, getStats, getFlightTrack, fetchAndCacheLiveFlights };
