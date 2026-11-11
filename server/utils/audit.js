import AuditLog from "../models/auditLog.js";

export const logAudit = async (req, action, resource, options = {}) => {
  try {
    await AuditLog.create({
      actor: req.admin?._id,
      actorName: req.admin?.name || "",
      actorRole: req.admin?.role || "",
      action,
      resource,
      resourceId: options.resourceId ? String(options.resourceId) : "",
      message: options.message || "",
      ip: req.ip || req.socket?.remoteAddress || "",
      userAgent: req.get?.("user-agent") || "",
      metadata: options.metadata || {},
    });
  } catch (error) {
    console.error("Audit log failed:", error.message);
  }
};
