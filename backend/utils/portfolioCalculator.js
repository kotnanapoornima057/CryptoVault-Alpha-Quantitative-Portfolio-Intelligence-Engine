import { getLivePricesService } from "../services/priceService.js";

export const calculatePortfolioMetrics = async (assets) => {

    const prices = await getLivePricesService();

    let totalInvestment = 0;
    let totalCurrentValue = 0;

    const updatedAssets = assets.map(asset => {

        const symbol = asset.asset_symbol?.toUpperCase();

        // Safe price lookup
        const currentPrice = prices[symbol] ?? 0;

        if (prices[symbol] === undefined) {
            console.warn("Missing price for asset:", symbol);
        }

        const investment = Number(asset.total_investment || 0);

        const quantity = Number(asset.total_quantity || 0);

        const currentValue = quantity * currentPrice;

        const unrealizedPL = currentValue - investment;

        totalInvestment += investment;
        totalCurrentValue += currentValue;

        return {
            ...asset,
            current_price: currentPrice,
            current_value: currentValue,
            unrealized_pl: unrealizedPL
        };

    });

    const totalUnrealizedPL = totalCurrentValue - totalInvestment;

    const enrichedAssets = updatedAssets.map(asset => {

        asset.allocation_percent =
            totalCurrentValue === 0
                ? "0.00"
                : ((asset.current_value / totalCurrentValue) * 100).toFixed(2);

        return asset;
    });

    return {

        totalInvestment,
        totalCurrentValue,
        totalUnrealizedPL,

        taxLiability:
            totalUnrealizedPL > 0
                ? totalUnrealizedPL * 0.30
                : 0,

        assets: enrichedAssets
    };
};