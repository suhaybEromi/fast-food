import api from "./api";

export const getOrders = async () => {
  const { data } = await api.get("/order");
  return data;
};

export const updateOrderStatus = async (id, status) => {
  const { data } = await api.patch(`/order/${id}/status`, { status });
  return data;
};

export const updatePaymentStatus = async (id, paymentStatus) => {
  const { data } = await api.patch(`/order/${id}/payment`, { paymentStatus });
  return data;
};
