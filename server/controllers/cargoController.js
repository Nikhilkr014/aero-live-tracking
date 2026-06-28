const axios = require('axios');
const mongoose = require('mongoose');
const Cargo = require('../models/Cargo');

let mockCargo = [];

// Delhivery API Configuration
const DELHIVERY_API_URL = 'https://track.delhivery.com/api/v1/packages/json/';

// Seed demo cargo if none exists
const DEMO_CARGO = [
  {
    awb: 'AWB998877665',
    shipper: 'TechCorp India Pvt Ltd',
    consignee: 'Gadget World Delhi',
    origin: { airport: 'Kempegowda Intl', iata: 'BLR', city: 'Bengaluru', country: 'India' },
    destination: { airport: 'Indira Gandhi Intl', iata: 'DEL', city: 'New Delhi', country: 'India' },
    weight: 45.5,
    pieces: 3,
    description: 'Electronic components - Fragile',
    commodity: 'Electronics',
    linkedFlight: 'AI101',
    status: 'in_transit',
    provider: 'Delhivery',
    progress: 42,
    events: [
      { timestamp: new Date(Date.now() - 7200000), location: 'BLR', status: 'accepted', description: 'Shipment picked up by Delhivery', airport: 'BLR' },
      { timestamp: new Date(Date.now() - 5400000), location: 'BLR', status: 'loaded', description: 'Inbound to Delhivery Warehouse', airport: 'BLR' },
      { timestamp: new Date(Date.now() - 1800000), location: 'In Air', status: 'in_transit', description: 'Departure from BLR - Flight AI101', airport: 'NAG' }
    ],
    eta: new Date(Date.now() + 5400000)
  },
  {
    awb: 'AWB123456789',
    shipper: 'Mumbai Exports Ltd',
    consignee: 'Chennai Imports Co',
    origin: { airport: 'Chhatrapati Shivaji Intl', iata: 'BOM', city: 'Mumbai', country: 'India' },
    destination: { airport: 'Chennai Intl', iata: 'MAA', city: 'Chennai', country: 'India' },
    weight: 120.0,
    pieces: 10,
    description: 'Garments - General Cargo',
    commodity: 'Textiles',
    linkedFlight: '6E456',
    status: 'loaded',
    provider: 'Delhivery',
    progress: 15,
    events: [
      { timestamp: new Date(Date.now() - 3600000), location: 'BOM', status: 'accepted', description: 'Package received at Delhivery Hub', airport: 'BOM' },
      { timestamp: new Date(Date.now() - 1200000), location: 'BOM', status: 'loaded', description: 'Bagging completed - Sent to Airport', airport: 'BOM' }
    ],
    eta: new Date(Date.now() + 7200000)
  }
];

const seedDemoCargo = async () => {
  if (mongoose.connection.readyState !== 1) {
    if (mockCargo.length === 0) {
      mockCargo = JSON.parse(JSON.stringify(DEMO_CARGO));
      console.log('💾 Mock cargo seeded in-memory');
    }
    return;
  }
  const count = await Cargo.countDocuments();
  if (count === 0) {
    await Cargo.insertMany(DEMO_CARGO);
    console.log('📦 Demo cargo seeded');
  }
};

/**
 * Fetch real-time tracking from Delhivery API
 * @param {string} waybill 
 */
const fetchDelhiveryTracking = async (waybill) => {
  const token = process.env.DELHIVERY_TOKEN;
  if (!token || token === 'your_delhivery_token_here') return null;

  try {
    const response = await axios.get(`${DELHIVERY_API_URL}?waybill=${waybill}`, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.ShipmentData) {
      // Map Delhivery format to our schema
      const s = response.data.ShipmentData[0]?.Shipment;
      if (!s) return null;

      return {
        awb: s.Waybill,
        shipper: s.SenderName,
        consignee: s.ReceiverName,
        origin: { city: s.Origin, country: 'India' },
        destination: { city: s.Destination, country: 'India' },
        weight: parseFloat(s.Weight) || 0,
        description: s.Instructions || 'Package',
        status: s.Status.Status.toLowerCase().includes('delivered') ? 'delivered' : 
                s.Status.Status.toLowerCase().includes('transit') ? 'in_transit' : 'booked',
        provider: 'Delhivery',
        events: s.Scans.map(scan => ({
          timestamp: new Date(scan.ScanDateTime),
          location: scan.ScanLocation,
          status: scan.Scan,
          description: scan.Scan
        }))
      };
    }
    return null;
  } catch (err) {
    console.error('Delhivery API Error:', err.message);
    return null;
  }
};

// GET /api/cargo/:awb
const getCargoByAWB = async (req, res) => {
  const { awb } = req.params;
  const normalizedAwb = awb.toUpperCase().trim();
  try {
    await seedDemoCargo();
    
    // 1. Try real Delhivery API
    const realData = await fetchDelhiveryTracking(normalizedAwb);
    if (realData) return res.json({ success: true, data: realData, source: 'live' });

    // 2. Try Database / Mock
    if (mongoose.connection.readyState !== 1) {
      console.log('💾 Using Mock Cargo Lookup');
      const cargo = mockCargo.find(c => c.awb === normalizedAwb);
      if (!cargo) {
        // Fallback to mock with Delhivery branding
        return res.status(200).json({
          success: true,
          data: {
            awb: normalizedAwb,
            shipper: 'Delhivery Merchant',
            consignee: 'Customer',
            origin: { airport: 'Kempegowda Intl', iata: 'BLR', city: 'Bengaluru', country: 'India' },
            destination: { airport: 'Indira Gandhi Intl', iata: 'DEL', city: 'New Delhi', country: 'India' },
            weight: 2.5,
            pieces: 1,
            description: 'E-commerce Parcel',
            provider: 'Delhivery',
            status: 'in_transit',
            progress: Math.floor(Math.random() * 60) + 20,
            events: [
              { timestamp: new Date(Date.now() - 5400000), location: 'BLR', status: 'accepted', description: 'Picked up by Delhivery agent', airport: 'BLR' },
              { timestamp: new Date(Date.now() - 3600000), location: 'BLR_HUB', status: 'loaded', description: 'Processed at Hub', airport: 'BLR' },
              { timestamp: new Date(Date.now() - 900000), location: 'In Transit', status: 'in_transit', description: 'Forwarded to destination', airport: 'NA' }
            ],
            eta: new Date(Date.now() + 7200000)
          },
          source: 'mock'
        });
      }
      return res.json({ success: true, data: cargo, source: 'mock_db' });
    }

    let cargo = await Cargo.findOne({ awb: normalizedAwb });

    if (!cargo) {
      // 3. Fallback to mock with Delhivery branding
      return res.status(200).json({
        success: true,
        data: {
          awb: normalizedAwb,
          shipper: 'Delhivery Merchant',
          consignee: 'Customer',
          origin: { airport: 'Kempegowda Intl', iata: 'BLR', city: 'Bengaluru', country: 'India' },
          destination: { airport: 'Indira Gandhi Intl', iata: 'DEL', city: 'New Delhi', country: 'India' },
          weight: 2.5,
          pieces: 1,
          description: 'E-commerce Parcel',
          provider: 'Delhivery',
          status: 'in_transit',
          progress: Math.floor(Math.random() * 60) + 20,
          events: [
            { timestamp: new Date(Date.now() - 5400000), location: 'BLR', status: 'accepted', description: 'Picked up by Delhivery agent', airport: 'BLR' },
            { timestamp: new Date(Date.now() - 3600000), location: 'BLR_HUB', status: 'loaded', description: 'Processed at Hub', airport: 'BLR' },
            { timestamp: new Date(Date.now() - 900000), location: 'In Transit', status: 'in_transit', description: 'Forwarded to destination', airport: 'NA' }
          ],
          eta: new Date(Date.now() + 7200000)
        },
        source: 'mock'
      });
    }

    res.json({ success: true, data: cargo, source: 'db' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/cargo
const getAllCargo = async (req, res) => {
  try {
    await seedDemoCargo();
    
    if (mongoose.connection.readyState !== 1) {
      console.log('💾 Using Mock Cargo List');
      return res.json({ success: true, count: mockCargo.length, data: mockCargo });
    }

    const cargo = await Cargo.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: cargo.length, data: cargo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/cargo
const createCargo = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('💾 Using Mock Cargo Create');
      const newCargo = {
        ...req.body,
        awb: req.body.awb.toUpperCase(),
        createdAt: new Date(),
        updatedAt: new Date(),
        progress: req.body.progress || 0,
        events: req.body.events || []
      };
      mockCargo.push(newCargo);
      return res.status(201).json({ success: true, data: newCargo });
    }

    const cargo = await Cargo.create(req.body);
    res.status(201).json({ success: true, data: cargo });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PATCH /api/cargo/:awb/status
const updateCargoStatus = async (req, res) => {
  const { awb } = req.params;
  const { status, location, description, airport } = req.body;
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('💾 Using Mock Cargo Status Update');
      const idx = mockCargo.findIndex(c => c.awb === awb.toUpperCase());
      if (idx === -1) return res.status(404).json({ success: false, message: 'AWB not found' });
      
      mockCargo[idx] = {
        ...mockCargo[idx],
        status,
        progress: status === 'delivered' ? 100 : mockCargo[idx].progress,
        events: [
          ...mockCargo[idx].events,
          { timestamp: new Date(), location, status, description, airport }
        ]
      };
      return res.json({ success: true, data: mockCargo[idx] });
    }

    const cargo = await Cargo.findOneAndUpdate(
      { awb: awb.toUpperCase() },
      {
        status,
        $push: {
          events: { timestamp: new Date(), location, status, description, airport }
        }
      },
      { new: true }
    );
    if (!cargo) return res.status(404).json({ success: false, message: 'AWB not found' });
    res.json({ success: true, data: cargo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCargoByAWB, getAllCargo, createCargo, updateCargoStatus };
