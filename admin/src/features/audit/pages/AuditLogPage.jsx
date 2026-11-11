import { useEffect, useState } from "react";

import { getAuditLogs } from "../../services/auditLog.service";

const formatTime = value =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      getAuditLogs({ limit: 80 }).then(response => setLogs(response.data || []));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-black uppercase text-red-600">Audit logs</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">
          Staff activity log
        </h1>
        <p className="mt-2 text-slate-500">
          Review sensitive admin actions and operational changes.
        </p>
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="bg-slate-50 text-left text-xs font-black uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Actor</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Resource</th>
                <th className="px-5 py-3">Message</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log._id} className="border-t border-slate-100">
                  <td className="px-5 py-4 text-sm text-slate-500">
                    {formatTime(log.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900">
                      {log.actor?.name || log.actorName || "Admin"}
                    </p>
                    <p className="text-xs text-slate-500">{log.actorRole}</p>
                  </td>
                  <td className="px-5 py-4 font-black text-slate-950">
                    {log.action}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{log.resource}</td>
                  <td className="px-5 py-4 text-slate-600">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
