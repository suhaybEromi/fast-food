import asyncHandler from "../../middlewares/asyncHandler.js";
import Banner from "../../models/banner.js";
import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import { logAudit } from "../../utils/audit.js";
import {
  createHttpError,
  optionalString,
  requireEnum,
  requireNumber,
  requireString,
} from "../../utils/validation.js";

const getBanners = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [banners, total] = await Promise.all([
    Banner.find().sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit),
    Banner.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: banners,
    meta: getPaginationMeta({ page, limit, total }),
  });
});

const cleanBannerPayload = (payload, file) => {
  const mediaType = requireEnum(
    payload.mediaType || "image",
    ["image", "video"],
    "Media type",
  );
  const uploadedMedia = file ? `/uploads/${file.filename}` : "";

  return {
    title: requireString(payload.title, "Banner title", 90),
    subtitle: optionalString(payload.subtitle, 180),
    mediaType,
    image:
      mediaType === "image" ? uploadedMedia || payload.image || "" : "",
    video:
      mediaType === "video" ? uploadedMedia || payload.video || "" : "",
    link: optionalString(payload.link, 240),
    sortOrder: payload.sortOrder
      ? requireNumber(payload.sortOrder, "Sort order", {
          min: -1000,
          max: 1000,
        })
      : 0,
    status: requireEnum(
      payload.status || "active",
      ["active", "inactive"],
      "Status",
    ),
  };
};

const createBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.create(cleanBannerPayload(req.body, req.file));
  await logAudit(req, "create", "banner", {
    resourceId: banner._id,
    message: `Created banner ${banner.title}`,
  });

  res.status(201).json({
    success: true,
    message: "Banner created",
    data: banner,
  });
});

const updateBanner = asyncHandler(async (req, res) => {
  const current = await Banner.findById(req.params.id);

  if (!current) {
    throw createHttpError("Banner not found", 404);
  }

  const update = cleanBannerPayload(
    { ...current.toObject(), ...req.body },
    req.file,
  );
  const banner = await Banner.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });

  await logAudit(req, "update", "banner", {
    resourceId: banner._id,
    message: `Updated banner ${banner.title}`,
  });

  res.status(200).json({
    success: true,
    message: "Banner updated",
    data: banner,
  });
});

const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);

  if (!banner) {
    throw createHttpError("Banner not found", 404);
  }

  await logAudit(req, "delete", "banner", {
    resourceId: banner._id,
    message: `Deleted banner ${banner.title}`,
  });

  res.status(200).json({
    success: true,
    message: "Banner deleted",
  });
});

export default { getBanners, createBanner, updateBanner, deleteBanner };
