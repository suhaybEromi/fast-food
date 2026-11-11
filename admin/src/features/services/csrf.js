const CSRF_COOKIE_NAME = "csrfToken";
const unsafeMethods = new Set(["post", "put", "patch", "delete"]);

const getCookieValue = name =>
  document.cookie
    .split("; ")
    .find(row => row.startsWith(`${name}=`))
    ?.split("=")[1] || "";

const getCsrfToken = () => decodeURIComponent(getCookieValue(CSRF_COOKIE_NAME));

export const addCsrfHeader = config => {
  if (!unsafeMethods.has(String(config.method || "get").toLowerCase())) {
    return config;
  }

  const csrfToken = getCsrfToken();
  config.headers = config.headers || {};

  if (csrfToken) {
    config.headers["x-csrf-token"] = csrfToken;
  }

  return config;
};
