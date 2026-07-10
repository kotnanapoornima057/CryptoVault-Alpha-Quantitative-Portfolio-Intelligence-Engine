import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";

import {
    getChatHistory
} from "../controllers/aiHistoryController.js";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    getChatHistory
);

export default router;