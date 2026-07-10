import express from "express";
import { getTaxReport } from "../controllers/taxController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", authMiddleware,getTaxReport);

export default router;