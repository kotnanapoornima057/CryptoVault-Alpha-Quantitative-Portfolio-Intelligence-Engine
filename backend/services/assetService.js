import pool from "../config/db.js";
import { getLivePricesService } from "./priceService.js";

// ================= GET ALL ASSETS =================

export const getAssetsService = async (userId) => {

    const prices = await getLivePricesService();

    const result = await pool.query(
        `
        SELECT *
        FROM assets
        WHERE user_id = $1
        ORDER BY asset_symbol;
        `,
        [userId]
    );

    const assets = result.rows.map(asset => {

        const currentPrice = prices[asset.asset_symbol] || 0;

        const currentValue =
            Number(asset.total_quantity) * currentPrice;

        const unrealizedPL =
            currentValue - Number(asset.total_investment);

        return {

            ...asset,

            current_price: currentPrice,

            current_value: currentValue,

            unrealized_pl: unrealizedPL

        };

    });
    console.log("Assets returned from service:");
console.table(assets);

    return assets;

};

// ================= BUY =================

export const updateAssetAfterBuyService = async (
    transactionData,
    userId
) => {

    const {
        asset_symbol,
        quantity,
        unit_price,
    } = transactionData;

    const existingAsset = await pool.query(
        `
        SELECT *
        FROM assets
        WHERE asset_symbol = $1
        AND user_id = $2
        `,
        [
            asset_symbol.toUpperCase(),
            userId
        ]
    );

    if (existingAsset.rows.length === 0) {

        const totalInvestment =
    (Number(quantity) * Number(unit_price))
    + Number(transactionData.network_fee || 0);

        await pool.query(
            `
            INSERT INTO assets
            (
                user_id,
                asset_symbol,
                total_quantity,
                average_cost,
                total_investment
            )
            VALUES ($1,$2,$3,$4,$5)
            `,
            [
                userId,
                asset_symbol.toUpperCase(),
                quantity,
                unit_price,
                totalInvestment,
            ]
        );

        return;
    }

    const asset = existingAsset.rows[0];

    const newQuantity =
        Number(asset.total_quantity) +
        Number(quantity);

    const newInvestment =
    Number(asset.total_investment) +
    (Number(quantity) * Number(unit_price)) +
    Number(transactionData.network_fee || 0);

    const averageCost =
        newInvestment / newQuantity;

    await pool.query(
        `
        UPDATE assets
        SET
            total_quantity = $1,
            average_cost = $2,
            total_investment = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE asset_symbol = $4
        AND user_id = $5
        `,
        [
            newQuantity,
            averageCost,
            newInvestment,
            asset_symbol.toUpperCase(),
            userId
        ]
    );

};

// ================= SELL =================

export const updateAssetAfterSellService = async (
  transactionData,
  userId
) => {

  const {
    asset_symbol,
    quantity,
  } = transactionData;

  // Get asset
  const existingAsset = await pool.query(
    `
    SELECT *
    FROM assets
    WHERE asset_symbol = $1
      AND user_id = $2
    `,
    [
      asset_symbol.toUpperCase(),
      userId
    ]
  );

  if (existingAsset.rows.length === 0) {
    throw new Error("Asset not found.");
  }

  const asset = existingAsset.rows[0];

  if (Number(asset.total_quantity) < Number(quantity)) {
    throw new Error("Insufficient asset balance.");
  }

  // Remaining quantity
  const remainingQuantity =
    Number(asset.total_quantity) - Number(quantity);

  // Calculate remaining investment directly from remaining lots
  const lotResult = await pool.query(
    `
    SELECT
      COALESCE(
        SUM(remaining_quantity * purchase_price),
        0
      ) AS investment
    FROM asset_lots
    WHERE asset_symbol = $1
      AND user_id = $2
      AND remaining_quantity > 0;
    `,
    [
      asset_symbol.toUpperCase(),
      userId
    ]
  );

  const remainingInvestment =
    Number(lotResult.rows[0].investment);

  const averageCost =
    remainingQuantity > 0
      ? remainingInvestment / remainingQuantity
      : 0;

  await pool.query(
    `
    UPDATE assets
    SET
      total_quantity = $1,
      total_investment = $2,
      average_cost = $3,
      updated_at = CURRENT_TIMESTAMP
    WHERE asset_symbol = $4
      AND user_id = $5
    `,
    [
      remainingQuantity,
      remainingInvestment,
      averageCost,
      asset_symbol.toUpperCase(),
      userId
    ]
  );

};