// Shared UPI-app launch helpers used by the checkout QR modal and the
// order-page "Pay online" QR. Tapping an app copies our real UPI ID and opens
// that app; if it isn't installed we fall back to the Play Store (Android) or
// App Store (iOS), and on desktop we open the store page in a new tab.

export const UPI_APPS = [
  {
    key: "paytm",
    label: "Paytm",
    pkg: "net.one97.paytm",
    ios: "paytmmp://",
    storeIos: "https://apps.apple.com/in/app/id473941634",
  },
  {
    key: "phonepe",
    label: "PhonePe",
    pkg: "com.phonepe.app",
    ios: "phonepe://",
    storeIos: "https://apps.apple.com/in/app/id1170055821",
  },
  {
    key: "gpay",
    label: "Google Pay",
    pkg: "com.google.android.apps.nbu.paisa.user",
    ios: "gpay://",
    storeIos: "https://apps.apple.com/in/app/id1193357041",
  },
];

// Copy the UPI ID to the clipboard (no app launch).
export function copyUpiId(upiId) {
  if (typeof navigator === "undefined") return;
  try {
    navigator.clipboard?.writeText(String(upiId || ""));
  } catch {}
}

// Map a human label ("Paytm" / "PhonePe" / "Google Pay" / "GPay") to its meta.
export function upiAppByName(name) {
  const n = String(name || "").toLowerCase();
  if (n.includes("paytm")) return UPI_APPS[0];
  if (n.includes("phonepe") || n.includes("phone pe")) return UPI_APPS[1];
  if (n.includes("google") || n.includes("gpay") || n.includes("g pay"))
    return UPI_APPS[2];
  return null; // "Other UPI apps" / unknown → no specific app
}

// Draw and auto-download a clean, branded UPI QR card (like real UPI apps) so
// the shopper can scan it from their gallery after switching to a UPI app.
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function downloadUpiQr({
  amount = 0,
  upiId = "",
  payeeName = "TheBookX",
  advance = false,
  qrSrc = "/books/uskillbook.png",
} = {}) {
  if (typeof document === "undefined") return;

  const render = (img) => {
    const S = 2; // 2x for a crisp export
    const W = 560;
    const H = 720;
    const c = document.createElement("canvas");
    c.width = W * S;
    c.height = H * S;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(S, S);

    // Card background + subtle border
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#e9eaee";
    ctx.lineWidth = 2;
    roundRect(ctx, 6, 6, W - 12, H - 12, 26);
    ctx.stroke();

    // Dark header ("PAYING TO / TheBookX" + amount)
    ctx.save();
    roundRect(ctx, 30, 30, W - 60, 92, 16);
    ctx.clip();
    ctx.fillStyle = "#0e1013";
    ctx.fillRect(30, 30, W - 60, 92);
    ctx.restore();

    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "600 12px Poppins, system-ui, sans-serif";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("PAYING TO", 50, 62);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 24px Poppins, system-ui, sans-serif";
    ctx.fillText(payeeName, 50, 96);

    ctx.textAlign = "right";
    ctx.fillStyle = "#34d399";
    ctx.font = "800 26px Poppins, system-ui, sans-serif";
    ctx.fillText(`₹${amount}`, W - 50, 82);
    if (advance) {
      ctx.fillStyle = "#fb8500";
      ctx.font = "700 11px Poppins, system-ui, sans-serif";
      ctx.fillText("ADVANCE", W - 50, 102);
    }
    ctx.textAlign = "left";

    // "Scan & pay"
    ctx.fillStyle = "#6b7280";
    ctx.font = "600 14px Poppins, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Scan & pay with any UPI app", W / 2, 160);

    // QR
    const qr = 320;
    const qx = (W - qr) / 2;
    const qy = 188;
    // white frame
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#f0f1f4";
    roundRect(ctx, qx - 14, qy - 14, qr + 28, qr + 28, 18);
    ctx.fill();
    ctx.stroke();
    try {
      ctx.drawImage(img, qx, qy, qr, qr);
    } catch {}

    // UPI id
    ctx.fillStyle = "#111827";
    ctx.font = "600 15px Poppins, system-ui, sans-serif";
    ctx.fillText(upiId, W / 2, qy + qr + 54);

    // Footer brand line
    ctx.fillStyle = "#9ca3af";
    ctx.font = "700 13px Poppins, system-ui, sans-serif";
    ctx.fillText("BHIM  ·  UPI  ·  GPay  ·  PhonePe  ·  Paytm", W / 2, H - 70);
    ctx.fillStyle = "#c2410c";
    ctx.font = "800 16px Poppins, system-ui, sans-serif";
    ctx.fillText("TheBookX", W / 2, H - 40);
    ctx.textAlign = "left";

    c.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "thebookx-upi-qr.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, "image/png");
  };

  const img = new Image();
  img.onload = () => render(img);
  img.onerror = () => {
    // Fallback: just download the raw QR asset.
    const a = document.createElement("a");
    a.href = qrSrc;
    a.download = "thebookx-upi-qr.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  img.src = qrSrc;
}

// Copy the UPI ID, then open the app (with store fallback). Returns true if a
// specific app was launched, false when only the id was copied (generic).
export function launchUpiApp(app, upiId) {
  if (typeof window === "undefined") return false;
  try {
    navigator.clipboard?.writeText(String(upiId || ""));
  } catch {}

  if (!app) return false; // generic "Other UPI apps" — id copied, nothing to open

  const UA = navigator.userAgent || "";
  const isAndroid = /android/i.test(UA);
  const isIOS = /iphone|ipad|ipod/i.test(UA);
  const play = `https://play.google.com/store/apps/details?id=${app.pkg}`;

  try {
    if (isAndroid) {
      // Opens the app, or the Play Store if it isn't installed.
      window.location.assign(
        `intent://#Intent;package=${app.pkg};S.browser_fallback_url=${encodeURIComponent(
          play,
        )};end`,
      );
    } else if (isIOS) {
      // Try the app scheme; if nothing takes over, send them to the App Store.
      const started = Date.now();
      setTimeout(() => {
        if (!document.hidden && Date.now() - started < 1600) {
          window.location.assign(app.storeIos);
        }
      }, 1200);
      window.location.assign(app.ios);
    } else {
      // Desktop — no app to open; show the store page instead.
      window.open(play, "_blank", "noopener,noreferrer");
    }
  } catch {}
  return true;
}
