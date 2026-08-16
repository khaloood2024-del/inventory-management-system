import { AlertDialog } from "@base-ui/react/alert-dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  danger = true,
  onConfirm,
  isLoading,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[1px] transition-opacity data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
        <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-card-border bg-card p-7 shadow-[0_8px_30px_rgba(32,31,24,0.08)] outline-none transition-all data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0">
          <AlertDialog.Title className="font-serif-display text-2xl font-semibold text-ink">{title}</AlertDialog.Title>
          {description && (
            <AlertDialog.Description className="mt-2 text-sm text-ink-muted">
              {description}
            </AlertDialog.Description>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-card-border px-4 py-2 text-sm font-medium text-ink hover:bg-sidebar-hover"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`rounded-full px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${
                danger ? "bg-danger-text hover:bg-red-700" : "bg-primary-500 hover:bg-primary-600"
              }`}
            >
              {isLoading ? "جارِ التنفيذ..." : confirmLabel}
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
