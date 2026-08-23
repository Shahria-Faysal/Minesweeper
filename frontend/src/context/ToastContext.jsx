import { createContext, useContext, useState, useCallback, useRef } from "react";
import "../styles/toast.css";

const ToastContext = createContext(null);

let idCounter = 0;

/**
 * Wrap <App> (or any subtree) with <ToastProvider> and call
 * useToast() anywhere inside to show toasts:
 *
 *   const toast = useToast();
 *   toast("Saved!", "success");           // green
 *   toast("Something went wrong", "error"); // red
 *   toast("Note: stats updated");          // neutral (default)
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    // Remove from DOM after exit animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 350);
  }, []);

  const addToast = useCallback(
    (message, type = "info", duration = 3500) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

      timers.current[id] = setTimeout(() => dismiss(id), duration);

      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      {/* Portal-like: rendered at bottom of provider, positioned fixed */}
      <div className="toast-region" aria-live="polite" aria-atomic="false" role="status">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast toast--${t.type}${t.exiting ? " toast--exit" : ""}`}
            role="alert"
          >
            <span className="toast-message">{t.message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
