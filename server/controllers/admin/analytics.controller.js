import asyncHandler from "../../middlewares/asyncHandler.js";
import Customer from "../../models/customer.js";
import Food from "../../models/food.js";
import Order from "../../models/order.js";

const getAnalytics = asyncHandler(async (_req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 29);
  since.setHours(0, 0, 0, 0);

  const [salesTrend, statusBreakdown, topCustomers, inventory, loyalty] =
    await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: since }, status: { $ne: "cancelled" } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            orders: { $sum: 1 },
            sales: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 }, sales: { $sum: "$total" } } },
        { $sort: { count: -1 } },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        {
          $group: {
            _id: "$customerAccount",
            name: { $first: "$customer.name" },
            orders: { $sum: 1 },
            sales: { $sum: "$total" },
          },
        },
        { $sort: { sales: -1 } },
        { $limit: 8 },
      ]),
      Food.aggregate([
        {
          $group: {
            _id: null,
            products: { $sum: 1 },
            stockUnits: { $sum: "$stock" },
            outOfStock: { $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] } },
            lowStock: {
              $sum: {
                $cond: [
                  { $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", 5] }] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      Customer.aggregate([
        {
          $group: {
            _id: null,
            customers: { $sum: 1 },
            loyaltyPoints: { $sum: "$loyaltyPoints" },
          },
        },
      ]),
    ]);

  res.status(200).json({
    success: true,
    data: {
      salesTrend,
      statusBreakdown,
      topCustomers,
      inventory: inventory[0] || {},
      loyalty: loyalty[0] || {},
    },
  });
});

export default { getAnalytics };
