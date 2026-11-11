import crypto from "node:crypto";

import {
  COOKIE_NAMES,
  getCsrfCookieOptions,
} from "../../utils/cookies.js";

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const timingSafeEqual = (left, right) => {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));

  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
};

export const csrfProtection = (req, res, next) => {
  let token = req.cookies?.[COOKIE_NAMES.csrf];

  if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
    token = crypto.randomBytes(32).toString("hex");
    res.cookie(COOKIE_NAMES.csrf, token, getCsrfCookieOptions());
  }

  if (!unsafeMethods.has(req.method)) {
    return next();
  }

  const headerToken = req.get("x-csrf-token");

  if (!headerToken || !timingSafeEqual(headerToken, token)) {
    const error = new Error("CSRF token is invalid");
    error.status = 403;
    throw error;
  }

  next();
};
