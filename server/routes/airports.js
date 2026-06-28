const express = require('express');
const router = express.Router();
const { getAirports, getAirportByCode } = require('../controllers/airportController');

router.get('/', getAirports);
router.get('/:code', getAirportByCode);

module.exports = router;
