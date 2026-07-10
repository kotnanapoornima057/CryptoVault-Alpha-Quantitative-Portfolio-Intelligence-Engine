import express from "express";

import {
    getDashboardStats,
    getPortfolioHistory
} from "../controllers/dashboardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware,getDashboardStats);
router.get("/history", authMiddleware,getPortfolioHistory);

export default router;