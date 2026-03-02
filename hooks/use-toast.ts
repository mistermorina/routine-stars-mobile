import { useState, useCallback } from "react";

export interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

let toastCount = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const toast = useCallback(
    ({ title, description, variant = "default" }: Omit<ToastData, "id">) => {
      const id = `toast-${++toastCount}`;
      const newToast: ToastData = { id, title, description, variant };

      setToasts((prev) => [...prev, newToast]);

      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);

      return { id, dismiss: () => setToasts((prev) => prev.filter((t) => t.id !== id)) };
    },
    []
  );

  const dismiss = useCallback((id?: string) => {
    if (id) {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    } else {
      setToasts([]);
    }
  }, []);

  return { toasts, toast, dismiss };
}
