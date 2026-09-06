"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

type ToastType = "success" | "error";

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(
  null
);

export function useToast() {
  const ctx = useContext(ToastContext);

  if (!ctx) {
    throw new Error(
      "useToast must be used within <ToastProvider>"
    );
  }

  return ctx;
}

let nextId = 1;

export function ToastProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = nextId++;

      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) =>
          prev.filter((t) => t.id !== id)
        );
      }, 3500);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          zIndex: 9999,
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            style={{
              background:
                toast.type === "error"
                  ? "var(--color-danger-text)"
                  : "var(--color-success-text)",
              color: "var(--color-white)",
              padding: "12px 20px",
              borderRadius: 8,
              boxShadow:
                "0 8px 20px rgba(0,0,0,.18)",
              fontSize: 14,
              fontWeight: 600,
              minWidth: 220,
              maxWidth: 360,
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
