import { AppDialog } from "../ui/Dialog";
import { StockBadge } from "../ui/Badge";
import type { ReactNode } from "react";
import type { Product } from "../../lib/types";
import { useLanguage } from "../../i18n/LanguageContext";

export function ProductViewDialog({
  product,
  onOpenChange,
}: {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t, locale } = useLanguage();

  if (!product) return null;

  const rows: { label: string; value: ReactNode }[] = [
    { label: t("productView.code"), value: product.code },
    { label: t("productView.category"), value: product.categoryName },
    { label: t("productView.price"), value: `${product.price.toFixed(2)} ${t("common.currency")}` },
    { label: t("productView.quantity"), value: product.quantity },
    { label: t("productView.status"), value: <StockBadge status={product.stockStatus} /> },
    {
      label: t("productView.dateAdded"),
      value: new Date(product.createdAt).toLocaleDateString(locale),
    },
  ];

  return (
    <AppDialog open={!!product} onOpenChange={onOpenChange} title={product.name} widthClass="max-w-md">
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between border-b border-card-border pb-2 text-sm">
            <span className="text-ink-muted">{row.label}</span>
            <span className="font-semibold text-ink">{row.value}</span>
          </div>
        ))}
        {product.description && (
          <div className="pt-1">
            <p className="mb-1 text-sm text-ink-muted">{t("productView.description")}</p>
            <p className="text-sm text-ink">{product.description}</p>
          </div>
        )}
      </div>
    </AppDialog>
  );
}
