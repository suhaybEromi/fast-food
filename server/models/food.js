import { Schema, model } from "mongoose";

const foodSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: { type: String, default: "" },

    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },

    price: { type: Number, required: true, min: 0 },

    image: { type: String, default: "" },

    stock: { type: Number, default: 0, min: 0 },

    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

foodSchema.index({ category: 1 });

export default model("Food", foodSchema);
