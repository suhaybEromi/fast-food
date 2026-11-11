import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    food: { type: Schema.Types.ObjectId, ref: "Food", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

reviewSchema.index({ food: 1, createdAt: -1 });
reviewSchema.index({ customer: 1, food: 1, order: 1 }, { unique: true });

export default model("Review", reviewSchema);
