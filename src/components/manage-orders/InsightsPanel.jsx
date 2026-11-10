"use client";

// Manage-orders → Visitors → Insights. Conversion analytics across every
// device (Timers + Pincodes + Abandoned Cart tabs, via /api/admin/devices)
// joined with real sales from the orders sheet: the visit → bag → order
// funnel, which books bring visitors in, which of them convert, and which
// sell the most. Read-only.

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Loader2, Trophy, Target, Eye, TrendingDown } from "lucide-react";
import { ADMIN_CODE_KEY } from "@/lib/adminCode";

function adminCode() {
  try {
    return sessionStorage.getItem(ADMIN_CODE_KEY) || localStorage.getItem(ADMIN_CODE_KEY) || "";
  } catch {
    return "";
  }
}

const DAY = 864e5;
const RANGES = [
  ["7", "7 days", 7],
  ["30", "30 days", 30],
  ["90", "90 days", 90],
  ["all", "All time", null],
];
const SORTS = [
  ["sold", "Best selling"],
  ["conv", "Best converting"],
  ["visits", "Most visited"],
];
// Conversion is only ranked once a book has this many visitors.
const MIN_VISITS = 3;

const keyOf = (s) => String(s || "").trim().toLowerCase();
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
// Cart "Books" cell: "Title A, Title B x2" → titles.
const cartTitles = (s) =>
  String(s || "")
    .split(",")
    .map((t) => t.replace(/\s+x\d+\s*$/i, "").trim())
    .filter(Boolean);

export default function InsightsPanel({ orders = [] }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [needCode, setNeedCode] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [range, setRange] = useState("30");
  const [sort, setSort] = useState("sold");
  const [showAll, setShowAll] = useState(false);

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
      if (!d.success) setErr(d.error || "Could not load visitors");
      setDevices(d.devices || []);
    } catch {
      setErr("Could not load visitors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const data = useMemo(() => {
    const days = RANGES.find((r) => r[0] === range)?.[2];
    const since = days ? Date.now() - days * DAY : 0;
    const devs = devices.filter((d) => !since || (d.firstSeen || d.lastSeen) >= since);
    const ords = orders.filter((o) => !since || (o.at && o.at >= since));

    // Funnel — every device in range.
    const carted = (d) => (d.cart?.items || 0) > 0 || (d.adds?.detail || 0) + (d.adds?.card || 0) > 0;
    const funnel = {
      visitors: devs.length,
      pincode: devs.filter((d) => d.pincode).length,
      bag: devs.filter(carted).length,
      ordered: devs.filter((d) => d.converted).length,
    };
    const timers = devs.filter((d) => d.timer);
    const offer = {
      started: timers.length,
      atOffer: timers.filter((d) => d.timer.converted && /offer/i.test(d.timer.pricePaid)).length,
      raised: timers.filter((d) => d.timer.converted && d.timer.pricePaid && !/offer/i.test(d.timer.pricePaid)).length,
      asked: timers.filter((d) => d.timer.extendRequested).length,
    };
    const adds = devs.reduce(
      (a, d) => ({ detail: a.detail + (d.adds?.detail || 0), card: a.card + (d.adds?.card || 0) }),
      { detail: 0, card: 0 },
    );
    const bagValue = devs
      .filter((d) => d.cart?.items && !d.converted)
      .reduce((s, d) => s + (d.cart.value || 0), 0);

    // Per book — visitors who landed on it (offer timer's first book), how
    // many of those ordered, how many devices have it in the bag, and real
    // units sold from the orders sheet.
    const books = new Map();
    const get = (name) => {
      const k = keyOf(name);
      if (!books.has(k)) books.set(k, { name: String(name).trim(), visits: 0, converted: 0, inBag: 0, sold: 0, revenue: 0, orders: 0 });
      return books.get(k);
    };
    devs.forEach((d) => {
      if (d.timer?.book) {
        const b = get(d.timer.book);
        b.visits += 1;
        if (d.converted) b.converted += 1;
      }
      new Set(cartTitles(d.cart?.books).map(keyOf)).forEach((k) => {
        const t = cartTitles(d.cart?.books).find((x) => keyOf(x) === k);
        get(t).inBag += 1;
      });
    });
    ords.forEach((o) =>
      (o.books || []).forEach((bk) => {
        if (!bk?.name) return;
        const b = get(bk.name);
        b.sold += Number(bk.quantity) || 1;
        b.revenue += Number(bk.total) || 0;
        b.orders += 1;
      }),
    );
    const list = [...books.values()].map((b) => ({ ...b, conv: pct(b.converted, b.visits) }));

    const bestSeller = [...list].sort((a, b) => b.sold - a.sold || b.revenue - a.revenue)[0];
    const bestConv = [...list]
      .filter((b) => b.visits >= MIN_VISITS)
      .sort((a, b) => b.conv - a.conv || b.visits - a.visits)[0];
    const mostVisited = [...list].sort((a, b) => b.visits - a.visits)[0];
    const leak = [...list]
      .filter((b) => b.visits >= MIN_VISITS && b.converted === 0)
      .sort((a, b) => b.visits - a.visits)[0];

    // Daily visitors vs orders for the trend strip (last 30 days max).
    const span = Math.min(days || 30, 30);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const startMs = start.getTime() - (span - 1) * DAY;
    const daily = Array.from({ length: span }, (_, i) => ({ t: startMs + i * DAY, v: 0, o: 0 }));
    devs.forEach((d) => {
      const i = Math.floor(((d.firstSeen || d.lastSeen) - startMs) / DAY);
      if (i >= 0 && i < span) {
        daily[i].v += 1;
        if (d.converted) daily[i].o += 1;
      }
    });

    return { funnel, offer, adds, bagValue, list, bestSeller, bestConv, mostVisited, leak, daily, units: ords.reduce((s, o) => s + (o.books || []).reduce((t, b) => t + (Number(b.quantity) || 1), 0), 0) };
  }, [devices, orders, range]);

  const rows = useMemo(() => {
    const l = data.list.filter((b) => b.visits || b.sold || b.inBag);
    const by = {
      sold: (a, b) => b.sold - a.sold || b.revenue - a.revenue || b.visits - a.visits,
      conv: (a, b) =>
        (b.visits >= MIN_VISITS) - (a.visits >= MIN_VISITS) || b.conv - a.conv || b.visits - a.visits,
      visits: (a, b) => b.visits - a.visits || b.converted - a.converted,
    }[sort];
    return l.sort(by);
  }, [data.list, sort]);
  const shown = showAll ? rows : rows.slice(0, 12);
  const maxVisits = Math.max(1, ...rows.map((b) => b.visits));
  const maxSold = Math.max(1, ...rows.map((b) => b.sold));

  const f = data.funnel;
  const steps = [
    ["Visitors", f.visitors, "devices that opened the site"],
    ["Checked pincode", f.pincode, "checked delivery to their area"],
    ["Added to bag", f.bag, "put at least one book in the bag"],
    ["Ordered", f.ordered, "placed an order"],
  ];
  const maxDay = Math.max(1, ...data.daily.map((d) => d.v));

  const Hi = ({ icon: Icon, tone, label, book, line }) => (
    <div className={`vzi-hi ${tone}`}>
      <span className="vzi-hi-ic">
        <Icon size={15} />
      </span>
      <span className="vzi-hi-l">{label}</span>
      <b className="vzi-hi-b" title={book?.name}>{book ? book.name : "—"}</b>
      <span className="vzi-hi-x">{book ? line(book) : "Not enough data yet"}</span>
    </div>
  );

  return (
    <div className="vz vzi">
      <div className="vz-tools">
        <div className="vz-filters" role="tablist" aria-label="Date range">
          {RANGES.map(([k, label]) => (
            <button key={k} type="button" className={range === k ? "on" : ""} onClick={() => setRange(k)}>
              {label}
            </button>
          ))}
        </div>
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
          <span>Enter your admin code once to see visitor conversion on this device. Sales below already use your orders.</span>
          <input type="password" value={codeInput} onChange={(e) => setCodeInput(e.target.value)} placeholder="Admin code" aria-label="Admin code" />
          <button type="submit" data-no-busy>
            Unlock
          </button>
        </form>
      )}
      {err && <p className="vz-note err">{err}</p>}

      {/* Headline numbers */}
      <div className="vz-stats">
        <div className="vz-stat hot">
          <b>{pct(f.ordered, f.visitors)}%</b>
          <span>Visitor → order conversion</span>
        </div>
        <div className="vz-stat">
          <b>{pct(f.ordered, f.bag)}%</b>
          <span>Bag → order ({f.bag} with a bag)</span>
        </div>
        <div className="vz-stat">
          <b>{data.units.toLocaleString("en-IN")}</b>
          <span>Books sold in range</span>
        </div>
        <div className="vz-stat">
          <b>₹{Math.round(data.bagValue).toLocaleString("en-IN")}</b>
          <span>Sitting in unordered bags</span>
        </div>
      </div>

      {/* Highlights */}
      <div className="vzi-his">
        <Hi icon={Trophy} tone="gold" label="Best seller" book={data.bestSeller?.sold ? data.bestSeller : null}
          line={(b) => `${b.sold} sold · ₹${Math.round(b.revenue).toLocaleString("en-IN")}`} />
        <Hi icon={Target} tone="green" label="Most convertible" book={data.bestConv}
          line={(b) => `${b.conv}% of ${b.visits} visitors ordered`} />
        <Hi icon={Eye} tone="blue" label="Pulls the most visitors" book={data.mostVisited?.visits ? data.mostVisited : null}
          line={(b) => `${b.visits} landed · ${b.conv}% ordered`} />
        <Hi icon={TrendingDown} tone="red" label="Visited, never ordered" book={data.leak}
          line={(b) => `${b.visits} visitors · 0 orders · ${b.inBag} in bags`} />
      </div>

      <div className="vzi-grid">
        {/* Funnel */}
        <section className="vzi-card">
          <h3 className="vzi-h">Conversion funnel</h3>
          <p className="vzi-sub">Every device in range — where shoppers drop off</p>
          <div className="vzi-funnel">
            {steps.map(([label, n, hint], i) => {
              const prev = i ? steps[i - 1][1] : n;
              return (
                <div className="vzi-fn" key={label} title={hint}>
                  <div className="vzi-fn-top">
                    <span className="vzi-fn-l">{label}</span>
                    <span className="vzi-fn-n">
                      {n.toLocaleString("en-IN")}
                      <em>{pct(n, f.visitors)}%</em>
                    </span>
                  </div>
                  <span className="vzi-bar">
                    <i style={{ width: `${pct(n, f.visitors)}%` }} className={`s${i}`} />
                  </span>
                  {i > 0 && prev > 0 && (
                    <span className="vzi-fn-drop">
                      {pct(n, prev)}% of previous step · {Math.max(0, prev - n)} dropped
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Offer timer + where adds happen */}
        <section className="vzi-card">
          <h3 className="vzi-h">Offer timer & bag adds</h3>
          <p className="vzi-sub">Does the 2-hour offer close the sale?</p>
          <div className="vzi-kv">
            <div><b>{data.offer.started}</b><span>Timers started</span></div>
            <div><b>{data.offer.atOffer}</b><span>Ordered at offer price</span></div>
            <div><b>{data.offer.raised}</b><span>Ordered after it ended</span></div>
            <div><b>{data.offer.asked}</b><span>Asked for an extension</span></div>
          </div>
          {(() => {
            const tot = data.adds.detail + data.adds.card;
            return (
              <div className="vzi-split">
                <div className="vzi-split-top">
                  <span>Where books get added</span>
                  <span>{tot.toLocaleString("en-IN")} adds</span>
                </div>
                <span className="vzi-split-bar">
                  <i className="c1" style={{ width: `${pct(data.adds.detail, tot)}%` }} />
                  <i className="c2" style={{ width: `${pct(data.adds.card, tot)}%` }} />
                </span>
                <div className="vzi-split-leg">
                  <span><i className="c1" />Book page {data.adds.detail} ({pct(data.adds.detail, tot)}%)</span>
                  <span><i className="c2" />Book cards {data.adds.card} ({pct(data.adds.card, tot)}%)</span>
                </div>
              </div>
            );
          })()}
        </section>
      </div>

      {/* Daily trend */}
      <section className="vzi-card">
        <h3 className="vzi-h">New visitors per day</h3>
        <p className="vzi-sub">Darker part = visitors who went on to order</p>
        <div className="vzi-days">
          {data.daily.map((d) => {
            const date = new Date(d.t);
            return (
              <div
                className="vzi-day"
                key={d.t}
                title={`${date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}: ${d.v} visitors · ${d.o} ordered`}
              >
                <span className="vzi-day-col" style={{ height: `${(d.v / maxDay) * 100}%` }}>
                  <i style={{ height: `${pct(d.o, d.v)}%` }} />
                </span>
                <span className="vzi-day-x">{date.getDate()}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Per-book table */}
      <section className="vzi-card">
        <div className="vzi-head-row">
          <div>
            <h3 className="vzi-h">Books — visits, conversion & sales</h3>
            <p className="vzi-sub">
              Visitors = devices whose first book was this one. Conversion ranks books with {MIN_VISITS}+ visitors.
            </p>
          </div>
          <div className="vz-filters vzi-sort" role="tablist" aria-label="Sort books">
            {SORTS.map(([k, label]) => (
              <button key={k} type="button" className={sort === k ? "on" : ""} onClick={() => setSort(k)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {rows.length === 0 ? (
          <p className="vz-empty">{loading ? "Loading…" : "No book activity in this range."}</p>
        ) : (
          <>
            <div className="vzi-tbl" role="table">
              <div className="vzi-tr vzi-th" role="row">
                <span>Book</span>
                <span>Visitors → ordered</span>
                <span className="r">Conv.</span>
                <span className="r">In bags</span>
                <span>Sold</span>
              </div>
              {shown.map((b, i) => (
                <div className="vzi-tr" role="row" key={b.name}>
                  <span className="vzi-bk" title={b.name}>
                    <em>{i + 1}</em>
                    {b.name}
                  </span>
                  <span className="vzi-vis">
                    <span className="vzi-bar sm">
                      <i className="s0" style={{ width: `${(b.visits / maxVisits) * 100}%` }}>
                        <i className="s3" style={{ width: `${pct(b.converted, b.visits)}%` }} />
                      </i>
                    </span>
                    <small>
                      {b.visits} → {b.converted}
                    </small>
                  </span>
                  <span className={`r vzi-conv${b.visits < MIN_VISITS ? " low" : b.conv >= 20 ? " good" : b.conv === 0 ? " bad" : ""}`}>
                    {b.visits ? `${b.conv}%` : "—"}
                  </span>
                  <span className="r">{b.inBag || "—"}</span>
                  <span className="vzi-sold">
                    <span className="vzi-bar sm">
                      <i className="gold" style={{ width: `${(b.sold / maxSold) * 100}%` }} />
                    </span>
                    <small>{b.sold || "—"}</small>
                  </span>
                </div>
              ))}
            </div>
            {rows.length > 12 && (
              <button type="button" className="vzi-more" onClick={() => setShowAll((s) => !s)}>
                {showAll ? "Show top 12" : `Show all ${rows.length} books`}
              </button>
            )}
          </>
        )}
      </section>
    </div>
  );
}
