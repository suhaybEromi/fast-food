const Order = require("../models/order");
const Cart = require("../models/cart");

exports.getOrders = async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await Order.find({ userId })
      .populate("items.foodId", "name price quantity totalPrice")
      .exec();
    return res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.createOrder = async (req, res) => {
  const { userId } = req.body;

  try {
    const cart = await Cart.findOne({ userId }).populate("items.foodId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

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
    console.error("Error creating order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
