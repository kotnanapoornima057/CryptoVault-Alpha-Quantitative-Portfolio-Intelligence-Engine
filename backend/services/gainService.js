import pool from "../config/db.js";

export const saveRealizedGainService = async (
  transactionId,
  userId,
  assetSymbol,
  saleResult,
  saleDate
) => {

  try {

    console.log("========== saveRealizedGainService ==========");

    console.log("User ID:", userId);
    console.log("Transaction ID:", transactionId);
    console.log("Asset:", assetSymbol);
    console.log("Sale Date:", saleDate);

    console.log("Sale Result:");
    console.log(saleResult);

    const result = await pool.query(
      `
      INSERT INTO realized_gains
      (
        user_id,
        transaction_id,
        asset_symbol,
        method,
        proceeds,
        cost_basis,
        realized_gain,
        sale_date
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *;
      `,
      [
        userId,
        transactionId,
        assetSymbol.toUpperCase(),
        saleResult.method,
        saleResult.proceeds,
        saleResult.costBasis,
        saleResult.realizedGain,
        saleDate,
      ]
    );

    console.log("Realized Gain Saved Successfully");
    console.log(result.rows[0]);

    return result.rows[0];

  } catch (error) {

    console.error("ERROR saving realized gain");

    console.error(error);

    throw error;

  }

};