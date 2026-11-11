import api from "./api";

export const getAuditLogs = async params => {
  const { data } = await api.get("/audit-log", { params });
  return data;
};
