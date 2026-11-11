import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  MapPin,
  Navigation,
  Printer,
  RefreshCw,
  Search,
  Truck,
  XCircle,
} from "lucide-react";

import {
  getOrders,
  assignOrderDriver,
  updateOrderStatus,
  updatePaymentStatus,
} from "../../services/order.service";
import { getDrivers } from "../../services/driver.service";

const statusOptions = [
  { value: "pending", label: "Pending", icon: Clock3 },
  { value: "preparing", label: "Preparing", icon: RefreshCw },
  { value: "ready", label: "Ready", icon: CheckCircle2 },
  { value: "out_for_delivery", label: "On route", icon: Truck },
  { value: "delivered", label: "Delivered", icon: Truck },
  { value: "cancelled", label: "Cancelled", icon: XCircle },
];

const statusClass = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  preparing: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  ready: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  out_for_delivery: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
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

const nextStatusLabel = status =>
  statusOptions.find(option => option.value === status)?.label || status;

const hasLocation = location =>
  Number.isFinite(Number(location?.lat)) && Number.isFinite(Number(location?.lng));

const getMapUrl = location =>
  `https://www.google.com/maps?q=${Number(location.lat)},${Number(location.lng)}`;

const formatLocation = location =>
  `${Number(location.lat).toFixed(5)}, ${Number(location.lng).toFixed(5)}`;

const escapeHtml = value =>
  String(value ?? "").replace(
    /[&<>"']/g,
    char =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[char],
  );

const printInvoice = order => {
  const invoice = window.open("", "_blank", "width=820,height=900");

  if (!invoice) {
    return;
  }

  const itemRows = (order.items || [])
    .map(
      item => `
        <tr>
          <td>${escapeHtml(item.title)}</td>
          <td>${escapeHtml(item.quantity)}</td>
          <td>${escapeHtml(formatCurrency(item.price))}</td>
          <td>${escapeHtml(formatCurrency(item.price * item.quantity))}</td>
        </tr>
      `,
    )
    .join("");
  const locationHtml = hasLocation(order.deliveryLocation)
    ? `<br /><strong>Map:</strong> <a href="${escapeHtml(
        getMapUrl(order.deliveryLocation),
      )}">Open customer location</a>`
    : "";

  invoice.document.write(`
    <html>
      <head>
        <title>Invoice ${escapeHtml(order.orderNumber)}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; padding: 32px; }
          h1 { margin: 0 0 8px; }
          a { color: #dc2626; font-weight: 700; }
          table { border-collapse: collapse; width: 100%; margin-top: 24px; }
          th, td { border-bottom: 1px solid #e2e8f0; padding: 12px; text-align: left; }
          .row { display: flex; justify-content: space-between; gap: 24px; }
          .box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-top: 20px; }
          .total { text-align: right; font-size: 22px; font-weight: 800; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="row">
          <div>
            <h1>FireFast Invoice</h1>
            <strong>${escapeHtml(order.orderNumber)}</strong>
          </div>
          <div>
            <strong>Status:</strong> ${escapeHtml(order.status)}<br />
            <strong>Payment:</strong> ${escapeHtml(order.paymentStatus)}
          </div>
        </div>
        <div class="box">
          <strong>Customer</strong><br />
          ${escapeHtml(order.customer?.name || "Guest")}<br />
          ${escapeHtml(order.customer?.phone || "")}<br />
          ${escapeHtml(order.customer?.address || "")}
          ${locationHtml}
        </div>
        <table>
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div class="total">Total: ${escapeHtml(formatCurrency(order.total))}</div>
      </body>
    </html>
  `);
  invoice.document.close();
  invoice.focus();
  invoice.print();
};

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [drivers, setDrivers] = useState([]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setNotice("");

    try {
      const res = await getOrders();
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      setOrders([]);
      setNotice("Could not load orders. Check the API connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchOrders, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchOrders]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      getDrivers({ limit: 100 })
        .then(response => setDrivers(response.data || []))
        .catch(error => {
          console.error(error);
          setDrivers([]);
        });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

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
    try {
      await updateOrderStatus(order._id, status);
      await fetchOrders();
    } catch (error) {
      console.error(error);
      setNotice(error.message || "The server did not update the order status.");
    }
  };

  const setPaymentStatus = async order => {
    const paymentStatus = order.paymentStatus === "paid" ? "unpaid" : "paid";

    try {
      await updatePaymentStatus(order._id, paymentStatus);
      await fetchOrders();
    } catch (error) {
      console.error(error);
      setNotice(error.message || "The server did not update the payment status.");
    }
  };

  const assignDriver = async (order, driverId) => {
    if (!driverId) return;

    try {
      await assignOrderDriver(order._id, driverId);
      await fetchOrders();
    } catch (error) {
      console.error(error);
      setNotice(error.message || "The server did not assign the driver.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-red-600">Orders</p>
          <h1 className="mt-1 text-3xl font-black tracking-normal text-slate-950 md:text-4xl">
            Order queue
          </h1>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-red-200 hover:text-red-600 sm:w-auto"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
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

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-slate-950 text-white">
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
            <label className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 sm:min-w-72">
              <Search size={17} />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search order or customer"
                className="w-full min-w-0 bg-transparent text-slate-800 outline-none"
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
            filteredOrders.map(order => {
              const hasDeliveryLocation = hasLocation(order.deliveryLocation);

              return (
                <article
                  key={order._id}
                  className="grid gap-4 p-4 sm:p-5 2xl:grid-cols-[minmax(0,1fr)_300px]"
                >
                  <div className="min-w-0 space-y-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
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
                        {order.driverSnapshot?.name && (
                          <p className="mt-1 text-sm text-slate-500">
                            Driver: {order.driverSnapshot.name}{" "}
                            {order.driverSnapshot.phone &&
                              `- ${order.driverSnapshot.phone}`}
                          </p>
                        )}
                      </div>
                      <strong className="text-xl font-black text-slate-950">
                        {formatCurrency(order.total)}
                      </strong>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[minmax(220px,280px)_1fr]">
                      <div className="rounded-lg bg-slate-50 p-4">
                        <p className="font-black text-slate-950">
                          {order.customer?.name || "Guest"}
                        </p>
                        {(order.customer?.email ||
                          order.customerAccount?.email) && (
                          <p className="mt-1 truncate text-sm text-slate-500">
                            {order.customer?.email ||
                              order.customerAccount?.email}
                          </p>
                        )}
                        <p className="mt-1 text-sm text-slate-500">
                          {order.customer?.phone || "No phone"}
                        </p>

                        {hasDeliveryLocation ? (
                          <div className="mt-3 rounded-lg border border-red-100 bg-white p-3">
                            <div className="flex items-start gap-2">
                              <MapPin
                                className="mt-0.5 shrink-0 text-red-600"
                                size={17}
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-black text-slate-900">
                                  Pinned delivery location
                                </p>
                                <p className="mt-0.5 text-xs font-semibold text-slate-500">
                                  {formatLocation(order.deliveryLocation)}
                                </p>
                              </div>
                            </div>
                            <MapLink
                              location={order.deliveryLocation}
                              className="mt-3 w-full"
                            >
                              Open map
                            </MapLink>
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-slate-500">
                            {order.customer?.address || "No address"}
                          </p>
                        )}
                      </div>

                      <div className="overflow-hidden rounded-lg border border-slate-100">
                        {order.items?.map(item => (
                          <div
                            key={`${order._id}-${item.title}`}
                            className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-bold text-slate-900">
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

                  <div className="grid content-start gap-3 rounded-lg bg-slate-50 p-3">
                    {hasDeliveryLocation && (
                      <MapLink location={order.deliveryLocation}>
                        <Navigation size={16} />
                        Customer map
                      </MapLink>
                    )}

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:grid-cols-2">
                      {statusOptions.map(option => {
                        const Icon = option.icon;

                        return (
                          <button
                            type="button"
                            key={option.value}
                            onClick={() => setOrderStatus(order, option.value)}
                            className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-black transition ${
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

                    <button
                      type="button"
                      onClick={() => printInvoice(order)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-black text-slate-700 transition hover:border-red-200 hover:text-red-600"
                    >
                      <Printer size={16} />
                      Print invoice
                    </button>

                    <label className="grid gap-2 text-xs font-black text-slate-600">
                      Driver
                      <select
                        value={order.driver?._id || order.driver || ""}
                        onChange={event => assignDriver(order, event.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-700 outline-none focus:border-red-300 focus:ring-4 focus:ring-red-50"
                      >
                        <option value="">Assign driver</option>
                        {drivers.map(driver => (
                          <option key={driver._id} value={driver._id}>
                            {driver.name} - {driver.status}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

function MapLink({ location, className = "", children }) {
  return (
    <a
      href={getMapUrl(location)}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-black text-white transition hover:bg-slate-950 ${className}`}
    >
      {children}
    </a>
  );
}

export default OrderList;
