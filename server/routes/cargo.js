const express = require('express');
const router = express.Router();
const { getCargoByAWB, getAllCargo, createCargo, updateCargoStatus } = require('../controllers/cargoController');
const { protect } = require('../middleware/auth');

router.get('/', getAllCargo);
router.get('/:awb', getCargoByAWB);
router.post('/', protect, createCargo);
router.patch('/:awb/status', protect, updateCargoStatus);

module.exports = router;
