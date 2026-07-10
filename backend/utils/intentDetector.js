export const detectIntent = (message) => {

    const text = message.toLowerCase();

    if (
        text.includes("tax") ||
        text.includes("capital gain") ||
        text.includes("gain")
    ) {
        return "tax";
    }

    if (
        text.includes("risk") ||
        text.includes("danger") ||
        text.includes("volatile")
    ) {
        return "risk";
    }

    if (
        text.includes("performance") ||
        text.includes("roi") ||
        text.includes("profit")
    ) {
        return "performance";
    }

    if (
        text.includes("recommend") ||
        text.includes("buy") ||
        text.includes("sell") ||
        text.includes("hold")
    ) {
        return "advisor";
    }

    return "dashboard";
};