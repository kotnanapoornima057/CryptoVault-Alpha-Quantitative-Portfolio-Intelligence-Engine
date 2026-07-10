import pool from "../config/db.js";
import { calculatePortfolioMetrics } from "../utils/portfolioCalculator.js";

// ================= Dashboard =================

export const getDashboardStatsService = async (userId) => {

    const result = await pool.query(
        `
        SELECT *
        FROM assets
        WHERE user_id = $1
        ORDER BY asset_symbol;
        `,
        [userId]
    );

    const portfolio = await calculatePortfolioMetrics(result.rows);

    return {

        summary: {

            totalInvestment:
                portfolio.totalInvestment,

            totalCurrentValue:
                portfolio.totalCurrentValue,

            totalUnrealizedPL:
                portfolio.totalUnrealizedPL,

            taxLiability:
                portfolio.taxLiability

        },

        assets: portfolio.assets

    };

};


// ================= Portfolio History =================

export const getPortfolioHistoryService = async (userId) => {

    const result = await pool.query(

        `
        SELECT
            DATE(transaction_date) AS date,
            SUM(quantity * unit_price) AS value

        FROM transactions

        WHERE user_id = $1

        GROUP BY DATE(transaction_date)

        ORDER BY DATE(transaction_date);
        `,
        [userId]

    );

    return result.rows;

};