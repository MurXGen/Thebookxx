// components/AdminLock.jsx
"use client";

import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

// Client-side gate only. Anyone with DevTools can bypass it.
// For real protection use server-side auth.
//
// The valid code is NOT stored on its own. Instead it lives *inside* a long,
// fixed, random-looking string. A code is accepted when it appears as a
// substring of that string (min 4 chars, so trivial single characters fail).
// Two codes are baked in:
//   • 9631 → unlocks for this session (cleared when the tab closes).
//   • 9731 → entered via the "Remember me" box, keeps the session unlocked
//            on this device across visits (no password needed next time).
const SECRET =
  "xP7k2Qm9Rv4Ls8Nz5Wc1Ft3Hj6Dy0Ae9631Ug2iO7Xb4qBnwLzA6kDsE3tV9731hJ5uCoX8mPrT2yG";
const MIN_CODE_LEN = 4;

const SESSION_KEY = "admin_unlocked"; // sessionStorage — clears on tab close
const PERSIST_KEY = "admin_remember"; // localStorage — persists across visits

// A code is valid when it is a long-enough substring of the secret string.
const isValidCode = (v) => {
  const c = String(v || "").trim();
  return c.length >= MIN_CODE_LEN && SECRET.includes(c);
};

export default function AdminLock({ children, pageName = "Admin" }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [code, setCode] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [rememberCode, setRememberCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  // On mount: persistent unlock (localStorage) OR this-session unlock.
  useEffect(() => {
    try {
      if (
        localStorage.getItem(PERSIST_KEY) === "true" ||
        sessionStorage.getItem(SESSION_KEY) === "true"
      ) {
        setIsUnlocked(true);
      }
    } catch (e) {
      // storage may be unavailable (SSR, private mode, etc.)
    }
    setChecking(false);

    // noindex belt-and-suspenders (primary noindex is the page metadata export)
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

    // "Remember me" path: validate the remember code and persist the unlock.
    if (rememberMe) {
      if (isValidCode(rememberCode)) {
        try {
          localStorage.setItem(PERSIST_KEY, "true");
          sessionStorage.setItem(SESSION_KEY, "true");
        } catch {}
        setIsUnlocked(true);
        setError("");
        setCode("");
        setRememberCode("");
        return;
      }
      setAttempts((a) => a + 1);
      setError("Incorrect code");
      setRememberCode("");
      return;
    }

    // Normal path: validate the session code.
    if (isValidCode(code)) {
      try {
        sessionStorage.setItem(SESSION_KEY, "true");
      } catch {}
      setIsUnlocked(true);
      setError("");
      setCode("");
      return;
    }
    setAttempts((a) => a + 1);
    setError("Incorrect code");
    setCode("");
  };

  // Expose a logout helper on window so pages can call it from their UI.
  useEffect(() => {
    if (isUnlocked) {
      window.__adminLogout = () => {
        try {
          sessionStorage.removeItem(SESSION_KEY);
          localStorage.removeItem(PERSIST_KEY);
        } catch {}
        setIsUnlocked(false);
      };
    }
    return () => {
      delete window.__adminLogout;
    };
  }, [isUnlocked]);

  if (checking) return null;
  if (isUnlocked) return <>{children}</>;

  const canSubmit = rememberMe ? !!rememberCode : !!code;

  return (
    <div className="admin-lock-page">
      <div className="admin-lock-card">
        <div className="admin-lock-icon">
          <Lock size={28} />
        </div>
        <h2 className="admin-lock-title">{pageName} Locked</h2>
        <p className="admin-lock-subtitle">
          Enter your code to continue. Session ends when you close the tab.
        </p>

        <form onSubmit={handleSubmit} className="admin-lock-form">
          <div className="admin-lock-input-wrapper">
            <input
              type={showCode ? "text" : "password"}
              className="sec-mid-btn width100"
              placeholder="Enter code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError("");
              }}
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              className="admin-lock-eye"
              onClick={() => setShowCode((s) => !s)}
              tabIndex={-1}
            >
              {showCode ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Remember-me: reveals a second field for the persistent code. */}
          <label className="admin-lock-remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => {
                setRememberMe(e.target.checked);
                setError("");
                if (!e.target.checked) setRememberCode("");
              }}
            />
            <span>Remember me on this device</span>
          </label>

          {rememberMe && (
            <div className="admin-lock-input-wrapper">
              <input
                type={showCode ? "text" : "password"}
                className="sec-mid-btn width100"
                placeholder="Enter remember code"
                value={rememberCode}
                onChange={(e) => {
                  setRememberCode(e.target.value);
                  if (error) setError("");
                }}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          )}

          {error && (
            <span className="admin-lock-error">
              {error}
              {attempts >= 3 && ", Check with admin if you forgot."}
            </span>
          )}

          <button
            type="submit"
            className="pri-big-btn width100"
            disabled={!canSubmit}
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
    const read = () => {
      try {
        setUnlocked(
          localStorage.getItem(PERSIST_KEY) === "true" ||
            sessionStorage.getItem(SESSION_KEY) === "true",
        );
      } catch {}
    };
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);
  return unlocked;
}
