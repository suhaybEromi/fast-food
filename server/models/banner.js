import { Schema, model } from "mongoose";

const bannerSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 90 },
    subtitle: { type: String, default: "", trim: true, maxlength: 180 },
    image: { type: String, default: "" },
    video: { type: String, default: "" },
    mediaType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    link: { type: String, default: "", trim: true, maxlength: 240 },
    sortOrder: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

bannerSchema.index({ status: 1, sortOrder: 1 });

export default model("Banner", bannerSchema);
