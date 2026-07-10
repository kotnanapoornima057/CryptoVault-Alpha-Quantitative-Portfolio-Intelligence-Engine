import express from "express";
import { getAssets } from "../controllers/assetController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/",authMiddleware, getAssets);

export default router;