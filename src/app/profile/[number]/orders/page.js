"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, ChevronRight, MessageCircle, AlertCircle, Truck, CheckCircle2, XCircle, LayoutList } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import SupportSheet from "@/components/profile/SupportSheet";
import ReviewRewardCard from "@/components/ReviewRewardCard";
import PwaInstallPromo from "@/components/PwaInstallPromo";
import { showToast, updateToast, dismissToast } from "@/context/ToastContext";
import {
  getCachedOrders,
  setCachedOrders,
  canLoad,
  recordLoad,
} from "@/utils/profileRate";

const SUPPORT_WHATSAPP = "917710892108";

// Parse "Books List" cell → [{ name, qty, price, total }]
function parseBooks(str) {
  return String(str || "")
    .split("\n")
    .map((line) => {
      if (!line.trim()) return null;
      const full = line.match(
        /\d+\.\s([^|]+)\s*\|\s*Qty:\s*(\d+)\s*\|\s*₹(\d+)\s*each\s*\|\s*Total:\s*₹(\d+)/,
      );
      if (full) {
        return {
          name: full[1].trim(),
          qty: parseInt(full[2], 10),
          price: parseInt(full[3], 10),
          total: parseInt(full[4], 10),
        };
      }
      const name = (line.split("|")[0] || "").replace(/^\d+\.\s*/, "").trim();
      const qty = parseInt((line.match(/Qty:\s*(\d+)/i) || [])[1] || "1", 10);
      const total = parseInt(
        (line.match(/Total:\s*₹?\s*(\d+)/i) || [])[1] || "0",
        10,
      );
      return name ? { name, qty, price: 0, total } : null;
    })
    .filter(Boolean);
}

function parseSheetDate(v) {
  if (!v) return null;
  const s = String(v);
  const m = s.match(/Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?/);
  if (m) return new Date(+m[1], +m[2], +m[3], +(m[4] || 0), +(m[5] || 0), 0);
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ ,T]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (dmy)
    return new Date(+dmy[3], +dmy[2] - 1, +dmy[1], +(dmy[4] || 0), +(dmy[5] || 0), +(dmy[6] || 0));
  const d = new Date(s);
  return isNaN(d) ? null : d;
}

const STATUS_TONE = (st = "") => {
  const s = st.toLowerCase();
  if (/delivered|money received/.test(s)) return "ord-badge-green";
  if (/out for delivery/.test(s)) return "ord-badge-blue";
  if (/in\s*transit|shipped/.test(s)) return "ord-badge-purple";
  if (/cancel/.test(s)) return "ord-badge-red";
  return "ord-badge-amber";
};

// Which filter bucket an order falls in.
const bucketOf = (o) => {
  if (o._isUnconfirmed) return "unconfirmed";
  const s = String(o._status || "").toLowerCase();
  if (/cancel|refund|returned/.test(s)) return "cancelled";
  if (/delivered|money received/.test(s)) return "delivered";
  return "active";
};

const FILTERS = [
  { k: "active", label: "Active", Icon: Truck },
  { k: "delivered", label: "Delivered", Icon: CheckCircle2 },
  { k: "unconfirmed", label: "Unconfirmed", Icon: AlertCircle },
  { k: "cancelled", label: "Cancelled", Icon: XCircle },
  { k: "all", label: "All", Icon: LayoutList },
];

export default function OrdersListPage() {
  const params = useParams();
  const router = useRouter();
  const number = String(params?.number || "").replace(/\D/g, "").slice(-10);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSupport, setShowSupport] = useState(false);
  // Default: active orders only (not delivered / cancelled / unconfirmed).
  const [filter, setFilter] = useState("active");
  const [error, setError] = useState("");
  // Live countdown toast handle for the rate limiter.
  const cooldownRef = useRef(null);

  // Turn raw API rows into the display order list (pure, no network — also used
  // when reading from cache so the cached payload stays small/serialisable).
  const processRows = (all) =>
    (Array.isArray(all) ? all : [])
      .filter((o) => !/whatsapp/i.test(o["Payment Type"] || ""))
      .map((o) => {
        const rawStatus = String(o["Order Status"] || "");
        const isUnconfirmed =
          /unconfirmed|pending/i.test(rawStatus) ||
          /\(unconfirmed\)/i.test(o["Customer Name"] || "");
        const trackDetail = String(o["Tracking detail"] || "")
          .split("||")[0]
          .trim();
        return {
          ...o,
          _books: parseBooks(o["Books List"]),
          _date: parseSheetDate(
            o["Timestamp (D)"] || o["Timestamp"] || o["Timestamp(D)"],
          ),
          _status:
            trackDetail ||
            (isUnconfirmed ? "Unconfirmed" : rawStatus || "Processing"),
          _isUnconfirmed: isUnconfirmed && !trackDetail,
        };
      })
      .filter(
        (o) => o._books.length > 0 || parseFloat(o["Total Amount"] || 0) > 0,
      )
      .sort((a, b) => (b._date || 0) - (a._date || 0));

  // Show (and live-update) a single countdown toast while rate-limited.
  const startCooldownToast = (waitSec) => {
    if (cooldownRef.current) return; // one countdown at a time
    let left = Math.max(1, waitSec);
    const msg = (s) =>
      `Too many requests — please wait ${s}s. Fresh data loads in ${s}s.`;
    const id = showToast(msg(left), "warning", { duration: 0 });
    cooldownRef.current = { id, timer: null };
    const tick = () => {
      left -= 1;
      if (left <= 0) {
        dismissToast(id);
        cooldownRef.current = null;
        return;
      }
      updateToast(id, { message: msg(left) });
      cooldownRef.current.timer = setTimeout(tick, 1000);
    };
    cooldownRef.current.timer = setTimeout(tick, 1000);
  };

  useEffect(() => {
    if (number.length !== 10) {
      setError("Invalid phone number.");
      setLoading(false);
      return;
    }
    // Only let a visitor view the number they actually signed in with. Viewing
    // an arbitrary number's orders via the URL is blocked → back to login.
    let savedPhone = "";
    try {
      savedPhone = String(localStorage.getItem("track_orders_phone") || "")
        .replace(/\D/g, "")
        .slice(-10);
    } catch (_) {}
    if (savedPhone !== number) {
      router.replace("/profile");
      return;
    }

    // 1) Fresh cache → render instantly, skip the network entirely.
    const cached = getCachedOrders(number);
    if (cached && cached.fresh) {
      setOrders(processRows(cached.rows));
      setLoading(false);
      return;
    }

    // 2) Rate-limited → fall back to any stale cache + show the countdown.
    const gate = canLoad(number);
    if (!gate.allowed) {
      if (cached) setOrders(processRows(cached.rows));
      setLoading(false);
      startCooldownToast(gate.waitSec);
      return;
    }

    // 3) Allowed → do the live load (and record it against the limit).
    recordLoad(number);
    (async () => {
      try {
        const res = await fetch(`/api/orders?phone=${number}`);
        const json = await res.json();
        const all = Array.isArray(json.orders) ? json.orders : [];
        setCachedOrders(number, all);
        setOrders(processRows(all));
      } catch (e) {
        // On failure, show stale cache if we have it.
        const fallback = getCachedOrders(number);
        if (fallback) setOrders(processRows(fallback.rows));
        else setError("Couldn't load your orders. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [number]);

  // Clear the countdown timer on unmount.
  useEffect(() => {
    return () => {
      if (cooldownRef.current?.timer) clearTimeout(cooldownRef.current.timer);
    };
  }, []);

  const contactSupport = () => {
    const msg = `Hi TheBookX, I need help with my orders (${number}).`;
    window.open(
      `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  // Counts per filter, then the visible list (newest first, already sorted).
  const counts = orders.reduce(
    (m, o) => {
      m[bucketOf(o)] += 1;
      m.all += 1;
      return m;
    },
    { active: 0, delivered: 0, unconfirmed: 0, cancelled: 0, all: 0 },
  );
  const visible = filter === "all" ? orders : orders.filter((o) => bucketOf(o) === filter);

  // Month sections ("November 2026"), recent → past.
  const groups = [];
  const byKey = {};
  visible.forEach((o) => {
    const key = o._date
      ? o._date.toLocaleDateString("en-IN", { month: "long", year: "numeric" })
      : "Earlier";
    if (!byKey[key]) {
      byKey[key] = { label: key, items: [] };
      groups.push(byKey[key]);
    }
    byKey[key].items.push(o);
  });
  const fmtDay = (d) =>
    d
      ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
        " · " +
        d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
      : "";

  return (
    <main className="ord-page">
      <header className="ord-head">
        <button
          type="button"
          className="ord-back"
          onClick={() => router.push("/profile")}
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="ord-head-titles">
          <h1>My orders</h1>
          <span className="ord-sub">+91 {number}</span>
        </div>
        <button
          type="button"
          className="ord-support-btn"
          onClick={() => setShowSupport(true)}
        >
          <MessageCircle size={16} />
          Support
        </button>
      </header>

      {loading ? (
        <div className="ord-groups" aria-busy="true" aria-label="Loading your orders">
          <section className="ord-group">
            <div className="ord-group-date ord-sk-line" style={{ width: 120 }} />
            {[0, 1, 2].map((i) => (
              <div className="ord-card ord-card-skeleton" key={i}>
                <div className="ord-card-row">
                  <div className="ord-card-covers">
                    <span className="ord-sk-cover" />
                    <span className="ord-sk-cover" />
                    <span className="ord-sk-cover" />
                  </div>
                  <div className="ord-card-main">
                    <span className="ord-sk-line" style={{ width: "45%" }} />
                    <span className="ord-sk-line" style={{ width: "80%" }} />
                    <span className="ord-sk-line" style={{ width: "30%" }} />
                  </div>
                  <span className="ord-sk-badge" />
                </div>
                <div className="ord-card-foot">
                  <span className="ord-sk-line" style={{ width: 90 }} />
                  <span className="ord-sk-line" style={{ width: 70 }} />
                </div>
              </div>
            ))}
          </section>
        </div>
      ) : error ? (
        <div className="ord-empty">{error}</div>
      ) : orders.length === 0 ? (
        <div className="ord-empty">
          <Package size={26} />
          <strong>No orders yet</strong>
          <span>When you place an order it will show up here.</span>
        </div>
      ) : (
        <>
          {/* Status filter — Active by default; All shows every order. */}
          <div className="ord-filters" role="tablist" aria-label="Filter orders by status">
            {FILTERS.filter((f) => f.k === "active" || f.k === "all" || counts[f.k] > 0).map(({ k, label, Icon }) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={filter === k}
                className={`ord-filter${filter === k ? " on" : ""}`}
                onClick={() => setFilter(k)}
              >
                <Icon size={14} />
                {label}
                <span className="ord-filter-n">{counts[k]}</span>
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <div className="ord-empty ord-empty-filter">
              <Package size={24} />
              <strong>
                {filter === "active" ? "No active orders right now" : `No ${filter} orders`}
              </strong>
              <span>Your other orders are under All.</span>
              <button type="button" className="ord-empty-btn" onClick={() => setFilter("all")}>
                Show all {counts.all} orders
              </button>
            </div>
          ) : (
            <div className="ord-secs">
              {groups.map((g) => (
                <section className="ord-sec" key={g.label}>
                  <header className="ord-sec-head">
                    <span>{g.label}</span>
                    <span className="ord-sec-n">
                      {g.items.length} order{g.items.length === 1 ? "" : "s"}
                    </span>
                  </header>
                  {g.items.map((o, i) => {
                    const oid = String(o["Order ID"] || "");
                    const total = o["Total Amount"] || o.revenue || "";
                    const count = o._books.reduce((n, b) => n + (b.qty || 1), 0);
                    const names = o._books.map((b) => b.name).join(", ");
                    const pay = String(o["Payment Type"] || "").replace("Payment", "").trim();
                    return (
                      <Link
                        key={oid || i}
                        href={`/profile/${number}/orders/${encodeURIComponent(oid)}`}
                        className={`ord-row${o._isUnconfirmed ? " ord-row-unconf" : ""}`}
                      >
                        <span className={`ord-row-ic ${bucketOf(o)}`} aria-hidden="true">
                          <Package size={18} />
                          {o._books.length > 1 && <i>{o._books.length}</i>}
                        </span>
                        <span className="ord-row-main">
                          <span className="ord-row-top">
                            <b>{fmtDay(o._date) || oid}</b>
                            <span className={`ord-badge ${STATUS_TONE(o._status)}`}>{o._status}</span>
                          </span>
                          <span className="ord-row-names">{names || "—"}</span>
                          <span className="ord-row-meta">
                            {total ? <b>₹{total}</b> : null}
                            <span>
                              {count} item{count === 1 ? "" : "s"}
                              {pay ? ` · ${pay}` : ""}
                            </span>
                          </span>
                          {o._isUnconfirmed && (
                            <span className="ord-row-note">
                              <AlertCircle size={12} /> Not confirmed yet. Tap to view and contact support.
                            </span>
                          )}
                        </span>
                        <ChevronRight size={18} className="ord-row-go" />
                      </Link>
                    );
                  })}
                </section>
              ))}
            </div>
          )}
        </>
      )}

      {/* Share & earn — below the orders (not at the top). */}
      {!loading && <ReviewRewardCard phone={number} />}

      <AnimatePresence>
        {showSupport && (
          <SupportSheet phone={number} onClose={() => setShowSupport(false)} />
        )}
      </AnimatePresence>

      <PwaInstallPromo variant="bar" />
    </main>
  );
}
