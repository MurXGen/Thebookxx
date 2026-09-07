"use client";

import { useEffect, useState } from "react";
import { Gift, Loader2, Check, X, ChevronRight } from "lucide-react";

// "Have a referral code?" box on the profile page. Auto-fills the code captured
// from a /refer/{code} link, applies it against the logged-in phone, and shows
// the eligibility result. Reward is credited to the wallet only once the
// friend's first order is delivered (handled server-side at payout time).
export default function ReferralApply({ phone }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // { status, message }
  const [autoFilled, setAutoFilled] = useState(false);

  const digits = String(phone || "").replace(/\D/g, "").slice(-10);

  // Auto-fill + auto-open when the visitor arrived from a referral link.
  useEffect(() => {
    try {
      const saved = (localStorage.getItem("tbx_ref_code") || "")
        .trim()
        .toUpperCase();
      const applied = localStorage.getItem(`tbx_ref_applied_${digits}`);
      if (applied) {
        setResult({ status: "already", message: "Referral code already applied." });
        return;
      }
      if (saved && /^[A-Z0-9]{6}$/.test(saved)) {
        setCode(saved);
        setAutoFilled(true);
        setOpen(true);
      }
    } catch {}
  }, [digits]);

  const apply = async () => {
    const c = code.trim().toUpperCase();
    if (digits.length !== 10) {
      setResult({ status: "error", message: "Please log in with your number first." });
      return;
    }
    if (!/^[A-Z0-9]{6}$/.test(c)) {
      setResult({ status: "invalid", message: "Enter a valid 6-character code." });
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "apply-code", phone: digits, code: c }),
      });
      const data = await res.json();
      setResult(data);
      // Lock so we don't re-prompt on this device once handled.
      if (["pending", "none", "already"].includes(data?.status)) {
        try {
          localStorage.setItem(`tbx_ref_applied_${digits}`, data.status);
          localStorage.removeItem("tbx_ref_code");
        } catch {}
      }
    } catch {
      setResult({ status: "error", message: "Something went wrong. Please retry." });
    } finally {
      setBusy(false);
    }
  };

  const ok = result?.status === "pending";
  const soft = result?.status === "none" || result?.status === "already";
  const bad = result && !ok && !soft;

  // Once successfully handled, show a compact confirmation instead of the form.
  if (result && (ok || soft)) {
    return (
      <div className={`refapply-done${ok ? " ok" : ""}`}>
        <span className="refapply-done-ic">
          {ok ? <Check size={15} strokeWidth={3} /> : <Gift size={15} />}
        </span>
        <span className="refapply-done-txt">{result.message}</span>
      </div>
    );
  }

  return (
    <div className="refapply">
      {!open ? (
        <button
          type="button"
          className="refapply-link"
          onClick={() => setOpen(true)}
        >
          <Gift size={14} /> Have a referral code?
          <ChevronRight size={14} />
        </button>
      ) : (
        <div className="refapply-box">
          <div className="refapply-head">
            <span className="refapply-title">
              <Gift size={14} /> Apply a referral code
            </span>
            <button
              type="button"
              className="refapply-x"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>
          {autoFilled && (
            <p className="refapply-hint">
              We picked up your friend&apos;s code — just tap Apply 🎁
            </p>
          )}
          <div className="refapply-row">
            <input
              className="refapply-input"
              placeholder="Enter code (e.g. ABC123)"
              value={code}
              maxLength={6}
              onChange={(e) =>
                setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())
              }
              onKeyDown={(e) => e.key === "Enter" && apply()}
            />
            <button
              type="button"
              className="refapply-btn"
              onClick={apply}
              disabled={busy || code.length !== 6}
            >
              {busy ? <Loader2 size={15} className="refapply-spin" /> : "Apply"}
            </button>
          </div>
          {bad && <p className="refapply-err">{result.message}</p>}
        </div>
      )}
    </div>
  );
}
