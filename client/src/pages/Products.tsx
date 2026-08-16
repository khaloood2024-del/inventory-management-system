import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { api, apiErrorMessage } from "../lib/api";
import type { Category, Product } from "../lib/types";
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
        params: { search: search || undefined, categoryId, stockStatus },
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
  }, [search, categoryId, stockStatus]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value === "all" || value === "") next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  }

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    updateParam("search", searchInput);
  }

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
        <h1 className="text-xl font-bold text-gray-900">المنتجات</h1>
        <AppButton icon={<Plus size={16} />} onClick={openAddForm}>
          إضافة منتج جديد
        </AppButton>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <form onSubmit={submitSearch} className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <TextInput
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="بحث عن منتج بالاسم أو الكود..."
            className="w-full pe-9 ps-3"
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

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-center text-sm text-gray-400">جارِ التحميل...</p>
        ) : error ? (
          <p className="p-8 text-center text-sm text-danger-text">{error}</p>
        ) : products.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-400">لا توجد منتجات مطابقة</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface">
                <tr className="text-gray-400">
                  <th className="px-4 py-3 text-right font-medium">الكود</th>
                  <th className="px-4 py-3 text-right font-medium">اسم المنتج</th>
                  <th className="px-4 py-3 text-right font-medium">التصنيف</th>
                  <th className="px-4 py-3 text-right font-medium">الكمية</th>
                  <th className="px-4 py-3 text-right font-medium">السعر</th>
                  <th className="px-4 py-3 text-right font-medium">الحالة</th>
                  <th className="px-4 py-3 text-right font-medium">تاريخ الإضافة</th>
                  <th className="px-4 py-3 text-right font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-surface/60">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.code}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500">{p.categoryName}</td>
                    <td className="px-4 py-3 text-gray-700">{p.quantity}</td>
                    <td className="px-4 py-3 text-gray-700">{p.price.toFixed(2)} ر.س</td>
                    <td className="px-4 py-3">
                      <StockBadge status={p.stockStatus} />
                    </td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(p.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewingProduct(p)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          aria-label="عرض"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEditForm(p)}
                          className="rounded-lg p-2 text-primary-500 hover:bg-primary-50"
                          aria-label="تعديل"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(p)}
                          className="rounded-lg p-2 text-danger-text hover:bg-danger-bg"
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
