import {
  createTransactionService,
  getAllTransactionsService,
  getTransactionByIdService,
  updateTransactionService,
  deleteTransactionService,
} from "../services/transactionService.js";

// CREATE
export const createTransaction = async (req, res) => {
  try {
    const {
      asset_symbol,
      transaction_type,
      quantity,
      unit_price,
      transaction_date,
    } = req.body;

    if (
      !asset_symbol ||
      !transaction_type ||
      !quantity ||
      !unit_price ||
      !transaction_date
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    const transaction = await createTransactionService(
    req.body,
    req.user.id
);

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// GET ALL
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await getAllTransactionsService(
    req.user.id
);

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// GET BY ID
export const getTransactionById = async (req, res) => {
  try {
      const transaction = await getTransactionByIdService(
    req.params.id,
    req.user.id
);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// UPDATE
export const updateTransaction = async (req, res) => {
  try {
    const transaction = await updateTransactionService(
    req.params.id,
    req.body,
    req.user.id
);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: transaction,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// DELETE
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await deleteTransactionService(
    req.params.id,
    req.user.id
);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};