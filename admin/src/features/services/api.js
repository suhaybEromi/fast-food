import axios from "axios";

import { retryAfterRefresh } from "./authRetry";
import { addCsrfHeader } from "./csrf";
import { API_URL, IMAGE_URL } from "./env";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use(addCsrfHeader);

api.interceptors.response.use(
  response => response,
  error => retryAfterRefresh(api, error),
);

export { API_URL, IMAGE_URL };
export default api;
