import { GoogleGenAI } from "@google/genai";

import { getDashboardStatsService } from "./dashboardService.js";
import { getPerformanceAnalysisService } from "./performanceService.js";
import { getRiskAnalysisService } from "./riskService.js";
import { getPortfolioAdviceService } from "./advisorService.js";
import { getTaxReportService } from "./taxService.js";

import {
    getRecentChatsService,
    saveChatHistoryService
} from "./aiHistoryService.js";

import { detectIntent } from "../utils/intentDetector.js";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export const getAIResponseService = async (
    message,
    userId
) => {

    // ---------------- Detect User Intent ----------------

    const intent = detectIntent(message);

    console.log("Detected Intent:", intent);

    let dashboard = null;
    let performance = null;
    let risk = null;
    let advisor = null;
    let tax = null;

    // ---------------- Fetch Only Required Data ----------------

    switch (intent) {

        case "dashboard":

            dashboard =
                await getDashboardStatsService(userId);

            performance =
                await getPerformanceAnalysisService(userId);

            advisor =
                await getPortfolioAdviceService(userId);

            break;

        case "performance":

            performance =
                await getPerformanceAnalysisService(userId);

            break;

        case "risk":

            risk =
                await getRiskAnalysisService(userId);

            break;

        case "advisor":

            advisor =
                await getPortfolioAdviceService(userId);

            break;

        case "tax":

            tax =
                await getTaxReportService(userId);

            break;

        default:

            dashboard =
                await getDashboardStatsService(userId);

            performance =
                await getPerformanceAnalysisService(userId);

            risk =
                await getRiskAnalysisService(userId);

            advisor =
                await getPortfolioAdviceService(userId);

            tax =
                await getTaxReportService(userId);

            break;

    }

    // ---------------- Previous Conversations ----------------

    const previousChats =
        await getRecentChatsService(
            userId,
            5
        );

    const chatHistory =
        previousChats
            .map(chat =>

`User:
${chat.question}

AI:
${chat.response}
`
            )
            .join("\n");

    // ---------------- Prompt ----------------

    const prompt = `
You are CryptoVault AI.

You are an expert cryptocurrency portfolio advisor.

Answer ONLY using the user's portfolio information provided below.

====================================
PREVIOUS CONVERSATIONS
====================================

${chatHistory}

====================================
CURRENT DATA
====================================

Intent:
${intent}

Dashboard:
${JSON.stringify(dashboard, null, 2)}

Performance:
${JSON.stringify(performance, null, 2)}

Risk:
${JSON.stringify(risk, null, 2)}

Advisor:
${JSON.stringify(advisor, null, 2)}

Tax:
${JSON.stringify(tax, null, 2)}

====================================
CURRENT QUESTION
====================================

${message}
`;

    // ---------------- Gemini AI ----------------

    try {

        const result =
            await ai.models.generateContent({

                model: "gemini-2.5-flash",

                contents: prompt

            });

        const aiResponse = result.text;

        // Save Conversation

        await saveChatHistoryService(

            userId,

            message,

            aiResponse

        );

        return aiResponse;

    }

    catch (error) {

        console.error("Gemini Error:", error);

        const fallbackResponse = `
⚠️ Gemini AI is temporarily unavailable because the API quota has been exceeded.

Please try again later or use a different Gemini API key.

Your CryptoVault application is working correctly.
`;

        // Save even failed conversation

        await saveChatHistoryService(

            userId,

            message,

            fallbackResponse

        );

        return fallbackResponse;

    }

};