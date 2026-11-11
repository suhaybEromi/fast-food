import jwt from "jsonwebtoken";
import crypto from "crypto";

import asyncHandler from "../../middlewares/asyncHandler.js";
import Customer from "../../models/customer.js";
import {
  AUTH_COOKIE_MAX_AGE,
  COOKIE_NAMES,
  getPrivateCookieOptions,
} from "../../utils/cookies.js";
import { getJwtSecret } from "../../utils/secrets.js";

const ACCESS_COOKIE = COOKIE_NAMES.customerAccess;
const REFRESH_COOKIE = COOKIE_NAMES.customerRefresh;
const ACCESS_MAX_AGE = AUTH_COOKIE_MAX_AGE.access;
const REFRESH_MAX_AGE = AUTH_COOKIE_MAX_AGE.refresh;

const hashToken = token =>
  crypto.createHash("sha256").update(token).digest("hex");

const getAccessSecret = () =>
  getJwtSecret(
    ["CUSTOMER_JWT_ACCESS_SECRET", "JWT_ACCESS_SECRET", "JWT_SECRET"],
    "Customer access JWT secret",
  );

const getRefreshSecret = () =>
  getJwtSecret(
    ["CUSTOMER_JWT_REFRESH_SECRET", "JWT_REFRESH_SECRET", "JWT_SECRET"],
    "Customer refresh JWT secret",
  );

const getCookieOptions = maxAge => getPrivateCookieOptions(maxAge);

const normalizeEmail = email => email.trim().toLowerCase();

const signAccessToken = customer =>
  jwt.sign(
    { id: customer._id, role: customer.role, tokenType: "access" },
    getAccessSecret(),
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    },
  );

const signRefreshToken = customer =>
  jwt.sign(
    { id: customer._id, role: customer.role, tokenType: "refresh" },
    getRefreshSecret(),
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    },
  );

const setAuthCookies = async (res, customer) => {
  const accessToken = signAccessToken(customer);
  const refreshToken = signRefreshToken(customer);

  customer.refreshTokenHash = hashToken(refreshToken);
  await customer.save({ validateBeforeSave: false });

  res.cookie(ACCESS_COOKIE, accessToken, getCookieOptions(ACCESS_MAX_AGE));
  res.cookie(REFRESH_COOKIE, refreshToken, getCookieOptions(REFRESH_MAX_AGE));
};

const clearAuthCookies = res => {
  res.clearCookie(ACCESS_COOKIE, getCookieOptions(0));
  res.clearCookie(REFRESH_COOKIE, getCookieOptions(0));
};

const sendCustomer = async (res, status, customer, message) => {
  await setAuthCookies(res, customer);

  customer.password = undefined;
  customer.refreshTokenHash = undefined;

  res.status(status).json({
    success: true,
    message,
    data: customer,
  });
};

const signup = asyncHandler(async (req, res) => {
  const { name, email, phone, address = "", password } = req.body;

  if (!name || !email || !phone || !password) {
    const error = new Error("Name, email, phone, and password are required");
    error.status = 400;
    throw error;
  }

  if (String(password).length < 8) {
    const error = new Error("Password must be at least 8 characters");
    error.status = 400;
    throw error;
  }

  const normalizedEmail = normalizeEmail(email);
  const existingCustomer = await Customer.findOne({ email: normalizedEmail });

  if (existingCustomer) {
    const error = new Error("Customer email already exists");
    error.status = 409;
    throw error;
  }

  const customer = await Customer.create({
    name,
    email: normalizedEmail,
    phone,
    address,
    password,
  });

  await sendCustomer(res, 201, customer, "Customer account created");
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.status = 400;
    throw error;
  }

  const customer = await Customer.findOne({
    email: normalizeEmail(email),
  }).select("+password");

  if (!customer || !(await customer.matchPassword(password))) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  await sendCustomer(res, 200, customer, "Logged in successfully");
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

  if (decoded.tokenType !== "refresh" || decoded.role !== "customer") {
    clearAuthCookies(res);

    const error = new Error("Refresh token is invalid");
    error.status = 401;
    throw error;
  }

  const customer = await Customer.findById(decoded.id).select(
    "+refreshTokenHash",
  );

  if (!customer || customer.refreshTokenHash !== hashToken(token)) {
    clearAuthCookies(res);
    const error = new Error("Refresh token is invalid");
    error.status = 401;
    throw error;
  }

  await setAuthCookies(res, customer);
  customer.refreshTokenHash = undefined;

  res.status(200).json({
    success: true,
    message: "Customer token refreshed",
    data: customer,
  });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.customer,
  });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];

  if (token) {
    try {
      const decoded = jwt.verify(token, getRefreshSecret());

      await Customer.findByIdAndUpdate(decoded.id, {
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

export default { signup, login, refresh, me, logout };
