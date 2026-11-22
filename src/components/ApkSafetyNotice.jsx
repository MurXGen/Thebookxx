"use client";

import { useEffect, useState } from "react";
import { ANDROID_APK_URL, virusTotalUrl } from "@/lib/appDownload";

// Shown the moment an Android visitor taps "Download app". Chrome labels every
// app downloaded outside the Play Store "File might be harmful", which scares
// people off — this explains why, how to continue, and how to verify it.
const STEPS = [
  ["Download anyway", "If Chrome says “File might be harmful”, tap Download anyway. It shows this for every app that isn’t from the Play Store."],
  ["Open thebookx.apk", "Tap the finished download. If Android asks, allow installs from Chrome for this one app."],
  ["Install & read", "Google Play Protect checks the app automatically before it installs."],
];

export default function ApkSafetyNotice() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setOpen(true);
    window.addEventListener("tbx:apk-download", on);
    return () => window.removeEventListener("tbx:apk-download", on);
  }, []);
  useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);
  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="apk-safe-title" style={st.backdrop} onClick={() => setOpen(false)}>
      <div style={st.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={st.grab} />
        <div style={st.badge}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" fill="#1BA672" />
            <path d="m8.5 12 2.5 2.5 4.5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 id="apk-safe-title" style={st.title}>Your download has started</h2>
        <p style={st.lead}>
          TheBookX app is safe. Chrome warns about <b>every</b> app that isn’t installed from the Play Store, so you may see “File might be harmful”.
          That’s a general warning, not a problem with our app.
        </p>
        <ol style={st.list}>
          {STEPS.map(([h, d], i) => (
            <li key={h} style={st.item}>
              <span style={st.num}>{i + 1}</span>
              <span>
                <b style={st.itemH}>{h}</b>
                <span style={st.itemD}>{d}</span>
              </span>
            </li>
          ))}
        </ol>
        <div style={st.verify}>
          <b style={{ color: "#111" }}>Want to check it yourself?</b> Scan the app for free on VirusTotal, which runs it past 70+ antivirus engines.
        </div>
        <a href={virusTotalUrl()} target="_blank" rel="noopener noreferrer" style={st.secondary}>
          Scan it on VirusTotal ↗
        </a>
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <a href={ANDROID_APK_URL} style={{ ...st.ghost, flex: 1 }}>
            Download again
          </a>
          <button type="button" onClick={() => setOpen(false)} style={{ ...st.primary, flex: 1 }}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

const st = {
  backdrop: { position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", fontFamily: "var(--font-poppins), system-ui, sans-serif" },
  sheet: { width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", background: "#fff", borderRadius: "20px 20px 0 0", padding: "10px 20px calc(18px + env(safe-area-inset-bottom))", boxShadow: "0 -8px 30px rgba(0,0,0,0.15)" },
  grab: { width: 40, height: 4, borderRadius: 2, background: "#E4E4EA", margin: "0 auto 14px" },
  badge: { width: 48, height: 48, borderRadius: 24, background: "#E8F7F0", display: "flex", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: 600, color: "#111", margin: "12px 0 6px" },
  lead: { fontSize: 13.5, lineHeight: 1.55, color: "#555", margin: 0 },
  list: { listStyle: "none", padding: 0, margin: "14px 0 0", display: "grid", gap: 12 },
  item: { display: "flex", gap: 10, alignItems: "flex-start" },
  num: { flex: "0 0 22px", height: 22, borderRadius: 11, background: "#111", color: "#fff", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 },
  itemH: { display: "block", fontSize: 13.5, fontWeight: 600, color: "#111" },
  itemD: { display: "block", fontSize: 12.5, lineHeight: 1.5, color: "#666" },
  verify: { marginTop: 16, padding: "10px 12px", borderRadius: 12, background: "#F4F5F7", fontSize: 12.5, lineHeight: 1.5, color: "#555" },
  secondary: { display: "block", textAlign: "center", marginTop: 10, padding: "11px 0", borderRadius: 12, border: "1px solid #1BA672", color: "#128a5c", fontSize: 14, fontWeight: 600, textDecoration: "none" },
  ghost: { display: "block", textAlign: "center", padding: "12px 0", borderRadius: 12, background: "#F4F5F7", color: "#111", fontSize: 14, fontWeight: 600, textDecoration: "none" },
  primary: { padding: "12px 0", borderRadius: 12, background: "#111", color: "#fff", fontSize: 14, fontWeight: 600, border: 0, cursor: "pointer", fontFamily: "inherit" },
};
