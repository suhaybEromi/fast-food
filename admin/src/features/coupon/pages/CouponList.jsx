import { useCallback, useEffect, useState } from "react";
import { Tag, Trash2 } from "lucide-react";

import {
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCoupon,
} from "../../services/coupon.service";

const emptyForm = {
  code: "",
  percentage: 10,
  expiresAt: "",
  status: "active",
  usageLimit: 0,
};

const formatDate = value =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

export default function CouponList() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCoupons = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getCoupons({ limit: 100 });
      setCoupons(response.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not load coupons.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadCoupons, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadCoupons]);

  const handleChange = event => {
    setForm(current => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const submit = async event => {
    event.preventDefault();
    setMessage("");

    try {
      if (editingId) {
        await updateCoupon(editingId, form);
      } else {
        await createCoupon(form);
      }

      setForm(emptyForm);
      setEditingId("");
      setMessage("Coupon saved.");
      loadCoupons();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not save coupon.");
    }
  };

  const editCoupon = coupon => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code,
      percentage: coupon.percentage,
      expiresAt: formatDate(coupon.expiresAt),
      status: coupon.status,
      usageLimit: coupon.usageLimit || 0,
    });
  };

  const removeCoupon = async id => {
    if (!globalThis.confirm("Delete this coupon?")) return;

    try {
      await deleteCoupon(id);
      loadCoupons();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not delete coupon.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-black uppercase text-red-600">Coupons</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">
          Discounts and coupon codes
        </h1>
        <p className="mt-2 text-slate-500">
          Create percentage discounts with expiry dates and optional limits.
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form
          onSubmit={submit}
          className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-red-50 text-red-600">
              <Tag size={20} />
            </span>
            <h2 className="text-lg font-black text-slate-950">
              {editingId ? "Edit coupon" : "Add coupon"}
            </h2>
          </div>

          <Input label="Code" name="code" value={form.code} onChange={handleChange} required />
          <Input
            label="Percentage"
            name="percentage"
            type="number"
            min="1"
            max="90"
            value={form.percentage}
            onChange={handleChange}
            required
          />
          <Input
            label="Expiry date"
            name="expiresAt"
            type="date"
            value={form.expiresAt}
            onChange={handleChange}
            required
          />
          <Input
            label="Usage limit"
            name="usageLimit"
            type="number"
            min="0"
            value={form.usageLimit}
            onChange={handleChange}
          />
          <label className="grid gap-2 text-sm font-bold text-slate-600">
            Status
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <button
            type="submit"
            className="rounded-lg bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
          >
            Save coupon
          </button>
        </form>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {message && (
            <p className="border-b border-slate-100 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-600">
              {message}
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-slate-50 text-left text-xs font-black uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Discount</th>
                  <th className="px-5 py-3">Expiry</th>
                  <th className="px-5 py-3">Used</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-5 py-8 text-center text-slate-500" colSpan="6">
                      Loading coupons...
                    </td>
                  </tr>
                ) : (
                  coupons.map(coupon => (
                    <tr key={coupon._id} className="border-t border-slate-100">
                      <td className="px-5 py-4 font-black text-slate-950">
                        {coupon.code}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {coupon.percentage}%
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(coupon.expiresAt)}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {coupon.usedCount || 0}
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black capitalize text-slate-700">
                          {coupon.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => editCoupon(coupon)}
                            className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-bold text-white transition hover:bg-red-600"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeCoupon(coupon._id)}
                            className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
