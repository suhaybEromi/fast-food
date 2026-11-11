import asyncHandler from "../../middlewares/asyncHandler.js";
import Food from "../../models/food.js";
import Order from "../../models/order.js";

const getDashboardStats = asyncHandler(async (_req, res) => {
  const [
    totalOrders,
    totalProducts,
    pendingOrders,
    salesStats,
    bestSelling,
    lowStockProducts,
    outOfStockProducts,
    recentOrders,
  ] = await Promise.all([
    Order.countDocuments(),
    Food.countDocuments(),
    Order.countDocuments({ status: "pending" }),
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, totalSales: { $sum: "$total" } } },
    ]),
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.food",
          title: { $first: "$items.title" },
          quantity: { $sum: "$items.quantity" },
          sales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 6 },
    ]),
    Food.find({ stock: { $gt: 0, $lte: 5 } })
      .select("title stock status")
      .sort({ stock: 1 })
      .limit(8),
    Food.find({ stock: 0 }).select("title stock status").sort({ updatedAt: -1 }),
    Order.find()
      .populate("customerAccount", "name email phone")
      .sort({ createdAt: -1 })
      .limit(6),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalOrders,
      totalSales: salesStats[0]?.totalSales || 0,
      totalProducts,
      pendingOrders,
      bestSellingProducts: bestSelling,
      lowStockProducts,
      outOfStockProducts,
      recentOrders,
    },
  });
});

export default { getDashboardStats };
