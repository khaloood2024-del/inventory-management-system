import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AppDialog } from "../ui/Dialog";
import { FieldWrapper, TextArea, TextInput } from "../ui/Field";
import { AppSelect } from "../ui/Select";
import { AppButton } from "../ui/Button";
import { api, apiErrorMessage } from "../../lib/api";
import type { Category, Product } from "../../lib/types";
import { useAppToast } from "../ui/Toast";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  categories: Category[];
  onSaved: () => void;
}

const emptyForm = { code: "", name: "", categoryId: "", quantity: "0", price: "0", description: "" };

export function ProductFormDialog({ open, onOpenChange, product, categories, onSaved }: ProductFormDialogProps) {
  const toast = useAppToast();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setError("");
      if (product) {
        setForm({
          code: product.code,
          name: product.name,
          categoryId: product.categoryId,
          quantity: String(product.quantity),
          price: String(product.price),
          description: product.description ?? "",
        });
      } else {
        setForm({ ...emptyForm, categoryId: categories[0]?.id ?? "" });
      }
    }
  }, [open, product, categories]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      code: form.code,
      name: form.name,
      categoryId: form.categoryId,
      quantity: form.quantity,
      price: form.price,
      description: form.description,
    };
    try {
      if (product) {
        await api.put(`/products/${product.id}`, payload);
        toast.success("تم تحديث بيانات المنتج بنجاح");
      } else {
        await api.post("/products", payload);
        toast.success("تمت إضافة المنتج بنجاح");
      }
      onSaved();
    } catch (err) {
      setError(apiErrorMessage(err, "تعذّر حفظ المنتج"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={product ? "تعديل المنتج" : "إضافة منتج جديد"}
      widthClass="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldWrapper label="اسم المنتج" required>
            <TextInput
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              maxLength={120}
            />
          </FieldWrapper>
          <FieldWrapper label="كود المنتج" required>
            <TextInput
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
              maxLength={40}
            />
          </FieldWrapper>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldWrapper label="التصنيف" required>
            <AppSelect
              value={form.categoryId}
              onChange={(v) => setForm({ ...form, categoryId: v })}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="اختر التصنيف"
              className="w-full"
            />
          </FieldWrapper>
          <FieldWrapper label="السعر (ر.س)" required>
            <TextInput
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </FieldWrapper>
        </div>

        <FieldWrapper label="الكمية المتوفرة" required>
          <TextInput
            type="number"
            min="0"
            step="1"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            required
          />
        </FieldWrapper>

        <FieldWrapper label="وصف مختصر">
          <TextArea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            maxLength={1000}
          />
        </FieldWrapper>

        {error && <p className="text-sm text-danger-text">{error}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <AppButton type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            إلغاء
          </AppButton>
          <AppButton type="submit" disabled={saving || !categories.length}>
            {saving ? "جارِ الحفظ..." : product ? "حفظ التعديلات" : "إضافة المنتج"}
          </AppButton>
        </div>
        {!categories.length && (
          <p className="text-xs text-warning-text">
            لا توجد تصنيفات بعد، الرجاء إضافة تصنيف أولاً من صفحة التصنيفات.
          </p>
        )}
      </form>
    </AppDialog>
  );
}
