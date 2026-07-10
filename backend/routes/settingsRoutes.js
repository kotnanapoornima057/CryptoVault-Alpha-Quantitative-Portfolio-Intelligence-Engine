import express from "express";

import {
    getMethod,
    updateMethod
} from "../controllers/settingsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", authMiddleware,getMethod);

router.put("/", authMiddleware,updateMethod);

export default router;