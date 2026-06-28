const mongoose = require('mongoose');

// The field 'awb' (Air Waybill) is the primary identifier for cargo tracking.
// We explicitly disable the path-level index to avoid Mongoose 8.x's duplicate schema index warnings
// which can occur when mixing path definitions with manual index declarations.
const cargoSchema = new mongoose.Schema({
  awb: { 
    type: String, 
    required: true, 
    uppercase: true, 
    trim: true,
    index: false // Suppress automatic index creation for this path
  },
  shipper: { type: String, default: 'Unknown' },
  consignee: { type: String, default: 'Unknown' },
  origin: {
    airport: String,
    iata: String,
    city: String,
    country: String
  },
  destination: {
    airport: String,
    iata: String,
    city: String,
    country: String
  },
  weight: { type: Number, default: 0 },
  pieces: { type: Number, default: 1 },
  description: String,
  commodity: String,
  linkedFlight: { type: String, default: null },
  status: {
    type: String,
    enum: ['booked', 'accepted', 'loaded', 'in_transit', 'arrived', 'delivered', 'held'],
    default: 'booked'
  },
  progress: { type: Number, default: 0 },
  events: [{
    timestamp: { type: Date, default: Date.now },
    location: String,
    status: String,
    description: String,
    airport: String
  }],
  eta: Date,
  actualDelivery: Date
}, { 
  timestamps: true,
  autoIndex: false // Globally disable automatic indexing for this specific model
});

// Explicitly define the unique index at the schema level.
// This is the single, authoritative definition for the 'awb' index.
cargoSchema.index({ awb: 1 }, { unique: true });

module.exports = mongoose.model('Cargo', cargoSchema);
