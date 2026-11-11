import api from "./api";

export const getAdminUsers = async () => {
  const { data } = await api.get("/admin-user");
  return data;
};

export const createAdminUser = async payload => {
  const { data } = await api.post("/admin-user", payload);
  return data;
};

export const updateAdminUserRole = async (id, role) => {
  const { data } = await api.patch(`/admin-user/${id}/role`, { role });
  return data;
};

export const deleteAdminUser = async id => {
  const { data } = await api.delete(`/admin-user/${id}`);
  return data;
};
