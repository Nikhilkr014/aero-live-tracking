const express = require('express');
const router = express.Router();
const { getFlights, getFlightByCallsign, getFlightsByRoute, getStats, getFlightTrack } = require('../controllers/flightController');

router.get('/', getFlights);
router.get('/stats', getStats);
router.get('/route', getFlightsByRoute);
router.get('/track/:icao24', getFlightTrack);
router.get('/:callsign', getFlightByCallsign);

module.exports = router;
