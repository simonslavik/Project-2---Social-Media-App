require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Redis = require("ioredis");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const { RedisStore } = require("rate-limit-redis");
const logger = require("./utils/logger");
const errorHandler = require("./middleware/errorHandler");
const { connectToRabbitMQ } = require("./utils/rabbitmg");
const postRoutes = require("./routes/post-routes");

const app = express();
const PORT = process.env.PORT || 3002;

// Connect to Redis
const redisClient = new Redis(process.env.REDIS_URL);
redisClient.on('connect', () => logger.info('Connected to Redis'));
redisClient.on('error', (err) => logger.error('Redis connection error:', err));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected to MongoDB"))
  .catch((e) => logger.error("MongoDB connection error", e));

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// DDoS protection and rate limiting
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10,
  duration: 1,
});

app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ success: false, message: "Too many requests" });
    });
});

// IP based rate limiting for sensitive endpoints
const sensitiveEndpointsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

// Health endpoint
app.get("/api/posts/health", (req, res) => {
  res.json({
    status: "ok",
    service: "post-service",
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: {
      mongodb: !!process.env.MONGODB_URI,
      redis: !!process.env.REDIS_URL,
      rabbitmq: !!process.env.RABBITMQ_URL
    }
  });
});

// Basic posts endpoints
app.get("/api/posts", (req, res) => {
  res.json({
    message: "Post service is running",
    posts: [],
    service: "post-service"
  });
});

app.post("/api/posts", (req, res) => {
  res.json({
    message: "Post creation endpoint - not fully implemented yet",
    received: req.body,
    service: "post-service"
  });
});

// Catch-all route
app.use("*", (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: "Route not found",
    service: "post-service",
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Post Service running on port ${PORT}`);
  logger.info(`MongoDB: ${process.env.MONGODB_URI ? "configured" : "missing"}`);
  logger.info(`Redis: ${process.env.REDIS_URL ? "configured" : "missing"}`);
});

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});

//routes -> pass redisclient to routes
app.use(
  "/api/posts",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  postRoutes
);


app.use(errorHandler);


async function startServer() {
  try {
    // Start server first, then try RabbitMQ connection (non-blocking)
    app.listen(PORT, () => {
      logger.info(`Post service running on port ${PORT}`);
    });
    
    // Connect to RabbitMQ in background
    connectToRabbitMQ().catch((error) => {
      logger.error("RabbitMQ connection failed, but server will continue:", error);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();


//unhandled promise rejection

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});