import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    title: { type: String, required: true, unique: true, trim: true },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    image: { type: String, default: "" },

    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

export default model("Category", categorySchema);
