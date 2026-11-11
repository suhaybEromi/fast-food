import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, Trash2 } from "lucide-react";

import {
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  updateAdminUserRole,
} from "../../services/adminUser.service";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "staff",
};

const roleLabels = {
  super_admin: "Super admin",
  manager: "Manager",
  staff: "Staff",
};

export default function AdminUserList() {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  const loadAdmins = useCallback(async () => {
    try {
      const response = await getAdminUsers();
      setAdmins(response.data || []);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Only super admins can manage admin users.",
      );
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadAdmins, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadAdmins]);

  const handleChange = event => {
    setForm(current => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const submit = async event => {
    event.preventDefault();

    try {
      await createAdminUser(form);
      setForm(emptyForm);
      setMessage("Admin user created.");
      loadAdmins();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not create admin.");
    }
  };

  const changeRole = async (id, role) => {
    try {
      await updateAdminUserRole(id, role);
      loadAdmins();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not update role.");
    }
  };

  const removeAdmin = async id => {
    if (!globalThis.confirm("Delete this admin user?")) return;

    try {
      await deleteAdminUser(id);
      loadAdmins();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not delete admin.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-black uppercase text-red-600">Roles</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">
          Admin roles
        </h1>
        <p className="mt-2 text-slate-500">
          Super admins manage users, managers manage catalog operations, and
          staff handle daily order flow.
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form
          onSubmit={submit}
          className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-red-50 text-red-600">
              <ShieldCheck size={20} />
            </span>
            <h2 className="text-lg font-black text-slate-950">
              Add admin user
            </h2>
          </div>
          <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
          <Input
            label="Password"
            name="password"
            type="password"
            minLength="6"
            value={form.password}
            onChange={handleChange}
            required
          />
          <label className="grid gap-2 text-sm font-bold text-slate-600">
            Role
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
            >
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-lg bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
          >
            Create admin
          </button>
        </form>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {message && (
            <p className="border-b border-slate-100 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-600">
              {message}
            </p>
          )}
          <div className="divide-y divide-slate-100">
            {admins.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No admin users to show.
              </div>
            ) : (
              admins.map(admin => (
                <article
                  key={admin._id}
                  className="grid gap-4 p-5 md:grid-cols-[1fr_auto_auto]"
                >
                  <div>
                    <h2 className="font-black text-slate-950">{admin.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{admin.email}</p>
                  </div>
                  <select
                    value={admin.role}
                    onChange={event => changeRole(admin._id, event.target.value)}
                    className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none focus:border-red-300 focus:ring-4 focus:ring-red-50"
                  >
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeAdmin(admin._id)}
                    className="grid h-10 w-10 place-items-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-600">
      {label}
      <input
        {...props}
        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
      />
    </label>
  );
}
