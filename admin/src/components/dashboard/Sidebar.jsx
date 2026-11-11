import {
  ClipboardList,
  FileClock,
  Images,
  LayoutDashboard,
  MapPinned,
  Package,
  ShieldCheck,
  Shapes,
  Store,
  Tags,
  Bike,
  BarChart3,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../../features/auth/AuthContext";

const Sidebar = () => {
  const { admin } = useAuth();
  const navItem =
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white";

  const activeNavItem =
    "bg-red-500 text-white shadow-md shadow-red-950/20 hover:bg-red-500 hover:text-white";

  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/orders", label: "Orders", icon: ClipboardList },
    { to: "/foods", label: "Foods", icon: Package },
    { to: "/categories", label: "Categories", icon: Shapes },
    { to: "/coupons", label: "Coupons", icon: Tags },
    { to: "/banners", label: "Banners", icon: Images },
    { to: "/delivery-zones", label: "Zones", icon: MapPinned },
    { to: "/drivers", label: "Drivers", icon: Bike },
    { to: "/audit-logs", label: "Audit logs", icon: FileClock },
    { to: "/admins", label: "Admins", icon: ShieldCheck },
    { to: "/security", label: "Security", icon: ShieldCheck },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-[#17212b] lg:flex">
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-red-500 text-white">
            <Store size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">FireFast</h1>
            <p className="text-sm font-medium text-slate-400">Admin console</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map(item => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeNavItem : ""}`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white font-bold text-slate-900">
            {(admin?.name || "A").charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="font-semibold text-white">{admin?.name || "Admin"}</p>
            <p className="max-w-[170px] truncate text-sm text-slate-400">
              {admin?.role || admin?.email || "Administrator"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
