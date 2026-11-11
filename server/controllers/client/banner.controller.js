import asyncHandler from "../../middlewares/asyncHandler.js";
import Banner from "../../models/banner.js";

const getBanners = asyncHandler(async (_req, res) => {
  const banners = await Banner.find({ status: "active" })
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    data: banners,
  });
});

export default { getBanners };
