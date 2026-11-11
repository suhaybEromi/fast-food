import asyncHandler from "../../middlewares/asyncHandler.js";
import DeliveryZone from "../../models/deliveryZone.js";
import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import { logAudit } from "../../utils/audit.js";
import {
  createHttpError,
  optionalString,
  requireEnum,
  requireNumber,
  requireString,
} from "../../utils/validation.js";

const cleanPayload = payload => ({
  name: requireString(payload.name, "Zone name", 80),
  description: optionalString(payload.description, 240),
  deliveryFee: requireNumber(payload.deliveryFee, "Delivery fee", {
    min: 0,
    max: 1000000,
  }),
  minOrder: payload.minOrder
    ? requireNumber(payload.minOrder, "Minimum order", { min: 0, max: 10000000 })
    : 0,
  estimatedMinutes: payload.estimatedMinutes
    ? requireNumber(payload.estimatedMinutes, "Estimated minutes", {
        min: 1,
        max: 240,
      })
    : 30,
  center: {
    lat:
      (payload.lat !== undefined && payload.lat !== "") ||
      payload.center?.lat !== undefined
        ? requireNumber(payload.lat ?? payload.center.lat, "Latitude", {
            min: -90,
            max: 90,
          })
        : undefined,
    lng:
      (payload.lng !== undefined && payload.lng !== "") ||
      payload.center?.lng !== undefined
        ? requireNumber(payload.lng ?? payload.center.lng, "Longitude", {
            min: -180,
            max: 180,
          })
        : undefined,
  },
  radiusKm: payload.radiusKm
    ? requireNumber(payload.radiusKm, "Radius", { min: 0, max: 1000 })
    : 0,
  status: requireEnum(payload.status || "active", ["active", "inactive"], "Status"),
});

const getZones = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [zones, total] = await Promise.all([
    DeliveryZone.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    DeliveryZone.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: zones,
    meta: getPaginationMeta({ page, limit, total }),
  });
});

const createZone = asyncHandler(async (req, res) => {
  const zone = await DeliveryZone.create(cleanPayload(req.body));
  await logAudit(req, "create", "delivery_zone", {
    resourceId: zone._id,
    message: `Created delivery zone ${zone.name}`,
  });

  res.status(201).json({ success: true, message: "Zone created", data: zone });
});

const updateZone = asyncHandler(async (req, res) => {
  const zone = await DeliveryZone.findByIdAndUpdate(
    req.params.id,
    cleanPayload(req.body),
    { new: true, runValidators: true },
  );

  if (!zone) {
    throw createHttpError("Delivery zone not found", 404);
  }

  await logAudit(req, "update", "delivery_zone", {
    resourceId: zone._id,
    message: `Updated delivery zone ${zone.name}`,
  });

  res.status(200).json({ success: true, message: "Zone updated", data: zone });
});

const deleteZone = asyncHandler(async (req, res) => {
  const zone = await DeliveryZone.findByIdAndDelete(req.params.id);

  if (!zone) {
    throw createHttpError("Delivery zone not found", 404);
  }

  await logAudit(req, "delete", "delivery_zone", {
    resourceId: zone._id,
    message: `Deleted delivery zone ${zone.name}`,
  });

  res.status(200).json({ success: true, message: "Zone deleted" });
});

export default { getZones, createZone, updateZone, deleteZone };
