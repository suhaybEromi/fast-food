import asyncHandler from "../../middlewares/asyncHandler.js";
import DeliveryZone from "../../models/deliveryZone.js";

const getZones = asyncHandler(async (_req, res) => {
  const zones = await DeliveryZone.find({ status: "active" }).sort({
    deliveryFee: 1,
    name: 1,
  });

  res.status(200).json({
    success: true,
    data: zones,
  });
});

export default { getZones };
