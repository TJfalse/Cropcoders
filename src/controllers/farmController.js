import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createFarm = async (req, res) => {
  try {
    const { name, centerLat, centerLng } = req.body;

    // Validate input
    if (!name || !centerLat || !centerLng) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const farm = await prisma.farm.create({
      data: {
        name,
        centerLat,
        centerLng,
        ownerId: req.user.id,
      },
    });

    res.status(201).json(farm);
  } catch (error) {
    console.error("Create farm error:", error);
    res.status(500).json({ error: "Failed to create farm" });
  }
};

export const getFarms = async (req, res) => {
  try {
    const farms = await prisma.farm.findMany({
      where: { ownerId: req.user.id },
    });
    res.json(farms);
  } catch (error) {
    console.error("Get farms error:", error);
    res.status(500).json({ error: "Failed to fetch farms" });
  }
};

export const getFarm = async (req, res) => {
  try {
    const farm = await prisma.farm.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.user.id,
      },
      include: {
        coordinates: true,
      },
    });

    if (!farm) {
      return res.status(404).json({ error: "Farm not found" });
    }

    res.json(farm);
  } catch (error) {
    console.error("Get farm error:", error);
    res.status(500).json({ error: "Failed to fetch farm" });
  }
};
