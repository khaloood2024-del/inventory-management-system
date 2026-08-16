import type { ButtonHTMLAttributes, ReactNode } from "react";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: ReactNode;
}

const variants: Record<string, string> = {
  primary: "bg-primary-500 text-white hover:bg-primary-600",
  secondary: "bg-card text-ink border border-card-border hover:bg-sidebar-hover",
  ghost: "text-ink-muted hover:bg-sidebar-hover",
  danger: "bg-danger-text text-white hover:bg-red-700",
};

export function AppButton({ variant = "primary", icon, children, className, ...rest }: AppButtonProps) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className ?? ""}`}
    >
      {icon}
      {children}
    </button>
  );
}
