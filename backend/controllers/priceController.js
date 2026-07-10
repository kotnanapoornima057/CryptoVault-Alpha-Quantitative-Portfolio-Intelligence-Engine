import { getLivePricesService } from "../services/priceService.js";

export const getLivePrices = async (req, res) => {

    try {

        const prices = await getLivePricesService();

        res.json({

            success: true,

            data: prices

        });

    }
    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: "Unable to fetch live prices."

        });

    }

};