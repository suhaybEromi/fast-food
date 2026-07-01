export const API_URL = import.meta.env.VITE_API_URL;

let refreshRequest = null;

const isAuthPath = path => path.startsWith("/auth/");

export const apiFetch = async (path, options = {}, retry = true) => {
  const headers = new Headers(options.headers || {});
  let body = options.body;

  if (body && !(body instanceof FormData)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (typeof body !== "string") {
      body = JSON.stringify(body);
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    body,
    credentials: "include",
    headers,
  });

  if (response.status === 401 && retry && !isAuthPath(path)) {
    try {
      refreshRequest =
        refreshRequest ||
        fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

      const refreshResponse = await refreshRequest;
      refreshRequest = null;

      if (refreshResponse.ok) {
        return apiFetch(path, options, false);
      }
    } catch {
      refreshRequest = null;
    }
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.message || "Request failed");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};

export const signupCustomer = payload =>
  apiFetch("/auth/signup", { method: "POST", body: payload }, false);

export const loginCustomer = payload =>
  apiFetch("/auth/login", { method: "POST", body: payload }, false);

export const getCurrentCustomer = () => apiFetch("/auth/me", {}, false);

export const refreshCustomerToken = () =>
  apiFetch("/auth/refresh", { method: "POST" }, false);

export const logoutCustomer = () =>
  apiFetch("/auth/logout", { method: "POST" }, false);

export const getCustomerOrders = () => apiFetch("/order/mine");

export const createCustomerOrder = payload =>
  apiFetch("/order", { method: "POST", body: payload });

export const getCustomerNotifications = () => apiFetch("/notification");

export const markCustomerNotificationsRead = id =>
  apiFetch(id ? `/notification/${id}/read` : "/notification/read", {
    method: "PATCH",
  });
