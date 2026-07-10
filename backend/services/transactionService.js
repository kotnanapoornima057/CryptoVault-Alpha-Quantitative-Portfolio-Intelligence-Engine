import pool from "../config/db.js";
import crypto from "crypto";
import {
  updateAssetAfterBuyService,
  updateAssetAfterSellService,
} from "./assetService.js";
import { createAssetLotService } from "./lotService.js";
import { processFIFOSale } from "../utils/fifoCalculator.js";
import { processLIFOSale } from "../utils/lifoCalculator.js";
import { processHIFOSale } from "../utils/hifoCalculator.js";
import { getCostBasisMethodService } from "./settingsService.js";
import { saveRealizedGainService } from "./gainService.js";

// ================= CREATE =================

export const createTransactionService = async (
  transactionData,
  userId
) => {

  const {
    asset_symbol,
    transaction_type,
    quantity,
    unit_price,
    network_fee,
    transaction_date,
  } = transactionData;

  const verificationCode = crypto.randomUUID();

  const result = await pool.query(
    `
    INSERT INTO transactions
    (
      user_id,
      asset_symbol,
      transaction_type,
      quantity,
      unit_price,
      network_fee,
      transaction_date,
      verification_code
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *;
    `,
    [
      userId,
      asset_symbol.toUpperCase(),
      transaction_type.toUpperCase(),
      quantity,
      unit_price,
      network_fee || 0,
      transaction_date,
      verificationCode,
    ]
  );

  const createdTransaction = result.rows[0];

  // ---------------- BUY ----------------

  if (transaction_type.toUpperCase() === "BUY") {

    await updateAssetAfterBuyService(
      transactionData,
      userId
    );

    await createAssetLotService(
      createdTransaction.id,
      transactionData,
      userId
    );

  }

  // ---------------- SELL ----------------

  if (transaction_type.toUpperCase() === "SELL") {

    try {

      console.log("========== SELL TRANSACTION ==========");

      const setting = await getCostBasisMethodService();

      console.log("Cost Basis Method:", setting.cost_basis_method);

      let saleResult;

      switch (setting.cost_basis_method) {

        case "FIFO":
          saleResult = await processFIFOSale(
            asset_symbol,
            quantity,
            unit_price,
            userId
          );
          break;

        case "LIFO":
          saleResult = await processLIFOSale(
            asset_symbol,
            quantity,
            unit_price,
            userId
          );
          break;

        case "HIFO":
          saleResult = await processHIFOSale(
            asset_symbol,
            quantity,
            unit_price,
            userId
          );
          break;

        default:
          throw new Error("Invalid Cost Basis Method");

      }

      // ================= APPLY SELL NETWORK FEE =================

      // Deduct network fee from sale proceeds
      saleResult.proceeds =
        Number(saleResult.proceeds) -
        Number(network_fee || 0);

      // Recalculate realized gain
      saleResult.realizedGain =
        saleResult.proceeds -
        Number(saleResult.costBasis);

      console.log("Calculation Complete");
      console.log(saleResult);

      await updateAssetAfterSellService(
        transactionData,
        userId
      );

      await saveRealizedGainService(
        createdTransaction.id,
        userId,
        asset_symbol,
        saleResult,
        transaction_date
      );

      console.log("Realized Gain Saved");

    } catch (error) {

      console.error("SELL PROCESS FAILED");
      console.error(error);
      throw error;

    }

  }

  return createdTransaction;

};

// ================= GET ALL =================

export const getAllTransactionsService = async (userId) => {

  const result = await pool.query(
    `
    SELECT *
    FROM transactions
    WHERE user_id = $1
    ORDER BY transaction_date DESC;
    `,
    [userId]
  );

  return result.rows;

};

// ================= GET BY ID =================

export const getTransactionByIdService = async (
  id,
  userId
) => {

  const result = await pool.query(
    `
    SELECT *
    FROM transactions
    WHERE id = $1
      AND user_id = $2;
    `,
    [id, userId]
  );

  return result.rows[0];

};

// ================= UPDATE =================

export const updateTransactionService = async (
  id,
  transactionData,
  userId
) => {

  const {
    asset_symbol,
    transaction_type,
    quantity,
    unit_price,
    network_fee,
    transaction_date,
  } = transactionData;

  const result = await pool.query(
    `
    UPDATE transactions
    SET
      asset_symbol=$1,
      transaction_type=$2,
      quantity=$3,
      unit_price=$4,
      network_fee=$5,
      transaction_date=$6
    WHERE id=$7
      AND user_id=$8
    RETURNING *;
    `,
    [
      asset_symbol.toUpperCase(),
      transaction_type.toUpperCase(),
      quantity,
      unit_price,
      network_fee || 0,
      transaction_date,
      id,
      userId,
    ]
  );

  return result.rows[0];

};

// ================= DELETE =================

export const deleteTransactionService = async (
  id,
  userId
) => {

  await pool.query(
    `
    DELETE FROM realized_gains
    WHERE transaction_id = $1;
    `,
    [id]
  );

  await pool.query(
    `
    DELETE FROM asset_lots
    WHERE transaction_id = $1;
    `,
    [id]
  );

  const result = await pool.query(
    `
    DELETE FROM transactions
    WHERE id = $1
      AND user_id = $2
    RETURNING *;
    `,
    [id, userId]
  );

  return result.rows[0];

};