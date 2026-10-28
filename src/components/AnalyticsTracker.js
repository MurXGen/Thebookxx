"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const GA_ID = "G-VZX7GSTR9Z";
const LAST_VISIT_KEY = "tbx_last_visit";
const VISIT_COUNT_KEY = "tbx_visit_count";

// Classify a referrer URL into a { source, medium } for attribution when the
// visit arrives WITHOUT utm_* params (e.g. a Google-search click). Returns null
// for internal navigations (handled by the caller) or unparseable referrers.
function classifyReferrer(ref) {
  let host = "";
  try {
    host = new URL(ref).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
  if (!host) return null;

  // Search engines → organic
  if (/(^|\.)google\./.test(host)) return { source: "google", medium: "organic" };
  if (host.includes("bing.")) return { source: "bing", medium: "organic" };
  if (host.includes("duckduckgo")) return { source: "duckduckgo", medium: "organic" };
  if (host.includes("search.yahoo") || host === "yahoo.com")
    return { source: "yahoo", medium: "organic" };
  if (host.includes("ecosia")) return { source: "ecosia", medium: "organic" };
  if (host.includes("yandex.")) return { source: "yandex", medium: "organic" };
  if (host.includes("baidu.")) return { source: "baidu", medium: "organic" };
  if (host.includes("brave.")) return { source: "brave", medium: "organic" };

  // AI assistants
  const ai = [
    "chatgpt.com",
    "chat.openai.com",
    "openai.com",
    "perplexity.ai",
    "gemini.google",
    "bard.google",
    "copilot.microsoft",
    "claude.ai",
  ];
  if (ai.some((s) => host.includes(s))) return { source: host, medium: "ai" };

  // Social
  const social = [
    "facebook.com",
    "instagram.com",
    "l.instagram.com",
    "t.co",
    "twitter.com",
    "x.com",
    "linkedin.com",
    "lnkd.in",
    "reddit.com",
    "pinterest.",
    "youtube.com",
    "youtu.be",
    "whatsapp.com",
    "wa.me",
    "t.me",
    "telegram",
    "snapchat",
    "threads.net",
    "quora.com",
  ];
  if (social.some((s) => host.includes(s))) return { source: host, medium: "social" };

  // Everything else → generic referral
  return { source: host, medium: "referral" };
}

// Fire a GA event, retrying briefly if the GA library hasn't loaded yet so
// early events aren't silently dropped.
function safeGtag(...args) {
  if (typeof window === "undefined") return;
  let tries = 0;
  const send = () => {
    if (typeof window.gtag === "function") {
      window.gtag(...args);
      return;
    }
    if (tries++ < 20) setTimeout(send, 400); // retry up to ~8s
  };
  send();
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const scrollFired = useRef({}); // milestones already sent for this page
  const sessionInit = useRef(false);

  // ── Page view on every route change ──
  useEffect(() => {
    safeGtag("config", GA_ID, { page_path: pathname });
    scrollFired.current = {}; // reset scroll milestones for the new page
  }, [pathname]);

  // ── Returning-visitor / recency (fires once per mount) ──
  useEffect(() => {
    if (sessionInit.current) return;
    sessionInit.current = true;
    try {
      const now = Date.now();
      const last = parseInt(localStorage.getItem(LAST_VISIT_KEY) || "0", 10);
      const count = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || "0", 10);

      if (last > 0) {
        const days = Math.floor((now - last) / 86400000);
        const hours = Math.floor((now - last) / 3600000);
        let bucket = "same_day";
        if (days >= 30) bucket = "30d_plus";
        else if (days >= 7) bucket = "7_30d";
        else if (days >= 2) bucket = "2_7d";
        else if (days >= 1) bucket = "1d";
        else if (hours >= 1) bucket = "hours";
        safeGtag("event", "returning_visitor", {
          days_inactive: days,
          hours_inactive: hours,
          recency_bucket: bucket,
          visit_number: count + 1,
        });
      } else {
        safeGtag("event", "first_visit_custom", { visit_number: 1 });
      }
      localStorage.setItem(LAST_VISIT_KEY, String(now));
      localStorage.setItem(VISIT_COUNT_KEY, String(count + 1));
    } catch {}
  }, []);

  // ── UTM + referrer attribution ──
  // On first load: if the visit carries utm_* params, record those; otherwise
  // derive the source from the referrer (Google → organic, social, AI, direct).
  // Either way the visitor STAYS on their landing page — we only strip utm_*
  // params from the URL bar.
  const utmInit = useRef(false);
  useEffect(() => {
    if (utmInit.current) return;
    utmInit.current = true;
    try {
      const sp = new URLSearchParams(window.location.search);
      const explicit = {
        source: sp.get("utm_source") || "",
        medium: sp.get("utm_medium") || "",
        campaign: sp.get("utm_campaign") || "",
        content: sp.get("utm_content") || "",
        term: sp.get("utm_term") || "",
      };

      let utm = null;
      let fromParams = false;

      if (explicit.source || explicit.campaign) {
        utm = explicit;
        fromParams = true;
      } else {
        // No utm params → classify by referrer.
        const ref = document.referrer || "";
        let refHost = "";
        try {
          refHost = new URL(ref).hostname.toLowerCase();
        } catch {}
        const selfHost = window.location.hostname.toLowerCase();
        const isInternal =
          refHost &&
          (refHost === selfHost ||
            refHost.endsWith("thebookx.in") ||
            refHost === "localhost");

        if (!ref) {
          utm = { source: "direct", medium: "none", campaign: "", content: "", term: "" };
        } else if (!isInternal) {
          const c = classifyReferrer(ref);
          if (c)
            utm = {
              source: c.source,
              medium: c.medium,
              campaign: "",
              content: "",
              term: "",
            };
        }
        // isInternal (reload / in-site nav) → leave utm null, record nothing.
      }

      if (!utm) return;

      // Remember the first-touch attribution for this shopper.
      try {
        if (!localStorage.getItem("tbx_utm")) {
          localStorage.setItem(
            "tbx_utm",
            JSON.stringify({ ...utm, at: Date.now() }),
          );
        }
      } catch {}

      // Count once per session per source key (avoids inflating on reloads).
      const key = `${utm.source}|${utm.medium}|${utm.campaign}`.toLowerCase();
      const seenKey = `tbx_utm_seen_${key}`;
      if (!sessionStorage.getItem(seenKey)) {
        sessionStorage.setItem(seenKey, "1");
        safeGtag("event", "utm_landing", {
          source: utm.source,
          medium: utm.medium,
          campaign: utm.campaign,
        });
        fetch("/api/utm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(utm),
          keepalive: true,
        }).catch(() => {});
      }

      // Strip the utm_* params from the URL bar but KEEP the landing page.
      if (fromParams) {
        try {
          const url = new URL(window.location.href);
          ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(
            (k) => url.searchParams.delete(k),
          );
          window.history.replaceState(
            {},
            "",
            url.pathname + (url.search || "") + (url.hash || ""),
          );
        } catch {}
      }
    } catch {}
  }, []);

  // ── Scroll-depth milestones (25 / 50 / 75 / 100 %) ──
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const pct = Math.round((window.scrollY / scrollable) * 100);
      [25, 50, 75, 100].forEach((m) => {
        if (pct >= m && !scrollFired.current[m]) {
          scrollFired.current[m] = true;
          safeGtag("event", "scroll_depth", {
            percent: m,
            page_path: pathname,
          });
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return null;
}
