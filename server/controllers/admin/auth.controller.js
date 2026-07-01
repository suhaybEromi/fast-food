import jwt from "jsonwebtoken";

import asyncHandler from "../../middlewares/asyncHandler.js";
import Admin from "../../models/admin.js";

const ACCESS_COOKIE = "adminAccessToken";
const REFRESH_COOKIE = "adminRefreshToken";

const getAccessSecret = () =>
  process.env.JWT_ACCESS_SECRET ||
  process.env.JWT_SECRET ||
  "fast-food-admin-access-secret";

const getRefreshSecret = () =>
  process.env.JWT_REFRESH_SECRET ||
  process.env.JWT_SECRET ||
  "fast-food-admin-refresh-secret";

const getCookieOptions = maxAge => ({
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge,
});

const signAccessToken = admin =>
  jwt.sign(
    { id: admin._id, role: admin.role, tokenType: "access" },
    getAccessSecret(),
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    },
  );

const signRefreshToken = admin =>
  jwt.sign(
    { id: admin._id, role: admin.role, tokenType: "refresh" },
    getRefreshSecret(),
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    },
  );

const normalizeEmail = email => email.trim().toLowerCase();

const setAuthCookies = (res, admin) => {
  res.cookie(
    ACCESS_COOKIE,
    signAccessToken(admin),
    getCookieOptions(15 * 60 * 1000),
  );
  res.cookie(
    REFRESH_COOKIE,
    signRefreshToken(admin),
    getCookieOptions(7 * 24 * 60 * 60 * 1000),
  );
};

const clearAuthCookies = res => {
  res.clearCookie(ACCESS_COOKIE, getCookieOptions(0));
  res.clearCookie(REFRESH_COOKIE, getCookieOptions(0));
};

const sendAdmin = (res, status, admin, message) => {
  setAuthCookies(res, admin);

  res.status(status).json({
    success: true,
    message,
    data: admin,
  });
};

// const signup = asyncHandler(async (req, res) => {
//   const { name, email, password } = req.body;

//   if (!name || !email || !password) {
//     const error = new Error("Name, email, and password are required");
//     error.status = 400;
//     throw error;
//   }

//   const normalizedEmail = normalizeEmail(email);

//   const existingAdmin = await Admin.findOne({ email: normalizedEmail });

//   if (existingAdmin) {
//     const error = new Error("Admin email already exists");
//     error.status = 400;
//     throw error;
//   }

//   const admin = await Admin.create({ name, email: normalizedEmail, password });

//   sendAdmin(res, 201, admin, "Admin account created");
// });

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

  sendAdmin(res, 200, admin, "Logged in successfully");
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

  if (decoded.tokenType !== "refresh" || decoded.role !== "admin") {
    clearAuthCookies(res);

    const error = new Error("Refresh token is invalid");
    error.status = 401;
    throw error;
  }

  const admin = await Admin.findById(decoded.id);

  if (!admin) {
    clearAuthCookies(res);

    const error = new Error("Admin account was not found");
    error.status = 401;
    throw error;
  }

  setAuthCookies(res, admin);

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

const logout = asyncHandler(async (_req, res) => {
  clearAuthCookies(res);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// signup
export default { login, refresh, me, logout };
