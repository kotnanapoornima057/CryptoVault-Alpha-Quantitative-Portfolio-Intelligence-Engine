import pool from "../config/db.js";

export const getTaxReportService = async (userId) => {

    const result = await pool.query(
        `
        SELECT *
        FROM realized_gains
        WHERE user_id = $1
        ORDER BY sale_date;
        `,
        [userId]
    );

    const gains = result.rows;

    let shortTerm = 0;
    let longTerm = 0;

    for (const gain of gains) {

        // Until holding period is implemented,
        // every gain is treated as short-term.
        shortTerm += Number(gain.realized_gain);

    }

    const totalGain = shortTerm + longTerm;

    return {

    shortTermCapitalGain: shortTerm,

    longTermCapitalGain: longTerm,

    washSaleDeferred: 0,

    netRealizedGain: totalGain,

    estimatedTax:
        totalGain > 0
            ? totalGain * 0.30
            : 0,

    realizedLots: gains

};

};