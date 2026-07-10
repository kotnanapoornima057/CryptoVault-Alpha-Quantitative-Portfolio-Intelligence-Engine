import express from "express";
import { getRiskAnalysis } from "../controllers/riskController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/",authMiddleware, getRiskAnalysis);

export default router;