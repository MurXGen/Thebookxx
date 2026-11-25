"use client";
import "./DeliveryEtaStripe.styles.css";

// Slim "Order within 2h 14m · Get it Wed 26 – Mon 1 Dec" stripe for the book
// page, bag and checkout. Dates come from src/lib/deliveryEta.js (India time,
// 12:00 cutoff, Sundays skipped) and the saved delivery pincode; a light
// sheen sweeps across it every few seconds.

import { useEffect, useState } from "react";
import { Truck, Zap, CloudLightning } from "lucide-react";
import { etaRangeFor, getDeliveryEta, fmtEtaRange, fmtCountdown } from "@/lib/deliveryEta";
import { thunderEta } from "@/lib/thunderDelivery";

function readPin() {
  try {
    return {
      pincode: String(localStorage.getItem("delivery_pincode") || "").replace(/\D/g, ""),
      city: localStorage.getItem("delivery_city") || "",
      state: localStorage.getItem("delivery_state") || "",
    };
  } catch {
    return { pincode: "", city: "", state: "" };
  }
}

export default function DeliveryEtaStripe({ faster = false, thunder = false, address = null, className = "" }) {
  const [now, setNow] = useState(0); // 0 until mounted (no server/client mismatch)
  const [pin, setPin] = useState({ pincode: "", city: "", state: "" });

  useEffect(() => {
    const t0 = setTimeout(() => {
      setPin(readPin());
      setNow(Date.now());
    }, 0);
    // Minute precision is enough for "2h 14m"; re-check every 30s.
    const t = setInterval(() => setNow(Date.now()), 30000);
    const onPin = () => setPin(readPin());
    window.addEventListener("tbx:pincode-set", onPin);
    return () => {
      clearTimeout(t0);
      clearInterval(t);
      window.removeEventListener("tbx:pincode-set", onPin);
    };
  }, []);

  if (!now) return null;

  // Thunder (24/48 Speed Post): one date — tomorrow before 4 PM, else the day after.
  if (thunder) {
    const t = thunderEta(now);
    return (
      <div className={`eta-stripe is-thunder${t.msToCutoff ? " is-live" : ""}${className ? ` ${className}` : ""}`} role="status">
        <span className="eta-ic" aria-hidden="true">
          <CloudLightning size={14} />
        </span>
        <span className="eta-tx">
          {t.msToCutoff ? (
            <>
              Order within <b className="eta-cd">{fmtCountdown(t.msToCutoff)}</b>
              <span className="eta-dot" aria-hidden="true">·</span>
              Get it <b>tomorrow, {t.dateText}</b>
            </>
          ) : (
            <>
              Thunder<span className="eta-dot" aria-hidden="true">·</span>
              Get it <b>{t.dateText}</b>
            </>
          )}
        </span>
        <span className="eta-days">{t.days}-day</span>
      </div>
    );
  }

  // Checkout passes the typed address; elsewhere use the saved pincode.
  const where = address?.pincode || address?.state ? address : pin;
  const range = etaRangeFor({ ...where, faster });
  const eta = getDeliveryEta({ range, now });
  const dates = fmtEtaRange(eta.from, eta.to);

  return (
    <div className={`eta-stripe${eta.shipsToday ? " is-live" : ""}${className ? ` ${className}` : ""}`} role="status">
      <span className="eta-ic" aria-hidden="true">
        {faster ? <Zap size={14} /> : <Truck size={14} />}
      </span>
      <span className="eta-tx">
        {eta.shipsToday ? (
          <>
            Order within <b className="eta-cd">{fmtCountdown(eta.msToCutoff)}</b>
            <span className="eta-dot" aria-hidden="true">·</span>
            Get it <b>{dates}</b>
          </>
        ) : (
          <>
            Order now<span className="eta-dot" aria-hidden="true">·</span>
            Get it <b>{dates}</b>
          </>
        )}
      </span>
      <span className="eta-days">
        {eta.days[0]}–{eta.days[1]} days
      </span>
    </div>
  );
}
