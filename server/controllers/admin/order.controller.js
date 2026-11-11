import asyncHandler from "../../middlewares/asyncHandler.js";
import Customer from "../../models/customer.js";
import Driver from "../../models/driver.js";
import Food from "../../models/food.js";
import Notification from "../../models/notification.js";
import Order from "../../models/order.js";
import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import { logAudit } from "../../utils/audit.js";
import { createHttpError, requireEnum } from "../../utils/validation.js";

const getOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const filter = {};

  if (
    [
      "pending",
      "preparing",
      "ready",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ].includes(req.query.status)
  ) {
    filter.status = req.query.status;
  }

  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: "i" } },
      { "customer.name": { $regex: search, $options: "i" } },
      { "customer.phone": { $regex: search, $options: "i" } },
      { "customer.email": { $regex: search, $options: "i" } },
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("customerAccount", "name email phone addresses")
      .populate("driver", "name phone vehicle status currentLocation")
      .populate("deliveryZone", "name deliveryFee estimatedMinutes")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: orders,
    meta: getPaginationMeta({ page, limit, total }),
  });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "customerAccount",
    "name email phone addresses loyaltyPoints",
  ).populate("driver", "name phone vehicle status currentLocation");

  if (!order) {
    throw createHttpError("Order not found", 404);
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const allowed = [
    "pending",
    "preparing",
    "ready",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ];
  const status = requireEnum(req.body.status, allowed, "Order status");

  const currentOrder = await Order.findById(req.params.id);

  if (!currentOrder) {
    throw createHttpError("Order not found", 404);
  }

  if (
    status === "cancelled" &&
    currentOrder.status !== "cancelled" &&
    currentOrder.status !== "delivered"
  ) {
    await Promise.all(
      currentOrder.items
        .filter(item => item.food)
        .map(item =>
          Food.updateOne(
            { _id: item.food },
            { $inc: { stock: item.quantity } },
          ),
        ),
    );
  }

  currentOrder.status = status;
  currentOrder.trackingEvents.push({
    status,
    message: `Order is now ${status.replaceAll("_", " ")}.`,
    by: req.admin._id,
  });

  if (
    status === "delivered" &&
    !currentOrder.loyaltyAwarded &&
    currentOrder.customerAccount
  ) {
    const earned = currentOrder.loyaltyPointsEarned || Math.floor(currentOrder.total / 1000);
    await Customer.findByIdAndUpdate(currentOrder.customerAccount, {
      $inc: { loyaltyPoints: earned },
    });
    currentOrder.loyaltyPointsEarned = earned;
    currentOrder.loyaltyAwarded = true;
  }

  if (currentOrder.driver && status === "out_for_delivery") {
    await Driver.findByIdAndUpdate(currentOrder.driver, { status: "busy" });
  }

  if (
    currentOrder.driver &&
    ["delivered", "cancelled"].includes(status)
  ) {
    await Driver.findByIdAndUpdate(currentOrder.driver, { status: "available" });
  }

  const order = await currentOrder.save();

  if (!order) {
    throw createHttpError("Order not found", 404);
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

  await logAudit(req, "update_status", "order", {
    resourceId: order._id,
    message: `Changed order ${order.orderNumber} to ${status}`,
  });

  res.status(200).json({
    success: true,
    message: "Order status updated",
    data: order,
  });
});

const assignDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.body.driverId);

  if (!driver) {
    throw createHttpError("Driver not found", 404);
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw createHttpError("Order not found", 404);
  }

  order.driver = driver._id;
  order.driverSnapshot = {
    name: driver.name,
    phone: driver.phone,
    vehicle: driver.vehicle,
  };
  order.trackingEvents.push({
    status: order.status,
    message: `${driver.name} was assigned to this delivery.`,
    by: req.admin._id,
  });
  await order.save();

  driver.status = "busy";
  await driver.save();

  await Notification.create({
    audience: "customer",
    recipient: order.customerAccount,
    order: order._id,
    type: "order_status",
    title: "Driver assigned",
    message: `${driver.name} is assigned to order ${order.orderNumber}.`,
  });

  await logAudit(req, "assign_driver", "order", {
    resourceId: order._id,
    message: `Assigned ${driver.name} to ${order.orderNumber}`,
  });

  res.status(200).json({
    success: true,
    message: "Driver assigned",
    data: order,
  });
});

const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;

  const allowed = ["unpaid", "paid", "refunded"];

  if (!allowed.includes(paymentStatus)) {
    throw createHttpError("Invalid payment status");
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { paymentStatus },
    { new: true, runValidators: true },
  );

  if (!order) {
    throw createHttpError("Order not found", 404);
  }

  await logAudit(req, "update_payment", "order", {
    resourceId: order._id,
    message: `Changed payment for ${order.orderNumber} to ${paymentStatus}`,
  });

  res.status(200).json({
    success: true,
    message: "Payment status updated",
    data: order,
  });
});

export default {
  getOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
  assignDriver,
};
