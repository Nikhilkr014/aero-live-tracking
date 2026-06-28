const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: function() { return !this.isGoogleUser; } },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  isGoogleUser: { type: Boolean, default: false },
  alertPrefs: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  savedFlights: [{ type: String }],
  trackedCargo: [{ type: String }],
  alerts: [{
    type: { type: String, enum: ['delay', 'departure', 'arrival', 'cargo'] },
    target: String,
    message: String,
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
