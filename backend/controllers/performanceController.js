import { getPerformanceAnalysisService } from "../services/performanceService.js";

export const getPerformanceAnalysis = async (req, res) => {

    try {

        const report = await getPerformanceAnalysisService(
            req.user.id
        );

        res.status(200).json({
            success: true,
            data: report
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};