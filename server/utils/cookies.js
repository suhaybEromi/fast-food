import process from "node:process";

export const COOKIE_NAMES = Object.freeze({
  csrf: "csrfToken",
  adminAccess: "adminAccessToken",
  adminRefresh: "adminRefreshToken",
  customerAccess: "customerAccessToken",
  customerRefresh: "customerRefreshToken",
});

export const AUTH_COOKIE_MAX_AGE = Object.freeze({
  access: 15 * 60 * 1000,
  refresh: 7 * 24 * 60 * 60 * 1000,
  csrf: 24 * 60 * 60 * 1000,
});

export const COOKIE_SAME_SITE_VALUES = Object.freeze(["strict", "lax", "none"]);

export const isProduction = () => process.env.NODE_ENV === "production";

export const getCookieSameSite = () => {
  const sameSite = process.env.COOKIE_SAME_SITE?.trim().toLowerCase();

  if (COOKIE_SAME_SITE_VALUES.includes(sameSite)) {
    return sameSite;
  }

  return isProduction() ? "none" : "lax";
};

const getBaseCookieOptions = maxAge => {
  const sameSite = getCookieSameSite();

  return {
    sameSite,
    secure: isProduction() || sameSite === "none",
    path: "/",
    priority: "high",
    maxAge,
  };
};

export const getPrivateCookieOptions = maxAge => ({
  ...getBaseCookieOptions(maxAge),
  httpOnly: true,
});

export const getReadableCookieOptions = maxAge => ({
  ...getBaseCookieOptions(maxAge),
  httpOnly: false,
});

export const getCsrfCookieOptions = () =>
  getReadableCookieOptions(AUTH_COOKIE_MAX_AGE.csrf);
