import pool from "../config/db.js";

export const getInsightService = async () => {

    const { rows } = await pool.query(`
        SELECT asset_symbol, total_investment
        FROM assets;
    `);

    let total = 0;
    let maxAsset = null;
    let maxValue = 0;

    rows.forEach(r => {
        const val = Number(r.total_investment);
        total += val;

        if (val > maxValue) {
            maxValue = val;
            maxAsset = r.asset_symbol;
        }
    });

    const concentration = total === 0 ? 0 : (maxValue / total) * 100;

    let riskLevel = "LOW";
    let recommendation = "Portfolio is healthy";

    if (concentration > 80) {
        riskLevel = "HIGH";
        recommendation = "Portfolio heavily concentrated. Diversify urgently.";
    } else if (concentration > 50) {
        riskLevel = "MEDIUM";
        recommendation = "Moderate concentration. Consider diversification.";
    }

    return {
        total_investment: total,
        top_asset: maxAsset,
        concentration: concentration.toFixed(2),
        risk_level: riskLevel,
        recommendation
    };
};