import type { ButtonHTMLAttributes, ReactNode } from "react";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: ReactNode;
}

const variants: Record<string, string> = {
  primary: "bg-primary-500 text-white hover:bg-primary-600 shadow-sm shadow-primary-200",
  secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
  ghost: "text-gray-500 hover:bg-gray-100",
  danger: "bg-danger-text text-white hover:bg-red-600",
};

export function AppButton({ variant = "primary", icon, children, className, ...rest }: AppButtonProps) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className ?? ""}`}
    >
      {icon}
      {children}
    </button>
  );
}
