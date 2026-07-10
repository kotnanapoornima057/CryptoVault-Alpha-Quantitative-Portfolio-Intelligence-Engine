import { getAIResponseService } from "../services/aiService.js";

import {
    getChatHistoryService,
    deleteChatService
} from "../services/aiHistoryService.js";

export const deleteChat = async (req, res) => {

    try {

        const { id } = req.params;

        const deletedChat =
            await deleteChatService(
                req.user.id,
                id
            );

        if (!deletedChat) {

            return res.status(404).json({

                success: false,

                message: "Chat not found."

            });

        }

        res.json({

            success: true,

            message: "Chat deleted successfully."

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

};
export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required."
      });
    }

    const response =
    await getAIResponseService(
        message,
        req.user.id
    );

    res.status(200).json({
      success: true,
      response
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });

  }
};

export const getChatHistory = async (req, res) => {

    try {

        const history = await getChatHistoryService(req.user.id);

        res.status(200).json({
            success: true,
            data: history
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};