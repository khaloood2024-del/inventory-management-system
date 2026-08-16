import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Boxes, PackageX, Layers } from "lucide-react";
import { api, apiErrorMessage } from "../lib/api";
import type { DashboardStats } from "../lib/types";
import { MovementBadge } from "../components/ui/Badge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ar-SA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then(({ data }) => setStats(data))
      .catch((err) => setError(apiErrorMessage(err, "تعذّر تحميل الإحصائيات")));
  }, []);

  if (error) {
    return <p className="text-danger-text">{error}</p>;
  }

  if (!stats) {
    return <p className="text-ink-muted">جارِ التحميل...</p>;
  }

  const cards = [
    {
      label: "منتج نفد مخزونه",
      value: stats.outOfStockCount,
      icon: PackageX,
      bg: "bg-danger-bg",
      text: "text-danger-text",
    },
    {
      label: "منتجات منخفضة المخزون",
      value: stats.lowStockCount,
      icon: AlertTriangle,
      bg: "bg-warning-bg",
      text: "text-warning-text",
    },
    {
      label: "إجمالي الكمية في المخزون",
      value: stats.totalQuantity,
      icon: Layers,
      bg: "bg-success-bg",
      text: "text-success-text",
    },
    {
      label: "إجمالي عدد المنتجات",
      value: stats.totalProducts,
      icon: Boxes,
      bg: "bg-sidebar-active",
      text: "text-ink",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif-display text-3xl font-semibold text-ink">لوحة التحكم</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="flex items-center justify-between gap-3 rounded-3xl border border-card-border bg-card p-5"
          >
            <div>
              <p className="font-serif-display text-3xl font-semibold text-ink">{card.value}</p>
              <p className="mt-1 text-sm text-ink-muted">{card.label}</p>
            </div>
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${card.bg} ${card.text}`}>
              <card.icon size={20} />
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-card-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">آخر حركات المخزون</h2>
            <Link to="/movements" className="text-sm font-medium text-ink underline decoration-card-border underline-offset-4 hover:decoration-ink">
              عرض جميع الحركات
            </Link>
          </div>
          {stats.recentMovements.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-muted">لا توجد حركات مخزون بعد</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-card-border text-ink-muted">
                    <th className="py-2 text-right font-medium">المنتج</th>
                    <th className="py-2 text-right font-medium">النوع</th>
                    <th className="py-2 text-right font-medium">الكمية</th>
                    <th className="py-2 text-right font-medium">السبب</th>
                    <th className="py-2 text-right font-medium">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentMovements.map((m) => (
                    <tr key={m.id} className="border-b border-card-border/60 last:border-0">
                      <td className="py-2.5 font-medium text-ink">{m.productName}</td>
                      <td className="py-2.5">
                        <MovementBadge type={m.type} />
                      </td>
                      <td className={`py-2.5 font-semibold ${m.type === "IN" ? "text-success-text" : "text-danger-text"}`}>
                        {m.type === "IN" ? "+" : "-"}
                        {m.quantity}
                      </td>
                      <td className="py-2.5 text-ink-muted">{m.reason}</td>
                      <td className="py-2.5 text-ink-muted">{formatDate(m.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-card-border bg-card p-5">
          <h2 className="mb-4 text-base font-bold text-ink">تنبيهات المخزون المنخفض</h2>
          {stats.lowStockProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-muted">لا توجد منتجات منخفضة المخزون</p>
          ) : (
            <div className="flex flex-col gap-3">
              {stats.lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-danger-bg/60 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-card text-danger-text">
                      <AlertTriangle size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ink">{p.name}</p>
                      <p className="text-xs text-ink-muted">{p.code}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-danger-text">الكمية: {p.quantity}</span>
                </div>
              ))}
              <Link
                to="/products?stockStatus=low"
                className="mt-1 block rounded-full bg-danger-bg py-2.5 text-center text-sm font-semibold text-danger-text hover:bg-danger-bg/70"
              >
                عرض جميع التنبيهات
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
