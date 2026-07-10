import pool from "../config/db.js";

export const createAssetLotService = async (
  transactionId,
  transactionData,
  userId
) => {

  const {
    asset_symbol,
    quantity,
    unit_price,
    transaction_date,
  } = transactionData;

  await pool.query(
    `
    INSERT INTO asset_lots
    (
      user_id,
      asset_symbol,
      quantity,
      remaining_quantity,
      purchase_price,
      purchase_date,
      transaction_id
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    `,
    [
      userId,
      asset_symbol.toUpperCase(),
      quantity,
      quantity,
      unit_price,
      transaction_date,
      transactionId,
    ]
  );

};