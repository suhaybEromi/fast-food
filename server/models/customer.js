import bcrypt from "bcryptjs";
import { Schema, model } from "mongoose";

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
  },
  { timestamps: true },
);

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
