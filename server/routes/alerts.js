const express = require('express');
const router = express.Router();
const { triggerAlert } = require('../controllers/alertController');
const { protect } = require('../middleware/auth');

router.post('/trigger', protect, triggerAlert);

module.exports = router;
