import asyncHandler from "../../middlewares/asyncHandler.js";
import Coupon from "../../models/coupon.js";
import {
  createHttpError,
  normalizeCouponCode,
} from "../../utils/validation.js";

const getCoupon = asyncHandler(async (req, res) => {
  const code = normalizeCouponCode(req.params.code);

  if (!code) {
    throw createHttpError("Coupon code is required");
  }

  const coupon = await Coupon.findOne({
    code,
    status: "active",
    expiresAt: { $gt: new Date() },
  });

  if (
    !coupon ||
    (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit)
  ) {
    throw createHttpError("Coupon is invalid or expired", 404);
  }

  res.status(200).json({
    success: true,
    data: {
      code: coupon.code,
      percentage: coupon.percentage,
      expiresAt: coupon.expiresAt,
    },
  });
});

export default { getCoupon };
