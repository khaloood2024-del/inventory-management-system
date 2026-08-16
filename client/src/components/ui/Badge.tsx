import type { StockStatus } from "../../lib/types";

const stockStatusMap: Record<StockStatus, { label: string; className: string }> = {
  available: { label: "متوفر", className: "bg-success-bg text-success-text" },
  low: { label: "منخفض", className: "bg-warning-bg text-warning-text" },
  out: { label: "نفد المخزون", className: "bg-danger-bg text-danger-text" },
};

export function StockBadge({ status }: { status: StockStatus }) {
  const { label, className } = stockStatusMap[status];
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}

export function MovementBadge({ type }: { type: "IN" | "OUT" }) {
  return type === "IN" ? (
    <span className="inline-flex rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success-text">
      إضافة
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-danger-bg px-2.5 py-1 text-xs font-semibold text-danger-text">
      سحب
    </span>
  );
}
