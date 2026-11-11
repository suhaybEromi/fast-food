import asyncHandler from "../../middlewares/asyncHandler.js";
import Coupon from "../../models/coupon.js";
import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import { logAudit } from "../../utils/audit.js";
import {
  createHttpError,
  normalizeCouponCode,
  requireEnum,
  requireNumber,
  requireString,
} from "../../utils/validation.js";

const getCoupons = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (["active", "inactive"].includes(req.query.status)) {
    filter.status = req.query.status;
  }

  const [coupons, total] = await Promise.all([
    Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Coupon.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: coupons,
    meta: getPaginationMeta({ page, limit, total }),
  });
});

const cleanCouponPayload = payload => {
  const expiresAt = new Date(payload.expiresAt);

  if (Number.isNaN(expiresAt.getTime())) {
    throw createHttpError("Expiry date is invalid");
  }

  return {
    code: normalizeCouponCode(requireString(payload.code, "Coupon code", 32)),
    percentage: requireNumber(payload.percentage, "Percentage", {
      min: 1,
      max: 90,
    }),
    expiresAt,
    status: requireEnum(payload.status || "active", ["active", "inactive"], "Status"),
    usageLimit: payload.usageLimit
      ? requireNumber(payload.usageLimit, "Usage limit", { min: 0, max: 100000 })
      : 0,
  };
};

const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(cleanCouponPayload(req.body));
  await logAudit(req, "create", "coupon", {
    resourceId: coupon._id,
    message: `Created coupon ${coupon.code}`,
  });

  res.status(201).json({
    success: true,
    message: "Coupon created",
    data: coupon,
  });
});

const updateCoupon = asyncHandler(async (req, res) => {
  const update = cleanCouponPayload(req.body);
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });

  if (!coupon) {
    throw createHttpError("Coupon not found", 404);
  }

  await logAudit(req, "update", "coupon", {
    resourceId: coupon._id,
    message: `Updated coupon ${coupon.code}`,
  });

  res.status(200).json({
    success: true,
    message: "Coupon updated",
    data: coupon,
  });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);

  if (!coupon) {
    throw createHttpError("Coupon not found", 404);
  }

  await logAudit(req, "delete", "coupon", {
    resourceId: coupon._id,
    message: `Deleted coupon ${coupon.code}`,
  });

  res.status(200).json({
    success: true,
    message: "Coupon deleted",
  });
});

export default { getCoupons, createCoupon, updateCoupon, deleteCoupon };
