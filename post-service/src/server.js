require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');

const app = express();
const PORT = process.env.PORT || 3002;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'post-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Debug middleware - log all requests
app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request path: ${req.path}`);
  next();
});

// Health check endpoint (matches API Gateway routing)
app.get('/api/posts/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'post-service',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Basic API endpoints
app.get('/api/posts', (req, res) => {
  logger.info('GET /api/posts endpoint hit');
  res.json({ 
    message: 'Post service is running but not fully implemented yet',
    posts: []
  });
});

app.post('/api/posts', (req, res) => {
  logger.info('POST /api/posts endpoint hit');
  res.json({ 
    message: 'Post creation endpoint - not implemented yet',
    received: req.body
  });
});

// Catch-all route
app.use('*', (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: 'Route not found',
    service: 'post-service'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ 
    message: 'Internal server error',
    service: 'post-service'
  });
});

app.listen(PORT, () => {
  logger.info(`Post Service is running on port ${PORT}`);
  logger.info(`MongoDB URI: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
  logger.info(`Redis URL: ${process.env.REDIS_URL ? 'Connected' : 'Not configured'}`);
});