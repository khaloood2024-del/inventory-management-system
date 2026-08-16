import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { api, apiErrorMessage } from "../lib/api";
import type { UserAccount } from "../lib/types";
import { AppButton } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { UserFormDialog } from "../components/users/UserFormDialog";
import { useAppToast } from "../components/ui/Toast";
import { useLanguage } from "../i18n/LanguageContext";
import { useAuth } from "../context/AuthContext";

export function UsersPage() {
  const { t, locale } = useLanguage();
  const { user: currentUser } = useAuth();
  const toast = useAppToast();

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserAccount | null>(null);
  const [deleting, setDeleting] = useState<UserAccount | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(locale, { year: "numeric", month: "2-digit", day: "2-digit" });
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/users");
      setUsers(data);
    } catch (err) {
      setError(apiErrorMessage(err, t("users.loadError")));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(u: UserAccount) {
    setEditing(u);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/users/${deleting.id}`);
      toast.success(t("users.deleteSuccess"));
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(t("users.deleteError"), apiErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif-display text-3xl font-semibold text-ink">{t("users.title")}</h1>
        <AppButton icon={<Plus size={16} />} onClick={openAdd}>
          {t("users.addNew")}
        </AppButton>
      </div>

      <div className="overflow-hidden rounded-3xl border border-card-border bg-card">
        {loading ? (
          <p className="p-8 text-center text-sm text-ink-muted">{t("common.loading")}</p>
        ) : error ? (
          <p className="p-8 text-center text-sm text-danger-text">{error}</p>
        ) : users.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-muted">{t("users.empty")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface">
                <tr className="text-ink-muted">
                  <th className="px-4 py-3 text-start font-medium">{t("users.col.name")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("users.col.username")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("users.col.role")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("users.col.createdAt")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("products.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-card-border/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-active text-ink">
                          <UserRound size={16} />
                        </span>
                        <span className="font-semibold text-ink">
                          {u.name}
                          {u.id === currentUser?.id && (
                            <span className="ms-1 text-xs font-normal text-ink-muted">({t("common.you")})</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">{u.username}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          u.role === "ADMIN" ? "bg-lavender-bg text-lavender-text" : "bg-teal-bg text-teal-text"
                        }`}
                      >
                        {t(`role.${u.role}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(u)}
                          className="rounded-full p-2 text-ink hover:bg-sidebar-hover"
                          aria-label={t("products.edit")}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleting(u)}
                          className="rounded-full p-2 text-danger-text hover:bg-danger-bg"
                          aria-label={t("products.delete")}
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

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editing}
        onSaved={() => {
          setFormOpen(false);
          load();
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t("users.deleteTitle")}
        description={t("users.deleteConfirm", { name: deleting?.name ?? "" })}
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
      />
    </div>
  );
}
