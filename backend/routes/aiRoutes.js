import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";

import {

    chatWithAI,

    getChatHistory,

    deleteChat

} from "../controllers/aiController.js";

const router = express.Router();

// AI Chat
router.post(
    "/chat",
    authMiddleware,
    chatWithAI
);

// Chat History
router.get(
    "/history",
    authMiddleware,
    getChatHistory
);

// Delete Chat
router.delete(
    "/history/:id",
    authMiddleware,
    deleteChat
);

export default router;