import asyncHandler from "../../middlewares/asyncHandler.js";
import Admin from "../../models/admin.js";
import { normalizeAdminRole } from "../../middlewares/adminRoles.js";
import { logAudit } from "../../utils/audit.js";
import {
  createHttpError,
  requireEnum,
  requireString,
} from "../../utils/validation.js";

const roleOptions = ["super_admin", "manager", "staff"];
const publicFields = "name email role createdAt updatedAt";

const normalizeEmail = email => requireString(email, "Email", 120).toLowerCase();

const getAdmins = asyncHandler(async (_req, res) => {
  const admins = await Admin.find().select(publicFields).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: admins.map(admin => ({
      ...admin.toObject(),
      role: normalizeAdminRole(admin.role),
    })),
  });
});

const createAdmin = asyncHandler(async (req, res) => {
  const payload = {
    name: requireString(req.body.name, "Name", 80),
    email: normalizeEmail(req.body.email),
    password: requireString(req.body.password, "Password", 128),
    role: requireEnum(req.body.role || "staff", roleOptions, "Role"),
  };

  if (payload.password.length < 12) {
    throw createHttpError("Admin password must be at least 12 characters");
  }

  const exists = await Admin.findOne({ email: payload.email });

  if (exists) {
    throw createHttpError("Admin email already exists", 409);
  }

  const admin = await Admin.create(payload);
  await logAudit(req, "create", "admin_user", {
    resourceId: admin._id,
    message: `Created admin user ${admin.email}`,
  });

  res.status(201).json({
    success: true,
    message: "Admin user created",
    data: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
});

const updateAdminRole = asyncHandler(async (req, res) => {
  const role = requireEnum(req.body.role, roleOptions, "Role");

  if (req.params.id === req.admin._id.toString() && role !== "super_admin") {
    throw createHttpError("You cannot lower your own super admin role", 400);
  }

  const admin = await Admin.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true },
  ).select(publicFields);

  if (!admin) {
    throw createHttpError("Admin user not found", 404);
  }

  await logAudit(req, "update_role", "admin_user", {
    resourceId: admin._id,
    message: `Changed ${admin.email} role to ${role}`,
  });

  res.status(200).json({
    success: true,
    message: "Admin role updated",
    data: admin,
  });
});

const deleteAdmin = asyncHandler(async (req, res) => {
  if (req.params.id === req.admin._id.toString()) {
    throw createHttpError("You cannot delete your own admin account", 400);
  }

  const admin = await Admin.findByIdAndDelete(req.params.id);

  if (!admin) {
    throw createHttpError("Admin user not found", 404);
  }

  await logAudit(req, "delete", "admin_user", {
    resourceId: admin._id,
    message: `Deleted admin user ${admin.email}`,
  });

  res.status(200).json({
    success: true,
    message: "Admin user deleted",
  });
});

export default { getAdmins, createAdmin, updateAdminRole, deleteAdmin };
