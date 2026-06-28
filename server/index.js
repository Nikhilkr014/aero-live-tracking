const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

// Definitive Silence: Disable auto-indexing at the VERY top before any models are loaded
mongoose.set('autoIndex', false);

const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const flightRoutes = require('./routes/flights');
const cargoRoutes = require('./routes/cargo');
const authRoutes = require('./routes/auth');
const airportRoutes = require('./routes/airports');
const alertRoutes = require('./routes/alerts');
const { fetchAndCacheLiveFlights } = require('./controllers/flightController');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.set('trust proxy', 1); // Trust first proxy for rate limiting
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200
});
app.use('/api/', limiter);

// MongoDB Connection
const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  const isProduction = process.env.NODE_ENV === 'production';


  // If in production and no URI is provided, skip connection attempt to avoid ECONNREFUSED
  if (!uri && isProduction) {
    console.log('🌐 Production: no MONGO_URI provided. Switching to High-Performance Mock Mode.');
    mongoose.set('bufferCommands', false);
    return;
  }

  try {
    const conn = await mongoose.connect(uri || 'mongodb://127.0.0.1:27017/aerolive', {
      serverSelectionTimeoutMS: 5000, 
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    if (isProduction) {
      console.log(`⚠️ Production connection failed: ${err.message}. Using Mock Mode.`);
    } else {
      console.log(`❌ MongoDB connection failed: ${err.message}`);
      console.log('⚠️ Running in Mock Database mode (In-memory)');
    }
    mongoose.set('bufferCommands', false); 
  }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/cargo', cargoRoutes);
app.use('/api/airports', airportRoutes);
app.use('/api/alerts', alertRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Self-Healing Static Serving: Auto-detect React build folder
const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
if (fs.existsSync(clientBuildPath)) {
  console.log('📦 React build found. Serving static files...');
  app.use(express.static(clientBuildPath));
  
  // Wildcard: serve React app for all non-API routes (React Router support)
  app.get('*', (req, res) => {
    const indexPath = path.join(clientBuildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Build folder found, but index.html is missing. Check your build scripts.');
    }
  });
} else {
  console.log('⚠️ No React build found at:', clientBuildPath);
  app.get('/', (req, res) => {
    res.send('AeroLive API is running. (No frontend build detected - run npm run build)');
  });
}

// Vercel Cron endpoint: fetch live flights and update cache
app.get('/api/cron/fetch-flights', async (req, res) => {
  // Authentication for cron (optional but recommended)
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const flights = await fetchAndCacheLiveFlights();
    if (flights && flights.length > 0) {
      cachedFlights = flights;
      // Note: io.emit might not work reliably here in serverless, 
      // but it updates the cache for the next GET request.
      if (io) io.emit('flights:update', flights);
    }
    res.json({ success: true, count: flights?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Socket.IO for live flight updates
let cachedFlights = [];

io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  // Send current cached data immediately
  socket.emit('flights:update', cachedFlights);

  // Join a specific flight room for detailed updates
  socket.on('flight:subscribe', (flightId) => {
    socket.join(`flight:${flightId}`);
    console.log(`📡 Subscribed to flight: ${flightId}`);
  });

  socket.on('flight:unsubscribe', (flightId) => {
    socket.leave(`flight:${flightId}`);
  });

  socket.on('disconnect', () => {
    console.log(`👋 Client disconnected: ${socket.id}`);
  });
});

// Cron: fetch live flights every 10 minutes and broadcast (to save AviationStack credits)
cron.schedule('*/10 * * * *', async () => {
  try {
    const flights = await fetchAndCacheLiveFlights();
    if (flights && flights.length > 0) {
      cachedFlights = flights;
      io.emit('flights:update', flights);
    }
  } catch (err) {
    // Silent fail - use cached data
  }
});

// Cron: broadcast flight stats every 30 seconds
cron.schedule('*/30 * * * * *', () => {
  const stats = {
    total: cachedFlights.length,
    airborne: cachedFlights.filter(f => f.onGround === false).length,
    onGround: cachedFlights.filter(f => f.onGround === true).length,
    countries: [...new Set(cachedFlights.map(f => f.originCountry).filter(Boolean))].length,
    timestamp: new Date().toISOString()
  };
  io.emit('stats:update', stats);
});

const PORT = process.env.PORT || 5000;

// Only start the server if not running on Vercel
if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`🚀 AeroLive server running on port ${PORT}`);
    console.log(`📡 Socket.IO ready`);
    // Initial data fetch
    fetchAndCacheLiveFlights().then(flights => {
      cachedFlights = flights || [];
      console.log(`✈️  Initial flights loaded: ${cachedFlights.length}`);
    });
  });
}

module.exports = app;
