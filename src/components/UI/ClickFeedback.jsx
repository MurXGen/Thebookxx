"use client";

// Site-wide "something is happening" feedback, so a tap never feels dead:
//  1. A thin top progress bar while a page navigation is in flight (link taps
//     and router.push — detected through the RSC fetch Next.js makes).
//  2. A small spinner over the button/link that was tapped while the work it
//     started (any fetch begun within a moment of the tap) is still running.
// Opt out on an element (e.g. it shows its own loader) with data-no-busy.

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const CLICK_WINDOW = 450; // a fetch started this soon after a tap belongs to it
const SHOW_DELAY = 160; // don't flash a spinner for instant work
const MAX_BUSY = 15000; // never leave a spinner stuck

// Background traffic that should never mark a button busy.
const IGNORE =
  /google-analytics|googletagmanager|doubleclick|facebook|clarity\.ms|hotjar|\/api\/(views|utm|live-activity|live-orders|ping|abandoned-cart)\b/i;

function isRscRequest(input, init) {
  try {
    const url = typeof input === "string" ? input : input?.url || "";
    const h = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
    if (h.get("next-router-prefetch")) return { rsc: false, prefetch: true };
    return { rsc: h.get("rsc") === "1" || /[?&]_rsc=/.test(url), prefetch: false };
  } catch {
    return { rsc: false, prefetch: false };
  }
}

export default function ClickFeedback() {
  const pathname = usePathname();
  const search = useSearchParams();
  const api = useRef(null);

  useEffect(() => {
    // ── Top bar ──────────────────────────────────────────────────────────
    const bar = document.createElement("div");
    bar.className = "cf-bar";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    let barTimer = 0;
    let barPct = 0;
    let barOn = false;
    let barStopTimer = 0;
    const barStart = () => {
      clearTimeout(barStopTimer);
      if (barOn) return;
      barOn = true;
      barPct = 8;
      bar.style.transition = "none";
      bar.style.width = "0%";
      bar.style.opacity = "1";
      requestAnimationFrame(() => {
        bar.style.transition = "width .25s ease, opacity .3s ease";
        bar.style.width = `${barPct}%`;
      });
      clearInterval(barTimer);
      barTimer = setInterval(() => {
        // Trickle towards 90% so it always looks alive.
        barPct += (90 - barPct) * 0.08;
        bar.style.width = `${barPct}%`;
      }, 220);
      // Safety: never hang.
      barStopTimer = setTimeout(barDone, MAX_BUSY);
    };
    const barDone = () => {
      if (!barOn) return;
      barOn = false;
      clearInterval(barTimer);
      clearTimeout(barStopTimer);
      bar.style.width = "100%";
      setTimeout(() => {
        bar.style.opacity = "0";
      }, 180);
    };

    // ── Busy element overlays ────────────────────────────────────────────
    const busy = new Map(); // el → { count, overlay, showT, maxT }
    let lastTap = { el: null, t: 0 };

    const place = (el, ov) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) {
        ov.style.display = "none";
        return;
      }
      ov.style.display = "flex";
      ov.style.left = `${r.left}px`;
      ov.style.top = `${r.top}px`;
      ov.style.width = `${r.width}px`;
      ov.style.height = `${r.height}px`;
      ov.style.borderRadius = getComputedStyle(el).borderRadius;
    };
    const reposition = () => busy.forEach((s, el) => s.overlay && place(el, s.overlay));

    const markBusy = (el) => {
      if (!el || !el.isConnected) return () => {};
      let s = busy.get(el);
      if (!s) {
        s = { count: 0, overlay: null };
        s.showT = setTimeout(() => {
          if (!busy.has(el) || !el.isConnected) return;
          // The button already shows its own loader (disabled / spinner icon).
          if (el.disabled || el.querySelector(".lb-spinner, .animate-spin, [class*='spinner']")) return;
          const ov = document.createElement("div");
          ov.className = "cf-busy";
          ov.innerHTML = '<span class="cf-spin"></span>';
          document.body.appendChild(ov);
          s.overlay = ov;
          place(el, ov);
          el.setAttribute("aria-busy", "true");
        }, SHOW_DELAY);
        s.maxT = setTimeout(() => clear(el), MAX_BUSY);
        busy.set(el, s);
      }
      s.count += 1;
      let done = false;
      return () => {
        if (done) return;
        done = true;
        const cur = busy.get(el);
        if (!cur) return;
        cur.count -= 1;
        if (cur.count <= 0) clear(el);
      };
    };
    const clear = (el) => {
      const s = busy.get(el);
      if (!s) return;
      clearTimeout(s.showT);
      clearTimeout(s.maxT);
      s.overlay?.remove();
      el.removeAttribute("aria-busy");
      busy.delete(el);
    };
    const clearAll = () => [...busy.keys()].forEach(clear);

    const tappable = (t) =>
      t?.closest?.(
        'button, a[href], [role="button"], [role="tab"], [role="menuitem"], input[type="submit"], input[type="button"]',
      );

    // ── Taps ─────────────────────────────────────────────────────────────
    let navRelease = null;
    const onClick = (e) => {
      const el = tappable(e.target);
      if (!el || el.closest("[data-no-busy]") || el.disabled) return;
      lastTap = { el, t: performance.now() };

      // Same-site link to another page → bar + spinner until the route lands.
      if (el.tagName === "A" && !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        const href = el.getAttribute("href") || "";
        if (el.target && el.target !== "_self") return;
        if (el.hasAttribute("download") || /^(mailto:|tel:|sms:|whatsapp:|javascript:|#)/i.test(href)) return;
        let url;
        try {
          url = new URL(el.href, location.href);
        } catch {
          return;
        }
        if (url.origin !== location.origin) return;
        if (url.pathname === location.pathname && url.search === location.search) return;
        barStart();
        navRelease?.();
        navRelease = markBusy(el);
      }
    };
    document.addEventListener("click", onClick, true);

    // ── fetch hook ───────────────────────────────────────────────────────
    const origFetch = window.fetch;
    const hooked = function (input, init) {
      const { rsc, prefetch } = isRscRequest(input, init);
      const url = typeof input === "string" ? input : input?.url || "";
      const recent =
        lastTap.el && performance.now() - lastTap.t < CLICK_WINDOW && lastTap.el.isConnected;
      let release = null;
      if (!prefetch && !(init && init.keepalive) && !IGNORE.test(url)) {
        if (rsc) barStart(); // router.push / link navigation
        if (recent) release = markBusy(lastTap.el);
      }
      const p = origFetch.apply(this, arguments);
      if (release) p.finally(release).catch(() => {});
      return p;
    };
    window.fetch = hooked;

    window.addEventListener("scroll", reposition, { passive: true, capture: true });
    window.addEventListener("resize", reposition);

    api.current = {
      routeChanged: () => {
        navRelease?.();
        navRelease = null;
        barDone();
        // Elements from the previous page are gone; drop their spinners.
        busy.forEach((_, el) => !el.isConnected && clear(el));
      },
    };

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", reposition, { capture: true });
      window.removeEventListener("resize", reposition);
      if (window.fetch === hooked) window.fetch = origFetch;
      clearInterval(barTimer);
      clearTimeout(barStopTimer);
      clearAll();
      bar.remove();
      api.current = null;
    };
  }, []);

  // A new route committed → finish the bar and release the tapped link.
  useEffect(() => {
    api.current?.routeChanged();
  }, [pathname, search]);

  return null;
}
