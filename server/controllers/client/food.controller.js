import asyncHandler from "../../middlewares/asyncHandler.js";
import mongoose from "mongoose";
import Food from "../../models/food.js";
import Order from "../../models/order.js";
import Review from "../../models/review.js";
import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import {
  createHttpError,
  optionalString,
  requireNumber,
  requireObjectId,
} from "../../utils/validation.js";

const getFoods = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const search = optionalString(req.query.search, 80);
  const filter = { status: "active" };

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const [foods, total] = await Promise.all([
    Food.find(filter)
      .populate("category", "title slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Food.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: foods,
    meta: getPaginationMeta({ page, limit, total }),
  });
});

const getFood = asyncHandler(async (req, res) => {
  const food = await Food.findOne({
    $or: [
      ...(mongoose.isValidObjectId(req.params.id)
        ? [{ _id: req.params.id }]
        : []),
      { slug: req.params.id },
    ],
    status: "active",
  }).populate("category", "title slug");

  if (!food) {
    throw createHttpError("Food not found", 404);
  }

  const reviews = await Review.find({ food: food._id })
    .populate("customer", "name")
    .sort({ createdAt: -1 })
    .limit(12);

  res.status(200).json({
    success: true,
    data: {
      ...food.toObject(),
      reviews,
    },
  });
});

const refreshFoodRating = async foodId => {
  const [stats] = await Review.aggregate([
    { $match: { food: foodId } },
    {
      $group: {
        _id: "$food",
        ratingAverage: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  await Food.findByIdAndUpdate(foodId, {
    ratingAverage: stats ? Number(stats.ratingAverage.toFixed(1)) : 0,
    ratingCount: stats?.ratingCount || 0,
  });
};

const addReview = asyncHandler(async (req, res) => {
  const foodId = requireObjectId(req.params.id, "Food");
  const rating = requireNumber(req.body.rating, "Rating", { min: 1, max: 5 });
  const comment = optionalString(req.body.comment, 500);
  const orderId = requireObjectId(req.body.orderId, "Order");

  const food = await Food.findById(foodId);

  if (!food) {
    throw createHttpError("Food not found", 404);
  }

  const order = await Order.findOne({
    _id: orderId,
    customerAccount: req.customer._id,
    status: "delivered",
    "items.food": foodId,
  });

  if (!order) {
    throw createHttpError("You can review this product after delivery", 403);
  }

  const orderItem = order.items.find(
    item => item.food?.toString() === foodId.toString(),
  );

  if (orderItem?.reviewed) {
    throw createHttpError("This order item was already reviewed", 409);
  }

  const existingReview = await Review.exists({
    customer: req.customer._id,
    food: foodId,
    order: orderId,
  });

  if (existingReview) {
    throw createHttpError("This order item was already reviewed", 409);
  }

  const review = await Review.create({
    customer: req.customer._id,
    food: foodId,
    order: orderId,
    rating,
    comment,
  });

  await Order.updateOne(
    { _id: orderId, "items.food": foodId },
    { $set: { "items.$.reviewed": true } },
  );
  await refreshFoodRating(food._id);

  const savedReview = await Review.findById(review._id).populate(
    "customer",
    "name",
  );

  res.status(201).json({
    success: true,
    message: "Thanks for your review",
    data: savedReview,
  });
});

export default { getFoods, getFood, addReview };
