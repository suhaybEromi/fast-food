import { Schema, model } from "mongoose";

const driverSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    vehicle: { type: String, default: "", trim: true, maxlength: 80 },
    zone: { type: Schema.Types.ObjectId, ref: "DeliveryZone" },
    currentLocation: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 },
      updatedAt: { type: Date },
    },
    status: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "available",
    },
  },
  { timestamps: true },
);

driverSchema.index({ status: 1, zone: 1 });

export default model("Driver", driverSchema);
