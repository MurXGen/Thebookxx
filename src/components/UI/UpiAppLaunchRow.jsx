"use client";

import { ArrowRight } from "lucide-react";
import { showToast } from "@/context/ToastContext";
import {
  UPI_APPS,
  upiAppByName,
  launchUpiApp,
  downloadUpiQr,
} from "@/utils/upiApps";

// A single "Open <app>" button shown directly below the Verify button on the
// UPI QR screen. Copies the real UPI ID and opens the chosen app (store
// fallback). When no app was pre-chosen (order-page flow) it shows a compact
// 3-app row instead.
export default function UpiAppLaunchRow({
  upiId,
  amount = 0,
  chosenApp = "",
  advance = false,
}) {
  const primary = chosenApp ? upiAppByName(chosenApp) : null;

  const handle = (app) => {
    // Auto-download the branded QR so they can scan it inside the UPI app,
    // then copy the UPI ID and open the app.
    downloadUpiQr({ amount, upiId, advance });
    launchUpiApp(app, upiId);
    showToast(
      `UPI ID copied & QR saved — open ${app ? app.label : "your UPI app"}, paste the ID and pay ₹${amount}`,
      "success",
      { title: "Ready to pay", icon: "cart" },
    );
  };

  if (primary) {
    return (
      <button
        type="button"
        className={`upiopen-btn ${primary.key}`}
        onClick={() => handle(primary)}
      >
        <span>Open {primary.label}</span>
        <ArrowRight size={17} className="upiopen-arrow" />
      </button>
    );
  }

  return (
    <div className="upiopen-row">
      {UPI_APPS.map((a) => (
        <button
          key={a.key}
          type="button"
          className={`upiopen-chip ${a.key}`}
          onClick={() => handle(a)}
        >
          {a.label}
          <ArrowRight size={14} />
        </button>
      ))}
    </div>
  );
}
