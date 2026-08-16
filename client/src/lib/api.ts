import axios from "axios";

export const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["X-Lang"] = localStorage.getItem("language") === "en" ? "en" : "ar";
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export function apiErrorMessage(error: unknown, fallback?: string): string {
  const defaultFallback = localStorage.getItem("language") === "en" ? "An unexpected error occurred" : "حدث خطأ غير متوقع";
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || fallback || defaultFallback;
  }
  return fallback || defaultFallback;
}
