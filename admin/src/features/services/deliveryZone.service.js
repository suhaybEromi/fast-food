import api from "./api";

export const getDeliveryZones = async params => {
  const { data } = await api.get("/delivery-zone", { params });
  return data;
};

export const createDeliveryZone = async payload => {
  const { data } = await api.post("/delivery-zone", payload);
  return data;
};

export const updateDeliveryZone = async (id, payload) => {
  const { data } = await api.put(`/delivery-zone/${id}`, payload);
  return data;
};

export const deleteDeliveryZone = async id => {
  const { data } = await api.delete(`/delivery-zone/${id}`);
  return data;
};
