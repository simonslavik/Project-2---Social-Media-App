require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const mediaRoutes = require("./routes/media-routes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const { handlePostDeleted } = require("./eventHandlers/media-event-handlers");

const app = express();
const PORT = process.env.PORT || 3003;

//connect to mongodb
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected to mongodb"))
  .catch((e) => logger.error("Mongo connection error", e));

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});

//*** Homework - implement Ip based rate limiting for sensitive endpoints

app.use("/api/media", mediaRoutes);

app.use(errorHandler);

async function startServer() {
  try {
    // Start server first
    app.listen(PORT, () => {
      logger.info(`Media service running on port ${PORT}`);
    });
    
    // Connect to RabbitMQ in background (non-blocking)
    setTimeout(async () => {
      try {
        await connectToRabbitMQ();
        logger.info("RabbitMQ connection established");
        
        // Set up event consumers after connection is established
        await consumeEvent("post.deleted", handlePostDeleted);
        logger.info("Event consumers registered");
      } catch (error) {
        logger.error("RabbitMQ connection failed, but server will continue:", error.message);
      }
    }, 2000); // Wait 2 seconds for RabbitMQ to be ready
    
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