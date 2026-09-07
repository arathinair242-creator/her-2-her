const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemType: { type: String, enum: ['Consultation', 'Workshop'], required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId },
  expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert' },
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['Pending', 'Captured', 'Failed', 'Refunded'], default: 'Pending' },
  paymentGateway: { type: String, default: 'Razorpay' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  transactionId: { type: String },
  receipt: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
