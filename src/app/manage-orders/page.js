// app/manage-orders/page.js
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  downloadCombinedFormPNG,
  downloadCombinedFormsPNGs,
  downloadCombinedFormsPDF,
} from "@/utils/shippingForms";
import {
  Search,
  Download,
  Plus,
  Edit,
  X,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  SlidersHorizontal,
  RefreshCw,
  Filter,
  Truck,
  Package,
  IndianRupee,
  Calendar,
  MapPin,
  AlertCircle,
  User,
  Copy,
  Check,
  CheckCircle,
  Clock,
  Gift,
  ShieldCheck,
  ArrowLeft,
  Bell,
  Trash2,
  ExternalLink,
  ShoppingBag,
  ChevronDown,
  ArrowUpDown,
  Phone,
  TrendingUp,
  TrendingDown,
  BarChart3,
  AreaChart,
  MessageCircle,
  StickyNote,
  Send,
  LayoutGrid,
  List,
  Wallet,
  Pin,
  Pencil,
  MoreVertical,
  Calculator,
  Delete,
  Moon,
  Sun,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
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
  BOOK_IMAGE_BY_NAME[
    String(name || "")
      .trim()
      .toLowerCase()
  ] || null;

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
  const tracking = String(
    order?.shippingId || order?.["Shipping ID"] || "",
  ).trim();
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
    {
      key: "received",
      label: "📥 Received order",
      text: `${hi}, this is TheBookX 📚\n\nWe've *received your order*${id}. It will be *shipped within 1–2 days*, and your tracking ID will be shared here as soon as it's dispatched.\n\nThank you for shopping with us! 💛${profileLine}`,
    },
    {
      key: "unable",
      label: "⚠️ Unable to ship",
      text: `${hi}, this is TheBookX 📚\n\nWe tried to process your order${id}, but it *couldn't be shipped successfully* due to a mismatch in the *address or phone number* provided.\n\nPlease share your *correct full address (with pincode) and a reachable phone number* so we can dispatch it right away.${profileLine}`,
    },
    {
      key: "verify",
      label: "📍 Ask details checkup",
      text: `${hi}, this is TheBookX 📚\n\nBefore we ship your order${id}, could you please *re-check your delivery details*? The current address/number provided may *not be sufficient for successful delivery*.\n\nKindly reply with your *complete address, landmark, pincode and an active phone number* so your books reach you safely. 🙏${profileLine}`,
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

// OPTIONAL: Google Apps Script Web App URL that can UPDATE / DELETE rows in the
// sheet in place (edits without adding a new row). Deploy the script in
// docs/sheet-edit-apps-script.gs and paste its /exec URL here. Leave empty to
// keep the old append-on-edit behaviour.
const SHEET_EDIT_API_URL =
  "https://script.google.com/macros/s/AKfycbw_MWJJmtGxukgHqNcoSTP-RRQONykYHLqgBYs2K8GfkuqSDmRmP3gVNAthKDWgVY5-Pw/exec";

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

// Fast name → book lookup (for genre/category attribution of order items).
const BOOK_BY_NAME = {};
ALL_BOOKS.forEach((b) => {
  if (b?.name) BOOK_BY_NAME[b.name.toLowerCase().trim()] = b;
});

// India Post weight-slab delivery charge (grams → ₹). Extend the top slab
// as needed for parcels heavier than 4kg.
const indiaPostDeliveryCost = (grams) => {
  const g = Number(grams) || 0;
  if (g <= 500) return 42;
  if (g <= 1000) return 62;
  if (g <= 1500) return 100;
  if (g <= 2000) return 150;
  if (g <= 4000) return 200;
  return 200; // >4kg — adjust if you add heavier slabs
};

// Derive real economics for an order from its parsed book lines, sourcing
// per-book cost + weight from the catalogue (matched by name). Returns the
// cost of goods, total parcel weight (g), and the resulting India Post cost.
const orderEconomics = (parsedBooks = []) => {
  let booksCost = 0;
  let weight = 0;
  let matched = 0;
  let unmatched = 0;
  parsedBooks.forEach((line) => {
    const qty = Number(line.quantity) || 1;
    const b = BOOK_BY_NAME[String(line.name || "").toLowerCase().trim()];
    if (b) {
      matched += 1;
      booksCost += (Number(b.cost) || 0) * qty;
      weight += (Number(b.weight) || 0) * qty;
    } else {
      unmatched += 1;
    }
  });
  const deliveryCost = indiaPostDeliveryCost(weight);
  return { booksCost, weight, deliveryCost, matched, unmatched };
};
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Toggleable analytics sections (Customize panel).
// Top-level page sections for the scrollable navigation tabs.
const SECTION_TABS = [
  { key: "analytics", label: "Analytics" },
  { key: "calendar", label: "Orders calendar" },
  { key: "indiapost", label: "India Post booking" },
  { key: "orders", label: "Orders" },
];

const ANALYTICS_SECTIONS = [
  { key: "kpis", label: "Summary cards" },
  { key: "profitCost", label: "Profit & cost" },
  { key: "deliveryCost", label: "Delivery cost (India Post)" },
  { key: "dailyVolume", label: "Daily order volume" },
  { key: "ordersByStatus", label: "Orders by status" },
  { key: "valueByStatus", label: "Order value by status" },
  { key: "topBooks", label: "Top-selling books" },
  { key: "categoryRevenue", label: "Revenue by category" },
  { key: "paymentMix", label: "Payment mix" },
  { key: "weekday", label: "Busiest weekdays" },
  { key: "hours", label: "Peak order hours" },
  { key: "pincodes", label: "Top delivery pincodes" },
  { key: "runRate", label: "Yearly run-rate" },
  { key: "health", label: "Operational health" },
  { key: "cancelled", label: "Cancelled orders & losses" },
];

// Reusable horizontal progress bars (top books, categories, pincodes …)
function HBars({ items, accent = "var(--tertiary, #fb8500)" }) {
  if (!items || items.length === 0) {
    return <div className="sv-empty">No data in this period.</div>;
  }
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="ins-bars">
      {items.map((it, i) => (
        <div className="ins-row" key={i}>
          <span className="ins-label" title={it.label}>
            {it.label}
          </span>
          <div className="ins-track">
            <div
              className="ins-fill"
              style={{
                width: `${(it.value / max) * 100}%`,
                background: it.color || accent,
              }}
            />
          </div>
          <span className="ins-val">{it.display}</span>
        </div>
      ))}
    </div>
  );
}

// Reusable vertical column bars (weekday, hour-of-day …)
function ColBars({ cols, accent = "var(--tertiary, #fb8500)", showValues = true }) {
  const max = Math.max(1, ...cols.map((c) => c.value));
  return (
    <div className="ins-cols">
      {cols.map((c, i) => (
        <div
          key={i}
          className="ins-col"
          title={`${c.hint || c.label}: ${c.value}`}
        >
          <div className="ins-col-track">
            <div
              className="ins-col-fill"
              style={{ height: `${(c.value / max) * 100}%`, background: accent }}
            >
              {showValues && c.value > 0 && (
                <span className="ins-col-v">{c.value}</span>
              )}
            </div>
          </div>
          <span className="ins-col-lbl">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

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
    setCalMonth(({ y, m }) =>
      m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 },
    );
  const next = () =>
    setCalMonth(({ y, m }) =>
      m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 },
    );

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
        <button
          type="button"
          className="oc-nav"
          onClick={prev}
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="oc-title">
          <span className="oc-month">{monthLabel}</span>
          <span className="oc-total">{monthTotal} orders this month</span>
        </div>
        <button
          type="button"
          className="oc-nav"
          onClick={next}
          aria-label="Next month"
        >
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
          const inRange =
            dateFrom && dateTo && key >= dateFrom && key <= dateTo;
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
// Small bar/area switch shown in the top-right of a chart frame.
function ChartTypeToggle({ mode, setMode }) {
  return (
    <div className="chart-type-toggle">
      <button
        type="button"
        className={`ctt-btn${mode === "bar" ? " on" : ""}`}
        onClick={() => setMode("bar")}
        title="Bar chart"
        aria-label="Bar chart"
      >
        <BarChart3 size={14} />
      </button>
      <button
        type="button"
        className={`ctt-btn${mode === "area" ? " on" : ""}`}
        onClick={() => setMode("area")}
        title="Area chart"
        aria-label="Area chart"
      >
        <AreaChart size={14} />
      </button>
    </div>
  );
}

function DailyVolumeChart({ ordersByDay, days = 14 }) {
  const [mode, setMode] = useState("area");
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
      <div className="wk-head">
        <div className="chart-title">
          Daily order volume
          <span className="vol-sub">
            {total} orders · peak {peak}/day · last {days} days
          </span>
        </div>
        <ChartTypeToggle mode={mode} setMode={setMode} />
      </div>
      {mode === "bar" ? (
        <div className="vol-bars">
          {series.map((s, i) => (
            <div
              key={i}
              className="vol-bcol"
              title={`${fmt(s.d)} · ${s.count}`}
            >
              <div className="vol-btrack">
                {s.count > 0 && <span className="vol-bnum">{s.count}</span>}
                <div
                  className="vol-bfill"
                  style={{ height: `${(s.count / max) * 100}%` }}
                />
              </div>
              <span className="vol-bx">
                {i % 2 === 0 || i === n - 1 ? fmt(s.d) : ""}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <svg className="vol-svg" viewBox={`0 0 ${W} ${H}`} role="img">
          <defs>
            <linearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(10,143,12,0.32)" />
              <stop offset="100%" stopColor="rgba(10,143,12,0)" />
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
            stroke="var(--success,#0a8f0c)"
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
                    stroke="var(--success,#0a8f0c)"
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
      )}
    </div>
  );
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Reusable collapsible accordion section.
// ── India Post copy-paste helpers ──────────────────────────────────────────
// Strip anything the portal rejects (special chars) and collapse whitespace.
function ipSanitize(s) {
  return String(s || "")
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
// Break a sanitised string into <=`size`-char chunks at word boundaries.
function ipChunks(s, size = 30) {
  const words = ipSanitize(s).split(" ").filter(Boolean);
  const out = [];
  let cur = "";
  for (let w of words) {
    // hard-split any single word longer than the limit
    while (w.length > size) {
      if (cur) {
        out.push(cur);
        cur = "";
      }
      out.push(w.slice(0, size));
      w = w.slice(size);
    }
    if (!cur) cur = w;
    else if ((cur + " " + w).length <= size) cur += " " + w;
    else {
      out.push(cur);
      cur = w;
    }
  }
  if (cur) out.push(cur);
  return out;
}

// One field row: label + value + copy icon (India Post booking sheet).
function IpField({ label, value, hint, id, copiedId, onCopy }) {
  const has = value !== undefined && value !== null && String(value) !== "";
  return (
    <div className="ip-field">
      <span className="ip-field-label">{label}</span>
      {has ? (
        <span className="ip-field-val">{value}</span>
      ) : (
        <span className="ip-field-hint">{hint || "—"}</span>
      )}
      {has && (
        <button
          type="button"
          className="ip-copy"
          title="Copy"
          aria-label={`Copy ${label}`}
          onClick={() => onCopy(String(value), id)}
        >
          {copiedId === id ? <Check size={13} /> : <Copy size={13} />}
        </button>
      )}
    </div>
  );
}

// Per-order copy-paste block, ordered exactly like the India Post form flow.
function IndiaPostSheet({ orders, copyToClipboard, copiedId }) {
  const shipping = (orders || []).filter((o) =>
    /getting shipped/i.test(o["Order Status"] || ""),
  );
  if (!shipping.length)
    return <p className="ip-empty">No “Getting Shipped” orders right now.</p>;
  return (
    <div className="ip-sheet">
      <div className="ip-note">
        <b>Same for every parcel:</b> Drop-off pincode <b>400017</b> → pick{" "}
        <b>Dharavi Road S.O</b> · after typing weight choose the lowest rate (
        <b>India Post Parcel Retail</b>) · Mail Shape ={" "}
        <b>Box Type (Non Roll Form)</b> · Delivery Type = <b>Normal Delivery</b>.
      </div>
      {shipping.map((o, i) => {
        const books = (o.parsedBooks || []).length || 1;
        const isCOD = /cash|cod/i.test(o["Payment Type"] || "");
        const amount = o["Total Amount"] || o.revenue || "";
        const chunks = ipChunks(o["Address"]);
        const name = ipSanitize(o["Customer Name"]).slice(0, 30);
        const line1 = chunks[0] || "";
        const line2 = chunks[1] || "";
        const landmark = chunks[2] || "";
        const extras = chunks.slice(3);
        const key = (k) => `ip-${i}-${k}`;
        return (
          <div className="ip-order" key={o["Order ID"] || i}>
            <div className="ip-order-head">
              <span className="ip-order-sr">{i + 1}</span>
              <span className="ip-order-name">
                {o["Customer Name"] || "—"}
              </span>
              <span className={`ip-tag ${isCOD ? "cod" : "prepaid"}`}>
                {isCOD ? `COD ₹${amount}` : "Prepaid — no COD"}
              </span>
            </div>
            <div className="ip-fields">
              <div className="ip-step">1 · Article details</div>
              <IpField
                label="Destination Pincode"
                value={o["Pincode"]}
                id={key("pin1")}
                copiedId={copiedId}
                onCopy={copyToClipboard}
              />
              <IpField
                label="Physical Weight (gms)"
                value="500"
                id={key("wt")}
                copiedId={copiedId}
                onCopy={copyToClipboard}
              />
              <div className="ip-step">2 · Parcel size (Box Type)</div>
              <IpField
                label="Length (cms)"
                value="22"
                id={key("len")}
                copiedId={copiedId}
                onCopy={copyToClipboard}
              />
              <IpField
                label="Width (cms)"
                value="13"
                id={key("wid")}
                copiedId={copiedId}
                onCopy={copyToClipboard}
              />
              <IpField
                label={`Height (cms) · ${books} book${books > 1 ? "s" : ""}`}
                value={String(books)}
                id={key("ht")}
                copiedId={copiedId}
                onCopy={copyToClipboard}
              />
              <div className="ip-step">3 · Payment</div>
              {isCOD ? (
                <IpField
                  label="COD Retail amount (₹)"
                  value={String(amount)}
                  id={key("cod")}
                  copiedId={copiedId}
                  onCopy={copyToClipboard}
                />
              ) : (
                <IpField
                  label="COD"
                  hint="Prepaid — leave COD unchecked"
                />
              )}
              <div className="ip-step">4 · Receiver details</div>
              <IpField
                label="Name"
                value={name}
                id={key("name")}
                copiedId={copiedId}
                onCopy={copyToClipboard}
              />
              <IpField
                label="Mobile"
                value={o["Phone Number"]}
                id={key("mob")}
                copiedId={copiedId}
                onCopy={copyToClipboard}
              />
              <IpField
                label="Address Line 1"
                value={line1}
                id={key("a1")}
                copiedId={copiedId}
                onCopy={copyToClipboard}
              />
              <IpField
                label="Address Line 2"
                value={line2}
                id={key("a2")}
                copiedId={copiedId}
                onCopy={copyToClipboard}
              />
              <IpField
                label="Landmark"
                value={landmark}
                id={key("lm")}
                copiedId={copiedId}
                onCopy={copyToClipboard}
              />
              {extras.map((c, ci) => (
                <IpField
                  key={ci}
                  label={`Address extra ${ci + 1}`}
                  value={c}
                  id={key(`ax${ci}`)}
                  copiedId={copiedId}
                  onCopy={copyToClipboard}
                />
              ))}
              <IpField
                label="City"
                value={o["City"]}
                id={key("city")}
                copiedId={copiedId}
                onCopy={copyToClipboard}
              />
              <IpField
                label="State"
                value={o["State"]}
                id={key("state")}
                copiedId={copiedId}
                onCopy={copyToClipboard}
              />
              <IpField
                label="Pincode"
                value={o["Pincode"]}
                id={key("pin2")}
                copiedId={copiedId}
                onCopy={copyToClipboard}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Accordion({ id, title, icon, open, onToggle, right, children }) {
  return (
    <div className="acc" id={`acc-${id}`}>
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

// ── Loading screen with rotating, learnable tips ──
const LOADING_TIPS = [
  "Confirming a COD order within 2 hours noticeably reduces cancellations.",
  "Tip: bundle combos lift your average order value — push them on slow days.",
  "Orders marked “Getting Shipped” should get a tracking ID the same day.",
  "Reader insight: self-help and romance are our fastest-moving genres.",
  "Add a tracking ID early — customers who can track rarely raise a ticket.",
  "Prepaid (UPI) orders settle faster and carry zero COD handling cost.",
  "Watch your run-rate: a steady orders/day trend beats one-off spikes.",
  "Dispatch before the daily courier cut-off to shorten delivery time.",
];

function OrdersLoader() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setI((p) => (p + 1) % LOADING_TIPS.length),
      2000,
    );
    return () => clearInterval(t);
  }, []);
  return (
    <div className="my-orders-page">
      <div className="section-1200 p-40">
        <div className="orders-loader">
          <div className="loading-spinner"></div>
          <p className="orders-loader-title">Loading your orders…</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={i}
              className="orders-loader-tip"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              💡 {LOADING_TIPS[i]}
            </motion.p>
          </AnimatePresence>
          <div className="orders-loader-dots">
            {LOADING_TIPS.map((_, d) => (
              <span key={d} className={d === i ? "on" : ""} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Profit vs Cost stacked bars (day / week / month) with money stats ──
function ProfitCostChart({ orders, period = "month", offset = 0 }) {
  const [hover, setHover] = useState(null);
  const [mode, setMode] = useState("area"); // "area" | "bar"
  // Reference date shifts with the period navigation so the trailing
  // buckets end at the selected day / week / month.
  const realNow = new Date();
  const now = new Date(realNow);
  if (period === "day") now.setDate(realNow.getDate() + offset);
  else if (period === "week") now.setDate(realNow.getDate() + offset * 7);
  else if (period === "month") now.setMonth(realNow.getMonth() + offset);
  const MON = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const fmt = (d) => `${d.getDate()}/${d.getMonth() + 1}`;

  const dayAgg = {};
  const monthAgg = {};
  let earliest = null;
  const blank = () => ({ rev: 0, cost: 0, n: 0, qty: 0 });
  orders.forEach((o) => {
    const d = getOrderDate(o);
    if (!d) return;
    if (!earliest || d < earliest) earliest = d;
    const rev = o.revenue || 0;
    const cost = o.totalCost || 0;
    const qty = (o.parsedBooks || []).reduce(
      (s, b) => s + (b.quantity || 1),
      0,
    );
    const dk = dayKey(d);
    dayAgg[dk] = dayAgg[dk] || blank();
    dayAgg[dk].rev += rev;
    dayAgg[dk].cost += cost;
    dayAgg[dk].n += 1;
    dayAgg[dk].qty += qty;
    const mk = `${d.getFullYear()}-${d.getMonth()}`;
    monthAgg[mk] = monthAgg[mk] || blank();
    monthAgg[mk].rev += rev;
    monthAgg[mk].cost += cost;
    monthAgg[mk].n += 1;
    monthAgg[mk].qty += qty;
  });

  // Helper: sum day-level aggregates across a date range [start, end]
  const sumDays = (start, end) => {
    const acc = blank();
    const d = new Date(start);
    while (d <= end) {
      const a = dayAgg[dayKey(d)];
      if (a) {
        acc.rev += a.rev;
        acc.cost += a.cost;
        acc.n += a.n;
        acc.qty += a.qty;
      }
      d.setDate(d.getDate() + 1);
    }
    return acc;
  };

  // Bucketing drills down with the global period tab:
  //   Day   → the days of the selected week's context (last 14 days)
  //   Week  → the 7 days (Mon–Sun) of the selected week
  //   Month → each week within the selected month
  //   All   → every month (horizontally scrollable)
  let cols = [];
  let granularityLabel = "";
  if (period === "day") {
    granularityLabel = "last 14 days";
    for (let k = 13; k >= 0; k--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - k);
      const a = dayAgg[dayKey(d)] || blank();
      cols.push({ ...a, label: String(d.getDate()), hint: fmt(d) });
    }
  } else if (period === "week") {
    // The 7 days of the selected week
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dow = (base.getDay() + 6) % 7;
    const weekStart = new Date(base);
    weekStart.setDate(base.getDate() - dow);
    const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    granularityLabel = `${fmt(weekStart)} – ${fmt(weekEnd)}`;
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const a = dayAgg[dayKey(d)] || blank();
      cols.push({ ...a, label: DAYS[i], hint: fmt(d) });
    }
  } else if (period === "month") {
    // Each week within the selected month
    const y = now.getFullYear();
    const m = now.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    granularityLabel = `weeks of ${MON[m]} ${y}`;
    let w = 1;
    for (let startDay = 1; startDay <= daysInMonth; startDay += 7, w++) {
      const endDay = Math.min(startDay + 6, daysInMonth);
      const start = new Date(y, m, startDay);
      const end = new Date(y, m, endDay);
      const acc = sumDays(start, end);
      cols.push({
        ...acc,
        label: `W${w}`,
        hint: `${startDay}–${endDay} ${MON[m]}`,
      });
    }
  } else {
    // All time → every month from the first order to now (scrollable)
    granularityLabel = "monthly · all time";
    const start = earliest
      ? new Date(earliest.getFullYear(), earliest.getMonth(), 1)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const cursor = new Date(start);
    while (
      cursor.getFullYear() < now.getFullYear() ||
      (cursor.getFullYear() === now.getFullYear() &&
        cursor.getMonth() <= now.getMonth())
    ) {
      const a =
        monthAgg[`${cursor.getFullYear()}-${cursor.getMonth()}`] || blank();
      cols.push({
        ...a,
        label: MON[cursor.getMonth()],
        hint: `${MON[cursor.getMonth()]} ${cursor.getFullYear()}`,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }

  cols = cols.map((c) => ({ ...c, profit: c.rev - c.cost }));
  const maxRev = Math.max(1, ...cols.map((c) => c.rev));

  // ── Area-chart geometry (Profit & Cost as two lines on a 0 baseline) ──
  const AW = 600;
  const AH = 210;
  const aPadTop = 18;
  const aPadBottom = 8;
  const aih = AH - aPadTop - aPadBottom;
  const nCols = cols.length || 1;
  const vMax = Math.max(1, ...cols.map((c) => Math.max(c.cost, c.profit)));
  const vMin = Math.min(0, ...cols.map((c) => c.profit));
  const vRange = vMax - vMin || 1;
  const ax = (i) => ((i + 0.5) / nCols) * AW;
  const ay = (v) => aPadTop + aih - ((v - vMin) / vRange) * aih;
  const aZero = ay(0);
  const linePts = (key) =>
    cols.map((c, i) => `${ax(i).toFixed(1)},${ay(c[key]).toFixed(1)}`).join(" ");
  const areaPath = (key) =>
    nCols === 0
      ? ""
      : `M ${ax(0).toFixed(1)},${aZero.toFixed(1)} ` +
        cols
          .map((c, i) => `L ${ax(i).toFixed(1)},${ay(c[key]).toFixed(1)}`)
          .join(" ") +
        ` L ${ax(nCols - 1).toFixed(1)},${aZero.toFixed(1)} Z`;
  const costLinePts = linePts("cost");
  const profitLinePts = linePts("profit");
  const costAreaD = areaPath("cost");
  const profitAreaD = areaPath("profit");

  const totRev = cols.reduce((s, c) => s + c.rev, 0);
  const totCost = cols.reduce((s, c) => s + c.cost, 0);
  const totProfit = totRev - totCost;
  const margin = totRev > 0 ? Math.round((totProfit / totRev) * 100) : 0;
  const totOrders = cols.reduce((s, c) => s + (c.n || 0), 0);
  const totQty = cols.reduce((s, c) => s + (c.qty || 0), 0);

  return (
    <div className="admin-chart-card pc-card">
      <div className="wk-head">
        <div className="chart-title">
          Profit &amp; cost <span className="vol-sub">{granularityLabel}</span>
        </div>
        <div className="wk-head-right">
          <div className="pc-legend">
            <span>
              <i className="pc-dot pc-dot-cost" /> Cost
            </span>
            <span>
              <i className="pc-dot pc-dot-profit" /> Profit
            </span>
          </div>
          <ChartTypeToggle mode={mode} setMode={setMode} />
        </div>
      </div>

      {/* Single-row stats stripe — dividers, small label + big colourful value */}
      <div className="pc-stripe">
        <span className="pc-si pc-c-blue">
          Revenue <b>₹{totRev.toLocaleString()}</b>
        </span>
        <span className="pc-si pc-c-slate">
          Cost <b>₹{totCost.toLocaleString()}</b>
        </span>
        <span className="pc-si">
          Profit{" "}
          <b className={totProfit >= 0 ? "pc-pos" : "pc-neg"}>
            ₹{totProfit.toLocaleString()}
          </b>
        </span>
        <span className="pc-si pc-c-purple">
          Margin <b>{margin}%</b>
        </span>
        <span className="pc-si pc-c-teal">
          Orders <b>{totOrders}</b>
        </span>
        <span className="pc-si pc-c-orange">
          Books <b>{totQty}</b>
        </span>
      </div>

      {mode === "area" ? (
      <div className={`wk-scroll ${period === "all" ? "pc-scroll-x" : ""}`}>
        <div
          className="pc-area-wrap"
          style={
            period === "all"
              ? { minWidth: `${Math.max(AW, nCols * 46)}px` }
              : undefined
          }
        >
          <svg
            className="pc-area-svg"
            viewBox={`0 0 ${AW} ${AH}`}
            preserveAspectRatio="none"
            role="img"
          >
            <defs>
              <linearGradient id="pcCostFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(148,163,184,0.30)" />
                <stop offset="100%" stopColor="rgba(148,163,184,0)" />
              </linearGradient>
              <linearGradient id="pcProfitFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(10,143,12,0.30)" />
                <stop offset="100%" stopColor="rgba(10,143,12,0)" />
              </linearGradient>
            </defs>
            {/* zero baseline */}
            <line
              x1="0"
              y1={aZero}
              x2={AW}
              y2={aZero}
              stroke="var(--hairline,#ececec)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <path d={costAreaD} fill="url(#pcCostFill)" />
            <path d={profitAreaD} fill="url(#pcProfitFill)" />
            <polyline
              points={costLinePts}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              points={profitLinePts}
              fill="none"
              stroke="var(--success,#0a8f0c)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            {cols.map((c, i) => (
              <g key={i}>
                <circle
                  cx={ax(i)}
                  cy={ay(c.cost)}
                  r={hover === i ? 4 : 2.4}
                  fill="#fff"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                <circle
                  cx={ax(i)}
                  cy={ay(c.profit)}
                  r={hover === i ? 4 : 2.4}
                  fill="#fff"
                  stroke="var(--success,#0a8f0c)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}
          </svg>

          {/* Transparent hover columns + x-axis labels overlaid on the chart */}
          <div className="pc-area-cols">
            {cols.map((c, i) => {
              const tipSide =
                i >= cols.length - 2
                  ? "pc-tip-right"
                  : i <= 1
                    ? "pc-tip-left"
                    : "";
              return (
                <div
                  key={i}
                  className={`pc-acol${hover === i ? " on" : ""}`}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover((h) => (h === i ? null : h))}
                  onClick={() => setHover((h) => (h === i ? null : i))}
                >
                  {hover === i && (
                    <div className={`pc-tip ${tipSide}`}>
                      <div className="pc-tip-h">{c.hint}</div>
                      <div className="pc-tip-r">
                        <span>Revenue</span>
                        <b>₹{c.rev.toLocaleString()}</b>
                      </div>
                      <div className="pc-tip-r">
                        <span>Cost</span>
                        <b>₹{c.cost.toLocaleString()}</b>
                      </div>
                      <div className="pc-tip-r">
                        <span>Profit</span>
                        <b className={c.profit >= 0 ? "pc-pos" : "pc-neg"}>
                          ₹{c.profit.toLocaleString()}
                        </b>
                      </div>
                      <div className="pc-tip-r">
                        <span>Orders</span>
                        <b>{c.n || 0}</b>
                      </div>
                      <div className="pc-tip-r">
                        <span>Books</span>
                        <b>{c.qty || 0}</b>
                      </div>
                    </div>
                  )}
                  <span className="pc-lbl">{c.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      ) : (
      <div className={`wk-scroll ${period === "all" ? "pc-scroll-x" : ""}`}>
        <div className={`pc-bars pc-bars-${period}`}>
          {cols.map((c, i) => {
            const tipSide =
              i >= cols.length - 2
                ? "pc-tip-right"
                : i <= 1
                  ? "pc-tip-left"
                  : "";
            return (
              <div
                key={i}
                className="pc-col"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover((h) => (h === i ? null : h))}
                onClick={() => setHover((h) => (h === i ? null : i))}
              >
                {hover === i && (
                  <div className={`pc-tip ${tipSide}`}>
                    <div className="pc-tip-h">{c.hint}</div>
                    <div className="pc-tip-r">
                      <span>Revenue</span>
                      <b>₹{c.rev.toLocaleString()}</b>
                    </div>
                    <div className="pc-tip-r">
                      <span>Cost</span>
                      <b>₹{c.cost.toLocaleString()}</b>
                    </div>
                    <div className="pc-tip-r">
                      <span>Profit</span>
                      <b className={c.profit >= 0 ? "pc-pos" : "pc-neg"}>
                        ₹{c.profit.toLocaleString()}
                      </b>
                    </div>
                    <div className="pc-tip-r">
                      <span>Orders</span>
                      <b>{c.n || 0}</b>
                    </div>
                    <div className="pc-tip-r">
                      <span>Books</span>
                      <b>{c.qty || 0}</b>
                    </div>
                  </div>
                )}
                <div className="pc-bar-track">
                  <div
                    className="pc-seg pc-seg-profit"
                    style={{
                      height: `${(Math.max(0, c.profit) / maxRev) * 100}%`,
                    }}
                  />
                  <div
                    className="pc-seg pc-seg-cost"
                    style={{ height: `${(c.cost / maxRev) * 100}%` }}
                  />
                </div>
                <span className="pc-lbl">{c.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}

// ── Yearly run-rate: one cumulative line per month (only months with orders) ──
function RunRateChart({ orders }) {
  const [hoverDay, setHoverDay] = useState(null);
  const year = new Date().getFullYear();
  const COLORS = [
    "#fb8500",
    "#0a8f0c",
    "#2563eb",
    "#e11d48",
    "#7c3aed",
    "#0891b2",
    "#d97706",
    "#db2777",
    "#16a34a",
    "#4f46e5",
    "#dc2626",
    "#0d9488",
  ];
  const now = new Date();
  const curMonth = now.getMonth();
  const today = now.getDate();

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
    // Current month stops at today; past months run to their last day.
    const lastDay = m === curMonth ? today : new Date(year, m + 1, 0).getDate();
    let cum = 0;
    const pts = [];
    for (let day = 1; day <= lastDay; day++) {
      const c = byMonthDay[m][day] || 0;
      cum += c;
      pts.push({ day, cum, c });
    }
    seriesByMonth[m] = pts;
    maxCum = Math.max(maxCum, cum);
  });

  // Metrics
  const totalYear = months.reduce((n, m) => {
    const s = seriesByMonth[m];
    return n + (s.length ? s[s.length - 1].cum : 0);
  }, 0);
  const dayOfYear = Math.ceil(
    (now - new Date(year, 0, 0)) / 86400000,
  );
  const perDayAvg = totalYear / Math.max(1, dayOfYear);
  let bestDay = 0;
  months.forEach((m) =>
    Object.values(byMonthDay[m]).forEach((v) => {
      if (v > bestDay) bestDay = v;
    }),
  );
  const busiestMonth = months.reduce((best, m) => {
    const t = seriesByMonth[m].slice(-1)[0]?.cum || 0;
    const bt = seriesByMonth[best]?.slice(-1)[0]?.cum || 0;
    return t > bt ? m : best;
  }, months[0]);

  const W = 600,
    H = 240,
    padL = 30,
    padR = 14,
    padTop = 14,
    padBottom = 26;
  const iw = W - padL - padR;
  const ih = H - padTop - padBottom;
  const x = (day) => padL + ((day - 1) / (maxDay - 1)) * iw;
  const y = (v) => padTop + ih - (v / maxCum) * ih;

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let day = Math.round(((px - padL) / iw) * (maxDay - 1)) + 1;
    day = Math.max(1, Math.min(maxDay, day));
    setHoverDay(day);
  };

  const dayLabels = [1, 5, 10, 15, 20, 25, 31];

  return (
    <div className="admin-chart-card rr-card">
      <div className="chart-title">
        Order run-rate · {year}
        <span className="vol-sub">cumulative orders by day, per month</span>
      </div>

      <div className="rr-plot">
        <svg
          className="rr-svg"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          onMouseMove={onMove}
          onMouseLeave={() => setHoverDay(null)}
        >
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

          {/* X-axis date labels */}
          {dayLabels.map((d) => (
            <text key={d} x={x(d)} y={H - 8} textAnchor="middle" className="rr-x">
              {d}
            </text>
          ))}

          {/* Hover guide */}
          {hoverDay && (
            <line
              x1={x(hoverDay)}
              y1={padTop}
              x2={x(hoverDay)}
              y2={padTop + ih}
              stroke="var(--dark-20,#ccc)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          {months.map((m) => (
            <polyline
              key={m}
              points={seriesByMonth[m]
                .map((p) => `${x(p.day)},${y(p.cum)}`)
                .join(" ")}
              fill="none"
              stroke={COLORS[m % COLORS.length]}
              strokeWidth="2.2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}

          {/* Hover dots per month */}
          {hoverDay &&
            months.map((m) => {
              const p = seriesByMonth[m].find((q) => q.day === hoverDay);
              if (!p) return null;
              return (
                <circle
                  key={`h${m}`}
                  cx={x(hoverDay)}
                  cy={y(p.cum)}
                  r="3.5"
                  fill="#fff"
                  stroke={COLORS[m % COLORS.length]}
                  strokeWidth="2"
                />
              );
            })}

          {/* Blinking dot: current month, today only */}
          {(() => {
            const s = seriesByMonth[curMonth];
            if (!s || !s.length) return null;
            const p = s[s.length - 1];
            return (
              <circle
                cx={x(p.day)}
                cy={y(p.cum)}
                r="4.5"
                fill={COLORS[curMonth % COLORS.length]}
                className="rr-live-dot"
              />
            );
          })()}
        </svg>

        {hoverDay && (
          <div
            className="rr-tip"
            style={{ left: `${(x(hoverDay) / W) * 100}%` }}
          >
            <div className="rr-tip-date">Day {hoverDay}</div>
            {months.map((m) => {
              const p = seriesByMonth[m].find((q) => q.day === hoverDay);
              if (!p) return null;
              return (
                <div key={m} className="rr-tip-row">
                  <span
                    className="rr-swatch"
                    style={{ background: COLORS[m % COLORS.length] }}
                  />
                  {MONTH_LABELS[m]}: <b>{p.cum}</b>
                  {p.c > 0 && <span className="rr-tip-add">+{p.c}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rr-legend">
        {months.map((m) => (
          <span key={m} className="rr-leg">
            <span
              className="rr-swatch"
              style={{ background: COLORS[m % COLORS.length] }}
            />
            {MONTH_LABELS[m]}{" "}
            <b>{seriesByMonth[m].slice(-1)[0]?.cum || 0}</b>
          </span>
        ))}
      </div>

      {/* Meaningful metrics grid */}
      <div className="rr-metrics">
        <div className="rr-metric">
          <span className="rr-metric-val">{perDayAvg.toFixed(1)}</span>
          <span className="rr-metric-lbl">Avg orders / day</span>
        </div>
        <div className="rr-metric">
          <span className="rr-metric-val">{bestDay}</span>
          <span className="rr-metric-lbl">Best single day</span>
        </div>
        <div className="rr-metric">
          <span className="rr-metric-val">{totalYear}</span>
          <span className="rr-metric-lbl">Total in {year}</span>
        </div>
        <div className="rr-metric">
          <span className="rr-metric-val">{MONTH_LABELS[busiestMonth]}</span>
          <span className="rr-metric-lbl">Busiest month</span>
        </div>
      </div>
    </div>
  );
}

// ── Orders bar chart with Week / Month / Year modes (mobile-scrollable) ──
function WeeklyBarChart({ orders }) {
  const [mode, setMode] = useState("week"); // week | month | year
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [yearOffset, setYearOffset] = useState(0);
  const now = new Date();
  const fmt = (d) => `${d.getDate()}/${d.getMonth() + 1}`;

  const dayCounts = {};
  const monthCounts = {};
  orders.forEach((o) => {
    const d = getOrderDate(o);
    if (!d) return;
    dayCounts[dayKey(d)] = (dayCounts[dayKey(d)] || 0) + 1;
    const mk = `${d.getFullYear()}-${d.getMonth()}`;
    monthCounts[mk] = (monthCounts[mk] || 0) + 1;
  });

  const MON = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  let cols = [];
  let total = 0;
  let rangeLabel = "";
  let canNext = false;
  let title = "";

  if (mode === "week") {
    title = "Weekly orders";
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dow = (base.getDay() + 6) % 7; // Monday = 0
    const weekStart = new Date(base);
    weekStart.setDate(base.getDate() - dow + weekOffset * 7);
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const c = dayCounts[dayKey(d)] || 0;
      cols.push({ c, label: labels[i], hint: fmt(d) });
      total += c;
    }
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    rangeLabel = `${fmt(weekStart)} – ${fmt(weekEnd)}`;
    canNext = weekOffset < 0;
  } else if (mode === "month") {
    title = "Monthly orders";
    const m = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const y = m.getFullYear();
    const mo = m.getMonth();
    const days = new Date(y, mo + 1, 0).getDate();
    for (let dd = 1; dd <= days; dd++) {
      const d = new Date(y, mo, dd);
      const c = dayCounts[dayKey(d)] || 0;
      cols.push({ c, label: String(dd), hint: fmt(d) });
      total += c;
    }
    rangeLabel = m.toLocaleString("en-IN", { month: "long", year: "numeric" });
    canNext = monthOffset < 0;
  } else {
    title = "Yearly orders";
    const yr = now.getFullYear() + yearOffset;
    for (let mo = 0; mo < 12; mo++) {
      const c = monthCounts[`${yr}-${mo}`] || 0;
      cols.push({ c, label: MON[mo], hint: `${MON[mo]} ${yr}` });
      total += c;
    }
    rangeLabel = String(yr);
    canNext = yearOffset < 0;
  }
  const max = Math.max(1, ...cols.map((c) => c.c));

  const prev = () =>
    mode === "week"
      ? setWeekOffset((w) => w - 1)
      : mode === "month"
        ? setMonthOffset((w) => w - 1)
        : setYearOffset((w) => w - 1);
  const next = () =>
    mode === "week"
      ? setWeekOffset((w) => Math.min(0, w + 1))
      : mode === "month"
        ? setMonthOffset((w) => Math.min(0, w + 1))
        : setYearOffset((w) => Math.min(0, w + 1));

  return (
    <div className="admin-chart-card wk-card">
      <div className="wk-head">
        <div className="chart-title">
          {title} <span className="vol-sub">{total} orders</span>
        </div>
        <div className="mo-view-toggle">
          {["week", "month", "year"].map((m) => (
            <button
              key={m}
              type="button"
              className={`mo-view-btn${mode === m ? " active" : ""}`}
              onClick={() => setMode(m)}
            >
              {m[0].toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="wk-nav">
        <button type="button" onClick={prev} aria-label={`Previous ${mode}`}>
          ‹
        </button>
        <span className="wk-range">{rangeLabel}</span>
        <button
          type="button"
          onClick={next}
          aria-label={`Next ${mode}`}
          disabled={!canNext}
        >
          ›
        </button>
      </div>

      <div className="wk-scroll">
        <div className={`wk-bars wk-bars-${mode}`}>
          {cols.map((c, i) => (
            <div key={i} className="wk-col" title={`${c.c} orders · ${c.hint}`}>
              <div className="wk-bar-track">
                {c.c > 0 && <span className="wk-val">{c.c}</span>}
                <div
                  className="wk-bar"
                  style={{ height: `${(c.c / max) * 100}%` }}
                />
              </div>
              <span className="wk-lbl">{c.label}</span>
            </div>
          ))}
        </div>
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
    if (
      d &&
      d.getFullYear() === lm.getFullYear() &&
      d.getMonth() === lm.getMonth()
    )
      lastRev += o.revenue || 0;
  });
  const projected =
    dayOfMonth > 0
      ? Math.round((revSoFar / dayOfMonth) * daysInMonth)
      : revSoFar;
  const pace =
    lastRev > 0 ? Math.round(((projected - lastRev) / lastRev) * 100) : null;

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

// Simple calculator modal (basic arithmetic, keyboard-friendly).
function CalculatorModal({ onClose }) {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("");

  const evaluate = (s) => {
    // Only digits, operators, dot and parens — safe to evaluate.
    if (!/^[0-9+\-*/.()%\s]*$/.test(s)) return "";
    try {
      const cleaned = s.replace(/%/g, "/100").replace(/[+\-*/.]\s*$/, "");
      if (!cleaned.trim()) return "";
      // eslint-disable-next-line no-new-func
      const val = Function(`"use strict";return (${cleaned})`)();
      if (val === undefined || val === null || Number.isNaN(val)) return "";
      return String(Math.round(val * 1e6) / 1e6);
    } catch {
      return "";
    }
  };

  const push = (ch) => {
    setExpr((e) => {
      const next = e + ch;
      setResult(evaluate(next));
      return next;
    });
  };
  const clearAll = () => {
    setExpr("");
    setResult("");
  };
  const back = () =>
    setExpr((e) => {
      const next = e.slice(0, -1);
      setResult(evaluate(next));
      return next;
    });
  const equals = () => {
    const r = evaluate(expr);
    if (r !== "") {
      setExpr(r);
      setResult("");
    }
  };

  const keys = [
    "C", "( )", "%", "÷",
    "7", "8", "9", "×",
    "4", "5", "6", "−",
    "1", "2", "3", "+",
    "0", ".", "⌫", "=",
  ];
  const handleKey = (k) => {
    if (k === "C") return clearAll();
    if (k === "⌫") return back();
    if (k === "=") return equals();
    if (k === "( )") {
      const opens = (expr.match(/\(/g) || []).length;
      const closes = (expr.match(/\)/g) || []).length;
      const last = expr.slice(-1);
      return push(
        opens > closes && /[0-9)]/.test(last) ? ")" : "(",
      );
    }
    const map = { "÷": "/", "×": "*", "−": "-" };
    push(map[k] || k);
  };

  return (
    <motion.div
      className="bill-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bill-modal calc-modal"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bill-header">
          <span className="weight-600 font-16 flex items-center gap-8">
            <Calculator size={16} /> Calculator
          </span>
          <span className="cursor-pointer" onClick={onClose}>
            <X size={18} />
          </span>
        </div>
        <div className="calc-screen">
          <div className="calc-expr">{expr || "0"}</div>
          <div className="calc-result">{result ? `= ${result}` : ""}</div>
        </div>
        <div className="calc-keys">
          {keys.map((k) => (
            <button
              key={k}
              type="button"
              className={`calc-key${
                k === "=" ? " eq" : ""
              }${["÷", "×", "−", "+", "%", "( )"].includes(k) ? " op" : ""}${
                k === "C" || k === "⌫" ? " fn" : ""
              }`}
              onClick={() => handleKey(k)}
            >
              {k}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
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
  const [seenIds, setSeenIds] = useState(null); // order IDs seen on last visit
  const [showNewModal, setShowNewModal] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false); // kebab menu
  const [showListMenu, setShowListMenu] = useState(false); // orders list kebab
  const [showCalc, setShowCalc] = useState(false); // calculator modal
  const [waPickerOrder, setWaPickerOrder] = useState(null); // WhatsApp picker
  const [waCustomText, setWaCustomText] = useState(""); // custom WA message
  const [darkMode, setDarkMode] = useState(false); // page dark theme
  useEffect(() => {
    try {
      setDarkMode(localStorage.getItem("mo_dark") === "1");
    } catch {}
  }, []);
  const toggleDark = () =>
    setDarkMode((d) => {
      const next = !d;
      try {
        localStorage.setItem("mo_dark", next ? "1" : "0");
      } catch {}
      return next;
    });

  // ── Per-order notes (localStorage: { "<orderId>": "note text" }) ──
  const [orderNotes, setOrderNotes] = useState({});
  const [noteEditor, setNoteEditor] = useState(null); // { orderId, draft }
  const orderNotesHydrated = useRef(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("mo_order_notes") || "{}",
      );
      if (saved && typeof saved === "object") setOrderNotes(saved);
    } catch {}
    orderNotesHydrated.current = true;
  }, []);
  useEffect(() => {
    if (!orderNotesHydrated.current) return;
    try {
      localStorage.setItem("mo_order_notes", JSON.stringify(orderNotes));
    } catch {}
  }, [orderNotes]);
  const saveOrderNote = (orderId, text) => {
    setOrderNotes((m) => {
      const next = { ...m };
      const t = (text || "").trim();
      if (t) next[orderId] = t;
      else delete next[orderId];
      return next;
    });
    setNoteEditor(null);
  };

  // ── Notes (chat-style, localStorage-backed) ──
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteInput, setNoteInput] = useState("");
  const notesHydrated = useRef(false);
  const notesEndRef = useRef(null);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("mo_notes") || "[]");
      if (Array.isArray(saved)) setNotes(saved);
    } catch {}
    notesHydrated.current = true;
  }, []);
  useEffect(() => {
    if (!notesHydrated.current) return;
    try {
      localStorage.setItem("mo_notes", JSON.stringify(notes));
    } catch {}
  }, [notes]);
  useEffect(() => {
    if (showNotes) {
      setTimeout(
        () => notesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        60,
      );
    }
  }, [showNotes, notes.length]);
  const sendNote = () => {
    const text = noteInput.trim();
    if (!text) return;
    setNotes((n) => [
      ...n,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text,
        ts: Date.now(),
      },
    ]);
    setNoteInput("");
  };
  const deleteNote = (id) => setNotes((n) => n.filter((x) => x.id !== id));

  // Pinned transactions surfaced in the notifications modal.
  const [pinnedTxns, setPinnedTxns] = useState([]);
  const loadPinnedTxns = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("mo_txns") || "[]");
      setPinnedTxns(
        Array.isArray(saved) ? saved.filter((t) => t.pinned) : [],
      );
    } catch {
      setPinnedTxns([]);
    }
  };
  useEffect(() => {
    loadPinnedTxns();
  }, []);
  useEffect(() => {
    if (showNewModal) loadPinnedTxns();
  }, [showNewModal]);
  const downloadNotesCSV = () => {
    if (!notes.length) return;
    const rows = [["Date", "Day", "Time", "Message"]];
    notes.forEach((nt) => {
      const d = new Date(nt.ts);
      rows.push([
        d.toLocaleDateString("en-IN"),
        d.toLocaleDateString("en-IN", { weekday: "long" }),
        d.toLocaleTimeString("en-IN"),
        nt.text,
      ]);
    });
    const csv = rows
      .map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `manage-orders-notes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [analyticsPeriod, setAnalyticsPeriod] = useState("month"); // day | week | month | all
  const [periodOffset, setPeriodOffset] = useState(0); // 0 = current, -1 = previous …
  const selectPeriod = (k) => {
    setAnalyticsPeriod(k);
    setPeriodOffset(0);
  };

  // Which analytics sections are visible (Customize panel, persisted).
  const [showCustomize, setShowCustomize] = useState(false);
  const [visibleCards, setVisibleCards] = useState(() =>
    Object.fromEntries(ANALYTICS_SECTIONS.map((s) => [s.key, true])),
  );
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("mo_analytics_cards") || "null",
      );
      if (saved && typeof saved === "object") {
        setVisibleCards((v) => ({ ...v, ...saved }));
      }
    } catch {}
  }, []);
  const toggleCard = (key) => {
    setVisibleCards((v) => {
      const next = { ...v, [key]: !v[key] };
      try {
        localStorage.setItem("mo_analytics_cards", JSON.stringify(next));
      } catch {}
      return next;
    });
  };
  const [orderView, setOrderView] = useState("cards"); // cards | table
  const [orderPickFilter, setOrderPickFilter] = useState("all"); // all | picked | pending
  const [selectedIds, setSelectedIds] = useState([]); // bulk-selected order IDs (table)
  const [bulkStage, setBulkStage] = useState(null); // WhatsApp stage key for bulk send
  const [bulkSent, setBulkSent] = useState([]); // order IDs already messaged
  const [waPick, setWaPick] = useState(""); // dropdown-selected stage (not yet triggered)

  const [accOpen, setAccOpen] = useState({
    analytics: true,
    calendar: false,
    indiapost: true,
    orders: true,
  });
  const toggleAcc = (id) => setAccOpen((p) => ({ ...p, [id]: !p[id] }));

  // Scrollable section tabs — jump to a section, remembered across sessions.
  const [activeTab, setActiveTab] = useState("analytics");
  useEffect(() => {
    try {
      const t = localStorage.getItem("mo_active_tab");
      if (t) setActiveTab(t);
    } catch {}
  }, []);
  const goToTab = (key) => {
    setActiveTab(key);
    try {
      localStorage.setItem("mo_active_tab", key);
    } catch {}
    setAccOpen((p) => ({ ...p, [key]: true }));
  };

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
      localStorage.setItem(
        "manage_orders_packed",
        JSON.stringify(packedOrders),
      );
      localStorage.setItem("manage_orders_accordions", JSON.stringify(accOpen));
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
        // Source cost + weight from the catalogue (matched by book name) so
        // profit and India Post delivery cost are computed, not read from the
        // sheet. totalCost = cost of goods + weight-based delivery charge.
        const econ = orderEconomics(order.parsedBooks);
        order.booksCost = econ.booksCost;
        order.weight = econ.weight;
        order.deliveryCost = econ.deliveryCost;
        order.totalCost = econ.booksCost + econ.deliveryCost;
        order.pnl = order.revenue - order.totalCost;
        return order;
      });

      // Initial sort, the filter useEffect immediately re-sorts using the
      // current sortOrder, so this is just a placeholder.
      const sorted = sortByDateDesc(parsedOrders);

      setOrders(sorted);
      setFilteredOrders(sorted);

      // Cache a lightweight, de-duplicated customer list for the money
      // manager's @-mention feature (keyed by name, latest order kept).
      try {
        const byName = new Map();
        sorted.forEach((o) => {
          const name = String(o["Customer Name"] || "").trim();
          if (!name || byName.has(name)) return;
          byName.set(name, {
            name,
            phone: o["Phone Number"] || "",
            address: o["Address"] || "",
            city: o["City"] || "",
            state: o["State"] || "",
            pincode: o["Pincode"] || "",
            orderId: o["Order ID"] || "",
            lastAmount: o.revenue || 0,
            status: o["Order Status"] || "",
          });
        });
        localStorage.setItem(
          "mo_customers",
          JSON.stringify([...byName.values()]),
        );
      } catch {}
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Load the set of order IDs seen on the last visit
  useEffect(() => {
    try {
      const raw = localStorage.getItem("manage_orders_seen_ids");
      setSeenIds(raw ? JSON.parse(raw) : null);
    } catch (_) {
      setSeenIds(null);
    }
  }, []);

  // First ever visit → set a baseline so we don't flag every order as new
  useEffect(() => {
    if (!orders.length || seenIds !== null) return;
    const ids = orders.map((o) => o["Order ID"]).filter(Boolean);
    try {
      localStorage.setItem("manage_orders_seen_ids", JSON.stringify(ids));
    } catch (_) {}
    setSeenIds(ids);
  }, [orders, seenIds]);

  // Orders present now that weren't there on the last visit
  const newOrders = useMemo(() => {
    if (!seenIds) return [];
    const set = new Set(seenIds);
    return orders.filter(
      (o) =>
        o["Order ID"] &&
        !set.has(o["Order ID"]) &&
        // Skip drop-off rows — only surface confirmed orders as notifications
        !/\(unconfirmed\)/i.test(o["Customer Name"] || ""),
    );
  }, [orders, seenIds]);
  const newOrderCount = newOrders.length;

  const markOrdersSeen = () => {
    const ids = orders.map((o) => o["Order ID"]).filter(Boolean);
    try {
      localStorage.setItem("manage_orders_seen_ids", JSON.stringify(ids));
    } catch (_) {}
    setSeenIds(ids);
  };

  // Play a chime once when new orders are detected on this visit.
  const newOrderAudioRef = useRef(null);
  const soundPlayedRef = useRef(false);
  useEffect(() => {
    if (newOrderCount > 0 && !soundPlayedRef.current) {
      soundPlayedRef.current = true;
      newOrderAudioRef.current?.play?.().catch(() => {});
    }
  }, [newOrderCount]);

  // Print a 2-per-row, full-size cover sheet (save as PDF) from a list of
  // { src, name } cells. Shared by the per-order and all-orders exports.
  const printCoverCells = (cells) => {
    if (!cells.length) {
      alert("All books are already picked — nothing to export.");
      return;
    }
    const html = cells
      .map((c) =>
        c.src
          ? `<div class="cell"><img src="${c.src}" alt=""/></div>`
          : `<div class="cell"><div class="ph">${c.name}</div></div>`,
      )
      .join("");
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(
      `<!doctype html><html><head><title>Packing sheet</title><meta charset="utf-8"/>
      <style>
        @page { margin: 10mm; }
        * { box-sizing: border-box; }
        body { font-family: system-ui, sans-serif; margin: 0; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10mm; padding: 10mm; }
        .cell { break-inside: avoid; text-align: center; }
        .cell img { width: 100%; height: auto; display: block; }
        .ph { border: 1px dashed #999; padding: 60px 10px; color: #666; font-size: 13px; }
      </style></head>
      <body><div class="grid">${html}</div>
      <script>window.onload=function(){setTimeout(function(){window.print();},400);};<\/script>
      </body></html>`,
    );
    w.document.close();
  };

  const absImg = (u) => {
    const s = typeof u === "string" ? u : u?.src || "";
    if (!s) return "";
    return s.startsWith("http") ? s : window.location.origin + s;
  };

  // Collect un-picked book covers (repeated by quantity) for one order.
  const coversForOrder = (o) => {
    const oid = o["Order ID"] || o._rowIndex;
    const cells = [];
    (o.parsedBooks || []).forEach((b, i) => {
      if (pickChecked[bookKey(oid, i)]) return; // skip picked
      const src = absImg(getBookImage(b.name));
      const qty = Math.max(1, b.quantity || 1);
      for (let k = 0; k < qty; k++) cells.push({ src, name: b.name });
    });
    return cells;
  };

  const exportOrderCovers = (o) => printCoverCells(coversForOrder(o));

  // All-orders packing sheet: un-picked covers across the current list.
  const exportPackingSheet = () => {
    const cells = [];
    filteredOrders.forEach((o) => cells.push(...coversForOrder(o)));
    printCoverCells(cells);
  };

  // Shipping-form payload for one order (India Post + address label).
  const orderFormData = (o) => ({
    orderId: o["Order ID"],
    customerName: o["Customer Name"],
    customerAddress: o["Address"],
    customerCity: o["City"],
    customerState: o["State"],
    customerPincode: o["Pincode"],
    customerPhone: o["Phone Number"],
    totalValueRs: o.revenue,
    isCOD: /cash|cod/i.test(o["Payment Type"] || ""),
    codAmount: o.revenue,
  });

  // Each order → ONE combined frame (India Post CDF + From/To label together).
  // "format" is "pdf" (all frames in one ordered file, best for printing) or
  // "png" (one image per order).
  const downloadFormsFor = (orders, format, filename) => {
    if (!orders.length) return;
    const payloads = orders.map(orderFormData);
    if (format === "pdf") {
      downloadCombinedFormsPDF(payloads, filename);
    } else {
      downloadCombinedFormsPNGs(payloads);
    }
  };

  // Selected rows (table view) → combined shipping form(s).
  const downloadSelectedForms = (format) => {
    const chosen = filteredOrders.filter((o) =>
      selectedIds.includes(o["Order ID"]),
    );
    downloadFormsFor(
      chosen,
      format,
      `shipping_forms_selected_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  };

  // Every order in the current filter → combined shipping form(s).
  const downloadAllForms = (format) => {
    downloadFormsFor(
      filteredOrders,
      format,
      `shipping_forms_all_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  };

  // Whether every book in an order has been picked (touched).
  const isOrderFullyPicked = (o) => {
    const oid = o["Order ID"] || o._rowIndex;
    const bks = o.parsedBooks || [];
    return bks.length > 0 && bks.every((_b, i) => pickChecked[bookKey(oid, i)]);
  };

  // Global single-frame PNG grid of every un-picked book cover (dense grid,
  // fits many covers per sheet). Async: waits for images to load.
  const downloadCoversPNG = async () => {
    const items = [];
    filteredOrders.forEach((o) => {
      const oid = o["Order ID"] || o._rowIndex;
      (o.parsedBooks || []).forEach((b, i) => {
        if (pickChecked[bookKey(oid, i)]) return;
        const qty = Math.max(1, b.quantity || 1);
        const src = getBookImage(b.name);
        for (let k = 0; k < qty; k++) items.push({ src, name: b.name });
      });
    });
    if (!items.length) {
      alert("All books are already picked — nothing to export.");
      return;
    }
    const COLS = 6;
    const CW = 200;
    const CH = 280;
    const GAP = 12;
    const PAD = 16;
    const rows = Math.ceil(items.length / COLS);
    const canvas = document.createElement("canvas");
    canvas.width = PAD * 2 + COLS * CW + (COLS - 1) * GAP;
    canvas.height = PAD * 2 + rows * CH + (rows - 1) * GAP;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const load = (src) =>
      new Promise((res) => {
        if (!src) return res(null);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => res(img);
        img.onerror = () => res(null);
        img.src = src;
      });

    const imgs = await Promise.all(items.map((it) => load(it.src)));
    imgs.forEach((img, idx) => {
      const r = Math.floor(idx / COLS);
      const c = idx % COLS;
      const dx = PAD + c * (CW + GAP);
      const dy = PAD + r * (CH + GAP);
      if (img) {
        ctx.drawImage(img, dx, dy, CW, CH);
      } else {
        ctx.strokeStyle = "#ccc";
        ctx.strokeRect(dx, dy, CW, CH);
        ctx.fillStyle = "#666";
        ctx.font = "13px sans-serif";
        ctx.fillText(
          (items[idx].name || "").slice(0, 22),
          dx + 8,
          dy + CH / 2,
        );
      }
    });
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `unpicked-covers-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  // Restore saved filter/search preferences on mount
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("manage_orders_prefs") || "{}");
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
        return (
          !s ||
          s.includes("pending") ||
          s.includes("processing") ||
          s.includes("getting shipped")
        );
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

  // The navigable window (start/end/label) for the chosen period + offset.
  const periodWindow = useMemo(() => {
    const now = new Date();
    if (analyticsPeriod === "all") {
      return { start: null, end: null, label: "All time", canNext: false };
    }
    if (analyticsPeriod === "day") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() + periodOffset);
      const end = new Date(start);
      end.setDate(start.getDate() + 1);
      return {
        start,
        end,
        label: start.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        canNext: periodOffset < 0,
      };
    }
    if (analyticsPeriod === "week") {
      const dow = (now.getDay() + 6) % 7; // Monday = 0
      const monday = new Date(now);
      monday.setHours(0, 0, 0, 0);
      monday.setDate(now.getDate() - dow + periodOffset * 7);
      const end = new Date(monday);
      end.setDate(monday.getDate() + 7);
      const weekEnd = new Date(monday);
      weekEnd.setDate(monday.getDate() + 6);
      const fmt = (d) =>
        d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      return {
        start: monday,
        end,
        label: `${fmt(monday)} – ${fmt(weekEnd)}`,
        canNext: periodOffset < 0,
      };
    }
    // month
    const m = new Date(now.getFullYear(), now.getMonth() + periodOffset, 1);
    const end = new Date(m.getFullYear(), m.getMonth() + 1, 1);
    return {
      start: m,
      end,
      label: m.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      canNext: periodOffset < 0,
    };
  }, [analyticsPeriod, periodOffset]);

  // Analytics are independent of the list's search/status/payment filters.
  // They scope to the selected, navigable period window (or all orders).
  const analyticsOrders = useMemo(() => {
    if (analyticsPeriod === "all" || !periodWindow.start) return orders;
    return orders.filter((o) => {
      const d = getOrderDate(o);
      return d && d >= periodWindow.start && d < periodWindow.end;
    });
  }, [orders, analyticsPeriod, periodWindow]);

  const analyticsByDay = useMemo(() => {
    const map = {};
    analyticsOrders.forEach((o) => {
      const d = getOrderDate(o);
      if (d) {
        const k = dayKey(d);
        map[k] = (map[k] || 0) + 1;
      }
    });
    return map;
  }, [analyticsOrders]);

  // Rich insights derived from the current period's orders.
  const insights = useMemo(() => {
    const src = analyticsOrders;
    const bookMap = {};
    const catMap = {};
    const weekday = [0, 0, 0, 0, 0, 0, 0];
    const hourArr = new Array(24).fill(0);
    const pinMap = {};
    const custMap = {};
    let hasTime = false;
    let delivered = 0;
    let cancelled = 0;
    let tracked = 0;
    let codN = 0;
    let upiN = 0;
    let codV = 0;
    let upiV = 0;

    src.forEach((o) => {
      (o.parsedBooks || []).forEach((b) => {
        const key = b.name;
        if (!bookMap[key]) bookMap[key] = { units: 0, revenue: 0 };
        bookMap[key].units += b.quantity || 1;
        bookMap[key].revenue += b.total || 0;
        const bk = BOOK_BY_NAME[key.toLowerCase().trim()];
        const cat = (bk?.catalogue && bk.catalogue[0]) || "other";
        catMap[cat] = (catMap[cat] || 0) + (b.total || 0);
      });
      const d = getOrderDate(o);
      if (d) {
        weekday[(d.getDay() + 6) % 7] += 1;
        hourArr[d.getHours()] += 1;
        if (d.getHours() !== 0 || d.getMinutes() !== 0) hasTime = true;
      }
      const pin = String(o["Pincode"] || "").trim();
      if (pin) pinMap[pin] = (pinMap[pin] || 0) + 1;
      const ph = String(o["Phone Number"] || "").trim();
      if (ph) custMap[ph] = (custMap[ph] || 0) + 1;
      const st = String(o["Order Status"] || "").toLowerCase();
      if (st.includes("delivered")) delivered += 1;
      if (st.includes("cancel")) cancelled += 1;
      if (String(o["Shipping ID"] || "").trim()) tracked += 1;
      const isCod = /cash|cod/i.test(String(o["Payment Type"] || ""));
      if (isCod) {
        codN += 1;
        codV += o.revenue || 0;
      } else {
        upiN += 1;
        upiV += o.revenue || 0;
      }
    });

    const topBooks = Object.entries(bookMap)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 8);
    const topCats = Object.entries(catMap)
      .map(([c, rev]) => ({ c, rev }))
      .sort((a, b) => b.rev - a.rev)
      .slice(0, 6);
    const topPins = Object.entries(pinMap)
      .map(([p, c]) => ({ p, c }))
      .sort((a, b) => b.c - a.c)
      .slice(0, 6);
    const uniqueCustomers = Object.keys(custMap).length;
    const repeat = Object.values(custMap).filter((c) => c > 1).length;
    const n = src.length;
    const revenue = src.reduce((s, o) => s + (o.revenue || 0), 0);

    return {
      topBooks,
      topCats,
      topPins,
      weekday,
      hourArr,
      hasTime,
      delivered,
      cancelled,
      tracked,
      uniqueCustomers,
      repeat,
      codN,
      upiN,
      codV,
      upiV,
      count: n,
      aov: n ? Math.round(revenue / n) : 0,
      deliveredPct: n ? Math.round((delivered / n) * 100) : 0,
      cancelPct: n ? Math.round((cancelled / n) * 100) : 0,
      trackedPct: n ? Math.round((tracked / n) * 100) : 0,
      repeatPct: uniqueCustomers
        ? Math.round((repeat / uniqueCustomers) * 100)
        : 0,
    };
  }, [analyticsOrders]);

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

  // Edit a row IN PLACE via the Apps Script web app (no new row appended).
  const updateOrderRow = async (orderId, fields) => {
    const body = new URLSearchParams({
      action: "update",
      orderId,
      data: JSON.stringify(fields),
    });
    await fetch(SHEET_EDIT_API_URL, {
      method: "POST",
      mode: "no-cors",
      body,
    });
  };

  // Permanently remove a row (user-triggered, confirmed).
  const deleteOrderRow = async (order) => {
    const orderId = order["Order ID"];
    if (!SHEET_EDIT_API_URL) {
      alert(
        "Delete needs the Sheet edit endpoint. Deploy docs/sheet-edit-apps-script.gs and set SHEET_EDIT_API_URL.",
      );
      return;
    }
    if (
      !window.confirm(
        `Delete order ${orderId} permanently from the sheet? This cannot be undone.`,
      )
    )
      return;
    try {
      const body = new URLSearchParams({ action: "delete", orderId });
      await fetch(SHEET_EDIT_API_URL, {
        method: "POST",
        mode: "no-cors",
        body,
      });
      setDetailOrder(null);
      setTimeout(fetchOrders, 1300);
    } catch (e) {
      console.error("Delete failed:", e);
      alert("Failed to delete order");
    }
  };

  const handleEditOrder = async () => {
    if (!selectedOrder) return;

    // Preferred path: edit the existing row in place via the Apps Script API.
    if (SHEET_EDIT_API_URL) {
      const fields = {
        "Customer Name": formData.customerName,
        "Phone Number": formData.phoneNumber,
        Pincode: formData.pincode,
        City: formData.city,
        State: formData.state,
        Address: formData.address,
        "Books List": formData.booksList,
        "Total Amount": formData.totalAmount,
        "Payment Type": formData.paymentType,
        "Delivery Type": formData.deliveryType,
        "Order Status": formData.orderStatus,
        "Shipping ID": formData.shippingId,
        TinyURL: formData.tinyUrl,
      };
      try {
        await updateOrderRow(formData.orderId, fields);
        setShowEditModal(false);
        setTimeout(fetchOrders, 1300);
      } catch (e) {
        console.error("Update failed:", e);
        alert("Failed to update order");
      }
      return;
    }

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

  // Full CSV of every "Getting Shipped" order (all columns incl. address +
  // pincode) — for shipping/booking workflows.
  const exportGettingShippedCSV = () => {
    const headers = [
      "Sr",
      "Order ID",
      "Name",
      "Phone",
      "Address",
      "City",
      "State",
      "Pincode",
      "Payment Type",
      "Amount",
      "Books Count",
      "Book Titles",
      "Order Date",
    ];
    const shipping = orders.filter((o) =>
      /getting shipped/i.test(o["Order Status"] || ""),
    );
    const rows = shipping.map((o, i) => [
      i + 1,
      o["Order ID"] || "",
      o["Customer Name"] || "",
      o["Phone Number"] || "",
      o["Address"] || "",
      o["City"] || "",
      o["State"] || "",
      o["Pincode"] || "",
      o["Payment Type"] || "",
      o["Total Amount"] || "",
      (o.parsedBooks || []).length,
      (o.parsedBooks || []).map((b) => `${b.name} x${b.quantity}`).join("; "),
      formatDate(o["Timestamp(D)"] || o["Timestamp"]),
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
    a.download = `getting-shipped_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Highest order value (for value-based card tinting)
  const maxRevenue = Math.max(1, ...filteredOrders.map((o) => o.revenue || 0));

  // Stats — cost/profit sourced from catalogue (book cost + India Post delivery)
  const totalRevenue = analyticsOrders.reduce((sum, o) => sum + o.revenue, 0);
  const totalBooksCost = analyticsOrders.reduce(
    (sum, o) => sum + (o.booksCost || 0),
    0,
  );
  const totalDeliveryCost = analyticsOrders.reduce(
    (sum, o) => sum + (o.deliveryCost || 0),
    0,
  );
  const totalWeight = analyticsOrders.reduce(
    (sum, o) => sum + (o.weight || 0),
    0,
  );
  const totalCost = analyticsOrders.reduce((sum, o) => sum + o.totalCost, 0);
  const totalPnL = totalRevenue - totalCost;
  const marginPct =
    totalRevenue > 0 ? Math.round((totalPnL / totalRevenue) * 100) : 0;
  const avgDeliveryCost =
    analyticsOrders.length > 0
      ? Math.round(totalDeliveryCost / analyticsOrders.length)
      : 0;

  // Weight-slab distribution for the delivery-cost card
  const deliverySlabs = [
    { label: "0–500g", rate: 42, max: 500 },
    { label: "500g–1kg", rate: 62, max: 1000 },
    { label: "1–1.5kg", rate: 100, max: 1500 },
    { label: "1.5–2kg", rate: 150, max: 2000 },
    { label: "2–4kg", rate: 200, max: 4000 },
  ].map((s) => ({ ...s, count: 0, amount: 0 }));
  analyticsOrders.forEach((o) => {
    const g = o.weight || 0;
    const slab =
      deliverySlabs.find((s) => g <= s.max) ||
      deliverySlabs[deliverySlabs.length - 1];
    slab.count += 1;
    slab.amount += o.deliveryCost || 0;
  });
  const maxSlabCount = Math.max(1, ...deliverySlabs.map((s) => s.count));

  // Per-day run rate — orders & revenue averaged over the days that had orders
  const runRateDays = Math.max(
    1,
    new Set(analyticsOrders.map((o) => dayKey(getOrderDate(o)))).size,
  );
  const ordersPerDay = analyticsOrders.length / runRateDays;
  const revPerDay = totalRevenue / runRateDays;

  const deliveredCount = analyticsOrders.filter(
    (o) => o["Order Status"] === "Delivered",
  ).length;
  const inTransitCount = analyticsOrders.filter(
    (o) =>
      o["Order Status"] === "In Transit" || o["Order Status"] === "Shipped",
  ).length;
  const withTrackingCount = analyticsOrders.filter(
    (o) => o["Shipping ID"] && String(o["Shipping ID"]).trim() !== "",
  ).length;

  // Status breakdown for the chart / progress bars
  const STATUS_META = [
    { key: "Processing", color: "#fb8500" },
    { key: "Getting Shipped", color: "#f59e0b" },
    { key: "Shipped", color: "#3b6fe0" },
    { key: "In Transit", color: "#7c4dff" },
    { key: "Out for Delivery", color: "#0ea5e9" },
    { key: "Delivered", color: "#008f0c" },
    { key: "Cancelled", color: "#ef4444" },
  ];
  const statusCounts = STATUS_META.map((s) => ({
    ...s,
    count: analyticsOrders.filter((o) => o["Order Status"] === s.key).length,
  }));
  const maxStatusCount = Math.max(1, ...statusCounts.map((s) => s.count));

  // Payment split
  const isCODOrder = (o) => /cash|cod/i.test(String(o["Payment Type"] || ""));
  const codCount = analyticsOrders.filter(isCODOrder).length;
  const prepaidCount = analyticsOrders.length - codCount;

  // Per-status breakdown: count, total ₹ value, and UPI vs COD split.
  // (Non-COD orders are treated as UPI / prepaid.)
  const statusBreakdown = STATUS_META.map((s) => {
    const rows = analyticsOrders.filter((o) => o["Order Status"] === s.key);
    const codRows = rows.filter(isCODOrder);
    const upiRows = rows.filter((o) => !isCODOrder(o));
    const sumRev = (list) => list.reduce((sum, o) => sum + (o.revenue || 0), 0);
    return {
      ...s,
      count: rows.length,
      value: sumRev(rows),
      cod: codRows.length,
      upi: upiRows.length,
      codVal: sumRev(codRows),
      upiVal: sumRev(upiRows),
    };
  }).filter((s) => s.count > 0);

  const breakdownTotals = statusBreakdown.reduce(
    (acc, s) => ({
      count: acc.count + s.count,
      value: acc.value + s.value,
      upi: acc.upi + s.upi,
      cod: acc.cod + s.cod,
      upiVal: acc.upiVal + s.upiVal,
      codVal: acc.codVal + s.codVal,
    }),
    { count: 0, value: 0, upi: 0, cod: 0, upiVal: 0, codVal: 0 },
  );

  // ── Cancelled orders — auto loss from forfeited postage ──
  const isCancelled = (o) => /cancel/i.test(String(o["Order Status"] || ""));
  const cancelledOrders = analyticsOrders.filter(isCancelled); // period-scoped
  const cancelledValue = cancelledOrders.reduce(
    (s, o) => s + (o.revenue || 0),
    0,
  );
  // Each cancelled order forfeits the average India Post postage, so the loss
  // is cancelled-count × average post value. Deducted from total profit.
  const cancelledLoss = Math.round(cancelledOrders.length * avgDeliveryCost);
  const netProfit = totalPnL - cancelledLoss;

  // Orders shown in the list/table, optionally narrowed by pick status
  const listOrders = filteredOrders.filter((o) => {
    if (orderPickFilter === "picked") return isOrderFullyPicked(o);
    if (orderPickFilter === "pending") return !isOrderFullyPicked(o);
    return true;
  });
  const pickedOrdersCount = filteredOrders.filter(isOrderFullyPicked).length;

  if (loading) {
    return <OrdersLoader />;
  }

  return (
    <div className={`my-orders-page${darkMode ? " mo-dark" : ""}`}>
      {/* New-order chime (drop the audio file at /public/sounds/new-order.mp3) */}
      <audio
        ref={newOrderAudioRef}
        src="/sounds/new-order.mp3"
        preload="auto"
      />
      <div className="section-1200 flex flex-col gap-24">
        {/* Header, same shape as my-orders */}
        <div className="orders-header orders-header-row">
          <Link href="/" className="flex flex-row gap-8 items-center">
            <ArrowLeft size={18} />
            <div className="flex flex-col">
              <h1 className="font-24">Manage Orders</h1>
              <p className="font-12 dark-50">
                View, manage, and track all customer orders
              </p>
            </div>
          </Link>

          <div className="mo-head-actions">
            <button
              type="button"
              className="mo-bell"
              onClick={toggleDark}
              title={darkMode ? "Switch to light" : "Switch to dark"}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              type="button"
              className={`mo-bell${newOrderCount > 0 ? " has-new" : ""}`}
              onClick={() => setShowNewModal(true)}
              title={
                newOrderCount > 0
                  ? `${newOrderCount} new order${newOrderCount > 1 ? "s" : ""} since your last visit`
                  : "No new orders since your last visit"
              }
            >
              <Bell size={20} />
              {newOrderCount > 0 && (
                <span className="mo-bell-badge">
                  {newOrderCount > 99 ? "99+" : newOrderCount}
                </span>
              )}
            </button>

            {/* Kebab menu — Transactions, Notes, Calculator */}
            <div className="mo-menu-wrap">
              <button
                type="button"
                className="mo-bell"
                onClick={() => setShowToolsMenu((v) => !v)}
                title="More"
                aria-haspopup="true"
                aria-expanded={showToolsMenu}
              >
                <MoreVertical size={20} />
                {notes.length > 0 && (
                  <span className="mo-bell-badge notes">
                    {notes.length > 99 ? "99+" : notes.length}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showToolsMenu && (
                  <>
                    <div
                      className="mo-menu-backdrop"
                      onClick={() => setShowToolsMenu(false)}
                    />
                    <motion.div
                      className="mo-menu"
                      role="menu"
                      initial={{ opacity: 0, scale: 0.94, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.94, y: -6 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                    >
                      <Link
                        href="/manage-orders/transactions"
                        className="mo-menu-item"
                        onClick={() => setShowToolsMenu(false)}
                      >
                        <Wallet size={16} /> Transactions
                      </Link>
                      <button
                        type="button"
                        className="mo-menu-item"
                        onClick={() => {
                          setShowNotes(true);
                          setShowToolsMenu(false);
                        }}
                      >
                        <StickyNote size={16} /> Notes
                        {notes.length > 0 && (
                          <span className="mo-menu-count">{notes.length}</span>
                        )}
                      </button>
                      <button
                        type="button"
                        className="mo-menu-item"
                        onClick={() => {
                          setShowCalc(true);
                          setShowToolsMenu(false);
                        }}
                      >
                        <Calculator size={16} /> Calculator
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Section navigation tabs — switch which section is shown */}
        <div className="mo-tabs">
          {SECTION_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`mo-tab${activeTab === t.key ? " active" : ""}`}
              onClick={() => goToTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Analytics period range nav — sits below the search section */}
        {activeTab === "analytics" && analyticsPeriod !== "all" && (
          <div className="an-nav an-nav-below">
            <button
              type="button"
              className="an-nav-btn"
              onClick={() => setPeriodOffset((o) => o - 1)}
              aria-label={`Previous ${analyticsPeriod}`}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="an-nav-label">{periodWindow.label}</span>
            <button
              type="button"
              className="an-nav-btn"
              onClick={() => setPeriodOffset((o) => Math.min(0, o + 1))}
              disabled={!periodWindow.canNext}
              aria-label={`Next ${analyticsPeriod}`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ===== Analytics (accordion) ===== */}
        {activeTab === "analytics" && (
        <Accordion
          id="analytics"
          title="Analytics"
          open={accOpen.analytics}
          onToggle={toggleAcc}
          right={
            <div className="flex flex-row gap-8 an-actions">
              <button
                className="sec-mid-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  fetchOrders();
                }}
                title="Refresh"
              >
                <RefreshCw size={14} /> <span className="an-btn-label">Refresh</span>
              </button>
              <button
                className="sec-mid-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCustomize((s) => !s);
                }}
                title="Customize analytics"
              >
                <SlidersHorizontal size={14} />{" "}
                <span className="an-btn-label">Customize</span>
              </button>
              <button
                className="sec-mid-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  exportToCSV();
                }}
                title="Export CSV"
              >
                <Download size={14} /> <span className="an-btn-label">Export</span>
              </button>
            </div>
          }
        >
          <div className="admin-dash">
            {/* Customize panel — show / hide analytics sections */}
            {showCustomize && (
              <div className="an-customize">
                <div className="an-customize-head">
                  <span>Show / hide analytics</span>
                  <button
                    type="button"
                    className="an-customize-x"
                    onClick={() => setShowCustomize(false)}
                    aria-label="Close"
                  >
                    <X size={15} />
                  </button>
                </div>
                <div className="an-customize-grid">
                  {ANALYTICS_SECTIONS.map((s) => (
                    <label key={s.key} className="an-customize-item">
                      <input
                        type="checkbox"
                        checked={!!visibleCards[s.key]}
                        onChange={() => toggleCard(s.key)}
                      />
                      {s.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* KPI cards */}
            {visibleCards.kpis && (
            <div className="admin-kpis">
              <div className="kpi kpi-orders">
                <div className="kpi-ic">
                  <ShoppingBag size={18} />
                </div>
                <span className="kpi-value">{analyticsOrders.length}</span>
                <span className="kpi-label">Orders</span>
              </div>
              <div className="kpi kpi-rev">
                <div className="kpi-ic">
                  <IndianRupee size={18} />
                </div>
                <span className="kpi-value">
                  ₹{totalRevenue.toLocaleString()}
                </span>
                <span className="kpi-label">Revenue</span>
              </div>
              <div className="kpi kpi-cost">
                <div className="kpi-ic">
                  <Package size={18} />
                </div>
                <span className="kpi-value">₹{totalCost.toLocaleString()}</span>
                <span className="kpi-label">Total cost</span>
              </div>
              <div
                className={`kpi ${totalPnL >= 0 ? "kpi-profit" : "kpi-loss"}`}
              >
                <div className="kpi-ic">
                  {totalPnL >= 0 ? (
                    <TrendingUp size={18} />
                  ) : (
                    <TrendingDown size={18} />
                  )}
                </div>
                <span className="kpi-value">
                  {totalPnL >= 0 ? "+" : "−"}₹
                  {Math.abs(totalPnL).toLocaleString()}
                </span>
                <span className="kpi-label">Profit · {marginPct}% margin</span>
              </div>
              <div className="kpi kpi-runrate">
                <div className="kpi-ic">
                  <TrendingUp size={18} />
                </div>
                <span className="kpi-value">
                  {ordersPerDay.toFixed(1)}/day
                </span>
                <span className="kpi-label">
                  Run rate · ₹{Math.round(revPerDay).toLocaleString()}/day
                </span>
              </div>
            </div>
            )}

            {/* ===== Bento analytics grid ===== */}
            <div className="an-bento">
              {/* Profit & cost — follows the global period tab */}
              {visibleCards.profitCost && (
              <div className="an-cell an-wide">
                <ProfitCostChart
                  orders={orders}
                  period={analyticsPeriod}
                  offset={periodOffset}
                />
              </div>
              )}

              {/* Delivery cost (India Post weight slabs) */}
              {visibleCards.deliveryCost && (
              <div className="an-cell an-wide">
                <div className="admin-chart-card">
                  <div className="chart-title">Delivery cost · India Post</div>
                  <div className="dc-stats">
                    <div className="dc-stat">
                      <span className="dc-stat-label">Total delivery</span>
                      <strong className="dc-stat-val dc-orange">
                        ₹{totalDeliveryCost.toLocaleString()}
                      </strong>
                    </div>
                    <div className="dc-stat">
                      <span className="dc-stat-label">Avg / order</span>
                      <strong className="dc-stat-val">
                        ₹{avgDeliveryCost.toLocaleString()}
                      </strong>
                    </div>
                    <div className="dc-stat">
                      <span className="dc-stat-label">Total weight</span>
                      <strong className="dc-stat-val">
                        {(totalWeight / 1000).toFixed(1)}kg
                      </strong>
                    </div>
                  </div>
                  <div className="dc-bars">
                    {deliverySlabs.map((s) => (
                      <div key={s.label} className="dc-bar-row">
                        <div className="dc-bar-head">
                          <span className="dc-bar-label">{s.label}</span>
                          <span className="dc-bar-rate">₹{s.rate}</span>
                          <span className="dc-bar-val">
                            <b>{s.count}</b> order{s.count === 1 ? "" : "s"} · ₹
                            {s.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="dc-bar-track">
                          <div
                            className="dc-bar-fill"
                            style={{
                              width: `${Math.max(
                                s.count > 0 ? 6 : 0,
                                (s.count / maxSlabCount) * 100,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="dc-foot">
                    Cost of goods ₹{totalBooksCost.toLocaleString()} + delivery ₹
                    {totalDeliveryCost.toLocaleString()} ={" "}
                    <strong>₹{totalCost.toLocaleString()}</strong> total cost ·
                    profit{" "}
                    <strong
                      className={totalPnL >= 0 ? "dc-pos" : "dc-neg"}
                    >
                      {totalPnL >= 0 ? "+" : "−"}₹
                      {Math.abs(totalPnL).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
              )}

              {/* Daily order-volume area chart */}
              {visibleCards.dailyVolume && (
              <div className="an-cell an-wide">
                <DailyVolumeChart ordersByDay={analyticsByDay} />
              </div>
              )}

              {/* Orders by status */}
              {visibleCards.ordersByStatus && (
              <div className="an-cell">
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
              </div>
              )}

              {/* Order value by status */}
              {visibleCards.valueByStatus && (
              <div className="an-cell">
                <div className="admin-chart-card">
                  <div className="chart-title">Order value by status</div>
                  <div className="sv-list">
                    {statusBreakdown.map((s) => (
                      <div className="sv-row" key={s.key}>
                        <span
                          className="sv-dot"
                          style={{ background: s.color }}
                        />
                        <div className="sv-main">
                          <div className="sv-top">
                            <span className="sv-name">
                              {s.key}
                              <em className="sv-count">{s.count} orders</em>
                            </span>
                            <span className="sv-val">
                              ₹{s.value.toLocaleString()}
                            </span>
                          </div>
                          <div className="sv-pay">
                            <span className="sv-pill sv-upi">
                              {s.upi} UPI · ₹{s.upiVal.toLocaleString()}
                            </span>
                            <span className="sv-pill sv-cod">
                              {s.cod} COD · ₹{s.codVal.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {statusBreakdown.length === 0 && (
                      <div className="sv-empty">No orders in this period.</div>
                    )}
                  </div>
                  {breakdownTotals.count > 0 && (
                    <div className="sv-total">
                      <span className="sv-name">
                        Total
                        <em className="sv-count">
                          {breakdownTotals.count} orders
                        </em>
                      </span>
                      <span className="sv-total-right">
                        <span className="sv-val">
                          ₹{breakdownTotals.value.toLocaleString()}
                        </span>
                        <span className="sv-pay">
                          <span className="sv-pill sv-upi">
                            {breakdownTotals.upi} UPI · ₹
                            {breakdownTotals.upiVal.toLocaleString()}
                          </span>
                          <span className="sv-pill sv-cod">
                            {breakdownTotals.cod} COD · ₹
                            {breakdownTotals.codVal.toLocaleString()}
                          </span>
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* Top-selling books */}
              {visibleCards.topBooks && (
              <div className="an-cell an-wide">
                <div className="admin-chart-card">
                  <div className="chart-title">
                    Top-selling books{" "}
                    <span className="vol-sub">by units sold</span>
                  </div>
                  <HBars
                    items={insights.topBooks.map((b) => ({
                      label: b.name,
                      value: b.units,
                      display: `${b.units} · ₹${b.revenue.toLocaleString()}`,
                    }))}
                  />
                </div>
              </div>
              )}

              {/* Revenue by category */}
              {visibleCards.categoryRevenue && (
              <div className="an-cell">
                <div className="admin-chart-card">
                  <div className="chart-title">Revenue by category</div>
                  <HBars
                    accent="#3b6fe0"
                    items={insights.topCats.map((c) => ({
                      label: c.c,
                      value: c.rev,
                      display: `₹${c.rev.toLocaleString()}`,
                    }))}
                  />
                </div>
              </div>
              )}

              {/* Payment mix */}
              {visibleCards.paymentMix && (
              <div className="an-cell">
                <div className="admin-chart-card">
                  <div className="chart-title">Payment mix</div>
                  <div className="pay-mix">
                    <div className="pay-mix-row">
                      <div className="pay-mix-head">
                        <span>UPI / Prepaid</span>
                        <span>
                          {insights.upiN} · ₹{insights.upiV.toLocaleString()}
                        </span>
                      </div>
                      <div className="ins-track">
                        <div
                          className="ins-fill"
                          style={{
                            width: `${insights.count ? (insights.upiN / insights.count) * 100 : 0}%`,
                            background: "#2563eb",
                          }}
                        />
                      </div>
                    </div>
                    <div className="pay-mix-row">
                      <div className="pay-mix-head">
                        <span>Cash on Delivery</span>
                        <span>
                          {insights.codN} · ₹{insights.codV.toLocaleString()}
                        </span>
                      </div>
                      <div className="ins-track">
                        <div
                          className="ins-fill"
                          style={{
                            width: `${insights.count ? (insights.codN / insights.count) * 100 : 0}%`,
                            background: "#fb8500",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* Busiest weekdays */}
              {visibleCards.weekday && (
              <div className="an-cell">
                <div className="admin-chart-card">
                  <div className="chart-title">Busiest weekdays</div>
                  <ColBars
                    accent="#7c3aed"
                    cols={insights.weekday.map((v, i) => ({
                      label: WEEKDAY_LABELS[i],
                      value: v,
                    }))}
                  />
                </div>
              </div>
              )}

              {/* Peak order hours */}
              {visibleCards.hours && (
              <div className="an-cell">
                <div className="admin-chart-card">
                  <div className="chart-title">
                    Peak order hours{" "}
                    <span className="vol-sub">
                      {insights.hasTime ? "0–23h" : "no time data"}
                    </span>
                  </div>
                  {insights.hasTime ? (
                    <ColBars
                      accent="#0ea5e9"
                      showValues={false}
                      cols={insights.hourArr.map((v, i) => ({
                        label: i % 3 === 0 ? String(i) : "",
                        value: v,
                        hint: `${i}:00`,
                      }))}
                    />
                  ) : (
                    <div className="sv-empty">
                      Order timestamps don’t include a time of day.
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* Top delivery pincodes */}
              {visibleCards.pincodes && (
              <div className="an-cell">
                <div className="admin-chart-card">
                  <div className="chart-title">Top delivery pincodes</div>
                  <HBars
                    accent="#12b76a"
                    items={insights.topPins.map((p) => ({
                      label: p.p,
                      value: p.c,
                      display: `${p.c} order${p.c > 1 ? "s" : ""}`,
                    }))}
                  />
                </div>
              </div>
              )}

              {/* Yearly cumulative run-rate */}
              {visibleCards.runRate && (
              <div className="an-cell an-wide">
                <RunRateChart orders={orders} />
              </div>
              )}

              {/* Operational health ratios */}
              {visibleCards.health && (
              <div className="an-cell an-wide">
                <div className="admin-chart-card">
                  <div className="chart-title">Operational health</div>
                  <div className="pc-stripe">
                    <span className="pc-si">
                      Avg order value <b>₹{insights.aov.toLocaleString()}</b>
                    </span>
                    <span className="pc-si">
                      Delivered <b className="pc-pos">{insights.deliveredPct}%</b>
                    </span>
                    <span className="pc-si">
                      With tracking <b>{insights.trackedPct}%</b>
                    </span>
                    <span className="pc-si">
                      Cancelled{" "}
                      <b className={insights.cancelPct > 0 ? "pc-neg" : ""}>
                        {insights.cancelPct}%
                      </b>
                    </span>
                    <span className="pc-si">
                      Repeat customers <b>{insights.repeatPct}%</b>
                    </span>
                    <span className="pc-si">
                      Unique customers <b>{insights.uniqueCustomers}</b>
                    </span>
                  </div>
                </div>
              </div>
              )}

              {/* Cancelled orders & losses (auto: forfeited postage) */}
              {visibleCards.cancelled && (
              <div className="an-cell an-wide">
                <div className="admin-chart-card">
                  <div className="chart-title">Cancelled orders &amp; losses</div>
                  <div className="dc-stats">
                    <div className="dc-stat">
                      <span className="dc-stat-label">Cancelled orders</span>
                      <strong className="dc-stat-val">
                        {cancelledOrders.length}
                      </strong>
                    </div>
                    <div className="dc-stat">
                      <span className="dc-stat-label">Cancelled value</span>
                      <strong className="dc-stat-val">
                        ₹{cancelledValue.toLocaleString()}
                      </strong>
                    </div>
                    <div className="dc-stat">
                      <span className="dc-stat-label">Cancelled loss</span>
                      <strong className="dc-stat-val dc-neg">
                        −₹{cancelledLoss.toLocaleString()}
                      </strong>
                    </div>
                    <div className="dc-stat">
                      <span className="dc-stat-label">Net profit</span>
                      <strong
                        className={`dc-stat-val ${
                          netProfit >= 0 ? "dc-pos" : "dc-neg"
                        }`}
                      >
                        {netProfit >= 0 ? "+" : "−"}₹
                        {Math.abs(netProfit).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                  <div className="dc-foot">
                    {cancelledOrders.length} cancelled order
                    {cancelledOrders.length === 1 ? "" : "s"} × avg postage ₹
                    {avgDeliveryCost.toLocaleString()} ={" "}
                    <strong className="dc-neg">
                      −₹{cancelledLoss.toLocaleString()}
                    </strong>{" "}
                    deducted from profit ₹{totalPnL.toLocaleString()} → net{" "}
                    <strong className={netProfit >= 0 ? "dc-pos" : "dc-neg"}>
                      ₹{netProfit.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>
        </Accordion>
        )}

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
                    <label className="admin-field-label">Analytics period</label>
                    <div className="admin-select-wrap">
                      <select
                        className="admin-select"
                        value={analyticsPeriod}
                        onChange={(e) => selectPeriod(e.target.value)}
                      >
                        <option value="day">Day</option>
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                        <option value="all">All time</option>
                      </select>
                    </div>
                  </div>
                  <div className="admin-field">
                    <label className="admin-field-label">Order Status</label>
                    <div className="admin-select-wrap">
                      <select
                        className="admin-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="active">
                          Active (Pending + Processing + Getting Shipped)
                        </option>
                        <option value="all">All Statuses</option>
                        <option value="Processing">Processing</option>
                        <option value="Getting Shipped">Getting Shipped</option>
                        <option value="Shipped">Shipped</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Out for Delivery">
                          Out for Delivery
                        </option>
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
        {activeTab === "calendar" && (
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
                  {new Date(dateFrom + "T00:00:00").toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                    },
                  )}
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
        )}

        {/* ===== India Post booking sheet (accordion) ===== */}
        {activeTab === "indiapost" && (
        <Accordion
          id="indiapost"
          title="India Post booking (copy-paste)"
          icon={<Truck size={16} />}
          open={accOpen.indiapost}
          onToggle={toggleAcc}
          right={
            <span className="acc-count">
              {
                orders.filter((o) =>
                  /getting shipped/i.test(o["Order Status"] || ""),
                ).length
              }
            </span>
          }
        >
          <IndiaPostSheet
            orders={orders}
            copyToClipboard={copyToClipboard}
            copiedId={copiedId}
          />
        </Accordion>
        )}

        {/* ===== Orders (accordion) ===== */}
        {activeTab === "orders" && (
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
                  {listOrders.length}{" "}
                  {listOrders.length === 1 ? "Order" : "Orders"}
                  <span className="orders-picked-stat">
                    · {pickedOrdersCount}/{filteredOrders.length} picked
                  </span>
                </span>
                <div className="orders-header-right mo-menu-wrap">
                  <div className="mo-view-toggle mo-view-icons">
                    <button
                      type="button"
                      className="mo-view-btn"
                      onClick={() =>
                        setSortOrder((s) => (s === "desc" ? "asc" : "desc"))
                      }
                      title={
                        sortOrder === "desc"
                          ? "Latest first (tap for oldest)"
                          : "Oldest first (tap for latest)"
                      }
                      aria-label="Toggle sort order"
                    >
                      <motion.span
                        animate={{ rotate: sortOrder === "desc" ? 0 : 180 }}
                        transition={{
                          type: "spring",
                          stiffness: 320,
                          damping: 22,
                        }}
                        style={{ display: "inline-flex" }}
                      >
                        <ArrowUpDown size={16} />
                      </motion.span>
                    </button>
                    <span className="mo-view-div" />
                    <button
                      type="button"
                      className={`mo-view-btn${orderView === "cards" ? " active" : ""}`}
                      onClick={() => setOrderView("cards")}
                      title="Card view"
                      aria-label="Card view"
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button
                      type="button"
                      className={`mo-view-btn${orderView === "table" ? " active" : ""}`}
                      onClick={() => setOrderView("table")}
                      title="Table view"
                      aria-label="Table view"
                    >
                      <List size={16} />
                    </button>
                    <span className="mo-view-div" />
                    <button
                      type="button"
                      className="mo-view-btn"
                      onClick={() => setShowListMenu((v) => !v)}
                      title="More"
                      aria-haspopup="true"
                      aria-expanded={showListMenu}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  <AnimatePresence>
                    {showListMenu && (
                      <>
                        <div
                          className="mo-menu-backdrop"
                          onClick={() => setShowListMenu(false)}
                        />
                        <motion.div
                          className="mo-menu"
                          role="menu"
                          initial={{ opacity: 0, scale: 0.94, y: -6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.94, y: -6 }}
                          transition={{ duration: 0.16, ease: "easeOut" }}
                        >
                          <button
                            type="button"
                            className="mo-menu-item"
                            onClick={() => {
                              exportGettingShippedCSV();
                              setShowListMenu(false);
                            }}
                          >
                            <Download size={16} /> Shipped CSV
                          </button>
                          <button
                            type="button"
                            className="mo-menu-item"
                            onClick={() => {
                              downloadCoversPNG();
                              setShowListMenu(false);
                            }}
                          >
                            <Download size={16} /> Covers PNG
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="orders-toolbar">
                <div className="mo-view-toggle">
                  {[
                    { k: "all", label: "All" },
                    { k: "pending", label: "Not picked" },
                    { k: "picked", label: "Picked" },
                  ].map((f) => (
                    <button
                      key={f.k}
                      type="button"
                      className={`mo-view-btn${orderPickFilter === f.k ? " active" : ""}`}
                      onClick={() => setOrderPickFilter(f.k)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {orderView === "table" && selectedIds.length > 0 && (
                <div className="orders-bulk-bar">
                  <div className="bulk-head">
                    <span className="bulk-count">
                      {selectedIds.length} selected
                    </span>
                    <button
                      type="button"
                      className="mo-view-btn bulk-clear"
                      onClick={() => setSelectedIds([])}
                    >
                      Clear
                    </button>
                  </div>

                  {/* Download section — combined shipping form for selected */}
                  <div className="bulk-section">
                    <div className="mo-dl-group">
                      <span className="mo-dl-group-label">
                        <span className="mo-dl-icon">
                          <Download size={20} />
                        </span>
                        <span className="mo-dl-text">
                          Shipping form
                          <em>India Post + From/To in one frame</em>
                        </span>
                      </span>
                      <button
                        type="button"
                        className="mo-form-btn mo-dl-pdf"
                        onClick={() => downloadSelectedForms("pdf")}
                        title="All selected orders in one printable PDF (one order per page)"
                      >
                        PDF
                      </button>
                      <button
                        type="button"
                        className="mo-form-btn mo-dl-png"
                        onClick={() => downloadSelectedForms("png")}
                        title="One PNG image per selected order"
                      >
                        PNG
                      </button>
                    </div>
                  </div>

                  <div className="bulk-divider" />

                  {/* Bulk WhatsApp — choose a stage from the dropdown, then hit
                      the arrow to message all selected readers */}
                  <div className="bulk-wa-row">
                    <span className="bulk-wa-label">
                      <MessageCircle size={13} /> Message all on WhatsApp:
                    </span>
                    <div className="bulk-wa-picker">
                      <select
                        className="bulk-wa-select"
                        value={waPick}
                        onChange={(e) => setWaPick(e.target.value)}
                      >
                        <option value="">Choose a message…</option>
                        {waMessages({}).map((m) => (
                          <option key={m.key} value={m.key}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                      {waPick && (
                        <button
                          type="button"
                          className="bulk-wa-go"
                          title="Send this message to all selected"
                          onClick={() => {
                            setBulkStage(waPick);
                            setBulkSent([]);
                          }}
                        >
                          <ArrowRight size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {orderView === "cards" ? (
                <div className="admin-orders-grid">
                {listOrders.map((order, idx) => {
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
                  const pickedCount = books.reduce(
                    (n, _b, i) =>
                      n + (pickChecked[bookKey(orderId, i)] ? 1 : 0),
                    0,
                  );
                  const allPicked =
                    books.length > 0 && pickedCount === books.length;
                  // Value (₹) of the books picked so far vs the full order.
                  const pickedValue = books.reduce(
                    (s, b, i) =>
                      s +
                      (pickChecked[bookKey(orderId, i)] ? b.total || 0 : 0),
                    0,
                  );
                  const totalBooksValue = books.reduce(
                    (s, b) => s + (b.total || 0),
                    0,
                  );
                  // Relative age of the order ("2 days ago") for the card badge
                  const orderDate = getOrderDate(order);
                  let agoLabel = "";
                  if (orderDate) {
                    const days = Math.floor(
                      (Date.now() - orderDate.getTime()) / 86400000,
                    );
                    agoLabel =
                      days <= 0
                        ? "Today"
                        : days === 1
                          ? "Yesterday"
                          : `${days} days ago`;
                  }
                  const isCOD = /cash|cod/i.test(order["Payment Type"] || "");
                  const oidStr = String(orderId || "");
                  const formData = {
                    orderId,
                    customerName: order["Customer Name"],
                    customerAddress: order["Address"],
                    customerCity: order["City"],
                    customerState: order["State"],
                    customerPincode: order["Pincode"],
                    customerPhone: order["Phone Number"],
                    totalValueRs: order.revenue,
                    isCOD,
                    codAmount: order.revenue,
                  };

                  return (
                    <div
                      key={orderId || idx}
                      className={`admin-order-card mo-card${isPacked ? " packed" : ""}`}
                    >
                      <div className="mo-card-top">
                        <div className="mo-card-id">
                          <div className="mo-name-row">
                            <span className="mo-srno">{idx + 1}</span>
                            <span className="mo-name">
                              {order["Customer Name"] || "—"}
                            </span>
                          </div>
                          <div
                            className="mo-meta"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Phone size={12} />
                            <span className="mo-meta-val">
                              +91 {order["Phone Number"]}
                            </span>
                            <button
                              type="button"
                              className="mo-copy-ic"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(
                                  String(order["Phone Number"] || ""),
                                  `phone-${idx}`,
                                );
                              }}
                              title="Copy phone"
                            >
                              {copiedId === `phone-${idx}` ? (
                                <Check size={12} className="text-green" />
                              ) : (
                                <Copy size={11} className="gray-500" />
                              )}
                            </button>
                          </div>
                          <div
                            className="mo-meta"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="mo-meta-label">Order</span>
                            <span className="mo-meta-val">
                              {oidStr.slice(0, -3)}
                              <span className="mo-oid-hl">
                                {oidStr.slice(-3)}
                              </span>
                            </span>
                            <button
                              type="button"
                              className="mo-copy-ic"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(orderId, `order-${idx}`);
                              }}
                              title="Copy order ID"
                            >
                              {copiedId === `order-${idx}` ? (
                                <Check size={12} className="text-green" />
                              ) : (
                                <Copy size={11} className="gray-500" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="mo-card-badges">
                          {agoLabel && (
                            <span
                              className="mo-ago"
                              title={
                                orderDate
                                  ? orderDate.toLocaleString("en-IN")
                                  : ""
                              }
                            >
                              <Clock size={11} /> {agoLabel}
                            </span>
                          )}
                          <span className="mo-status-pill">
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Amount (big, green) — above the covers; opens detail.
                          WhatsApp icon opens the message picker for this order. */}
                      <div className="mo-amount-row">
                        <button
                          type="button"
                          className="mo-amount"
                          onClick={() => setDetailOrder(order)}
                          title="View order details"
                        >
                          ₹{order.revenue.toLocaleString()}
                        </button>
                        <button
                          type="button"
                          className="mo-wa-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setWaCustomText("");
                            setWaPickerOrder(order);
                          }}
                          title="WhatsApp the customer"
                          aria-label="WhatsApp the customer"
                        >
                          <FaWhatsapp size={18} />
                        </button>
                      </div>

                      {/* Book covers — scrollable row, tap to mark picked */}
                      {books.length > 0 && (
                        <div
                          className="mo-covers"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {books.map((b, ci) => {
                            const img = getBookImage(b.name);
                            const checked =
                              !!pickChecked[bookKey(orderId, ci)];
                            return (
                              <button
                                key={ci}
                                type="button"
                                className={`mo-cover${checked ? " checked" : ""}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBook(orderId, ci);
                                }}
                                title={b.name}
                              >
                                {img ? (
                                  <img src={img} alt={b.name} loading="lazy" />
                                ) : (
                                  <div className="mo-cover-ph">
                                    <Package size={18} />
                                  </div>
                                )}
                                <span className="mo-cover-check">
                                  <Check size={16} />
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Date · book count · picked badge — below the images */}
                      <div className="mo-card-desc">
                        <span className="mo-desc-item">
                          <Calendar size={11} />
                          {formatDate(
                            order["Timestamp(D)"] || order["Timestamp"],
                          )}
                        </span>
                        <span className="aoc-dot">·</span>
                        <span>
                          {books.length} book{books.length > 1 ? "s" : ""}
                        </span>
                        {books.length > 0 && (
                          <span
                            className={`mo-pick-badge ${
                              allPicked
                                ? "done"
                                : pickedCount > 0
                                  ? "partial"
                                  : ""
                            }`}
                          >
                            {allPicked
                              ? `✓ Picked · ₹${pickedValue.toLocaleString()}`
                              : pickedCount > 0
                                ? `Partially picked ${pickedCount}/${books.length} · ₹${pickedValue.toLocaleString()} of ₹${totalBooksValue.toLocaleString()}`
                                : "Not picked"}
                          </span>
                        )}
                      </div>

                      {/* Per-order note — critical, attention-grabbing when set */}
                      {orderNotes[orderId] ? (
                        <button
                          type="button"
                          className="mo-note-flag"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNoteEditor({
                              orderId,
                              draft: orderNotes[orderId],
                            });
                          }}
                          title="Edit note"
                        >
                          <span className="mo-note-flag-ic">
                            <AlertCircle size={15} />
                          </span>
                          <span className="mo-note-flag-txt">
                            {orderNotes[orderId]}
                          </span>
                          <Pencil size={13} className="mo-note-flag-edit" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="mo-note-add"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNoteEditor({ orderId, draft: "" });
                          }}
                        >
                          <StickyNote size={14} /> Add note
                        </button>
                      )}

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            key="body"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              duration: 0.28,
                              ease: [0.32, 0.72, 0, 1],
                            }}
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
                                    onClick={() =>
                                      copyToClipboard(
                                        addressLine,
                                        `address-${idx}`,
                                      )
                                    }
                                    title="Copy address"
                                  >
                                    <span className="aoc-rowline-text">
                                      {addressLine}
                                    </span>
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
                                        Tracking:{" "}
                                        <strong>{order.shippingId}</strong>
                                      </span>
                                    ) : (
                                      <span className="aoc-track-id">
                                        Order link ready
                                      </span>
                                    )}
                                    <div className="flex flex-row gap-8">
                                      {hasTracking && (
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
                                      {hasTinyUrl && (
                                        <button
                                          type="button"
                                          className="track-btn-small flex flex-row items-center gap-4"
                                          onClick={() =>
                                            window.open(
                                              tinyUrl,
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
                                  <MessageCircle size={13} /> WhatsApp the
                                  customer
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
                                        openWhatsApp(
                                          order["Phone Number"],
                                          m.text,
                                        );
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
                                              <span className="aoc-book-qty">
                                                ×{b.quantity}
                                              </span>
                                            )}
                                          </div>
                                          <span
                                            className="aoc-book-name"
                                            title={b.name}
                                          >
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
                                      <span className="aoc-extra">
                                        Delivery +₹{order["Delivery Charge"]}
                                      </span>
                                    )}
                                    {order["Gift Wrap"] === "Yes" && (
                                      <span className="aoc-extra">
                                        <Gift size={11} /> Gift wrap +₹
                                        {order["Gift Wrap Charge"] || 0}
                                      </span>
                                    )}
                                    {order["Offer Applied"] && (
                                      <span className="aoc-extra">
                                        Offer: {order["Offer Applied"]}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="aoc-money">
                                <div className="aoc-money-cell">
                                  <span>Revenue</span>
                                  <strong>
                                    ₹{order.revenue.toLocaleString()}
                                  </strong>
                                </div>
                                <div className="aoc-money-cell">
                                  <span>Cost</span>
                                  <strong>
                                    ₹{order.totalCost.toLocaleString()}
                                  </strong>
                                </div>
                                <div
                                  className={`aoc-money-cell ${pnl >= 0 ? "pos" : "neg"}`}
                                >
                                  <span>Profit</span>
                                  <strong>
                                    {pnl >= 0 ? "+" : "−"}₹
                                    {Math.abs(pnl).toLocaleString()}
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
              ) : (
                <div className="mo-table-wrap">
                  <table className="mo-table">
                    <thead>
                      <tr>
                        <th className="mo-th-check">
                          <input
                            type="checkbox"
                            checked={
                              listOrders.length > 0 &&
                              listOrders.every((o) =>
                                selectedIds.includes(o["Order ID"]),
                              )
                            }
                            onChange={(e) =>
                              setSelectedIds(
                                e.target.checked
                                  ? listOrders.map((o) => o["Order ID"])
                                  : [],
                              )
                            }
                            aria-label="Select all"
                          />
                        </th>
                        <th>#</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Order</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listOrders.map((order, i) => {
                        const oid = order["Order ID"];
                        const sel = selectedIds.includes(oid);
                        return (
                          <tr
                            key={oid || i}
                            className={`mo-trow${sel ? " sel" : ""}`}
                          >
                            <td
                              className="mo-td-check"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={sel}
                                onChange={(e) =>
                                  setSelectedIds((prev) =>
                                    e.target.checked
                                      ? [...prev, oid]
                                      : prev.filter((x) => x !== oid),
                                  )
                                }
                                aria-label="Select order"
                              />
                            </td>
                            <td onClick={() => setDetailOrder(order)}>
                              {i + 1}
                            </td>
                            <td
                              className="mo-td-name"
                              onClick={() => setDetailOrder(order)}
                            >
                              {order["Customer Name"] || "—"}
                            </td>
                            <td className="mo-td-mono">
                              {order["Phone Number"]}
                            </td>
                            <td className="mo-td-mono">
                              …{String(oid || "").slice(-6)}
                            </td>
                            <td
                              className="mo-td-amt"
                              onClick={() => setDetailOrder(order)}
                            >
                              ₹{(order.revenue || 0).toLocaleString()}
                            </td>
                            <td>
                              <span className="mo-status-pill sm">
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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
        )}
      </div>

      {/* ===== Calculator ===== */}
      <AnimatePresence>
        {showCalc && <CalculatorModal onClose={() => setShowCalc(false)} />}
      </AnimatePresence>

      {/* ===== WhatsApp message picker (per order) ===== */}
      <AnimatePresence>
        {waPickerOrder && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setWaPickerOrder(null)}
          >
            <motion.div
              className="bill-modal wa-picker-modal"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <div className="flex flex-col">
                  <span className="weight-600 font-16 flex items-center gap-8">
                    <FaWhatsapp size={16} /> Message{" "}
                    {waPickerOrder["Customer Name"] || "customer"}
                  </span>
                  <span className="font-12 gray-500">
                    +91 {waPickerOrder["Phone Number"]}
                  </span>
                </div>
                <span
                  className="cursor-pointer"
                  onClick={() => setWaPickerOrder(null)}
                >
                  <X size={18} />
                </span>
              </div>

              <div className="wa-picker-grid">
                {waMessages(waPickerOrder).map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    className="wa-picker-chip"
                    title={m.text}
                    onClick={() => {
                      openWhatsApp(waPickerOrder["Phone Number"], m.text);
                      setWaPickerOrder(null);
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="wa-custom">
                <span className="wa-custom-label">
                  <Pencil size={13} /> Custom message
                </span>
                <textarea
                  className="sec-mid-btn textarea wa-custom-input"
                  placeholder="Type a custom WhatsApp message…"
                  value={waCustomText}
                  rows={3}
                  onChange={(e) => setWaCustomText(e.target.value)}
                />
                <button
                  type="button"
                  className="pri-big-btn wa-custom-send"
                  disabled={!waCustomText.trim()}
                  onClick={() => {
                    openWhatsApp(
                      waPickerOrder["Phone Number"],
                      waCustomText.trim(),
                    );
                    setWaPickerOrder(null);
                  }}
                >
                  <Send size={15} /> Send on WhatsApp
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Per-order note editor ===== */}
      <AnimatePresence>
        {noteEditor && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNoteEditor(null)}
          >
            <motion.div
              className="bill-modal note-editor-modal"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <span className="weight-600 font-16 flex items-center gap-8">
                  <StickyNote size={16} /> Order note
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => setNoteEditor(null)}
                >
                  <X size={18} />
                </span>
              </div>
              <textarea
                className="sec-mid-btn textarea note-editor-input"
                placeholder="e.g. Call before dispatch · address needs confirming · hold till 5th…"
                value={noteEditor.draft}
                autoFocus
                rows={4}
                onChange={(e) =>
                  setNoteEditor((n) => ({ ...n, draft: e.target.value }))
                }
              />
              <div className="note-editor-actions">
                {orderNotes[noteEditor.orderId] && (
                  <button
                    type="button"
                    className="sec-mid-btn note-del"
                    onClick={() => saveOrderNote(noteEditor.orderId, "")}
                  >
                    <Delete size={15} /> Remove
                  </button>
                )}
                <button
                  type="button"
                  className="pri-big-btn note-save"
                  onClick={() =>
                    saveOrderNote(noteEditor.orderId, noteEditor.draft)
                  }
                >
                  <Send size={15} /> Save note
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Notes (chat-style, slide-up) ===== */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNotes(false)}
          >
            <motion.div
              className="bill-modal notes-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <div className="bill-header">
                <span className="weight-600 font-16 flex flex-row gap-8 items-center">
                  <StickyNote size={18} /> Notes
                </span>
                <div className="flex flex-row gap-8 items-center">
                  <button
                    type="button"
                    className="sec-mid-btn"
                    onClick={downloadNotesCSV}
                    disabled={!notes.length}
                    title="Download notes as CSV"
                  >
                    <Download size={14} /> CSV
                  </button>
                  <span
                    className="cursor-pointer"
                    onClick={() => setShowNotes(false)}
                  >
                    <X size={16} />
                  </span>
                </div>
              </div>

              <div className="notes-list">
                {notes.length === 0 && (
                  <div className="notes-empty">
                    No notes yet. Type below and hit send to start.
                  </div>
                )}
                {notes.map((nt) => {
                  const d = new Date(nt.ts);
                  return (
                    <div className="note-bubble" key={nt.id}>
                      <div className="note-text">{nt.text}</div>
                      <div className="note-meta">
                        <span>
                          {d.toLocaleDateString("en-IN", { weekday: "short" })},{" "}
                          {d.toLocaleDateString("en-IN")} ·{" "}
                          {d.toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <button
                          type="button"
                          className="note-del"
                          onClick={() => deleteNote(nt.id)}
                          title="Delete note"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                <div ref={notesEndRef} />
              </div>

              <div className="notes-input-row">
                <input
                  type="text"
                  className="sec-mid-btn width100"
                  placeholder="Type a note…"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendNote();
                  }}
                />
                <button
                  type="button"
                  className="pri-big-btn"
                  onClick={sendNote}
                  disabled={!noteInput.trim()}
                  aria-label="Send note"
                >
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ===== Bulk WhatsApp send (slide-up) ===== */}
      <AnimatePresence>
        {bulkStage && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBulkStage(null)}
          >
            <motion.div
              className="bill-modal bulk-wa-modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const selectedOrders = orders.filter((o) =>
                  selectedIds.includes(o["Order ID"]),
                );
                const stageLabel =
                  waMessages({}).find((m) => m.key === bulkStage)?.label ||
                  "Message";
                const nextUnsent = selectedOrders.find(
                  (o) => !bulkSent.includes(o["Order ID"]),
                );
                const sendOne = (o) => {
                  const msg = waMessages(o).find((m) => m.key === bulkStage);
                  if (!msg) return;
                  openWhatsApp(o["Phone Number"], msg.text);
                  setBulkSent((prev) =>
                    prev.includes(o["Order ID"])
                      ? prev
                      : [...prev, o["Order ID"]],
                  );
                };
                return (
                  <>
                    <div className="bill-header">
                      <span className="weight-600 font-16 flex flex-col">
                        <span className="flex flex-row gap-8 items-center">
                          <MessageCircle size={18} /> {stageLabel}
                        </span>
                        <span className="font-12 dark-50">
                          {bulkSent.length}/{selectedOrders.length} sent · tap
                          Send to open each chat (message pre-filled)
                        </span>
                      </span>
                      <span
                        className="cursor-pointer"
                        onClick={() => setBulkStage(null)}
                      >
                        <X size={16} />
                      </span>
                    </div>

                    {nextUnsent && (
                      <button
                        type="button"
                        className="pri-big-btn width100 bulk-wa-next"
                        onClick={() => sendOne(nextUnsent)}
                      >
                        <FaWhatsapp size={15} /> Send to next —{" "}
                        {nextUnsent["Customer Name"] || "reader"}
                      </button>
                    )}

                    <div className="bulk-wa-list">
                      {selectedOrders.map((o) => {
                        const sent = bulkSent.includes(o["Order ID"]);
                        return (
                          <div
                            key={o["Order ID"]}
                            className={`bulk-wa-item ${sent ? "sent" : ""}`}
                          >
                            <div className="bulk-wa-meta">
                              <span className="bulk-wa-name">
                                {o["Customer Name"] || "—"}
                              </span>
                              <span className="bulk-wa-phone">
                                +91 {o["Phone Number"]}
                              </span>
                            </div>
                            <button
                              type="button"
                              className={`bulk-wa-send ${sent ? "done" : ""}`}
                              onClick={() => sendOne(o)}
                            >
                              {sent ? (
                                <>
                                  <Check size={14} /> Sent
                                </>
                              ) : (
                                <>
                                  <FaWhatsapp size={14} /> Send
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== New orders modal (slide-up) ===== */}
      <AnimatePresence>
        {showNewModal && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNewModal(false)}
          >
            <motion.div
              className="bill-modal"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "560px" }}
            >
              <div className="bill-header">
                <div className="flex flex-col">
                  <span className="weight-600 font-16 flex items-center gap-8">
                    <Bell size={16} /> New orders
                  </span>
                  <span className="font-12 gray-500">
                    {newOrderCount > 0
                      ? `${newOrderCount} since your last visit`
                      : "You're all caught up"}
                  </span>
                </div>
                <span
                  className="cursor-pointer"
                  onClick={() => setShowNewModal(false)}
                >
                  <X size={18} />
                </span>
              </div>

              {pinnedTxns.length > 0 && (
                <div className="pinned-txns">
                  {pinnedTxns.map((t) => (
                    <Link
                      key={t.id}
                      href="/manage-orders/transactions"
                      className="pinned-txn"
                      onClick={() => setShowNewModal(false)}
                    >
                      <span className="pt-note">
                        <Pin size={12} className="tx-pinned-ic" />
                        {t.note ||
                          (t.type === "income" ? "Income" : "Expense")}
                      </span>
                      <span className={`pt-amt ${t.type}`}>
                        {t.type === "income" ? "+" : "−"}₹
                        {(t.amount || 0).toLocaleString("en-IN")}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              <div className="mo-new-list">
                {newOrders.length > 0 ? (
                  newOrders.map((o, i) => {
                    const nb = o.parsedBooks || [];
                    const nid = String(o["Order ID"] || "");
                    return (
                      <button
                        key={nid || i}
                        type="button"
                        className="mo-new-item"
                        onClick={() => {
                          setShowNewModal(false);
                          setDetailOrder(o);
                        }}
                      >
                        <div className="mo-new-top">
                          <span className="mo-new-name">
                            {o["Customer Name"] || "—"}
                          </span>
                          <span className="mo-new-amt">
                            ₹{(o.revenue || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="mo-new-sub">
                          <span>
                            {nid.slice(0, -3)}
                            <span className="mo-oid-hl">{nid.slice(-3)}</span>
                          </span>
                          <span className="aoc-dot">·</span>
                          <span>
                            {formatDate(
                              o["Timestamp(D)"] || o["Timestamp"],
                            )}
                          </span>
                          <span className="aoc-dot">·</span>
                          <span>
                            {nb.length} book{nb.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className="mo-new-empty">
                    No new orders since your last visit 🎉
                  </p>
                )}
              </div>

              {newOrders.length > 0 && (
                <button
                  type="button"
                  className="pri-big-btn width100"
                  onClick={() => {
                    markOrdersSeen();
                    setShowNewModal(false);
                  }}
                >
                  Mark as read
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Order detail modal (slide-up, bill-modal style) ===== */}
      <AnimatePresence>
        {detailOrder &&
          (() => {
            const order = detailOrder;
            const oid = order["Order ID"];
            const dbooks = order.parsedBooks || [];
            const dpnl = order.pnl;
            // Books not yet picked (checked) → offer an out-of-stock hold message
            const dUnpicked = dbooks.filter(
              (_b, i) => !pickChecked[bookKey(oid, i)],
            );
            const dCustName = order["Customer Name"]
              ? String(order["Customer Name"]).trim()
              : "there";
            const oosMany = dUnpicked.length > 1;
            const oosMessage =
              `Hi ${dCustName}, this is TheBookX 📚\n\n` +
              `A quick update on your order${
                oid ? ` (Order ${oid})` : ""
              } — the following ${dUnpicked.length} book${
                oosMany ? "s are" : " is"
              } *temporarily out of stock*:\n\n` +
              `${dUnpicked.map((b) => `• ${b.name}`).join("\n")}\n\n` +
              `We're restocking ${
                oosMany ? "them" : "it"
              } and will *inform you the moment ${
                oosMany ? "they're" : "it's"
              } back*. Until then we're *holding your order as Processing* so your ${
                oosMany ? "copies are" : "copy is"
              } reserved for you. 🙏\n\n` +
              `Thank you for your patience! 💛\n\n` +
              `🔎 View your order anytime: ${PROFILE_URL}\n— Team TheBookX 📚`;
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
                          copyToClipboard(
                            order["Customer Name"] || "",
                            "m-name",
                          )
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
                        <div className="aoc-rowline aoc-rowline-static">
                          <span className="aoc-rowline-text mo-meta-val">
                            {dAddrLine}
                          </span>
                        </div>
                      )}
                      {(dHasTracking || dHasTiny) && (
                        <div className="aoc-track">
                          {dHasTracking ? (
                            <span className="aoc-track-id">
                              Tracking: <strong>{order.shippingId}</strong>
                            </span>
                          ) : (
                            <span className="aoc-track-id">
                              Order link ready
                            </span>
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
                        {dUnpicked.length > 0 && (
                          <button
                            type="button"
                            className="aoc-wa-btn aoc-wa-oos"
                            title={oosMessage}
                            onClick={() =>
                              openWhatsApp(order["Phone Number"], oosMessage)
                            }
                          >
                            📕 Out of stock ({dUnpicked.length}) · hold
                          </button>
                        )}
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
                      <div className="aoc-edit-row">
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
                        <button
                          type="button"
                          className="aoc-delete"
                          onClick={() => deleteOrderRow(order)}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
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
