import asyncHandler from "../../middlewares/asyncHandler.js";
import Driver from "../../models/driver.js";
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
  name: requireString(payload.name, "Driver name", 80),
  phone: requireString(payload.phone, "Driver phone", 30),
  vehicle: optionalString(payload.vehicle, 80),
  zone: payload.zone || undefined,
  currentLocation: {
    lat:
      (payload.lat !== undefined && payload.lat !== "") ||
      payload.currentLocation?.lat !== undefined
        ? requireNumber(payload.lat ?? payload.currentLocation.lat, "Latitude", {
            min: -90,
            max: 90,
          })
        : undefined,
    lng:
      (payload.lng !== undefined && payload.lng !== "") ||
      payload.currentLocation?.lng !== undefined
        ? requireNumber(payload.lng ?? payload.currentLocation.lng, "Longitude", {
            min: -180,
            max: 180,
          })
        : undefined,
    updatedAt: new Date(),
  },
  status: requireEnum(
    payload.status || "available",
    ["available", "busy", "offline"],
    "Status",
  ),
});

const getDrivers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [drivers, total] = await Promise.all([
    Driver.find()
      .populate("zone", "name deliveryFee estimatedMinutes")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Driver.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: drivers,
    meta: getPaginationMeta({ page, limit, total }),
  });
});

const createDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.create(cleanPayload(req.body));
  await logAudit(req, "create", "driver", {
    resourceId: driver._id,
    message: `Created driver ${driver.name}`,
  });

  res.status(201).json({ success: true, message: "Driver created", data: driver });
});

const updateDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.findByIdAndUpdate(
    req.params.id,
    cleanPayload(req.body),
    { new: true, runValidators: true },
  ).populate("zone", "name deliveryFee estimatedMinutes");

  if (!driver) {
    throw createHttpError("Driver not found", 404);
  }

  await logAudit(req, "update", "driver", {
    resourceId: driver._id,
    message: `Updated driver ${driver.name}`,
  });

  res.status(200).json({ success: true, message: "Driver updated", data: driver });
});

const deleteDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.findByIdAndDelete(req.params.id);

  if (!driver) {
    throw createHttpError("Driver not found", 404);
  }

  await logAudit(req, "delete", "driver", {
    resourceId: driver._id,
    message: `Deleted driver ${driver.name}`,
  });

  res.status(200).json({ success: true, message: "Driver deleted" });
});

export default { getDrivers, createDriver, updateDriver, deleteDriver };
