import jwt from "jsonwebtoken";

import asyncHandler from "./asyncHandler.js";
import Customer from "../models/customer.js";

const getAccessSecret = () =>
  process.env.CUSTOMER_JWT_ACCESS_SECRET ||
  process.env.JWT_ACCESS_SECRET ||
  process.env.JWT_SECRET ||
  "fast-food-customer-access-secret";

const protectCustomer = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.customerAccessToken;

  if (!token) {
    const error = new Error("Customer login is required");
    error.status = 401;
    throw error;
  }

  try {
    const decoded = jwt.verify(token, getAccessSecret());
    const customer = await Customer.findById(decoded.id);

    if (
      !customer ||
      decoded.role !== "customer" ||
      decoded.tokenType !== "access"
    ) {
      const error = new Error("Customer access is required");
      error.status = 401;
      throw error;
    }

    req.customer = customer;
    next();
  } catch {
    const error = new Error("Customer access token is invalid or expired");
    error.status = 401;
    throw error;
  }
});

export default protectCustomer;
