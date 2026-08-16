import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import { api, apiErrorMessage } from "../lib/api";
import type { Category } from "../lib/types";
import { AppButton } from "../components/ui/Button";
import { AppDialog } from "../components/ui/Dialog";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { FieldWrapper, TextInput } from "../components/ui/Field";
import { useAppToast } from "../components/ui/Toast";

export function CategoriesPage() {
  const toast = useAppToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/categories");
      setCategories(data);
    } catch (err) {
      setError(apiErrorMessage(err, "تعذّر تحميل التصنيفات"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openAdd() {
    setEditing(null);
    setName("");
    setFormError("");
    setFormOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setName(category.name);
    setFormError("");
    setFormOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, { name });
        toast.success("تم تحديث التصنيف بنجاح");
      } else {
        await api.post("/categories", { name });
        toast.success("تمت إضافة التصنيف بنجاح");
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(apiErrorMessage(err, "تعذّر حفظ التصنيف"));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/categories/${deleting.id}`);
      toast.success("تم حذف التصنيف بنجاح");
      setDeleting(null);
      load();
    } catch (err) {
      toast.error("تعذّر حذف التصنيف", apiErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif-display text-3xl font-semibold text-ink">التصنيفات</h1>
        <AppButton icon={<Plus size={16} />} onClick={openAdd}>
          إضافة تصنيف جديد
        </AppButton>
      </div>

      {loading ? (
        <p className="text-sm text-ink-muted">جارِ التحميل...</p>
      ) : error ? (
        <p className="text-sm text-danger-text">{error}</p>
      ) : categories.length === 0 ? (
        <p className="rounded-3xl border border-card-border bg-card p-8 text-center text-sm text-ink-muted">
          لا توجد تصنيفات بعد
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 rounded-3xl border border-card-border bg-card p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-bg text-teal-text">
                  <FolderTree size={20} />
                </span>
                <div>
                  <p className="font-bold text-ink">{c.name}</p>
                  <p className="text-xs text-ink-muted">{c.productsCount} منتج</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(c)}
                  className="rounded-full p-2 text-ink hover:bg-sidebar-hover"
                  aria-label="تعديل"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setDeleting(c)}
                  className="rounded-full p-2 text-danger-text hover:bg-danger-bg"
                  aria-label="حذف"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AppDialog open={formOpen} onOpenChange={setFormOpen} title={editing ? "تعديل التصنيف" : "إضافة تصنيف جديد"} widthClass="max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldWrapper label="اسم التصنيف" required>
            <TextInput value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} autoFocus />
          </FieldWrapper>
          {formError && <p className="text-sm text-danger-text">{formError}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <AppButton type="button" variant="secondary" onClick={() => setFormOpen(false)}>
              إلغاء
            </AppButton>
            <AppButton type="submit" disabled={saving}>
              {saving ? "جارِ الحفظ..." : "حفظ"}
            </AppButton>
          </div>
        </form>
      </AppDialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="حذف التصنيف"
        description={`هل أنت متأكد من حذف تصنيف "${deleting?.name}"؟`}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
      />
    </div>
  );
}
