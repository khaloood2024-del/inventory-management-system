import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AppDialog } from "../ui/Dialog";
import { FieldWrapper, TextArea, TextInput } from "../ui/Field";
import { AppSelect } from "../ui/Select";
import { AppButton } from "../ui/Button";
import { api, apiErrorMessage } from "../../lib/api";
import type { Category, Product } from "../../lib/types";
import { useAppToast } from "../ui/Toast";
import { useLanguage } from "../../i18n/LanguageContext";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  categories: Category[];
  onSaved: () => void;
}

const emptyForm = { code: "", name: "", categoryId: "", quantity: "0", price: "0", description: "" };

export function ProductFormDialog({ open, onOpenChange, product, categories, onSaved }: ProductFormDialogProps) {
  const { t } = useLanguage();
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
        toast.success(t("productForm.updateSuccess"));
      } else {
        await api.post("/products", payload);
        toast.success(t("productForm.addSuccess"));
      }
      onSaved();
    } catch (err) {
      setError(apiErrorMessage(err, t("productForm.saveError")));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={product ? t("productForm.editTitle") : t("productForm.addTitle")}
      widthClass="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldWrapper label={t("productForm.name")} required>
            <TextInput
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              maxLength={120}
            />
          </FieldWrapper>
          <FieldWrapper label={t("productForm.code")} required>
            <TextInput
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
              maxLength={40}
            />
          </FieldWrapper>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldWrapper label={t("productForm.category")} required>
            <AppSelect
              value={form.categoryId}
              onChange={(v) => setForm({ ...form, categoryId: v })}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              placeholder={t("productForm.categoryPlaceholder")}
              className="w-full"
            />
          </FieldWrapper>
          <FieldWrapper label={t("productForm.price")} required>
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

        <FieldWrapper label={t("productForm.quantity")} required>
          <TextInput
            type="number"
            min="0"
            step="1"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            required
          />
        </FieldWrapper>

        <FieldWrapper label={t("productForm.description")}>
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
            {t("common.cancel")}
          </AppButton>
          <AppButton type="submit" disabled={saving || !categories.length}>
            {saving ? t("common.saving") : product ? t("productForm.saveChanges") : t("productForm.addButton")}
          </AppButton>
        </div>
        {!categories.length && (
          <p className="text-xs text-warning-text">{t("productForm.noCategories")}</p>
        )}
      </form>
    </AppDialog>
  );
}
