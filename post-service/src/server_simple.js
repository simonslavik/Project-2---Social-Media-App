require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT || 3002;

// Simple logger
const logger = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} ${msg}`),
  error: (msg) => console.log(`[ERROR] ${new Date().toISOString()} ${msg}`),
  warn: (msg) => console.log(`[WARN] ${new Date().toISOString()} ${msg}`)
};

// Connect to MongoDB
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => logger.info("Connected to MongoDB"))
    .catch((e) => logger.error("MongoDB connection error: " + e.message));
}

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
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