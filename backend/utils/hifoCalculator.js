import pool from "../config/db.js";

export const processHIFOSale = async (
  assetSymbol,
  sellQuantity,
  sellPrice,
  userId
) => {

  const result = await pool.query(
    `
    SELECT *
    FROM asset_lots
    WHERE asset_symbol=$1
      AND user_id=$2
      AND remaining_quantity>0
    ORDER BY purchase_price DESC
    `,
    [assetSymbol.toUpperCase(), userId]
  );

  const lots = result.rows;

  const totalAvailable = lots.reduce(
    (sum, lot) => sum + Number(lot.remaining_quantity),
    0
  );

  if (totalAvailable < Number(sellQuantity)) {
    throw new Error("Insufficient quantity.");
  }

  let remaining = Number(sellQuantity);

  let totalCostBasis = 0;

  const consumedLots = [];

  for (const lot of lots) {

    if (remaining <= 0) break;

    const consume = Math.min(
      Number(lot.remaining_quantity),
      remaining
    );

    totalCostBasis += consume * Number(lot.purchase_price);

    remaining -= consume;

    consumedLots.push({
      lotId: lot.id,
      consumed: consume,
      purchasePrice: Number(lot.purchase_price),
      purchaseDate: lot.purchase_date
    });

  }

  for (const lot of consumedLots) {

    await pool.query(
      `
      UPDATE asset_lots
      SET remaining_quantity =
          remaining_quantity-$1
      WHERE id=$2
      AND user_id=$3
      `,
      [
        lot.consumed,
        lot.lotId,
        userId
      ]
    );

  }

  const proceeds =
    Number(sellQuantity) *
    Number(sellPrice);

  return {

    method: "HIFO",

    proceeds,

    costBasis: totalCostBasis,

    realizedGain:
      proceeds - totalCostBasis,

    consumedLots

  };

};