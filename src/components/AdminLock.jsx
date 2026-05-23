// components/AdminLock.jsx
"use client";

import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, LogOut } from "lucide-react";

// Client-side gate only. Anyone with DevTools can bypass it.
// For real protection use server-side auth.
const ADMIN_PASSWORD = "9631";
const STORAGE_KEY = "admin_unlocked"; // sessionStorage = clears on tab close

export default function AdminLock({ children, pageName = "Admin" }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  // Check sessionStorage on mount
  useEffect(() => {
    try {
      const unlocked = sessionStorage.getItem(STORAGE_KEY);
      if (unlocked === "true") {
        setIsUnlocked(true);
      }
    } catch (e) {
      // sessionStorage may be unavailable (SSR, private mode, etc.)
    }
    setChecking(false);

    // Add noindex meta tag dynamically (extra belt-and-suspenders;
    // primary noindex comes from the page-level metadata export)
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow, noarchive, nosnippet";
    document.head.appendChild(meta);

    return () => {
      try {
        document.head.removeChild(meta);
      } catch {}
    };
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (password === ADMIN_PASSWORD) {
      try {
        sessionStorage.setItem(STORAGE_KEY, "true");
      } catch {}
      setIsUnlocked(true);
      setError("");
      setPassword("");
    } else {
      setAttempts((a) => a + 1);
      setError("Incorrect password");
      setPassword("");
    }
  };

  // Expose a logout helper on window so pages can call it from their UI
  useEffect(() => {
    if (isUnlocked) {
      window.__adminLogout = () => {
        try {
          sessionStorage.removeItem(STORAGE_KEY);
        } catch {}
        setIsUnlocked(false);
      };
    }
    return () => {
      delete window.__adminLogout;
    };
  }, [isUnlocked]);

  // While reading sessionStorage, render nothing to avoid a flash
  if (checking) {
    return null;
  }

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="admin-lock-page">
      <div className="admin-lock-card">
        <div className="admin-lock-icon">
          <Lock size={28} />
        </div>
        <h2 className="admin-lock-title">{pageName} Locked</h2>
        <p className="admin-lock-subtitle">
          Enter password to continue. Session ends when you close the tab.
        </p>

        <form onSubmit={handleSubmit} className="admin-lock-form">
          <div className="admin-lock-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              className="sec-mid-btn width100"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              autoFocus
              inputMode="numeric"
              autoComplete="off"
            />
            <button
              type="button"
              className="admin-lock-eye"
              onClick={() => setShowPassword((s) => !s)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <span className="admin-lock-error">
              {error}
              {attempts >= 3 && " — Check with admin if you forgot."}
            </span>
          )}

          <button
            type="submit"
            className="pri-big-btn width100"
            disabled={!password}
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}

// Convenience hook for pages that want to gate their own API calls
// even after unlock (e.g. before firing fetchOrders).
export function useAdminUnlocked() {
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => {
    try {
      setUnlocked(sessionStorage.getItem(STORAGE_KEY) === "true");
    } catch {}
    const onStorage = () => {
      try {
        setUnlocked(sessionStorage.getItem(STORAGE_KEY) === "true");
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return unlocked;
}
