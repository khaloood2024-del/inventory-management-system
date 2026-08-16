import type { StockStatus } from "../../lib/types";
import { useLanguage } from "../../i18n/LanguageContext";

const stockStatusMap: Record<StockStatus, { key: "stockStatus.available" | "stockStatus.low" | "stockStatus.out"; className: string }> = {
  available: { key: "stockStatus.available", className: "bg-success-bg text-success-text" },
  low: { key: "stockStatus.low", className: "bg-warning-bg text-warning-text" },
  out: { key: "stockStatus.out", className: "bg-danger-bg text-danger-text" },
};

export function StockBadge({ status }: { status: StockStatus }) {
  const { t } = useLanguage();
  const { key, className } = stockStatusMap[status];
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      {t(key)}
    </span>
  );
}

export function MovementBadge({ type }: { type: "IN" | "OUT" }) {
  const { t } = useLanguage();
  return type === "IN" ? (
    <span className="inline-flex rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success-text">
      {t("movementType.in")}
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-danger-bg px-2.5 py-1 text-xs font-semibold text-danger-text">
      {t("movementType.out")}
    </span>
  );
}
