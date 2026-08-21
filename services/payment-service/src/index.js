require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'payment-service' });
});

app.use('/payment', paymentRoutes);

app.use((err, req, res, next) => {
  console.error('[PaymentService Error]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5003;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_interview_payment';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB (payment-service)');
    app.listen(PORT, () => {
      console.log(`Payment service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
