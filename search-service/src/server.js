require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Redis = require("ioredis");
const cors = require("cors");
const helmet = require("helmet");
const errorHandler = require("./middleware/errorController");
const logger = require("./utils/logger");
const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const searchRoutes = require("./routes/search-routes");
const {
  handlePostCreated,
  handlePostDeleted,
} = require("./eventHandlers/search-event-handlers");

const app = express();
const PORT = process.env.PORT || 3004;

//connect to mongodb
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected to mongodb"))
  .catch((e) => logger.error("Mongo connection error", e));

const redisClient = new Redis(process.env.REDIS_URL);

//middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});

//*** Homework - implement Ip based rate limiting for sensitive endpoints

//*** Homework - pass redis client as part of your req and then implement redis caching
app.use("/api/search", searchRoutes);

app.use(errorHandler);

async function startServer() {
  try {
    // Start the HTTP server first
    app.listen(PORT, () => {
      logger.info(`Search service is running on port: ${PORT}`);
    });

    // Connect to RabbitMQ in the background (non-blocking)
    setTimeout(async () => {
      try {
        logger.info("Attempting to connect to RabbitMQ...");
        await connectToRabbitMQ();
        logger.info("Connected to RabbitMQ successfully");

        // Consume events after successful connection
        await consumeEvent("post.created", handlePostCreated);
        await consumeEvent("post.deleted", handlePostDeleted);
        
        logger.info("Event consumers registered successfully");
      } catch (rabbitmqError) {
        logger.error("RabbitMQ connection failed:", rabbitmqError);
        logger.info("Search service will continue without event consumption");
      }
    }, 2000);

  } catch (e) {
    logger.error(e, "Failed to start search service");
    process.exit(1);
  }
}

startServer();