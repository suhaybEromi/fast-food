import bcrypt from "bcryptjs";
import { Schema, model } from "mongoose";

const addressSchema = new Schema(
  {
    label: { type: String, default: "Home", trim: true, maxlength: 40 },
    recipientName: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    address: { type: String, required: true, trim: true, maxlength: 220 },
    location: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 },
      label: { type: String, default: "", trim: true, maxlength: 120 },
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const customerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    address: { type: String, default: "", trim: true },
    addresses: { type: [addressSchema], default: [] },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Food" }],
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["customer"],
      default: "customer",
    },

    refreshTokenHash: { type: String, default: "", select: false },
  },
  { timestamps: true },
);

customerSchema.index({ wishlist: 1 });

customerSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

customerSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

customerSchema.methods.toJSON = function toJSON() {
  const customer = this.toObject();
  delete customer.password;
  return customer;
};

export default model("Customer", customerSchema);
