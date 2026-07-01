import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  RefreshCw,
  Search,
  Truck,
  XCircle,
} from "lucide-react";

import {
  getOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from "../../services/order.service";

const demoOrders = [
  {
    _id: "demo-order-1",
    orderNumber: "FF-1028",
    customer: {
      name: "Ari Guest",
      phone: "0750 000 0000",
      address: "Kitchen counter pickup",
    },
    items: [
      { title: "Classic Stack Burger", quantity: 2, price: 8500 },
      { title: "Loaded Fries Box", quantity: 1, price: 5000 },
    ],
    status: "preparing",
    paymentStatus: "paid",
    paymentMethod: "cash",
    orderType: "pickup",
    total: 22000,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-order-2",
    orderNumber: "FF-1029",
    customer: {
      name: "Delivery Guest",
      phone: "0770 111 2222",
      address: "Main street, near the park",
    },
    items: [{ title: "Family Combo", quantity: 1, price: 24000 }],
    status: "pending",
    paymentStatus: "unpaid",
    paymentMethod: "wallet",
    orderType: "delivery",
    total: 26720,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-order-3",
    orderNumber: "FF-1030",
    customer: {
      name: "Mina Table",
      phone: "0780 333 4444",
      address: "Delivery zone 2",
    },
    items: [{ title: "Fire Wings", quantity: 3, price: 7000 }],
    status: "ready",
    paymentStatus: "paid",
    paymentMethod: "card",
    orderType: "delivery",
    total: 23630,
    createdAt: new Date().toISOString(),
  },
];

const statusOptions = [
  { value: "pending", label: "Pending", icon: Clock3 },
  { value: "preparing", label: "Preparing", icon: RefreshCw },
  { value: "ready", label: "Ready", icon: CheckCircle2 },
  { value: "delivered", label: "Delivered", icon: Truck },
  { value: "cancelled", label: "Cancelled", icon: XCircle },
];

const statusClass = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  preparing: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  ready: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

const paymentClass = {
  unpaid: "bg-slate-100 text-slate-600",
  paid: "bg-emerald-50 text-emerald-700",
  refunded: "bg-red-50 text-red-700",
};

const formatCurrency = value => `IQD ${Number(value || 0).toLocaleString()}`;

const formatTime = value =>
  new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const isDemoOrder = id => String(id).startsWith("demo-");

const nextStatusLabel = status =>
  statusOptions.find(option => option.value === status)?.label || status;

const OrderList = () => {
  const [orders, setOrders] = useState(demoOrders);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setNotice("");

    try {
      const res = await getOrders();
      setOrders((res.data || []).length ? res.data : demoOrders);
    } catch (error) {
      console.error(error);
      setOrders(demoOrders);
      setNotice("Showing demo orders until the order API is available.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    const search = query.trim().toLowerCase();

    return orders.filter(order => {
      const matchesStatus = filter === "all" || order.status === filter;
      const matchesSearch =
        !search ||
        order.orderNumber?.toLowerCase().includes(search) ||
        order.customer?.name?.toLowerCase().includes(search) ||
        order.customer?.phone?.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [filter, orders, query]);

  const summary = useMemo(
    () =>
      statusOptions.map(option => ({
        ...option,
        count: orders.filter(order => order.status === option.value).length,
      })),
    [orders],
  );

  const setOrderStatus = async (order, status) => {
    setOrders(current =>
      current.map(item => (item._id === order._id ? { ...item, status } : item)),
    );

    if (isDemoOrder(order._id)) return;

    try {
      await updateOrderStatus(order._id, status);
    } catch (error) {
      console.error(error);
      setNotice("Status changed locally. The API did not confirm the update.");
    }
  };

  const setPaymentStatus = async order => {
    const paymentStatus = order.paymentStatus === "paid" ? "unpaid" : "paid";

    setOrders(current =>
      current.map(item =>
        item._id === order._id ? { ...item, paymentStatus } : item,
      ),
    );

    if (isDemoOrder(order._id)) return;

    try {
      await updatePaymentStatus(order._id, paymentStatus);
    } catch (error) {
      console.error(error);
      setNotice("Payment changed locally. The API did not confirm the update.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-red-600">Orders</p>
          <h1 className="mt-1 text-3xl font-black tracking-normal text-slate-950 md:text-4xl">
            Kitchen order queue
          </h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Move tickets from pending to delivered and keep payment state clear.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-red-200 hover:text-red-600"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {summary.map(item => {
          const Icon = item.icon;

          return (
            <button
              type="button"
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`flex items-center justify-between rounded-lg border bg-white p-4 text-left shadow-sm transition ${
                filter === item.value
                  ? "border-red-300 ring-4 ring-red-50"
                  : "border-slate-200 hover:border-red-200"
              }`}
            >
              <div>
                <p className="text-sm font-black text-slate-900">{item.label}</p>
                <span className="text-sm text-slate-500">{item.count} orders</span>
              </div>
              <Icon className="text-red-500" size={21} />
            </button>
          );
        })}
      </div>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-slate-950 text-white">
              <ClipboardList size={21} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Order tickets
              </h2>
              <p className="text-sm text-slate-500">
                {loading ? "Loading orders" : `${filteredOrders.length} visible`}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex min-w-72 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
              <Search size={17} />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search order or customer"
                className="w-full bg-transparent text-slate-800 outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                filter === "all"
                  ? "bg-slate-950 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:text-red-600"
              }`}
            >
              All
            </button>
          </div>
        </div>

        {notice && (
          <p className="border-b border-amber-100 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-800">
            {notice}
          </p>
        )}

        <div className="divide-y divide-slate-100">
          {filteredOrders.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No orders match this view.
            </div>
          ) : (
            filteredOrders.map(order => (
              <article
                key={order._id}
                className="grid gap-5 p-5 xl:grid-cols-[1fr_260px]"
              >
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-black text-slate-950">
                          {order.orderNumber}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black capitalize ${
                            statusClass[order.status] || statusClass.pending
                          }`}
                        >
                          {nextStatusLabel(order.status)}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black capitalize ${
                            paymentClass[order.paymentStatus] ||
                            paymentClass.unpaid
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatTime(order.createdAt)} - {order.orderType} -{" "}
                        {order.paymentMethod}
                      </p>
                    </div>
                    <strong className="text-xl font-black text-slate-950">
                      {formatCurrency(order.total)}
                    </strong>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="font-black text-slate-950">
                        {order.customer?.name || "Guest"}
                      </p>
                      {(order.customer?.email ||
                        order.customerAccount?.email) && (
                        <p className="mt-1 text-sm text-slate-500">
                          {order.customer?.email ||
                            order.customerAccount?.email}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-slate-500">
                        {order.customer?.phone || "No phone"}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {order.customer?.address || "No address"}
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-100">
                      {order.items?.map(item => (
                        <div
                          key={`${order._id}-${item.title}`}
                          className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0"
                        >
                          <div>
                            <p className="font-bold text-slate-900">
                              {item.title}
                            </p>
                            <p className="text-sm text-slate-500">
                              {formatCurrency(item.price)}
                            </p>
                          </div>
                          <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-black text-slate-700">
                            x{item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 rounded-lg bg-slate-50 p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {statusOptions.map(option => {
                      const Icon = option.icon;

                      return (
                        <button
                          type="button"
                          key={option.value}
                          onClick={() => setOrderStatus(order, option.value)}
                          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-black transition ${
                            order.status === option.value
                              ? "bg-slate-950 text-white"
                              : "bg-white text-slate-600 hover:text-red-600"
                          }`}
                        >
                          <Icon size={15} />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setPaymentStatus(order)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                  >
                    Mark payment{" "}
                    {order.paymentStatus === "paid" ? "unpaid" : "paid"}
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default OrderList;
