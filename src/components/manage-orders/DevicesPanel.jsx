"use client";

// Manage-orders → Visitors → All devices. One card per Device ID, joined from
// the Pincodes, Timers and Abandoned Cart tabs: who they are, where they are,
// what's in their cart, their offer timer and whether they ordered.

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, X, Loader2, MapPin, ShoppingBag, Clock, Check, Phone } from "lucide-react";
import { ADMIN_CODE_KEY } from "@/lib/adminCode";

function adminCode() {
  try {
    return sessionStorage.getItem(ADMIN_CODE_KEY) || localStorage.getItem(ADMIN_CODE_KEY) || "";
  } catch {
    return "";
  }
}

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
function ago(ms) {
  if (!ms) return "—";
  const m = Math.floor((Date.now() - ms) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function leftTxt(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h ? `${h}h ${m}m left` : `${m}m left`;
}

const FILTERS = [
  ["all", "All"],
  ["cart", "Cart, no order"],
  ["ordered", "Ordered"],
  ["waiting", "Asked to extend"],
  ["known", "Has phone"],
];

export default function DevicesPanel() {
  const [devices, setDevices] = useState([]);
  const [missing, setMissing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [needCode, setNeedCode] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch("/api/admin/devices", { headers: { "x-admin-code": adminCode() }, cache: "no-store" });
      if (r.status === 401) {
        setNeedCode(true);
        setDevices([]);
        return;
      }
      setNeedCode(false);
      const d = await r.json();
      if (!d.success) setErr(d.error || "Could not load devices");
      setDevices(d.devices || []);
      setMissing(d.missing || []);
    } catch {
      setErr("Could not load devices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const match = (d, k) =>
    k === "all" ||
    (k === "cart" && d.cart && d.cart.items > 0 && !d.converted) ||
    (k === "ordered" && d.converted) ||
    (k === "waiting" && d.timer?.extendRequested && !d.converted) ||
    (k === "known" && !!d.phone);

  const counts = useMemo(() => {
    const c = {};
    FILTERS.forEach(([k]) => (c[k] = devices.filter((d) => match(d, k)).length));
    c.detailAdds = devices.reduce((n, d) => n + (d.adds?.detail || 0), 0);
    c.cardAdds = devices.reduce((n, d) => n + (d.adds?.card || 0), 0);
    c.cartValue = devices
      .filter((d) => match(d, "cart"))
      .reduce((n, d) => n + (d.cart?.value || 0), 0);
    return c;
  }, [devices]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return devices.filter(
      (d) =>
        match(d, filter) &&
        (!term ||
          [d.deviceId, d.name, d.phone, d.pincode?.pincode, d.pincode?.city, d.cart?.books, ...(d.orders || [])].some((v) =>
            String(v || "").toLowerCase().includes(term),
          )),
    );
  }, [devices, filter, q]);

  return (
    <div className="vz">
      <div className="vz-stats">
        <div className="vz-stat">
          <b>{devices.length}</b>
          <span>Devices</span>
        </div>
        <div className="vz-stat hot">
          <b>{counts.cart || 0}</b>
          <span>Cart, no order · {inr(counts.cartValue)}</span>
        </div>
        <div className="vz-stat">
          <b>{counts.ordered || 0}</b>
          <span>Ordered</span>
        </div>
        <div className="vz-stat">
          <b>{counts.known || 0}</b>
          <span>Have a phone</span>
        </div>
        <div className="vz-stat">
          <b>{counts.detailAdds || 0}</b>
          <span>Bag adds · book page</span>
        </div>
        <div className="vz-stat">
          <b>{counts.cardAdds || 0}</b>
          <span>Bag adds · book cards</span>
        </div>
      </div>

      <div className="vz-tools">
        <div className="vz-filters" role="tablist">
          {FILTERS.map(([k, l]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={filter === k}
              className={filter === k ? "on" : ""}
              onClick={() => setFilter(k)}
              data-no-busy
            >
              {l} <em>{counts[k] || 0}</em>
            </button>
          ))}
        </div>
        <label className="vz-search">
          <Search size={15} aria-hidden="true" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ID, name, phone, pincode, city, book, order"
            aria-label="Search devices"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </label>
        <button type="button" className="vz-refresh" onClick={load} disabled={loading} data-no-busy>
          {loading ? <Loader2 size={15} className="vz-spin" /> : <RefreshCw size={15} />} Refresh
        </button>
      </div>

      {needCode && (
        <form
          className="vz-code"
          onSubmit={(e) => {
            e.preventDefault();
            const c = codeInput.trim();
            if (!c) return;
            try {
              localStorage.setItem(ADMIN_CODE_KEY, c);
              sessionStorage.setItem(ADMIN_CODE_KEY, c);
            } catch {
              /* ignore */
            }
            setCodeInput("");
            load();
          }}
        >
          <span>Enter your admin code once to see visitor data on this device.</span>
          <input type="password" value={codeInput} onChange={(e) => setCodeInput(e.target.value)} placeholder="Admin code" aria-label="Admin code" />
          <button type="submit" data-no-busy>
            Unlock
          </button>
        </form>
      )}
      {missing.length > 0 && <p className="vz-note">Couldn&apos;t read: {missing.join(", ")} tab. Check the tab name and header row.</p>}
      {err && <p className="vz-note err">{err}</p>}
      {!loading && !needCode && !err && list.length === 0 && <p className="vz-empty">No devices match.</p>}

      <div className="vz-list">
        {list.map((d) => {
          const sid = d.deviceId.slice(-6);
          return (
            <article key={d.deviceId} className={`vz-card${d.converted ? " done" : d.cart?.items ? " cart" : ""}`}>
              <header className="vz-card-top">
                <span className="vz-who">
                  <b>{d.name || "Unknown visitor"}</b>
                  <small>
                    {sid} · seen {ago(d.lastSeen)}
                  </small>
                </span>
                {d.converted ? (
                  <span className="vz-pill ok">
                    <Check size={12} strokeWidth={3} /> Ordered
                  </span>
                ) : d.cart?.items ? (
                  <span className="vz-pill warn">Not ordered</span>
                ) : (
                  <span className="vz-pill">Browsing</span>
                )}
              </header>

              <dl className="vz-facts">
                <div>
                  <dt>
                    <Phone size={12} /> Phone
                  </dt>
                  <dd>{d.phone || "—"}</dd>
                </div>
                <div>
                  <dt>
                    <MapPin size={12} /> Location
                  </dt>
                  <dd>
                    {d.pincode
                      ? `${d.pincode.city || "—"}${d.pincode.state ? `, ${d.pincode.state}` : ""} · ${d.pincode.pincode}`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt>
                    <ShoppingBag size={12} /> Cart
                  </dt>
                  <dd>{d.cart ? `${d.cart.items} item${d.cart.items === 1 ? "" : "s"} · ${inr(d.cart.value)}` : "—"}</dd>
                </div>
                <div>
                  <dt>
                    <ShoppingBag size={12} /> Bag adds
                  </dt>
                  <dd>
                    {d.adds && (d.adds.detail || d.adds.card)
                      ? `Book page ${d.adds.detail} · Cards ${d.adds.card}`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt>
                    <Clock size={12} /> Offer timer
                  </dt>
                  <dd>
                    {d.timer
                      ? d.timerRunning
                        ? leftTxt(d.timer.endsAt - Date.now())
                        : `${d.timer.status || "Ended"}${d.timer.extendRequested ? " · asked to extend" : ""}`
                      : "—"}
                  </dd>
                </div>
              </dl>

              {d.cart?.books && <p className="vz-books">{d.cart.books}</p>}

              <footer className="vz-foot">
                <span className="vz-src">{d.sources.join(" · ")}</span>
                {d.orders.length > 0 && <span className="vz-orders">{d.orders.join(", ")}</span>}
                {d.phone && !d.converted && d.cart?.items > 0 && (
                  <a
                    className="vz-wa"
                    href={`https://wa.me/91${String(d.phone).replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
                      `Hi ${d.name || ""}! Your TheBookX bag is waiting${d.cart.books ? `: ${d.cart.books.slice(0, 80)}` : ""}. Need help placing the order?`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </a>
                )}
              </footer>
            </article>
          );
        })}
      </div>
    </div>
  );
}
