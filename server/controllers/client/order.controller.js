import asyncHandler from "../../middlewares/asyncHandler.js";
import Customer from "../../models/customer.js";
import Coupon from "../../models/coupon.js";
import DeliveryZone from "../../models/deliveryZone.js";
import Food from "../../models/food.js";
import Notification from "../../models/notification.js";
import Order from "../../models/order.js";
import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import {
  createHttpError,
  normalizeCouponCode,
  optionalString,
  requireEnum,
  requireNumber,
  requireObjectId,
  requireString,
} from "../../utils/validation.js";

const makeOrderNumber = () =>
  `FF-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 90 + 10)}`;

const calculateDeliveryFee = (orderType, subtotal) => {
  if (orderType === "pickup" || subtotal === 0 || subtotal >= 25000) {
    return 0;
  }

  return 2000;
};

const calculateServiceFee = subtotal =>
  subtotal > 0 ? Math.round(subtotal * 0.03) : 0;

const normalizeOrderItems = items => {
  if (!Array.isArray(items) || items.length === 0) {
    throw createHttpError("Order must contain at least one item");
  }

  const itemMap = new Map();

  items.forEach(item => {
    const foodId = requireObjectId(item.food || item.id, "Food");
    const quantity = Math.floor(
      requireNumber(item.quantity, "Quantity", { min: 1, max: 99 }),
    );
    itemMap.set(foodId, (itemMap.get(foodId) || 0) + quantity);
  });

  return Array.from(itemMap, ([food, quantity]) => ({ food, quantity }));
};

const getActiveCoupon = async code => {
  const couponCode = normalizeCouponCode(code);

  if (!couponCode) {
    return null;
  }

  const coupon = await Coupon.findOne({
    code: couponCode,
    status: "active",
    expiresAt: { $gt: new Date() },
  });

  if (
    !coupon ||
    (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit)
  ) {
    throw createHttpError("Coupon is invalid or expired", 400);
  }

  return coupon;
};

const normalizeLocation = location => {
  if (!location) {
    return undefined;
  }

  const lat = Number(location.lat);
  const lng = Number(location.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return undefined;
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return undefined;
  }

  return {
    lat,
    lng,
    label: optionalString(location.label, 120),
  };
};

const createOrder = asyncHandler(async (req, res) => {
  const {
    customer = {},
    items = [],
    orderType = "delivery",
    paymentMethod = "cash",
    couponCode = "",
    deliveryZone,
    deliveryLocation,
    redeemPoints = 0,
    notes = "",
  } = req.body;

  const cleanOrderType = requireEnum(
    orderType,
    ["delivery", "pickup"],
    "Order type",
  );
  const cleanPaymentMethod = requireEnum(
    paymentMethod,
    ["cash", "card", "wallet"],
    "Payment method",
  );
  const cleanItems = normalizeOrderItems(items);

  const customerSnapshot = {
    name: requireString(
      customer.name || req.customer.name,
      "Customer name",
      80,
    ),
    phone: requireString(
      customer.phone || req.customer.phone,
      "Customer phone",
      30,
    ),
    email: req.customer.email,
    address:
      cleanOrderType === "pickup"
        ? "Pickup counter"
        : requireString(
            customer.address || req.customer.address,
            "Delivery address",
            220,
          ),
  };

  const selectedZone =
    cleanOrderType === "delivery" && deliveryZone
      ? await DeliveryZone.findOne({
          _id: deliveryZone,
          status: "active",
        })
      : null;

  const foods = await Food.find({
    _id: { $in: cleanItems.map(item => item.food) },
    status: "active",
  });
  const foodMap = new Map(foods.map(food => [food._id.toString(), food]));

  const orderItems = cleanItems.map(item => {
    const food = foodMap.get(item.food.toString());

    if (!food) {
      throw createHttpError(
        "One or more products are no longer available",
        400,
      );
    }

    if (food.stock < item.quantity) {
      throw createHttpError(`${food.title} only has ${food.stock} left`, 400);
    }

    return {
      food: food._id,
      title: food.title,
      image: food.image || "",
      price: food.price,
      quantity: item.quantity,
    };
  });

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if (selectedZone && selectedZone.minOrder > subtotal) {
    throw createHttpError(
      `${selectedZone.name} requires a minimum order of ${selectedZone.minOrder}`,
      400,
    );
  }

  const deliveryFee =
    cleanOrderType === "delivery" && selectedZone
      ? selectedZone.deliveryFee
      : calculateDeliveryFee(cleanOrderType, subtotal);
  const serviceFee = calculateServiceFee(subtotal);
  const coupon = await getActiveCoupon(couponCode);
  const discountAmount = coupon
    ? Math.min(subtotal, Math.round((subtotal * coupon.percentage) / 100))
    : 0;
  const customerAccount = await Customer.findById(req.customer._id);
  const cleanRedeemPoints = Math.floor(
    Math.min(
      requireNumber(redeemPoints, "Loyalty points", { min: 0, max: 1000000 }),
      customerAccount.loyaltyPoints,
    ),
  );
  const loyaltyDiscount = Math.min(cleanRedeemPoints * 50, subtotal);
  const total = Math.max(
    0,
    subtotal + deliveryFee + serviceFee - discountAmount - loyaltyDiscount,
  );

  const reservedItems = [];

  for (const item of orderItems) {
    const result = await Food.updateOne(
      { _id: item.food, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity, soldCount: item.quantity } },
    );

    if (result.modifiedCount !== 1) {
      for (const reservedItem of reservedItems) {
        await Food.updateOne(
          { _id: reservedItem.food },
          {
            $inc: {
              stock: reservedItem.quantity,
              soldCount: -reservedItem.quantity,
            },
          },
        );
      }

      throw createHttpError(`${item.title} is no longer available`, 409);
    }

    reservedItems.push(item);
  }

  let order;

  try {
    order = await Order.create({
      orderNumber: makeOrderNumber(),
      customerAccount: req.customer._id,
      customer: customerSnapshot,
      items: orderItems,
      orderType: cleanOrderType,
      paymentMethod: cleanPaymentMethod,
      deliveryZone: selectedZone?._id,
      deliveryZoneSnapshot: selectedZone
        ? {
            name: selectedZone.name,
            estimatedMinutes: selectedZone.estimatedMinutes,
          }
        : undefined,
      deliveryLocation: normalizeLocation(deliveryLocation),
      deliveryFee,
      serviceFee,
      discountAmount,
      couponCode: coupon?.code || "",
      loyaltyPointsRedeemed: cleanRedeemPoints,
      loyaltyDiscount,
      loyaltyPointsEarned: Math.floor(total / 1000),
      subtotal,
      total,
      notes: optionalString(notes, 500),
      trackingEvents: [
        {
          status: "pending",
          message: "Order received and waiting for kitchen confirmation.",
        },
      ],
    });

    if (coupon) {
      await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } });
    }

    if (cleanRedeemPoints > 0) {
      customerAccount.loyaltyPoints -= cleanRedeemPoints;
      await customerAccount.save();
    }
  } catch (error) {
    for (const reservedItem of reservedItems) {
      await Food.updateOne(
        { _id: reservedItem.food },
        {
          $inc: {
            stock: reservedItem.quantity,
            soldCount: -reservedItem.quantity,
          },
        },
      );
    }

    throw error;
  }

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
  const { page, limit, skip } = getPagination(req.query);
  const filter = { customerAccount: req.customer._id };
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: orders,
    meta: getPaginationMeta({ page, limit, total }),
  });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    customerAccount: req.customer._id,
  })
    .populate("driver", "name phone vehicle status currentLocation")
    .populate("deliveryZone", "name deliveryFee estimatedMinutes");

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

const reorder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    customerAccount: req.customer._id,
  });

  if (!order) {
    throw createHttpError("Order not found", 404);
  }

  const foods = await Food.find({
    _id: { $in: order.items.map(item => item.food).filter(Boolean) },
    status: "active",
  }).populate("category", "title slug");

  res.status(200).json({
    success: true,
    data: foods.map(food => {
      const previousItem = order.items.find(
        item => item.food?.toString() === food._id.toString(),
      );

      return {
        _id: food._id,
        title: food.title,
        image: food.image,
        category: food.category,
        price: food.price,
        stock: food.stock,
        quantity: Math.min(previousItem?.quantity || 1, food.stock || 1),
      };
    }),
  });
});

const streamOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    customerAccount: req.customer._id,
  });

  if (!order) {
    throw createHttpError("Order not found", 404);
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  const sendOrder = async () => {
    const nextOrder = await Order.findById(order._id)
      .populate("driver", "name phone vehicle status currentLocation")
      .populate("deliveryZone", "name deliveryFee estimatedMinutes");

    res.write(`event: order\n`);
    res.write(`data: ${JSON.stringify(nextOrder)}\n\n`);
  };

  await sendOrder();
  const intervalId = setInterval(sendOrder, 5000);

  req.on("close", () => {
    clearInterval(intervalId);
    res.end();
  });
});

export default { createOrder, getMyOrders, getOrder, reorder, streamOrder };
