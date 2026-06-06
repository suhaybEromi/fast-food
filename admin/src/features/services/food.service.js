import api from "./api";

export const getFoods = async () => {
  const { data } = await api.get("/food");
  return data;
};

export const createFood = async payload => {
  const { data } = await api.post("/food", payload);
  return data;
};

export const updateFood = async (id, payload) => {
  const { data } = await api.put(`/food/${id}`, payload);
  return data;
};

export const deleteFood = async id => {
  const { data } = await api.delete(`/food/${id}`);
  return data;
};
