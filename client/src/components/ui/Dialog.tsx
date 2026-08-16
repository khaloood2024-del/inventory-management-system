import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ReactNode } from "react";

interface AppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  widthClass?: string;
}

export function AppDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  widthClass = "max-w-lg",
}: AppDialogProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[1px] transition-opacity data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
        <BaseDialog.Popup
          className={`fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] ${widthClass} -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-card-border bg-card p-7 shadow-[0_8px_30px_rgba(32,31,24,0.08)] outline-none transition-all data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 max-h-[85vh] overflow-y-auto`}
        >
          <BaseDialog.Title className="font-serif-display text-2xl font-semibold text-ink">{title}</BaseDialog.Title>
          {description && (
            <BaseDialog.Description className="mt-1 text-sm text-ink-muted">
              {description}
            </BaseDialog.Description>
          )}
          <div className="mt-4">{children}</div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
