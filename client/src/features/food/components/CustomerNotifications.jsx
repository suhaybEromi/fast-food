export default function CustomerNotifications({
  notifications,
  onClose,
  onMarkRead,
}) {
  const unreadCount = notifications.filter(item => !item.read).length;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <button
        type="button"
        aria-label="Close notifications"
        className="pointer-events-auto absolute inset-0 h-full w-full cursor-default bg-transparent"
        onClick={onClose}
      />

      <section className="pointer-events-auto absolute right-4 top-24 w-[min(calc(100vw-2rem),380px)] overflow-hidden rounded-3xl border border-[#eadfce] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-[#eadfce] p-4">
          <div>
            <p className="text-xs font-black uppercase text-[#c97a00]">
              Notifications
            </p>
            <h2 className="text-xl font-black text-[#171511]">
              Order updates
            </h2>
          </div>

          <button
            type="button"
            onClick={onMarkRead}
            disabled={unreadCount === 0}
            className="rounded-full border border-[#eadfce] bg-[#fffaf2] px-3 py-2 text-xs font-black text-[#171511] transition hover:border-[#f5a400] disabled:text-[#b2a796]"
          >
            Mark read
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-3">
          {notifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#eadfce] bg-[#fff8ec]/80 p-5 text-center">
              <strong className="block text-[#171511]">No updates yet</strong>
              <span className="mt-1 block text-sm font-medium text-[#726b61]">
                Status changes for your orders will appear here.
              </span>
            </div>
          ) : (
            <div className="grid gap-2">
              {notifications.map(item => (
                <article
                  key={item._id}
                  className={`rounded-2xl border p-3 ${
                    item.read
                      ? "border-[#eadfce] bg-white"
                      : "border-[#f5a400] bg-[#fff8ec]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <strong className="text-sm text-[#171511]">
                      {item.title}
                    </strong>
                    {!item.read && (
                      <span className="rounded-full bg-[#f5a400] px-2 py-1 text-[10px] font-black uppercase text-[#171511]">
                        New
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-medium text-[#726b61]">
                    {item.message}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
