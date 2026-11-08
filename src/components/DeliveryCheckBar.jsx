"use client";

// Slim delivery stripe, fixed under the navbar: the delivery message on the
// left, the shopper's pincode (orange button) on the right. Tapping the button
// opens a small sheet to enter / change it; the pincode is remembered.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Truck, Zap, MapPin, ChevronDown, X, Loader2 } from "lucide-react";

// Maharashtra pincodes start 40–44 (400xxx–444xxx), except 403xxx which is Goa.
// Intra-state orders ship fast, so Maharashtra sees a single 1–5 day estimate.
export function isMaharashtraPin(pin) {
  const p = String(pin || "").replace(/\D/g, "");
  if (p.length < 6) return false;
  if (p.slice(0, 3) === "403") return false; // Goa
  return ["40", "41", "42", "43", "44"].includes(p.slice(0, 2));
}

const PIN_KEY = "delivery_pincode";
const OPEN_EVENT = "tbx:open-pincode";

// Lets other parts of the site (e.g. the book page) open the pincode sheet.
export function openPincodeSheet() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}
const CITY_KEY = "delivery_city";

async function lookupCity(pin) {
  try {
    const r = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const d = await r.json();
    if (d?.[0]?.Status === "Success") {
      const po = d[0].PostOffice?.[0] || {};
      return { city: po.District || "", state: po.State || "" };
    }
    return null; // not a real pincode
  } catch {
    return { city: "", state: "" }; // offline / API down: accept without a city
  }
}

// Log the check to the "Pincodes" sheet tab (one row per device). Same device id
// the cart tracking uses, so the row can be marked Converted after an order.
function logPincode(pin, city, state) {
  try {
    let deviceId = localStorage.getItem("tbx_device_id");
    if (!deviceId) {
      deviceId = "dev_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      localStorage.setItem("tbx_device_id", deviceId);
    }
    fetch("/api/pincodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        action: "check",
        deviceId,
        pincode: pin,
        city,
        state,
        phone: localStorage.getItem("track_orders_phone") || "",
        name: localStorage.getItem("track_orders_name") || "",
        page: window.location.pathname,
      }),
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

export default function DeliveryCheckBar() {
  const [pin, setPin] = useState("");
  const [city, setCity] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [checking, setChecking] = useState(false);
  const [err, setErr] = useState("");
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
      try {
        const saved = String(localStorage.getItem(PIN_KEY) || "").replace(/\D/g, "");
        if (saved.length === 6) {
          setPin(saved);
          setCity(localStorage.getItem(CITY_KEY) || "");
        }
      } catch {
        /* ignore */
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open]);

  const openSheet = () => {
    setDraft(pin);
    setErr("");
    setOpen(true);
  };

  useEffect(() => {
    const onOpen = () => {
      setDraft(String(localStorage.getItem(PIN_KEY) || "").replace(/\D/g, "").slice(0, 6));
      setErr("");
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  const submit = async (e) => {
    e?.preventDefault();
    if (draft.length !== 6) {
      setErr("Enter a 6-digit pincode");
      return;
    }
    setChecking(true);
    const found = await lookupCity(draft);
    setChecking(false);
    if (found === null) {
      setErr("We couldn't find this pincode. Please check it.");
      return;
    }
    setPin(draft);
    setCity(found.city);
    try {
      localStorage.setItem(PIN_KEY, draft);
      localStorage.setItem(CITY_KEY, found.city);
    } catch {
      /* ignore */
    }
    if (draft !== pin) logPincode(draft, found.city, found.state);
    window.dispatchEvent(new Event("tbx:pincode-set"));
    setOpen(false);
  };

  const mh = pin.length === 6 && isMaharashtraPin(pin);
  const place = city || pin;

  return (
    <div className="delbar">
      <div className="delbar-inner">
        <span className="delbar-msg">
          {pin ? (
            mh ? (
              <>
                <Zap size={14} className="delbar-msg-ic fast" />
                <span>
                  Delivers to <b>{place}</b> in <b>1–5 days</b>
                </span>
              </>
            ) : (
              <>
                <Truck size={14} className="delbar-msg-ic" />
                <span>
                  Delivers to <b>{place}</b> in <b>4–9 days</b>
                  <span className="delbar-msg-fast"> · 1–6 days with Faster delivery</span>
                </span>
              </>
            )
          ) : (
            <>
              <Truck size={14} className="delbar-msg-ic" />
              <span>See how fast we deliver to you</span>
            </>
          )}
        </span>

        <button
          type="button"
          className={`delbar-btn${pin ? " set" : ""}`}
          onClick={openSheet}
          aria-label={pin ? `Delivery pincode ${pin}, change` : "Enter delivery pincode"}
        >
          <MapPin size={13} />
          {pin || "Enter pincode"}
          {pin && <ChevronDown size={13} />}
        </button>
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                className="bill-modal-overlay delbar-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
              >
                <motion.form
                  className="delbar-sheet"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="delbar-title"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  onClick={(e) => e.stopPropagation()}
                  onSubmit={submit}
                >
                  <div className="delbar-sheet-head">
                    <b id="delbar-title">Your delivery pincode</b>
                    <button
                      type="button"
                      className="delbar-sheet-x"
                      aria-label="Close"
                      onClick={() => setOpen(false)}
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <p className="delbar-sheet-sub">
                    We&apos;ll show how soon your books can reach you.
                  </p>
                  <label className="delbar-lbl" htmlFor="delbar-pin">
                    Pincode
                  </label>
                  <input
                    id="delbar-pin"
                    ref={inputRef}
                    className={`delbar-input2${err ? " err" : ""}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={6}
                    placeholder="e.g. 400019"
                    value={draft}
                    onChange={(e) => {
                      setDraft(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setErr("");
                    }}
                  />
                  {err && <span className="delbar-err">{err}</span>}
                  <button
                    type="submit"
                    className="pri-big-btn width100 delbar-submit"
                    disabled={checking || draft.length !== 6}
                    data-no-busy
                  >
                    {checking ? (
                      <>
                        <Loader2 size={16} className="lb-spinner" /> Checking…
                      </>
                    ) : (
                      "Check delivery"
                    )}
                  </button>
                </motion.form>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
