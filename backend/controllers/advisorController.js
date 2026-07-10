import { getPortfolioAdviceService } from "../services/advisorService.js";

export const getPortfolioAdvice = async (req, res) => {

    try {

        const advice = await getPortfolioAdviceService(req.user.id);

        res.status(200).json({
            success: true,
            data: advice
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};