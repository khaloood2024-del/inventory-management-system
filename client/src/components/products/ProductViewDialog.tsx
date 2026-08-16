import { AppDialog } from "../ui/Dialog";
import { StockBadge } from "../ui/Badge";
import type { ReactNode } from "react";
import type { Product } from "../../lib/types";

export function ProductViewDialog({
  product,
  onOpenChange,
}: {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
}) {
  if (!product) return null;

  const rows: { label: string; value: ReactNode }[] = [
    { label: "كود المنتج", value: product.code },
    { label: "التصنيف", value: product.categoryName },
    { label: "السعر", value: `${product.price.toFixed(2)} ر.س` },
    { label: "الكمية المتوفرة", value: product.quantity },
    { label: "الحالة", value: <StockBadge status={product.stockStatus} /> },
    {
      label: "تاريخ الإضافة",
      value: new Date(product.createdAt).toLocaleDateString("ar-SA"),
    },
  ];

  return (
    <AppDialog open={!!product} onOpenChange={onOpenChange} title={product.name} widthClass="max-w-md">
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between border-b border-gray-50 pb-2 text-sm">
            <span className="text-gray-400">{row.label}</span>
            <span className="font-semibold text-gray-800">{row.value}</span>
          </div>
        ))}
        {product.description && (
          <div className="pt-1">
            <p className="mb-1 text-sm text-gray-400">الوصف</p>
            <p className="text-sm text-gray-700">{product.description}</p>
          </div>
        )}
      </div>
    </AppDialog>
  );
}
