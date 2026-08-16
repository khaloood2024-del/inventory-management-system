import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
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
  Languages,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import type { DashboardStats, Product } from "../lib/types";
import { NotificationsPopover } from "./NotificationsPopover";
import { useLanguage } from "../i18n/LanguageContext";

export function Layout() {
  const { user, logout } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebarCollapsed") === "1");
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { to: "/", label: t("nav.dashboard"), icon: LayoutDashboard, end: true },
    { to: "/products", label: t("nav.products"), icon: Package },
    { to: "/categories", label: t("nav.categories"), icon: FolderTree },
    { to: "/movements", label: t("nav.movements"), icon: ArrowLeftRight },
  ];

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then(({ data }) => setStats(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    const query = search.trim();
    if (!query) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(() => {
      api
        .get("/products", { params: { search: query } })
        .then(({ data }: { data: Product[] }) => setSuggestions(data.slice(0, 6)))
        .catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    setShowSuggestions(false);
    navigate(`/products?search=${encodeURIComponent(search)}`);
  }

  function goToSuggestion(p: Product) {
    setShowSuggestions(false);
    setSearch("");
    navigate(`/products?search=${encodeURIComponent(p.code)}`);
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
        <div
          className={`flex items-center justify-between gap-2 border-b border-sidebar-border px-5 py-6 ${
            collapsed ? "md:flex-col md:justify-center md:gap-3 md:px-2" : ""
          }`}
        >
          <div className={`flex items-center gap-2.5 ${collapsed ? "md:justify-center" : ""}`}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white">
              <Boxes size={18} />
            </span>
            <span className={`font-serif-display text-xl font-semibold text-ink ${collapsed ? "md:hidden" : ""}`}>
              {t("nav.appName")}
            </span>
          </div>
          <button
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? t("nav.expand") : t("nav.collapse")}
            aria-label={collapsed ? t("nav.expand") : t("nav.collapse")}
            className="hidden shrink-0 rounded-full p-2 text-ink-muted transition hover:bg-sidebar-hover hover:text-ink md:flex"
          >
            {collapsed ? <PanelRightOpen size={18} /> : <PanelRightClose size={18} />}
          </button>
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
            onClick={logout}
            title={collapsed ? t("nav.logout") : undefined}
            className={`flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-ink-muted transition hover:bg-sidebar-hover hover:text-ink ${
              collapsed ? "md:justify-center md:px-0" : ""
            }`}
          >
            <LogOut size={18} />
            <span className={collapsed ? "md:hidden" : ""}>{t("nav.logout")}</span>
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
            <div ref={searchBoxRef} className="relative hidden sm:block">
              <form onSubmit={submitSearch}>
                <Search
                  size={16}
                  className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-ink-muted"
                />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => e.key === "Escape" && setShowSuggestions(false)}
                  placeholder={t("header.searchPlaceholder")}
                  className="w-56 rounded-full border border-card-border bg-card py-2.5 pe-10 ps-4 text-sm outline-none focus:border-primary-400 md:w-72"
                  autoComplete="off"
                />
              </form>

              {showSuggestions && search.trim() && (
                <div className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-card-border bg-card shadow-[0_8px_30px_rgba(32,31,24,0.1)]">
                  {suggestions.length === 0 ? (
                    <p className="p-3 text-center text-sm text-ink-muted">{t("header.noResults")}</p>
                  ) : (
                    suggestions.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => goToSuggestion(p)}
                        className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-start text-sm transition hover:bg-sidebar-hover"
                      >
                        <span className="truncate font-medium text-ink">{p.name}</span>
                        <span className="shrink-0 font-mono text-xs text-ink-muted">{p.code}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 rounded-full border border-card-border px-3 py-1.5 text-xs font-semibold text-ink-muted transition hover:bg-sidebar-hover hover:text-ink"
              aria-label={t("header.language")}
            >
              <Languages size={14} />
              {language === "ar" ? "EN" : "AR"}
            </button>
            <NotificationsPopover stats={stats} />
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-active text-sm font-bold text-ink">
                {user?.name?.charAt(0) ?? "؟"}
              </span>
              <div className="hidden text-start sm:block">
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
