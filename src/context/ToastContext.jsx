// context/ToastContext.jsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  ShoppingBag,
  Heart,
} from "lucide-react";

const ToastContext = createContext(null);

// Module-level showToast, set once the Provider mounts so it can be
// imported and called from anywhere (utils, async handlers, non-React code).
let _showToast = null;

/**
 * Trigger a toast from anywhere in the app.
 *
 *   import { showToast } from "@/context/ToastContext";
 *   showToast("Saved successfully", "success");
 *
 *   // Or with an options object:
 *   showToast("Custom timing", "info", { duration: 6000 });
 *
 * Types: "success" | "error" | "warning" | "info" (defaults to "info")
 */
export function showToast(message, type = "info", options = {}) {
  if (_showToast) {
    return _showToast(message, type, options);
  }
  // If the provider isn't mounted yet, log so it's debuggable
  if (typeof window !== "undefined") {
    console.warn("showToast called before ToastProvider mounted:", message);
  }
}

const ICON_BY_TYPE = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};
// Named icon overrides (pass via options.icon), e.g. for cart / wishlist toasts.
const ICON_BY_NAME = {
  cart: ShoppingBag,
  bag: ShoppingBag,
  wishlist: Heart,
  heart: Heart,
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

function Toast({ toast, onDismiss }) {
  const Icon =
    (toast.icon && ICON_BY_NAME[toast.icon]) ||
    ICON_BY_TYPE[toast.type] ||
    Info;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -24, scale: 0.96, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -16, scale: 0.97, filter: "blur(8px)" }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className={`toast toast-${toast.type}`}
      role={toast.type === "error" ? "alert" : "status"}
      aria-live={toast.type === "error" ? "assertive" : "polite"}
    >
      <span className="toast-badge">
        <Icon size={16} />
      </span>
      <div className="toast-text">
        {toast.title && <span className="toast-title">{toast.title}</span>}
        <span className={`toast-sub${toast.title ? "" : " solo"}`}>
          {toast.message}
        </span>
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        className="toast-close"
        onClick={() => onDismiss(toast.id)}
      >
        <X size={15} />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const dismissToast = useCallback((id) => {
    setToasts((curr) => curr.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (message, type = "info", options = {}) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `t_${Date.now()}_${Math.random()}`;

      const duration =
        typeof options.duration === "number" ? options.duration : 3000;

      // Haptic feedback when a toast appears (Android/Chrome; no-op elsewhere).
      // Pattern intensity scales with severity.
      try {
        if (
          typeof navigator !== "undefined" &&
          navigator.vibrate &&
          options.haptic !== false
        ) {
          const pattern =
            type === "error"
              ? [45, 40, 45]
              : type === "warning"
                ? [30, 35, 30]
                : type === "success"
                  ? [25]
                  : [18];
          navigator.vibrate(pattern);
        }
      } catch {}

      setToasts((curr) => [
        ...curr,
        {
          id,
          message,
          type,
          duration,
          title: options.title || "",
          icon: options.icon || "",
        },
      ]);

      if (duration > 0) {
        const timer = setTimeout(() => dismissToast(id), duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismissToast],
  );

  // Expose the function-call API at module level once mounted
  useEffect(() => {
    _showToast = addToast;
    return () => {
      if (_showToast === addToast) _showToast = null;
    };
  }, [addToast]);

  // Clean up any pending timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, []);

  const contextValue = {
    toast: {
      success: (msg, opts) => addToast(msg, "success", opts),
      error: (msg, opts) => addToast(msg, "error", opts),
      warning: (msg, opts) => addToast(msg, "warning", opts),
      info: (msg, opts) => addToast(msg, "info", opts),
      dismiss: dismissToast,
    },
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="toast-container" aria-live="polite">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// Optional hook if you ever want it from inside a component
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return ctx.toast;
}
