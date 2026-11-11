import jwt from "jsonwebtoken";

import asyncHandler from "./asyncHandler.js";
import Admin from "../models/admin.js";
import { normalizeAdminRole } from "./adminRoles.js";
import { COOKIE_NAMES } from "../utils/cookies.js";
import { getJwtSecret } from "../utils/secrets.js";

const getAccessSecret = () =>
  getJwtSecret(
    ["JWT_ACCESS_SECRET", "JWT_SECRET"],
    "Admin access JWT secret",
  );

const protectAdmin = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[COOKIE_NAMES.adminAccess];

  if (!token) {
    const error = new Error("Admin login is required");
    error.status = 401;
    throw error;
  }

  try {
    const decoded = jwt.verify(token, getAccessSecret());
    const admin = await Admin.findById(decoded.id);

    const role = normalizeAdminRole(decoded.role);

    if (
      !admin ||
      !["super_admin", "manager", "staff"].includes(role) ||
      decoded.tokenType !== "access"
    ) {
      const error = new Error("Admin access is required");
      error.status = 401;
      throw error;
    }

    admin.role = normalizeAdminRole(admin.role);
    req.admin = admin;
    next();
  } catch {
    const error = new Error("Admin access token is invalid or expired");
    error.status = 401;
    throw error;
  }
});

export default protectAdmin;
