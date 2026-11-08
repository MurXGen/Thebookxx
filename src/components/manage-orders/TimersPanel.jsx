"use client";

// Manage-orders → Offer timers. Every device's 2-hour offer from the Timers
// tab: who's waiting for an extension, who's running, who converted at which
// price. Extend or end a device's offer in one tap; the shopper's site picks
// the new end time up on their next page load or when they come back to the tab.

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, Clock, Check, MessageCircle, X, Loader2 } from "lucide-react";
import { ADMIN_CODE_KEY } from "@/lib/adminCode";

const WA_NUMBER_TEXT = (shortId) =>
  `Hi! We've extended your TheBookX offer price. Open the site again to see it. (ID ${shortId})`;

function adminCode() {
  try {
    return sessionStorage.getItem(ADMIN_CODE_KEY) || localStorage.getItem(ADMIN_CODE_KEY) || "";
  } catch {
    return "";
  }
}

const shortOf = (id) => String(id || "").slice(-6);

function left(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d) return `${d}d ${h}h`;
  if (h) return `${h}h ${m}m`;
  return `${m}m ${s % 60}s`;
}

function ago(ms) {
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// datetime-local value (IST-agnostic: uses the admin's own clock, like the sheet)
function toLocalInput(ms) {
  const d = new Date(ms);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function stateOf(r, now) {
  const running = r.endsAt && r.endsAt > now;
  const waiting = !!r.extendRequested && !r.converted && !running;
  return { running, waiting };
}

const FILTERS = [
  ["waiting", "Waiting on you"],
  ["running", "Running"],
  ["expired", "Expired"],
  ["extended", "Extended"],
  ["converted", "Converted"],
  ["all", "All"],
];

export default function TimersPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("waiting");
  const [q, setQ] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(""); // deviceId being saved
  const [custom, setCustom] = useState({}); // deviceId → datetime-local value
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch("/api/admin/timers", {
        headers: { "x-admin-code": adminCode() },
        cache: "no-store",
      });
      const d = await r.json();
      if (!d.success) setErr(d.error || "Could not load timers");
      setRows(d.rows || []);
    } catch {
      setErr("Could not load timers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 0);
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(t);
      clearInterval(id);
    };
  }, [load]);

  const flash = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 2600);
  };

  const save = async (r, action, endsAt, label) => {
    const what =
      action === "end-now"
        ? `End the offer now for ${shortOf(r.deviceId)}? Their prices go up by ₹20.`
        : `Set the offer for ${shortOf(r.deviceId)} to end ${new Date(endsAt).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
          })}? (${label})`;
    if (!window.confirm(what)) return;
    setBusy(r.deviceId);
    try {
      const res = await fetch("/api/admin/timers", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-code": adminCode() },
        body: JSON.stringify({ action, deviceId: r.deviceId, endsAt }),
      });
      const d = await res.json();
      if (!d.success) {
        flash(d.error || "Couldn't save");
      } else {
        setRows((list) =>
          list.map((x) =>
            x.deviceId === r.deviceId
              ? { ...x, endsAt: d.endsAt, endsAtText: d.endsAtText, status: d.status || x.status }
              : x,
          ),
        );
        flash(action === "end-now" ? "Offer ended" : "Offer extended");
      }
    } catch {
      flash("Couldn't save");
    } finally {
      setBusy("");
    }
  };

  const counts = useMemo(() => {
    const c = { waiting: 0, running: 0, expired: 0, extended: 0, converted: 0, all: rows.length, offer: 0, raised: 0 };
    rows.forEach((r) => {
      const s = stateOf(r, now);
      if (s.waiting) c.waiting++;
      if (s.running) c.running++;
      else c.expired++;
      if (r.status === "Extended") c.extended++;
      if (r.converted) {
        c.converted++;
        if (/offer/i.test(r.pricePaid)) c.offer++;
        else c.raised++;
      }
    });
    return c;
  }, [rows, now]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      const s = stateOf(r, now);
      const ok =
        filter === "all" ||
        (filter === "waiting" && s.waiting) ||
        (filter === "running" && s.running) ||
        (filter === "expired" && !s.running) ||
        (filter === "extended" && r.status === "Extended") ||
        (filter === "converted" && r.converted);
      if (!ok) return false;
      if (!term) return true;
      return [r.deviceId, r.phone, r.book, r.orderId].some((v) => String(v).toLowerCase().includes(term));
    });
  }, [rows, filter, q, now]);

  const endOfDay = () => {
    const d = new Date();
    d.setHours(23, 59, 0, 0);
    return d.getTime() > Date.now() ? d.getTime() : d.getTime() + 864e5;
  };

  return (
    <div className="tmr">
      <div className="tmr-head">
        <div>
          <h2 className="tmr-title">Offer timers</h2>
          <p className="tmr-sub">2-hour offer per device · after it ends, books cost ₹20 more on that device</p>
        </div>
        <button type="button" className="tmr-refresh" onClick={load} disabled={loading} data-no-busy>
          {loading ? <Loader2 size={15} className="tmr-spin" /> : <RefreshCw size={15} />} Refresh
        </button>
      </div>

      <div className="tmr-stats">
        <div className={`tmr-stat${counts.waiting ? " hot" : ""}`}>
          <b>{counts.waiting}</b>
          <span>Waiting on you</span>
        </div>
        <div className="tmr-stat">
          <b>{counts.running}</b>
          <span>Running now</span>
        </div>
        <div className="tmr-stat">
          <b>{counts.expired}</b>
          <span>Expired</span>
        </div>
        <div className="tmr-stat">
          <b>{counts.converted}</b>
          <span>
            Ordered · {counts.offer} offer / {counts.raised} +₹20
          </span>
        </div>
      </div>

      <div className="tmr-tools">
        <div className="tmr-filters" role="tablist">
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
              {l}
              <em>{counts[k]}</em>
            </button>
          ))}
        </div>
        <label className="tmr-search">
          <Search size={15} aria-hidden="true" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ID (e.g. 5imw6t), phone, book, order"
            aria-label="Search timers"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </label>
      </div>

      {err && <p className="tmr-err">{err}. Check that the Timers tab exists with the header row.</p>}

      {!loading && !err && list.length === 0 && (
        <p className="tmr-empty">
          {filter === "waiting" ? "No one is waiting for an extension." : "Nothing here yet."}
        </p>
      )}

      <div className="tmr-list">
        {list.map((r) => {
          const s = stateOf(r, now);
          const sid = shortOf(r.deviceId);
          const isBusy = busy === r.deviceId;
          const base = Math.max(now, r.endsAt || 0);
          return (
            <div key={r.deviceId} className={`tmr-card${s.waiting ? " waiting" : ""}`}>
              <div className="tmr-card-top">
                <span className="tmr-id">
                  <b>{sid}</b>
                  <small>{r.deviceId}</small>
                </span>
                <span className={`tmr-chip ${s.running ? "run" : "end"}`}>
                  <Clock size={12} />
                  {s.running ? `${left(r.endsAt - now)} left` : r.endsAt ? `Ended ${ago(now - r.endsAt)}` : "No end time"}
                </span>
              </div>

              <div className="tmr-meta">
                <span>{r.book || "—"}</span>
                {r.status && <span className={`tmr-st st-${r.status.toLowerCase()}`}>{r.status}</span>}
                {r.converted && (
                  <span className="tmr-conv">
                    <Check size={12} strokeWidth={3} /> {r.orderId || "Ordered"} · {r.pricePaid || "—"}
                  </span>
                )}
                {r.phone && <span>{r.phone}</span>}
              </div>

              {r.extendRequested && (
                <p className="tmr-req">
                  <MessageCircle size={13} /> Asked to extend · {r.extendRequested}
                </p>
              )}

              <div className="tmr-actions">
                <button type="button" disabled={isBusy} onClick={() => save(r, "set-end", base + 2 * 3600e3, "+2 hours")} data-no-busy>
                  +2h
                </button>
                <button type="button" disabled={isBusy} onClick={() => save(r, "set-end", base + 864e5, "+1 day")} data-no-busy>
                  +1 day
                </button>
                <button type="button" disabled={isBusy} onClick={() => save(r, "set-end", endOfDay(), "till 11:59 PM")} data-no-busy>
                  Till 11:59 PM
                </button>
                <span className="tmr-custom">
                  <input
                    type="datetime-local"
                    value={custom[r.deviceId] ?? (r.endsAt ? toLocalInput(r.endsAt) : "")}
                    onChange={(e) => setCustom((c) => ({ ...c, [r.deviceId]: e.target.value }))}
                    aria-label={`Custom end time for ${sid}`}
                  />
                  <button
                    type="button"
                    disabled={isBusy || !custom[r.deviceId]}
                    onClick={() => save(r, "set-end", new Date(custom[r.deviceId]).getTime(), "custom time")}
                    data-no-busy
                  >
                    Set
                  </button>
                </span>
                {s.running && (
                  <button type="button" className="danger" disabled={isBusy} onClick={() => save(r, "end-now")} data-no-busy>
                    End now
                  </button>
                )}
                {r.phone && (
                  <a
                    className="tmr-wa"
                    href={`https://wa.me/91${String(r.phone).replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(WA_NUMBER_TEXT(sid))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Tell them
                  </a>
                )}
                {isBusy && <Loader2 size={15} className="tmr-spin" aria-label="Saving" />}
              </div>
            </div>
          );
        })}
      </div>

      {toast && <div className="tmr-toast">{toast}</div>}
    </div>
  );
}
