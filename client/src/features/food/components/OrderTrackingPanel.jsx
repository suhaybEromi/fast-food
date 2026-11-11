import { useEffect, useState } from "react";

import { API_URL, getCustomerOrder } from "../../services/api";

const steps = [
  "pending",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
];

const stepLabels = {
  pending: "Pending",
  preparing: "Prep",
  ready: "Ready",
  out_for_delivery: "On route",
  delivered: "Done",
};

const hasLocation = location =>
  Number.isFinite(Number(location?.lat)) &&
  Number.isFinite(Number(location?.lng));

const getMapUrl = location =>
  `https://www.google.com/maps?q=${Number(location.lat)},${Number(location.lng)}`;

export default function OrderTrackingPanel({ order }) {
  const [liveOrder, setLiveOrder] = useState(order);

  useEffect(() => {
    let eventSource;
    let pollingId;

    try {
      eventSource = new EventSource(`${API_URL}/order/${order._id}/events`, {
        withCredentials: true,
      });
      eventSource.addEventListener("order", event => {
        setLiveOrder(JSON.parse(event.data));
      });
      eventSource.onerror = () => {
        eventSource.close();
        pollingId = window.setInterval(async () => {
          const response = await getCustomerOrder(order._id);
          setLiveOrder(response.data);
        }, 7000);
      };
    } catch {
      pollingId = window.setInterval(async () => {
        const response = await getCustomerOrder(order._id);
        setLiveOrder(response.data);
      }, 7000);
    }

    return () => {
      eventSource?.close();
      window.clearInterval(pollingId);
    };
  }, [order._id]);

  const currentIndex = steps.indexOf(liveOrder.status);

  return (
    <div className="rounded-2xl border border-[#eadfce] bg-[#fffaf2] p-3">
      <div className="grid grid-cols-5 gap-1">
        {steps.map((step, index) => (
          <div key={step} className="grid gap-1">
            <span
              className={`h-2 rounded-full ${
                index <= currentIndex ? "bg-[#f5a400]" : "bg-[#eadfce]"
              }`}
            />
            <span className="truncate text-[10px] font-black text-[#726b61]">
              {stepLabels[step]}
            </span>
          </div>
        ))}
      </div>

      {liveOrder.driverSnapshot?.name && (
        <p className="mt-3 text-xs font-bold text-[#726b61]">
          Driver: {liveOrder.driverSnapshot.name}{" "}
          {liveOrder.driverSnapshot.phone &&
            `- ${liveOrder.driverSnapshot.phone}`}
        </p>
      )}

      {liveOrder.deliveryZoneSnapshot?.name && (
        <p className="mt-1 text-xs font-bold text-[#726b61]">
          Zone: {liveOrder.deliveryZoneSnapshot.name} - ETA{" "}
          {liveOrder.deliveryZoneSnapshot.estimatedMinutes || 30} min
        </p>
      )}

      {hasLocation(liveOrder.deliveryLocation) && (
        <a
          href={getMapUrl(liveOrder.deliveryLocation)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-[#171511] px-3 py-2 text-xs font-black text-white transition hover:bg-[#f5a400] hover:text-[#171511]"
        >
          Open delivery map
        </a>
      )}
    </div>
  );
}
