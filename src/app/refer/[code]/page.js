"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Gift, Loader2, BookOpen } from "lucide-react";

// Friend opens thebookx.in/refer/ABC123 → we validate the code, remember it,
// then send them to the profile page to enter their number and apply it.
export default function ReferCapture() {
  const params = useParams();
  const router = useRouter();
  const code = String(params?.code || "").trim().toUpperCase();
  const [valid, setValid] = useState(null); // null = checking

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!/^[A-Z0-9]{6}$/.test(code)) {
        if (!cancelled) setValid(false);
        return;
      }
      try {
        const res = await fetch(
          `/api/referral?action=resolve&code=${encodeURIComponent(code)}`,
        );
        const data = await res.json();
        if (cancelled) return;
        if (data?.valid) {
          // Remember the code so the profile page can auto-fill "Apply code".
          try {
            localStorage.setItem("tbx_ref_code", code);
            document.cookie = `tbx_ref_code=${code}; path=/; max-age=${60 * 60 * 24 * 30}`;
          } catch {}
          setValid(true);
          // Land them on the profile number-entry page.
          setTimeout(() => router.replace("/profile?ref=1"), 1400);
        } else {
          setValid(false);
        }
      } catch {
        if (!cancelled) setValid(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, router]);

  return (
    <div className="refer-capture">
      <div className="refer-capture-card">
        {valid === false ? (
          <>
            <div className="refer-capture-ic refer-capture-ic-muted">
              <BookOpen size={28} />
            </div>
            <h1 className="refer-capture-title">This link isn&apos;t valid</h1>
            <p className="refer-capture-sub">
              The referral code looks incorrect or expired. You can still shop
              all our books at ₹1 and up!
            </p>
            <button
              type="button"
              className="refer-capture-btn"
              onClick={() => router.replace("/")}
            >
              Start shopping
            </button>
          </>
        ) : (
          <>
            <div className="refer-capture-ic">
              <Gift size={30} />
            </div>
            <h1 className="refer-capture-title">You&apos;ve been invited! 🎁</h1>
            <p className="refer-capture-sub">
              A friend gifted you a welcome reward on your first TheBookX order.
              Taking you to claim it…
            </p>
            <div className="refer-capture-loading">
              <Loader2 size={18} className="refer-capture-spin" />
              <span>Setting things up…</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
