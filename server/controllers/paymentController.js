const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Consultation = require('../models/Consultation');

// Log env var presence on startup
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
console.log('[PAYMENT CONTROLLER] Razorpay Key ID loaded:', keyId ? `${keyId.slice(0, 10)}...` : '❌ MISSING');
console.log('[PAYMENT CONTROLLER] Razorpay Key Secret loaded:', keySecret ? '✅ present' : '❌ MISSING');

if (!keyId || !keySecret) {
  console.error('[PAYMENT CONTROLLER] ❌ CRITICAL: Razorpay credentials missing from .env! Payment will fail.');
}

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

// @desc    Create a Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
exports.createOrder = async (req, res) => {
  const { itemType, itemId, amount, expertId, partnerId } = req.body;
  console.log('[CREATE ORDER] Request received:', { itemType, itemId, amount, expertId, userId: req.user?.id });

  try {
    // Create Razorpay order
    const amountInPaise = Math.round(amount * 100);
    console.log(`[CREATE ORDER] Creating Razorpay order for ₹${amount} (${amountInPaise} paise)...`);
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });
    console.log('[CREATE ORDER] Razorpay order created:', razorpayOrder.id);

    // Save order to DB
    console.log('[CREATE ORDER] Saving order to MongoDB...');
    const order = new Order({
      user: req.user.id,
      itemType: itemType || 'Consultation',
      itemId,
      expertId,
      partnerId,
      amount,
      receipt: razorpayOrder.receipt,
      razorpayOrderId: razorpayOrder.id,
    });

    await order.save();
    console.log('[CREATE ORDER] Order saved to DB. Order ID:', order._id);

    res.status(201).json({
      success: true,
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    const fs = require('fs');
    fs.appendFileSync('server.log', `\n[ERROR] Create Razorpay Order Failed: ${error.message} - ${error.stack}\n`);
    console.error('[CREATE ORDER] ❌ Error:', error.message);
    res.status(500).json({ message: 'Server error while creating order: ' + error.message });
  }
};

// @desc    Verify Razorpay payment signature and finalize booking
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, consultationId } = req.body;
  console.log('[VERIFY PAYMENT] Received verification request:', { razorpay_order_id, razorpay_payment_id, orderId, consultationId });

  try {
    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;
    console.log('[VERIFY PAYMENT] Signature authentic:', isAuthentic);

    if (isAuthentic) {
      // Update order
      console.log('[VERIFY PAYMENT] Updating order status to Captured...');
      const order = await Order.findById(orderId);
      if (order) {
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        order.transactionId = razorpay_payment_id;
        order.status = 'Captured';
        await order.save();
        console.log('[VERIFY PAYMENT] Order updated. Status: Captured');
      } else {
        console.warn('[VERIFY PAYMENT] ⚠️ Order not found in DB for ID:', orderId);
      }

      // Mark consultation as Confirmed
      if (consultationId) {
        console.log('[VERIFY PAYMENT] Updating consultation status to Confirmed...');
        await Consultation.findByIdAndUpdate(consultationId, { status: 'Confirmed' });
        console.log('[VERIFY PAYMENT] Consultation confirmed ✅');
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id,
      });
    } else {
      console.error('[VERIFY PAYMENT] ❌ Signature verification FAILED.');
      // Update order as failed
      const order = await Order.findById(orderId);
      if (order) {
        order.status = 'Failed';
        await order.save();
      }

      res.status(400).json({
        success: false,
        message: 'Payment verification failed: signature mismatch',
      });
    }
  } catch (error) {
    console.error('[VERIFY PAYMENT] ❌ Error:', error.message);
    res.status(500).json({ message: 'Server error while verifying payment: ' + error.message });
  }
};


// @desc    Save payment details (optional detailed save)
// @route   POST /api/payments/save
// @access  Private
exports.savePayment = async (req, res) => {
  const { orderId, razorpayPaymentId, razorpayOrderId, amount, status } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.razorpayPaymentId = razorpayPaymentId || order.razorpayPaymentId;
    order.razorpayOrderId = razorpayOrderId || order.razorpayOrderId;
    order.status = status || order.status;
    await order.save();

    res.json({ success: true, message: 'Payment details saved', order });
  } catch (error) {
    console.error('Save Payment Error:', error);
    res.status(500).json({ message: 'Server error while saving payment' });
  }
};
