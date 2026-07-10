import { getAssetQueueService } from "../services/queueService.js";

export const getAssetQueue = async (req, res) => {

    try {

        const queue =
            await getAssetQueueService();

        res.status(200).json({

            success: true,

            data: queue

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