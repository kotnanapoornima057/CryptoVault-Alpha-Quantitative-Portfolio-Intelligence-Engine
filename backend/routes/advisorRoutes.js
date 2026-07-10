import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getPortfolioAdvice } from "../controllers/advisorController.js";

const router = express.Router();

router.get("/", authMiddleware,getPortfolioAdvice);

export default router;