import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL;
export const IMAGE_URL = import.meta.env.VITE_API_URL_IMG;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let refreshRequest = null;

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const isAuthCall = originalRequest?.url?.startsWith("/auth/");

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthCall
    ) {
      originalRequest._retry = true;

      try {
        refreshRequest = refreshRequest || api.post("/auth/refresh");
        await refreshRequest;
        refreshRequest = null;

        return api(originalRequest);
      } catch (refreshError) {
        refreshRequest = null;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
