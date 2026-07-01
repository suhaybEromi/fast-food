import asyncHandler from "../../middlewares/asyncHandler.js";
import Notification from "../../models/notification.js";
import Order from "../../models/order.js";

const makeOrderNumber = () =>
  `FF-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 90 + 10)}`;

const createOrder = asyncHandler(async (req, res) => {
  const {
    customer = {},
    items = [],
    orderType = "delivery",
    paymentMethod = "cash",
    deliveryFee = 0,
    serviceFee = 0,
    notes = "",
  } = req.body;

  const customerSnapshot = {
    name: customer.name || req.customer.name,
    phone: customer.phone || req.customer.phone,
    email: req.customer.email,
    address:
      orderType === "pickup"
        ? "Pickup counter"
        : customer.address || req.customer.address || "",
  };

  if (!customerSnapshot.name || !customerSnapshot.phone) {
    const error = new Error("Customer name and phone are required");
    error.status = 400;
    throw error;
  }

  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error("Order must contain at least one item");
    error.status = 400;
    throw error;
  }

  const cleanItems = items.map(item => ({
    food: item.food || undefined,
    title: item.title,
    image: item.image || "",
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
  }));

  const subtotal = cleanItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = subtotal + Number(deliveryFee) + Number(serviceFee);

  const order = await Order.create({
    orderNumber: makeOrderNumber(),
    customerAccount: req.customer._id,
    customer: customerSnapshot,
    items: cleanItems,
    orderType,
    paymentMethod,
    deliveryFee,
    serviceFee,
    subtotal,
    total,
    notes,
  });

  await Notification.create({
    audience: "admin",
    order: order._id,
    type: "order_placed",
    title: "New order placed",
    message: `${customerSnapshot.name} placed order ${order.orderNumber}.`,
  });

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    data: order,
  });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customerAccount: req.customer._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    data: orders,
  });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    customerAccount: req.customer._id,
  });

  if (!order) {
    const error = new Error("Order not found");
    error.status = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

export default { createOrder, getMyOrders, getOrder };
