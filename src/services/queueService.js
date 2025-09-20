import { Queue } from "bull";
import { PrismaClient } from "@prisma/client";
import { getSentinelToken, fetchSatelliteImage } from "./sentinelService.js";
import { uploadToS3 } from "./storageService.js";

const prisma = new PrismaClient();
const imageQueue = new Queue("fetch-image", process.env.REDIS_URL);

export const processCoordinate = async (job) => {
  const { coordinateId, lat, lng } = job.data;

  try {
    // Update coordinate status
    await prisma.coordinate.update({
      where: { id: coordinateId },
      data: { status: "fetching" },
    });

    // Get Sentinel Hub token
    const token = await getSentinelToken();

    // Fetch image from Sentinel
    const imageBuffer = await fetchSatelliteImage(token, lat, lng);

    // Generate S3 key
    const key = `satellites/farm-${
      job.data.farmId
    }/${coordinateId}-${Date.now()}.tiff`;

    // Upload to S3
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

    // TODO: Here you would trigger your ML model processing
    // For now, we'll just mark it as processed
    await prisma.coordinate.update({
      where: { id: coordinateId },
      data: {
        status: "processed",
        processedAt: new Date(),
      },
    });

    return { success: true, imageId: image.id };
  } catch (error) {
    console.error(`Failed to process job ${job.id}:`, error);

    // Update coordinate with error status
    await prisma.coordinate.update({
      where: { id: coordinateId },
      data: {
        status: "failed",
      },
    });

    throw error;
  }
};

// Initialize the queue processor
imageQueue.process("fetch-satellite-image", processCoordinate);

// Handle queue events
imageQueue.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

imageQueue.on("failed", (job, error) => {
  console.error(`Job ${job.id} failed:`, error);
});

export default imageQueue;
