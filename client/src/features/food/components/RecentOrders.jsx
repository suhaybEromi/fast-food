import { formatCurrency } from "../utils/foodHelpers";
import OrderTrackingPanel from "./OrderTrackingPanel";

const statusClass = {
  pending: "bg-[#fff4d8] text-[#9b6500]",
  preparing: "bg-[#e8f1ff] text-[#2563eb]",
  ready: "bg-[#e9f8ef] text-[#287a4f]",
  out_for_delivery: "bg-[#fff4d8] text-[#9b6500]",
  delivered: "bg-[#e9f8ef] text-[#287a4f]",
  cancelled: "bg-red-50 text-red-700",
};

const statusLabel = status => (status || "pending").replaceAll("_", " ");

export default function RecentOrders({
  orders,
  language,
  text,
  onReviewFood,
  onReorder,
}) {
  return (
    <section className="rounded-3xl border border-[#e7e2db] bg-white p-5 shadow-[0_12px_36px_rgba(39,32,24,0.06)] sm:p-7">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-[#d77600]">
            {text.orders}
          </p>
          <h2 className="text-3xl font-black tracking-[-0.04em] text-[#24211d]">
            {text.recentOrders}
          </h2>
        </div>
        {orders.length > 0 && (
          <span className="rounded-lg bg-[#fff0d9] px-3 py-1.5 text-xs font-black text-[#9b6500]">
            {orders.length}
          </span>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#eadfce] bg-[#fff8ec]/80 p-5 text-center">
          <strong className="block text-[#171511]">{text.noOrders}</strong>
          <span className="mt-1 block text-sm font-medium text-[#726b61]">
            {text.noOrdersHint}
          </span>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orders.map(order => (
            <article
              className="grid content-start gap-4 rounded-2xl border border-[#e9e5de] bg-[#fdfcfb] p-5"
              key={order._id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="block truncate text-lg font-black text-[#24211d]">
                    {order.orderNumber}
                  </strong>
                  <span className="mt-1 block text-sm font-bold text-[#726b61]">
                    {order.items?.length || 0} {text.itemCount}
                  </span>
                </div>

                <b className="shrink-0 text-[#287a4f]">
                  {formatCurrency(order.total, language)}
                </b>
              </div>

              <span
                className={`w-fit rounded-lg px-3 py-1 text-xs font-black capitalize ${
                  statusClass[order.status] || statusClass.pending
                }`}
              >
                {statusLabel(order.status)}
              </span>

              {!["delivered", "cancelled"].includes(order.status) && (
                <OrderTrackingPanel order={order} />
              )}

              <button
                type="button"
                onClick={() => onReorder(order)}
                className="rounded-xl border border-[#e3ded7] bg-white px-3 py-2.5 text-sm font-black text-[#24211d] transition hover:border-[#ff9f1c] hover:bg-[#fffaf2]"
              >
                Reorder
              </button>

              {order.status === "delivered" && (
                <div className="grid gap-2 border-t border-[#eadfce] pt-3">
                  {order.items
                    ?.filter(item => item.food && !item.reviewed)
                    .map(item => (
                      <button
                        type="button"
                        key={`${order._id}-${item.food}-${item.title}`}
                        onClick={() => onReviewFood(order, item)}
                        className="rounded-xl border border-[#e3ded7] bg-white px-3 py-2.5 text-sm font-black text-[#24211d] transition hover:border-[#ff9f1c] hover:bg-[#fffaf2]"
                      >
                        Rate {item.title}
                      </button>
                    ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
