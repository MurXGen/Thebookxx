"use client";

// Push notifications UI (same slide-up sheet as the rest of the site):
//  • PushSheet "why" — what they'll get (live tracking link in the alert, new
//    arrivals, offers) before the browser's own permission prompt.
//  • PushSheet "help" — short steps to unblock notifications when they were
//    denied (Android Chrome / iPhone / desktop).
//  • PushSheet "settings" — master switch + one toggle per topic (profile).
//  • OrderPushPrompt — small card on the order page that also opens the
//    "why" sheet by itself once (then rests for a few days if dismissed).

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BellRing, Truck, Sparkles, Tag, X, Check, ShoppingBag, Heart, ChevronRight } from "lucide-react";
import {
  PUSH_TOPICS,
  PUSH_ASKED_KEY,
  pushSupported,
  pushPermission,
  isPushOn,
  isIosBrowser,
  enablePush,
  disablePush,
  getPushPrefs,
  savePushPrefs,
} from "@/utils/webPush";
import { showToast } from "@/context/ToastContext";

const noopSub = () => () => {};
const TOPIC_ICONS = { orders: Truck, arrivals: Sparkles, offers: Tag, cart: ShoppingBag, wishlist: Heart };

// Live push state for the UI (re-reads on tbx:push-changed / focus).
function subscribePush(cb) {
  window.addEventListener("tbx:push-changed", cb);
  window.addEventListener("focus", cb);
  return () => {
    window.removeEventListener("tbx:push-changed", cb);
    window.removeEventListener("focus", cb);
  };
}
export function usePushState() {
  const sig = useSyncExternalStore(
    subscribePush,
    () => `${pushPermission()}|${isPushOn() ? 1 : 0}|${JSON.stringify(getPushPrefs())}`,
    () => "ssr|0|{}",
  );
  const [perm, on, prefs] = sig.split("|");
  return { ready: perm !== "ssr", perm, on: on === "1", prefs: perm === "ssr" ? {} : JSON.parse(prefs) };
}

function platform() {
  if (typeof navigator === "undefined") return "android";
  if (isIosBrowser()) return "ios";
  return /android/i.test(navigator.userAgent) ? "android" : "desktop";
}

const HELP_STEPS = {
  android: [
    <>Tap the <b>ⓘ</b> or <b>lock</b> icon at the left of the address bar.</>,
    <>Tap <b>Permissions</b> → <b>Notifications</b>.</>,
    <>Choose <b>Allow</b>, then come back here.</>,
  ],
  desktop: [
    <>Click the <b>icon left of the web address</b> at the top.</>,
    <>Open <b>Site settings</b> → <b>Notifications</b>.</>,
    <>Set it to <b>Allow</b>, then come back to this tab.</>,
  ],
  ios: [
    <>Tap <b>Share</b> (the square with an arrow) in Safari.</>,
    <>Choose <b>Add to Home Screen</b> → <b>Add</b>.</>,
    <>Open TheBookX from your Home Screen and turn alerts on there.</>,
  ],
};

export function PushSheet({ open, view: initialView = "why", onClose }) {
  const [view, setView] = useState(initialView);
  const [busy, setBusy] = useState(false);
  const st = usePushState();
  const mounted = useSyncExternalStore(noopSub, () => true, () => false);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setView(initialView), 0);
    return () => clearTimeout(t);
  }, [open, initialView]);

  if (!mounted) return null;

  const turnOn = async () => {
    setBusy(true);
    const r = await enablePush();
    setBusy(false);
    if (r === "granted") {
      showToast("We'll send tracking updates and offers right here.", "success", { title: "Notifications on" });
      if (initialView === "settings") setView("settings");
      else onClose?.(true);
      return true;
    }
    if (r === "denied" || r === "ios-install") setView("help");
    else if (r === "unsupported") showToast("This browser doesn't support notifications.", "info");
    else if (r === "error") showToast("Couldn't turn them on just now — please try again.", "error");
    return false;
  };

  const close = () => !busy && onClose?.(isPushOn());
  const plat = platform();

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="cdp-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.div
            className="cdp psh"
            role="dialog"
            aria-modal="true"
            aria-labelledby="psh-h"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="cdp-x" onClick={close} aria-label="Close" disabled={busy}>
              <X size={18} />
            </button>

            {view === "why" && (
              <>
                <div className="psh-head">
                  <BellRing size={22} aria-hidden="true" />
                  <h3 id="psh-h">Know where your books are</h3>
                </div>
                <p>Turn on notifications and we&apos;ll tell you the moment something changes.</p>
                <ul className="psh-grid">
                  <li>
                    <Truck size={20} />
                    <b>Live tracking</b>
                    <small>Tap the alert to see your parcel</small>
                  </li>
                  <li>
                    <Sparkles size={20} />
                    <b>New arrivals</b>
                    <small>Fresh titles before they sell out</small>
                  </li>
                  <li>
                    <Tag size={20} />
                    <b>Offers</b>
                    <small>Deals on books you saved</small>
                  </li>
                </ul>
                <div className="psh-preview" aria-hidden="true">
                  <img src="/icon-192.png" alt="" />
                  <span>
                    <b>📦 In transit · your order</b>
                    Your books are on the way. Tap to track.
                  </span>
                  <em>now</em>
                </div>
                <button type="button" className="cdp-save" onClick={turnOn} disabled={busy} data-no-busy>
                  {busy ? <span className="cdp-spin" aria-hidden="true" /> : <Bell size={16} strokeWidth={2.6} />}
                  {busy ? "Turning on…" : "Turn on notifications"}
                </button>
                <p className="psh-fine">Your browser asks next — tap <b>Allow</b>. Turn off any time in your profile.</p>
                <button type="button" className="cdp-skip" onClick={close} disabled={busy}>
                  Not now
                </button>
              </>
            )}

            {view === "help" && (
              <>
                <div className="psh-head is-off">
                  <Bell size={22} aria-hidden="true" />
                  <h3 id="psh-h">{plat === "ios" ? "One quick step on iPhone" : "Notifications are blocked"}</h3>
                </div>
                <p>
                  {plat === "ios"
                    ? "iPhone only allows alerts for websites added to your Home Screen. It takes 10 seconds:"
                    : "Your browser has notifications blocked for TheBookX, so it won't ask again. Turn them on in 3 quick steps:"}
                </p>
                <ol className="psh-steps">
                  {HELP_STEPS[plat].map((s, i) => (
                    <li key={i}>
                      <span className="psh-n">{i + 1}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
                {plat !== "ios" && (
                  <button type="button" className="cdp-save" onClick={turnOn} disabled={busy} data-no-busy>
                    {busy ? <span className="cdp-spin" aria-hidden="true" /> : <Check size={16} strokeWidth={3} />}
                    {busy ? "Checking…" : "I've allowed it"}
                  </button>
                )}
                <button type="button" className="cdp-skip" onClick={close} disabled={busy}>
                  {plat === "ios" ? "Got it" : "Maybe later"}
                </button>
              </>
            )}

            {view === "settings" && (
              <>
                <div className="psh-head">
                  <Bell size={22} aria-hidden="true" />
                  <h3 id="psh-h">Notifications</h3>
                </div>
                <p>Choose what we can tell you about. We send at most a couple a day.</p>
                <div className={`psh-master${st.on ? " is-on" : ""}`}>
                  <Bell size={18} aria-hidden="true" />
                  <span className="psh-tx">
                    <b>Push notifications</b>
                    <small>
                      {st.on
                        ? "On for this device"
                        : st.perm === "denied"
                          ? "Blocked in your browser — tap to fix"
                          : "Off — tap to turn on"}
                    </small>
                  </span>
                  <Switch
                    on={st.on}
                    busy={busy}
                    label="Push notifications"
                    onChange={async (next) => {
                      if (next) {
                        if (st.perm === "denied" && !isIosBrowser()) return setView("help");
                        await turnOn();
                      } else {
                        await disablePush();
                        showToast("Notifications turned off.", "info");
                      }
                    }}
                  />
                </div>
                <ul className={`psh-topics${st.on ? "" : " is-dim"}`}>
                  {PUSH_TOPICS.map((t) => {
                    const Ic = TOPIC_ICONS[t.key] || Bell;
                    return (
                      <li key={t.key}>
                        <Ic size={17} aria-hidden="true" />
                        <span className="psh-tx">
                          <b>{t.label}</b>
                          <small>{t.hint}</small>
                        </span>
                        <Switch
                          on={st.on && st.prefs[t.key] !== false}
                          disabled={!st.on}
                          label={t.label}
                          onChange={(next) => savePushPrefs({ [t.key]: next })}
                        />
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function Switch({ on, onChange, disabled, busy, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!on}
      aria-label={label}
      className={`psh-sw${on ? " is-on" : ""}`}
      disabled={disabled || busy}
      onClick={() => onChange(!on)}
      data-no-busy
    >
      <span />
    </button>
  );
}

// Profile row → opens the settings sheet.
export function PushSettingsRow({ className = "pm-row" }) {
  const [open, setOpen] = useState(false);
  const st = usePushState();
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        <span className="pm-ic">
          <Bell size={18} />
        </span>
        <span className="pm-label">Notifications</span>
        {st.ready && <span className={`psh-row-st${st.on ? " is-on" : ""}`}>{st.on ? "On" : "Off"}</span>}
        <ChevronRight size={18} className="pm-arrow" />
      </button>
      <PushSheet open={open} view="settings" onClose={() => setOpen(false)} />
    </>
  );
}

const REST_DAYS = { default: 3, denied: 7 };

// Order page: a small "get tracking alerts" card + the auto "why" sheet.
export function OrderPushPrompt({ auto = true }) {
  const st = usePushState();
  const [sheet, setSheet] = useState(null); // null | "why" | "help"

  useEffect(() => {
    if (!auto || !st.ready || st.on || !pushSupported()) return;
    const perm = pushPermission();
    let last = 0;
    try {
      last = Number(localStorage.getItem(PUSH_ASKED_KEY) || 0);
    } catch {}
    const rest = (REST_DAYS[perm] || 3) * 86400000;
    if (Date.now() - last < rest) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(PUSH_ASKED_KEY, String(Date.now()));
      } catch {}
      setSheet(perm === "denied" ? "help" : "why");
    }, 2500);
    return () => clearTimeout(t);
  }, [auto, st.ready, st.on]);

  if (!st.ready || st.on) return null;
  const supported = pushSupported() || isIosBrowser();
  if (!supported) return null;

  return (
    <>
      <button type="button" className="psh-card" onClick={() => setSheet(st.perm === "denied" ? "help" : "why")}>
        <BellRing size={18} aria-hidden="true" />
        <span className="psh-tx">
          <b>Get live tracking alerts</b>
          <small>We&apos;ll notify you with a tracking link at every step.</small>
        </span>
        <span className="psh-card-cta">Turn on</span>
      </button>
      <PushSheet open={!!sheet} view={sheet || "why"} onClose={() => setSheet(null)} />
    </>
  );
}
