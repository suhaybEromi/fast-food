import process from "node:process";

import { rateLimit as expressRateLimit } from "express-rate-limit";

const parseNumber = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
};

export const rateLimit = ({
  windowMs = parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  max = parseNumber(process.env.RATE_LIMIT_MAX, 500),
  message = "Too many requests. Please try again soon.",
  ...options
} = {}) =>
  expressRateLimit({
    windowMs,
    limit: max,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
    ...options,
  });

const lazyRateLimit = getOptions => {
  let middleware;

  return (req, res, next) => {
    middleware ||= rateLimit(getOptions());
    return middleware(req, res, next);
  };
};

export const createAuthRateLimit = () =>
  rateLimit({
    windowMs: parseNumber(
      process.env.AUTH_RATE_LIMIT_WINDOW_MS,
      15 * 60 * 1000,
    ),
    max: parseNumber(process.env.AUTH_RATE_LIMIT_MAX, 25),
    message: "Too many authentication attempts. Please try again soon.",
    // Successful logins should not consume the brute-force protection budget.
    skipSuccessfulRequests: true,
  });

export const orderRateLimit = lazyRateLimit(() => ({
  windowMs: parseNumber(process.env.ORDER_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  max: parseNumber(process.env.ORDER_RATE_LIMIT_MAX, 80),
  message: "Too many order requests. Please try again soon.",
}));
