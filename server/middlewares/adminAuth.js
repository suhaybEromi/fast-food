import jwt from "jsonwebtoken";

import asyncHandler from "./asyncHandler.js";
import Admin from "../models/admin.js";

const getAccessSecret = () =>
  process.env.JWT_ACCESS_SECRET ||
  process.env.JWT_SECRET ||
  "fast-food-admin-access-secret";

const protectAdmin = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.adminAccessToken;

  if (!token) {
    const error = new Error("Admin login is required");
    error.status = 401;
    throw error;
  }

  try {
    const decoded = jwt.verify(token, getAccessSecret());
    const admin = await Admin.findById(decoded.id);

    if (!admin || decoded.role !== "admin" || decoded.tokenType !== "access") {
      const error = new Error("Admin access is required");
      error.status = 401;
      throw error;
    }

    req.admin = admin;
    next();
  } catch {
    const error = new Error("Admin access token is invalid or expired");
    error.status = 401;
    throw error;
  }
});

export default protectAdmin;
