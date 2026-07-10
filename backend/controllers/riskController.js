import { getRiskAnalysisService } from "../services/riskService.js";

export const getRiskAnalysis = async (req, res) => {

    try {

        const report = await getRiskAnalysisService(
            req.user.id
        );

        res.status(200).json({
            success: true,
            data: report
        });

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};