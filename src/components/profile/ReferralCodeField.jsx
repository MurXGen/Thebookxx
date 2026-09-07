"use client";

import { useEffect, useState } from "react";
import { Gift, ChevronDown } from "lucide-react";

// Login-screen "Have a referral code?" accordion. Styled like the phone-number
// input, centered above Submit. Auto-opens + pre-fills when the visitor arrived
// from a /refer/{code} link. The code is stashed in localStorage so it's applied
// automatically once they log in (see ReferralApply on the profile).
export default function ReferralCodeField() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");

  useEffect(() => {
    try {
      const saved = (localStorage.getItem("tbx_ref_code") || "")
        .trim()
        .toUpperCase();
      let fromLink = false;
      if (typeof window !== "undefined") {
        fromLink = !!new URLSearchParams(window.location.search).get("ref");
      }
      if (saved && /^[A-Z0-9]{6}$/.test(saved)) {
        setCode(saved);
        setOpen(true);
      } else if (fromLink) {
        setOpen(true);
      }
    } catch {}
  }, []);

  const onChange = (v) => {
    const c = v.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);
    setCode(c);
    try {
      if (c.length === 6) localStorage.setItem("tbx_ref_code", c);
      else if (!c) localStorage.removeItem("tbx_ref_code");
    } catch {}
  };

  return (
    <div className="refcode-field">
      <button
        type="button"
        className="refcode-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <Gift size={15} /> Have a referral code?
        <ChevronDown size={16} className={`refcode-chev${open ? " up" : ""}`} />
      </button>

      <div className={`refcode-collapse${open ? " open" : ""}`}>
        <div className="phone-input-wrap rapido-input refcode-input-wrap">
          <span className="rapido-cc refcode-cc">
            <Gift size={15} />
          </span>
          <input
            type="text"
            className="phone-card-input refcode-input"
            placeholder="Enter referral code"
            value={code}
            maxLength={6}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <p className="refcode-hint">Get ₹30 off your first order 🎁</p>
      </div>
    </div>
  );
}
