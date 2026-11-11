import { Schema, model } from "mongoose";

const deliveryZoneSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
    description: { type: String, default: "", trim: true, maxlength: 240 },
    deliveryFee: { type: Number, required: true, min: 0 },
    minOrder: { type: Number, default: 0, min: 0 },
    estimatedMinutes: { type: Number, default: 30, min: 1, max: 240 },
    center: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 },
    },
    radiusKm: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

deliveryZoneSchema.index({ status: 1, deliveryFee: 1 });

export default model("DeliveryZone", deliveryZoneSchema);
