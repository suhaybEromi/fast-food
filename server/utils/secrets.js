import process from "node:process";

import { COOKIE_SAME_SITE_VALUES } from "./cookies.js";

export const getEnvValue = (names, label = names[0]) => {
  const keys = Array.isArray(names) ? names : [names];
  const value = keys.map(key => process.env[key]).find(Boolean);

  if (value) {
    return value;
  }

  throw new Error(`${label} must be configured`);
};

export const getJwtSecret = (names, label) => {
  const secret = getEnvValue(names, label);

  if (String(secret).length < 32) {
    throw new Error(`${label} must be at least 32 characters`);
  }

  return secret;
};

export const validateServerConfig = () => {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL must be configured");
  }

  const routePrefixes = [
    process.env.PREFIX_ROUTES_ADMIN,
    process.env.PREFIX_ROUTES_CLIENT,
  ];

  if (routePrefixes.some(prefix => !prefix)) {
    throw new Error("Route prefixes must be configured");
  }

  if (
    routePrefixes.some(
      prefix => prefix.startsWith("/") || prefix.endsWith("/"),
    )
  ) {
    throw new Error("Route prefixes must not start or end with a slash");
  }

  if (process.env.NODE_ENV === "production") {
    const corsOrigins = (process.env.CORS_ORIGIN || "")
      .split(",")
      .map(origin => origin.trim())
      .filter(Boolean);

    if (corsOrigins.length === 0) {
      throw new Error("CORS_ORIGIN must be configured in production");
    }

    const hasUnsafeOrigin = corsOrigins.some(
      origin =>
        origin === "*" ||
        !origin.startsWith("https://") ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin),
    );

    if (hasUnsafeOrigin) {
      throw new Error(
        "Production CORS_ORIGIN values must be exact HTTPS origins, not wildcard or localhost values",
      );
    }
  }

  const cookieSameSite = process.env.COOKIE_SAME_SITE?.trim().toLowerCase();

  if (cookieSameSite && !COOKIE_SAME_SITE_VALUES.includes(cookieSameSite)) {
    throw new Error(
      `COOKIE_SAME_SITE must be one of: ${COOKIE_SAME_SITE_VALUES.join(", ")}`,
    );
  }

  getJwtSecret(["JWT_ACCESS_SECRET", "JWT_SECRET"], "Admin access JWT secret");
  getJwtSecret(["JWT_REFRESH_SECRET", "JWT_SECRET"], "Admin refresh JWT secret");
  getJwtSecret(
    ["CUSTOMER_JWT_ACCESS_SECRET", "JWT_ACCESS_SECRET", "JWT_SECRET"],
    "Customer access JWT secret",
  );
  getJwtSecret(
    ["CUSTOMER_JWT_REFRESH_SECRET", "JWT_REFRESH_SECRET", "JWT_SECRET"],
    "Customer refresh JWT secret",
  );
};
