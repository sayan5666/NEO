const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:5001';
const INTERVIEW_SERVICE_URL = process.env.INTERVIEW_SERVICE_URL || 'http://interview-service:5002';
const AI_AGENT_SERVICE_URL = process.env.AI_AGENT_SERVICE_URL || 'http://ai-agent-service:8000';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:5003';

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim())
  : '*';

app.use(
  cors({
    origin: allowedOrigins === '*' ? '*' : allowedOrigins,
    credentials: true,
  })
);

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'gateway',
    timestamp: new Date().toISOString(),
    services: {
      auth: AUTH_SERVICE_URL,
      interview: INTERVIEW_SERVICE_URL,
      aiAgent: AI_AGENT_SERVICE_URL,
    },
  });
});

// Proxy Route: /socket.io -> interview-service:5002/socket.io (WebSocket support)
app.use(
  '/socket.io',
  createProxyMiddleware({
    target: INTERVIEW_SERVICE_URL,
    ws: true,
    changeOrigin: true,
  })
);

// Proxy Route: /api/interview/ask -> ai-agent-service:8000/interview/ask
app.use(
  '/api/interview/ask',
  createProxyMiddleware({
    target: AI_AGENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/interview/ask': '/interview/ask',
    },
    onError: (err, req, res) => {
      console.error('[Gateway Proxy Error - AI Agent]', err.message);
      res.status(502).json({
        success: false,
        message: 'AI Agent service is temporarily unreachable',
        error: err.message,
      });
    },
  })
);

// Proxy Route: /api/auth/* -> auth-service:5001/*
app.use(
  '/api/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/auth': '',
    },
    onError: (err, req, res) => {
      console.error('[Gateway Proxy Error - Auth]', err.message);
      res.status(502).json({
        success: false,
        message: 'Auth service is temporarily unreachable',
        error: err.message,
      });
    },
  })
);

// Proxy Route: /api/resume/* and /resume/* -> auth-service:5001/resume/*
app.use(
  ['/api/resume', '/resume'],
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/resume': '/resume',
    },
    onError: (err, req, res) => {
      console.error('[Gateway Proxy Error - Resume]', err.message);
      res.status(502).json({
        success: false,
        message: 'Resume upload service is temporarily unreachable',
        error: err.message,
      });
    },
  })
);

// Proxy Route: /api/sessions/* -> interview-service:5002/sessions/*
app.use(
  '/api/sessions',
  createProxyMiddleware({
    target: INTERVIEW_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/sessions': '/sessions',
    },
    onError: (err, req, res) => {
      console.error('[Gateway Proxy Error - Sessions]', err.message);
      res.status(502).json({
        success: false,
        message: 'Interview service is temporarily unreachable',
        error: err.message,
      });
    },
  })
);

// Proxy Route: /api/reports/* -> interview-service:5002/reports/*
app.use(
  '/api/reports',
  createProxyMiddleware({
    target: INTERVIEW_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/reports': '/reports',
    },
    onError: (err, req, res) => {
      console.error('[Gateway Proxy Error - Reports]', err.message);
      res.status(502).json({
        success: false,
        message: 'Interview service is temporarily unreachable',
        error: err.message,
      });
    },
  })
);

// Proxy Route: /api/code/* and /code/* -> ai-agent-service:8000/code/*
app.use(
  ['/api/code', '/code'],
  createProxyMiddleware({
    target: AI_AGENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/code': '/code',
    },
    onError: (err, req, res) => {
      console.error('[Gateway Proxy Error - Code Execution]', err.message);
      res.status(502).json({
        success: false,
        message: 'Code execution service is temporarily unreachable',
        error: err.message,
      });
    },
  })
);

// Proxy Route: /api/payment/* -> payment-service:5003/payment/*
app.use(
  '/api/payment',
  createProxyMiddleware({
    target: PAYMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/payment': '/payment',
    },
    onError: (err, req, res) => {
      console.error('[Gateway Proxy Error - Payment]', err.message);
      res.status(502).json({
        success: false,
        message: 'Payment service is temporarily unreachable',
        error: err.message,
      });
    },
  })
);

app.use(express.json());

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Gateway] Express API Gateway listening on port ${PORT}`);
});

module.exports = app;
