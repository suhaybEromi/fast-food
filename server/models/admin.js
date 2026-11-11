import bcrypt from "bcryptjs";
import { Schema, model } from "mongoose";

const adminSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 12,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "super_admin", "manager", "staff"],
      default: "staff",
    },

    refreshTokenHash: { type: String, select: false, default: "" },
  },
  { timestamps: true },
);

adminSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

adminSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

adminSchema.methods.toJSON = function toJSON() {
  const admin = this.toObject();
  delete admin.password;
  return admin;
};

export default model("Admin", adminSchema);
