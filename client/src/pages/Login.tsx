import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Boxes, Lock, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../lib/api";
import { TextInput } from "../components/ui/Field";
import { AppButton } from "../components/ui/Button";

export function LoginPage() {
  const { user, login, isLoading } = useAuth();
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
      setError(apiErrorMessage(err, "تعذّر تسجيل الدخول"));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500 text-white">
            <Boxes size={24} />
          </span>
          <h1 className="text-xl font-bold text-gray-900">إدارة المخزون</h1>
          <p className="text-sm text-gray-500">سجّل الدخول للمتابعة إلى لوحة التحكم</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">اسم المستخدم</label>
            <div className="relative">
              <User size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <TextInput
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                autoFocus
                className="w-full pe-9 ps-3"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">كلمة المرور</label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <TextInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pe-9 ps-3"
              />
            </div>
          </div>

          {error && <p className="text-sm text-danger-text">{error}</p>}

          <AppButton type="submit" disabled={isLoading} className="mt-2 w-full">
            {isLoading ? "جارِ الدخول..." : "تسجيل الدخول"}
          </AppButton>
        </form>
      </div>
    </div>
  );
}
