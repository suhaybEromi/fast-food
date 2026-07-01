import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    audience: {
      type: String,
      enum: ["admin", "customer"],
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    type: {
      type: String,
      enum: ["order_placed", "order_status"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ audience: 1, recipient: 1, read: 1, createdAt: -1 });

export default model("Notification", notificationSchema);
