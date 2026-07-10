import pool from "../config/db.js";

export const getAssetQueueService = async () => {

    const result = await pool.query(`
        SELECT
            id,
            asset_symbol,
            purchase_date,
            purchase_price,
            remaining_quantity
        FROM asset_lots
        WHERE remaining_quantity > 0
        ORDER BY purchase_date;
    `);

    return result.rows.map(lot => {

        const purchaseDate = new Date(lot.purchase_date);

        const today = new Date();

        const daysHeld =
            Math.floor(
                (today - purchaseDate) /
                (1000 * 60 * 60 * 24)
            );

        return {

            ...lot,

            holding_classification:
                daysHeld >= 365
                    ? "Long-Term"
                    : "Short-Term"

        };

    });

};