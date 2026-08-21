const Razorpay = require('razorpay');
const crypto = require('crypto');
const axios = require('axios');
const Transaction = require('../models/Transaction');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder',
});

const packages = {
  starter: { tokens: 5, price: 199 },
  pro: { tokens: 15, price: 499 },
  power: { tokens: 40, price: 999 },
};

// Utility to notify auth-service
const creditTokens = async (userId, tokensDelta) => {
  try {
    const authUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:5001';
    await axios.patch(`${authUrl}/internal/users/${userId}/tokens`, {
      delta: tokensDelta,
    });
  } catch (error) {
    console.error('Failed to credit tokens to user:', userId, error.message);
    throw new Error('Failed to update token balance');
  }
};

const createOrder = async (req, res, next) => {
  try {
    const { package: selectedPackage } = req.body;
    const userId = req.user.id;

    if (!packages[selectedPackage]) {
      return res.status(400).json({ success: false, message: 'Invalid package selected' });
    }

    const { tokens, price } = packages[selectedPackage];
    const amountInPaise = price * 100;

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${userId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    const transaction = new Transaction({
      userId,
      razorpayOrderId: order.id,
      package: selectedPackage,
      tokensGranted: tokens,
      amountPaid: price,
      status: 'created',
    });
    await transaction.save();

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user.id;

    const transaction = await Transaction.findOne({ razorpayOrderId: razorpay_order_id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.status === 'paid') {
      return res.status(200).json({ success: true, message: 'Already verified' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    transaction.status = 'paid';
    transaction.razorpayPaymentId = razorpay_payment_id;
    transaction.razorpaySignature = razorpay_signature;
    await transaction.save();

    await creditTokens(transaction.userId, transaction.tokensGranted);

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: { tokensGranted: transaction.tokensGranted },
    });
  } catch (error) {
    next(error);
  }
};

const webhook = async (req, res, next) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_placeholder';
    const signature = req.headers['x-razorpay-signature'];

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).send('Invalid signature');
    }

    const event = req.body.event;
    if (event === 'payment.captured') {
      const payment = req.body.payload.payment.entity;
      const orderId = payment.order_id;

      const transaction = await Transaction.findOne({ razorpayOrderId: orderId });
      if (transaction) {
        // Idempotency check: If it's already marked paid (perhaps the frontend verify hit first), we do NOT credit again.
        if (transaction.status !== 'paid') {
          transaction.status = 'paid';
          transaction.razorpayPaymentId = payment.id;
          await transaction.save();
          await creditTokens(transaction.userId, transaction.tokensGranted);
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  webhook,
  getHistory,
};
