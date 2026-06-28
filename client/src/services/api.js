import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Attach JWT
API.interceptors.request.use(config => {
  const token = localStorage.getItem('aeroToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const flightAPI = {
  getAll: () => API.get('/flights'),
  getByCallsign: (cs) => API.get(`/flights/${cs}`),
  getByRoute: (from, to) => API.get(`/flights/route?from=${from}&to=${to}`),
  getStats: () => API.get('/flights/stats'),
  getTrack: (icao24) => API.get(`/flights/track/${icao24}`)
};

export const cargoAPI = {
  getByAWB: (awb) => API.get(`/cargo/${awb}`),
  getAll: () => API.get('/cargo')
};

export const airportAPI = {
  getAll: () => API.get('/airports'),
  getByCode: (code) => API.get(`/airports/${code}`)
};

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  googleLogin: (tokenId) => API.post('/auth/google-login', { tokenId }),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  saveFlight: (flightId) => API.post('/auth/save-flight', { flightId })
};

export default API;
