import api from "./api";

export const signupAdmin = async payload => {
  const { data } = await api.post("/auth/signup", payload);
  return data;
};

export const loginAdmin = async payload => {
  const { data } = await api.post("/auth/login", payload);
  return data;
};

export const getCurrentAdmin = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const refreshAdminToken = async () => {
  const { data } = await api.post("/auth/refresh");
  return data;
};

export const logoutAdmin = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};
