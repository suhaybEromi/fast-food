import api from "./api";

export const getBanners = async params => {
  const { data } = await api.get("/banner", { params });
  return data;
};

export const createBanner = async payload => {
  const { data } = await api.post("/banner", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateBanner = async (id, payload) => {
  const { data } = await api.put(`/banner/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteBanner = async id => {
  const { data } = await api.delete(`/banner/${id}`);
  return data;
};
