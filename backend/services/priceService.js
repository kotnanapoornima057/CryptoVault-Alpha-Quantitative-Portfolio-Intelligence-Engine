let cachedPrices = {
    BTC: 0,
    ETH: 0,
    SOL: 0,
    MATIC: 0
};

let lastFetchTime = 0;

// Cache prices for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const getLivePricesService = async () => {

    const now = Date.now();

    // Use cache if it is still valid
    if (lastFetchTime !== 0 && (now - lastFetchTime) < CACHE_DURATION) {

        console.log("✅ Using cached prices");

        return cachedPrices;

    }

    console.log("🌐 Fetching fresh prices from CoinGecko");

    try {

        const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,polygon-ecosystem-token&vs_currencies=usd",
    {
        headers: {
            accept: "application/json",
        },
    }
);

        if (!response.ok) {

            console.log("⚠ CoinGecko returned HTTP", response.status);

            console.log("Using cached prices.");

            return cachedPrices;

        }

        const data = await response.json();

        if (data.status) {

            console.log("⚠ CoinGecko Rate Limited.");

            console.log("Using cached prices.");

            return cachedPrices;

        }

        cachedPrices = {

            BTC: data.bitcoin?.usd ?? cachedPrices.BTC,

            ETH: data.ethereum?.usd ?? cachedPrices.ETH,

            SOL: data.solana?.usd ?? cachedPrices.SOL,

            MATIC: data["polygon-ecosystem-token"]?.usd ?? cachedPrices.MATIC

        };

        lastFetchTime = now;

        console.log("✅ Prices updated");

        return cachedPrices;

    }
    catch (error) {

        console.log("⚠ Price service unavailable.");

        console.log("Using cached prices.");

        return cachedPrices;

    }

};