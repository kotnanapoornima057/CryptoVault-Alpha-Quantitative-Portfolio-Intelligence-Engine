import pool from "../config/db.js";
import { getLivePricesService } from "./priceService.js";

export const getPerformanceAnalysisService = async (userId) => {

    const prices = await getLivePricesService();

    const { rows } = await pool.query(
        `
        SELECT
            asset_symbol,
            total_quantity,
            average_cost,
            total_investment
        FROM assets
        WHERE user_id = $1
        ORDER BY asset_symbol;
        `,
        [userId]
    );

    const performance = rows.map(asset => {

        const currentPrice =
            prices[asset.asset_symbol] || 0;

        const currentValue =
            Number(asset.total_quantity) * currentPrice;

        const profitLoss =
            currentValue -
            Number(asset.total_investment);

        const roi =
            Number(asset.total_investment) === 0
                ? 0
                : (
                    profitLoss /
                    Number(asset.total_investment)
                ) * 100;

        return {

            asset_symbol: asset.asset_symbol,

            quantity: asset.total_quantity,

            average_cost: asset.average_cost,

            current_price: currentPrice,

            investment: asset.total_investment,

            current_value: currentValue,

            profit_loss: profitLoss,

            roi: roi.toFixed(2)

        };

    });

    return performance;

};