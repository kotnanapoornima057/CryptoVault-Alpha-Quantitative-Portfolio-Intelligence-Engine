import { getAssetsService } from "./assetService.js";

export const getPortfolioAdviceService = async (userId) => {

    const assets = await getAssetsService(userId);

    let totalValue = 0;

    assets.forEach(asset => {
        totalValue += Number(asset.current_value);
    });

    const recommendations = assets.map(asset => {

        const investment = Number(asset.total_investment);

        const currentValue = Number(asset.current_value);

        const profitLoss = currentValue - investment;

        const allocation =
            totalValue === 0
                ? 0
                : (currentValue / totalValue) * 100;

        let recommendation = "";
        let reason = "";

        // -------------------------
        // SELL
        // -------------------------
        if (profitLoss < -(investment * 0.20)) {

            recommendation = "SELL";
            reason = "Loss exceeds 20% of investment.";

        }

        // -------------------------
        // REDUCE
        // -------------------------
        else if (allocation > 40) {

            recommendation = "REDUCE";
            reason = "Portfolio is heavily concentrated in this asset.";

        }

        // -------------------------
        // BUY
        // -------------------------
        else if (allocation < 15 && profitLoss >= 0) {

            recommendation = "BUY";
            reason = "Good performer with low allocation.";

        }

        // -------------------------
        // HOLD
        // -------------------------
        else {

            recommendation = "HOLD";
            reason = "Current position appears balanced.";

        }

        return {

            asset_symbol: asset.asset_symbol,

            investment,

            current_value: currentValue,

            allocation: allocation.toFixed(2),

            profit_loss: profitLoss.toFixed(2),

            recommendation,

            reason

        };

    });

    return recommendations;

};