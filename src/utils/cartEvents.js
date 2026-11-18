// Lightweight engagement tracking for the Abandoned Cart sheet.
//
// Records, per device/user, how many times they clicked "Suggest me",
// opened "View bill", or tapped the Handling & Care info icon — anywhere on the
// site. Keyed by the same stable device id the cart sync uses, so it lands on
// the shopper's existing abandoned-cart row (or creates one if needed).
//
//   import { trackCartEvent } from "@/utils/cartEvents";
//   trackCartEvent("suggest" | "viewbill" | "handlinginfo");

function getDeviceId() {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem("tbx_device_id");
    if (!id) {
      id =
        "dev_" +
        Math.random().toString(36).slice(2, 10) +
        Date.now().toString(36);
      localStorage.setItem("tbx_device_id", id);
    }
    return id;
  } catch {
    return "";
  }
}

// Collapse rapid duplicate fires (e.g. a modal re-opening) within a short window.
const _lastFired = {};

export function trackCartEvent(event) {
  if (typeof window === "undefined") return;
  const ev = String(event || "").toLowerCase();
  if (!["suggest", "viewbill", "handlinginfo"].includes(ev)) return;

  const now = Date.now();
  if (_lastFired[ev] && now - _lastFired[ev] < 800) return; // de-dupe
  _lastFired[ev] = now;

  const deviceId = getDeviceId();
  if (!deviceId) return;
  let phone = "";
  try {
    phone = String(localStorage.getItem("track_orders_phone") || "")
      .replace(/\D/g, "")
      .slice(-10);
  } catch {}

  const payload = {
    action: "event",
    event: ev,
    cartKey: deviceId,
    deviceId,
    phone,
    source: window.location?.pathname || "",
  };
  const send = () => {
    // Tell the server when this device already has a sheet row, so it updates
    // it instead of risking a duplicate append (shared with the cart sync).
    let known = false;
    try {
      known = localStorage.getItem("tbx_cart_row") === deviceId;
    } catch {}
    try {
      fetch("/api/abandoned-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, known }),
        keepalive: true,
      })
        .then((r) => r.json())
        .then((j) => {
          if (j && j.row) {
            try {
              localStorage.setItem("tbx_cart_row", deviceId);
            } catch {}
          }
        })
        .catch(() => {});
    } catch {}
  };
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(send, { timeout: 1500 });
  } else {
    send();
  }
}
