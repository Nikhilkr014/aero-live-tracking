const User = require('../models/User');

// Mock function for sending SMS via Twilio
const sendSMS = async (to, message) => {
  console.log(`[MOCK SMS] Sending to ${to}: ${message}`);
  // In a real app:
  // const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({ body: message, from: process.env.TWILIO_PHONE, to });
  return true;
};

// Mock function for sending Email
const sendEmail = async (to, subject, text) => {
  console.log(`[MOCK EMAIL] Sending to ${to}: ${subject}`);
  // In a real app:
  // const nodemailer = require('nodemailer');
  // const transporter = nodemailer.createTransport({ ... });
  // await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
  return true;
};

const triggerAlert = async (req, res) => {
  const { type, flightId, message } = req.body;
  const user = req.user;

  try {
    const notifications = [];
    
    if (user.alertPrefs.email) {
      notifications.push(sendEmail(user.email, `AeroLive Alert: ${type}`, message));
    }
    
    if (user.alertPrefs.sms && user.phone) {
      notifications.push(sendSMS(user.phone, `AeroLive: ${message}`));
    }

    await Promise.all(notifications);

    // Save alert to user history
    user.alerts.push({ type, target: flightId, message });
    await user.save();

    res.json({ success: true, message: 'Alerts sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { triggerAlert };
