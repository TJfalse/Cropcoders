import { PrismaClient } from "@prisma/client";
import { Queue } from "bull";

const prisma = new PrismaClient();
const imageQueue = new Queue("fetch-image", process.env.REDIS_URL);

export const createCoordinate = async (req, res) => {
  try {
    const { clientEventId, lat, lng, accuracy } = req.body;
    const farmId = req.params.id;

    // Validate input
    if (!clientEventId || !lat || !lng) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check farm ownership
    const farm = await prisma.farm.findFirst({
      where: {
        id: farmId,
        ownerId: req.user.id,
      },
    });

    if (!farm) {
      return res.status(404).json({ error: "Farm not found" });
    }

    // Check for duplicate coordinate submission
    const existingCoord = await prisma.coordinate.findFirst({
      where: {
        farmId,
        clientEventId,
      },
    });

    if (existingCoord) {
      return res.json(existingCoord); // Return existing record for idempotency
    }

    // Create new coordinate
    const coordinate = await prisma.coordinate.create({
      data: {
        clientEventId,
        farmId,
        lat,
        lng,
        accuracy,
        status: "queued",
      },
    });

    // Queue image fetch job
    await imageQueue.add("fetch-satellite-image", {
      coordinateId: coordinate.id,
      farmId,
      lat,
      lng,
    });

    res.status(201).json(coordinate);
  } catch (error) {
    console.error("Create coordinate error:", error);
    res.status(500).json({ error: "Failed to create coordinate" });
  }
};

export const getCoordinateStatus = async (req, res) => {
  try {
    const coordinate = await prisma.coordinate.findUnique({
      where: { id: req.params.id },
      include: {
        farm: true,
        image: true,
      },
    });

    if (!coordinate) {
      return res.status(404).json({ error: "Coordinate not found" });
    }

    // Check ownership
    if (coordinate.farm.ownerId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    res.json(coordinate);
  } catch (error) {
    console.error("Get coordinate status error:", error);
    res.status(500).json({ error: "Failed to fetch coordinate status" });
  }
};

export const syncOfflineEvents = async (req, res) => {
  try {
    const { events } = req.body;
    if (!Array.isArray(events)) {
      return res.status(400).json({ error: "Events must be an array" });
    }

    const results = await Promise.all(
      events.map(async (event) => {
        const { farmId, clientEventId, lat, lng, accuracy } = event;

        // Verify farm ownership
        const farm = await prisma.farm.findFirst({
          where: {
            id: farmId,
            ownerId: req.user.id,
          },
        });

        if (!farm) {
          return { clientEventId, status: "error", error: "Farm not found" };
        }

        // Check for existing coordinate
        const existing = await prisma.coordinate.findFirst({
          where: { farmId, clientEventId },
        });

        if (existing) {
          return { clientEventId, status: "exists", coordinate: existing };
        }

        // Create new coordinate
        const coordinate = await prisma.coordinate.create({
          data: {
            clientEventId,
            farmId,
            lat,
            lng,
            accuracy,
            status: "queued",
          },
        });

        // Queue image fetch
        await imageQueue.add("fetch-satellite-image", {
          coordinateId: coordinate.id,
          farmId,
          lat,
          lng,
        });

        return { clientEventId, status: "created", coordinate };
      })
    );

    res.json(results);
  } catch (error) {
    console.error("Sync events error:", error);
    res.status(500).json({ error: "Failed to sync events" });
  }
};
