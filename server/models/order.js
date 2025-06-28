const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    items: [
      {
        foodId: { type: Schema.Types.ObjectId, ref: "Food" },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
      },
    ],
    message: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
