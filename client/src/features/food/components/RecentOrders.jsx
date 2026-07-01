import { formatCurrency } from "../utils/foodHelpers";

const statusClass = {
  pending: "bg-[#fff4d8] text-[#9b6500]",
  preparing: "bg-[#e8f1ff] text-[#2563eb]",
  ready: "bg-[#e9f8ef] text-[#287a4f]",
  delivered: "bg-[#e9f8ef] text-[#287a4f]",
  cancelled: "bg-red-50 text-red-700",
};

export default function RecentOrders({ orders, language, text }) {
  return (
    <section className="rounded-4xl border border-[#eadfce] bg-white/75 p-5 shadow-[0_18px_48px_rgba(57,42,23,0.08)]">
      <div className="mb-4">
        <p className="mb-1 text-xs font-black uppercase text-[#c97a00]">
          {text.orders}
        </p>
        <h2 className="text-2xl font-black text-[#171511]">
          My orders
        </h2>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#eadfce] bg-[#fff8ec]/80 p-5 text-center">
          <strong className="block text-[#171511]">{text.noOrders}</strong>
          <span className="mt-1 block text-sm font-medium text-[#726b61]">
            {text.noOrdersHint}
          </span>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map(order => (
            <article
              className="grid gap-3 rounded-3xl border border-[#eadfce] bg-white p-4"
              key={order._id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <strong className="block text-[#171511]">
                    {order.orderNumber}
                  </strong>
                  <span className="mt-1 block text-sm font-bold text-[#726b61]">
                    {order.items?.length || 0} {text.itemCount}
                  </span>
                </div>

                <b className="text-[#287a4f]">
                  {formatCurrency(order.total, language)}
                </b>
              </div>

              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-black capitalize ${
                  statusClass[order.status] || statusClass.pending
                }`}
              >
                {order.status || "pending"}
              </span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
