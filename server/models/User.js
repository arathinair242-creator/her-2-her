const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isGoogleAccount: { type: Boolean, default: false },
  googleId: { type: String },
  age: { type: Number },
  gender: { type: String, default: 'Female' },
  profilePicture: { type: String },
  phone: { type: String },
  bio: { type: String },
  settings: {
    notifications: { type: Boolean, default: true },
    privacy: { type: String, default: 'public' }, // 'public' or 'private'
    accountType: { type: String, default: 'Standard' }
  },
  healthData: {
    bmi: Number,
    weight: Number,
    height: Number,
    goals: [String],
    conditions: [String]
  },
  membershipStatus: { type: String, enum: ['Free', 'Trial', 'Premium'], default: 'Free' },
  trialStartDate: { type: Date },
  trialEndDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
