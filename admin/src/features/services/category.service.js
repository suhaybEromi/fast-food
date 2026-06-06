import api from "./api";

export const getCategories = async () => {
  const { data } = await api.get("/category");
  return data;
};

export const createCategory = async payload => {
  const { data } = await api.post("/category", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateCategory = async (id, payload) => {
  const { data } = await api.put(`/category/${id}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteCategory = async id => {
  const { data } = await api.delete(`/category/${id}`);
  return data;
};
