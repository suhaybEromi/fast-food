import jwt from "jsonwebtoken";
import crypto from "crypto";

import asyncHandler from "../../middlewares/asyncHandler.js";
import Admin from "../../models/admin.js";
import {
  AUTH_COOKIE_MAX_AGE,
  COOKIE_NAMES,
  getPrivateCookieOptions,
} from "../../utils/cookies.js";
import { normalizeAdminRole } from "../../middlewares/adminRoles.js";
import { getJwtSecret } from "../../utils/secrets.js";

const ACCESS_COOKIE = COOKIE_NAMES.adminAccess;
const REFRESH_COOKIE = COOKIE_NAMES.adminRefresh;
const ACCESS_MAX_AGE = AUTH_COOKIE_MAX_AGE.access;
const REFRESH_MAX_AGE = AUTH_COOKIE_MAX_AGE.refresh;

const hashToken = token =>
  crypto.createHash("sha256").update(token).digest("hex");

const getAccessSecret = () =>
  getJwtSecret(["JWT_ACCESS_SECRET", "JWT_SECRET"], "Admin access JWT secret");

const getRefreshSecret = () =>
  getJwtSecret(
    ["JWT_REFRESH_SECRET", "JWT_SECRET"],
    "Admin refresh JWT secret",
  );

const getCookieOptions = maxAge => getPrivateCookieOptions(maxAge);

const normalizeEmail = email => email.trim().toLowerCase();

const signAccessToken = admin =>
  jwt.sign(
    {
      id: admin._id,
      role: normalizeAdminRole(admin.role),
      tokenType: "access",
    },
    getAccessSecret(),
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    },
  );

const signRefreshToken = admin =>
  jwt.sign(
    {
      id: admin._id,
      role: normalizeAdminRole(admin.role),
      tokenType: "refresh",
    },
    getRefreshSecret(),
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    },
  );

const setAuthCookies = async (res, admin) => {
  const accessToken = signAccessToken(admin);
  const refreshToken = signRefreshToken(admin);

  admin.refreshTokenHash = hashToken(refreshToken);
  await admin.save({ validateBeforeSave: false });

  res.cookie(ACCESS_COOKIE, accessToken, getCookieOptions(ACCESS_MAX_AGE));
  res.cookie(REFRESH_COOKIE, refreshToken, getCookieOptions(REFRESH_MAX_AGE));
};

const clearAuthCookies = res => {
  res.clearCookie(ACCESS_COOKIE, getCookieOptions(0));
  res.clearCookie(REFRESH_COOKIE, getCookieOptions(0));
};

const sendAdmin = async (res, status, admin, message) => {
  admin.role = normalizeAdminRole(admin.role);

  await setAuthCookies(res, admin);

  admin.password = undefined;
  admin.refreshTokenHash = undefined;

  res.status(status).json({
    success: true,
    message,
    data: admin,
  });
};

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.status = 400;
    throw error;
  }

  const admin = await Admin.findOne({
    email: normalizeEmail(email),
  }).select("+password");

  if (!admin || !(await admin.matchPassword(password))) {
    const error = new Error("Invalid admin email or password");
    error.status = 401;
    throw error;
  }

  await sendAdmin(res, 200, admin, "Logged in successfully");
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];

  if (!token) {
    const error = new Error("Refresh token is required");
    error.status = 401;
    throw error;
  }

  let decoded;

  try {
    decoded = jwt.verify(token, getRefreshSecret());
  } catch {
    clearAuthCookies(res);

    const error = new Error("Refresh token is invalid or expired");
    error.status = 401;
    throw error;
  }

  const role = normalizeAdminRole(decoded.role);

  if (
    decoded.tokenType !== "refresh" ||
    !["super_admin", "manager", "staff"].includes(role)
  ) {
    clearAuthCookies(res);

    const error = new Error("Refresh token is invalid");
    error.status = 401;
    throw error;
  }

  const admin = await Admin.findById(decoded.id).select("+refreshTokenHash");

  if (!admin || admin.refreshTokenHash !== hashToken(token)) {
    clearAuthCookies(res);

    const error = new Error("Refresh token is invalid");
    error.status = 401;
    throw error;
  }

  admin.role = normalizeAdminRole(admin.role);

  await setAuthCookies(res, admin);

  admin.refreshTokenHash = undefined;

  res.status(200).json({
    success: true,
    message: "Admin token refreshed",
    data: admin,
  });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.admin,
  });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];

  if (token) {
    try {
      const decoded = jwt.verify(token, getRefreshSecret());

      await Admin.findByIdAndUpdate(decoded.id, {
        refreshTokenHash: "",
      });
    } catch {
      // ignore invalid token
    }
  }

  clearAuthCookies(res);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export default { login, refresh, me, logout };
