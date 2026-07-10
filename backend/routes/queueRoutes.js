import express from "express";

import { getAssetQueue } from "../controllers/queueController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/",authMiddleware, getAssetQueue);

export default router;