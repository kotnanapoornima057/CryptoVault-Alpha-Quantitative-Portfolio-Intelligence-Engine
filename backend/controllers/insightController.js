import { getInsightService } from "../services/insightService.js";

export const getInsights = async (req, res) => {

    try {
        const data = await getInsightService();

        res.json({
            success: true,
            data
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: "Insight API Error"
        });
    }
};