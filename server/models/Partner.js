const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const partnerSchema = new mongoose.Schema({
  organizationName: { type: String, required: true },
  organizationType: { 
    type: String, 
    required: true, 
    enum: ['NGO', 'Hospital', 'Clinic', 'Wellness Center', 'Corporate'] 
  },
  registrationNumber: { type: String, required: true },
  contactPerson: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  website: { type: String },
  logo: { type: String },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Verified', 'Rejected'], 
    default: 'Pending',
    index: true 
  },
  referrals: [{
    userName: String,
    goal: String,
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'Interested' }
  }],
  events: [{
    title: String,
    date: Date,
    description: String,
    location: String
  }],
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
partnerSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
partnerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Partner', partnerSchema);
