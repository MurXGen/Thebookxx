// app/c-responses/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLock from "@/components/AdminLock";
import {
  Users,
  PhoneCall,
  UserX,
  MapPin,
  Smartphone,
  RefreshCw,
  Search,
  Hash,
  Instagram,
  Globe,
} from "lucide-react";

// Published "publish to web" CSV of first-visit capture data.
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRWmFx8QrlHdwPa4QQ_iPLiq-jq9WmEZtz8i9dJha2TvgNmWnoTqhoRdt257iBGlv9_deHpUzxB0dCb/pub?output=csv";

/* ---------- CSV parsing (handles quoted fields with commas) ---------- */
function parseCSV(text) {
  const rows = [];
  let field = "";
  let row = [];
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQ = false;
      } else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") field += c;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/* ---------- Derivation helpers ---------- */
function sourceFromReferrer(ref) {
  const r = (ref || "").toLowerCase();
  if (!r) return "Direct";
  if (r.includes("instagram")) return "Instagram";
  if (r.includes("facebook") || r.includes("fb.")) return "Facebook";
  if (r.includes("google")) return "Google";
  if (r.includes("t.co") || r.includes("twitter") || r.includes("x.com"))
    return "Twitter / X";
  if (r.includes("youtube")) return "YouTube";
  if (r.includes("whatsapp")) return "WhatsApp";
  if (r.includes("thebookx")) return "Direct (internal)";
  try {
    return new URL(ref).hostname.replace(/^www\./, "");
  } catch {
    return "Other";
  }
}

function osFromUA(ua) {
  const u = ua || "";
  if (/Android/i.test(u)) return "Android";
  if (/iPhone|iPad|iOS/i.test(u)) return "iOS";
  if (/Windows/i.test(u)) return "Windows";
  if (/Mac OS X|Macintosh/i.test(u)) return "macOS";
  if (/Linux/i.test(u)) return "Linux";
  return "Other";
}

function browserFromUA(ua) {
  const u = ua || "";
  if (/Instagram/i.test(u)) return "Instagram in-app";
  if (/FBAN|FBAV|FB_IAB/i.test(u)) return "Facebook in-app";
  if (/Edg/i.test(u)) return "Edge";
  if (/Chrome/i.test(u)) return "Chrome";
  if (/CriOS/i.test(u)) return "Chrome (iOS)";
  if (/Safari/i.test(u)) return "Safari";
  return "Other";
}

const BRANDS = [
  "samsung",
  "vivo",
  "oppo",
  "xiaomi",
  "redmi",
  "poco",
  "realme",
  "oneplus",
  "motorola",
  "iphone",
  "apple",
  "nothing",
  "infinix",
  "tecno",
  "lava",
  "google",
  "honor",
  "huawei",
  "iqoo",
];
function brandFromUA(ua) {
  const u = (ua || "").toLowerCase();
  if (/iphone|ipad/.test(u)) return "Apple";
  for (const b of BRANDS) {
    if (u.includes(`; ${b};`) || u.includes(`(${b};`) || u.includes(` ${b} `))
      return b.charAt(0).toUpperCase() + b.slice(1);
  }
  return "Other";
}

// "17/05/2026 16:01:07" -> { dayKey: "17/05", sortable Date }
function parseTs(ts) {
  const m = (ts || "").match(/(\d{2})\/(\d{2})\/(\d{4})[ T](\d{2}):(\d{2})/);
  if (!m) return null;
  const [, d, mo, y, h, mi] = m;
  return {
    dayKey: `${d}/${mo}`,
    date: new Date(+y, +mo - 1, +d, +h, +mi),
  };
}

const PALETTE = [
  "#fb8500",
  "#3b6fe0",
  "#0c9b46",
  "#d6427f",
  "#7c4dff",
  "#06b6d4",
  "#ef4444",
  "#eab308",
  "#14b8a6",
  "#f97316",
];

/* ---------- Small chart primitives ---------- */
function Donut({ data, size = 150 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let acc = 0;
  const stops = data
    .map((d, i) => {
      const start = (acc / total) * 100;
      acc += d.value;
      const end = (acc / total) * 100;
      return `${PALETTE[i % PALETTE.length]} ${start}% ${end}%`;
    })
    .join(", ");
  return (
    <div
      className="cr-donut"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${stops})`,
      }}
    >
      <div className="cr-donut-hole">
        <span className="cr-donut-total">{total}</span>
        <span className="cr-donut-label">total</span>
      </div>
    </div>
  );
}

function BarList({ data, max }) {
  const top = max || Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="cr-barlist">
      {data.map((d, i) => (
        <div key={d.label} className="cr-bar-row">
          <span className="cr-bar-label" title={d.label}>
            {d.label}
          </span>
          <div className="cr-bar-track">
            <div
              className="cr-bar-fill"
              style={{
                width: `${(d.value / top) * 100}%`,
                background: PALETTE[i % PALETTE.length],
              }}
            />
          </div>
          <span className="cr-bar-value">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

function tally(rows, fn, limit) {
  const map = new Map();
  rows.forEach((r) => {
    const k = fn(r);
    if (k === null || k === undefined || k === "") return;
    map.set(k, (map.get(k) || 0) + 1);
  });
  const arr = [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
  return limit ? arr.slice(0, limit) : arr;
}

/* ---------- Page ---------- */
function CResponsesInner() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
      const text = await res.text();
      const matrix = parseCSV(text);
      const header = matrix[0] || [];
      const idx = (name) =>
        header.findIndex((h) => h.trim().toLowerCase() === name.toLowerCase());
      const iPin = idx("Pincode");
      const iCity = idx("City");
      const iState = idx("State");
      const iPhone = idx("Phone Number");
      const iType = idx("Submission Type");
      const iUA = idx("userAgent");
      const iRef = idx("referrer");
      const iTs = 0; // Timestamp(Default)

      const parsed = matrix
        .slice(1)
        .filter((r) => r.length > 1)
        .map((r) => {
          const ua = r[iUA] || "";
          const phone = (r[iPhone] || "").trim();
          const ts = parseTs(r[iTs]);
          return {
            ts: r[iTs] || "",
            tsObj: ts?.date || null,
            dayKey: ts?.dayKey || "",
            pincode: (r[iPin] || "").trim(),
            city: (r[iCity] || "").trim(),
            state: (r[iState] || "").trim(),
            phone,
            type: (r[iType] || "").trim().toLowerCase(),
            ua,
            referrer: r[iRef] || "",
            source: sourceFromReferrer(r[iRef]),
            os: osFromUA(ua),
            browser: browserFromUA(ua),
            brand: brandFromUA(ua),
            hasPhone: /\d{6,}/.test(phone),
          };
        });
      setRows(parsed);
    } catch (e) {
      setError("Couldn't load the sheet. Check that it's still published.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const total = rows.length;
    const entered = rows.filter((r) => r.hasPhone).length;
    const skipped = total - entered;
    const uniquePhones = new Set(rows.filter((r) => r.hasPhone).map((r) => r.phone));
    const uniqueCities = new Set(
      rows.filter((r) => r.city).map((r) => r.city),
    );
    return {
      total,
      entered,
      skipped,
      enteredPct: total ? Math.round((entered / total) * 100) : 0,
      skippedPct: total ? Math.round((skipped / total) * 100) : 0,
      uniquePhones: uniquePhones.size,
      uniqueCities: uniqueCities.size,
    };
  }, [rows]);

  const sources = useMemo(() => tally(rows, (r) => r.source, 8), [rows]);
  const osData = useMemo(() => tally(rows, (r) => r.os, 6), [rows]);
  const browsers = useMemo(() => tally(rows, (r) => r.browser, 6), [rows]);
  const brands = useMemo(() => tally(rows, (r) => r.brand, 8), [rows]);
  const cities = useMemo(
    () => tally(rows.filter((r) => r.city), (r) => r.city, 8),
    [rows],
  );
  const states = useMemo(
    () => tally(rows.filter((r) => r.state), (r) => r.state, 8),
    [rows],
  );
  const byType = useMemo(
    () => tally(rows, (r) => r.type || "unknown"),
    [rows],
  );
  const enteredVsSkipped = useMemo(
    () => [
      { label: "Entered number", value: stats.entered },
      { label: "Skipped", value: stats.skipped },
    ],
    [stats],
  );
  const byDay = useMemo(() => {
    const t = tally(rows.filter((r) => r.dayKey), (r) => r.dayKey);
    // keep chronological order
    return t.sort((a, b) => {
      const [da, ma] = a.label.split("/").map(Number);
      const [db, mb] = b.label.split("/").map(Number);
      return ma - mb || da - db;
    });
  }, [rows]);

  // Unique phone numbers, latest record each
  const phoneList = useMemo(() => {
    const map = new Map();
    rows
      .filter((r) => r.hasPhone)
      .forEach((r) => {
        const prev = map.get(r.phone);
        if (!prev || (r.tsObj && prev.tsObj && r.tsObj > prev.tsObj))
          map.set(r.phone, r);
      });
    let list = [...map.values()].sort(
      (a, b) => (b.tsObj?.getTime() || 0) - (a.tsObj?.getTime() || 0),
    );
    const q = query.trim().toLowerCase();
    if (q)
      list = list.filter(
        (r) =>
          r.phone.includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.state.toLowerCase().includes(q) ||
          r.pincode.includes(q),
      );
    return list;
  }, [rows, query]);

  return (
    <div className="cr-page">
      <div className="cr-shell">
        <header className="cr-header">
          <div>
            <h1 className="cr-title">Customer Responses</h1>
            <p className="cr-subtitle">
              First-visit capture analytics — live from your tracking sheet
            </p>
          </div>
          <button className="cr-refresh" onClick={load} disabled={loading}>
            <RefreshCw size={15} className={loading ? "cr-spin" : ""} />
            {loading ? "Loading…" : "Refresh"}
          </button>
        </header>

        {error && <div className="cr-error">{error}</div>}

        {loading && rows.length === 0 ? (
          <div className="cr-loading">Loading responses…</div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="cr-kpis">
              <div className="cr-kpi" style={{ "--c": "#3b6fe0" }}>
                <Users size={18} />
                <span className="cr-kpi-value">{stats.total}</span>
                <span className="cr-kpi-label">Total visitors</span>
              </div>
              <div className="cr-kpi" style={{ "--c": "#0c9b46" }}>
                <PhoneCall size={18} />
                <span className="cr-kpi-value">
                  {stats.entered}
                  <small> · {stats.enteredPct}%</small>
                </span>
                <span className="cr-kpi-label">Entered number</span>
              </div>
              <div className="cr-kpi" style={{ "--c": "#ef4444" }}>
                <UserX size={18} />
                <span className="cr-kpi-value">
                  {stats.skipped}
                  <small> · {stats.skippedPct}%</small>
                </span>
                <span className="cr-kpi-label">Skipped</span>
              </div>
              <div className="cr-kpi" style={{ "--c": "#7c4dff" }}>
                <Hash size={18} />
                <span className="cr-kpi-value">{stats.uniquePhones}</span>
                <span className="cr-kpi-label">Unique numbers</span>
              </div>
              <div className="cr-kpi" style={{ "--c": "#fb8500" }}>
                <MapPin size={18} />
                <span className="cr-kpi-value">{stats.uniqueCities}</span>
                <span className="cr-kpi-label">Cities reached</span>
              </div>
            </div>

            {/* Conversion donut + submission breakdown */}
            <div className="cr-grid cr-grid-2">
              <section className="cr-card">
                <h2 className="cr-card-title">Entered vs Skipped</h2>
                <div className="cr-donut-wrap">
                  <Donut data={enteredVsSkipped} />
                  <div className="cr-legend">
                    {enteredVsSkipped.map((d, i) => (
                      <div key={d.label} className="cr-legend-row">
                        <span
                          className="cr-legend-dot"
                          style={{ background: PALETTE[i % PALETTE.length] }}
                        />
                        <span className="cr-legend-label">{d.label}</span>
                        <span className="cr-legend-value">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="cr-card">
                <h2 className="cr-card-title">Submission type</h2>
                <BarList data={byType} />
              </section>
            </div>

            {/* Source + device */}
            <div className="cr-grid cr-grid-2">
              <section className="cr-card">
                <h2 className="cr-card-title">
                  <Instagram size={15} /> Traffic source
                </h2>
                <BarList data={sources} />
              </section>
              <section className="cr-card">
                <h2 className="cr-card-title">
                  <Smartphone size={15} /> Operating system
                </h2>
                <BarList data={osData} />
              </section>
            </div>

            <div className="cr-grid cr-grid-2">
              <section className="cr-card">
                <h2 className="cr-card-title">
                  <Globe size={15} /> Browser / in-app
                </h2>
                <BarList data={browsers} />
              </section>
              <section className="cr-card">
                <h2 className="cr-card-title">
                  <Smartphone size={15} /> Device brand
                </h2>
                <BarList data={brands} />
              </section>
            </div>

            {/* Locations */}
            <div className="cr-grid cr-grid-2">
              <section className="cr-card">
                <h2 className="cr-card-title">
                  <MapPin size={15} /> Top cities
                </h2>
                {cities.length ? (
                  <BarList data={cities} />
                ) : (
                  <p className="cr-empty">No city data yet.</p>
                )}
              </section>
              <section className="cr-card">
                <h2 className="cr-card-title">
                  <MapPin size={15} /> Top states
                </h2>
                {states.length ? (
                  <BarList data={states} />
                ) : (
                  <p className="cr-empty">No state data yet.</p>
                )}
              </section>
            </div>

            {/* Visits over time */}
            {byDay.length > 1 && (
              <section className="cr-card">
                <h2 className="cr-card-title">Visits over time</h2>
                <div className="cr-timeseries">
                  {byDay.map((d) => {
                    const top = Math.max(...byDay.map((x) => x.value), 1);
                    return (
                      <div key={d.label} className="cr-ts-col">
                        <div
                          className="cr-ts-bar"
                          style={{ height: `${(d.value / top) * 100}%` }}
                          title={`${d.label}: ${d.value}`}
                        />
                        <span className="cr-ts-label">{d.label}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Phone numbers table */}
            <section className="cr-card">
              <div className="cr-table-head">
                <h2 className="cr-card-title">
                  <PhoneCall size={15} /> Captured numbers ({phoneList.length})
                </h2>
                <div className="cr-search">
                  <Search size={14} />
                  <input
                    placeholder="Search number, city, pincode…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="cr-table-wrap">
                <table className="cr-table">
                  <thead>
                    <tr>
                      <th>Phone</th>
                      <th>City</th>
                      <th>State</th>
                      <th>Pincode</th>
                      <th>Source</th>
                      <th>When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {phoneList.map((r, i) => (
                      <tr key={r.phone + i}>
                        <td className="cr-td-phone">
                          <a href={`tel:${r.phone}`}>{r.phone}</a>
                        </td>
                        <td>{r.city || "—"}</td>
                        <td>{r.state || "—"}</td>
                        <td>{r.pincode && /^\d/.test(r.pincode) ? r.pincode : "—"}</td>
                        <td>
                          <span className="cr-source-pill">{r.source}</span>
                        </td>
                        <td className="cr-td-when">{r.ts}</td>
                      </tr>
                    ))}
                    {phoneList.length === 0 && (
                      <tr>
                        <td colSpan={6} className="cr-empty">
                          No matching numbers.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default function CResponsesPage() {
  return (
    <AdminLock pageName="Customer Responses">
      <CResponsesInner />
    </AdminLock>
  );
}
