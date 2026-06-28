const express = require('express');
const router = express.Router();
const { register, login, googleLogin, getMe, updateProfile, saveFlight } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/save-flight', protect, saveFlight);

module.exports = router;
