// Mock market prices (Later we'll replace these with live API prices)

const marketPrices = {
    BTC: 110000,
    ETH: 7000,
    SOL: 250,
    BNB: 900,
    XRP: 3
};

export const getMarketPrice = (assetSymbol) => {
    return marketPrices[assetSymbol.toUpperCase()] || 0;
};