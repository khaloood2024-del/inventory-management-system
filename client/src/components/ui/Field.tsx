import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

interface FieldWrapperProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FieldWrapper({ label, error, required, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ink">
        {label} {required && <span className="text-danger-text">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-danger-text">{error}</p>}
    </div>
  );
}

const inputClass =
  "rounded-2xl border border-card-border bg-card px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-primary-400 disabled:bg-sidebar-hover";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} resize-none ${props.className ?? ""}`} />;
}
