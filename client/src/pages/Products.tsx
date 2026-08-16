import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, Eye, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { api, apiErrorMessage } from "../lib/api";
import type { Category, Product, StockStatus } from "../lib/types";
import { AppButton } from "../components/ui/Button";
import { AppSelect } from "../components/ui/Select";
import { TextInput } from "../components/ui/Field";
import { StockBadge } from "../components/ui/Badge";
import { ProductFormDialog } from "../components/products/ProductFormDialog";
import { ProductViewDialog } from "../components/products/ProductViewDialog";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useAppToast } from "../components/ui/Toast";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-SA", { year: "numeric", month: "2-digit", day: "2-digit" });
}

type SortColumn = "code" | "name" | "categoryName" | "quantity" | "price" | "stockStatus" | "createdAt";
type SortDirection = "asc" | "desc";

const STATUS_RANK: Record<StockStatus, number> = { available: 0, low: 1, out: 2 };

const columns: { key: SortColumn; label: string }[] = [
  { key: "code", label: "الكود" },
  { key: "name", label: "اسم المنتج" },
  { key: "categoryName", label: "التصنيف" },
  { key: "quantity", label: "الكمية" },
  { key: "price", label: "السعر" },
  { key: "stockStatus", label: "الحالة" },
  { key: "createdAt", label: "تاريخ الإضافة" },
];

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useAppToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const categoryId = searchParams.get("categoryId") ?? "all";
  const stockStatus = searchParams.get("stockStatus") ?? "all";
  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo = searchParams.get("dateTo") ?? "";

  const [sortBy, setSortBy] = useState<SortColumn | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const search = searchParams.get("search") ?? "";

  async function loadProducts() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/products", {
        params: {
          search: search || undefined,
          categoryId,
          stockStatus,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        },
      });
      setProducts(data);
    } catch (err) {
      setError(apiErrorMessage(err, "تعذّر تحميل المنتجات"));
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const { data } = await api.get("/categories");
      setCategories(data);
    } catch {
      // ignore, filters just won't populate
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryId, stockStatus, dateFrom, dateTo]);

  function updateParam(key: string, value: string) {
    updateParams({ [key]: value });
  }

  function updateParams(updates: Record<string, string>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value === "all" || value === "") next.delete(key);
      else next.set(key, value);
    }
    setSearchParams(next);
  }

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    updateParam("search", searchInput);
  }

  function toggleSort(column: SortColumn) {
    if (sortBy !== column) {
      setSortBy(column);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortBy(null);
    }
  }

  const sortedProducts = useMemo(() => {
    if (!sortBy) return products;
    const sorted = [...products].sort((a, b) => {
      let diff = 0;
      switch (sortBy) {
        case "quantity":
        case "price":
          diff = a[sortBy] - b[sortBy];
          break;
        case "stockStatus":
          diff = STATUS_RANK[a.stockStatus] - STATUS_RANK[b.stockStatus];
          break;
        case "createdAt":
          diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        default:
          diff = a[sortBy].localeCompare(b[sortBy], "ar");
      }
      return sortDir === "asc" ? diff : -diff;
    });
    return sorted;
  }, [products, sortBy, sortDir]);

  const categoryOptions = useMemo(
    () => [{ value: "all", label: "جميع التصنيفات" }, ...categories.map((c) => ({ value: c.id, label: c.name }))],
    [categories]
  );

  const stockOptions = [
    { value: "all", label: "كل حالات المخزون" },
    { value: "available", label: "متوفر" },
    { value: "low", label: "منخفض" },
    { value: "out", label: "نفد المخزون" },
  ];

  function openAddForm() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function openEditForm(product: Product) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deletingProduct) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/products/${deletingProduct.id}`);
      toast.success("تم حذف المنتج بنجاح");
      setDeletingProduct(null);
      loadProducts();
    } catch (err) {
      toast.error("تعذّر حذف المنتج", apiErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif-display text-3xl font-semibold text-ink">المنتجات</h1>
        <AppButton icon={<Plus size={16} />} onClick={openAddForm}>
          إضافة منتج جديد
        </AppButton>
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-card-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form onSubmit={submitSearch} className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted" />
            <TextInput
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="بحث عن منتج بالاسم أو الكود..."
              className="w-full rounded-full ps-10 pe-4"
            />
          </form>
          <AppSelect
            value={categoryId}
            onChange={(v) => updateParam("categoryId", v)}
            options={categoryOptions}
            className="sm:w-48"
          />
          <AppSelect
            value={stockStatus}
            onChange={(v) => updateParam("stockStatus", v)}
            options={stockOptions}
            className="sm:w-48"
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex flex-1 items-center gap-2 text-sm text-ink-muted">
            من تاريخ
            <TextInput
              type="date"
              value={dateFrom}
              onChange={(e) => updateParam("dateFrom", e.target.value)}
              className="w-full"
            />
          </label>
          <label className="flex flex-1 items-center gap-2 text-sm text-ink-muted">
            إلى تاريخ
            <TextInput
              type="date"
              value={dateTo}
              onChange={(e) => updateParam("dateTo", e.target.value)}
              className="w-full"
            />
          </label>
          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => updateParams({ dateFrom: "", dateTo: "" })}
              className="text-sm font-medium text-ink underline decoration-card-border underline-offset-4 hover:decoration-ink sm:shrink-0"
            >
              مسح تاريخ البحث
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-card-border bg-card">
        {loading ? (
          <p className="p-8 text-center text-sm text-ink-muted">جارِ التحميل...</p>
        ) : error ? (
          <p className="p-8 text-center text-sm text-danger-text">{error}</p>
        ) : products.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-muted">لا توجد منتجات مطابقة</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface">
                <tr className="text-ink-muted">
                  {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3 text-right font-medium">
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className="inline-flex items-center gap-1 hover:text-ink"
                      >
                        {col.label}
                        {sortBy === col.key ? (
                          sortDir === "asc" ? (
                            <ArrowUp size={13} />
                          ) : (
                            <ArrowDown size={13} />
                          )
                        ) : (
                          <ArrowUpDown size={13} className="opacity-40" />
                        )}
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((p) => (
                  <tr key={p.id} className="border-t border-card-border/70 hover:bg-surface/60">
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">{p.code}</td>
                    <td className="px-4 py-3 font-semibold text-ink">{p.name}</td>
                    <td className="px-4 py-3 text-ink-muted">{p.categoryName}</td>
                    <td className="px-4 py-3 text-ink">{p.quantity}</td>
                    <td className="px-4 py-3 text-ink">{p.price.toFixed(2)} ر.س</td>
                    <td className="px-4 py-3">
                      <StockBadge status={p.stockStatus} />
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{formatDate(p.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewingProduct(p)}
                          className="rounded-full p-2 text-ink-muted hover:bg-sidebar-hover hover:text-ink"
                          aria-label="عرض"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEditForm(p)}
                          className="rounded-full p-2 text-ink hover:bg-sidebar-hover"
                          aria-label="تعديل"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(p)}
                          className="rounded-full p-2 text-danger-text hover:bg-danger-bg"
                          aria-label="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
        categories={categories}
        onSaved={() => {
          setFormOpen(false);
          loadProducts();
        }}
      />

      <ProductViewDialog product={viewingProduct} onOpenChange={() => setViewingProduct(null)} />

      <ConfirmDialog
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        title="حذف المنتج"
        description={`هل أنت متأكد من حذف المنتج "${deletingProduct?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
      />
    </div>
  );
}
