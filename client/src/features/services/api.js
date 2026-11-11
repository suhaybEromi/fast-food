import { isAuthPath, refreshCustomerSession } from "./authRetry";
import { addCsrfHeader } from "./csrf";
import { API_URL, IMAGE_URL } from "./env";
import { prepareRequest } from "./request";

export const apiFetch = async (path, options = {}, retry = true) => {
  const { body, headers, method } = prepareRequest(options);
  addCsrfHeader(headers, method);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    body,
    credentials: "include",
    headers,
  });

  if (response.status === 401 && retry && !isAuthPath(path)) {
    const sessionRefreshed = await refreshCustomerSession();

    if (sessionRefreshed) {
      return apiFetch(path, options, false);
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

export const getCustomerOrder = id => apiFetch(`/order/${id}`);

export const reorderCustomerOrder = id =>
  apiFetch(`/order/${id}/reorder`, { method: "POST" });

export const getFoods = () => apiFetch("/food?limit=80", {}, false);

export const getFoodDetails = id => apiFetch(`/food/${id}`);

export const createProductReview = (foodId, payload) =>
  apiFetch(`/food/${foodId}/reviews`, { method: "POST", body: payload });

export const getHomeBanners = () => apiFetch("/banner", {}, false);

export const getDeliveryZones = () => apiFetch("/delivery/zones", {}, false);

export const validateCoupon = code => apiFetch(`/coupon/${code}`, {}, false);

export const updateCustomerProfile = payload =>
  apiFetch("/customer/profile", { method: "PATCH", body: payload });

export const addCustomerAddress = payload =>
  apiFetch("/customer/addresses", { method: "POST", body: payload });

export const updateCustomerAddress = (id, payload) =>
  apiFetch(`/customer/addresses/${id}`, { method: "PUT", body: payload });

export const deleteCustomerAddress = id =>
  apiFetch(`/customer/addresses/${id}`, { method: "DELETE" });

export const getCustomerWishlist = () => apiFetch("/customer/wishlist");

export const addCustomerWishlistItem = foodId =>
  apiFetch(`/customer/wishlist/${foodId}`, { method: "POST" });

export const removeCustomerWishlistItem = foodId =>
  apiFetch(`/customer/wishlist/${foodId}`, { method: "DELETE" });

export const getCustomerNotifications = () => apiFetch("/notification");

export const markCustomerNotificationsRead = id =>
  apiFetch(id ? `/notification/${id}/read` : "/notification/read", {
    method: "PATCH",
  });

export { API_URL, IMAGE_URL };
