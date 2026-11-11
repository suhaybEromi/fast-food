const CSRF_COOKIE_NAME = "csrfToken";
const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const getCookieValue = name =>
  document.cookie
    .split("; ")
    .find(row => row.startsWith(`${name}=`))
    ?.split("=")[1] || "";

export const getCsrfToken = () =>
  decodeURIComponent(getCookieValue(CSRF_COOKIE_NAME));

export const addCsrfHeader = (headers, method) => {
  if (!unsafeMethods.has(method.toUpperCase()) || headers.has("x-csrf-token")) {
    return;
  }

  const csrfToken = getCsrfToken();

  if (csrfToken) {
    headers.set("x-csrf-token", csrfToken);
  }
};
