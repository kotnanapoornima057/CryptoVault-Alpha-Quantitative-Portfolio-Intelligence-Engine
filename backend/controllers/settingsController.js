import {
    getCostBasisMethodService,
    updateCostBasisMethodService
} from "../services/settingsService.js";

export const getMethod = async (req, res) => {

    try {

        const method =
            await getCostBasisMethodService();

        res.json({
            success: true,
            data: method
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

export const updateMethod = async (req, res) => {

    try {

        const { method } = req.body;

        if (
            !["FIFO", "LIFO", "HIFO"].includes(
                method.toUpperCase()
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Method must be FIFO, LIFO or HIFO"
            });

        }

        const updated =
            await updateCostBasisMethodService(
                method
            );

        res.json({
            success: true,
            data: updated
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};