import express from "express";
import { getLivePrices } from "../controllers/priceController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/",authMiddleware, getLivePrices);

export default router;