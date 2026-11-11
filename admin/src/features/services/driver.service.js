import api from "./api";

export const getDrivers = async params => {
  const { data } = await api.get("/driver", { params });
  return data;
};

export const createDriver = async payload => {
  const { data } = await api.post("/driver", payload);
  return data;
};

export const updateDriver = async (id, payload) => {
  const { data } = await api.put(`/driver/${id}`, payload);
  return data;
};

export const deleteDriver = async id => {
  const { data } = await api.delete(`/driver/${id}`);
  return data;
};
