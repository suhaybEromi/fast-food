import asyncHandler from "../../middlewares/asyncHandler.js";
import AuditLog from "../../models/auditLog.js";
import { getPagination, getPaginationMeta } from "../../utils/pagination.js";

const getAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.resource) {
    filter.resource = req.query.resource;
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: logs,
    meta: getPaginationMeta({ page, limit, total }),
  });
});

export default { getAuditLogs };
