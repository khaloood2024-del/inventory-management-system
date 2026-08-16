import { Toast } from "@base-ui/react/toast";
import type { ReactNode } from "react";

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return (
    <Toast.Portal>
      <Toast.Viewport className="fixed bottom-4 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 sm:bottom-6 sm:left-6 sm:translate-x-0">
        {toasts.map((toast) => (
          <Toast.Root
            key={toast.id}
            toast={toast}
            className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-lg transition-all data-[starting-style]:translate-y-2 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 ${
              toast.type === "error"
                ? "border-danger-text/20 bg-white text-danger-text"
                : "border-success-text/20 bg-white text-success-text"
            }`}
          >
            <Toast.Title className="text-sm font-bold text-gray-800" />
            <Toast.Description className="mt-0.5 text-sm text-gray-500" />
          </Toast.Root>
        ))}
      </Toast.Viewport>
    </Toast.Portal>
  );
}

export function AppToastProvider({ children }: { children: ReactNode }) {
  return (
    <Toast.Provider>
      {children}
      <ToastList />
    </Toast.Provider>
  );
}

export function useAppToast() {
  const manager = Toast.useToastManager();
  return {
    success: (title: string, description?: string) =>
      manager.add({ title, description, type: "success", timeout: 4000 }),
    error: (title: string, description?: string) =>
      manager.add({ title, description, type: "error", timeout: 5000 }),
  };
}
