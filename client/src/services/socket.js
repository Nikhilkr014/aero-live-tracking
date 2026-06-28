import { io } from 'socket.io-client';

// In production, React is served by the same Express server (same origin).
// In development, connect to localhost:5001 or use REACT_APP_SOCKET_URL override.
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL ||
  (process.env.NODE_ENV === 'production'
    ? window.location.origin
    : 'http://localhost:5001');

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
