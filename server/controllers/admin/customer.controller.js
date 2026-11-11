import asyncHandler from "../../middlewares/asyncHandler.js";
import Customer from "../../models/customer.js";
import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import { optionalString } from "../../utils/validation.js";

const getCustomers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const search = optionalString(req.query.search, 80);
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const [customers, total] = await Promise.all([
    Customer.find(filter)
      .select("name email phone address addresses createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Customer.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: customers,
    meta: getPaginationMeta({ page, limit, total }),
  });
});

export default { getCustomers };
