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
import { useLanguage } from "../i18n/LanguageContext";

export function MovementsPage() {
  const { t, locale } = useLanguage();
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

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function loadMovements() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/movements", {
        params: { dateFrom: dateFrom || undefined, dateTo: dateTo || undefined },
      });
      setMovements(data);
    } catch (err) {
      setError(apiErrorMessage(err, t("movements.loadError")));
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
    loadProducts();
  }, []);

  useEffect(() => {
    loadMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo]);

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
      toast.success(type === "IN" ? t("movements.addSuccess") : t("movements.withdrawSuccess"));
      setFormOpen(false);
      loadMovements();
      loadProducts();
    } catch (err) {
      setFormError(apiErrorMessage(err, t("movements.saveError")));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif-display text-3xl font-semibold text-ink">{t("movements.title")}</h1>
        <AppButton icon={<Plus size={16} />} onClick={openAdd} disabled={!products.length}>
          {t("movements.addNew")}
        </AppButton>
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-card-border bg-card p-4 sm:flex-row sm:items-center">
        <label className="flex flex-1 items-center gap-2 text-sm text-ink-muted">
          {t("products.dateFrom")}
          <TextInput type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full" />
        </label>
        <label className="flex flex-1 items-center gap-2 text-sm text-ink-muted">
          {t("products.dateTo")}
          <TextInput type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full" />
        </label>
        {(dateFrom || dateTo) && (
          <button
            type="button"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
            }}
            className="text-sm font-medium text-ink underline decoration-card-border underline-offset-4 hover:decoration-ink sm:shrink-0"
          >
            {t("products.clearDateFilter")}
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-3xl border border-card-border bg-card">
        {loading ? (
          <p className="p-8 text-center text-sm text-ink-muted">{t("common.loading")}</p>
        ) : error ? (
          <p className="p-8 text-center text-sm text-danger-text">{error}</p>
        ) : movements.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-muted">{t("movements.empty")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface">
                <tr className="text-ink-muted">
                  <th className="px-4 py-3 text-start font-medium">{t("table.product")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("movements.type")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("table.quantity")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("table.reason")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("table.date")}</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="border-t border-card-border/70">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{m.productName}</p>
                      <p className="font-mono text-xs text-ink-muted">{m.productCode}</p>
                    </td>
                    <td className="px-4 py-3">
                      <MovementBadge type={m.type} />
                    </td>
                    <td className={`px-4 py-3 font-semibold ${m.type === "IN" ? "text-success-text" : "text-danger-text"}`}>
                      {m.type === "IN" ? "+" : "-"}
                      {m.quantity}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{m.reason}</td>
                    <td className="px-4 py-3 text-ink-muted">{formatDate(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AppDialog open={formOpen} onOpenChange={setFormOpen} title={t("movements.formTitle")} widthClass="max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldWrapper label={t("movements.product")} required>
            <AppSelect
              value={productId}
              onChange={setProductId}
              options={products.map((p) => ({ value: p.id, label: `${p.name} (${p.code})` }))}
              className="w-full"
            />
            {selectedProduct && (
              <p className="text-xs text-ink-muted">{t("movements.currentQty", { quantity: selectedProduct.quantity })}</p>
            )}
          </FieldWrapper>

          <FieldWrapper label={t("movements.type")} required>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("IN")}
                className={`flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                  type === "IN"
                    ? "border-success-text bg-success-bg text-success-text"
                    : "border-card-border text-ink-muted hover:bg-sidebar-hover"
                }`}
              >
                <ArrowUpCircle size={16} />
                {t("movements.stockIn")}
              </button>
              <button
                type="button"
                onClick={() => setType("OUT")}
                className={`flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                  type === "OUT"
                    ? "border-danger-text bg-danger-bg text-danger-text"
                    : "border-card-border text-ink-muted hover:bg-sidebar-hover"
                }`}
              >
                <ArrowDownCircle size={16} />
                {t("movements.stockOut")}
              </button>
            </div>
          </FieldWrapper>

          <FieldWrapper label={t("movements.quantity")} required>
            <TextInput
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </FieldWrapper>

          <FieldWrapper label={t("movements.reason")} required>
            <TextInput
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("movements.reasonPlaceholder")}
              required
              maxLength={200}
            />
          </FieldWrapper>

          {formError && <p className="text-sm text-danger-text">{formError}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <AppButton type="button" variant="secondary" onClick={() => setFormOpen(false)}>
              {t("common.cancel")}
            </AppButton>
            <AppButton type="submit" disabled={saving}>
              {saving ? t("common.saving") : t("movements.submit")}
            </AppButton>
          </div>
        </form>
      </AppDialog>
    </div>
  );
}
