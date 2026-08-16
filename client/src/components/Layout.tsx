import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ArrowLeftRight,
  Menu,
  X,
  Search,
  Bell,
  LogOut,
  Boxes,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const navItems = [
  { to: "/", label: "لوحة التحكم", icon: LayoutDashboard, end: true },
  { to: "/products", label: "المنتجات", icon: Package },
  { to: "/categories", label: "التصنيفات", icon: FolderTree },
  { to: "/movements", label: "حركات المخزون", icon: ArrowLeftRight },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then(({ data }) => setAlertCount(data.lowStockCount + data.outOfStockCount))
      .catch(() => {});
  }, []);

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(search)}`);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed z-40 h-full w-72 shrink-0 flex-col bg-sidebar text-gray-300 transition-transform md:static md:flex md:translate-x-0 ${
          sidebarOpen ? "flex translate-x-0" : "hidden -translate-x-full md:flex"
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-sidebar-border px-5 py-5">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 text-white">
              <Boxes size={18} />
            </span>
            <span className="text-base font-bold text-white">إدارة المخزون</span>
          </div>
          <button
            className="text-gray-400 hover:text-white md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-primary-500 text-white shadow-lg shadow-primary-900/30"
                    : "text-gray-300 hover:bg-sidebar-hover hover:text-white"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-sidebar-hover hover:text-white"
          >
            <LogOut size={18} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="text-gray-500 hover:text-gray-700 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <form onSubmit={submitSearch} className="relative hidden sm:block">
              <Search
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث عن منتج أو كود..."
                className="w-56 rounded-lg border border-gray-200 bg-surface py-2 pe-9 ps-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 md:w-72"
              />
            </form>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate("/")}
              className="relative text-gray-500 hover:text-gray-700"
              aria-label="التنبيهات"
            >
              <Bell size={20} />
              {alertCount > 0 && (
                <span className="absolute -left-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger-text text-[10px] font-bold text-white">
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                {user?.name?.charAt(0) ?? "؟"}
              </span>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
