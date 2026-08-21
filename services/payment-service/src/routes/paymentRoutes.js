const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  createOrder,
  verifyPayment,
  webhook,
  getHistory,
} = require('../controllers/paymentController');

router.post('/create-order', verifyToken, createOrder);
router.post('/verify', verifyToken, verifyPayment);
router.post('/webhook', webhook);
router.get('/history', verifyToken, getHistory);

module.exports = router;
