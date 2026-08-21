const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const { initSocketIO } = require('./socket');
const sessionRoutes = require('./routes/sessionRoutes');
const reportRoutes = require('./routes/reportRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5002;

// Initialize WebSocket Socket.io server with Redis Pub/Sub integration
initSocketIO(httpServer);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'interview-service',
    socket: 'enabled',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes: Direct mounts & prefix mounts for Gateway proxying
app.use('/sessions', sessionRoutes);
app.use('/api/sessions', sessionRoutes);

app.use('/reports', reportRoutes);
app.use('/api/reports', reportRoutes);

// Centralized Error Handler
app.use(errorHandler);

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[Interview Service] Running with Socket.io on port ${PORT}`);
});

module.exports = { app, httpServer };
