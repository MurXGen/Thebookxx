"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { X, Check, CalendarClock } from "lucide-react";

// ── date helpers (self-contained so the modal can be reused anywhere) ──
function parseSheetDate(input) {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  const str = String(input).trim();
  if (!str) return null;
  if (str.startsWith("Date(")) {
    const m = str.match(/Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?/);
    if (m) {
      const d = new Date(
        +m[1],
        +m[2],
        +m[3],
        m[4] ? +m[4] : 0,
        m[5] ? +m[5] : 0,
        m[6] ? +m[6] : 0,
      );
      if (!isNaN(d.getTime())) return d;
    }
  }
  if (str.includes("/")) {
    const m = str.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?)?/i,
    );
    if (m) {
      let hours = m[4] ? +m[4] : 0;
      const mer = (m[7] || "").toLowerCase();
      if (mer === "pm" && hours < 12) hours += 12;
      if (mer === "am" && hours === 12) hours = 0;
      const d = new Date(+m[3], +m[2] - 1, +m[1], hours, m[5] ? +m[5] : 0, m[6] ? +m[6] : 0);
      if (!isNaN(d.getTime())) return d;
    }
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function getOrderDateValue(order) {
  return (
    order["Timestamp (D)"] ||
    order["Timestamp"] ||
    order["Timestamp(D)"] ||
    order["Order Date"] ||
    null
  );
}

// Track-shipment sheet with a vehicle that physically travels down the
// vertical timeline to the current stage — train for standard orders,
// flight for faster ones.
export default function TrackSheet({
  trackOrder,
  onClose,
  trackCopied,
  setTrackCopied,
}) {
  const s = String(trackOrder.status || "").toLowerCase();
  const delivered = /delivered/.test(s);
  const outForDelivery = /out\s*for\s*delivery/.test(s);
  const inTransit = /in\s*transit/.test(s);
  const shipped =
    !!trackOrder.shippingId || inTransit || outForDelivery || delivered;
  const isFaster = /faster|express|flight|air/i.test(
    trackOrder["Delivery Type"] || trackOrder.deliveryType || "",
  );
  const vehicle = isFaster ? "✈️" : "🚆";

  const DAY_MS = 24 * 60 * 60 * 1000;
  const orderDate = parseSheetDate(getOrderDateValue(trackOrder));
  const [minDays, maxDays] = isFaster ? [1, 5] : [4, 12];
  const estFrom = orderDate
    ? new Date(orderDate.getTime() + minDays * DAY_MS)
    : null;
  const estTo = orderDate
    ? new Date(orderDate.getTime() + maxDays * DAY_MS)
    : null;
  const fmtDate = (d) =>
    d ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : null;

  const stages = [
    { label: "Order confirmed", sub: "We've received your order", state: "done" },
    {
      label: "Getting shipped from Mumbai",
      sub: "Packed & handed to the courier",
      state: shipped ? "done" : "active",
    },
    {
      label: "In transit",
      sub:
        delivered || outForDelivery
          ? "Reached your city"
          : inTransit
            ? "Your parcel is on its way"
            : "We'll update this once it ships",
      state:
        delivered || outForDelivery ? "done" : inTransit ? "active" : "todo",
    },
    {
      label: "Out for delivery",
      sub: delivered
        ? "Handed to your local courier"
        : outForDelivery
          ? "Arriving today — keep your phone handy"
          : "Almost there",
      state: delivered ? "done" : outForDelivery ? "active" : "todo",
    },
    {
      label: "Delivered",
      sub: delivered
        ? "Your books have arrived — happy reading!"
        : "Arriving soon",
      state: delivered ? "done" : "todo",
    },
  ];
  const activeIndex = delivered
    ? stages.length - 1
    : Math.max(
        0,
        stages.findIndex((x) => x.state === "active"),
      );

  const railRef = useRef(null);
  const dotRefs = useRef([]);
  const trainControls = useAnimationControls();
  const fillControls = useAnimationControls();
  const [geo, setGeo] = useState(null);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    const measure = () => {
      const dots = dotRefs.current;
      const container = railRef.current;
      if (
        !container ||
        !dots[0] ||
        !dots[activeIndex] ||
        !dots[stages.length - 1]
      )
        return;
      const offsetWithin = (el) => {
        let x = 0;
        let y = 0;
        let node = el;
        while (node && node !== container) {
          y += node.offsetTop;
          x += node.offsetLeft;
          node = node.offsetParent;
        }
        return { x, y };
      };
      const cy = (el) => offsetWithin(el).y + el.offsetHeight / 2;
      const cx = (el) => offsetWithin(el).x + el.offsetWidth / 2;
      const next = {
        x: cx(dots[0]),
        startY: cy(dots[0]),
        targetY: cy(dots[activeIndex]),
        endY: cy(dots[stages.length - 1]),
      };
      setGeo((prev) =>
        prev &&
        prev.x === next.x &&
        prev.startY === next.startY &&
        prev.targetY === next.targetY &&
        prev.endY === next.endY
          ? prev
          : next,
      );
    };
    const id1 = requestAnimationFrame(measure);
    const id2 = setTimeout(measure, 250);
    return () => {
      cancelAnimationFrame(id1);
      clearTimeout(id2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackOrder]);

  useEffect(() => {
    if (!geo) return;
    let cancelled = false;
    const { startY, targetY } = geo;
    trainControls.set({ y: startY, opacity: 0, scale: 0.85 });
    fillControls.set({ height: 0 });
    const haptic = (pattern) => {
      try {
        if (typeof navigator !== "undefined" && navigator.vibrate)
          navigator.vibrate(pattern);
      } catch {}
    };
    (async () => {
      await new Promise((r) => setTimeout(r, 500));
      if (cancelled) return;
      await trainControls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.35, ease: "easeOut" },
      });
      if (cancelled) return;
      setMoving(true);
      if (isFaster) haptic([220, 40, 340, 40, 520, 40, 260]);
      else {
        const chug = [];
        for (let i = 0; i < 11; i++) chug.push(45, 95);
        haptic(chug);
      }
      const dur = delivered ? 2.8 : 2.15;
      const ease = [0.45, 0.02, 0.25, 1];
      fillControls.start({
        height: Math.max(0, targetY - startY),
        transition: { duration: dur, ease },
      });
      await trainControls.start({ y: targetY, transition: { duration: dur, ease } });
      if (cancelled) return;
      setMoving(false);
      haptic(55);
      trainControls.start({
        y: [targetY, targetY - 3, targetY],
        transition: { duration: 1.9, repeat: Infinity, ease: "easeInOut" },
      });
    })();
    return () => {
      cancelled = true;
      try {
        if (typeof navigator !== "undefined" && navigator.vibrate)
          navigator.vibrate(0);
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo]);

  const openIndiaPost = () => {
    try {
      navigator.clipboard.writeText(trackOrder.shippingId || "");
      setTrackCopied && setTrackCopied(true);
    } catch {}
    window.open("https://www.indiapost.gov.in", "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      className="bill-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bill-modal track-sheet"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.38, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bill-header">
          <div className="flex flex-col">
            <span className="weight-700 font-16">Track shipment</span>
            <span className="font-12 gray-500">
              Order {trackOrder.orderId || trackOrder["Order ID"] || ""}
            </span>
          </div>
          <span className="cursor-pointer" onClick={onClose}>
            <X size={18} />
          </span>
        </div>

        <div className="track-body">
          <div className="track-timeline" ref={railRef}>
            {geo && (
              <div
                className="track-vline"
                style={{
                  left: geo.x,
                  top: geo.startY,
                  height: Math.max(0, geo.endY - geo.startY),
                }}
              >
                <motion.div className="track-vline-fill" animate={fillControls} />
              </div>
            )}
            {geo && (
              <div className="track-train-wrap" style={{ left: geo.x }}>
                <motion.div
                  className="track-train"
                  initial={{ opacity: 0 }}
                  animate={trainControls}
                >
                  <span className={`track-train-tail${moving ? " on" : ""}`} />
                  <span className="track-train-glow" />
                  <span className="track-train-emoji">{vehicle}</span>
                </motion.div>
              </div>
            )}

            <motion.div
              className="track-steps"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.14, delayChildren: 0.18 },
                },
              }}
            >
              {stages.map((st, i) => (
                <motion.div
                  className={`track-step ${st.state}`}
                  key={i}
                  variants={{
                    hidden: { opacity: 0, x: -6 },
                    show: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.3, ease: "easeOut" },
                    },
                  }}
                >
                  <div className="track-step-rail">
                    <span
                      className="track-step-dot"
                      ref={(el) => {
                        dotRefs.current[i] = el;
                      }}
                    >
                      {st.state === "done" && <Check size={13} strokeWidth={3} />}
                    </span>
                  </div>
                  <div className="track-step-txt">
                    <strong>{st.label}</strong>
                    <span>{st.sub}</span>
                    {st.label === "In transit" &&
                      inTransit &&
                      trackOrder.shippingId && (
                        <button
                          type="button"
                          className="track-check-link"
                          onClick={openIndiaPost}
                        >
                          {trackCopied
                            ? "ID copied — paste on India Post ↗"
                            : "Track on India Post ↗"}
                        </button>
                      )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {estFrom && estTo && (
            <div className="track-eta-note">
              <CalendarClock size={15} />
              <span>
                {delivered ? (
                  <>Delivered within the estimated window — as promised.</>
                ) : (
                  <>
                    Estimated delivery{" "}
                    <strong>
                      {fmtDate(estFrom)} – {fmtDate(estTo)}
                    </strong>
                    . {isFaster ? "Express" : "Standard"} orders usually arrive
                    within {minDays}–{maxDays} days as estimated.
                  </>
                )}
              </span>
            </div>
          )}

          {delivered && (
            <div className="track-delivered">
              <Check size={14} strokeWidth={3} /> Delivered
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
