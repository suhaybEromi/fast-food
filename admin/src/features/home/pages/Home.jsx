import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  ClipboardList,
  DollarSign,
  Package,
  Timer,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getDashboardStats } from "../../services/dashboard.service";

const statusClass = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  preparing: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  ready: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  out_for_delivery: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

const formatCurrency = value => `IQD ${Number(value || 0).toLocaleString()}`;

export default function Home() {
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await getDashboardStats();
        const stats = response.data || {};

        setDashboard(stats);
        setOrders(Array.isArray(stats.recentOrders) ? stats.recentOrders : []);
      } catch (error) {
        console.error(error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    return [
      {
        label: "Total sales",
        value: formatCurrency(dashboard?.totalSales || 0),
        helper: "All non-cancelled order revenue",
        icon: DollarSign,
      },
      {
        label: "Total orders",
        value: dashboard?.totalOrders ?? orders.length,
        helper: "Orders received",
        icon: ClipboardList,
      },
      {
        label: "Total products",
        value: dashboard?.totalProducts || 0,
        helper: "Foods in the catalog",
        icon: Package,
      },
      {
        label: "Pending orders",
        value: dashboard?.pendingOrders || 0,
        helper: "Waiting for kitchen action",
        icon: Timer,
      },
    ];
  }, [dashboard, orders.length]);

  const topFoods = dashboard?.bestSellingProducts || [];
  const lowStockProducts = dashboard?.lowStockProducts || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-red-600">Dashboard</p>
          <h1 className="mt-1 text-3xl font-black tracking-normal text-slate-950 md:text-4xl">
            Restaurant control center
          </h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Monitor orders, menu availability, and kitchen flow from one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-600"
          >
            Orders
            <ArrowUpRight size={17} />
          </Link>
          <Link
            to="/foods/add"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 transition hover:border-red-200 hover:text-red-600"
          >
            Add food
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(stat => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-500">
                    {stat.label}
                  </p>
                  <strong className="mt-2 block text-2xl font-black text-slate-950">
                    {stat.value}
                  </strong>
                </div>
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-red-50 text-red-600">
                  <Icon size={21} />
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">{stat.helper}</p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Live order flow
              </h2>
              <p className="text-sm text-slate-500">
                Latest kitchen tickets and payment state.
              </p>
            </div>
            {loading && (
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                Loading
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead className="bg-slate-50 text-left text-xs font-black uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr className="border-t border-slate-100">
                    <td
                      colSpan="5"
                      className="px-5 py-10 text-center text-sm font-semibold text-slate-500"
                    >
                      No recent orders yet.
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 6).map(order => (
                    <tr
                      key={order._id}
                      className="border-t border-slate-100 text-sm hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-black text-slate-950">
                        {order.orderNumber}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {order.customer?.name || "Guest"}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {order.items?.length || 0} items
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black capitalize ${
                            statusClass[order.status] || statusClass.pending
                          }`}
                        >
                          {order.status?.replaceAll("_", " ") || "pending"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-black text-slate-950">
                        {formatCurrency(order.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Best-selling products
              </h2>
              <p className="text-sm text-slate-500">
                Ranked by delivered and live order quantity.
              </p>
            </div>
            <Activity className="text-red-500" size={22} />
          </div>

          <div className="space-y-3">
            {topFoods.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm font-semibold text-slate-500">
                No sales data yet.
              </div>
            ) : (
              topFoods.map(item => (
                <div
                  key={item._id || item.title}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3"
                >
                  <div>
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-500">
                      {formatCurrency(item.sales || item.price || 0)}
                    </p>
                  </div>
                  <span className="rounded-lg bg-white px-3 py-1 text-sm font-black text-slate-700">
                    {item.quantity ?? 0} sold
                  </span>
                </div>
              ))
            )}
          </div>

          {lowStockProducts.length > 0 && (
            <div className="mt-5 border-t border-slate-100 pt-5">
              <h3 className="text-sm font-black uppercase text-red-600">
                Low stock alert
              </h3>
              <div className="mt-3 grid gap-2">
                {lowStockProducts.map(item => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-sm"
                  >
                    <span className="font-bold text-red-900">{item.title}</span>
                    <b className="text-red-700">{item.stock} left</b>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
