// app/manage-orders/page.js
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Download,
  Plus,
  Edit,
  X,
  ChevronRight,
  RefreshCw,
  Filter,
  Truck,
  Package,
  IndianRupee,
  Calendar,
  MapPin,
  User,
  Copy,
  Check,
  CheckCircle,
  Clock,
  Gift,
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
  ShoppingBag,
  ChevronDown,
  ArrowUpDown,
  Phone,
  TrendingUp,
  TrendingDown,
  MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { books as ALL_BOOKS } from "@/utils/book";

// ---- Book cover lookup (order stores names; resolve to cover image) ----
const BOOK_IMAGE_BY_NAME = (() => {
  const map = {};
  (ALL_BOOKS || []).forEach((b) => {
    if (b?.name) map[String(b.name).trim().toLowerCase()] = b.image;
  });
  return map;
})();
const getBookImage = (name) =>
  BOOK_IMAGE_BY_NAME[String(name || "").trim().toLowerCase()] || null;

// ---- WhatsApp quick-message helpers ----
// Opens WhatsApp chat with the customer, pre-filled with a stage message.
const openWhatsApp = (phone, text) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) {
    alert("No phone number on this order.");
    return;
  }
  const num = digits.length === 10 ? `91${digits}` : digits;
  const url = `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
};

// Prefilled, nicely-formatted WhatsApp messages for each order stage.
// Includes the tracking ID + India Post link (when a tracking ID exists)
// and the customer's order-tracking profile link.
const PROFILE_URL = "https://www.thebookx.in/profile";
const INDIA_POST_URL = "https://www.indiapost.gov.in";

const waMessages = (order) => {
  const name = order?.["Customer Name"]
    ? String(order["Customer Name"]).trim()
    : "there";
  const orderId = order?.["Order ID"] || "";
  const tracking = String(order?.shippingId || order?.["Shipping ID"] || "").trim();
  const hi = `Hi ${name}`;
  const id = orderId ? ` (Order ${orderId})` : "";

  // Signature block appended to every message.
  const profileLine = `\n\n🔎 View your order anytime: ${PROFILE_URL}\n— Team TheBookX 📚`;
  // Tracking block, only when a tracking ID is present.
  const trackBlock = tracking
    ? `\n\n📦 Tracking ID: *${tracking}*\n🚚 Track on India Post: ${INDIA_POST_URL}`
    : "";

  return [
    {
      key: "confirm",
      label: "✅ Confirm order",
      text: `${hi}, this is TheBookX 📚\n\nWe've received your order${id}. Please reply *YES* to confirm it, so we can pack and ship it right away.${profileLine}`,
    },
    {
      key: "about",
      label: "📦 About to ship",
      text: `${hi}, good news! 🎉\n\nYour TheBookX order${id} is packed and about to ship. We'll share the tracking details with you shortly.${profileLine}`,
    },
    {
      key: "shipped",
      label: "🚚 Shipped",
      text: `${hi}, your TheBookX order${id} has been shipped 🚚\n\nExpected delivery is within *5 to 9 days*. It may be slightly delayed if the weather doesn't support — thank you for your patience!${trackBlock}${profileLine}`,
    },
    {
      key: "ofd",
      label: "🛵 Out for delivery",
      text: `${hi}, your TheBookX order${id} is out for delivery today 🛵\n\nPlease keep your phone reachable so our delivery partner can reach you.${trackBlock}${profileLine}`,
    },
    {
      key: "delivered",
      label: "🎉 Delivered",
      text: `${hi}, your TheBookX order${id} has been delivered ✅\n\nWe hope you love your books! A quick review would mean a lot to us 💛${profileLine}`,
    },
  ];
};

// Google Sheet ID and configuration
const SHEET_ID = "1ovqFn50d0TKjV0nm4q1lb3N9XvimUgIsHCOlHh6QRdg";
const SHEET_NAME = "Form responses 1";
const SHEET_API_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

// Google Forms submit URL
const FORM_SUBMIT_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSc3dUHr_S01ODuvQpok_8n0tG0ezfUPD5NLK0M_tyms25I-eQ/formResponse";

// Field mappings for Google Form
const FORM_FIELD_IDS = {
  timestamp: "entry.509242940",
  orderId: "entry.1840449230",
  customerName: "entry.669641354",
  phoneNumber: "entry.1941153221",
  pincode: "entry.778741327",
  city: "entry.1428299588",
  state: "entry.1558326929",
  address: "entry.733437133",
  booksList: "entry.473272273",
  totalAmount: "entry.1597483561",
  paymentType: "entry.1012308641",
  deliveryType: "entry.1881073537",
  deliveryCharge: "entry.979604882",
  giftWrap: "entry.10443444",
  giftWrapCharge: "entry.713637223",
  offerApplied: "entry.1246399200",
  tinyUrl: "entry.76337166",
  orderStatus: "entry.1458161030",
  userAgent: "entry.2060171385",
  shippingId: "entry.363127280",
};

// ---- Helpers ----
const formatDateForSheet = (date) => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const seconds = d.getSeconds().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

// Parses every timestamp format we receive from Google Sheets
// (the `Date(y,m,d,h,m,s)` string, the `dd/mm/yyyy hh:mm:ss` string,
// raw Date objects, and ISO strings) into a real Date instance.
// Returns null if it can't be parsed, callers use that to push the
// row to the bottom of the sort.
const parseAnyDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

  if (typeof value === "string") {
    // Google Sheets serialized: "Date(2026,4,20,23,14,14)"
    if (value.startsWith("Date(")) {
      const match = value.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
      if (match) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]); // 0-indexed in this format
        const day = parseInt(match[3]);
        const hours = parseInt(match[4]);
        const minutes = parseInt(match[5]);
        const seconds = parseInt(match[6]);
        const date = new Date(year, month, day, hours, minutes, seconds);
        if (!isNaN(date.getTime())) return date;
      }
    }

    // dd/mm/yyyy hh:mm:ss
    if (value.includes("/") && value.includes(":")) {
      const parts = value.split(" ");
      if (parts.length >= 2) {
        const dateParts = parts[0].split("/");
        const timeParts = parts[1].split(":");
        if (dateParts.length === 3 && timeParts.length >= 2) {
          const date = new Date(
            parseInt(dateParts[2]),
            parseInt(dateParts[1]) - 1,
            parseInt(dateParts[0]),
            parseInt(timeParts[0]),
            parseInt(timeParts[1]),
            parseInt(timeParts[2] || 0),
          );
          if (!isNaN(date.getTime())) return date;
        }
      }
    }

    // ISO / other
    const fallback = new Date(value);
    if (!isNaN(fallback.getTime())) return fallback;
  }

  return null;
};

const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

const formatDateToCustomString = (date) => {
  const day = date.getDate();
  const month = date.toLocaleString("en-IN", { month: "long" });
  const year = date.getFullYear();
  const formattedDay = `${day}${getOrdinalSuffix(day)}`;
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedTime = `${hours}:${formattedMinutes}${ampm}`;
  return `${formattedDay} ${month}, ${year} | ${formattedTime}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "Date not available";
  const date = parseAnyDate(dateString);
  if (date) return formatDateToCustomString(date);
  return typeof dateString === "string" ? dateString : "Date not available";
};

// Local "YYYY-MM-DD" key for a Date (used to group/compare calendar days).
const dayKey = (d) => {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Pick the best timestamp field on an order and return it as a Date (or null).
// We check the timestamp fields in order of preference.
const getOrderDate = (order) =>
  parseAnyDate(order["Timestamp(D)"]) ||
  parseAnyDate(order["Timestamp"]) ||
  parseAnyDate(order["Order Date"]);


// Sort orders by date. order = "desc" → newest first, "asc" → oldest first.
// Rows without a parseable date always go to the bottom.
const sortByDate = (list, order = "desc") =>
  [...list].sort((a, b) => {
    const da = getOrderDate(a);
    const db = getOrderDate(b);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return order === "desc"
      ? db.getTime() - da.getTime()
      : da.getTime() - db.getTime();
  });

// Backwards-compat alias, some callers still expect the old name.
const sortByDateDesc = (list) => sortByDate(list, "desc");

const parseBooksList = (booksStr) => {
  if (!booksStr) return [];
  const lines = booksStr.split("\n");
  const parsedBooks = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const match = line.match(
      /\d+\.\s([^|]+)\s*\|\s*Qty:\s*(\d+)\s*\|\s*₹(\d+)\s*each\s*\|\s*Total:\s*₹(\d+)/,
    );
    if (match) {
      parsedBooks.push({
        name: match[1].trim(),
        quantity: parseInt(match[2]),
        price: parseInt(match[3]),
        total: parseInt(match[4]),
      });
    } else {
      const nameMatch = line.match(/\d+\.\s([^|]+)/);
      if (nameMatch) {
        parsedBooks.push({
          name: nameMatch[1].trim(),
          quantity: 1,
          price: 0,
          total: 0,
        });
      }
    }
  }
  return parsedBooks;
};

const getStatusIcon = (status) => {
  const statusLower = status?.toLowerCase() || "";
  if (statusLower.includes("delivered"))
    return <CheckCircle size={16} className="text-green" />;
  if (statusLower.includes("shipped"))
    return <Truck size={16} className="text-orange" />;
  if (statusLower.includes("out for delivery"))
    return <Truck size={16} className="text-orange" />;
  if (statusLower.includes("in transit"))
    return <Package size={16} className="text-orange" />;
  return <Clock size={16} className="text-orange" />;
};

const getStatusColor = (status) => {
  const statusLower = status?.toLowerCase() || "";
  if (statusLower.includes("delivered")) return "status-delivered";
  if (statusLower.includes("shipped")) return "status-shipped";
  if (statusLower.includes("out for delivery"))
    return "status-out-for-delivery";
  if (statusLower.includes("in transit")) return "status-in-transit";
  return "status-pending";
};
// --------------------------------------------------------------------

// ── Orders calendar: per-day counts, click-to-filter, blinking "today" ──
function OrdersCalendar({
  calMonth,
  setCalMonth,
  ordersByDay,
  selectedDate,
  setSelectedDate,
  dateFrom,
  dateTo,
  setDateFrom,
  setDateTo,
}) {
  const { y, m } = calMonth;
  const todayKey = dayKey(new Date());
  const first = new Date(y, m, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const monthLabel = first.toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });

  // Range-select mode: pick a start day, then an end day.
  const [rangeMode, setRangeMode] = useState(false);
  const [rangeStart, setRangeStart] = useState(""); // pending start while picking

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  let monthTotal = 0;
  Object.keys(ordersByDay).forEach((k) => {
    if (k.startsWith(`${y}-${String(m + 1).padStart(2, "0")}-`))
      monthTotal += ordersByDay[k];
  });

  const prev = () =>
    setCalMonth(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }));
  const next = () =>
    setCalMonth(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }));

  const toggleRangeMode = () => {
    setRangeStart("");
    setRangeMode((on) => {
      const nextOn = !on;
      if (nextOn) setSelectedDate(""); // range replaces single-day filter
      return nextOn;
    });
  };

  const handleCellClick = (key) => {
    if (rangeMode) {
      if (!rangeStart) {
        // first click → start; clear any previous range
        setRangeStart(key);
        setDateFrom("");
        setDateTo("");
      } else {
        // second click → complete range (ordered)
        const [lo, hi] =
          rangeStart <= key ? [rangeStart, key] : [key, rangeStart];
        setDateFrom(lo);
        setDateTo(hi);
        setRangeStart("");
      }
    } else {
      setSelectedDate(selectedDate === key ? "" : key);
    }
  };

  return (
    <div className="oc">
      <div className="oc-head">
        <button type="button" className="oc-nav" onClick={prev} aria-label="Previous month">
          ‹
        </button>
        <div className="oc-title">
          <span className="oc-month">{monthLabel}</span>
          <span className="oc-total">{monthTotal} orders this month</span>
        </div>
        <button type="button" className="oc-nav" onClick={next} aria-label="Next month">
          ›
        </button>
      </div>

      <div className="oc-toolbar">
        <button
          type="button"
          className={`oc-range-btn${rangeMode ? " active" : ""}`}
          onClick={toggleRangeMode}
        >
          <Calendar size={13} />
          {rangeMode ? "Range mode on" : "Select range"}
        </button>
        {rangeMode && (
          <span className="oc-range-hint">
            {rangeStart ? "Now pick the end date" : "Pick the start date"}
          </span>
        )}
      </div>

      <div className="oc-grid oc-dow">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d} className="oc-dow-cell">
            {d}
          </span>
        ))}
      </div>
      <div className="oc-grid">
        {cells.map((d, i) => {
          if (d === null) return <span key={i} className="oc-cell oc-empty" />;
          const key = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const count = ordersByDay[key] || 0;
          const isToday = key === todayKey;
          const isSel = key === selectedDate;
          const inRange = dateFrom && dateTo && key >= dateFrom && key <= dateTo;
          const isRangeEnd =
            (dateFrom && key === dateFrom) || (dateTo && key === dateTo);
          const isPendingStart = rangeMode && key === rangeStart;
          return (
            <button
              type="button"
              key={i}
              className={`oc-cell${count ? " has-orders" : ""}${isToday ? " today" : ""}${isSel ? " selected" : ""}${inRange ? " in-range" : ""}${isRangeEnd ? " range-end" : ""}${isPendingStart ? " range-start" : ""}`}
              onClick={() => handleCellClick(key)}
              title={
                count
                  ? `${count} order${count > 1 ? "s" : ""} on ${key}`
                  : `No orders on ${key}`
              }
            >
              <span className="oc-day">{d}</span>
              {count > 0 && <span className="oc-count">{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Daily order-volume area chart (self-contained SVG, no deps) ──
function DailyVolumeChart({ ordersByDay, days = 14 }) {
  const today = new Date();
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - i,
    );
    series.push({ d, count: ordersByDay[dayKey(d)] || 0 });
  }
  const max = Math.max(1, ...series.map((s) => s.count));
  const total = series.reduce((n, s) => n + s.count, 0);
  const peak = Math.max(0, ...series.map((s) => s.count));
  const W = 600,
    H = 172,
    padX = 14,
    padTop = 24,
    padBottom = 26;
  const iw = W - padX * 2;
  const ih = H - padTop - padBottom;
  const n = series.length;
  const sx = (i) => padX + (n === 1 ? iw / 2 : (i * iw) / (n - 1));
  const sy = (c) => padTop + ih - (c / max) * ih;
  const line = series.map((s, i) => `${sx(i)},${sy(s.count)}`).join(" ");
  const area =
    `M ${sx(0)},${padTop + ih} ` +
    series.map((s, i) => `L ${sx(i)},${sy(s.count)}`).join(" ") +
    ` L ${sx(n - 1)},${padTop + ih} Z`;
  const fmt = (d) => `${d.getDate()}/${d.getMonth() + 1}`;

  return (
    <div className="admin-chart-card vol-card">
      <div className="chart-title">
        Daily order volume
        <span className="vol-sub">
          {total} orders · peak {peak}/day · last {days} days
        </span>
      </div>
      <svg className="vol-svg" viewBox={`0 0 ${W} ${H}`} role="img">
        <defs>
          <linearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(251,133,0,0.32)" />
            <stop offset="100%" stopColor="rgba(251,133,0,0)" />
          </linearGradient>
        </defs>
        <line
          x1={padX}
          y1={padTop + ih}
          x2={W - padX}
          y2={padTop + ih}
          stroke="var(--hairline,#ececec)"
          strokeWidth="1"
        />
        <path d={area} fill="url(#volFill)" />
        <polyline
          points={line}
          fill="none"
          stroke="var(--tertiary,#fb8500)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {series.map((s, i) => (
          <g key={i}>
            {s.count > 0 && (
              <>
                <circle
                  cx={sx(i)}
                  cy={sy(s.count)}
                  r="3"
                  fill="#fff"
                  stroke="var(--tertiary,#fb8500)"
                  strokeWidth="2"
                />
                <text
                  x={sx(i)}
                  y={sy(s.count) - 8}
                  textAnchor="middle"
                  className="vol-num"
                >
                  {s.count}
                </text>
              </>
            )}
            {(i % 2 === 0 || i === n - 1) && (
              <text x={sx(i)} y={H - 8} textAnchor="middle" className="vol-x">
                {fmt(s.d)}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Reusable collapsible accordion section.
function Accordion({ id, title, icon, open, onToggle, right, children }) {
  return (
    <div className="acc">
      <div className="acc-head" onClick={() => onToggle(id)}>
        <span className="acc-title">
          {icon}
          {title}
        </span>
        <span className="acc-actions">
          {right}
          <ChevronDown
            size={18}
            className="acc-chev"
            style={{
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform 0.25s ease",
            }}
          />
        </span>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="acc-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="acc-body">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Yearly run-rate: one cumulative line per month (only months with orders) ──
function RunRateChart({ orders }) {
  const year = new Date().getFullYear();
  const COLORS = [
    "#fb8500", "#0a8f0c", "#2563eb", "#e11d48", "#7c3aed", "#0891b2",
    "#d97706", "#db2777", "#16a34a", "#4f46e5", "#dc2626", "#0d9488",
  ];
  const byMonthDay = {};
  orders.forEach((o) => {
    const d = getOrderDate(o);
    if (!d || d.getFullYear() !== year) return;
    const m = d.getMonth();
    const day = d.getDate();
    byMonthDay[m] = byMonthDay[m] || {};
    byMonthDay[m][day] = (byMonthDay[m][day] || 0) + 1;
  });
  const months = Object.keys(byMonthDay)
    .map(Number)
    .sort((a, b) => a - b);
  if (months.length === 0) return null;

  const maxDay = 31;
  let maxCum = 1;
  const seriesByMonth = {};
  months.forEach((m) => {
    let cum = 0;
    const pts = [];
    for (let day = 1; day <= maxDay; day++) {
      cum += byMonthDay[m][day] || 0;
      pts.push(cum);
    }
    seriesByMonth[m] = pts;
    maxCum = Math.max(maxCum, cum);
  });

  const W = 600, H = 240, padL = 30, padR = 14, padTop = 14, padBottom = 26;
  const iw = W - padL - padR;
  const ih = H - padTop - padBottom;
  const x = (day) => padL + ((day - 1) / (maxDay - 1)) * iw;
  const y = (v) => padTop + ih - (v / maxCum) * ih;

  return (
    <div className="admin-chart-card rr-card">
      <div className="chart-title">
        Order run-rate · {year}
        <span className="vol-sub">cumulative orders by day, per month</span>
      </div>
      <svg className="rr-svg" viewBox={`0 0 ${W} ${H}`} role="img">
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
          const yy = padTop + ih - f * ih;
          return (
            <g key={i}>
              <line
                x1={padL}
                y1={yy}
                x2={W - padR}
                y2={yy}
                stroke="var(--hairline,#ececec)"
                strokeWidth="1"
              />
              <text x={padL - 6} y={yy + 3} textAnchor="end" className="rr-y">
                {Math.round(maxCum * f)}
              </text>
            </g>
          );
        })}
        {months.map((m) => (
          <polyline
            key={m}
            points={seriesByMonth[m]
              .map((v, di) => `${x(di + 1)},${y(v)}`)
              .join(" ")}
            fill="none"
            stroke={COLORS[m % COLORS.length]}
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
      </svg>
      <div className="rr-legend">
        {months.map((m) => (
          <span key={m} className="rr-leg">
            <span
              className="rr-swatch"
              style={{ background: COLORS[m % COLORS.length] }}
            />
            {MONTH_LABELS[m]} <b>{seriesByMonth[m][maxDay - 1]}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Weekly orders bar chart with prev/next week navigation ──
function WeeklyBarChart({ orders }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dow = (base.getDay() + 6) % 7; // Monday = 0
  const weekStart = new Date(base);
  weekStart.setDate(base.getDate() - dow + weekOffset * 7);
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const dayCounts = {};
  orders.forEach((o) => {
    const d = getOrderDate(o);
    if (d) dayCounts[dayKey(d)] = (dayCounts[dayKey(d)] || 0) + 1;
  });
  const cols = [];
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const c = dayCounts[dayKey(d)] || 0;
    cols.push({ d, c });
    total += c;
  }
  const max = Math.max(1, ...cols.map((c) => c.c));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const fmt = (d) => `${d.getDate()}/${d.getMonth() + 1}`;

  return (
    <div className="admin-chart-card wk-card">
      <div className="wk-head">
        <div className="chart-title">
          Weekly orders <span className="vol-sub">{total} in this week</span>
        </div>
        <div className="wk-nav">
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w - 1)}
            aria-label="Previous week"
          >
            ‹
          </button>
          <span className="wk-range">
            {fmt(weekStart)} – {fmt(weekEnd)}
          </span>
          <button
            type="button"
            onClick={() => setWeekOffset((w) => Math.min(0, w + 1))}
            aria-label="Next week"
            disabled={weekOffset >= 0}
          >
            ›
          </button>
        </div>
      </div>
      <div className="wk-bars">
        {cols.map((c, i) => (
          <div key={i} className="wk-col" title={`${c.c} orders on ${fmt(c.d)}`}>
            <div className="wk-bar-track">
              <div
                className="wk-bar"
                style={{ height: `${(c.c / max) * 100}%` }}
              >
                {c.c > 0 && <span className="wk-val">{c.c}</span>}
              </div>
            </div>
            <span className="wk-lbl">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Predicted monthly revenue (run-rate projection) ──
function PredictedMRR({ orders }) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  let revSoFar = 0;
  let ordSoFar = 0;
  orders.forEach((o) => {
    const d = getOrderDate(o);
    if (d && d.getFullYear() === y && d.getMonth() === m) {
      revSoFar += o.revenue || 0;
      ordSoFar += 1;
    }
  });
  const lm = new Date(y, m - 1, 1);
  let lastRev = 0;
  orders.forEach((o) => {
    const d = getOrderDate(o);
    if (d && d.getFullYear() === lm.getFullYear() && d.getMonth() === lm.getMonth())
      lastRev += o.revenue || 0;
  });
  const projected =
    dayOfMonth > 0 ? Math.round((revSoFar / dayOfMonth) * daysInMonth) : revSoFar;
  const pace = lastRev > 0 ? Math.round(((projected - lastRev) / lastRev) * 100) : null;

  return (
    <div className="admin-chart-card mrr-card">
      <div className="chart-title">Predicted monthly revenue (run-rate)</div>
      <div className="mrr-grid">
        <div className="mrr-cell">
          <span>This month so far</span>
          <strong>₹{revSoFar.toLocaleString()}</strong>
          <em>
            {ordSoFar} orders · day {dayOfMonth}/{daysInMonth}
          </em>
        </div>
        <div className="mrr-cell hero">
          <span>Projected month-end</span>
          <strong>₹{projected.toLocaleString()}</strong>
          <em>
            {pace !== null
              ? `${pace >= 0 ? "▲ +" : "▼ "}${pace}% vs last month`
              : "run-rate estimate"}
          </em>
        </div>
        <div className="mrr-cell">
          <span>{MONTH_LABELS[lm.getMonth()]} (last month)</span>
          <strong>₹{lastRev.toLocaleString()}</strong>
          <em>actual</em>
        </div>
      </div>
    </div>
  );
}

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("active"); // default: pending + processing
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc"); // "desc" = latest first
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedDate, setSelectedDate] = useState(""); // "YYYY-MM-DD" from calendar
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  // ── Book-picking (fulfilment) state ──
  const [pickChecked, setPickChecked] = useState({}); // { "orderId::idx": true }
  const [pickFilter, setPickFilter] = useState("all"); // all | pending | done
  const [showPicking, setShowPicking] = useState(true);
  const [pickHydrated, setPickHydrated] = useState(false);
  const [packedOrders, setPackedOrders] = useState({}); // { orderId: true }
  const [detailOrder, setDetailOrder] = useState(null); // order shown in detail modal
  const [accOpen, setAccOpen] = useState({
    analytics: true,
    calendar: false,
    orders: true,
  });
  const toggleAcc = (id) => setAccOpen((p) => ({ ...p, [id]: !p[id] }));

  useEffect(() => {
    try {
      const raw = localStorage.getItem("manage_orders_picks");
      if (raw) setPickChecked(JSON.parse(raw) || {});
      const rawP = localStorage.getItem("manage_orders_packed");
      if (rawP) setPackedOrders(JSON.parse(rawP) || {});
      const rawA = localStorage.getItem("manage_orders_accordions");
      if (rawA) setAccOpen((prev) => ({ ...prev, ...JSON.parse(rawA) }));
    } catch (_) {}
    setPickHydrated(true);
  }, []);
  useEffect(() => {
    if (!pickHydrated) return;
    try {
      localStorage.setItem("manage_orders_picks", JSON.stringify(pickChecked));
      localStorage.setItem("manage_orders_packed", JSON.stringify(packedOrders));
      localStorage.setItem(
        "manage_orders_accordions",
        JSON.stringify(accOpen),
      );
    } catch (_) {}
  }, [pickChecked, packedOrders, accOpen, pickHydrated]);

  const togglePacked = (orderId) => {
    setPackedOrders((prev) => {
      const next = { ...prev };
      if (next[orderId]) delete next[orderId];
      else next[orderId] = true;
      return next;
    });
  };

  const bookKey = (orderId, idx) => `${orderId}::${idx}`;
  const toggleBook = (orderId, idx) => {
    setPickChecked((prev) => {
      const k = bookKey(orderId, idx);
      const next = { ...prev };
      if (next[k]) delete next[k];
      else next[k] = true;
      return next;
    });
  };
  const orderPickStats = (order) => {
    const books = order.parsedBooks || [];
    const oid = order["Order ID"] || order._rowIndex;
    const checked = books.reduce(
      (n, _b, i) => n + (pickChecked[bookKey(oid, i)] ? 1 : 0),
      0,
    );
    return {
      total: books.length,
      checked,
      done: books.length > 0 && checked === books.length,
    };
  };

  const toggleExpanded = (orderId) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };
  const [formData, setFormData] = useState({
    orderId: "",
    customerName: "",
    phoneNumber: "",
    pincode: "",
    city: "",
    state: "",
    address: "",
    booksList: "",
    totalAmount: "",
    paymentType: "",
    deliveryType: "",
    deliveryCharge: "",
    giftWrap: "No",
    giftWrapCharge: "0",
    offerApplied: "",
    tinyUrl: "",
    orderStatus: "Processing",
    shippingId: "",
    timestamp: "",
  });

  // Fetch orders from Google Sheet
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(SHEET_API_URL);
      const text = await response.text();
      const jsonString = text.substring(47, text.length - 2);
      const data = JSON.parse(jsonString);

      const headers = data.table.cols.map((col) => col.label);
      const rows = data.table.rows;

      const parsedOrders = rows.map((row, index) => {
        const order = {};
        row.c.forEach((cell, idx) => {
          if (headers[idx]) {
            let value = cell?.v;
            if (
              value &&
              typeof value === "object" &&
              value.hasOwnProperty("value")
            ) {
              value = value.value;
            }
            order[headers[idx]] = value || "";
          }
        });
        order._rowIndex = index;
        order.parsedBooks = parseBooksList(order["Books List"]);
        order.shippingId = order["Shipping ID"] || "";
        order.status = order["Order Status"] || "Processing";
        order.revenue = parseFloat(order["Total Amount"]) || 0;
        order.totalCost = parseFloat(order["Total Cost"]) || 0;
        order.pnl = order.revenue - order.totalCost;
        return order;
      });

      // Initial sort, the filter useEffect immediately re-sorts using the
      // current sortOrder, so this is just a placeholder.
      const sorted = sortByDateDesc(parsedOrders);

      setOrders(sorted);
      setFilteredOrders(sorted);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Restore saved filter/search preferences on mount
  useEffect(() => {
    try {
      const p = JSON.parse(
        localStorage.getItem("manage_orders_prefs") || "{}",
      );
      if (p.searchQuery) setSearchQuery(p.searchQuery);
      if (p.statusFilter) setStatusFilter(p.statusFilter);
      if (p.paymentFilter) setPaymentFilter(p.paymentFilter);
      if (p.dateFrom) setDateFrom(p.dateFrom);
      if (p.dateTo) setDateTo(p.dateTo);
      if (p.sortOrder) setSortOrder(p.sortOrder);
    } catch (_) {}
    setPrefsLoaded(true);
  }, []);

  // Persist filter/search preferences whenever they change (after load)
  useEffect(() => {
    if (!prefsLoaded) return;
    try {
      localStorage.setItem(
        "manage_orders_prefs",
        JSON.stringify({
          searchQuery,
          statusFilter,
          paymentFilter,
          dateFrom,
          dateTo,
          sortOrder,
        }),
      );
    } catch (_) {}
  }, [
    prefsLoaded,
    searchQuery,
    statusFilter,
    paymentFilter,
    dateFrom,
    dateTo,
    sortOrder,
  ]);

  // Apply filters, re-sort at the end so search/filter results stay newest-first
  useEffect(() => {
    let filtered = [...orders];

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order["Customer Name"]
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          order["Order ID"]
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          String(order["Phone Number"] || "").includes(searchQuery) ||
          order["Shipping ID"]
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    if (statusFilter === "active") {
      // Default view: only pending / processing (and un-set) orders.
      filtered = filtered.filter((order) => {
        const s = (order["Order Status"] || "").toLowerCase();
        return !s || s.includes("pending") || s.includes("processing");
      });
    } else if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order["Order Status"] === statusFilter,
      );
    }

    if (paymentFilter !== "all") {
      filtered = filtered.filter(
        (order) => order["Payment Type"] === paymentFilter,
      );
    }

    // Date-range filter (inclusive) on the order date
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      filtered = filtered.filter((o) => {
        const d = getOrderDate(o);
        return d && d >= from;
      });
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter((o) => {
        const d = getOrderDate(o);
        return d && d <= to;
      });
    }

    // Calendar day filter — show only orders received on the clicked date
    if (selectedDate) {
      filtered = filtered.filter((o) => {
        const d = getOrderDate(o);
        return d && dayKey(d) === selectedDate;
      });
    }

    setFilteredOrders(sortByDate(filtered, sortOrder));
  }, [
    searchQuery,
    orders,
    statusFilter,
    paymentFilter,
    sortOrder,
    dateFrom,
    dateTo,
    selectedDate,
  ]);

  // Orders received per calendar day → { "YYYY-MM-DD": count }
  const ordersByDay = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const d = getOrderDate(o);
      if (d) {
        const k = dayKey(d);
        map[k] = (map[k] || 0) + 1;
      }
    });
    return map;
  }, [orders]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    const now = new Date();
    setFormData({
      orderId: `ORD${Date.now()}`,
      customerName: "",
      phoneNumber: "",
      pincode: "",
      city: "",
      state: "",
      address: "",
      booksList: "",
      totalAmount: "",
      paymentType: "",
      deliveryType: "",
      deliveryCharge: "",
      giftWrap: "No",
      giftWrapCharge: "0",
      offerApplied: "",
      tinyUrl: "",
      orderStatus: "Processing",
      shippingId: "",
      timestamp: formatDateForSheet(now),
    });
  };

  const handleAddOrder = async () => {
    if (!formData.customerName || !formData.phoneNumber) {
      alert("Please fill customer name and phone number");
      return;
    }

    const now = new Date();
    const params = new URLSearchParams();
    params.append(FORM_FIELD_IDS.timestamp, formatDateForSheet(now));
    params.append(
      FORM_FIELD_IDS.orderId,
      formData.orderId || `ORD${Date.now()}`,
    );
    params.append(FORM_FIELD_IDS.customerName, formData.customerName);
    params.append(FORM_FIELD_IDS.phoneNumber, formData.phoneNumber);
    params.append(FORM_FIELD_IDS.pincode, formData.pincode);
    params.append(FORM_FIELD_IDS.city, formData.city);
    params.append(FORM_FIELD_IDS.state, formData.state);
    params.append(FORM_FIELD_IDS.address, formData.address);
    params.append(FORM_FIELD_IDS.booksList, formData.booksList);
    params.append(FORM_FIELD_IDS.totalAmount, formData.totalAmount);
    params.append(FORM_FIELD_IDS.paymentType, formData.paymentType);
    params.append(FORM_FIELD_IDS.deliveryType, formData.deliveryType);
    params.append(FORM_FIELD_IDS.deliveryCharge, formData.deliveryCharge);
    params.append(FORM_FIELD_IDS.giftWrap, formData.giftWrap);
    params.append(FORM_FIELD_IDS.giftWrapCharge, formData.giftWrapCharge);
    params.append(FORM_FIELD_IDS.offerApplied, formData.offerApplied);
    params.append(FORM_FIELD_IDS.tinyUrl, formData.tinyUrl);
    params.append(FORM_FIELD_IDS.orderStatus, formData.orderStatus);
    params.append(FORM_FIELD_IDS.userAgent, navigator.userAgent);
    params.append(FORM_FIELD_IDS.shippingId, formData.shippingId);

    try {
      await fetch(FORM_SUBMIT_URL, {
        method: "POST",
        mode: "no-cors",
        body: params,
      });
      alert("Order added successfully!");
      setShowAddModal(false);
      resetForm();
      fetchOrders();
    } catch (error) {
      console.error("Error adding order:", error);
      alert("Failed to add order");
    }
  };

  const handleEditOrder = async () => {
    if (!selectedOrder) return;

    // Preserve the original order date, do NOT overwrite with the current time.
    // The raw value from gviz can be either the serialized form
    //   "Date(2026,4,20,23,14,14)"
    // or the plain-text form
    //   "20/05/2026 23:14:14"
    // We normalize both via parseAnyDate, then re-emit in the same
    // `dd/mm/yyyy hh:mm:ss` format that new orders use, so the sheet stays
    // consistent. If parsing fails for any reason, fall back to the raw value
    // (string) so we never accidentally stamp a fresh "now" onto an edit.
    const originalRaw =
      selectedOrder["Timestamp (D)"] || selectedOrder["Timestamp"] || "";
    const parsedOriginal = parseAnyDate(originalRaw);
    const originalTimestamp = parsedOriginal
      ? formatDateForSheet(parsedOriginal)
      : typeof originalRaw === "string" && originalRaw.trim()
        ? originalRaw
        : formatDateForSheet(new Date());

    const params = new URLSearchParams();
    params.append(FORM_FIELD_IDS.timestamp, originalTimestamp);
    params.append(FORM_FIELD_IDS.orderId, formData.orderId);
    params.append(FORM_FIELD_IDS.customerName, formData.customerName);
    params.append(FORM_FIELD_IDS.phoneNumber, formData.phoneNumber);
    params.append(FORM_FIELD_IDS.pincode, formData.pincode);
    params.append(FORM_FIELD_IDS.city, formData.city);
    params.append(FORM_FIELD_IDS.state, formData.state);
    params.append(FORM_FIELD_IDS.address, formData.address);
    params.append(FORM_FIELD_IDS.booksList, formData.booksList);
    params.append(FORM_FIELD_IDS.totalAmount, formData.totalAmount);
    params.append(FORM_FIELD_IDS.paymentType, formData.paymentType);
    params.append(FORM_FIELD_IDS.deliveryType, formData.deliveryType);
    params.append(FORM_FIELD_IDS.deliveryCharge, formData.deliveryCharge);
    params.append(FORM_FIELD_IDS.giftWrap, formData.giftWrap);
    params.append(FORM_FIELD_IDS.giftWrapCharge, formData.giftWrapCharge);
    params.append(FORM_FIELD_IDS.offerApplied, formData.offerApplied);
    params.append(FORM_FIELD_IDS.tinyUrl, formData.tinyUrl);
    params.append(FORM_FIELD_IDS.orderStatus, formData.orderStatus);
    params.append(FORM_FIELD_IDS.userAgent, navigator.userAgent);
    params.append(FORM_FIELD_IDS.shippingId, formData.shippingId);

    try {
      await fetch(FORM_SUBMIT_URL, {
        method: "POST",
        mode: "no-cors",
        body: params,
      });
      alert("Order updated successfully!");
      setShowEditModal(false);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order");
    }
  };

  const openEditModal = (order) => {
    setSelectedOrder(order);
    setFormData({
      orderId: order["Order ID"] || "",
      customerName: order["Customer Name"] || "",
      phoneNumber: order["Phone Number"] || "",
      pincode: order["Pincode"] || "",
      city: order["City"] || "",
      state: order["State"] || "",
      address: order["Address"] || "",
      booksList: order["Books List"] || "",
      totalAmount: order["Total Amount"] || "",
      paymentType: order["Payment Type"] || "",
      deliveryType: order["Delivery Type"] || "",
      deliveryCharge: order["Delivery Charge"] || "",
      giftWrap: order["Gift Wrap"] || "No",
      giftWrapCharge: order["Gift Wrap Charge"] || "0",
      offerApplied: order["Offer Applied"] || "",
      tinyUrl: order["TinyURL"] || "",
      orderStatus: order["Order Status"] || "Processing",
      shippingId: order["Shipping ID"] || "",
      timestamp: order["Timestamp (D)"] || order["Timestamp"] || "",
    });
    setShowEditModal(true);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTrackPackage = (shippingId) => {
    if (shippingId) {
      navigator.clipboard.writeText(shippingId);
      alert(`Tracking ID ${shippingId} copied to clipboard!`);
      window.open("https://www.indiapost.gov.in", "_blank");
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Order ID",
      "Customer Name",
      "Phone",
      "Amount",
      "Payment",
      "Status",
      "Shipping ID",
      "Order Date",
    ];
    const rows = filteredOrders.map((order) => [
      order["Order ID"] || "",
      order["Customer Name"] || "",
      order["Phone Number"] || "",
      order["Total Amount"] || "",
      order["Payment Type"] || "",
      order["Order Status"] || "",
      order["Shipping ID"] || "",
      formatDate(order["Timestamp(D)"] || order["Timestamp"]),
    ]);

    let csvContent = headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent +=
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",") +
        "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Highest order value (for value-based card tinting)
  const maxRevenue = Math.max(1, ...filteredOrders.map((o) => o.revenue || 0));

  // Stats (all read straight from the sheet columns)
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.revenue, 0);
  const totalCost = filteredOrders.reduce((sum, o) => sum + o.totalCost, 0);
  const totalPnL = totalRevenue - totalCost;
  const marginPct =
    totalRevenue > 0 ? Math.round((totalPnL / totalRevenue) * 100) : 0;

  const deliveredCount = filteredOrders.filter(
    (o) => o["Order Status"] === "Delivered",
  ).length;
  const inTransitCount = filteredOrders.filter(
    (o) =>
      o["Order Status"] === "In Transit" || o["Order Status"] === "Shipped",
  ).length;
  const withTrackingCount = filteredOrders.filter(
    (o) => o["Shipping ID"] && String(o["Shipping ID"]).trim() !== "",
  ).length;

  // Status breakdown for the chart / progress bars
  const STATUS_META = [
    { key: "Processing", color: "#fb8500" },
    { key: "Shipped", color: "#3b6fe0" },
    { key: "In Transit", color: "#7c4dff" },
    { key: "Out for Delivery", color: "#0ea5e9" },
    { key: "Delivered", color: "#008f0c" },
    { key: "Cancelled", color: "#ef4444" },
  ];
  const statusCounts = STATUS_META.map((s) => ({
    ...s,
    count: filteredOrders.filter((o) => o["Order Status"] === s.key).length,
  }));
  const maxStatusCount = Math.max(1, ...statusCounts.map((s) => s.count));

  // Payment split
  const codCount = filteredOrders.filter((o) =>
    String(o["Payment Type"] || "").includes("Cash"),
  ).length;
  const prepaidCount = filteredOrders.length - codCount;

  if (loading) {
    return (
      <div className="my-orders-page">
        <div className="section-1200 p-40">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="section-1200 flex flex-col gap-24">
        {/* Header, same shape as my-orders */}
        <div className="orders-header">
          <Link href="/" className="flex flex-row gap-8 items-center">
            <ArrowLeft size={18} />
            <div className="flex flex-col">
              <h1 className="font-24">Manage Orders</h1>
              <p className="font-12 dark-50">
                View, manage, and track all customer orders
              </p>
            </div>
          </Link>
        </div>

        {/* ===== Analytics (accordion) ===== */}
        <Accordion
          id="analytics"
          title="Analytics"
          open={accOpen.analytics}
          onToggle={toggleAcc}
          right={
            <div className="flex flex-row gap-8">
              <button
                className="sec-mid-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  fetchOrders();
                }}
                title="Refresh"
              >
                <RefreshCw size={14} /> Refresh
              </button>
              <button
                className="sec-mid-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  exportToCSV();
                }}
                title="Export CSV"
              >
                <Download size={14} /> Export
              </button>
            </div>
          }
        >
          <div className="admin-dash">
            {/* KPI cards */}
          <div className="admin-kpis">
            <div className="kpi kpi-orders">
              <div className="kpi-ic"><ShoppingBag size={18} /></div>
              <span className="kpi-value">{filteredOrders.length}</span>
              <span className="kpi-label">Orders</span>
            </div>
            <div className="kpi kpi-rev">
              <div className="kpi-ic"><IndianRupee size={18} /></div>
              <span className="kpi-value">₹{totalRevenue.toLocaleString()}</span>
              <span className="kpi-label">Revenue</span>
            </div>
            <div className="kpi kpi-cost">
              <div className="kpi-ic"><Package size={18} /></div>
              <span className="kpi-value">₹{totalCost.toLocaleString()}</span>
              <span className="kpi-label">Total cost</span>
            </div>
            <div className={`kpi ${totalPnL >= 0 ? "kpi-profit" : "kpi-loss"}`}>
              <div className="kpi-ic">
                {totalPnL >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              </div>
              <span className="kpi-value">
                {totalPnL >= 0 ? "+" : "−"}₹{Math.abs(totalPnL).toLocaleString()}
              </span>
              <span className="kpi-label">Profit · {marginPct}% margin</span>
            </div>
          </div>

          {/* Daily order-volume area chart */}
          <DailyVolumeChart ordersByDay={ordersByDay} />

          {/* Charts row */}
          <div className="admin-charts">
            <div className="admin-chart-card">
              <div className="chart-title">Orders by status</div>
              <div className="status-bars">
                {statusCounts.map((s) => (
                  <div key={s.key} className="status-bar-row">
                    <span className="sb-label">{s.key}</span>
                    <div className="sb-track">
                      <div
                        className="sb-fill"
                        style={{
                          width: `${(s.count / maxStatusCount) * 100}%`,
                          background: s.color,
                        }}
                      />
                    </div>
                    <span className="sb-count">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-chart-card">
              <div className="chart-title">Payment & fulfilment</div>
              <div className="pay-split">
                <div
                  className="pay-donut"
                  style={{
                    background: `conic-gradient(#fb8500 0 ${
                      filteredOrders.length
                        ? Math.round((prepaidCount / filteredOrders.length) * 100)
                        : 0
                    }%, #0a0a0a 0)`,
                  }}
                >
                  <span>{filteredOrders.length}</span>
                </div>
                <div className="pay-legend">
                  <div>
                    <span className="dot" style={{ background: "#fb8500" }} />
                    Prepaid {prepaidCount}
                  </div>
                  <div>
                    <span className="dot" style={{ background: "#0a0a0a" }} />
                    COD {codCount}
                  </div>
                </div>
              </div>
              <div className="dash-mini">
                <div>
                  <span>Delivered</span>
                  <strong>{deliveredCount}</strong>
                </div>
                <div>
                  <span>In transit</span>
                  <strong>{inTransitCount}</strong>
                </div>
                <div>
                  <span>Tracking</span>
                  <strong>{withTrackingCount}</strong>
                </div>
              </div>
            </div>
          </div>

            {/* Yearly run-rate + weekly orders + predicted MRR */}
            <RunRateChart orders={orders} />
            <WeeklyBarChart orders={orders} />
            <PredictedMRR orders={orders} />
          </div>
        </Accordion>

        {/* Search + Filter row */}
        <div className="admin-search">
          <div className="flex flex-row gap-12 width100">
            <input
              type="text"
              className="sec-mid-btn width100"
              placeholder="Search by name, order ID, phone, or shipping ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className="sec-mid-btn"
              onClick={() => setShowFilters(!showFilters)}
              style={{ maxWidth: "fit-content" }}
            >
              <Filter size={16} />
              Filters
              {(statusFilter !== "all" ||
                paymentFilter !== "all" ||
                dateFrom ||
                dateTo) && <span className="orange weight-600">●</span>}
            </button>
            <button
              className="sec-mid-btn"
              onClick={() =>
                setSortOrder((s) => (s === "desc" ? "asc" : "desc"))
              }
              style={{ maxWidth: "fit-content" }}
              title={
                sortOrder === "desc"
                  ? "Showing latest first, click for oldest first"
                  : "Showing oldest first, click for latest first"
              }
            >
              <ArrowUpDown size={14} />
              {sortOrder === "desc" ? "Latest" : "Oldest"}
            </button>
            <button
              className="pri-big-btn"
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              style={{ maxWidth: "fit-content" }}
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Filter dropdown panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="admin-filter-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="admin-filter-grid">
                  <div className="admin-field">
                    <label className="admin-field-label">Order Status</label>
                    <div className="admin-select-wrap">
                      <select
                        className="admin-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="active">Active (Pending + Processing)</option>
                        <option value="all">All Statuses</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <div className="admin-field">
                    <label className="admin-field-label">Payment Type</label>
                    <div className="admin-select-wrap">
                      <select
                        className="admin-select"
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                      >
                        <option value="all">All Payments</option>
                        <option value="COD">Cash on Delivery</option>
                        <option value="UPI Payment">UPI Payment</option>
                        <option value="Card Payment">Card Payment</option>
                      </select>
                    </div>
                  </div>
                  <div className="admin-field">
                    <label className="admin-field-label">From date</label>
                    <input
                      type="date"
                      className="admin-input"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="admin-field">
                    <label className="admin-field-label">To date</label>
                    <input
                      type="date"
                      className="admin-input"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                </div>

                {(statusFilter !== "all" ||
                  paymentFilter !== "all" ||
                  dateFrom ||
                  dateTo ||
                  selectedDate) && (
                  <button
                    className="admin-clear-all"
                    onClick={() => {
                      setStatusFilter("all");
                      setPaymentFilter("all");
                      setDateFrom("");
                      setDateTo("");
                      setSelectedDate("");
                    }}
                  >
                    <X size={14} /> Clear all filters
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== Calendar (accordion) ===== */}
        <Accordion
          id="calendar"
          title="Orders calendar"
          open={accOpen.calendar}
          onToggle={toggleAcc}
        >
        <div className="admin-cal-wrap admin-cal-standalone">
          <OrdersCalendar
            calMonth={calMonth}
            setCalMonth={setCalMonth}
            ordersByDay={ordersByDay}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            dateFrom={dateFrom}
            dateTo={dateTo}
            setDateFrom={setDateFrom}
            setDateTo={setDateTo}
          />
          {selectedDate && (
            <div className="admin-cal-selected">
              Showing orders for{" "}
              <strong>
                {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                  "en-IN",
                  { day: "numeric", month: "short", year: "numeric" },
                )}
              </strong>
              <button
                type="button"
                className="admin-cal-clear"
                onClick={() => setSelectedDate("")}
              >
                <X size={13} /> Show all
              </button>
            </div>
          )}
          {dateFrom && dateTo && (
            <div className="admin-cal-selected">
              Showing orders from{" "}
              <strong>
                {new Date(dateFrom + "T00:00:00").toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </strong>{" "}
              to{" "}
              <strong>
                {new Date(dateTo + "T00:00:00").toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </strong>
              <button
                type="button"
                className="admin-cal-clear"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                <X size={13} /> Show all
              </button>
            </div>
          )}
        </div>
        </Accordion>

        {/* ===== Book Picking (fulfilment) ===== */}
        {filteredOrders.length > 0 &&
          (() => {
            const orderStats = filteredOrders.map((o) => ({
              order: o,
              stats: orderPickStats(o),
            }));
            const doneOrders = orderStats.filter((x) => x.stats.done).length;
            const pendingOrders = orderStats.length - doneOrders;
            const totalBooks = orderStats.reduce((n, x) => n + x.stats.total, 0);
            const checkedBooks = orderStats.reduce(
              (n, x) => n + x.stats.checked,
              0,
            );
            const visible = orderStats.filter((x) =>
              pickFilter === "all"
                ? true
                : pickFilter === "done"
                  ? x.stats.done
                  : !x.stats.done,
            );
            return (
              <div className="pick-panel">
                <button
                  type="button"
                  className="pick-head"
                  onClick={() => setShowPicking((v) => !v)}
                >
                  <span className="pick-head-title">
                    <Package size={16} /> Book Picking
                    <span className="pick-head-sub">
                      {checkedBooks}/{totalBooks} books · {doneOrders} done ·{" "}
                      {pendingOrders} pending
                    </span>
                  </span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: showPicking ? "rotate(180deg)" : "none",
                      transition: "transform .25s ease",
                    }}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {showPicking && (
                    <motion.div
                      key="pickbody"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="pick-filters">
                        {[
                          { k: "all", label: `All (${orderStats.length})` },
                          { k: "pending", label: `Pending (${pendingOrders})` },
                          { k: "done", label: `Done (${doneOrders})` },
                        ].map((f) => (
                          <button
                            key={f.k}
                            type="button"
                            className={`pick-filter-btn${pickFilter === f.k ? " active" : ""}`}
                            onClick={() => setPickFilter(f.k)}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>

                      <div className="pick-orders">
                        {visible.map(({ order, stats }) => {
                          const oid = order["Order ID"] || order._rowIndex;
                          const pbooks = order.parsedBooks || [];
                          return (
                            <div
                              key={oid}
                              className={`pick-order${stats.done ? " done" : ""}`}
                            >
                              <div className="pick-order-head">
                                <span className="pick-order-name">
                                  <User size={13} />{" "}
                                  {order["Customer Name"] || "—"}
                                </span>
                                <span className="pick-order-id">{oid}</span>
                                <span
                                  className={`pick-badge ${stats.done ? "done" : "pending"}`}
                                >
                                  {stats.done ? (
                                    <>
                                      <Check size={12} /> Done
                                    </>
                                  ) : (
                                    `${stats.checked}/${stats.total} picked`
                                  )}
                                </span>
                              </div>
                              <div className="pick-grid">
                                {pbooks.length > 0 ? (
                                  pbooks.map((b, i) => {
                                    const img = getBookImage(b.name);
                                    const isChecked =
                                      !!pickChecked[bookKey(oid, i)];
                                    return (
                                      <button
                                        key={i}
                                        type="button"
                                        className={`pick-book${isChecked ? " checked" : ""}`}
                                        onClick={() => toggleBook(oid, i)}
                                        title={b.name}
                                      >
                                        <div className="pick-book-thumb">
                                          {img ? (
                                            <img
                                              src={img}
                                              alt={b.name}
                                              loading="lazy"
                                            />
                                          ) : (
                                            <div className="pick-book-ph">
                                              <Package size={20} />
                                            </div>
                                          )}
                                          {b.quantity > 1 && (
                                            <span className="pick-book-qty">
                                              ×{b.quantity}
                                            </span>
                                          )}
                                          <span className="pick-book-check">
                                            <Check size={18} />
                                          </span>
                                        </div>
                                        <span className="pick-book-name">
                                          {b.name}
                                        </span>
                                      </button>
                                    );
                                  })
                                ) : (
                                  <div className="pick-empty">
                                    No books listed
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {visible.length === 0 && (
                          <div className="pick-empty-state">
                            No orders in this view.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })()}

        {/* ===== Orders (accordion) ===== */}
        <Accordion
          id="orders"
          title="Orders"
          open={accOpen.orders}
          onToggle={toggleAcc}
          right={<span className="acc-count">{filteredOrders.length}</span>}
        >
        {filteredOrders.length > 0 ? (
          <div className="flex flex-col gap-12">
            <div className="orders-list-header">
              <span className="orders-count">
                {filteredOrders.length}{" "}
                {filteredOrders.length === 1 ? "Order" : "Orders"}
              </span>
            </div>
            <div className="admin-orders-grid">
            {filteredOrders.map((order, idx) => {
              const orderId = order["Order ID"];
              const books = order.parsedBooks || [];
              const pnl = order.pnl;
              const hasTracking =
                order.shippingId && String(order.shippingId).trim() !== "";
              const tinyUrl = order["TinyURL"];
              const hasTinyUrl = tinyUrl && String(tinyUrl).trim() !== "";
              const fullAddress = [
                order["Address"],
                order["City"],
                order["State"],
              ]
                .filter(Boolean)
                .join(", ");
              const addressLine = order["Pincode"]
                ? `${fullAddress} - ${order["Pincode"]}`
                : fullAddress;

              const isExpanded = false; // details now open in a slide-up modal
              const isPacked = !!packedOrders[orderId];

              return (
                <div
                  key={orderId || idx}
                  className={`admin-order-card mo-card${isPacked ? " packed" : ""}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setDetailOrder(order)}
                >
                  <div className="mo-card-top">
                    <div className="mo-card-id">
                      <div className="mo-name-row">
                        <span className="mo-srno">{idx + 1}</span>
                        <span className="mo-name">
                          {order["Customer Name"] || "—"}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="mo-meta"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(
                            String(order["Phone Number"] || ""),
                            `phone-${idx}`,
                          );
                        }}
                        title="Copy phone"
                      >
                        <Phone size={12} />
                        <span>+91 {order["Phone Number"]}</span>
                        {copiedId === `phone-${idx}` ? (
                          <Check size={12} className="text-green" />
                        ) : (
                          <Copy size={11} className="gray-500" />
                        )}
                      </button>
                      <button
                        type="button"
                        className="mo-meta"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(orderId, `order-${idx}`);
                        }}
                        title="Copy order ID"
                      >
                        <span className="mo-meta-label">Order</span>
                        <span>{orderId}</span>
                        {copiedId === `order-${idx}` ? (
                          <Check size={12} className="text-green" />
                        ) : (
                          <Copy size={11} className="gray-500" />
                        )}
                      </button>
                    </div>

                    {books.length > 0 && (
                      <div className="mo-stack">
                        {books.slice(0, 5).map((b, ci) => {
                          const img = getBookImage(b.name);
                          return (
                            <div
                              key={ci}
                              className="mo-stack-item"
                              style={{ zIndex: 20 - ci }}
                              title={`${b.name} × ${b.quantity}`}
                            >
                              {img ? (
                                <img src={img} alt={b.name} loading="lazy" />
                              ) : (
                                <div className="mo-stack-ph">
                                  <Package size={16} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="mo-card-desc">
                    <span className="mo-desc-item">
                      <Calendar size={11} />
                      {formatDate(order["Timestamp(D)"] || order["Timestamp"])}
                    </span>
                    <span className="aoc-dot">·</span>
                    <span className="mo-desc-status">{order.status}</span>
                    <span className="aoc-dot">·</span>
                    <span>
                      ₹{order.revenue.toLocaleString()} · {books.length} book
                      {books.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="mo-card-foot2">
                    <button
                      type="button"
                      className={`mo-pack-btn${isPacked ? " on" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePacked(orderId);
                      }}
                      title={isPacked ? "Packed" : "Mark as packed"}
                    >
                      {isPacked ? (
                        <>
                          <Check size={14} /> Packed
                        </>
                      ) : (
                        <>
                          <Package size={13} /> Mark as packed
                        </>
                      )}
                    </button>
                  </div>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="aoc-body">
                  <div className="aoc-section">
                    <div className="aoc-section-title">
                      <MapPin size={13} /> Shipping
                    </div>
                    {addressLine && (
                      <button
                        type="button"
                        className="aoc-rowline"
                        onClick={() => copyToClipboard(addressLine, `address-${idx}`)}
                        title="Copy address"
                      >
                        <span className="aoc-rowline-text">{addressLine}</span>
                        {copiedId === `address-${idx}` ? (
                          <Check size={13} className="text-green" />
                        ) : (
                          <Copy size={13} className="gray-500" />
                        )}
                      </button>
                    )}
                    {(hasTracking || hasTinyUrl) && (
                      <div className="aoc-track">
                        {hasTracking ? (
                          <span className="aoc-track-id">
                            Tracking: <strong>{order.shippingId}</strong>
                          </span>
                        ) : (
                          <span className="aoc-track-id">Order link ready</span>
                        )}
                        <div className="flex flex-row gap-8">
                          {hasTracking && (
                            <button
                              type="button"
                              className="track-btn-small flex flex-row items-center gap-4"
                              onClick={() => handleTrackPackage(order.shippingId)}
                            >
                              <Truck size={12} /> Track
                            </button>
                          )}
                          {hasTinyUrl && (
                            <button
                              type="button"
                              className="track-btn-small flex flex-row items-center gap-4"
                              onClick={() => window.open(tinyUrl, "_blank", "noopener,noreferrer")}
                            >
                              <ShoppingBag size={12} /> User bag <ExternalLink size={10} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="aoc-section">
                    <div className="aoc-section-title">
                      <MessageCircle size={13} /> WhatsApp the customer
                    </div>
                    <div className="aoc-wa-grid">
                      {waMessages(order).map((m) => (
                        <button
                          key={m.key}
                          type="button"
                          className="aoc-wa-btn"
                          title={m.text}
                          onClick={(e) => {
                            e.stopPropagation();
                            openWhatsApp(order["Phone Number"], m.text);
                          }}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="aoc-section">
                    <div className="aoc-section-title">
                      <Package size={13} /> Items ({books.length})
                    </div>
                    <div className="aoc-books-row">
                      {books.length > 0 ? (
                        books.map((b, bi) => {
                          const img = getBookImage(b.name);
                          return (
                            <div key={bi} className="aoc-book">
                              <div className="aoc-book-thumb">
                                {img ? (
                                  <img
                                    src={img}
                                    alt={b.name}
                                    className="aoc-book-img"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="aoc-book-ph">
                                    <Package size={20} />
                                  </div>
                                )}
                                {b.quantity > 1 && (
                                  <span className="aoc-book-qty">×{b.quantity}</span>
                                )}
                              </div>
                              <span className="aoc-book-name" title={b.name}>
                                {b.name}
                              </span>
                              <span className="aoc-book-price">
                                {b.total > 0
                                  ? `₹${b.total}`
                                  : b.price > 0
                                    ? `₹${b.price}`
                                    : "—"}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="aoc-book aoc-book-empty">
                          Books not listed
                        </div>
                      )}
                    </div>
                    {(order["Delivery Charge"] > 0 ||
                      order["Gift Wrap"] === "Yes" ||
                      order["Offer Applied"]) && (
                      <div className="aoc-extras">
                        {order["Delivery Charge"] > 0 && (
                          <span className="aoc-extra">Delivery +₹{order["Delivery Charge"]}</span>
                        )}
                        {order["Gift Wrap"] === "Yes" && (
                          <span className="aoc-extra">
                            <Gift size={11} /> Gift wrap +₹{order["Gift Wrap Charge"] || 0}
                          </span>
                        )}
                        {order["Offer Applied"] && (
                          <span className="aoc-extra">Offer: {order["Offer Applied"]}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="aoc-money">
                    <div className="aoc-money-cell">
                      <span>Revenue</span>
                      <strong>₹{order.revenue.toLocaleString()}</strong>
                    </div>
                    <div className="aoc-money-cell">
                      <span>Cost</span>
                      <strong>₹{order.totalCost.toLocaleString()}</strong>
                    </div>
                    <div className={`aoc-money-cell ${pnl >= 0 ? "pos" : "neg"}`}>
                      <span>Profit</span>
                      <strong>
                        {pnl >= 0 ? "+" : "−"}₹{Math.abs(pnl).toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  <div className="aoc-foot">
                    <div className="aoc-meta">
                      <span>{order["Payment Type"] || "—"}</span>
                      <span className="aoc-dot">·</span>
                      <span>{order["Delivery Type"] || "—"}</span>
                    </div>
                    <button
                      type="button"
                      className="aoc-edit"
                      onClick={() => openEditModal(order)}
                    >
                      <Edit size={14} /> Edit
                    </button>
                  </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
            </div>
          </div>
        ) : (
          <div className="error-state">
            <div className="error-icon">📭</div>
            <p>No orders found</p>
            <span className="font-12 gray-500">
              Try adjusting your search or filters
            </span>
          </div>
        )}
        </Accordion>
      </div>

      {/* ===== Order detail modal (slide-up, bill-modal style) ===== */}
      <AnimatePresence>
        {detailOrder &&
          (() => {
            const order = detailOrder;
            const oid = order["Order ID"];
            const dbooks = order.parsedBooks || [];
            const dpnl = order.pnl;
            const dHasTracking =
              order.shippingId && String(order.shippingId).trim() !== "";
            const dTiny = order["TinyURL"];
            const dHasTiny = dTiny && String(dTiny).trim() !== "";
            const dAddr = [order["Address"], order["City"], order["State"]]
              .filter(Boolean)
              .join(", ");
            const dAddrLine = order["Pincode"]
              ? `${dAddr} - ${order["Pincode"]}`
              : dAddr;
            const dPacked = !!packedOrders[oid];
            return (
              <motion.div
                className="bill-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDetailOrder(null)}
              >
                <motion.div
                  className="bill-modal"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ maxWidth: "680px" }}
                >
                  <div className="bill-header">
                    <div className="flex flex-col">
                      <span className="weight-600 font-16">
                        {order["Customer Name"] || "Order"}
                      </span>
                      <span className="font-12 gray-500">{oid}</span>
                    </div>
                    <span
                      className="cursor-pointer"
                      onClick={() => setDetailOrder(null)}
                    >
                      <X size={16} />
                    </span>
                  </div>

                  <div
                    className="address-form-content"
                    style={{ maxHeight: "72vh", overflowY: "auto" }}
                  >
                    <div className="mo-modal-status">
                      <div
                        className={`order-status-badge ${getStatusColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        <span>{order.status}</span>
                      </div>
                      <span className="aoc-rev-pill">
                        ₹{order.revenue.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        className={`mo-pack-btn lg${dPacked ? " on" : ""}`}
                        onClick={() => togglePacked(oid)}
                      >
                        {dPacked ? (
                          <>
                            <Check size={16} /> Packed
                          </>
                        ) : (
                          <>
                            <Package size={16} /> Mark as packed
                          </>
                        )}
                      </button>
                    </div>

                    <div className="aoc-chips" style={{ marginTop: 12 }}>
                      <button
                        type="button"
                        className="aoc-chip"
                        onClick={() =>
                          copyToClipboard(order["Customer Name"] || "", "m-name")
                        }
                        title="Copy name"
                      >
                        <User size={13} />
                        <span>{order["Customer Name"] || "—"}</span>
                        {copiedId === "m-name" ? (
                          <Check size={12} className="text-green" />
                        ) : (
                          <Copy size={12} className="gray-500" />
                        )}
                      </button>
                      <button
                        type="button"
                        className="aoc-chip"
                        onClick={() =>
                          copyToClipboard(
                            String(order["Phone Number"] || ""),
                            "m-phone",
                          )
                        }
                        title="Copy phone"
                      >
                        <Phone size={13} />
                        <span>+91 {order["Phone Number"]}</span>
                        {copiedId === "m-phone" ? (
                          <Check size={12} className="text-green" />
                        ) : (
                          <Copy size={12} className="gray-500" />
                        )}
                      </button>
                    </div>

                    <div className="aoc-section">
                      <div className="aoc-section-title">
                        <MapPin size={13} /> Shipping
                      </div>
                      {dAddrLine && (
                        <button
                          type="button"
                          className="aoc-rowline"
                          onClick={() => copyToClipboard(dAddrLine, "m-addr")}
                          title="Copy address"
                        >
                          <span className="aoc-rowline-text">{dAddrLine}</span>
                          {copiedId === "m-addr" ? (
                            <Check size={13} className="text-green" />
                          ) : (
                            <Copy size={13} className="gray-500" />
                          )}
                        </button>
                      )}
                      {(dHasTracking || dHasTiny) && (
                        <div className="aoc-track">
                          {dHasTracking ? (
                            <span className="aoc-track-id">
                              Tracking: <strong>{order.shippingId}</strong>
                            </span>
                          ) : (
                            <span className="aoc-track-id">Order link ready</span>
                          )}
                          <div className="flex flex-row gap-8">
                            {dHasTracking && (
                              <button
                                type="button"
                                className="track-btn-small flex flex-row items-center gap-4"
                                onClick={() =>
                                  handleTrackPackage(order.shippingId)
                                }
                              >
                                <Truck size={12} /> Track
                              </button>
                            )}
                            {dHasTiny && (
                              <button
                                type="button"
                                className="track-btn-small flex flex-row items-center gap-4"
                                onClick={() =>
                                  window.open(
                                    dTiny,
                                    "_blank",
                                    "noopener,noreferrer",
                                  )
                                }
                              >
                                <ShoppingBag size={12} /> User bag{" "}
                                <ExternalLink size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="aoc-section">
                      <div className="aoc-section-title">
                        <MessageCircle size={13} /> WhatsApp the customer
                      </div>
                      <div className="aoc-wa-grid">
                        {waMessages(order).map((m) => (
                          <button
                            key={m.key}
                            type="button"
                            className="aoc-wa-btn"
                            title={m.text}
                            onClick={() =>
                              openWhatsApp(order["Phone Number"], m.text)
                            }
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="aoc-section">
                      <div className="aoc-section-title">
                        <Package size={13} /> Items ({dbooks.length})
                      </div>
                      <div className="aoc-books-row">
                        {dbooks.length > 0 ? (
                          dbooks.map((b, bi) => {
                            const img = getBookImage(b.name);
                            return (
                              <div key={bi} className="aoc-book">
                                <div className="aoc-book-thumb">
                                  {img ? (
                                    <img
                                      src={img}
                                      alt={b.name}
                                      className="aoc-book-img"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="aoc-book-ph">
                                      <Package size={20} />
                                    </div>
                                  )}
                                  {b.quantity > 1 && (
                                    <span className="aoc-book-qty">
                                      ×{b.quantity}
                                    </span>
                                  )}
                                </div>
                                <span className="aoc-book-name" title={b.name}>
                                  {b.name}
                                </span>
                                <span className="aoc-book-price">
                                  {b.total > 0
                                    ? `₹${b.total}`
                                    : b.price > 0
                                      ? `₹${b.price}`
                                      : "—"}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="aoc-book aoc-book-empty">
                            Books not listed
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="aoc-money">
                      <div className="aoc-money-cell">
                        <span>Revenue</span>
                        <strong>₹{order.revenue.toLocaleString()}</strong>
                      </div>
                      <div className="aoc-money-cell">
                        <span>Cost</span>
                        <strong>₹{order.totalCost.toLocaleString()}</strong>
                      </div>
                      <div
                        className={`aoc-money-cell ${dpnl >= 0 ? "pos" : "neg"}`}
                      >
                        <span>Profit</span>
                        <strong>
                          {dpnl >= 0 ? "+" : "−"}₹
                          {Math.abs(dpnl).toLocaleString()}
                        </strong>
                      </div>
                    </div>

                    <div className="aoc-foot">
                      <div className="aoc-meta">
                        <span>{order["Payment Type"] || "—"}</span>
                        <span className="aoc-dot">·</span>
                        <span>{order["Delivery Type"] || "—"}</span>
                      </div>
                      <button
                        type="button"
                        className="aoc-edit"
                        onClick={() => {
                          setDetailOrder(null);
                          openEditModal(order);
                        }}
                      >
                        <Edit size={14} /> Edit
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
      </AnimatePresence>

      {/* Add/Edit Modal, kept as-is, uses existing bill-modal classes */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
            }}
          >
            <motion.div
              className="bill-modal"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "750px" }}
            >
              <div className="bill-header">
                <span className="weight-600 font-16">
                  {showEditModal ? "Edit Order" : "Add New Order"}
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                >
                  <X size={16} />
                </span>
              </div>

              <div
                className="address-form-content"
                style={{ maxHeight: "70vh", overflowY: "auto" }}
              >
                <div className="input-group">
                  <label>Order ID</label>
                  <input
                    type="text"
                    name="orderId"
                    className="sec-mid-btn width100"
                    placeholder="Auto-generated"
                    value={formData.orderId}
                    onChange={handleInputChange}
                    readOnly={showEditModal}
                    disabled={showEditModal}
                  />
                </div>

                <h4 className="font-14 weight-600 mb-12 mt-16">
                  Customer Details
                </h4>
                <div className="flex flex-row gap-12">
                  <div className="input-group flex-1">
                    <label>
                      Customer Name <span className="red">*</span>
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      className="sec-mid-btn width100"
                      placeholder="Enter customer name"
                      value={formData.customerName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="input-group flex-1">
                    <label>
                      Phone Number <span className="red">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      className="sec-mid-btn width100"
                      placeholder="10-digit number"
                      maxLength="10"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Address</label>
                  <textarea
                    name="address"
                    className="sec-mid-btn textarea"
                    placeholder="House no, street, landmark..."
                    rows={2}
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex flex-row gap-12">
                  <div className="input-group flex-1">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      className="sec-mid-btn width100"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="input-group flex-1">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      className="sec-mid-btn width100"
                      value={formData.state}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="input-group flex-1">
                    <label>Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      className="sec-mid-btn width100"
                      maxLength="6"
                      value={formData.pincode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="dashed-border my-16"></div>

                <h4 className="font-14 weight-600 mb-12">Order Details</h4>
                <div className="input-group">
                  <label>Books List</label>
                  <textarea
                    name="booksList"
                    className="sec-mid-btn textarea"
                    placeholder="1. Book Name | Qty: X | ₹Price each | Total: ₹XXX"
                    rows={4}
                    value={formData.booksList}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex flex-row gap-12">
                  <div className="input-group flex-1">
                    <label>Total Amount (₹)</label>
                    <input
                      type="number"
                      name="totalAmount"
                      className="sec-mid-btn width100"
                      value={formData.totalAmount}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="input-group flex-1">
                    <label>Payment Type</label>
                    <select
                      name="paymentType"
                      className="sec-mid-btn width100"
                      value={formData.paymentType}
                      onChange={handleInputChange}
                    >
                      <option value="">Select</option>
                      <option value="COD">Cash on Delivery</option>
                      <option value="UPI Payment">UPI Payment</option>
                      <option value="Card Payment">Card Payment</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-row gap-12">
                  <div className="input-group flex-1">
                    <label>Delivery Type</label>
                    <input
                      type="text"
                      name="deliveryType"
                      className="sec-mid-btn width100"
                      placeholder="Standard/Faster Delivery"
                      value={formData.deliveryType}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="input-group flex-1">
                    <label>Delivery Charge (₹)</label>
                    <input
                      type="number"
                      name="deliveryCharge"
                      className="sec-mid-btn width100"
                      value={formData.deliveryCharge}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="flex flex-row gap-12">
                  <div className="input-group flex-1">
                    <label>Gift Wrap</label>
                    <select
                      name="giftWrap"
                      className="sec-mid-btn width100"
                      value={formData.giftWrap}
                      onChange={handleInputChange}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                  <div className="input-group flex-1">
                    <label>Gift Wrap Charge (₹)</label>
                    <input
                      type="number"
                      name="giftWrapCharge"
                      className="sec-mid-btn width100"
                      value={formData.giftWrapCharge}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="flex flex-row gap-12">
                  <div className="input-group flex-1">
                    <label>Offer Applied</label>
                    <input
                      type="text"
                      name="offerApplied"
                      className="sec-mid-btn width100"
                      placeholder="e.g. ₹100 OFF"
                      value={formData.offerApplied}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="input-group flex-1">
                    <label>Order Status</label>
                    <select
                      name="orderStatus"
                      className="sec-mid-btn width100"
                      value={formData.orderStatus}
                      onChange={handleInputChange}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="input-group mt-8">
                  <label className="flex flex-row gap-4 items-center">
                    <Truck size={14} />
                    Shipping / Tracking ID{" "}
                    <span className="orange">(Recommended)</span>
                  </label>
                  <input
                    type="text"
                    name="shippingId"
                    className="sec-mid-btn width100"
                    placeholder="e.g. CM160465548IN or tracking number"
                    value={formData.shippingId}
                    onChange={handleInputChange}
                  />
                  <span className="font-10 gray-500 mt-4">
                    Add tracking ID to help customers track their orders
                  </span>
                </div>

                <div className="input-group">
                  <label>TinyURL</label>
                  <input
                    type="text"
                    name="tinyUrl"
                    className="sec-mid-btn width100"
                    placeholder="Order link"
                    value={formData.tinyUrl}
                    onChange={handleInputChange}
                  />
                </div>

                {showEditModal && formData.timestamp && (
                  <div className="info-message mt-16 flex flex-row gap-8 items-center">
                    <Calendar size={14} />
                    <span className="font-12">
                      Original order date: {formatDate(formData.timestamp)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-row gap-12 p-20 border-t border-gray-200">
                <button
                  className="pri-big-btn flex-1"
                  onClick={showEditModal ? handleEditOrder : handleAddOrder}
                >
                  {showEditModal ? "Update Order" : "Add Order"}
                </button>
                <button
                  className="sec-mid-btn"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
