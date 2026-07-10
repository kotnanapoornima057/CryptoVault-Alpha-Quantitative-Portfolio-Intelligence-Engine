import {
    getChatHistoryService
} from "../services/aiHistoryService.js";

export const getChatHistory = async (req, res) => {

    try {

        const history =
            await getChatHistoryService(
                req.user.id
            );

        res.status(200).json({

            success: true,

            data: history

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