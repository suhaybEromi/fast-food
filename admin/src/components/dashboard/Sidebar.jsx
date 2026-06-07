import { LayoutDashboard, Package, Shapes } from "lucide-react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const navItem =
    "flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition-all hover:text-slate-900";

  const activeNavItem =
    "bg-blue-600 text-white shadow-md hover:bg-blue-600 hover:text-white";

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="border-b border-slate-200 p-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Admin<span className="text-blue-600">Panel</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${navItem} ${isActive ? activeNavItem : ""}`
          }
        >
          <Package size={20} />
          <span>Products</span>
        </NavLink>

        <NavLink
          to="/categories"
          className={({ isActive }) =>
            `${navItem} ${isActive ? activeNavItem : ""}`
          }
        >
          <Shapes size={20} />
          <span>Categories</span>
        </NavLink>
      </nav>

      {/* User */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
            S
          </div>

          <div>
            <p className="font-medium text-slate-800">Suhayb</p>
            <p className="text-sm text-slate-500">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
