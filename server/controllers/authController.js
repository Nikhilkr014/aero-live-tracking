const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Simple In-memory store for Mock Mode
const mockUsers = [];

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'aerolive_secret', { expiresIn: '7d' });
};

const register = async (req, res) => {
  const { name, email, password } = req.body;
  
  // Check if DB is connected
  if (mongoose.connection.readyState !== 1) {
    console.log('💾 Using Mock Registration');
    const existing = mockUsers.find(u => u.email === email);
    if (existing) return res.status(400).json({ success: false, message: 'Email already in use (Mock)' });
    
    const newUser = { _id: Date.now().toString(), name, email, alerts: [], savedFlights: [], alertPrefs: { email: true, sms: false } };
    mockUsers.push(newUser);
    return res.status(201).json({ success: true, token: 'mock_token', user: newUser });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already in use' });

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, alerts: user.alerts }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (mongoose.connection.readyState !== 1) {
    console.log('💾 Using Mock Login');
    const user = mockUsers.find(u => u.email === email);
    if (!user) return res.status(401).json({ success: false, message: 'User not found in Mock Mode' });
    return res.json({ success: true, token: 'mock_token', user });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || user.isGoogleUser || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = signToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, alertPrefs: user.alertPrefs, savedFlights: user.savedFlights, alerts: user.alerts }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const googleLogin = async (req, res) => {
  const { tokenId } = req.body;

  if (mongoose.connection.readyState !== 1) {
    console.log('💾 Using Mock Google Login');
    // In mock mode, we'll just simulate a successful Google verification
    const mockUser = { 
      _id: 'google_' + Date.now(), 
      name: 'Google User', 
      email: 'mock_google@gmail.com', 
      avatar: 'https://i.pravatar.cc/150?u=mock_google',
      isGoogleUser: true,
      alertPrefs: { email: true, sms: false },
      alerts: []
    };
    if (!mockUsers.find(u => u.email === mockUser.email)) mockUsers.push(mockUser);
    return res.json({ success: true, token: 'mock_google_token', user: mockUser });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const { name, email, picture } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, avatar: picture, isGoogleUser: true });
    }

    const token = signToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, phone: user.phone, alertPrefs: user.alertPrefs, alerts: user.alerts }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Google authentication failed' });
  }
};

const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

const updateProfile = async (req, res) => {
  const { phone, alertPrefs } = req.body;

  if (mongoose.connection.readyState !== 1) {
    console.log('💾 Using Mock Profile Update');
    const user = mockUsers.find(u => u._id === req.user?._id || u.email === req.user?.email);
    if (user) {
      if (phone) user.phone = phone;
      if (alertPrefs) user.alertPrefs = alertPrefs;
      return res.json({ success: true, user: { phone: user.phone, alertPrefs: user.alertPrefs } });
    }
    // If user not found in mock store (e.g. session from before server restart), create it
    const newUser = { ...req.user, phone, alertPrefs };
    mockUsers.push(newUser);
    return res.json({ success: true, user: { phone: newUser.phone, alertPrefs: newUser.alertPrefs } });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { phone, alertPrefs },
      { new: true }
    );
    res.json({ success: true, user: { phone: user.phone, alertPrefs: user.alertPrefs } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const saveFlight = async (req, res) => {
  const { flightId } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { savedFlights: flightId } },
      { new: true }
    );
    res.json({ success: true, savedFlights: user.savedFlights });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, googleLogin, getMe, updateProfile, saveFlight };
