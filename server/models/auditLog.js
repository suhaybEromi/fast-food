import { Schema, model } from "mongoose";

const auditLogSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: "Admin" },
    actorName: { type: String, default: "", trim: true },
    actorRole: { type: String, default: "", trim: true },
    action: { type: String, required: true, trim: true, maxlength: 100 },
    resource: { type: String, required: true, trim: true, maxlength: 80 },
    resourceId: { type: String, default: "", trim: true },
    message: { type: String, default: "", trim: true, maxlength: 300 },
    ip: { type: String, default: "", trim: true },
    userAgent: { type: String, default: "", trim: true, maxlength: 300 },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, createdAt: -1 });

export default model("AuditLog", auditLogSchema);
