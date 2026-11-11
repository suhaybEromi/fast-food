import { API_URL } from "./env";
import { getCsrfToken } from "./csrf";

let refreshRequest = null;

export const isAuthPath = path => path.startsWith("/auth/");

export const refreshCustomerSession = async () => {
  try {
    refreshRequest =
      refreshRequest ||
      fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "x-csrf-token": getCsrfToken(),
        },
      });

    const refreshResponse = await refreshRequest;
    return refreshResponse.ok;
  } catch {
    return false;
  } finally {
    refreshRequest = null;
  }
};
