import { useEffect, useMemo, useState } from "react";
import { BarChart3, Package, Users, WalletCards } from "lucide-react";

import { getAnalytics } from "../../services/analytics.service";

const formatCurrency = value => `IQD ${Number(value || 0).toLocaleString()}`;

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      getAnalytics()
        .then(response => setAnalytics(response.data))
        .finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const totals = useMemo(() => {
    const sales = analytics?.salesTrend || [];
    const totalSales = sales.reduce((sum, day) => sum + Number(day.sales || 0), 0);
    const totalOrders = sales.reduce((sum, day) => sum + Number(day.orders || 0), 0);

    return [
      {
        label: "30-day sales",
        value: formatCurrency(totalSales),
        icon: BarChart3,
      },
      {
        label: "30-day orders",
        value: totalOrders,
        icon: WalletCards,
      },
      {
        label: "Stock units",
        value: analytics?.inventory?.stockUnits || 0,
        icon: Package,
      },
      {
        label: "Customers",
        value: analytics?.loyalty?.customers || 0,
        icon: Users,
      },
    ];
  }, [analytics]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-black uppercase text-red-600">Analytics</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">
          Sales and operations analytics
        </h1>
        <p className="mt-2 text-slate-500">
          Track sales trends, customer value, stock health, and order state.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {totals.map(item => {
          const Icon = item.icon;

          return (
            <article
              key={item.label}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500">{item.label}</p>
                  <strong className="mt-2 block text-2xl font-black text-slate-950">
                    {loading ? "..." : item.value}
                  </strong>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-red-50 text-red-600">
                  <Icon size={21} />
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">30-day trend</h2>
          <div className="mt-5 grid gap-3">
            {(analytics?.salesTrend || []).map(day => (
              <div key={day._id} className="grid gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-600">{day._id}</span>
                  <b className="text-slate-950">{formatCurrency(day.sales)}</b>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-red-600"
                    style={{
                      width: `${Math.min(
                        (Number(day.sales || 0) /
                          Math.max(
                            ...((analytics?.salesTrend || []).map(item =>
                              Number(item.sales || 0),
                            ) || [1]),
                            1,
                          )) *
                          100,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">Top customers</h2>
          <div className="mt-4 grid gap-3">
            {(analytics?.topCustomers || []).map(customer => (
              <div
                key={customer._id || customer.name}
                className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
              >
                <div>
                  <p className="font-bold text-slate-900">
                    {customer.name || "Customer"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {customer.orders} orders
                  </p>
                </div>
                <b>{formatCurrency(customer.sales)}</b>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
