import express from "express";
import {
  createCoordinate,
  getCoordinateStatus,
  syncOfflineEvents,
} from "../controllers/coordinateController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/farms/:id/coords", createCoordinate);
router.get("/coords/:id/status", getCoordinateStatus);
router.post("/sync/events", syncOfflineEvents);

export default router;
