import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ArrowDownCircle, ArrowUpCircle, Plus } from "lucide-react";
import { api, apiErrorMessage } from "../lib/api";
import type { Product, StockMovement } from "../lib/types";
import { AppButton } from "../components/ui/Button";
import { AppDialog } from "../components/ui/Dialog";
import { AppSelect } from "../components/ui/Select";
import { FieldWrapper, TextInput } from "../components/ui/Field";
import { MovementBadge } from "../components/ui/Badge";
import { useAppToast } from "../components/ui/Toast";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ar-SA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MovementsPage() {
  const toast = useAppToast();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadMovements() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/movements");
      setMovements(data);
    } catch (err) {
      setError(apiErrorMessage(err, "تعذّر تحميل حركات المخزون"));
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadMovements();
    loadProducts();
  }, []);

  function openAdd() {
    setProductId(products[0]?.id ?? "");
    setType("IN");
    setQuantity("1");
    setReason("");
    setFormError("");
    setFormOpen(true);
  }

  const selectedProduct = products.find((p) => p.id === productId);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await api.post("/movements", { productId, type, quantity, reason });
      toast.success(type === "IN" ? "تمت إضافة الكمية بنجاح" : "تم سحب الكمية بنجاح");
      setFormOpen(false);
      loadMovements();
      loadProducts();
    } catch (err) {
      setFormError(apiErrorMessage(err, "تعذّر تسجيل الحركة"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">حركات المخزون</h1>
        <AppButton icon={<Plus size={16} />} onClick={openAdd} disabled={!products.length}>
          تسجيل حركة جديدة
        </AppButton>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-center text-sm text-gray-400">جارِ التحميل...</p>
        ) : error ? (
          <p className="p-8 text-center text-sm text-danger-text">{error}</p>
        ) : movements.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-400">لا توجد حركات مخزون بعد</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface">
                <tr className="text-gray-400">
                  <th className="px-4 py-3 text-right font-medium">المنتج</th>
                  <th className="px-4 py-3 text-right font-medium">نوع الحركة</th>
                  <th className="px-4 py-3 text-right font-medium">الكمية</th>
                  <th className="px-4 py-3 text-right font-medium">السبب</th>
                  <th className="px-4 py-3 text-right font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="border-t border-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800">{m.productName}</p>
                      <p className="font-mono text-xs text-gray-400">{m.productCode}</p>
                    </td>
                    <td className="px-4 py-3">
                      <MovementBadge type={m.type} />
                    </td>
                    <td className={`px-4 py-3 font-semibold ${m.type === "IN" ? "text-success-text" : "text-danger-text"}`}>
                      {m.type === "IN" ? "+" : "-"}
                      {m.quantity}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{m.reason}</td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AppDialog open={formOpen} onOpenChange={setFormOpen} title="تسجيل حركة مخزون جديدة" widthClass="max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldWrapper label="المنتج" required>
            <AppSelect
              value={productId}
              onChange={setProductId}
              options={products.map((p) => ({ value: p.id, label: `${p.name} (${p.code})` }))}
              className="w-full"
            />
            {selectedProduct && (
              <p className="text-xs text-gray-400">الكمية المتوفرة حالياً: {selectedProduct.quantity}</p>
            )}
          </FieldWrapper>

          <FieldWrapper label="نوع الحركة" required>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("IN")}
                className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                  type === "IN"
                    ? "border-success-text bg-success-bg text-success-text"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <ArrowUpCircle size={16} />
                إضافة كمية
              </button>
              <button
                type="button"
                onClick={() => setType("OUT")}
                className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                  type === "OUT"
                    ? "border-danger-text bg-danger-bg text-danger-text"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <ArrowDownCircle size={16} />
                سحب كمية
              </button>
            </div>
          </FieldWrapper>

          <FieldWrapper label="الكمية" required>
            <TextInput
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </FieldWrapper>

          <FieldWrapper label="سبب الحركة" required>
            <TextInput
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: توريد من المورد، بيع، جرد دوري..."
              required
              maxLength={200}
            />
          </FieldWrapper>

          {formError && <p className="text-sm text-danger-text">{formError}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <AppButton type="button" variant="secondary" onClick={() => setFormOpen(false)}>
              إلغاء
            </AppButton>
            <AppButton type="submit" disabled={saving}>
              {saving ? "جارِ الحفظ..." : "تسجيل الحركة"}
            </AppButton>
          </div>
        </form>
      </AppDialog>
    </div>
  );
}
