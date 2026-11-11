let refreshRequest = null;

const isAuthRequest = request => request?.url?.startsWith("/auth/");

export const retryAfterRefresh = async (api, error) => {
  const originalRequest = error.config;

  if (
    error.response?.status !== 401 ||
    !originalRequest ||
    originalRequest._retry ||
    isAuthRequest(originalRequest)
  ) {
    return Promise.reject(error);
  }

  originalRequest._retry = true;

  try {
    refreshRequest = refreshRequest ?? api.post("/auth/refresh");
    await refreshRequest;

    return api(originalRequest);
  } catch (refreshError) {
    return Promise.reject(refreshError);
  } finally {
    refreshRequest = null;
  }
};
