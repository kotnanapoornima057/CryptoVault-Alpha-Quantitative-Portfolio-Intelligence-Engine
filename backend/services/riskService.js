import pool from "../config/db.js";
import { getLivePricesService } from "./priceService.js";

export const getRiskAnalysisService = async (userId) => {

    const prices = await getLivePricesService();

    const result = await pool.query(
        `
        SELECT *
        FROM assets
        WHERE user_id = $1
        ORDER BY total_investment DESC;
        `,
        [userId]
        );
    const riskData = result.rows.map(asset => {

        const currentPrice =
            prices[asset.asset_symbol] || 0;

        const currentValue =
            Number(asset.total_quantity) * currentPrice;

        const profitLoss =
            currentValue - Number(asset.total_investment);

        const profitLossPercent =
            Number(asset.total_investment) === 0
                ? 0
                : (
                    profitLoss /
                    Number(asset.total_investment)
                ) * 100;

        let riskLevel = "LOW";

        if (profitLossPercent < -20)
            riskLevel = "HIGH";
        else if (profitLossPercent < -10)
            riskLevel = "MEDIUM";

        return {

            asset_symbol: asset.asset_symbol,

            quantity: asset.total_quantity,

            average_cost: asset.average_cost,

            investment: asset.total_investment,

            current_price: currentPrice,

            current_value: currentValue,

            profit_loss: profitLoss,

            profit_loss_percent:
                profitLossPercent.toFixed(2),

            risk_level: riskLevel

        };

    });

    return riskData;

};