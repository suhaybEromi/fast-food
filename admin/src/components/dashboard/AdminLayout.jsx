import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Bell,
  CalendarClock,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Package,
  Search,
  Shapes,
} from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuth } from "../../features/auth/AuthContext";
import {
  getAdminNotifications,
  markAdminNotificationsRead,
} from "../../features/services/notification.service";

const mobileNav = [
  { to: "/", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/orders", label: "Orders", icon: ClipboardList },
  { to: "/foods", label: "Foods", icon: Package },
  { to: "/categories", label: "Categories", icon: Shapes },
];

const formatNotificationTime = value =>
  new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const unreadNotifications = useMemo(
    () => notifications.filter(item => !item.read).length,
    [notifications],
  );

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getAdminNotifications();
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const intervalId = window.setInterval(fetchNotifications, 15000);

    return () => window.clearInterval(intervalId);
  }, [fetchNotifications]);

  const markNotificationsRead = useCallback(async () => {
    try {
      await markAdminNotificationsRead();
      setNotifications(current =>
        current.map(item => ({ ...item, read: true })),
      );
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f5f7f6] text-slate-950">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <label className="flex w-full max-w-xl items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
              <Search size={18} />
              <input
                className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                placeholder="Search orders, menu items, or categories"
              />
            </label>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 md:flex">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-950 text-xs font-black text-white">
                  {(admin?.name || "A").charAt(0).toUpperCase()}
                </span>
                {admin?.name || "Admin"}
              </div>
              <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 sm:flex">
                <CalendarClock size={17} />
                Live shift
              </div>
              <div className="relative">
                <button
                  type="button"
                  aria-label="Notifications"
                  onClick={() => setIsNotificationsOpen(current => !current)}
                  className="relative grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-red-200 hover:text-red-600"
                >
                  <Bell size={18} />
                  {unreadNotifications > 0 && (
                    <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <section className="absolute right-0 top-12 z-30 w-[min(calc(100vw-2rem),380px)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4">
                      <div>
                        <p className="text-xs font-black uppercase text-red-600">
                          Notifications
                        </p>
                        <h2 className="text-lg font-black text-slate-950">
                          New customer orders
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={markNotificationsRead}
                        disabled={unreadNotifications === 0}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 transition hover:border-red-200 hover:text-red-600 disabled:text-slate-300"
                      >
                        Mark read
                      </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto p-3">
                      {notifications.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                          <strong className="block text-slate-900">
                            No notifications yet
                          </strong>
                          <span className="mt-1 block text-sm text-slate-500">
                            New orders will show up here.
                          </span>
                        </div>
                      ) : (
                        <div className="grid gap-2">
                          {notifications.map(item => (
                            <article
                              key={item._id}
                              className={`rounded-lg border p-3 ${
                                item.read
                                  ? "border-slate-200 bg-white"
                                  : "border-red-200 bg-red-50"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <strong className="text-sm text-slate-950">
                                  {item.title}
                                </strong>
                                <span className="text-xs font-bold text-slate-400">
                                  {formatNotificationTime(item.createdAt)}
                                </span>
                              </div>
                              <p className="mt-1 text-sm font-medium text-slate-600">
                                {item.message}
                              </p>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-100 p-3">
                      <NavLink
                        to="/orders"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="block rounded-lg bg-slate-950 px-4 py-3 text-center text-sm font-black text-white transition hover:bg-red-600"
                      >
                        Open order queue
                      </NavLink>
                    </div>
                  </section>
                )}
              </div>
              <button
                type="button"
                aria-label="Logout"
                onClick={logout}
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-red-200 hover:text-red-600"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          <nav className="grid grid-cols-4 gap-2 lg:hidden">
            {mobileNav.map(item => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs font-bold transition ${
                      isActive
                        ? "bg-red-600 text-white"
                        : "bg-slate-50 text-slate-500"
                    }`
                  }
                >
                  <Icon size={17} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </header>

        <main className="min-w-0 flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
