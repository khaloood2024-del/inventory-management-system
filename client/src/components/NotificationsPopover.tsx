import { Popover } from "@base-ui/react/popover";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { AlertTriangle, Bell, PackageX } from "lucide-react";
import type { DashboardStats } from "../lib/types";
import { useLanguage } from "../i18n/LanguageContext";

export function NotificationsPopover({ stats }: { stats: DashboardStats | null }) {
  const { t } = useLanguage();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const totalAlertCount = stats ? stats.lowStockCount + stats.outOfStockCount : 0;
  const alertCount = Math.max(0, totalAlertCount - dismissedIds.size);
  const visibleAlerts = stats?.lowStockProducts.filter((p) => !dismissedIds.has(p.id)) ?? [];

  useEffect(() => {
    setDismissedIds(new Set());
  }, [stats?.lowStockProducts]);

  function dismiss(id: string) {
    setDismissedIds((prev) => new Set(prev).add(id));
  }

  return (
    <Popover.Root>
      <Popover.Trigger
        className="relative text-ink-muted outline-none hover:text-ink"
        aria-label={t("header.notifications")}
      >
        <Bell size={20} />
        {alertCount > 0 && (
          <span className="absolute -start-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger-text text-[10px] font-bold text-white">
            {alertCount > 9 ? "9+" : alertCount}
          </span>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} align="end" side="bottom">
          <Popover.Popup className="z-50 w-80 rounded-3xl border border-card-border bg-card p-3 shadow-[0_8px_30px_rgba(32,31,24,0.1)] outline-none transition-all data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0">
            <div className="flex items-center justify-between px-2 py-1">
              <p className="font-serif-display text-lg font-semibold text-ink">{t("notifications.title")}</p>
              {alertCount > 0 && (
                <span className="rounded-full bg-danger-bg px-2 py-0.5 text-xs font-semibold text-danger-text">
                  {alertCount}
                </span>
              )}
            </div>

            {!stats || visibleAlerts.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-ink-muted">{t("notifications.empty")}</p>
            ) : (
              <div className="mt-1 flex max-h-80 flex-col gap-1 overflow-y-auto">
                {visibleAlerts.map((p) => (
                  <Popover.Close
                    key={p.id}
                    nativeButton={false}
                    onClick={() => dismiss(p.id)}
                    render={
                      <Link
                        to={`/products?search=${encodeURIComponent(p.code)}`}
                        className="flex items-center gap-3 rounded-2xl px-2 py-2 text-start hover:bg-sidebar-hover"
                      />
                    }
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        p.quantity <= 0 ? "bg-danger-bg text-danger-text" : "bg-warning-bg text-warning-text"
                      }`}
                    >
                      {p.quantity <= 0 ? <PackageX size={16} /> : <AlertTriangle size={16} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                      <p className="text-xs text-ink-muted">
                        {p.code} · {t("notifications.quantity", { quantity: p.quantity })}
                      </p>
                    </span>
                  </Popover.Close>
                ))}
              </div>
            )}

            <Popover.Close
              nativeButton={false}
              render={
                <Link
                  to="/products?stockStatus=low"
                  className="mt-2 block rounded-full bg-sidebar-hover py-2 text-center text-sm font-semibold text-ink hover:bg-sidebar-active"
                />
              }
            >
              {t("notifications.viewAllLow")}
            </Popover.Close>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
