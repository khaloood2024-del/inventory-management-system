import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AppDialog } from "../ui/Dialog";
import { FieldWrapper, TextInput } from "../ui/Field";
import { AppSelect } from "../ui/Select";
import { AppButton } from "../ui/Button";
import { api, apiErrorMessage } from "../../lib/api";
import type { Role, UserAccount } from "../../lib/types";
import { useAppToast } from "../ui/Toast";
import { useLanguage } from "../../i18n/LanguageContext";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserAccount | null;
  onSaved: () => void;
}

const emptyForm = { username: "", name: "", role: "EMPLOYEE" as Role, password: "" };

export function UserFormDialog({ open, onOpenChange, user, onSaved }: UserFormDialogProps) {
  const { t } = useLanguage();
  const toast = useAppToast();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setError("");
      if (user) {
        setForm({ username: user.username, name: user.name, role: user.role, password: "" });
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      username: form.username,
      name: form.name,
      role: form.role,
      ...(form.password ? { password: form.password } : {}),
    };
    try {
      if (user) {
        await api.put(`/users/${user.id}`, payload);
        toast.success(t("users.updateSuccess"));
      } else {
        await api.post("/users", { ...payload, password: form.password });
        toast.success(t("users.addSuccess"));
      }
      onSaved();
    } catch (err) {
      setError(apiErrorMessage(err, t("users.saveError")));
    } finally {
      setSaving(false);
    }
  }

  const roleOptions = [
    { value: "EMPLOYEE", label: t("role.EMPLOYEE") },
    { value: "ADMIN", label: t("role.ADMIN") },
  ];

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={user ? t("users.editTitle") : t("users.addNew")}
      widthClass="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FieldWrapper label={t("users.name")} required>
          <TextInput
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            maxLength={80}
          />
        </FieldWrapper>

        <FieldWrapper label={t("users.username")} required>
          <TextInput
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            maxLength={40}
          />
        </FieldWrapper>

        <FieldWrapper label={t("users.role")} required>
          <AppSelect
            value={form.role}
            onChange={(v) => setForm({ ...form, role: v as Role })}
            options={roleOptions}
            className="w-full"
          />
        </FieldWrapper>

        <FieldWrapper label={user ? t("users.passwordEditHint") : t("users.password")} required={!user}>
          <TextInput
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!user}
            minLength={6}
          />
        </FieldWrapper>

        {error && <p className="text-sm text-danger-text">{error}</p>}

        <div className="mt-2 flex justify-end gap-2">
          <AppButton type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </AppButton>
          <AppButton type="submit" disabled={saving}>
            {saving ? t("common.saving") : t("common.save")}
          </AppButton>
        </div>
      </form>
    </AppDialog>
  );
}
