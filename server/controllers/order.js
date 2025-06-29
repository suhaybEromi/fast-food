const Order = require("../models/order");
const Cart = require("../models/cart");
const createError = require("../middlewares/createError");

exports.getOrders = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const orders = await Order.find({ userId })
      .populate("items.foodId", "name price quantity totalPrice")
      .exec();
    return res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

exports.createOrder = async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) return next(createError(400, "User ID is required"));

  try {
    const cart = await Cart.findOne({ userId }).populate("items.foodId");

    if (!cart || cart.items.length === 0)
      return next(createError(400, "Cart is empty"));

    const orderItems = cart.items.map(item => ({
      foodId: item.foodId._id,
      name: item.foodId.name,
      quantity: item.quantity,
      price: item.foodId.price,
      totalPrice: item.totalPrice,
    }));

    const message = orderItems
      .map(i => `${i.name} x${i.quantity} = ${i.totalPrice} IQD`)
      .join("\n");

    const newOrder = new Order({ userId, items: orderItems, message });
    await newOrder.save();

    cart.items = [];
    await cart.save();

    res.status(201).json({ message: "Order placed", orderId: newOrder._id });
  } catch (error) {
    next(error);
  }
};
