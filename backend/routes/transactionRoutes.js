import express from "express";

import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController.js";

import { validateTransaction } from "../validators/transactionValidator.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(
    authMiddleware,
    validateTransaction,
    createTransaction
  )
  .get(
    authMiddleware,
    getAllTransactions
  );

router
  .route("/:id")
  .get(
    authMiddleware,
    getTransactionById
  )
  .put(
    authMiddleware,
    validateTransaction,
    updateTransaction
  )
  .delete(
    authMiddleware,
    deleteTransaction
  );

export default router;