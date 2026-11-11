const roleRank = {
  admin: 3,
  super_admin: 3,
  manager: 2,
  staff: 1,
};

export const normalizeAdminRole = role =>
  role === "admin" ? "super_admin" : role || "staff";

export const hasAdminRole = (role, minimumRole = "staff") =>
  (roleRank[role] || 0) >= (roleRank[minimumRole] || 0);

export const requireAdminRole = minimumRole => (req, _res, next) => {
  const role = normalizeAdminRole(req.admin?.role);

  if (!hasAdminRole(role, minimumRole)) {
    const error = new Error("You do not have permission for this action");
    error.status = 403;
    throw error;
  }

  next();
};
