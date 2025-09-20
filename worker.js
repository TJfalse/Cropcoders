import { Queue } from "bull";
import { PrismaClient } from "@prisma/client";
import winston from "winston";
import {
  getSentinelToken,
  fetchSatelliteImage,
} from "./src/services/sentinelService.js";
import { uploadToS3 } from "./src/services/storageService.js";

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "worker-error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "worker-combined.log" }),
  ],
});

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize Queue with retry strategy
const imageQueue = new Queue("fetch-image", process.env.REDIS_URL, {
  defaultJobOptions: {
    attempts: 5, 
    backoff: {
      type: "exponential",
      delay: 5000, 
    },
    removeOnComplete: 100, 
    removeOnFail: 100, 
  },
});

/**
 * Process a job to fetch satellite images
 * @param {Object} job - Bull job object
 */
async function processSatelliteImageJob(job) {
  const { coordinateId, lat, lng, farmId } = job.data;
  logger.info(`Processing job ${job.id} for coordinate ${coordinateId}`);

  try {
    // Update coordinate status
    await prisma.coordinate.update({
      where: { id: coordinateId },
      data: { status: "fetching" },
    });

    // Get Sentinel Hub token
    logger.debug("Getting Sentinel Hub token");
    const token = await getSentinelToken();

    // Fetch image from Sentinel
    logger.debug(`Fetching satellite image for coordinates: ${lat}, ${lng}`);
    const imageBuffer = await fetchSatelliteImage(token, lat, lng);

    // Generate S3 key
    const key = `satellites/farm-${farmId}/${coordinateId}-${Date.now()}.tiff`;

    // Upload to S3
    logger.debug(`Uploading image to S3: ${key}`);
    const s3Response = await uploadToS3(imageBuffer, key);

    // Create image record
    const image = await prisma.image.create({
      data: {
        key: s3Response.Key,
        bbox: {
          minLat: lat - 0.1,
          maxLat: lat + 0.1,
          minLng: lng - 0.1,
          maxLng: lng + 0.1,
        },
        meta: {
          uploadedAt: new Date(),
          size: imageBuffer.length,
          s3Location: s3Response.Location,
        },
      },
    });

    // Update coordinate with image reference
    await prisma.coordinate.update({
      where: { id: coordinateId },
      data: {
        fetchedImageId: image.id,
        status: "fetched",
      },
    });

    // TODO: Trigger ML model processing here
    // For now, just marking as processed
    await prisma.coordinate.update({
      where: { id: coordinateId },
      data: {
        status: "processed",
        processedAt: new Date(),
      },
    });

    logger.info(`Successfully processed job ${job.id}`);
    return { success: true, imageId: image.id };
  } catch (error) {
    logger.error(`Failed to process job ${job.id}:`, {
      error: error.message,
      stack: error.stack,
      jobData: job.data,
    });

    // Update coordinate with error status
    await prisma.coordinate.update({
      where: { id: coordinateId },
      data: {
        status: "failed",
      },
    });

    throw error;
  }
}

// Process queue jobs
imageQueue.process("fetch-satellite-image", processSatelliteImageJob);

// Queue event handlers
imageQueue.on("completed", (job) => {
  logger.info(`Job ${job.id} completed successfully`);
});

imageQueue.on("failed", (job, error) => {
  logger.error(`Job ${job.id} failed:`, {
    error: error.message,
    stack: error.stack,
    attempts: job.attemptsMade,
  });
});

imageQueue.on("error", (error) => {
  logger.error("Queue error:", error);
});

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  try {
    await imageQueue.close();
    await prisma.$disconnect();
    logger.info("All connections closed. Exiting.");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown:", error);
    process.exit(1);
  }
}

// Setup graceful shutdown handlers
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", {
    promise,
    reason,
  });
});

logger.info("Worker process started - Ready to process satellite image jobs");
