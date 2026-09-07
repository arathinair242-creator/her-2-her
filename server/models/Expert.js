const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const expertSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  specialization: { type: String, required: true }, // Gynecologist, Nutritionist, Fitness Trainer
  experience: { type: String },
  qualification: { type: String },
  aboutMe: { type: String },
  profilePicture: { type: String },
  degreeCertificate: { type: String },
  governmentId: { type: String },
  medicalRegistration: { type: String },
  phone: { type: String },
  consultationFee: { type: Number },
  consultationTypes: {
    video: { type: Boolean, default: false },
    chat: { type: Boolean, default: false },
    audio: { type: Boolean, default: false },
    inPerson: { type: Boolean, default: false }
  },
  charges: {
    video: Number,
    chat: Number,
    audio: Number,
    inPerson: Number
  },
  availability: {
    days: [String],
    startTime: String,
    endTime: String
  },
  bankingDetails: {
    accountName: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    upiId: String
  },
  status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending', index: true },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
expertSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
expertSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Expert', expertSchema);
