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
  LogOut,
  Boxes,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import type { DashboardStats } from "../lib/types";
import { NotificationsPopover } from "./NotificationsPopover";

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
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebarCollapsed") === "1");
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then(({ data }) => setStats(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(search)}`);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed z-40 h-full shrink-0 flex-col bg-sidebar text-ink border-e border-sidebar-border transition-all md:static md:flex md:translate-x-0 ${
          collapsed ? "md:w-20" : "md:w-72"
        } w-72 ${sidebarOpen ? "flex translate-x-0" : "hidden -translate-x-full md:flex"}`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-sidebar-border px-5 py-6">
          <div className={`flex items-center gap-2.5 ${collapsed ? "md:w-full md:justify-center" : ""}`}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white">
              <Boxes size={18} />
            </span>
            <span className={`font-serif-display text-xl font-semibold text-ink ${collapsed ? "md:hidden" : ""}`}>
              إدارة المخزون
            </span>
          </div>
          <button
            className="text-ink-muted hover:text-ink md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition ${
                  collapsed ? "md:justify-center md:px-0" : ""
                } ${
                  isActive
                    ? "bg-sidebar-active text-ink font-semibold"
                    : "text-ink-muted hover:bg-sidebar-hover hover:text-ink"
                }`
              }
            >
              <item.icon size={18} />
              <span className={collapsed ? "md:hidden" : ""}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <button
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "توسيع القائمة" : "طي القائمة"}
            className={`mb-1 hidden w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-ink-muted transition hover:bg-sidebar-hover hover:text-ink md:flex ${
              collapsed ? "md:justify-center md:px-0" : ""
            }`}
          >
            {collapsed ? <PanelRightOpen size={18} /> : <PanelRightClose size={18} />}
            <span className={collapsed ? "md:hidden" : ""}>طي القائمة</span>
          </button>
          <button
            onClick={logout}
            title={collapsed ? "تسجيل الخروج" : undefined}
            className={`flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-ink-muted transition hover:bg-sidebar-hover hover:text-ink ${
              collapsed ? "md:justify-center md:px-0" : ""
            }`}
          >
            <LogOut size={18} />
            <span className={collapsed ? "md:hidden" : ""}>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-card-border bg-surface px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="text-ink-muted hover:text-ink md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <form onSubmit={submitSearch} className="relative hidden sm:block">
              <Search
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث عن منتج أو كود..."
                className="w-56 rounded-full border border-card-border bg-card py-2.5 ps-10 pe-4 text-sm outline-none focus:border-primary-400 md:w-72"
              />
            </form>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <NotificationsPopover stats={stats} />
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-active text-sm font-bold text-ink">
                {user?.name?.charAt(0) ?? "؟"}
              </span>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-ink">{user?.name}</p>
                <p className="text-xs text-ink-muted">{user?.role}</p>
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
