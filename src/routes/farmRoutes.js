import express from "express";
import {
  createFarm,
  getFarms,
  getFarm,
} from "../controllers/farmController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/", createFarm);
router.get("/", getFarms);
router.get("/:id", getFarm);

export default router;
