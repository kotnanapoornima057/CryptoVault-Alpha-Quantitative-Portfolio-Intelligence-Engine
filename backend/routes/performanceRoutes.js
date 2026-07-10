import express from "express";
import { getPerformanceAnalysis } from "../controllers/performanceController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", authMiddleware,getPerformanceAnalysis);

export default router;