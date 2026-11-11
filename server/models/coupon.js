import { Schema, model } from "mongoose";

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 32,
    },
    percentage: { type: Number, required: true, min: 1, max: 90 },
    expiresAt: { type: Date, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    usageLimit: { type: Number, default: 0, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

couponSchema.index({ status: 1, expiresAt: 1 });

export default model("Coupon", couponSchema);
