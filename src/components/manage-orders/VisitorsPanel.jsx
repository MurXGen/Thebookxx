"use client";

// Manage-orders → Visitors: sub-tabs in the same style as Users / Track.
import { useState } from "react";
import DevicesPanel from "./DevicesPanel";
import TimersPanel from "./TimersPanel";

export default function VisitorsPanel() {
  const [tab, setTab] = useState("devices");
  return (
    <div className="an2 vz-wrap">
      <div className="mo-book-subtabs" role="tablist">
        {[
          { k: "devices", label: "All devices" },
          { k: "timers", label: "Offer timers" },
        ].map((t) => (
          <button
            key={t.k}
            type="button"
            role="tab"
            aria-selected={tab === t.k}
            className={`mo-book-subtab${tab === t.k ? " on" : ""}`}
            onClick={() => setTab(t.k)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "devices" ? <DevicesPanel /> : <TimersPanel />}
    </div>
  );
}
