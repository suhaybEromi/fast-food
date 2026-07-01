import api from "./api";

export const getAdminNotifications = async () => {
  const { data } = await api.get("/notification");
  return data;
};

export const markAdminNotificationsRead = async id => {
  const { data } = await api.patch(
    id ? `/notification/${id}/read` : "/notification/read",
  );
  return data;
};
