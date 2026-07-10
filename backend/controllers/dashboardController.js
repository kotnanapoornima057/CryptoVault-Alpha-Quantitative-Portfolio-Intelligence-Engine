import {
    getDashboardStatsService,
    getPortfolioHistoryService
} from "../services/dashboardService.js";

// ================= Dashboard =================

export const getDashboardStats = async (req, res) => {

    try {

        const stats = await getDashboardStatsService(
            req.user.id
        );

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

// ================= Portfolio History =================

export const getPortfolioHistory = async (req, res) => {

    try {

        const history = await getPortfolioHistoryService(
            req.user.id
        );

        res.status(200).json({
            success: true,
            data: history
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};