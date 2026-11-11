import api from "./api";

export const getCoupons = async params => {
  const { data } = await api.get("/coupon", { params });
  return data;
};

export const createCoupon = async payload => {
  const { data } = await api.post("/coupon", payload);
  return data;
};

export const updateCoupon = async (id, payload) => {
  const { data } = await api.put(`/coupon/${id}`, payload);
  return data;
};

export const deleteCoupon = async id => {
  const { data } = await api.delete(`/coupon/${id}`);
  return data;
};
