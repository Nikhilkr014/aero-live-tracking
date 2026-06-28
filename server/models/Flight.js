const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  icao24: { type: String, required: true },
  callsign: { type: String, default: '' },
  originCountry: String,
  longitude: Number,
  latitude: Number,
  baroAltitude: Number,
  geoAltitude: Number,
  velocity: Number,
  trueTrack: Number,
  verticalRate: Number,
  onGround: { type: Boolean, default: false },
  squawk: String,
  positionSource: Number,
  // Enriched data
  flightNumber: String,
  airline: String,
  airlineIata: String,
  departure: {
    airport: String,
    iata: String,
    scheduled: String,
    actual: String
  },
  arrival: {
    airport: String,
    iata: String,
    scheduled: String,
    estimated: String
  },
  aircraft: {
    registration: String,
    icaoType: String,
    model: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'landed', 'cancelled', 'incident', 'diverted'],
    default: 'active'
  },
  live: {
    updated: Date,
    latitude: Number,
    longitude: Number,
    altitude: Number,
    direction: Number,
    speed: Number,
    isGround: Boolean
  },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

flightSchema.index({ icao24: 1 });
flightSchema.index({ callsign: 1 });
flightSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model('Flight', flightSchema);
