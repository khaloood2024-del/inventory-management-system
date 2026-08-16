import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Boxes, Lock, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../lib/api";
import { TextInput } from "../components/ui/Field";
import { AppButton } from "../components/ui/Button";
import { useLanguage } from "../i18n/LanguageContext";

export function LoginPage() {
  const { user, login, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(apiErrorMessage(err, t("auth.loginFailed")));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-3xl border border-card-border bg-card p-8 shadow-[0_8px_30px_rgba(32,31,24,0.06)]">
        <div className="mb-7 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500 text-white">
            <Boxes size={24} />
          </span>
          <h1 className="font-serif-display text-2xl font-semibold text-ink">{t("nav.appName")}</h1>
          <p className="text-sm text-ink-muted">{t("auth.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">{t("auth.username")}</label>
            <div className="relative">
              <User size={16} className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-ink-muted" />
              <TextInput
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                autoFocus
                className="w-full rounded-full pe-10 ps-4"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">{t("auth.password")}</label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-ink-muted" />
              <TextInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-full pe-10 ps-4"
              />
            </div>
          </div>

          {error && <p className="text-sm text-danger-text">{error}</p>}

          <AppButton type="submit" disabled={isLoading} className="mt-2 w-full">
            {isLoading ? t("auth.loggingIn") : t("auth.loginButton")}
          </AppButton>
        </form>
      </div>
    </div>
  );
}
