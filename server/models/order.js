import { Schema, model } from "mongoose";

const orderItemSchema = new Schema(
  {
    food: { type: Schema.Types.ObjectId, ref: "Food" },
    title: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    reviewed: { type: Boolean, default: false },
  },
  { _id: false },
);

const trackingEventSchema = new Schema(
  {
    status: {
      type: String,
      enum: [
        "pending",
        "preparing",
        "ready",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      required: true,
    },
    message: { type: String, required: true, trim: true },
    at: { type: Date, default: Date.now },
    by: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, trim: true },
    customerAccount: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, default: "", trim: true, lowercase: true },
      address: { type: String, default: "", trim: true },
    },
    items: {
      type: [orderItemSchema],
      validate: value => value.length > 0,
    },
    orderType: {
      type: String,
      enum: ["delivery", "pickup"],
      default: "delivery",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "wallet"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "preparing",
        "ready",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    deliveryZone: { type: Schema.Types.ObjectId, ref: "DeliveryZone" },
    deliveryZoneSnapshot: {
      name: { type: String, default: "", trim: true },
      estimatedMinutes: { type: Number, default: 0, min: 0 },
    },
    driver: { type: Schema.Types.ObjectId, ref: "Driver" },
    driverSnapshot: {
      name: { type: String, default: "", trim: true },
      phone: { type: String, default: "", trim: true },
      vehicle: { type: String, default: "", trim: true },
    },
    deliveryLocation: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 },
      label: { type: String, default: "", trim: true, maxlength: 120 },
    },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    serviceFee: { type: Number, default: 0, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String, default: "", trim: true, uppercase: true },
    loyaltyPointsRedeemed: { type: Number, default: 0, min: 0 },
    loyaltyDiscount: { type: Number, default: 0, min: 0 },
    loyaltyPointsEarned: { type: Number, default: 0, min: 0 },
    loyaltyAwarded: { type: Boolean, default: false },
    total: { type: Number, required: true, min: 0 },
    notes: { type: String, default: "", trim: true },
    trackingEvents: { type: [trackingEventSchema], default: [] },
  },
  { timestamps: true },
);

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ customerAccount: 1, createdAt: -1 });

export default model("Order", orderSchema);
