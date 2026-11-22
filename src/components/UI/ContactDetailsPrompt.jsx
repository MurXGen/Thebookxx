"use client";

// After an order is placed: if the shopper didn't give an email and/or an
// alternate number, ask for them once (only the missing ones). Save writes
// them to that order's row in the sheet ("Email", "Alternate number"), so
// updates can reach them by email and a backup number. "Skip for now" closes.

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Phone, X, Check } from "lucide-react";
import { updateOrderRow } from "@/utils/googleFormOrder";
import { showToast } from "@/context/ToastContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const noopSub = () => () => {};

export default function ContactDetailsPrompt({ open, orderId, phone = "", needEmail, needAlt, onDone }) {
  const [email, setEmail] = useState("");
  const [alt, setAlt] = useState("");
  const [err, setErr] = useState({});
  const [saving, setSaving] = useState(false);
  // false on the server and during hydration, true after → no mismatch.
  const mounted = useSyncExternalStore(noopSub, () => true, () => false);
  if (!mounted) return null;

  const main = String(phone || "").replace(/\D/g, "").slice(-10);

  const save = async () => {
    const em = email.trim();
    const al = alt.replace(/\D/g, "").slice(-10);
    const e = {};
    if (needEmail && em && !EMAIL_RE.test(em)) e.email = "Please enter a valid email address.";
    if (needAlt && al && !/^[6-9]\d{9}$/.test(al)) e.alt = "Enter a valid 10-digit mobile number.";
    else if (needAlt && al && al === main) e.alt = "This is the same as your main number.";
    if (!em && !al) e.form = "Add at least one, or tap Skip for now.";
    setErr(e);
    if (Object.keys(e).length) return;
    const fields = {};
    if (needEmail && em) fields.Email = em;
    if (needAlt && al) fields["Alternate number"] = al;
    setSaving(true);
    const res = await updateOrderRow(orderId, fields);
    setSaving(false);
    if (!res.success) {
      showToast("Couldn't save just now — please try again.", "error");
      return;
    }
    showToast("Saved — we'll keep you posted on this order.", "success", { title: "Contact details added" });
    onDone?.(true);
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="cdp-back"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !saving && onDone?.(false)}
        >
          <motion.div
            className="cdp"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cdp-h"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="cdp-x" onClick={() => onDone?.(false)} aria-label="Close" disabled={saving}>
              <X size={18} />
            </button>
            <h3 id="cdp-h">Get updates on your order</h3>
            <p>
              Add {needEmail && needAlt ? "your email and an alternate number" : needEmail ? "your email" : "an alternate number"} so
              we can send order updates and reach you if the courier can&apos;t get through.
            </p>

            {needEmail && (
              <label className="cdp-field">
                <span>
                  <Mail size={14} /> Email
                </span>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {err.email && <small className="cdp-err">{err.email}</small>}
              </label>
            )}
            {needAlt && (
              <label className="cdp-field">
                <span>
                  <Phone size={14} /> Alternate number
                </span>
                <span className="cdp-phone">
                  <i>+91</i>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={alt}
                    onChange={(e) => setAlt(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  />
                </span>
                {err.alt && <small className="cdp-err">{err.alt}</small>}
              </label>
            )}
            {err.form && <small className="cdp-err">{err.form}</small>}

            <button type="button" className="cdp-save" onClick={save} disabled={saving} data-no-busy>
              {saving ? <span className="cdp-spin" aria-hidden="true" /> : <Check size={16} strokeWidth={3} />}
              {saving ? "Saving…" : "Submit"}
            </button>
            <button type="button" className="cdp-skip" onClick={() => onDone?.(false)} disabled={saving}>
              Skip for now
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
