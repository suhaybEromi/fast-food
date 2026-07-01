import asyncHandler from "../../middlewares/asyncHandler.js";
import Notification from "../../models/notification.js";
import Order from "../../models/order.js";

const getOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find()
    .populate("customerAccount", "name email phone")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: orders,
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const allowed = ["pending", "preparing", "ready", "delivered", "cancelled"];

  if (!allowed.includes(status)) {
    const error = new Error("Invalid order status");
    error.status = 400;
    throw error;
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true },
  );

  if (!order) {
    const error = new Error("Order not found");
    error.status = 404;
    throw error;
  }

  if (order.customerAccount) {
    await Notification.create({
      audience: "customer",
      recipient: order.customerAccount,
      order: order._id,
      type: "order_status",
      title: "Order status updated",
      message: `Order ${order.orderNumber} is now ${status}.`,
    });
  }

  res.status(200).json({
    success: true,
    message: "Order status updated",
    data: order,
  });
});

const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;

  const allowed = ["unpaid", "paid", "refunded"];

  if (!allowed.includes(paymentStatus)) {
    const error = new Error("Invalid payment status");
    error.status = 400;
    throw error;
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { paymentStatus },
    { new: true, runValidators: true },
  );

  if (!order) {
    const error = new Error("Order not found");
    error.status = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "Payment status updated",
    data: order,
  });
});

export default { getOrders, updateOrderStatus, updatePaymentStatus };
