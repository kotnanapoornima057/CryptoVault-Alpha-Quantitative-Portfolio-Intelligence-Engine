import { getAssetsService } from "../services/assetService.js";

export const getAssets = async (req, res) => {
  try {
    const assets = await getAssetsService(req.user.id);

    res.status(200).json({
      success: true,
      count: assets.length,
      data: assets,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};