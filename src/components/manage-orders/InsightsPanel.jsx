"use client";

// Manage-orders → Visitors. Abandoned-cart analytics from the "Abandoned
// Cart" sheet tab only (via /api/abandoned-cart). Rows are merged to ONE cart
// per shopper — every session on the same device, and the same phone number
// across devices — before anything is counted. Shows conversion, timing (gap
// between new carts, time active in the bag), the latest abandoned cart, where
// bags leak, which books get attention, what to improve, and every cart in a
// compact table (loaded in pages as you scroll). Read-only.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, Loader2, AlertTriangle, Lightbulb, CheckCircle2, Search } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { parseCartBooks, cartWhatsApp } from "@/utils/cartRecovery";

const DAY = 864e5;
const RANGES = [
  ["7", "7 days", 7],
  ["30", "30 days", 30],
  ["90", "90 days", 90],
  ["all", "All time", null],
];
const BOOK_SORTS = [
  ["left", "Most abandoned"],
  ["carts", "Most carted"],
  ["conv", "Best converting"],
];
// A row needs this many carts before its rate is ranked or used in advice.
const MIN_N = 5;

const inr = (n) => `₹${Math.round(n || 0).toLocaleString("en-IN")}`;
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
// Sheet time "DD/MM/YYYY HH:mm:ss" (IST) → ms.
const toMs = (s) => {
  const m = String(s || "").match(/(\d{1,2})\/(\d{1,2})\/(\d{4})[ ,]+(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return 0;
  return new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5], +(m[6] || 0)).getTime();
};
// Books snapshot → titles (catalogue-aware, so titles with commas stay whole).
const titlesOf = (s) => parseCartBooks(s).map((b) => b.name);

// Duration → "2 min", "1 h 5 min", "3 d".
const dur = (ms) => {
  if (!(ms > 0)) return "—";
  const m = Math.round(ms / 60000);
  if (m < 1) return `${Math.max(1, Math.round(ms / 1000))} s`;
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h${m % 60 ? ` ${m % 60} min` : ""}`;
  const d = Math.floor(h / 24);
  return `${d} d${h % 24 ? ` ${h % 24} h` : ""}`;
};
const ago = (ms) => (ms ? `${dur(Date.now() - ms)} ago` : "—");
const fmtTime = (ms) =>
  ms
    ? new Date(ms).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
    : "—";
const dayLabel = (ms) => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const diff = Math.round((t - d) / DAY);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
};

// One cart per shopper: union rows that share a device id (several sessions /
// duplicate rows on one device) or a phone number (same person, two devices).
// The newest row is the live bag; first-added is the earliest; converted if
// any row converted; click counters take the highest.
function mergeCarts(rows) {
  const parent = new Map();
  const find = (k) => {
    while (parent.get(k) !== k) {
      parent.set(k, parent.get(parent.get(k)));
      k = parent.get(k);
    }
    return k;
  };
  const union = (a, b) => {
    if (!parent.has(a)) parent.set(a, a);
    if (!parent.has(b)) parent.set(b, b);
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };
  const keysOf = (r) => {
    const ks = [`d:${r.deviceId || r.cartKey}`];
    if (/^\d{10}$/.test(r.phone || "")) ks.push(`p:${r.phone}`);
    return ks;
  };
  rows.forEach((r) => {
    const ks = keysOf(r);
    ks.forEach((k) => union(ks[0], k));
  });
  const groups = new Map();
  rows.forEach((r) => {
    const g = find(keysOf(r)[0]);
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(r);
  });
  return [...groups.values()].map((list) => {
    const byNew = [...list].sort((a, b) => b.upd - a.upd);
    const live = byNew[0];
    const pick = (f) => byNew.map((r) => r[f]).find((v) => v) || "";
    const conv = byNew.find((r) => r.done);
    return {
      ...live,
      name: pick("name"),
      phone: pick("phone"),
      orderId: conv?.orderId || pick("orderId"),
      status: conv ? conv.status || "Converted" : live.status,
      done: !!conv,
      at: Math.min(...list.map((r) => r.at || Infinity).filter(Number.isFinite)) || live.at,
      upd: live.upd,
      suggestClicks: Math.max(...list.map((r) => r.suggestClicks || 0)),
      viewBillClicks: Math.max(...list.map((r) => r.viewBillClicks || 0)),
      handlingInfoClicks: Math.max(...list.map((r) => r.handlingInfoClicks || 0)),
      rowsMerged: list.length,
      devices: new Set(list.map((r) => r.deviceId || r.cartKey)).size,
    };
  });
}
const PAGE = 40;
const REC_FILTERS = [
  ["open", "Open"],
  ["all", "All"],
  ["done", "Ordered"],
  ["empty", "Emptied"],
];
const sourceOf = (src) => {
  const s = String(src || "").trim();
  if (!s || s === "/") return "Home page";
  if (s.startsWith("/bag")) return "Bag page";
  if (/^\/(books|author)\//.test(s)) return "Book page";
  if (s.startsWith("/profile")) return "Profile";
  if (/^\/(search|category|genre|collections?)/.test(s)) return "Browse & search";
  return "Other pages";
};

// Bucket helper: [{label, test}] → rows with carts / converted / value.
function bucket(carts, defs) {
  return defs.map(({ label, test }) => {
    const rows = carts.filter(test);
    const conv = rows.filter((c) => c.done).length;
    return {
      label,
      n: rows.length,
      conv,
      rate: pct(conv, rows.length),
      lost: rows.filter((c) => !c.done).reduce((s, c) => s + c.cartValue, 0),
    };
  });
}

export default function InsightsPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [range, setRange] = useState("30");
  const [bookSort, setBookSort] = useState("left");
  const [showAll, setShowAll] = useState(false);
  const [recFilter, setRecFilter] = useState("open");
  const [recQuery, setRecQuery] = useState("");
  const [recShown, setRecShown] = useState(PAGE);
  const sentinel = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch("/api/abandoned-cart", { cache: "no-store" });
      const d = await r.json();
      setRows(Array.isArray(d.carts) ? d.carts : []);
    } catch {
      setErr("Could not read the Abandoned Cart tab");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const a = useMemo(() => {
    const now = Date.now();
    const days = RANGES.find((r) => r[0] === range)?.[2];
    const since = days ? now - days * DAY : 0;
    const merged = mergeCarts(
      rows.map((c) => ({
        ...c,
        at: toMs(c.firstAdded) || toMs(c.lastUpdated),
        upd: toMs(c.lastUpdated) || toMs(c.firstAdded),
        done: /convert/i.test(c.status) || !!c.orderId,
      })),
    );
    const dupRows = rows.length - merged.length;
    const all = merged.filter((c) => !since || c.at >= since);
    const emptied = all.filter((c) => c.itemCount <= 0 && !c.done);
    // Everything below is about real bags (at least one book, or ordered).
    const carts = all.filter((c) => c.itemCount > 0 || c.done);
    const done = carts.filter((c) => c.done);
    const open = carts.filter((c) => !c.done);
    const withPhone = (c) => /^\d{10}$/.test(c.phone || "");

    const kpi = {
      carts: carts.length,
      conv: done.length,
      rate: pct(done.length, carts.length),
      lost: open.reduce((s, c) => s + c.cartValue, 0),
      won: done.reduce((s, c) => s + c.cartValue, 0),
      avgOpen: open.length ? open.reduce((s, c) => s + c.cartValue, 0) / open.length : 0,
      avgDone: done.length ? done.reduce((s, c) => s + c.cartValue, 0) / done.length : 0,
      phoneShare: pct(carts.filter(withPhone).length, carts.length),
      emptied: emptied.length,
    };

    // Recover now: open bags with a phone, by how long since last touch.
    const age = (c) => (now - c.upd) / DAY;
    const recover = [
      ["Today", (c) => age(c) < 1],
      ["1–3 days", (c) => age(c) >= 1 && age(c) < 3],
      ["3–7 days", (c) => age(c) >= 3 && age(c) < 7],
      ["Older", (c) => age(c) >= 7],
    ].map(([label, test]) => {
      const r = open.filter((c) => test(c));
      const reach = r.filter(withPhone);
      return { label, n: r.length, reach: reach.length, value: reach.reduce((s, c) => s + c.cartValue, 0) };
    });

    const bySize = bucket(carts, [
      { label: "1 book", test: (c) => c.itemCount <= 1 },
      { label: "2 books", test: (c) => c.itemCount === 2 },
      { label: "3 books", test: (c) => c.itemCount === 3 },
      { label: "4+ books", test: (c) => c.itemCount >= 4 },
    ]);
    const byValue = bucket(carts, [
      { label: "Under ₹300", test: (c) => c.cartValue < 300 },
      { label: "₹300–499", test: (c) => c.cartValue >= 300 && c.cartValue < 500 },
      { label: "₹500–799", test: (c) => c.cartValue >= 500 && c.cartValue < 800 },
      { label: "₹800+", test: (c) => c.cartValue >= 800 },
    ]);
    const srcLabels = [...new Set(carts.map((c) => sourceOf(c.source)))];
    const bySource = bucket(
      carts,
      srcLabels.map((l) => ({ label: l, test: (c) => sourceOf(c.source) === l })),
    ).sort((x, y) => y.n - x.n);
    const byAction = bucket(carts, [
      { label: "Opened the bill", test: (c) => c.viewBillClicks > 0 },
      { label: "Didn't open the bill", test: (c) => !c.viewBillClicks },
      { label: "Tapped “Suggest me”", test: (c) => c.suggestClicks > 0 },
      { label: "Left a phone number", test: withPhone },
      { label: "No phone number", test: (c) => !withPhone(c) },
    ]);

    // Per book across bags.
    const books = new Map();
    carts.forEach((c) =>
      new Set(titlesOf(c.books)).forEach((t) => {
        const k = t.toLowerCase();
        if (!books.has(k)) books.set(k, { name: t, carts: 0, conv: 0 });
        const b = books.get(k);
        b.carts += 1;
        if (c.done) b.conv += 1;
      }),
    );
    const bookList = [...books.values()].map((b) => ({ ...b, left: b.carts - b.conv, rate: pct(b.conv, b.carts) }));

    // Daily bags (last 30 days max) with converted share.
    const span = Math.min(days || 30, 30);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const startMs = start.getTime() - (span - 1) * DAY;
    const daily = Array.from({ length: span }, (_, i) => ({ t: startMs + i * DAY, n: 0, c: 0 }));
    carts.forEach((c) => {
      const i = Math.floor((c.at - startMs) / DAY);
      if (i >= 0 && i < span) {
        daily[i].n += 1;
        if (c.done) daily[i].c += 1;
      }
    });

    // Timing: gap between one shopper starting a cart and the next one.
    const arrivals = all.map((c) => c.at).filter(Boolean).sort((x, y) => x - y);
    const gaps = arrivals.slice(1).map((t, i) => t - arrivals[i]);
    const sortedGaps = [...gaps].sort((x, y) => x - y);
    let longest = { ms: 0, from: 0 };
    gaps.forEach((g, i) => {
      if (g > longest.ms) longest = { ms: g, from: arrivals[i] };
    });
    const hours = Array(24).fill(0);
    arrivals.forEach((t) => (hours[new Date(t).getHours()] += 1));
    const peak = hours.indexOf(Math.max(...hours));
    const active = open.map((c) => c.upd - c.at).filter((x) => x > 0).sort((x, y) => x - y);
    const timing = {
      avgGap: gaps.length ? gaps.reduce((s2, g) => s2 + g, 0) / gaps.length : 0,
      medGap: sortedGaps.length ? sortedGaps[Math.floor(sortedGaps.length / 2)] : 0,
      longest,
      peak: arrivals.length ? peak : null,
      // Median, so shoppers who return days later don't skew it.
      avgActive: active.length ? active[Math.floor(active.length / 2)] : 0,
      perDay: arrivals.length ? arrivals.length / Math.max(1, (now - (since || arrivals[0])) / DAY) : 0,
      sinceLast: arrivals.length ? now - arrivals[arrivals.length - 1] : 0,
    };
    const lastOpen = [...open].sort((x, y) => y.upd - x.upd)[0] || null;

    // ── What to improve — rules over the numbers above ─────────────────
    const tips = [];
    const add = (tone, title, body) => tips.push({ tone, title, body });
    const hot = recover[0].value + recover[1].value;
    const hotN = recover[0].reach + recover[1].reach;
    if (hotN > 0)
      add("act", `Recover ${inr(hot)} in the last 3 days`, `${hotN} open bag${hotN === 1 ? "" : "s"} from the last 3 days have a phone number. Send the WhatsApp nudge from the table below today — fresh bags convert best.`);
    if (kpi.carts >= MIN_N && kpi.phoneShare < 50)
      add("warn", `Only ${kpi.phoneShare}% of bags have a phone number`, `The rest can't be followed up. Ask for a WhatsApp number earlier — when a book is added or with the offer timer — not only at checkout.`);
    const billY = byAction[0], billN = byAction[1];
    if (billY.n >= MIN_N && billN.n >= MIN_N && billY.rate + 5 < billN.rate)
      add("warn", `Opening the bill lowers conversion (${billY.rate}% vs ${billN.rate}%)`, `Shoppers who see the bill drop off more — the delivery/COD charges may be a surprise. Show those charges on the book page and bag before the bill.`);
    else if (billY.n >= MIN_N && billN.n >= MIN_N && billY.rate > billN.rate + 5)
      add("good", `Shoppers who open the bill convert ${billY.rate}% vs ${billN.rate}%`, `The bill reassures people. Make "View bill" more prominent in the bag.`);
    const one = bySize[0];
    const multi = bySize.slice(1).reduce((s, b) => ({ n: s.n + b.n, conv: s.conv + b.conv }), { n: 0, conv: 0 });
    if (one.n >= MIN_N && multi.n >= MIN_N && pct(multi.conv, multi.n) > one.rate + 5)
      add("idea", `Bigger bags convert better (${pct(multi.conv, multi.n)}% vs ${one.rate}% for 1 book)`, `${pct(one.n, kpi.carts)}% of bags hold a single book. Nudge a second book — "add 1 more for free bookmarks / free delivery", bundles, or "Suggest me" in the bag.`);
    const big = byValue[3];
    if (big.n >= MIN_N && big.rate + 5 < kpi.rate)
      add("warn", `₹800+ bags convert only ${big.rate}% (${inr(big.lost)} left)`, `Big baskets hesitate. Offer the ₹99 advance / prepaid saving clearly, or a small discount above ₹800.`);
    const leak = bookList.filter((b) => b.carts >= MIN_N).sort((x, y) => x.rate - y.rate || y.left - x.left)[0];
    if (leak && leak.rate + 5 < kpi.rate)
      add(
        "idea",
        `"${leak.name}" is in ${leak.carts} bags but only ${leak.rate}% ordered`,
        /price\s*drop/i.test(leak.name)
          ? "It's already a price drop, so price isn't the blocker — check the cover, description, delivery time shown and that it's in stock."
          : "Check its price, cover and description, and that it's in stock — or try a price drop on it.",
      );
    if (kpi.emptied >= MIN_N)
      add("warn", `${kpi.emptied} bags were emptied`, `Shoppers added books and then removed everything. Look at delivery charges and dates shown in the bag — that's usually where they back out.`);
    const weakSrc = bySource.filter((s) => s.n >= MIN_N && s.label !== "Other pages").sort((x, y) => x.rate - y.rate)[0];
    if (weakSrc && weakSrc.rate + 5 < kpi.rate)
      add("idea", `Bags started on the ${weakSrc.label.toLowerCase()} convert ${weakSrc.rate}%`, `That's below your ${kpi.rate}% average — give that page a clearer "Checkout" path and the offer timer.`);
    if (!tips.length && kpi.carts)
      add("good", "No obvious leaks in this range", "Keep nudging fresh bags on WhatsApp and watch the books table for titles people leave behind.");

    return { kpi, recover, bySize, byValue, bySource, byAction, bookList, daily, tips, timing, lastOpen, all, dupRows, merged: merged.length };
  }, [rows, range]);

  // Every cart (merged) for the records table: filter + search, newest first.
  const records = useMemo(() => {
    const q = recQuery.trim().toLowerCase();
    const isEmpty = (c) => c.itemCount <= 0 && !c.done;
    return a.all
      .filter((c) =>
        recFilter === "open"
          ? !c.done && !isEmpty(c)
          : recFilter === "done"
            ? c.done
            : recFilter === "empty"
              ? isEmpty(c)
              : true,
      )
      .filter(
        (c) =>
          !q ||
          `${c.name} ${c.phone} ${c.books} ${c.orderId}`.toLowerCase().includes(q),
      )
      .sort((x, y) => y.upd - x.upd);
  }, [a.all, recFilter, recQuery]);

  useEffect(() => {
    const t = setTimeout(() => setRecShown(PAGE), 0);
    return () => clearTimeout(t);
  }, [recFilter, recQuery, range]);

  // Lazy-render the table: next page when the sentinel scrolls into view.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting))
          setRecShown((n) => (n < records.length ? n + PAGE : n));
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [records.length, recShown]);

  const books = useMemo(() => {
    const by = {
      left: (x, y) => y.left - x.left || y.carts - x.carts,
      carts: (x, y) => y.carts - x.carts,
      conv: (x, y) => (y.carts >= MIN_N) - (x.carts >= MIN_N) || y.rate - x.rate || y.carts - x.carts,
    }[bookSort];
    return [...a.bookList].sort(by);
  }, [a.bookList, bookSort]);
  const shown = showAll ? books : books.slice(0, 12);
  const maxCarts = Math.max(1, ...books.map((b) => b.carts));
  const maxDay = Math.max(1, ...a.daily.map((d) => d.n));
  const k = a.kpi;

  const Rates = ({ title, sub, list }) => {
    const max = Math.max(1, ...list.map((r) => r.n));
    return (
      <section className="vzi-card">
        <h3 className="vzi-h">{title}</h3>
        <p className="vzi-sub">{sub}</p>
        <div className="vzi-rates">
          {list.map((r) => (
            <div className="vzi-rate" key={r.label} title={`${r.n} bags · ${r.conv} ordered · ${inr(r.lost)} left`}>
              <span className="vzi-rate-l">{r.label}</span>
              <span className="vzi-bar">
                <i className="s0" style={{ width: `${(r.n / max) * 100}%` }}>
                  <i className="s3" style={{ width: `${r.rate}%` }} />
                </i>
              </span>
              <span className="vzi-rate-n">{r.n}</span>
              <span className={`vzi-rate-p${r.n < MIN_N ? " low" : r.rate >= k.rate + 5 ? " good" : r.rate + 5 < k.rate ? " bad" : ""}`}>
                {r.n ? `${r.rate}%` : "—"}
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="vz vzi">
      <div className="vz-tools">
        <div className="vz-filters" role="tablist" aria-label="Date range">
          {RANGES.map(([key, label]) => (
            <button key={key} type="button" className={range === key ? "on" : ""} onClick={() => setRange(key)}>
              {label}
            </button>
          ))}
        </div>
        <button type="button" className="vz-refresh" onClick={load} disabled={loading} data-no-busy>
          {loading ? <Loader2 size={15} className="vz-spin" /> : <RefreshCw size={15} />} Refresh
        </button>
      </div>
      {err && <p className="vz-note err">{err}</p>}

      <div className="vz-stats">
        <div className="vz-stat hot">
          <b>{k.rate}%</b>
          <span>Bags → orders ({k.conv} of {k.carts})</span>
        </div>
        <div className="vz-stat">
          <b>{inr(k.lost)}</b>
          <span>Left in open bags · avg {inr(k.avgOpen)}</span>
        </div>
        <div className="vz-stat">
          <b>{inr(k.won)}</b>
          <span>Ordered from bags · avg {inr(k.avgDone)}</span>
        </div>
        <div className="vz-stat">
          <b>{k.phoneShare}%</b>
          <span>Bags with a phone number</span>
        </div>
      </div>

      {a.dupRows > 0 && (
        <p className="vzi-dedupe">
          One cart per shopper: {a.dupRows} duplicate row{a.dupRows === 1 ? "" : "s"} (same device or same phone) merged — {a.merged} unique carts in the sheet.
        </p>
      )}

      <div className="vzi-grid">
        <section className="vzi-card">
          <h3 className="vzi-h">Timing</h3>
          <p className="vzi-sub">How often a new shopper starts a bag, and how long they stay</p>
          <div className="vzi-kv vzi-kv3">
            <div>
              <b>{dur(a.timing.avgGap)}</b>
              <span>Avg gap between new carts</span>
            </div>
            <div>
              <b>{dur(a.timing.medGap)}</b>
              <span>Typical gap (median)</span>
            </div>
            <div>
              <b>{dur(a.timing.sinceLast)}</b>
              <span>Since the last new cart</span>
            </div>
            <div>
              <b>{dur(a.timing.longest.ms)}</b>
              <span>Longest idle · from {fmtTime(a.timing.longest.from)}</span>
            </div>
            <div>
              <b>{dur(a.timing.avgActive)}</b>
              <span>Typical time in bag before leaving</span>
            </div>
            <div>
              <b>{a.timing.peak == null ? "—" : `${((a.timing.peak + 11) % 12) + 1} ${a.timing.peak < 12 ? "am" : "pm"}`}</b>
              <span>Busiest hour · {a.timing.perDay.toFixed(1)} carts/day</span>
            </div>
          </div>
        </section>

        <section className="vzi-card vzi-last">
          <h3 className="vzi-h">Last abandoned cart</h3>
          <p className="vzi-sub">The most recent open bag</p>
          {a.lastOpen ? (
            (() => {
              const c = a.lastOpen;
              const wa = cartWhatsApp(c);
              const bks = parseCartBooks(c.books);
              return (
                <div className="vzi-last-b">
                  <div className="vzi-last-top">
                    <div>
                      <b>{c.name || (c.phone ? `+91 ${c.phone}` : "Guest shopper")}</b>
                      <small>
                        {ago(c.upd)} · {inr(c.cartValue)} · {c.itemCount} book{c.itemCount === 1 ? "" : "s"}
                      </small>
                    </div>
                    {wa ? (
                      <a className="vzi-wa" href={wa.url} target="_blank" rel="noopener noreferrer">
                        <FaWhatsapp size={15} /> Nudge
                      </a>
                    ) : (
                      <span className="vzi-nowa">No phone</span>
                    )}
                  </div>
                  <ul className="vzi-last-books">
                    {bks.slice(0, 4).map((b) => (
                      <li key={b.name}>
                        {b.name}
                        {b.qty > 1 ? ` ×${b.qty}` : ""}
                      </li>
                    ))}
                    {bks.length > 4 && <li className="more">+{bks.length - 4} more</li>}
                  </ul>
                </div>
              );
            })()
          ) : (
            <p className="vz-empty">{loading ? "Loading…" : "No open bags in this range."}</p>
          )}
        </section>
      </div>

      {/* What to improve */}
      <section className="vzi-card vzi-tips">
        <h3 className="vzi-h">What to improve</h3>
        <p className="vzi-sub">Worked out from the bags in this range — biggest wins first</p>
        {a.tips.length === 0 ? (
          <p className="vz-empty">{loading ? "Reading the Abandoned Cart tab…" : "No bags in this range."}</p>
        ) : (
          <ol className="vzi-tip-list">
            {a.tips.map((t) => (
              <li key={t.title} className={`vzi-tip ${t.tone}`}>
                <span className="vzi-tip-ic">
                  {t.tone === "good" ? <CheckCircle2 size={16} /> : t.tone === "warn" ? <AlertTriangle size={16} /> : <Lightbulb size={16} />}
                </span>
                <span>
                  <b>{t.title}</b>
                  <small>{t.body}</small>
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="vzi-grid">
        <section className="vzi-card">
          <h3 className="vzi-h">Recover now</h3>
          <p className="vzi-sub">Open bags by last activity — reachable = has a phone number</p>
          <div className="vzi-kv">
            {a.recover.map((r) => (
              <div key={r.label}>
                <b>{inr(r.value)}</b>
                <span>
                  {r.label} · {r.reach} of {r.n} reachable
                </span>
              </div>
            ))}
          </div>
        </section>
        <Rates title="Where bags start" sub="Page the bag was started on · bags and % that ordered" list={a.bySource} />
      </div>

      <div className="vzi-grid">
        <Rates title="Bag size" sub="Books in the bag · bags and % that ordered" list={a.bySize} />
        <Rates title="Bag value" sub="Bag total · bags and % that ordered" list={a.byValue} />
      </div>

      <Rates title="What shoppers did" sub="Bill, Suggest me and phone number vs ordering" list={a.byAction} />

      <section className="vzi-card">
        <h3 className="vzi-h">New bags per day</h3>
        <p className="vzi-sub">Green part = bags that became an order</p>
        <div className="vzi-days">
          {a.daily.map((d) => {
            const date = new Date(d.t);
            return (
              <div
                className="vzi-day"
                key={d.t}
                title={`${date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}: ${d.n} bags · ${d.c} ordered`}
              >
                <span className="vzi-day-col" style={{ height: `${(d.n / maxDay) * 100}%` }}>
                  <i style={{ height: `${pct(d.c, d.n)}%` }} />
                </span>
                <span className="vzi-day-x">{date.getDate()}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="vzi-card">
        <div className="vzi-head-row">
          <div>
            <h3 className="vzi-h">Books in bags</h3>
            <p className="vzi-sub">How often each book is bagged, ordered and left behind. Rates rank books in {MIN_N}+ bags.</p>
          </div>
          <div className="vz-filters vzi-sort" role="tablist" aria-label="Sort books">
            {BOOK_SORTS.map(([key, label]) => (
              <button key={key} type="button" className={bookSort === key ? "on" : ""} onClick={() => setBookSort(key)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {books.length === 0 ? (
          <p className="vz-empty">{loading ? "Loading…" : "No books in bags in this range."}</p>
        ) : (
          <>
            <div className="vzi-tbl" role="table">
              <div className="vzi-tr vzi-th" role="row">
                <span>Book</span>
                <span>Bags → ordered</span>
                <span className="r">Conv.</span>
                <span className="r">Left</span>
              </div>
              {shown.map((b, i) => (
                <div className="vzi-tr" role="row" key={b.name}>
                  <span className="vzi-bk" title={b.name}>
                    <em>{i + 1}</em>
                    {b.name}
                  </span>
                  <span className="vzi-vis">
                    <span className="vzi-bar sm">
                      <i className="s0" style={{ width: `${(b.carts / maxCarts) * 100}%` }}>
                        <i className="s3" style={{ width: `${b.rate}%` }} />
                      </i>
                    </span>
                    <small>
                      {b.carts} → {b.conv}
                    </small>
                  </span>
                  <span className={`r vzi-conv${b.carts < MIN_N ? " low" : b.rate >= k.rate + 5 ? " good" : b.rate + 5 < k.rate ? " bad" : ""}`}>
                    {b.rate}%
                  </span>
                  <span className="r">{b.left}</span>
                </div>
              ))}
            </div>
            {books.length > 12 && (
              <button type="button" className="vzi-more" onClick={() => setShowAll((s) => !s)}>
                {showAll ? "Show top 12" : `Show all ${books.length} books`}
              </button>
            )}
          </>
        )}
      </section>

      <section className="vzi-card vzi-recs">
        <div className="vzi-head-row">
          <div>
            <h3 className="vzi-h">All carts</h3>
            <p className="vzi-sub">
              {records.length} cart{records.length === 1 ? "" : "s"} · one per shopper · newest activity first
            </p>
          </div>
          <div className="vzi-rec-tools">
            <label className="vzi-search">
              <Search size={14} />
              <input
                value={recQuery}
                onChange={(e) => setRecQuery(e.target.value)}
                placeholder="Name, phone, book…"
                aria-label="Search carts"
              />
            </label>
            <div className="vz-filters" role="tablist" aria-label="Filter carts">
              {REC_FILTERS.map(([key, label]) => (
                <button key={key} type="button" className={recFilter === key ? "on" : ""} onClick={() => setRecFilter(key)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {records.length === 0 ? (
          <p className="vz-empty">{loading ? "Loading…" : "No carts match."}</p>
        ) : (
          <div className="vzi-rec-list">
            {records.slice(0, recShown).map((c, i, arr) => {
              const day = dayLabel(c.upd);
              const newDay = i === 0 || dayLabel(arr[i - 1].upd) !== day;
              const wa = cartWhatsApp(c);
              const bks = parseCartBooks(c.books);
              const empty = c.itemCount <= 0 && !c.done;
              return (
                <div key={`${c.cartKey}-${c.at}`}>
                  {newDay && <div className="vzi-rec-sep">{day}</div>}
                  <div className="vzi-rec">
                    <div className="vzi-rec-who">
                      <b>{c.name || (c.phone ? `+91 ${c.phone}` : "Guest")}</b>
                      <small>
                        {c.name && c.phone ? `${c.phone} · ` : ""}
                        {new Date(c.upd).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                        {c.rowsMerged > 1 ? ` · ${c.rowsMerged} sessions` : ""}
                      </small>
                    </div>
                    <div className="vzi-rec-books" title={bks.map((b) => b.name).join(", ")}>
                      {bks.length ? (
                        <>
                          {bks[0].name}
                          {bks.length > 1 && <em> +{bks.length - 1}</em>}
                        </>
                      ) : (
                        <span className="muted">Bag emptied</span>
                      )}
                    </div>
                    <div className="vzi-rec-v">
                      <b>{c.cartValue ? inr(c.cartValue) : "—"}</b>
                      <small>
                        {c.itemCount} item{c.itemCount === 1 ? "" : "s"} · {sourceOf(c.source)}
                      </small>
                    </div>
                    <span className={`vzi-pill ${c.done ? "done" : empty ? "empty" : "open"}`}>
                      {c.done ? "Ordered" : empty ? "Emptied" : "Open"}
                    </span>
                    {wa ? (
                      <a className="vzi-wa sm" href={wa.url} target="_blank" rel="noopener noreferrer" title="WhatsApp this shopper" aria-label="WhatsApp this shopper">
                        <FaWhatsapp size={15} />
                      </a>
                    ) : (
                      <span className="vzi-wa sm off" title="No phone number" aria-hidden="true">
                        <FaWhatsapp size={15} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {recShown < records.length && (
              <div ref={sentinel} className="vzi-rec-more">
                <Loader2 size={14} className="vz-spin" /> Loading more…
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
