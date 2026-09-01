// app/manage-orders/page.js
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  downloadCombinedFormPNG,
  downloadCombinedFormsPNGs,
  downloadCombinedFormsPDF,
  downloadAddressLabelsPNGs,
  downloadAddressLabelsPDF,
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
  CheckSquare,
  Wallet,
  Pin,
  Pencil,
  MoreVertical,
  Calculator,
  Delete,
  Moon,
  Sun,
  Users,
  LayoutDashboard,
  Radar,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { books as ALL_BOOKS } from "@/utils/book";
import { getBookCost } from "@/data/bookCosts";
import { creditWalletReward, appendWalletTx } from "@/utils/googleFormOrder";
import { showToast } from "@/context/ToastContext";
import { getDeliveryCharge } from "@/utils/cartOffers";

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

// Collapse a redundant delivery-type value like "Standard Delivery (Standard
// Delivery)" — the checkout stores the label twice — into a single clean label.
const cleanDeliveryType = (raw) => {
  let s = String(raw || "").trim();
  if (!s) return "—";
  // "A (A)" or "A (a)" → "A"
  const m = s.match(/^(.*?)\s*\((.*?)\)\s*$/);
  if (m && m[1].trim().toLowerCase() === m[2].trim().toLowerCase()) {
    s = m[1].trim();
  }
  // "Standard Delivery Delivery" → "Standard Delivery"
  s = s.replace(/\b(\w+)\s+\1\b/gi, "$1");
  return s || "—";
};

// Prefilled, nicely-formatted WhatsApp messages for each order stage.
// Includes the tracking ID + India Post link (when a tracking ID exists)
// and the customer's order-tracking profile link.
/* ---- CSV export ----------------------------------------------------------
   Builds a spreadsheet-safe CSV and triggers a browser download. Values are
   always quoted and inner quotes doubled, so commas, newlines and quotes in
   addresses survive the round-trip into Excel / Sheets. */
const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const downloadCsv = (filename, headers, rows) => {
  const body = [headers, ...rows]
    .map((r) => r.map(csvCell).join(","))
    .join("\r\n");
  // BOM keeps Excel happy with the ₹ sign and any non-ASCII address text.
  const blob = new Blob(["﻿" + body], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const PROFILE_URL = "https://www.thebookx.in/profile";
const INDIA_POST_URL = "https://www.indiapost.gov.in";

// Polite "some books are out of stock" WhatsApp message listing the specific
// unpicked titles, offering a swap or refund.
const booksUnavailableMessage = (order, names) => {
  const nm = String(order["Customer Name"] || "").trim() || "there";
  const many = names.length > 1;
  return [
    `Hi ${nm} 👋`,
    "",
    "Thank you for your order with *TheBookX*! 📚",
    "",
    `Unfortunately, the following ${many ? "titles are" : "title is"} currently *out of stock*:`,
    ...names.map((n) => `• ${n}`),
    "",
    `*Order ID:* ${order["Order ID"] || "-"}`,
    "",
    "We'd love to make it right — you can choose:",
    "1️⃣  *Swap* with a similar book, or",
    "2️⃣  A quick *refund* for that amount.",
    "",
    "Just reply here and we'll sort it out right away. So sorry for the inconvenience 🙏",
  ].join("\n");
};

const waMessages = (order) => {
  const name = order?.["Customer Name"]
    ? String(order["Customer Name"]).trim()
    : "there";
  const orderId = order?.["Order ID"] || "";
  const tracking = String(
    order?.shippingId || order?.["Shipping ID"] || "",
  ).trim();
  const hi = `Hi ${name} 👋`;

  // Link block appended below every message: a divider, the customer's order
  // link, the tracking ID and the India Post tracking link (tracking lines only
  // when a tracking ID exists). Consistent across all stages.
  const orderLink = orderId
    ? `https://thebookx.in?orderID=${encodeURIComponent(orderId)}`
    : PROFILE_URL;
  const linkBlock =
    `\n\n━━━━━━━━━━━━━━` +
    (orderId ? `\n📦 *Order ID:* ${orderId}` : "") +
    `\n🔗 *Your order:* ${orderLink}` +
    (tracking
      ? `\n🚚 *Tracking ID:* ${tracking}\n📍 Track: ${INDIA_POST_URL}`
      : "") +
    `\n\n— Team *TheBookX* 📚`;

  // Every message opens with an emoji *stage headline*, a short note, then the
  // link block below.
  return [
    {
      key: "confirm",
      label: "Confirm order",
      text: `✅ *Confirm your order*\n\n${hi}\n\nWe've received your order. Please reply *YES* to confirm so we can pack and ship it right away.${linkBlock}`,
    },
    {
      key: "about",
      label: "About to ship",
      text: `📦 *About to ship*\n\n${hi}\n\nYour TheBookX order is packed and about to ship. Tracking details will follow shortly.${linkBlock}`,
    },
    {
      key: "shipped",
      label: "Shipped",
      text: `🚚 *Shipped*\n\n${hi}\n\nYour order is on its way! Expected delivery in *5–9 days* (slight delays possible in bad weather — thanks for your patience).${linkBlock}`,
    },
    {
      key: "transit",
      label: "In Transit",
      text: `🛣️ *In transit*\n\n${hi}\n\nYour TheBookX order is in transit and will be reaching you within *4 to 9 working days*. Thank you for your patience!${linkBlock}`,
    },
    {
      key: "ofd",
      label: "Out for delivery",
      text: `🛵 *Out for delivery*\n\n${hi}\n\nYour TheBookX order is out for delivery today. Please keep your phone reachable so our delivery partner can reach you.${linkBlock}`,
    },
    {
      key: "delivered",
      label: "Delivered",
      text: `🎉 *Delivered*\n\n${hi}\n\nYour order has been delivered! We hope you love your books — a quick *review* would mean a lot to us. ⭐${linkBlock}`,
    },
    {
      key: "received",
      label: "Received order",
      text: `🙏 *Order received*\n\n${hi}\n\nWe've received your order. It will be *shipped within 1–2 days* and your tracking ID will be shared here as soon as it's dispatched.${linkBlock}`,
    },
    {
      key: "unable",
      label: "Unable to ship",
      text: `⚠️ *Unable to ship*\n\n${hi}\n\nWe couldn't ship your order due to a mismatch in the *address or phone number*. Please share your *correct full address (with pincode) and a reachable phone number* so we can dispatch it right away.${linkBlock}`,
    },
    {
      key: "verify",
      label: "Ask details checkup",
      text: `🔎 *Please re-check your details*\n\n${hi}\n\nBefore we ship your order, kindly re-check your delivery details — the current address/number may not be enough for successful delivery.\n\nReply with your *complete address, landmark, pincode and active phone number*.${linkBlock}`,
    },
  ];
};

// Google Sheet ID and configuration
const SHEET_ID = "1ovqFn50d0TKjV0nm4q1lb3N9XvimUgIsHCOlHh6QRdg";
const SHEET_NAME = "Form responses 1";
const SHEET_API_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;
// Dedicated Wallet ledger tab (Timestamp | Phone Number | Amount | Type | Reason | Order ID)
const WALLET_SHEET_NAME = "Wallet";
const WALLET_SHEET_API_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(WALLET_SHEET_NAME)}`;

// Google Forms submit URL
const FORM_SUBMIT_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSc3dUHr_S01ODuvQpok_8n0tG0ezfUPD5NLK0M_tyms25I-eQ/formResponse";

// OPTIONAL: Google Apps Script Web App URL that can UPDATE / DELETE rows in the
// sheet in place (edits without adding a new row). Deploy the script in
// docs/sheet-edit-apps-script.gs and paste its /exec URL here. Leave empty to
// keep the old append-on-edit behaviour.
const SHEET_EDIT_API_URL =
  "https://script.google.com/macros/s/AKfycbzHQ2gs25qh7stuSdWWV_g4r3Im_6HUgUxxcbahkyWsY6d-VjO0ppwgiezokxHd5fqzKA/exec";

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

// Sort orders by date. order = "desc" newest first, "asc" oldest first.
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

// Fast name book lookup (for genre/category attribution of order items).
const BOOK_BY_NAME = {};
ALL_BOOKS.forEach((b) => {
  if (b?.name) BOOK_BY_NAME[b.name.toLowerCase().trim()] = b;
});

// India Post weight-slab delivery charge (grams ₹). Extend the top slab
// as needed for parcels heavier than 4kg.
const indiaPostDeliveryCost = (grams) => {
  const g = Number(grams) || 0;
  if (g <= 500) return 82;
  if (g <= 1200) return 126;
  if (g <= 2000) return 200;
  if (g <= 4000) return 300;
  return 300; // >4kg — adjust if you add heavier slabs
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
    const b =
      BOOK_BY_NAME[
        String(line.name || "")
          .toLowerCase()
          .trim()
      ];
    if (b) {
      matched += 1;
      booksCost += (Number(getBookCost(b.id)) || 0) * qty;
      weight += (Number(b.weight) || 0) * qty;
    } else {
      unmatched += 1;
    }
  });
  const deliveryCost = indiaPostDeliveryCost(weight);
  return { booksCost, weight, deliveryCost, matched, unmatched };
};
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Collapsible analytics section — click the header to wrap it up.
function An2Section({ title, sub, right, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={`an2-card an2-acc${open ? " open" : ""}`}>
      <button
        type="button"
        className="an2-acc-head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="an2-acc-titles">
          <h3 className="an2-card-title">{title}</h3>
          {sub ? <p className="an2-card-sub">{sub}</p> : null}
        </div>
        <div className="an2-acc-right">
          {right}
          <ChevronDown
            size={18}
            className={`an2-acc-chev${open ? " open" : ""}`}
          />
        </div>
      </button>
      {open && <div className="an2-acc-body">{children}</div>}
    </section>
  );
}

// Wallet adjust modal for the Users tab. Admin enters an amount, then Adds,
// Deducts, or Sets the balance — written to the sheet by the parent.
const WALLET_REASON_PRESETS = [
  "Goodwill credit",
  "Refund",
  "Compensation for delay",
  "Order cancelled",
  "Correction",
];

function WalletModal({ user, busy, onClose, onApply }) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const cur = user.wallet || 0;
  const delta = Math.abs(parseFloat(amount) || 0);
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="bill-modal-overlay wm-overlay" onClick={onClose}>
      <div
        className="bill-modal wm-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bill-header">
          <div className="flex flex-col">
            <span className="weight-700 font-16">Adjust wallet</span>
            <span className="font-12 gray-500">
              {user.name || "Customer"} · +91 {user.phone}
            </span>
          </div>
          <span className="cursor-pointer" onClick={onClose}>
            <X size={18} />
          </span>
        </div>

        <div className="wm-cur">
          <span className="wm-cur-l">Current balance</span>
          <strong className="wm-cur-v">₹{cur.toLocaleString()}</strong>
        </div>

        <label className="wm-lbl">Amount (₹)</label>
        <input
          className="wm-input"
          type="number"
          inputMode="numeric"
          placeholder="e.g. 100"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <label className="wm-lbl">Reason (saved to the Wallet sheet)</label>
        <input
          className="wm-input"
          type="text"
          placeholder="e.g. Refund for cancelled order"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="wm-reasons">
          {WALLET_REASON_PRESETS.map((r) => (
            <button
              key={r}
              type="button"
              className={`wm-reason-chip${reason === r ? " on" : ""}`}
              onClick={() => setReason(r)}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="wm-actions">
          <button
            type="button"
            className="wm-btn wm-deduct"
            disabled={busy || !delta}
            onClick={() => onApply(user, cur - delta, reason)}
          >
            − Deduct ₹{delta || 0}
          </button>
          <button
            type="button"
            className="wm-btn wm-add"
            disabled={busy || !delta}
            onClick={() => onApply(user, cur + delta, reason)}
          >
            + Add ₹{delta || 0}
          </button>
        </div>
        <button
          type="button"
          className="wm-set"
          disabled={busy || amount === ""}
          onClick={() => onApply(user, delta, reason)}
        >
          Set balance to ₹{delta.toLocaleString()}
        </button>
        <p className="wm-note">
          {busy
            ? "Saving to the Wallet sheet…"
            : "Adds a signed transaction (+ credit / − deduct) to the Wallet tab with your reason. Balance can't go below ₹0."}
        </p>
      </div>
    </div>,
    document.body,
  );
}

// Toggleable analytics sections (Customize panel).
// Top-level page sections for the scrollable navigation tabs.
const SECTION_TABS = [
  { key: "analytics", label: "Analytics", short: "Stats", Icon: LayoutDashboard },
  { key: "orders", label: "Orders", short: "Orders", Icon: ShoppingBag },
  { key: "users", label: "Users", short: "Users", Icon: Users },
  { key: "track", label: "Track orders", short: "Track", Icon: Radar },
  { key: "tracking", label: "Tracking", short: "IDs", Icon: MapPin },
];

/* Motion presets — one place to tune the whole dashboard's feel. */
const EASE_OUT = [0.22, 1, 0.36, 1];

/* Deliberately no `filter`/blur and no exit state here: the section subtree is
   huge, and an exit animation under AnimatePresence `mode="wait"` could leave
   the incoming tab stuck behind a never-finishing outgoing one. Changing the
   key remounts the subtree, so a plain enter animation is both safer and
   snappier. */
const SECTION_MOTION = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: EASE_OUT },
};

const PILL_SPRING = { type: "spring", stiffness: 420, damping: 34, mass: 0.7 };

// Status options for the Track & notify quick status editor (includes the
// extra "Money received" state on top of the usual delivery stages).
const TRACK_STATUS_OPTIONS = [
  "Pending",
  "Processing",
  "Getting Shipped",
  "Shipped",
  "In Transit",
  "Out for Delivery",
  "Delivered",
  "Money received",
  "Cancelled",
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
function ColBars({
  cols,
  accent = "var(--tertiary, #fb8500)",
  showValues = true,
}) {
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
              style={{
                height: `${(c.value / max) * 100}%`,
                background: accent,
              }}
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
        // first click start; clear any previous range
        setRangeStart(key);
        setDateFrom("");
        setDateTo("");
      } else {
        // second click complete range (ordered)
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
// Distinct line colours for the 12 monthly run-rate lines.
const MONTH_COLORS = [
  "#fb8500",
  "#2563eb",
  "#16a34a",
  "#db2777",
  "#7c3aed",
  "#0ea5e9",
  "#f59e0b",
  "#14b8a6",
  "#ef4444",
  "#8b5cf6",
  "#65a30d",
  "#e11d48",
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
/* Scroll-linked delivery rail shown down the left edge of the booking sheet.
   The full route is drawn as a dashed line; the portion already covered is
   painted solid behind a truck that rides the line as you scroll. Progress is
   spring-smoothed so the truck glides instead of snapping frame to frame. */
function IpTruckRail({ scrollRef, total = 0, booked = 0 }) {
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    restDelta: 0.001,
  });
  const top = useTransform(progress, [0, 1], ["0%", "100%"]);
  const scaleY = useTransform(progress, [0, 1], [0, 1]);

  return (
    <div className="ip-rail" aria-hidden="true">
      {/* Dashed line = route still ahead */}
      <div className="ip-rail-track" />
      {/* Solid line = distance already covered */}
      <motion.div className="ip-rail-fill" style={{ scaleY }} />
      <motion.div className="ip-rail-truck" style={{ top }}>
        <span className="ip-rail-truck-badge">
          <Truck size={14} />
        </span>
        {total > 0 && (
          <span className="ip-rail-truck-count">
            {booked}/{total}
          </span>
        )}
      </motion.div>
    </div>
  );
}

function IndiaPostSheet({
  orders,
  copyToClipboard,
  copiedId,
  search = "",
  bypassFilter = false,
  hideHead = false,
  orderNotes = {},
  bookedOrders = {},
  onBook,
  onUnbook,
  scrollRef = null,
  showBooking = false,
  pickChecked = {},
  bookKey = (id, idx) => `${id}::${idx}`,
}) {
  // Per-order tracking-ID drafts, keyed by order id.
  const [trackDraft, setTrackDraft] = useState({});
  const shippingAll = bypassFilter
    ? orders || []
    : (orders || []).filter((o) =>
        /getting shipped/i.test(o["Order Status"] || ""),
      );
  const q = String(search || "")
    .trim()
    .toLowerCase();
  const shipping = !q
    ? shippingAll
    : shippingAll.filter((o) => {
        const isCOD = /cash|cod/i.test(o["Payment Type"] || "");
        const payText = isCOD ? "cod cash on delivery" : "upi prepaid online";
        const amount = String(o["Total Amount"] || o.revenue || "");
        const name = String(o["Customer Name"] || "").toLowerCase();
        const pin = String(o["Pincode"] || "");
        const phone = String(o["Phone Number"] || "");
        return (
          name.includes(q) ||
          amount.includes(q) ||
          payText.includes(q) ||
          pin.includes(q) ||
          phone.includes(q)
        );
      });
  if (!shippingAll.length)
    return <p className="ip-empty">No “Getting Shipped” orders right now.</p>;
  if (!shipping.length)
    return <p className="ip-empty">No orders match “{search}”.</p>;
  const bookedCount = shipping.filter(
    (o) => !!bookedOrders[o["Order ID"]],
  ).length;

  return (
    <div className={`ip-sheet${scrollRef ? " has-rail" : ""}`}>
      {scrollRef && (
        <IpTruckRail
          scrollRef={scrollRef}
          total={shipping.length}
          booked={bookedCount}
        />
      )}
      {shipping.map((o, i) => {
        const books = (o.parsedBooks || []).length || 1;
        const isCOD = /cash|cod/i.test(o["Payment Type"] || "");
        const amount = o["Total Amount"] || o.revenue || "";
        // India Post collects the NET amount = order value − 5.9%.
        const grossCod = Number(String(amount).replace(/[^\d.]/g, "")) || 0;
        const codFee = Math.round(grossCod * 0.059);
        const codNet = Math.max(0, grossCod - codFee);
        const chunks = ipChunks(o["Address"]);
        const name = ipSanitize(o["Customer Name"]).slice(0, 30);
        const line1 = chunks[0] || "";
        const line2 = chunks[1] || "";
        const landmark = chunks[2] || "";
        const extras = chunks.slice(3);
        const key = (k) => `ip-${i}-${k}`;
        // Structured payload the India Post autofill userscript reads from the
        // clipboard. Includes size, declarations (checkAll), COD, and the
        // recipient details — every text value capped at 30 chars to fit the
        // government form's field limits. The userscript still leaves the
        // pincode office-picker popup and the Mail Shape / Delivery Type
        // dropdowns for the admin to complete manually.
        const cap30 = (s) => String(s ?? "").slice(0, 30);
        const autofillPayload = JSON.stringify({
          v: "tbx-ip-1",
          orderId: o["Order ID"] || "",
          checkAll: true,
          isCOD,
          codAmount: isCOD ? String(codNet) : "",
          mailShape: "Box Type (Non Roll Form)",
          deliveryType: "Normal Delivery",
          weight: "500",
          length: "22",
          width: "13",
          height: String(books),
          // Recipient details — each ≤ 30 chars. Pincode is deliberately
          // OMITTED: filling it triggers India Post's office-picker popup, so
          // the admin types the pincode manually (copy it from the field below).
          name: cap30(name),
          mobile: cap30(o["Phone Number"]),
          addr1: cap30(line1),
          addr2: cap30(line2),
          landmark: cap30(landmark),
          city: cap30(o["City"]),
          state: cap30(o["State"]),
        });
        const oid = o["Order ID"];
        const rawBooked = bookedOrders[oid];
        const booked = rawBooked
          ? rawBooked === true
            ? { tracking: "", at: "" }
            : { tracking: rawBooked.tracking || "", at: rawBooked.at || "" }
          : null;
        const comment = orderNotes[oid] ?? (o["Comment"] || "");
        const draft = trackDraft[oid] ?? "";

        return (
          <div
            className={`ip-order${booked ? " is-booked" : ""}`}
            key={oid || i}
          >
            <div className="ip-order-head">
              <span className="ip-order-sr">{booked ? "✓" : i + 1}</span>
              <span className="ip-order-name">{o["Customer Name"] || "—"}</span>
              {oid && (
                <a
                  className="ip-order-link"
                  href={`/profile/${String(o["Phone Number"] || "")
                    .replace(/\D/g, "")
                    .slice(-10)}/orders/${encodeURIComponent(oid)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open customer order page"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={13} /> View
                </a>
              )}
              <span className={`ip-tag ${isCOD ? "cod" : "prepaid"}`}>
                {isCOD ? `COD ₹${amount}` : "Prepaid — no COD"}
              </span>
              <button
                type="button"
                className="ip-autofill-copy"
                title="Autofill size, checkboxes, COD & recipient details (each ≤30 chars). Complete the pincode popup & dropdowns manually."
                onClick={() => copyToClipboard(autofillPayload, key("all"))}
              >
                {copiedId === key("all") ? (
                  <>
                    <Check size={13} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={13} /> Copy for autofill
                  </>
                )}
              </button>
            </div>

            {/* Anything the packer noted on this order — surfaced before the
                fields so instructions like "call before dispatch" aren't
                missed while copying values into the portal. */}
            {comment && (
              <div className="ip-comment">
                <span className="ip-comment-title">
                  <MessageCircle size={14} /> Comment
                </span>
                <span className="ip-comment-text">{comment}</span>
              </div>
            )}

            {/* Customer's own note left at checkout (Order Comment column). */}
            {o["Order Comment"] && (
              <div className="ip-comment ip-comment-cust">
                <span className="ip-comment-title">
                  <MessageCircle size={14} /> Customer note
                </span>
                <span className="ip-comment-text">{o["Order Comment"]}</span>
              </div>
            )}

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
                <>
                  <IpField
                    label="Order value (₹)"
                    hint={`₹${grossCod.toLocaleString()} − ₹${codFee.toLocaleString()} (5.9%)`}
                  />
                  <IpField
                    label="COD Retail amount (₹) · net"
                    value={String(codNet)}
                    id={key("cod")}
                    copiedId={copiedId}
                    onCopy={copyToClipboard}
                  />
                </>
              ) : (
                <IpField label="COD" hint="Prepaid — leave COD unchecked" />
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

            {/* Books in this order + whether each has been picked. */}
            {(o.parsedBooks || []).length > 0 && (
              <div className="ip-books">
                <span className="ip-books-title">Books · pick check</span>
                {(o.parsedBooks || []).map((b, bi) => {
                  const picked = !!pickChecked[bookKey(o["Order ID"], bi)];
                  return (
                    <div className="ip-book-row" key={bi}>
                      <span className="ip-book-nm">
                        {b.name}
                        {b.quantity > 1 ? ` ×${b.quantity}` : ""}
                      </span>
                      <span
                        className={`ip-book-pick${picked ? " picked" : ""}`}
                      >
                        {picked ? (
                          <>
                            <Check size={12} /> Picked
                          </>
                        ) : (
                          "Not picked"
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Booking footer — capture the India Post article number, then
                stamp the order as booked. Saved to localStorage so a refresh
                mid-session doesn't lose the run. */}
            {showBooking && (
              <div className="ip-book">
                {booked ? (
                  <div className="ip-book-done">
                    <span className="ip-book-done-badge">
                      <Check size={14} /> Booked
                    </span>
                    {booked.tracking ? (
                      <button
                        type="button"
                        className="ip-book-track"
                        title="Copy tracking ID"
                        onClick={() =>
                          copyToClipboard(booked.tracking, key("bt"))
                        }
                      >
                        {copiedId === key("bt") ? (
                          <Check size={13} />
                        ) : (
                          <Copy size={13} />
                        )}
                        {booked.tracking}
                      </button>
                    ) : (
                      <span className="ip-book-track empty">
                        No tracking ID
                      </span>
                    )}
                    <button
                      type="button"
                      className="ip-book-undo"
                      onClick={() => onUnbook && onUnbook(oid)}
                    >
                      Undo
                    </button>
                  </div>
                ) : (
                  <form
                    className="ip-book-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!draft.trim()) return;
                      onBook && onBook(oid, draft.trim());
                      setTrackDraft((d) => {
                        const n = { ...d };
                        delete n[oid];
                        return n;
                      });
                    }}
                  >
                    <label className="ip-book-lbl" htmlFor={key("tid")}>
                      Tracking ID
                    </label>
                    <input
                      id={key("tid")}
                      className="ip-book-input"
                      placeholder="e.g. CS123456789IN"
                      value={draft}
                      autoComplete="off"
                      spellCheck="false"
                      onChange={(e) =>
                        setTrackDraft((d) => ({
                          ...d,
                          [oid]: e.target.value.toUpperCase(),
                        }))
                      }
                    />
                    <button
                      type="submit"
                      className="ip-book-save"
                      disabled={!draft.trim()}
                    >
                      <Check size={14} /> Save as booked
                    </button>
                  </form>
                )}
              </div>
            )}
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

// ── Minimal, smooth skeleton loader (light shimmer, no text) ──
function OrdersLoader() {
  return (
    <div className="my-orders-page">
      <div className="section-1200 p-40">
        <div className="an2-skel">
          <div className="an2-skel-head">
            <span className="an2-skel-line w-40" />
            <span className="an2-skel-line w-20" />
          </div>
          <div className="an2-skel-stats">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="an2-skel-card" key={i} />
            ))}
          </div>
          <div className="an2-skel-chart" />
          <div className="an2-skel-chart short" />
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
  // Day the days of the selected week's context (last 14 days)
  // Week the 7 days (Mon–Sun) of the selected week
  // Month each week within the selected month
  // All every month (horizontally scrollable)
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
    // All time every month from the first order to now (scrollable)
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
    cols
      .map((c, i) => `${ax(i).toFixed(1)},${ay(c[key]).toFixed(1)}`)
      .join(" ");
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
  const dayOfYear = Math.ceil((now - new Date(year, 0, 0)) / 86400000);
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
            <text
              key={d}
              x={x(d)}
              y={H - 8}
              textAnchor="middle"
              className="rr-x"
            >
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
            {MONTH_LABELS[m]} <b>{seriesByMonth[m].slice(-1)[0]?.cum || 0}</b>
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
    "C",
    "( )",
    "%",
    "÷",
    "7",
    "8",
    "9",
    "×",
    "4",
    "5",
    "6",
    "−",
    "1",
    "2",
    "3",
    "+",
    "0",
    ".",
    "⌫",
    "=",
  ];
  const handleKey = (k) => {
    if (k === "C") return clearAll();
    if (k === "⌫") return back();
    if (k === "=") return equals();
    if (k === "( )") {
      const opens = (expr.match(/\(/g) || []).length;
      const closes = (expr.match(/\)/g) || []).length;
      const last = expr.slice(-1);
      return push(opens > closes && /[0-9)]/.test(last) ? ")" : "(");
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
  // Users tab — filter to customers holding a wallet balance for ≥ N days.
  const [walletHoldFilter, setWalletHoldFilter] = useState(0);
  // Users tab — its own search box (separate from the Orders search).
  const [userSearch, setUserSearch] = useState("");
  // Users tab — show only customers whose wallet balance is above this amount.
  const [walletMinFilter, setWalletMinFilter] = useState(0);
  // Users tab — sort order: recent | walletAsc | walletDesc.
  const [userSort, setUserSort] = useState("recent");
  // Users tab — paginate: show N cards, "Load more" reveals another 20.
  const [userVisible, setUserVisible] = useState(20);
  // Users tab — which customer row's 3-dot action menu is open.
  const [openUserMenu, setOpenUserMenu] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  // Orders list lazy loading — render 10 at a time, grow on scroll.
  const ORDERS_BATCH = 10;
  const [ordersVisible, setOrdersVisible] = useState(ORDERS_BATCH);
  const ordersSentinelRef = useRef(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  // Multi-select order-status filter (array). Special values: "active" (the
  // default combined view), "all" (everything), and "intransit-notrack"
  // (In Transit orders that have no tracking/Shipping ID). Otherwise an exact
  // Order Status string.
  const [statusFilter, setStatusFilter] = useState(["active"]);
  const toggleStatusFilter = (val) => {
    setStatusFilter((prev) => {
      const arr = Array.isArray(prev) ? prev : [prev];
      if (val === "all") return ["all"]; // "all" clears everything else
      const withoutAll = arr.filter((v) => v !== "all");
      const next = withoutAll.includes(val)
        ? withoutAll.filter((v) => v !== val)
        : [...withoutAll, val];
      return next.length ? next : ["active"];
    });
  };
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
  // Inline order-card accordions: which cards are expanded, plus per-order
  // draft state for inline tracking-ID and address edits pushed to the sheet.
  const [expandedCards, setExpandedCards] = useState({}); // { orderId: true }
  const [billOrderId, setBillOrderId] = useState(null); // order whose bill modal is open
  const longPressRef = useRef(false); // true right after a long-press selects a card
  const lpTimer = useRef(null); // long-press timer handle
  const [trackDrafts, setTrackDrafts] = useState({}); // { orderId: "CX..." }
  const [addrEdit, setAddrEdit] = useState({}); // { orderId: {address,city,state,pincode} }
  const [rowSaving, setRowSaving] = useState({}); // { orderId: "tracking"|"address"|"status" }
  const toggleExpand = (id) =>
    setExpandedCards((p) => ({ ...p, [id]: !p[id] }));
  const [seenIds, setSeenIds] = useState(null); // order IDs seen on last visit
  const [showNewModal, setShowNewModal] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false); // kebab menu
  const [showListMenu, setShowListMenu] = useState(false); // orders list kebab
  const [showCalc, setShowCalc] = useState(false); // calculator modal
  const [showIndiaPost, setShowIndiaPost] = useState(false); // India Post modal
  const [ipSearch, setIpSearch] = useState(""); // India Post modal search
  // Scroll container that drives the truck rail. A plain ref isn't enough:
  // child layout effects run before the parent's ref is attached, so
  // useScroll() inside the rail would see null and silently fall back to
  // tracking the window. A callback ref flips state once the node exists, and
  // the rail is only mounted after that.
  const ipScrollRef = useRef(null);
  const [ipScrollReady, setIpScrollReady] = useState(false);
  const setIpScrollNode = useCallback((node) => {
    ipScrollRef.current = node;
    setIpScrollReady(!!node);
  }, []);
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

  // ── Left navigation rail: expanded by default, collapse state remembered.
  const [railCollapsed, setRailCollapsed] = useState(false);
  useEffect(() => {
    try {
      setRailCollapsed(localStorage.getItem("mo_rail_collapsed") === "1");
    } catch {}
  }, []);
  const toggleRail = () =>
    setRailCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem("mo_rail_collapsed", next ? "1" : "0");
      } catch {}
      return next;
    });

  // ── Per-order notes (localStorage: { "<orderId>": "note text" }) ──
  const [orderNotes, setOrderNotes] = useState({});
  const [noteEditor, setNoteEditor] = useState(null); // { orderId, draft }
  const orderNotesHydrated = useRef(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("mo_order_notes") || "{}");
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

  // ── Per-order "booked with India Post" flags (localStorage) ──
  const [bookedOrders, setBookedOrders] = useState({});
  const [bookOrder, setBookOrder] = useState(null); // order object for the modal
  const bookedHydrated = useRef(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("mo_booked_orders") || "{}",
      );
      if (saved && typeof saved === "object") setBookedOrders(saved);
    } catch {}
    bookedHydrated.current = true;
  }, []);
  useEffect(() => {
    if (!bookedHydrated.current) return;
    try {
      localStorage.setItem("mo_booked_orders", JSON.stringify(bookedOrders));
    } catch {}
  }, [bookedOrders]);
  // A booking record is { tracking, at }. Older saves stored a bare `true`,
  // so every read goes through bookedInfo() to normalise the shape.
  const markOrderBooked = (orderId, tracking = "") => {
    if (!orderId) return;
    setBookedOrders((p) => ({
      ...p,
      [orderId]: {
        tracking: String(tracking || "").trim(),
        at: new Date().toISOString(),
      },
    }));
  };
  const bookedInfo = (orderId) => {
    const rec = bookedOrders[orderId];
    if (!rec) return null;
    if (rec === true) return { tracking: "", at: "" };
    return { tracking: rec.tracking || "", at: rec.at || "" };
  };

  // Export every booked "Getting Shipped" order as a CSV — one row per parcel,
  // ready to hand to India Post or paste back into the tracking sheet.
  const exportBookedCsv = () => {
    const rows = (orders || [])
      .filter(
        (o) =>
          /getting shipped/i.test(o["Order Status"] || "") &&
          !!bookedOrders[o["Order ID"]],
      )
      .map((o, i) => {
        const info = bookedInfo(o["Order ID"]) || { tracking: "", at: "" };
        const gross =
          Number(
            String(o["Total Amount"] || o.revenue || "").replace(/[^\d.]/g, ""),
          ) || 0;
        const isCOD = /cash|cod/i.test(o["Payment Type"] || "");
        const codNet = isCOD ? Math.max(0, gross - Math.round(gross * 0.059)) : 0;
        return [
          i + 1,
          o["Order ID"] || "",
          info.tracking,
          o["Customer Name"] || "",
          o["Phone Number"] || "",
          o["Address"] || "",
          o["City"] || "",
          o["State"] || "",
          o["Pincode"] || "",
          isCOD ? "COD" : "Prepaid",
          gross ? gross.toFixed(2) : "",
          isCOD ? codNet.toFixed(2) : "0.00",
          (o.parsedBooks || []).length || 1,
          "500",
          info.at ? new Date(info.at).toLocaleString("en-IN") : "",
          orderNotes[o["Order ID"]] ?? (o["Comment"] || ""),
        ];
      });

    if (!rows.length) {
      showToast("Nothing booked yet — save a tracking ID first.", "error");
      return;
    }

    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(
      `india-post-booked-${stamp}.csv`,
      [
        "S.No",
        "Order ID",
        "Tracking ID",
        "Customer Name",
        "Phone",
        "Address",
        "City",
        "State",
        "Pincode",
        "Payment",
        "Order Value",
        "COD Net",
        "Books",
        "Weight (g)",
        "Booked At",
        "Comment",
      ],
      rows,
    );
    showToast(
      `Exported ${rows.length} booked order${rows.length === 1 ? "" : "s"}.`,
      "success",
    );
  };
  const unmarkOrderBooked = (orderId) => {
    setBookedOrders((p) => {
      const n = { ...p };
      delete n[orderId];
      return n;
    });
  };
  const saveOrderNote = (orderId, text) => {
    const t = (text || "").trim();
    setOrderNotes((m) => {
      const next = { ...m };
      if (t) next[orderId] = t;
      else delete next[orderId];
      return next;
    });
    // Persist to the order's "Comment" column in the sheet (optimistic local
    // patch first, then reconcile via a re-fetch).
    patchLocalOrder(orderId, { Comment: t, comment: t });
    updateOrderRow(orderId, { Comment: t })
      .then(() => setTimeout(fetchOrders, 1300))
      .catch((e) => console.error("Comment save failed:", e));
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
      setPinnedTxns(Array.isArray(saved) ? saved.filter((t) => t.pinned) : []);
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
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `manage-orders-notes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [analyticsPeriod, setAnalyticsPeriod] = useState("month"); // day | week | month | year | all
  const [periodOffset, setPeriodOffset] = useState(0); // 0 = current, -1 = previous …
  // Month selected inside the P&L chart when viewing a full year.
  const [pnlMonth, setPnlMonth] = useState(new Date().getMonth());
  // Users tab — wallet adjust modal.
  const [walletModal, setWalletModal] = useState(null); // the user record or null
  const [walletBusy, setWalletBusy] = useState(false);
  // Monthly run-rate chart hover (day-of-month under the cursor).
  const [mrrTip, setMrrTip] = useState(null); // { day, x }
  const mrrRef = useRef(null);

  // Minimal hover tooltip for analytics charts (event-delegated so it never
  // gets clipped inside scrollable chart containers).
  const [chartTip, setChartTip] = useState(null); // { x, y, text, below, sticky }
  const chartTipTimer = useRef(null);

  const clearChartTipTimer = () => {
    if (chartTipTimer.current) {
      clearTimeout(chartTipTimer.current);
      chartTipTimer.current = null;
    }
  };

  // Place the tooltip at the pointer, clamped into the viewport. If there is
  // no room above the point (near the top of the screen, or inside a tall
  // chart scrolled to the top) it flips to sit below instead.
  const placeChartTip = (e, sticky) => {
    const el =
      e.target && e.target.closest ? e.target.closest("[data-tip]") : null;
    if (!el) {
      if (!sticky) return false;
      clearChartTipTimer();
      setChartTip((t) => (t ? null : t));
      return false;
    }
    const pad = 78;
    const vw = typeof window !== "undefined" ? window.innerWidth : 0;
    setChartTip({
      x: Math.min(Math.max(e.clientX, pad), Math.max(pad, vw - pad)),
      y: e.clientY,
      text: el.getAttribute("data-tip"),
      below: e.clientY < 72,
      sticky,
    });
    return true;
  };

  // Mouse hover — unchanged behaviour on desktop.
  const onChartMove = (e) => {
    if (chartTipTimer.current) return; // a tapped tooltip owns the display
    placeChartTip(e, false);
  };

  // Tap / click — show the tooltip right where the finger or cursor landed and
  // hold it there briefly. Touch devices never fire a usable mousemove, which
  // is why tapping a bar used to do nothing at all.
  const onChartTap = (e) => {
    if (!placeChartTip(e, true)) return;
    clearChartTipTimer();
    chartTipTimer.current = setTimeout(() => {
      chartTipTimer.current = null;
      setChartTip(null);
    }, 2800);
  };

  const onChartLeave = () => {
    if (chartTipTimer.current) return; // don't yank a tapped tooltip away
    setChartTip((t) => (t ? null : t));
  };

  useEffect(() => () => clearChartTipTimer(), []);

  // Monthly run-rate: map cursor X to a day-of-month (1…31) for the tooltip.
  const onMrrMove = (e) => {
    const el = mrrRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (!r.width) return;
    const W = 700,
      padL = 6,
      padR = 6;
    const leftF = padL / W;
    const rightF = 1 - padR / W;
    let frac = (e.clientX - r.left) / r.width;
    frac = Math.max(leftF, Math.min(rightF, frac));
    const dayFrac = (frac - leftF) / (rightF - leftF);
    const day = Math.min(31, Math.max(1, Math.round(dayFrac * 30) + 1));
    setMrrTip({ day, x: e.clientX - r.left });
  };
  const onMrrLeave = () => setMrrTip(null);

  // Callback ref on the "today" column — centers it in a scrollable chart so
  // the default viewport lands on the current date.
  const centerTodayRef = useCallback((el) => {
    if (!el || el.dataset.centered) return;
    el.dataset.centered = "1";
    requestAnimationFrame(() => {
      const sc = el.closest(".an2-bars.scroll,.an2-pnl.scroll");
      if (sc) {
        sc.scrollLeft = Math.max(
          0,
          el.offsetLeft - sc.clientWidth / 2 + el.offsetWidth / 2,
        );
      }
    });
  }, []);
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
  const [cardSelectMode, setCardSelectMode] = useState(false); // card-view multi-select
  const [cardBulkStatus, setCardBulkStatus] = useState("Getting Shipped");
  const [cardBulkBusy, setCardBulkBusy] = useState(false);
  // Queued per-card status edits waiting to be pushed to the sheet in one go
  // (orderId -> new status), so changing many statuses doesn't reload each time.
  const [pendingStatus, setPendingStatus] = useState({});
  const [pushingStatus, setPushingStatus] = useState(false);
  const [bulkStage, setBulkStage] = useState(null); // WhatsApp stage key for bulk send
  const [bulkSent, setBulkSent] = useState([]); // order IDs already messaged
  const [mergeGroup, setMergeGroup] = useState(null); // customer group under merge preview
  const [merging, setMerging] = useState(false); // merge write in progress
  const [mergeStatusDrafts, setMergeStatusDrafts] = useState({}); // per-order status edits in merge modal
  const [waPick, setWaPick] = useState(""); // dropdown-selected stage (not yet triggered)

  const [accOpen, setAccOpen] = useState({
    analytics: true,
    bookProfit: false,
    calendar: false,
    indiapost: true,
    orders: true,
  });
  const toggleAcc = (id) => setAccOpen((p) => ({ ...p, [id]: !p[id] }));

  // ── Tracking tab: bulk-paste JSON of tracking IDs → push to Tracking sheet.
  const [trackingJsonInput, setTrackingJsonInput] = useState("");
  const [trackingRows, setTrackingRows] = useState([]); // parsed + normalized
  const [trackingParseError, setTrackingParseError] = useState("");
  const [trackingBusy, setTrackingBusy] = useState(false);
  const [trackingResult, setTrackingResult] = useState(null); // {pushed} | null
  // Optional bulk/per-row status change alongside the tracking-ID write.
  const [trackChangeStatus, setTrackChangeStatus] = useState(false);
  const [trackBulkStatus, setTrackBulkStatus] = useState("In Transit");
  const [trackRowStatus, setTrackRowStatus] = useState({}); // { orderId: status }

  // Normalize one loose JSON entry into { orderId, name, phone, trackingId }.
  // Accepts a variety of key spellings so the pasted JSON can come from any
  // source (India Post export, a sheet copy, hand-written, etc.).
  const normalizeTrackingEntry = (raw) => {
    if (!raw || typeof raw !== "object") return null;
    const keys = {};
    Object.keys(raw).forEach((k) => {
      keys[k.toLowerCase().replace(/[\s_]+/g, "")] = raw[k];
    });
    const g = (...names) => {
      for (const n of names) {
        if (keys[n] !== undefined && keys[n] !== null) {
          const v = String(keys[n]).trim();
          if (v !== "") return v;
        }
      }
      return "";
    };
    const orderId = g("orderid", "order", "oid", "id");
    const trackingId = g(
      "trackingid",
      "tracking",
      "shippingid",
      "awb",
      "awbno",
      "consignment",
      "consignmentnumber",
      "articlenumber",
    );
    const name = g("name", "customername", "customer");
    const phone = g("phone", "phonenumber", "mobile", "number", "contact")
      .replace(/\D/g, "")
      .slice(-10);
    if (!orderId && !phone) return null; // need at least one match key
    if (!trackingId) return null; // no tracking = nothing to store
    return { orderId, name, phone, trackingId };
  };

  // Pure parse: text → { rows, error }. No state writes, so both the preview
  // button and the push use the exact same result from the current text.
  const computeTrackingRows = (text) => {
    const txt = (text || "").trim();
    if (!txt) return { rows: [], error: "" };
    let data;
    try {
      data = JSON.parse(txt);
    } catch (e) {
      // Be forgiving: allow a bare array without the outer brackets, or
      // objects separated by newlines.
      try {
        data = JSON.parse(`[${txt.replace(/}\s*\n\s*{/g, "},{")}]`);
      } catch (e2) {
        return {
          rows: [],
          error:
            'Could not parse JSON. Paste an array like: [{"orderId":"ORD123","name":"...","phone":"98...","trackingId":"CX...IN"}]',
        };
      }
    }
    const arr = Array.isArray(data) ? data : [data];
    const rows = arr.map(normalizeTrackingEntry).filter(Boolean);
    if (rows.length === 0) {
      return {
        rows: [],
        error:
          "No valid entries found. Each item needs a trackingId plus an orderId (or phone).",
      };
    }
    return { rows, error: "" };
  };

  const parseTrackingJson = () => {
    setTrackingResult(null);
    const { rows, error } = computeTrackingRows(trackingJsonInput);
    setTrackingRows(rows);
    setTrackingParseError(error);
  };

  // Bulk-change the Order Status for every currently selected card, writing
  // each change back to the sheet (same path as the per-order dropdown).
  const applyCardBulkStatus = async () => {
    const ids = [...selectedIds];
    const st = cardBulkStatus;
    if (ids.length === 0 || !st) return;
    setCardBulkBusy(true);
    for (const id of ids) {
      patchLocalOrder(id, { "Order Status": st, status: st });
    }
    try {
      await Promise.all(
        ids.map((id) =>
          updateOrderRow(id, { "Order Status": st }).catch((e) =>
            console.error("Bulk status save failed for", id, e),
          ),
        ),
      );
    } finally {
      setCardBulkBusy(false);
      setSelectedIds([]);
      setCardSelectMode(false);
      setTimeout(fetchOrders, 1300);
    }
  };

  // Push every queued per-card status edit to the sheet in one batch, then
  // refetch once (instead of a write + reload on every single dropdown change).
  const pushPendingStatus = async () => {
    const entries = Object.entries(pendingStatus);
    if (entries.length === 0) return;
    setPushingStatus(true);
    try {
      await Promise.all(
        entries.map(([id, st]) =>
          updateOrderRow(id, { "Order Status": st }).catch((e) =>
            console.error("Status push failed for", id, e),
          ),
        ),
      );
    } finally {
      setPushingStatus(false);
      setPendingStatus({});
      setTimeout(fetchOrders, 1300);
    }
  };

  // Discard queued status edits and reload the true sheet values.
  const discardPendingStatus = () => {
    setPendingStatus({});
    fetchOrders();
  };

  const pushTrackingRows = async () => {
    // Always re-parse the current textarea so the pushed count matches exactly
    // what's on screen (even if the preview was from an earlier edit).
    const { rows, error } = computeTrackingRows(trackingJsonInput);
    setTrackingRows(rows);
    setTrackingParseError(error);
    if (rows.length === 0) return;
    if (!SHEET_EDIT_API_URL) {
      alert(
        "The Tracking push needs the Sheet edit endpoint. Deploy the updated Apps Script and set SHEET_EDIT_API_URL.",
      );
      return;
    }
    // Only Order ID + Tracking ID are written — the tracking number lands in
    // the "Shipping ID" column of that order's row in Form responses.
    const enriched = rows
      .filter((r) => r.orderId && r.trackingId)
      .map((r) => ({ orderId: r.orderId, trackingId: r.trackingId }));
    if (enriched.length === 0) {
      setTrackingParseError(
        "Each entry needs both an orderId and a trackingId.",
      );
      return;
    }
    setTrackingBusy(true);
    setTrackingResult(null);
    try {
      const body = new URLSearchParams({
        action: "trackingBulk",
        data: JSON.stringify(enriched),
      });
      await fetch(SHEET_EDIT_API_URL, {
        method: "POST",
        mode: "no-cors",
        body,
      });

      // Optionally also change each order's status (per-row override, else bulk).
      let statusChanged = 0;
      if (trackChangeStatus) {
        for (const r of enriched) {
          const st = trackRowStatus[r.orderId] || trackBulkStatus;
          if (!st) continue;
          patchLocalOrder(r.orderId, { "Order Status": st, status: st });
          try {
            await updateOrderRow(r.orderId, { "Order Status": st });
            statusChanged++;
          } catch (_) {}
        }
      }

      setTrackingResult({ pushed: enriched.length, statusChanged });
      setTrackingJsonInput("");
      setTrackingRows([]);
      setTrackRowStatus({});
    } catch (e) {
      console.error("Tracking push failed:", e);
      alert("Failed to push tracking IDs. Check the console and try again.");
    } finally {
      setTrackingBusy(false);
    }
  };

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
  // Orders calendar now lives in a modal opened from the tab row.
  const [showCalModal, setShowCalModal] = useState(false);

  // ── Track & notify: paste many India Post article numbers (or the raw SMS /
  // booking-report text) into a textarea; we extract every article number,
  // match each against an order by Shipping ID, and stack the matches grouped
  // by date. Status changes + the list persist across sessions (localStorage).
  const [trackInput, setTrackInput] = useState("");
  const [trackError, setTrackError] = useState("");
  const [trackList, setTrackList] = useState([]);
  const [trackPicks, setTrackPicks] = useState({});
  const [trackFailed, setTrackFailed] = useState([]);
  const [trackSummary, setTrackSummary] = useState(null);
  const [trackDateOpen, setTrackDateOpen] = useState({});
  // Multi-select + bulk status change for the matched-tracking list.
  const [trackSelectMode, setTrackSelectMode] = useState(false);
  const [trackSel, setTrackSel] = useState([]); // selected Shipping ID keys
  const [trackBulkStat, setTrackBulkStat] = useState("Getting Shipped");
  const [trackBulkBusy, setTrackBulkBusy] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mo_track_notify");
      if (raw) setTrackList(JSON.parse(raw) || []);
    } catch {}
  }, []);
  const persistTrackList = (next) => {
    try {
      localStorage.setItem("mo_track_notify", JSON.stringify(next));
    } catch {}
  };
  // Pull every India Post article number out of pasted text (raw IDs or a full
  // SMS / booking-report), uppercased & de-duplicated.
  const extractArticleNumbers = (text) => {
    const found = String(text || "")
      .toUpperCase()
      .match(/[A-Z]{2}\d{9}IN/g);
    return found ? [...new Set(found)] : [];
  };
  const sidUp = (v) =>
    String(v || "")
      .trim()
      .toUpperCase();
  const addTrackingBatch = () => {
    // Parse per line so a receiver name / order id on the SAME pasted line
    // (e.g. rows copied from India Post "My Bookings") can link a brand-new
    // tracking number to its order — not just numbers already saved on a row.
    const lines = String(trackInput || "").split(/\r?\n/);
    const idCtx = [];
    const seen = new Set();
    lines.forEach((ln) => {
      (ln.toUpperCase().match(/[A-Z]{2}\d{9}IN/g) || []).forEach((id) => {
        if (!seen.has(id)) {
          seen.add(id);
          idCtx.push({ id, ctx: ln });
        }
      });
    });
    if (idCtx.length === 0) {
      setTrackError(
        "No tracking IDs found. Paste article numbers (e.g. CX042819326IN), or the India Post booking rows (with the receiver name) to auto-link new numbers.",
      );
      setTrackSummary(null);
      return;
    }

    const cleanName = (n) =>
      String(n || "")
        .replace(/\(unconfirmed\)/i, "")
        .trim();

    let added = 0;
    let dup = 0;
    let attached = 0;
    const failed = [];
    const writes = []; // { orderId, id } — new numbers to save to the sheet
    const newRows = [];
    const have = new Set(trackList.map((r) => sidUp(r["Shipping ID"])));

    idCtx.forEach(({ id, ctx }) => {
      // 1) Already saved on an order (matched by its Shipping ID).
      let match = orders.find((o) => sidUp(o["Shipping ID"]) === id);
      let isNew = false;
      if (!match) {
        const ctxU = ctx.toUpperCase();
        // 2) An Order ID appears on the same pasted line.
        match = orders.find((o) => {
          const oid = String(o["Order ID"] || "")
            .toUpperCase()
            .trim();
          return oid && ctxU.includes(oid);
        });
        // 3) A receiver name on the line matches an order's Customer Name.
        if (!match) {
          const ctxL = ctx.toLowerCase();
          const cands = orders.filter((o) => {
            const nm = cleanName(o["Customer Name"]);
            return nm.length >= 4 && ctxL.includes(nm.toLowerCase());
          });
          const noShip = cands.filter(
            (o) => !String(o["Shipping ID"] || "").trim(),
          );
          match =
            noShip.length === 1
              ? noShip[0]
              : cands.length === 1
                ? cands[0]
                : null;
        }
        if (match) isNew = true;
      }
      if (!match) {
        failed.push(id);
        return;
      }
      if (have.has(id)) {
        dup += 1;
        return;
      }
      if (isNew && match["Order ID"]) {
        writes.push({ orderId: match["Order ID"], id });
        attached += 1;
      }
      const d = getOrderDate(match);
      newRows.push({
        "Order ID": match["Order ID"] || "",
        "Customer Name": match["Customer Name"] || "",
        "Phone Number": match["Phone Number"] || "",
        "Shipping ID": id,
        shippingId: id,
        booksList: String(match["Books List"] || ""),
        city: String(match["City"] || ""),
        amount: match.revenue || 0,
        "Payment Type": String(match["Payment Type"] || ""),
        dateT: d ? d.getTime() : 0,
        dateLabel: d
          ? d.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "Undated",
        status: match["Order Status"] || "Processing",
      });
      have.add(id);
      added += 1;
    });

    if (newRows.length) {
      setTrackList((prev) => {
        const next = [...prev, ...newRows];
        persistTrackList(next);
        return next;
      });
    }
    // Save any newly-linked numbers to their order's Shipping ID column.
    if (writes.length) {
      writes.forEach(({ orderId, id }) => {
        patchLocalOrder(orderId, { "Shipping ID": id, shippingId: id });
        updateOrderRow(orderId, { "Shipping ID": id }).catch((e) =>
          console.error("Attach tracking failed:", orderId, e),
        );
      });
      setTimeout(fetchOrders, 1500);
    }
    setTrackFailed(failed);
    setTrackSummary({
      added,
      dup,
      attached,
      failed: failed.length,
      total: idCtx.length,
    });
    setTrackError("");
    if (added > 0) setTrackInput("");
  };
  const removeTracking = (sid) => {
    setTrackList((prev) => {
      const next = prev.filter((r) => sidUp(r["Shipping ID"]) !== sidUp(sid));
      persistTrackList(next);
      return next;
    });
  };
  const clearTracking = () => {
    setTrackList([]);
    setTrackFailed([]);
    setTrackSummary(null);
    persistTrackList([]);
  };
  // Change an order's status right from a Track & notify card and save it to
  // the sheet (Apps Script) — plus optimistically reflect it in the list.
  const updateTrackStatus = (sid, val) => {
    const row = trackList.find((r) => sidUp(r["Shipping ID"]) === sidUp(sid));
    setTrackList((prev) => {
      const next = prev.map((r) =>
        sidUp(r["Shipping ID"]) === sidUp(sid) ? { ...r, status: val } : r,
      );
      persistTrackList(next);
      return next;
    });
    const oid = row?.["Order ID"];
    if (oid) {
      // Optimistically reflect the change on the order card, push it to the
      // sheet (Order Status column, matched by Order ID), then reconcile.
      setOrders((prev) =>
        prev.map((o) =>
          o["Order ID"] === oid
            ? { ...o, "Order Status": val, status: val }
            : o,
        ),
      );
      updateOrderRow(oid, { "Order Status": val })
        .then(() => setTimeout(fetchOrders, 1300))
        .catch((e) => console.error("Track status save failed:", e));
    } else {
      console.warn("No Order ID for shipping ID", sid, "- status not saved.");
    }
  };

  // Bulk-change status for the selected matched-tracking rows, writing each to
  // the sheet in one batch (matched by Order ID), then refetch once.
  const applyTrackBulkStatus = async () => {
    const keys = [...trackSel];
    const val = trackBulkStat;
    if (!keys.length || !val) return;
    setTrackBulkBusy(true);
    const isSel = (r) => keys.some((k) => sidUp(k) === sidUp(r["Shipping ID"]));
    setTrackList((prev) => {
      const next = prev.map((r) => (isSel(r) ? { ...r, status: val } : r));
      persistTrackList(next);
      return next;
    });
    const oids = keys
      .map(
        (k) =>
          trackList.find((r) => sidUp(r["Shipping ID"]) === sidUp(k))?.[
            "Order ID"
          ],
      )
      .filter(Boolean);
    setOrders((prev) =>
      prev.map((o) =>
        oids.includes(o["Order ID"])
          ? { ...o, "Order Status": val, status: val }
          : o,
      ),
    );
    try {
      await Promise.all(
        oids.map((oid) =>
          updateOrderRow(oid, { "Order Status": val }).catch((e) =>
            console.error("Bulk track status save failed:", oid, e),
          ),
        ),
      );
    } finally {
      setTrackBulkBusy(false);
      setTrackSel([]);
      setTrackSelectMode(false);
      setTimeout(fetchOrders, 1300);
    }
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

      // Only keep rows that have a customer name — drop nameless/incomplete
      // rows entirely. Exception: wallet-ledger rows (phone + Wallet, no name,
      // no Order ID) are retained so wallet balances stay correct; they never
      // surface in the orders list (they carry no Order ID).
      const named = parsedOrders.filter((o) => {
        const name = String(o["Customer Name"] || "").trim();
        if (name) return true;
        const w = o["Wallet"];
        return w !== "" && w != null && !isNaN(parseFloat(w));
      });

      // Initial sort, the filter useEffect immediately re-sorts using the
      // current sortOrder, so this is just a placeholder.
      const sorted = sortByDateDesc(named);

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

  // Wallet balances now live in the dedicated Wallet tab. Read it and aggregate
  // a signed balance per phone (+ earliest credit time for holding-days).
  const [walletMap, setWalletMap] = useState({}); // phone -> { balance, firstCreditT }
  const fetchWalletSheet = useCallback(async () => {
    try {
      const res = await fetch(WALLET_SHEET_API_URL);
      const text = await res.text();
      const data = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1));
      const headers = (data.table.cols || []).map((c) => c.label);
      const idx = (label) => headers.indexOf(label);
      const iPhone = idx("Phone Number");
      const iAmt = idx("Amount");
      const iType = idx("Type");
      const iTs = idx("Timestamp");
      const map = {};
      (data.table.rows || []).forEach((row) => {
        const cells = row.c || [];
        const val = (i) => {
          const cell = i >= 0 ? cells[i] : null;
          let v = cell?.v;
          if (v && typeof v === "object" && v.hasOwnProperty("value")) v = v.value;
          return v;
        };
        const ph = String(val(iPhone) || "").replace(/\D/g, "").slice(-10);
        if (ph.length !== 10) return;
        let amt = parseFloat(val(iAmt));
        if (isNaN(amt) || amt === 0) return;
        const type = String(val(iType) || "").toLowerCase();
        if (amt > 0 && type.startsWith("deb")) amt = -amt;
        const tsRaw = val(iTs);
        const t = tsRaw ? new Date(tsRaw).getTime() : 0;
        if (!map[ph]) map[ph] = { balance: 0, firstCreditT: Infinity };
        map[ph].balance += amt;
        if (amt > 0 && t > 0 && t < map[ph].firstCreditT) map[ph].firstCreditT = t;
      });
      setWalletMap(map);
    } catch (e) {
      console.error("Wallet sheet read failed:", e);
    }
  }, []);
  useEffect(() => {
    fetchWalletSheet();
  }, [fetchWalletSheet]);

  // Load the set of order IDs seen on the last visit
  useEffect(() => {
    try {
      const raw = localStorage.getItem("manage_orders_seen_ids");
      setSeenIds(raw ? JSON.parse(raw) : null);
    } catch (_) {
      setSeenIds(null);
    }
  }, []);

  // First ever visit set a baseline so we don't flag every order as new
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
  const orderFormData = (o) => {
    const rev = Number(o.revenue) || 0;
    const isCOD = /cash|cod/i.test(o["Payment Type"] || "");
    // COD orders collect the NET amount (order value − 5.9%); non-COD unchanged.
    const codAmount = isCOD ? Math.round(rev - Math.round(rev * 0.059)) : rev;
    // Order note: packer's comment (local edits win) or the customer's note.
    const note =
      String(orderNotes[o["Order ID"]] ?? o["Comment"] ?? "").trim() ||
      String(o["Order Comment"] || "").trim();
    return {
      orderId: o["Order ID"],
      customerName: o["Customer Name"],
      customerAddress: o["Address"],
      customerCity: o["City"],
      customerState: o["State"],
      customerPincode: o["Pincode"],
      customerPhone: o["Phone Number"],
      totalValueRs: rev,
      isCOD,
      codAmount,
      note,
    };
  };

  // Each order ONE combined frame (India Post CDF + From/To label together).
  // "format" is "pdf" (all frames in one ordered file, best for printing) or
  // "png" (one image per order).
  // "format" is "pdf" or "png". "labelOnly" exports just the bottom From/To
  // address label (no India Post CDF declaration section).
  const downloadFormsFor = (orders, format, filename, labelOnly = false) => {
    if (!orders.length) return;
    const payloads = orders.map(orderFormData);
    if (labelOnly) {
      if (format === "pdf") downloadAddressLabelsPDF(payloads, filename);
      else downloadAddressLabelsPNGs(payloads);
      return;
    }
    if (format === "pdf") {
      downloadCombinedFormsPDF(payloads, filename);
    } else {
      downloadCombinedFormsPNGs(payloads);
    }
  };

  // Selected rows (table view) combined shipping form(s).
  const downloadSelectedForms = (format, labelOnly = false) => {
    const chosen = filteredOrders.filter((o) =>
      selectedIds.includes(o["Order ID"]),
    );
    downloadFormsFor(
      chosen,
      format,
      `${labelOnly ? "address_labels" : "shipping_forms"}_selected_${new Date().toISOString().slice(0, 10)}.pdf`,
      labelOnly,
    );
  };

  // Every order in the current filter combined shipping form(s).
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
    // Show every copy as its own cover, grouped so identical books cluster.
    const allBooks = [...items].sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || "")),
    );
    const uniqueTitles = new Set(items.map((it) => it.name || it.src)).size;
    const totalCopies = items.length;

    // Each PNG holds at most 20 covers; split into multiple parts if needed.
    const BATCH = 20;
    const parts = [];
    for (let i = 0; i < allBooks.length; i += BATCH)
      parts.push(allBooks.slice(i, i + BATCH));
    const totalParts = parts.length;

    const dateStr = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const load = (src) =>
      new Promise((res) => {
        if (!src) return res(null);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => res(img);
        img.onerror = () => res(null);
        img.src = src;
      });

    // Render + download one PNG sheet for a batch of up to 20 covers.
    const renderPart = async (books, part) => {
      const SC = 2; // hi-dpi crisp render
      const COLS = Math.min(5, Math.max(2, books.length));
      const CW = 200;
      const CH = 280;
      const CAP = 30;
      const GAP = 22;
      const PAD = 28;
      const HEAD = 96;
      const cellH = CH + CAP;
      const rows = Math.ceil(books.length / COLS);
      const W = PAD * 2 + COLS * CW + (COLS - 1) * GAP;
      const H = HEAD + rows * cellH + (rows - 1) * GAP + PAD;
      const canvas = document.createElement("canvas");
      canvas.width = W * SC;
      canvas.height = H * SC;
      const ctx = canvas.getContext("2d");
      ctx.scale(SC, SC);

      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#ffffff");
      bg.addColorStop(1, "#f4f4f6");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "#0a0a0a";
      ctx.font = "800 26px Poppins, system-ui, sans-serif";
      ctx.fillText("Books to pack", PAD, 46);
      ctx.fillStyle = "#6b7280";
      ctx.font = "500 14px Poppins, system-ui, sans-serif";
      const partTxt = totalParts > 1 ? ` · Part ${part}/${totalParts}` : "";
      ctx.fillText(
        `${uniqueTitles} title${uniqueTitles === 1 ? "" : "s"} · ${totalCopies} cop${totalCopies === 1 ? "y" : "ies"} · ${dateStr}${partTxt}`,
        PAD,
        70,
      );
      ctx.textAlign = "right";
      ctx.fillStyle = "#fb8500";
      ctx.font = "800 18px Poppins, system-ui, sans-serif";
      ctx.fillText("TheBookX", W - PAD, 46);
      ctx.textAlign = "left";
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD, HEAD - 14);
      ctx.lineTo(W - PAD, HEAD - 14);
      ctx.stroke();

      const roundRect = (x, y, w, h, r) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      };

      const imgs = await Promise.all(books.map((it) => load(it.src)));
      imgs.forEach((img, idx) => {
        const r = Math.floor(idx / COLS);
        const c = idx % COLS;
        const dx = PAD + c * (CW + GAP);
        const dy = HEAD + r * (cellH + GAP);

        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.18)";
        ctx.shadowBlur = 16;
        ctx.shadowOffsetY = 7;
        ctx.fillStyle = "#fff";
        roundRect(dx, dy, CW, CH, 14);
        ctx.fill();
        ctx.restore();

        ctx.save();
        roundRect(dx, dy, CW, CH, 14);
        ctx.clip();
        if (img) {
          ctx.drawImage(img, dx, dy, CW, CH);
        } else {
          ctx.fillStyle = "#ececec";
          ctx.fillRect(dx, dy, CW, CH);
          ctx.fillStyle = "#888";
          ctx.font = "600 13px Poppins, system-ui, sans-serif";
          ctx.fillText(
            (books[idx].name || "").slice(0, 22),
            dx + 12,
            dy + CH / 2,
          );
        }
        ctx.restore();

        const nm = books[idx].name || "";
        const label = nm.length > 26 ? nm.slice(0, 25) + "…" : nm;
        ctx.fillStyle = "#374151";
        ctx.font = "600 12px Poppins, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(label, dx + CW / 2, dy + CH + 20);
        ctx.textAlign = "left";
      });

      await new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download =
              totalParts > 1
                ? `unpicked-covers-part${part}of${totalParts}-${Date.now()}.png`
                : `unpicked-covers-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
          resolve();
        }, "image/png");
      });
    };

    for (let p = 0; p < parts.length; p++) {
      // eslint-disable-next-line no-await-in-loop
      await renderPart(parts[p], p + 1);
    }

    showToast(
      totalParts > 1
        ? `Downloaded ${totalParts} cover sheets · ${totalCopies} books`
        : `Downloaded ${totalCopies} book cover${totalCopies === 1 ? "" : "s"}`,
      "success",
    );
  };

  // Restore saved filter/search preferences on mount
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("manage_orders_prefs") || "{}");
      if (p.searchQuery) setSearchQuery(p.searchQuery);
      if (p.statusFilter)
        setStatusFilter(
          Array.isArray(p.statusFilter) ? p.statusFilter : [p.statusFilter],
        );
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

    const statusSel = Array.isArray(statusFilter)
      ? statusFilter
      : [statusFilter];
    // Confirmed/Unconfirmed act as an AND modifier ON TOP of the status
    // selection (not a separate OR clause), so "In Transit no-tracking" +
    // "Confirmed only" returns only confirmed in-transit-no-tracking orders.
    const confSel = statusSel.filter(
      (f) => f === "confirmed" || f === "unconfirmed",
    );
    const statusOnly = statusSel.filter(
      (f) => f !== "confirmed" && f !== "unconfirmed",
    );
    if (statusSel.length) {
      filtered = filtered.filter((order) => {
        const s = order["Order Status"] || "";
        const sl = s.toLowerCase();
        const hasTracking = String(order["Shipping ID"] || "").trim() !== "";
        const isUnconfirmed = /unconfirmed/i.test(
          String(order["Customer Name"] || ""),
        );
        // Status match (OR across the chosen statuses; "all"/none = any).
        const statusPass =
          !statusOnly.length || statusOnly.includes("all")
            ? true
            : statusOnly.some((f) => {
                if (f === "active") {
                  return (
                    !sl ||
                    sl.includes("pending") ||
                    sl.includes("processing") ||
                    sl.includes("getting shipped")
                  );
                }
                if (f === "intransit-notrack") {
                  return s === "In Transit" && !hasTracking;
                }
                return s === f;
              });
        // Confirmation match (AND): confirmed hides "(unconfirmed)" rows.
        const confPass = !confSel.length
          ? true
          : confSel.some((f) =>
              f === "confirmed" ? !isUnconfirmed : isUnconfirmed,
            );
        return statusPass && confPass;
      });
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

  // Distinct Order Status / Payment Type values actually present in the sheet,
  // so the filter dropdowns only offer what really exists (no dead options).
  const distinctStatuses = useMemo(() => {
    const set = new Set();
    orders.forEach((o) => {
      const v = String(o["Order Status"] || "").trim();
      if (v) set.add(v);
    });
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [orders]);

  const distinctPayments = useMemo(() => {
    const set = new Set();
    orders.forEach((o) => {
      const v = String(o["Payment Type"] || "").trim();
      if (v) set.add(v);
    });
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [orders]);

  const gettingShippedCount = useMemo(
    () =>
      orders.filter((o) => /getting shipped/i.test(o["Order Status"] || ""))
        .length,
    [orders],
  );

  // Orders received per calendar day { "YYYY-MM-DD": count }
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
    if (analyticsPeriod === "year") {
      const y = new Date(now.getFullYear() + periodOffset, 0, 1);
      const end = new Date(y.getFullYear() + 1, 0, 1);
      return {
        start: y,
        end,
        label: String(y.getFullYear()),
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

  // ─────────────────────────────────────────────────────────────────────
  // Curated analytics data layer (rebuilt dashboard). Everything below only
  // counts orders that actually carry an Order ID, and scopes to the period
  // filter (Week / Month / Year / …) chosen in the Filters panel.
  // ─────────────────────────────────────────────────────────────────────
  const hasOrderId = (o) => !!String(o["Order ID"] || "").trim();
  const anOrders = useMemo(
    () => analyticsOrders.filter(hasOrderId),
    [analyticsOrders],
  );

  // 1 — Top overview stats for the selected period.
  const overview = useMemo(() => {
    const n = anOrders.length;
    const revenue = anOrders.reduce((s, o) => s + (o.revenue || 0), 0);
    const cost = anOrders.reduce((s, o) => s + (o.totalCost || 0), 0);
    const delivery = anOrders.reduce((s, o) => s + (o.deliveryCost || 0), 0);
    const profit = revenue - cost;
    const delivered = anOrders.filter((o) =>
      /delivered/i.test(String(o["Order Status"] || "")),
    ).length;
    const cancelled = anOrders.filter((o) =>
      /cancel/i.test(String(o["Order Status"] || "")),
    ).length;
    const codN = anOrders.filter((o) =>
      /cash|cod/i.test(String(o["Payment Type"] || "")),
    ).length;
    const units = anOrders.reduce(
      (s, o) =>
        s +
        (o.parsedBooks || []).reduce(
          (t, b) => t + (Number(b.quantity) || 1),
          0,
        ),
      0,
    );
    return {
      n,
      revenue,
      cost,
      delivery,
      profit,
      units,
      margin: revenue > 0 ? Math.round((profit / revenue) * 100) : 0,
      aov: n ? Math.round(revenue / n) : 0,
      delivered,
      cancelled,
      codN,
      upiN: n - codN,
    };
  }, [anOrders]);

  // 2 — Distinct customers (all-time) who currently hold wallet balance.
  const walletUsers = useMemo(() => {
    const latest = {};
    orders.forEach((o) => {
      const ph = String(o["Phone Number"] || "")
        .replace(/\D/g, "")
        .slice(-10);
      if (!ph) return;
      const wRaw = o["Wallet"] ?? o["wallet"];
      if (wRaw === "" || wRaw == null) return;
      const w = parseFloat(wRaw);
      if (isNaN(w)) return;
      const d = getOrderDate(o);
      const t = d ? d.getTime() : 0;
      if (!latest[ph] || t >= latest[ph].t) latest[ph] = { t, w };
    });
    const holders = Object.values(latest).filter((x) => x.w > 0);
    return {
      count: holders.length,
      total: holders.reduce((s, x) => s + x.w, 0),
    };
  }, [orders]);

  // 4 — Total orders bar chart buckets (weekdays, monthdates, yearmonths).
  const ordersBar = useMemo(() => {
    const start = periodWindow.start;
    const tKey = dayKey(new Date());
    const nowM = new Date().getMonth();
    const nowY = new Date().getFullYear();
    if (analyticsPeriod === "week" && start) {
      const days = [];
      const idx = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const k = dayKey(d);
        idx[k] = i;
        days.push({
          label: WEEKDAY_LABELS[i],
          sub: String(d.getDate()),
          count: 0,
          isToday: k === tKey,
        });
      }
      anOrders.forEach((o) => {
        const d = getOrderDate(o);
        if (d && idx[dayKey(d)] != null) days[idx[dayKey(d)]].count++;
      });
      return days;
    }
    if ((analyticsPeriod === "month" || analyticsPeriod === "day") && start) {
      const mStart = new Date(start.getFullYear(), start.getMonth(), 1);
      const mEnd = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      const days = [];
      const idx = {};
      const cur = new Date(mStart);
      let i = 0;
      while (cur < mEnd) {
        const k = dayKey(cur);
        idx[k] = i++;
        days.push({
          label: String(cur.getDate()),
          sub: WEEKDAY_LABELS[(cur.getDay() + 6) % 7],
          count: 0,
          isToday: k === tKey,
        });
        cur.setDate(cur.getDate() + 1);
      }
      anOrders.forEach((o) => {
        const d = getOrderDate(o);
        if (d && idx[dayKey(d)] != null) days[idx[dayKey(d)]].count++;
      });
      return days;
    }
    // year / all 12 months
    const yr = start ? start.getFullYear() : nowY;
    const months = MONTH_LABELS.map((m, i) => ({
      label: m,
      sub: "",
      count: 0,
      isToday: i === nowM && yr === nowY,
    }));
    anOrders.forEach((o) => {
      const d = getOrderDate(o);
      if (d) months[d.getMonth()].count++;
    });
    return months;
  }, [anOrders, analyticsPeriod, periodWindow]);

  // 5 — Orders per weekday across the whole selected period.
  const weekdayData = useMemo(() => {
    const arr = WEEKDAY_LABELS.map((l) => ({ label: l, count: 0 }));
    anOrders.forEach((o) => {
      const d = getOrderDate(o);
      if (d) arr[(d.getDay() + 6) % 7].count++;
    });
    return arr;
  }, [anOrders]);

  // 7 — Per-day revenue / cost / profit. Week & month the whole window.
  // Year the month picked in the chart's dropdown (horizontally scrollable).
  const pnlDays = useMemo(() => {
    let start, end;
    const win = periodWindow.start;
    if (analyticsPeriod === "year" && win) {
      start = new Date(win.getFullYear(), pnlMonth, 1);
      end = new Date(win.getFullYear(), pnlMonth + 1, 1);
    } else if (analyticsPeriod === "week" && win) {
      start = new Date(win);
      end = new Date(periodWindow.end);
    } else if (win) {
      start = new Date(win.getFullYear(), win.getMonth(), 1);
      end = new Date(win.getFullYear(), win.getMonth() + 1, 1);
    } else {
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    const tKey = dayKey(new Date());
    const map = {};
    const days = [];
    const cur = new Date(start);
    while (cur < end) {
      const rec = {
        key: dayKey(cur),
        day: cur.getDate(),
        wd: WEEKDAY_LABELS[(cur.getDay() + 6) % 7],
        revenue: 0,
        cost: 0,
        profit: 0,
        isToday: dayKey(cur) === tKey,
      };
      map[rec.key] = rec;
      days.push(rec);
      cur.setDate(cur.getDate() + 1);
    }
    anOrders.forEach((o) => {
      const d = getOrderDate(o);
      if (!d) return;
      const rec = map[dayKey(d)];
      if (!rec) return;
      rec.revenue += o.revenue || 0;
      rec.cost += o.totalCost || 0;
    });
    days.forEach((r) => (r.profit = r.revenue - r.cost));
    return days;
  }, [anOrders, analyticsPeriod, periodWindow, pnlMonth]);

  // 8 — Per-book profitability + net totals (period-scoped).
  const bookStats = useMemo(() => {
    const map = {};
    anOrders.forEach((o) => {
      (o.parsedBooks || []).forEach((line) => {
        const name = String(line.name || "").trim();
        if (!name) return;
        const b = BOOK_BY_NAME[name.toLowerCase()];
        const qty = Number(line.quantity) || 1;
        const revenue = Number(line.total) || (Number(line.price) || 0) * qty;
        if (!map[name])
          map[name] = {
            name,
            qty: 0,
            revenue: 0,
            unitCost: b ? Number(b.cost) || 0 : 0,
            matched: !!b,
          };
        map[name].qty += qty;
        map[name].revenue += revenue;
      });
    });
    const rows = Object.values(map)
      .map((r) => {
        const cost = r.unitCost * r.qty;
        return { ...r, cost, profit: r.revenue - cost };
      })
      .sort((a, b) => b.profit - a.profit);
    const totals = rows.reduce(
      (a, r) => ({
        qty: a.qty + r.qty,
        revenue: a.revenue + r.revenue,
        cost: a.cost + r.cost,
        profit: a.profit + r.profit,
      }),
      { qty: 0, revenue: 0, cost: 0, profit: 0 },
    );
    return { rows, totals };
  }, [anOrders]);

  // 9 — Time-of-day quadrants (6-hour buckets) for the selected period.
  const quadrantData = useMemo(() => {
    const q = [
      { label: "12–6 AM", tag: "Late night", count: 0 },
      { label: "6 AM–12 PM", tag: "Morning", count: 0 },
      { label: "12–6 PM", tag: "Afternoon", count: 0 },
      { label: "6 PM–12 AM", tag: "Evening", count: 0 },
    ];
    anOrders.forEach((o) => {
      const d = getOrderDate(o);
      if (d) q[Math.floor(d.getHours() / 6)].count++;
    });
    return q;
  }, [anOrders]);

  // Projection & run rate — extrapolate the period's pace to its full length.
  const projection = useMemo(() => {
    const now = new Date();
    const msDay = 86400000;
    const start = periodWindow.start;
    const end = periodWindow.end;
    // No bounded window (all-time / day) report the observed daily pace only.
    if (analyticsPeriod === "all" || !start || !end) {
      const activeDays = Math.max(
        1,
        new Set(anOrders.map((o) => dayKey(getOrderDate(o))).filter(Boolean))
          .size,
      );
      return {
        hasForecast: false,
        revPerDay: Math.round(overview.revenue / activeDays),
        ordPerDay: Math.round((overview.n / activeDays) * 10) / 10,
        totalDays: activeDays,
        elapsedDays: activeDays,
        daysLeft: 0,
        actualRev: overview.revenue,
        projectedRev: overview.revenue,
        projectedOrders: overview.n,
        progressPct: 100,
      };
    }
    const totalDays = Math.max(1, Math.round((end - start) / msDay));
    const complete = now >= end;
    let elapsedDays;
    if (complete) elapsedDays = totalDays;
    else if (now < start) elapsedDays = 0;
    else
      elapsedDays = Math.min(totalDays, Math.floor((now - start) / msDay) + 1);
    const eDays = Math.max(1, elapsedDays);
    const revPerDay = overview.revenue / eDays;
    const ordPerDay = overview.n / eDays;
    const daysLeft = Math.max(0, totalDays - elapsedDays);
    const hasForecast = !complete && totalDays > 1 && daysLeft > 0;
    const projectedRev = hasForecast
      ? Math.round(revPerDay * totalDays)
      : overview.revenue;
    const projectedOrders = hasForecast
      ? Math.round(ordPerDay * totalDays)
      : overview.n;
    const progressPct =
      projectedRev > 0
        ? Math.min(100, Math.round((overview.revenue / projectedRev) * 100))
        : 0;
    return {
      hasForecast,
      revPerDay: Math.round(revPerDay),
      ordPerDay: Math.round(ordPerDay * 10) / 10,
      totalDays,
      elapsedDays,
      daysLeft,
      actualRev: overview.revenue,
      projectedRev,
      projectedOrders,
      progressPct,
    };
  }, [anOrders, overview, analyticsPeriod, periodWindow]);

  // Monthly run rate — one line per month of the CURRENT year, plotted by
  // day-of-month (x = 1…31). Each point is the running cumulative order count
  // for that month through that day. Past months run to their last day; the
  // current month stops at today (blinking dot, no line beyond). Only valid IDs.
  const monthlyRunRate = useMemo(() => {
    const y = new Date().getFullYear();
    const now = new Date();
    const curMonth = now.getMonth();
    const curDay = now.getDate();
    // daily[m][day] = orders placed on that calendar day (day is 1-indexed).
    const daily = Array.from({ length: 12 }, (_, m) =>
      new Array(new Date(y, m + 1, 0).getDate() + 1).fill(0),
    );
    orders.forEach((o) => {
      if (!hasOrderId(o)) return;
      const d = getOrderDate(o);
      if (!d || d.getFullYear() !== y) return;
      daily[d.getMonth()][d.getDate()] += 1;
    });
    const months = daily
      .map((arr, m) => {
        const daysInMonth = arr.length - 1;
        const lastDay =
          m < curMonth ? daysInMonth : m === curMonth ? curDay : 0;
        let run = 0;
        const pts = [];
        for (let day = 1; day <= lastDay; day++) {
          run += arr[day] || 0;
          pts.push({ day, value: run });
        }
        return {
          month: m,
          label: MONTH_LABELS[m],
          color: MONTH_COLORS[m],
          pts,
          total: run,
          isCurrent: m === curMonth,
        };
      })
      .filter((mm) => mm.pts.length > 0 && mm.total > 0);
    const max = Math.max(1, ...months.map((mm) => mm.total));
    return { year: y, curMonth, curDay, months, max };
  }, [orders]);

  // ── Users / customer management ────────────────────────────────────────
  // Aggregate every order by phone number one record per customer, with
  // their spend, repeat status, average order size, last order and wallet.
  const userList = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const ph = String(o["Phone Number"] || "")
        .replace(/\D/g, "")
        .slice(-10);
      if (!ph) return;
      if (!map[ph]) {
        map[ph] = {
          phone: ph,
          name: "",
          city: "",
          orders: 0,
          spent: 0,
          units: 0,
          lastT: -1,
          lastDate: null,
          walletT: -1,
          wallet: 0,
          walletFirstCreditT: Infinity,
          ids: [],
        };
      }
      const u = map[ph];
      const d = getOrderDate(o);
      const t = d ? d.getTime() : 0;
      if (t >= u.lastT) {
        u.lastT = t;
        u.lastDate = d;
        const nm = String(o["Customer Name"] || "").trim();
        if (nm) u.name = nm;
        const c = String(o["City"] || "").trim();
        if (c) u.city = c;
      }
      if (hasOrderId(o)) {
        u.orders += 1;
        u.spent += o.revenue || 0;
        u.units += (o.parsedBooks || []).reduce(
          (s, b) => s + (Number(b.quantity) || 1),
          0,
        );
        u.ids.push(o["Order ID"]);
      }
      const wRaw = o["Wallet"] ?? o["wallet"];
      if (wRaw !== "" && wRaw != null) {
        const w = parseFloat(wRaw);
        if (!isNaN(w)) {
          // SUM the ledger — rewards are positive, wallet spent is negative.
          // Matches the customer-facing balance (fetchWalletBalance sums too).
          u.wallet += w;
          // Earliest positive credit how long the balance has been held.
          if (w > 0 && t > 0 && t < u.walletFirstCreditT) {
            u.walletFirstCreditT = t;
          }
        }
      }
    });
    const nowT = Date.now();
    return Object.values(map)
      .map((u) => {
        // Wallet is authoritative from the dedicated Wallet tab; fall back to
        // legacy main-sheet ledger only if this phone isn't in the Wallet tab.
        const wm = walletMap[u.phone];
        const wallet = wm
          ? Math.max(0, Math.round(wm.balance))
          : Math.max(0, Math.round(u.wallet));
        const firstCreditT = wm ? wm.firstCreditT : u.walletFirstCreditT;
        return {
          ...u,
          wallet,
          avg: u.orders ? Math.round(u.spent / u.orders) : 0,
          repeat: u.orders > 1,
          // Days the wallet balance has been held (from earliest credit).
          holdingDays:
            wallet > 0 && isFinite(firstCreditT)
              ? Math.max(0, Math.floor((nowT - firstCreditT) / 86400000))
              : null,
        };
      })
      .sort((a, b) => b.spent - a.spent);
  }, [orders, walletMap]);

  const userSummary = useMemo(() => {
    const total = userList.length;
    const repeatUsers = userList.filter((u) => u.repeat);
    const repeatSpent = repeatUsers.reduce((s, u) => s + u.spent, 0);
    const repeatOrders = repeatUsers.reduce((s, u) => s + u.orders, 0);
    const walletTotal = userList.reduce(
      (s, u) => s + (u.wallet > 0 ? u.wallet : 0),
      0,
    );
    const walletHolders = userList.filter((u) => u.wallet > 0).length;
    const allSpent = userList.reduce((s, u) => s + u.spent, 0);
    const allOrders = userList.reduce((s, u) => s + u.orders, 0);
    return {
      total,
      repeatCount: repeatUsers.length,
      repeatPct: total ? Math.round((repeatUsers.length / total) * 100) : 0,
      repeatAvg: repeatOrders ? Math.round(repeatSpent / repeatOrders) : 0,
      overallAvg: allOrders ? Math.round(allSpent / allOrders) : 0,
      walletTotal,
      walletHolders,
    };
  }, [userList]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    let list = userList;
    if (q) {
      list = list.filter(
        (u) =>
          (u.name || "").toLowerCase().includes(q) ||
          u.phone.includes(q.replace(/\D/g, "")),
      );
    }
    // Wallet holding-days filter — only users sitting on a balance for ≥ N days.
    if (walletHoldFilter > 0) {
      list = list.filter(
        (u) => u.wallet > 0 && (u.holdingDays || 0) >= walletHoldFilter,
      );
    }
    // Wallet-balance threshold — only customers holding more than ₹N.
    if (walletMinFilter > 0) {
      list = list.filter((u) => (u.wallet || 0) > walletMinFilter);
    }
    // Sort
    const sorted = [...list];
    if (userSort === "walletAsc") {
      sorted.sort((a, b) => (a.wallet || 0) - (b.wallet || 0));
    } else if (userSort === "walletDesc") {
      sorted.sort((a, b) => (b.wallet || 0) - (a.wallet || 0));
    } else {
      // recent — most recent order first
      sorted.sort(
        (a, b) => (b.lastDate?.getTime() || 0) - (a.lastDate?.getTime() || 0),
      );
    }
    return sorted;
  }, [userList, userSearch, walletHoldFilter, walletMinFilter, userSort]);

  // Reset pagination whenever the filter/search/sort changes.
  useEffect(() => {
    setUserVisible(20);
    setOpenUserMenu(null);
  }, [userSearch, walletHoldFilter, walletMinFilter, userSort]);

  // Adjust a customer's wallet by APPENDING a signed ledger row to the orders
  // sheet (phone + delta + timestamp). The balance is the SUM of every Wallet
  // entry, so a positive delta credits and a negative delta deducts — exactly
  // what the customer profile reads. Never overwrite existing rows.
  const applyWalletChange = async (user, newBalance, reason = "") => {
    const target = Math.max(0, Math.round(newBalance));
    const cur = Math.round(user.wallet || 0);
    const delta = target - cur;
    if (delta === 0) {
      setWalletModal(null);
      return;
    }
    setWalletBusy(true);
    try {
      // Signed transaction to the Wallet tab: +delta credits, −delta deducts.
      const res = await appendWalletTx(user.phone, {
        amount: delta,
        type: delta >= 0 ? "Credit" : "Debit",
        reason:
          String(reason || "").trim() ||
          (delta >= 0 ? "Manual credit by admin" : "Manual deduction by admin"),
      });
      if (!res || !res.success) throw new Error("Ledger append failed");
      // Optimistically reflect the new balance in the Wallet map so the Users
      // tab updates immediately, then re-read the Wallet tab to confirm.
      setWalletMap((prev) => {
        const cur2 = prev[user.phone] || { balance: 0, firstCreditT: Infinity };
        const firstCreditT =
          delta > 0
            ? Math.min(cur2.firstCreditT, Date.now())
            : cur2.firstCreditT;
        return {
          ...prev,
          [user.phone]: { balance: cur2.balance + delta, firstCreditT },
        };
      });
      setWalletModal(null);
      setTimeout(() => fetchWalletSheet(), 1800);
    } catch (e) {
      console.error("Wallet update failed:", e);
      alert("Could not update wallet. Please try again.");
    } finally {
      setWalletBusy(false);
    }
  };

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
    // Append directly to the sheet (header-keyed) via the Apps Script.
    const fields = {
      Timestamp: formatDateForSheet(now),
      "Order ID": formData.orderId || `ORD${Date.now()}`,
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
      "Delivery Charge": formData.deliveryCharge,
      "Gift Wrap": formData.giftWrap,
      "Gift Wrap Charge": formData.giftWrapCharge,
      "Offer Applied": formData.offerApplied,
      TinyURL: formData.tinyUrl,
      "Order Status": formData.orderStatus,
      "User Agent": navigator.userAgent,
      "Shipping ID": formData.shippingId,
    };

    try {
      await appendOrderRow(fields);
      alert("Order added successfully!");
      setShowAddModal(false);
      resetForm();
      setTimeout(fetchOrders, 1300);
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

  // Append a NEW order row via the Apps Script (action=append). `fields` is
  // keyed by sheet-column header (e.g. { "Order ID": "...", ... }). Used instead
  // of the Google Form, which rejects submissions when a question is Required.
  const appendOrderRow = async (fields) => {
    const body = new URLSearchParams({
      action: "append",
      data: JSON.stringify(fields),
    });
    await fetch(SHEET_EDIT_API_URL, {
      method: "POST",
      mode: "no-cors",
      body,
    });
  };

  // ── Inline row edits from the order card (all write in place via the Apps
  // Script). Each does an optimistic local update so the card reflects the
  // change immediately, then re-fetches to reconcile with the sheet.
  const patchLocalOrder = (orderId, patch) => {
    setOrders((prev) =>
      prev.map((o) =>
        String(o["Order ID"]) === String(orderId) ? { ...o, ...patch } : o,
      ),
    );
  };

  const saveTrackingId = async (order, value) => {
    const orderId = order["Order ID"];
    const tid = String(value || "").trim();
    if (!tid) return;
    setRowSaving((p) => ({ ...p, [orderId]: "tracking" }));
    try {
      await updateOrderRow(orderId, { "Shipping ID": tid });
      patchLocalOrder(orderId, { "Shipping ID": tid, shippingId: tid });
      setTrackDrafts((p) => {
        const n = { ...p };
        delete n[orderId];
        return n;
      });
      setTimeout(fetchOrders, 1300);
    } catch (e) {
      console.error("Tracking save failed:", e);
      alert("Couldn't save the tracking ID. Try again.");
    } finally {
      setRowSaving((p) => {
        const n = { ...p };
        delete n[orderId];
        return n;
      });
    }
  };

  const saveAddress = async (order) => {
    const orderId = order["Order ID"];
    const draft = addrEdit[orderId];
    if (!draft) return;
    setRowSaving((p) => ({ ...p, [orderId]: "address" }));
    try {
      const fields = {
        Address: draft.address || "",
        City: draft.city || "",
        State: draft.state || "",
        Pincode: draft.pincode || "",
      };
      await updateOrderRow(orderId, fields);
      patchLocalOrder(orderId, {
        Address: fields.Address,
        City: fields.City,
        State: fields.State,
        Pincode: fields.Pincode,
      });
      setAddrEdit((p) => {
        const n = { ...p };
        delete n[orderId];
        return n;
      });
      setTimeout(fetchOrders, 1300);
    } catch (e) {
      console.error("Address save failed:", e);
      alert("Couldn't save the address. Try again.");
    } finally {
      setRowSaving((p) => {
        const n = { ...p };
        delete n[orderId];
        return n;
      });
    }
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
        `Delete order ${orderId} permanently from the sheet?\n\nThis also removes any wallet reward credited for this order. This cannot be undone.`,
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
    // "Date(2026,4,20,23,14,14)"
    // or the plain-text form
    // "20/05/2026 23:14:14"
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
    const id = String(shippingId || "").trim();
    if (!id) return;
    try {
      navigator.clipboard.writeText(id);
    } catch (_) {}
    const ok = window.confirm(
      `Tracking ID "${id}" copied.\n\nClick OK to open India Post tracking — paste the ID there to track this parcel.`,
    );
    if (ok) {
      window.open(INDIA_POST_URL, "_blank", "noopener,noreferrer");
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
      "Shipping ID",
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
      o["Shipping ID"] || "",
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

  // Per-book profitability — respects BOTH the analytics period (day/week/
  // month/all) and the Filters panel (status/payment/date) + search. We
  // intersect the two order sets by Order ID.
  const analyticsIdSet = new Set(
    analyticsOrders.map((o) => o["Order ID"]).filter(Boolean),
  );
  const bpSource = filteredOrders.filter((o) =>
    analyticsIdSet.has(o["Order ID"]),
  );
  const bpDelivery = bpSource.reduce((s, o) => s + (o.deliveryCost || 0), 0);
  const bpRevenue = bpSource.reduce((s, o) => s + (o.revenue || 0), 0);
  const bpTotalCost = bpSource.reduce((s, o) => s + (o.totalCost || 0), 0);
  const bpOrderProfit = bpRevenue - bpTotalCost;
  const bookProfitRows = (() => {
    const map = {};
    bpSource.forEach((o) => {
      (o.parsedBooks || []).forEach((line) => {
        const name = String(line.name || "").trim();
        if (!name) return;
        const b = BOOK_BY_NAME[name.toLowerCase()];
        const qty = Number(line.quantity) || 1;
        const revenue = Number(line.total) || (Number(line.price) || 0) * qty;
        if (!map[name]) {
          map[name] = {
            name,
            qty: 0,
            revenue: 0,
            unitCost: b ? Number(b.cost) || 0 : 0,
            matched: !!b,
          };
        }
        map[name].qty += qty;
        map[name].revenue += revenue;
      });
    });
    return Object.values(map)
      .map((r) => {
        const cost = r.unitCost * r.qty;
        const profit = r.revenue - cost;
        return {
          ...r,
          cost,
          profit,
          avgPrice: r.qty ? Math.round(r.revenue / r.qty) : 0,
          unitProfit: r.qty ? Math.round(profit / r.qty) : 0,
        };
      })
      .sort((a, b) => b.profit - a.profit);
  })();
  const bpTotals = bookProfitRows.reduce(
    (a, r) => ({
      qty: a.qty + r.qty,
      revenue: a.revenue + r.revenue,
      cost: a.cost + r.cost,
      profit: a.profit + r.profit,
    }),
    { qty: 0, revenue: 0, cost: 0, profit: 0 },
  );

  // Weight-slab distribution for the delivery-cost card
  const deliverySlabs = [
    { label: "0–500g", rate: 82, max: 500 },
    { label: "500g–1.2kg", rate: 126, max: 1200 },
    { label: "1.2–2kg", rate: 200, max: 2000 },
    { label: "2–4kg", rate: 300, max: 4000 },
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
    { key: "Pending", color: "#94a3b8" },
    { key: "Processing", color: "#fb8500" },
    { key: "Getting Shipped", color: "#f59e0b" },
    { key: "Shipped", color: "#3b6fe0" },
    { key: "In Transit", color: "#7c4dff" },
    { key: "Out for Delivery", color: "#0ea5e9" },
    { key: "Delivered", color: "#008f0c" },
    { key: "Money received", color: "#059669" },
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
    if (orderPickFilter === "noted")
      return !!(orderNotes[o["Order ID"]] || o["Comment"]);
    return true;
  });
  // Lazy-render the list in batches of 10 (infinite scroll).
  const visibleOrders = listOrders.slice(0, ordersVisible);
  const hasMoreOrders = ordersVisible < listOrders.length;
  const notedOrdersCount = filteredOrders.filter(
    (o) => !!(orderNotes[o["Order ID"]] || o["Comment"]),
  ).length;
  const pickedOrdersCount = filteredOrders.filter(isOrderFullyPicked).length;

  // ── Merge orders of the same customer into one ──────────────────────────
  // Groups the current (filtered) order list by phone number. Any customer
  // with 2+ live (non-cancelled) orders can be merged into a single order:
  // book lines are combined, the subtotal is summed, and delivery + COD
  // handling (₹29) are recomputed on the merged total via the same checkout
  // tiers used on the bag page.
  const MERGE_COD_HANDLING_FEE = 29;
  const normMergePhone = (p) => String(p || "").replace(/\D/g, "").slice(-10);
  const isMergeableOrder = (o) =>
    !/cancel|merged/i.test(String(o["Order Status"] || ""));

  const mergeGroups = (() => {
    const byPhone = {};
    // Group strictly within the current filtered result set so a customer only
    // appears when 2+ of their orders actually match the active filters.
    filteredOrders.forEach((o) => {
      if (!isMergeableOrder(o)) return;
      const key = normMergePhone(o["Phone Number"]);
      if (!key || key.length < 10) return;
      (byPhone[key] = byPhone[key] || []).push(o);
    });
    return Object.entries(byPhone)
      .filter(([, arr]) => arr.length >= 2)
      .map(([phone, arr]) => ({ phone, orders: arr }));
  })();

  const computeMergedOrder = (group) => {
    const grpOrders = group.orders;
    // Combine identical books (same name + unit price) across all orders.
    const map = new Map();
    grpOrders.forEach((o) => {
      (o.parsedBooks || []).forEach((b) => {
        const key = `${b.name}__${b.price}`;
        const prev =
          map.get(key) ||
          { name: b.name, price: b.price, quantity: 0, total: 0 };
        prev.quantity += b.quantity || 0;
        prev.total += b.total || b.price * (b.quantity || 0) || 0;
        map.set(key, prev);
      });
    });
    const books = Array.from(map.values());
    const subtotal = books.reduce((s, b) => s + (b.total || 0), 0);
    const isCOD = grpOrders.some((o) =>
      /cash|cod/i.test(o["Payment Type"] || ""),
    );
    const deliveryCharge = getDeliveryCharge(subtotal, false, false);
    const codFee = isCOD ? MERGE_COD_HANDLING_FEE : 0;
    const total = subtotal + deliveryCharge + codFee;
    // Most-recent order supplies the address / name for the merged order.
    const primary = grpOrders.reduce((a, b) => {
      const ta = getOrderDate(a)?.getTime() || 0;
      const tb = getOrderDate(b)?.getTime() || 0;
      return tb > ta ? b : a;
    }, grpOrders[0]);
    const booksListStr = books
      .map(
        (b, i) =>
          `${i + 1}. ${b.name} | Qty: ${b.quantity} | ₹${b.price} each | Total: ₹${b.total}`,
      )
      .join("\n");
    return {
      orders: grpOrders,
      books,
      subtotal,
      isCOD,
      deliveryCharge,
      codFee,
      total,
      primary,
      booksListStr,
    };
  };

  const performMerge = async () => {
    if (!mergeGroup) return;
    if (!SHEET_EDIT_API_URL) {
      alert(
        "Merge needs the Sheet edit endpoint. Deploy docs/sheet-edit-apps-script.gs and set SHEET_EDIT_API_URL.",
      );
      return;
    }
    const m = computeMergedOrder(mergeGroup);
    const primary = m.primary;
    const newId = `MRG${Date.now()}`;
    setMerging(true);
    try {
      // 1 — Append the new merged order (header-keyed, via Apps Script).
      const now = new Date();
      await appendOrderRow({
        Timestamp: formatDateForSheet(now),
        "Order ID": newId,
        "Customer Name": primary["Customer Name"] || "",
        "Phone Number": primary["Phone Number"] || "",
        Pincode: primary["Pincode"] || "",
        City: primary["City"] || "",
        State: primary["State"] || "",
        Address: primary["Address"] || "",
        "Books List": m.booksListStr,
        "Total Amount": String(m.total),
        "Payment Type": m.isCOD
          ? "Cash on Delivery (COD)"
          : primary["Payment Type"] || "Prepaid",
        "Delivery Type": primary["Delivery Type"] || "Standard",
        "Delivery Charge": String(m.deliveryCharge),
        "Gift Wrap": "No",
        "Gift Wrap Charge": "0",
        "Offer Applied": `Merged from ${m.orders.length} orders: ${m.orders
          .map((o) => o["Order ID"])
          .join(", ")}`,
        TinyURL: "",
        "Order Status": "Processing",
        "User Agent": navigator.userAgent,
        "Shipping ID": "",
      });

      // 2 — Cancel each original order, noting where it went.
      for (const o of m.orders) {
        await updateOrderRow(o["Order ID"], {
          "Order Status": "Cancelled",
          Comment: `Merged into ${newId}`,
        });
      }

      showToast(
        `Merged ${m.orders.length} orders into ${newId} · ₹${m.total}`,
        "success",
      );
      setMergeGroup(null);
      setTimeout(fetchOrders, 1500);
    } catch (e) {
      console.error("Merge failed:", e);
      alert("Merge failed. Please try again.");
    } finally {
      setMerging(false);
    }
  };

  // Reset the lazy window whenever the filtered set / pick-tab / sort changes.
  useEffect(() => {
    setOrdersVisible(ORDERS_BATCH);
  }, [
    searchQuery,
    statusFilter,
    paymentFilter,
    dateFrom,
    dateTo,
    selectedDate,
    orderPickFilter,
    sortOrder,
  ]);

  // Grow the window by a batch when the sentinel scrolls into view.
  useEffect(() => {
    const el = ordersSentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting)
          setOrdersVisible((v) => v + ORDERS_BATCH);
      },
      { rootMargin: "320px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ordersVisible, listOrders.length, activeTab, orderView]);

  if (loading) {
    return <OrdersLoader />;
  }

  return (
    <div className={`my-orders-page mo-glass${darkMode ? " mo-dark" : ""}`}>
      {/* New-order chime (drop the audio file at /public/sounds/new-order.mp3) */}
      <audio
        ref={newOrderAudioRef}
        src="/sounds/new-order.mp3"
        preload="auto"
      />

      {/* Ambient gradient wash behind the glass surfaces */}
      <div className="mo-aurora" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className={`mo-shell${railCollapsed ? " is-collapsed" : ""}`}>
        {/* ===== Left navigation rail (desktop) ===== */}
        <aside className="mo-rail" aria-label="Dashboard sections">
          <Link href="/" className="mo-rail-brand" title="Back to store">
            <span className="mo-rail-logo">
              <ArrowLeft size={18} />
            </span>
            <span className="mo-rail-brand-text">
              <span className="mo-rail-title">Manage Orders</span>
              <span className="mo-rail-sub">TheBookX console</span>
            </span>
          </Link>

          <div className="mo-rail-scroll">
            <div className="mo-rail-label">Workspace</div>
            {SECTION_TABS.map((t) => {
              const Icon = t.Icon;
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  data-tip={t.label}
                  className={`mo-nav-item${isActive ? " active" : ""}`}
                  onClick={() => goToTab(t.key)}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive && (
                    <motion.span
                      layoutId="mo-nav-pill"
                      className="mo-nav-pill"
                      transition={PILL_SPRING}
                    />
                  )}
                  <Icon size={18} />
                  <span>{t.label}</span>
                  {t.key === "orders" && filteredOrders.length > 0 && (
                    <span className="mo-nav-count">
                      {filteredOrders.length > 99 ? "99+" : filteredOrders.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mo-rail-foot">
            <button
              type="button"
              className="mo-rail-collapse"
              onClick={toggleRail}
              aria-label={railCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={railCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {railCollapsed ? (
                <PanelLeft size={16} />
              ) : (
                <PanelLeftClose size={16} />
              )}
              <span>Collapse</span>
            </button>
          </div>
        </aside>

        {/* ===== Main column ===== */}
        <div className="mo-main">
          {/* Sticky glass topbar */}
          <header className="mo-topbar">
            <div className="mo-topbar-heading">
              <h1>
                {SECTION_TABS.find((t) => t.key === activeTab)?.label ||
                  "Manage Orders"}
              </h1>
              <span className="mo-topbar-sub">
                {filteredOrders.length}{" "}
                {filteredOrders.length === 1 ? "order" : "orders"} in view
              </span>
            </div>

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
                      <button
                        type="button"
                        className="mo-menu-item"
                        onClick={() => {
                          setShowIndiaPost(true);
                          setShowToolsMenu(false);
                        }}
                      >
                        <Truck size={16} /> India Post booking
                        {gettingShippedCount > 0 && (
                          <span className="mo-menu-count">
                            {gettingShippedCount}
                          </span>
                        )}
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Period/timeline nav + calendar, now inline in the glass topbar */}
          <div className="mo-tabs-right">
            {activeTab === "analytics" && analyticsPeriod !== "all" && (
              <div className="an-nav an-nav-inline">
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
          </div>
        </header>

        {/* Section content — re-enters whenever the active tab changes */}
        <motion.div
          key={activeTab}
          className="mo-section"
          initial={SECTION_MOTION.initial}
          animate={SECTION_MOTION.animate}
          transition={SECTION_MOTION.transition}
        >

        {/* ===== Analytics (accordion) ===== */}
        {/* ===== Analytics (curated dashboard) ===== */}
        {activeTab === "analytics" && (
          <div
            className="an2"
            onMouseMove={onChartMove}
            onMouseLeave={onChartLeave}
            onPointerDown={onChartTap}
          >
            {chartTip &&
              typeof document !== "undefined" &&
              createPortal(
                <div
                  className={`an2-tip${chartTip.below ? " below" : ""}${darkMode ? " mo-dark" : ""}`}
                  style={{ left: chartTip.x, top: chartTip.y }}
                >
                  {chartTip.text}
                </div>,
                document.body,
              )}

            {/* Overview stats — icon + content in one row, emoji glyphs. */}
            <div className="an2-stats">
              <div className="an2-stat s-orders">
                <div className="an2-stat-ic">🛍️</div>
                <div className="an2-stat-body">
                  <span className="an2-stat-val">{overview.n}</span>
                  <span className="an2-stat-lbl">Orders</span>
                  <span className="an2-stat-x">
                    {overview.delivered} delivered · {overview.cancelled}{" "}
                    cancelled
                  </span>
                </div>
              </div>
              <div className="an2-stat s-rev">
                <div className="an2-stat-ic">💰</div>
                <div className="an2-stat-body">
                  <span className="an2-stat-val">
                    ₹{overview.revenue.toLocaleString()}
                  </span>
                  <span className="an2-stat-lbl">Revenue</span>
                  <span className="an2-stat-x">
                    Avg order ₹{overview.aov.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="an2-stat s-cost">
                <div className="an2-stat-ic">🧾</div>
                <div className="an2-stat-body">
                  <span className="an2-stat-val">
                    ₹{overview.cost.toLocaleString()}
                  </span>
                  <span className="an2-stat-lbl">Total cost</span>
                  <span className="an2-stat-x">
                    incl. ₹{overview.delivery.toLocaleString()} delivery
                  </span>
                </div>
              </div>
              <div className="an2-stat s-profit">
                <div className="an2-stat-ic">
                  {overview.profit >= 0 ? "📈" : "📉"}
                </div>
                <div className="an2-stat-body">
                  <span className="an2-stat-val">
                    {overview.profit >= 0 ? "+" : "−"}₹
                    {Math.abs(overview.profit).toLocaleString()}
                  </span>
                  <span className="an2-stat-lbl">
                    {overview.profit >= 0 ? "Profit" : "Loss"} ·{" "}
                    {overview.margin}%
                  </span>
                  <span className="an2-stat-x">
                    Net {netProfit >= 0 ? "+" : "−"}₹
                    {Math.abs(netProfit).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="an2-stat s-units">
                <div className="an2-stat-ic">📚</div>
                <div className="an2-stat-body">
                  <span className="an2-stat-val">{overview.units}</span>
                  <span className="an2-stat-lbl">Books sold</span>
                  <span className="an2-stat-x">
                    across {overview.n} orders
                  </span>
                </div>
              </div>
              <div className="an2-stat s-wallet">
                <div className="an2-stat-ic">👛</div>
                <div className="an2-stat-body">
                  <span className="an2-stat-val">
                    ₹{walletUsers.total.toLocaleString()}
                  </span>
                  <span className="an2-stat-lbl">Wallet outstanding</span>
                  <span className="an2-stat-x">
                    {walletUsers.count} customer
                    {walletUsers.count === 1 ? "" : "s"} hold balance
                  </span>
                </div>
              </div>
            </div>

            {/* Projections & run rate */}
            <An2Section
              title="Projections & run rate"
              sub={
                projection.hasForecast
                  ? `Current pace projected to the full ${
                      analyticsPeriod === "week"
                        ? "week"
                        : analyticsPeriod === "year"
                          ? "year"
                          : "month"
                    }`
                  : "Observed sales pace for this period"
              }
              right={
                <span className="an2-card-total">
                  ₹{projection.revPerDay.toLocaleString()}/day
                </span>
              }
            >
              <div className="an2-proj-tiles">
                <div className="an2-proj-tile">
                  <span className="an2-proj-lbl">Run rate</span>
                  <strong className="an2-proj-val">
                    ₹{projection.revPerDay.toLocaleString()}
                    <small>/day</small>
                  </strong>
                  <span className="an2-proj-x">
                    {projection.ordPerDay} orders/day
                  </span>
                </div>
                <div className="an2-proj-tile">
                  <span className="an2-proj-lbl">So far</span>
                  <strong className="an2-proj-val">
                    ₹{projection.actualRev.toLocaleString()}
                  </strong>
                  <span className="an2-proj-x">
                    {overview.n} orders · day {projection.elapsedDays}/
                    {projection.totalDays}
                  </span>
                </div>
                <div className="an2-proj-tile hot">
                  <span className="an2-proj-lbl">
                    Projected{" "}
                    {analyticsPeriod === "week"
                      ? "week"
                      : analyticsPeriod === "year"
                        ? "year"
                        : analyticsPeriod === "month"
                          ? "month"
                          : "total"}
                  </span>
                  <strong className="an2-proj-val hot">
                    ₹{projection.projectedRev.toLocaleString()}
                  </strong>
                  <span className="an2-proj-x">
                    ~{projection.projectedOrders} orders
                    {projection.hasForecast
                      ? ` · ${projection.daysLeft} day${projection.daysLeft === 1 ? "" : "s"} left`
                      : " · final"}
                  </span>
                </div>
              </div>
              {projection.hasForecast && (
                <div className="an2-proj-prog">
                  <div className="an2-proj-prog-head">
                    <span>
                      Achieved {projection.progressPct}% of projection
                    </span>
                    <span>
                      ₹{projection.actualRev.toLocaleString()} / ₹
                      {projection.projectedRev.toLocaleString()}
                    </span>
                  </div>
                  <div className="an2-proj-bar">
                    <div
                      className="an2-proj-fill"
                      style={{ width: `${projection.progressPct}%` }}
                    />
                  </div>
                </div>
              )}
            </An2Section>

            {/* Orders by status — count, value & payment split */}
            <An2Section
              title="Orders by status"
              sub="Where every order stands — value & COD/UPI split"
              right={
                <span className="an2-card-total">{breakdownTotals.count}</span>
              }
            >
              <div className="an2-status-list">
                {statusBreakdown.length === 0 && (
                  <div className="an2-bp-empty">No orders in this period.</div>
                )}
                {statusBreakdown.map((s) => (
                  <div
                    className={`an2-status-row${/pending/i.test(s.key) ? " pending" : ""}`}
                    key={s.key}
                  >
                    <span
                      className="an2-status-dot"
                      style={{ background: s.color }}
                    />
                    <div className="an2-status-main">
                      <span className="an2-status-name">{s.key}</span>
                      <span className="an2-status-split">
                        {s.cod} COD · ₹{Math.round(s.codVal).toLocaleString()}
                        <span className="an2-status-sep">|</span>
                        {s.upi} UPI · ₹{Math.round(s.upiVal).toLocaleString()}
                      </span>
                    </div>
                    <div className="an2-status-nums">
                      <span className="an2-status-count">
                        {s.count} order{s.count === 1 ? "" : "s"}
                      </span>
                      <span className="an2-status-val">
                        ₹{Math.round(s.value).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </An2Section>

            {/* Total orders bar chart */}
            <An2Section
              title="Total orders"
              sub={
                analyticsPeriod === "year" || analyticsPeriod === "all"
                  ? "By month"
                  : analyticsPeriod === "week"
                    ? "By day of week"
                    : "By date"
              }
              right={<span className="an2-card-total">{overview.n}</span>}
            >
              {(() => {
                const max = Math.max(1, ...ordersBar.map((b) => b.count));
                return (
                  <div
                    className={`an2-bars${ordersBar.length > 16 ? " scroll" : ""}`}
                  >
                    {ordersBar.map((b, i) => (
                      <div
                        className={`an2-bar-col${b.isToday ? " today" : ""}`}
                        key={i}
                        ref={b.isToday ? centerTodayRef : undefined}
                      >
                        <span className="an2-bar-cap">{b.count || ""}</span>
                        <div className="an2-bar-track">
                          <div
                            className="an2-bar an2-bar-grad"
                            style={{ height: `${(b.count / max) * 100}%` }}
                            data-tip={`${b.label}${b.sub ? " " + b.sub : ""}: ${b.count} order${b.count === 1 ? "" : "s"}`}
                          />
                        </div>
                        <span className="an2-bar-x">{b.label}</span>
                        {b.sub ? (
                          <span className="an2-bar-xsub">{b.sub}</span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </An2Section>

            {/* Orders by weekday */}
            <An2Section
              title="Orders by weekday"
              sub={`Which days bring the most orders this ${analyticsPeriod}`}
            >
              {(() => {
                const max = Math.max(1, ...weekdayData.map((b) => b.count));
                const busiest = weekdayData.reduce(
                  (a, b) => (b.count > a.count ? b : a),
                  weekdayData[0],
                );
                return (
                  <div className="an2-bars">
                    {weekdayData.map((b, i) => (
                      <div className="an2-bar-col" key={i}>
                        <span className="an2-bar-cap">{b.count || ""}</span>
                        <div className="an2-bar-track">
                          <div
                            className={`an2-bar an2-bar-wd${b.label === busiest.label && busiest.count > 0 ? " peak" : ""}`}
                            style={{ height: `${(b.count / max) * 100}%` }}
                            data-tip={`${b.label}: ${b.count} order${b.count === 1 ? "" : "s"}`}
                          />
                        </div>
                        <span className="an2-bar-x">{b.label}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </An2Section>

            {/* Monthly run rate — one line per month, plotted by day-of-month */}
            <An2Section
              title={`Monthly run rate · ${monthlyRunRate.year}`}
              sub="Cumulative orders by day — one competing line per month"
            >
              {(() => {
                const { months, max, year } = monthlyRunRate;
                const W = 700;
                const H = 220;
                const padL = 6;
                const padR = 6;
                const padT = 12;
                const padB = 8;
                const iW = W - padL - padR;
                const iH = H - padT - padB;
                const xOf = (day) => padL + iW * ((day - 1) / 30);
                const yOf = (v) => padT + iH - (v / max) * iH;
                const linePath = (pts) =>
                  pts
                    .map(
                      (p, i) =>
                        `${i === 0 ? "M" : "L"}${xOf(p.day)},${yOf(p.value)}`,
                    )
                    .join(" ");
                const cur = months.find((m) => m.isCurrent);
                let blink = null;
                if (cur && cur.pts.length) {
                  const last = cur.pts[cur.pts.length - 1];
                  blink = {
                    leftPct: (xOf(last.day) / W) * 100,
                    topPct: (yOf(last.value) / H) * 100,
                    color: cur.color,
                  };
                }
                const hoverDay = mrrTip?.day;
                const hoverRows = hoverDay
                  ? months
                      .map((m) => {
                        const p = m.pts.find((pt) => pt.day === hoverDay);
                        return p
                          ? { label: m.label, color: m.color, value: p.value }
                          : null;
                      })
                      .filter(Boolean)
                      .sort((a, b) => b.value - a.value)
                  : [];
                if (!months.length)
                  return (
                    <p className="an2-bp-empty">No orders yet this year.</p>
                  );
                return (
                  <>
                    <div
                      className="an2-mrr"
                      ref={mrrRef}
                      onMouseMove={onMrrMove}
                      onMouseLeave={onMrrLeave}
                    >
                      <svg
                        className="an2-mrr-svg"
                        viewBox={`0 0 ${W} ${H}`}
                        preserveAspectRatio="none"
                        role="img"
                        aria-label="Monthly run-rate lines"
                      >
                        {hoverDay && (
                          <line
                            x1={xOf(hoverDay)}
                            y1={padT}
                            x2={xOf(hoverDay)}
                            y2={padT + iH}
                            stroke="var(--dark-20, #cbd5e1)"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                            vectorEffect="non-scaling-stroke"
                          />
                        )}
                        {months.map((m) => (
                          <path
                            key={m.month}
                            d={linePath(m.pts)}
                            fill="none"
                            stroke={m.color}
                            strokeWidth="2"
                            vectorEffect="non-scaling-stroke"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            opacity={
                              hoverDay
                                ? m.pts.some((p) => p.day === hoverDay)
                                  ? 1
                                  : 0.25
                                : 0.9
                            }
                          />
                        ))}
                      </svg>

                      {blink && (
                        <span
                          className="an2-mrr-blink"
                          style={{
                            left: `${blink.leftPct}%`,
                            top: `${blink.topPct}%`,
                            "--bc": blink.color,
                          }}
                          title="Today"
                        />
                      )}

                      {hoverDay && hoverRows.length > 0 && (
                        <div className="an2-mrr-tip" style={{ left: mrrTip.x }}>
                          <div className="an2-mrr-tip-day">
                            Day {hoverDay} · {year}
                          </div>
                          {hoverRows.map((r) => (
                            <div className="an2-mrr-tip-row" key={r.label}>
                              <i
                                className="an2-mrr-tip-dot"
                                style={{ background: r.color }}
                              />
                              <span className="an2-mrr-tip-m">{r.label}</span>
                              <span className="an2-mrr-tip-v">{r.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="an2-mrr-x">
                      {[1, 5, 10, 15, 20, 25, 31].map((d) => (
                        <span key={d}>{d}</span>
                      ))}
                    </div>

                    <div className="an2-mrr-legend">
                      {months.map((m) => (
                        <span className="an2-mrr-leg" key={m.month}>
                          <i style={{ background: m.color }} />
                          {m.label}
                          <b>{m.total}</b>
                          {m.isCurrent && (
                            <span className="an2-mrr-leg-live">live</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </>
                );
              })()}
            </An2Section>

            {/* Profit / cost per day */}
            <An2Section
              title="Profit & cost by day"
              sub={`Cost vs profit for each day${analyticsPeriod === "year" ? " of the chosen month" : ""}`}
              right={
                <div className="an2-pnl-right">
                  <div className="an2-legend">
                    <span className="an2-leg">
                      <i className="an2-dot d-cost" /> Cost
                    </span>
                    <span className="an2-leg">
                      <i className="an2-dot d-profit" /> Profit
                    </span>
                    <span className="an2-leg">
                      <i className="an2-dot d-loss" /> Loss
                    </span>
                  </div>
                  {analyticsPeriod === "year" && (
                    <div
                      className="admin-select-wrap an2-month-sel"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        className="admin-select"
                        value={pnlMonth}
                        onChange={(e) => setPnlMonth(Number(e.target.value))}
                      >
                        {MONTH_LABELS.map((m, i) => (
                          <option key={i} value={i}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              }
            >
              {(() => {
                const posMax = Math.max(
                  1,
                  ...pnlDays.map((d) =>
                    Math.max(d.cost, d.profit > 0 ? d.profit : 0),
                  ),
                );
                const negMax = Math.max(
                  1,
                  ...pnlDays.map((d) => (d.profit < 0 ? -d.profit : 0)),
                );
                const hasLoss = pnlDays.some((d) => d.profit < 0);
                return (
                  <div
                    className={`an2-pnl${pnlDays.length > 14 ? " scroll" : ""}`}
                  >
                    {pnlDays.map((d) => (
                      <div
                        className={`an2-pnl-col${d.isToday ? " today" : ""}`}
                        key={d.key}
                        ref={d.isToday ? centerTodayRef : undefined}
                      >
                        <div className="an2-pnl-pos">
                          <div
                            className="an2-pnl-bar b-cost"
                            style={{ height: `${(d.cost / posMax) * 100}%` }}
                            data-tip={`${d.wd} ${d.day} · Cost ₹${Math.round(d.cost).toLocaleString()}`}
                          />
                          <div
                            className="an2-pnl-bar b-profit"
                            style={{
                              height: `${((d.profit > 0 ? d.profit : 0) / posMax) * 100}%`,
                            }}
                            data-tip={`${d.wd} ${d.day} · Profit ₹${Math.round(d.profit).toLocaleString()}`}
                          />
                        </div>
                        {hasLoss && (
                          <div className="an2-pnl-neg">
                            <div
                              className="an2-pnl-bar b-loss"
                              style={{
                                height: `${((d.profit < 0 ? -d.profit : 0) / negMax) * 100}%`,
                              }}
                              data-tip={`${d.wd} ${d.day} · Loss ₹${Math.round(-d.profit).toLocaleString()}`}
                            />
                          </div>
                        )}
                        <span className="an2-pnl-x">{d.day}</span>
                        <span className="an2-pnl-xsub">{d.wd}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </An2Section>

            {/* Delivery & India Post weight slabs */}
            <An2Section
              title="Delivery & India Post"
              sub="Postage by weight slab for this period"
              right={
                <span className="an2-card-total">
                  ₹{totalDeliveryCost.toLocaleString()}
                </span>
              }
            >
              <div className="an2-bp-sum">
                <div className="an2-bp-sc">
                  <span className="an2-bp-sc-l">Total weight</span>
                  <strong className="an2-bp-sc-v">
                    {(totalWeight / 1000).toFixed(2)} kg
                  </strong>
                </div>
                <div className="an2-bp-sc">
                  <span className="an2-bp-sc-l">Postage cost</span>
                  <strong className="an2-bp-sc-v v-cost">
                    ₹{totalDeliveryCost.toLocaleString()}
                  </strong>
                </div>
                <div className="an2-bp-sc">
                  <span className="an2-bp-sc-l">Avg / order</span>
                  <strong className="an2-bp-sc-v">
                    ₹{avgDeliveryCost.toLocaleString()}
                  </strong>
                </div>
                <div className="an2-bp-sc">
                  <span className="an2-bp-sc-l">Orders</span>
                  <strong className="an2-bp-sc-v">{overview.n}</strong>
                </div>
              </div>
              <div className="an2-slabs">
                {deliverySlabs.map((s) => (
                  <div className="an2-slab" key={s.label}>
                    <span className="an2-slab-l">
                      {s.label} · ₹{s.rate}
                    </span>
                    <div className="an2-slab-track">
                      <div
                        className="an2-slab-fill"
                        style={{ width: `${(s.count / maxSlabCount) * 100}%` }}
                        data-tip={`${s.label} @ ₹${s.rate}: ${s.count} order${s.count === 1 ? "" : "s"} · ₹${s.amount.toLocaleString()}`}
                      />
                    </div>
                    <span className="an2-slab-c">
                      {s.count} order{s.count === 1 ? "" : "s"} · ₹
                      {s.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </An2Section>

            {/* Orders by time of day (6-hour quadrants) */}
            <An2Section
              title="Orders by time of day"
              sub="When customers place orders (6-hour blocks)"
            >
              {(() => {
                const max = Math.max(1, ...quadrantData.map((q) => q.count));
                return (
                  <div className="an2-quads">
                    {quadrantData.map((q, i) => (
                      <div className="an2-quad" key={i}>
                        <div className="an2-quad-track">
                          <div
                            className="an2-quad-bar"
                            style={{ height: `${(q.count / max) * 100}%` }}
                            data-tip={`${q.label} · ${q.tag}: ${q.count} order${q.count === 1 ? "" : "s"}`}
                          >
                            <span className="an2-quad-num">{q.count}</span>
                          </div>
                        </div>
                        <span className="an2-quad-lbl">{q.label}</span>
                        <span className="an2-quad-tag">{q.tag}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </An2Section>

            {/* Book profitability */}
            <An2Section
              title="Book profitability"
              sub={`Per-title quantity, cost and profit for this ${analyticsPeriod}`}
              right={
                <span className="an2-card-total">{bookStats.rows.length}</span>
              }
            >
              <div className="an2-bp-sum">
                <div className="an2-bp-sc">
                  <span className="an2-bp-sc-l">Books sold</span>
                  <strong className="an2-bp-sc-v">
                    {bookStats.totals.qty}
                  </strong>
                </div>
                <div className="an2-bp-sc">
                  <span className="an2-bp-sc-l">Revenue</span>
                  <strong className="an2-bp-sc-v v-rev">
                    ₹{bookStats.totals.revenue.toLocaleString()}
                  </strong>
                </div>
                <div className="an2-bp-sc">
                  <span className="an2-bp-sc-l">Goods cost</span>
                  <strong className="an2-bp-sc-v v-cost">
                    ₹{bookStats.totals.cost.toLocaleString()}
                  </strong>
                </div>
                <div className="an2-bp-sc">
                  <span className="an2-bp-sc-l">Net profit</span>
                  <strong
                    className={`an2-bp-sc-v ${bookStats.totals.profit >= 0 ? "v-pos" : "v-neg"}`}
                  >
                    {bookStats.totals.profit >= 0 ? "+" : "−"}₹
                    {Math.abs(bookStats.totals.profit).toLocaleString()}
                  </strong>
                </div>
              </div>
              <div className="an2-bp-scroll">
                <table className="an2-bp-table">
                  <thead>
                    <tr>
                      <th>Book</th>
                      <th className="ta-r">Qty</th>
                      <th className="ta-r">Revenue</th>
                      <th className="ta-r">Cost</th>
                      <th className="ta-r">Profit / loss</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookStats.rows.length === 0 && (
                      <tr>
                        <td colSpan={5} className="an2-bp-empty">
                          No book sales in this period.
                        </td>
                      </tr>
                    )}
                    {bookStats.rows.map((r) => (
                      <tr key={r.name}>
                        <td>
                          <span className="an2-bp-name">{r.name}</span>
                          {!r.matched && (
                            <span
                              className="an2-bp-warn"
                              title="No catalogue cost — profit assumes ₹0 cost"
                            >
                              cost?
                            </span>
                          )}
                        </td>
                        <td className="ta-r">{r.qty}</td>
                        <td className="ta-r">
                          ₹{Math.round(r.revenue).toLocaleString()}
                        </td>
                        <td className="ta-r">
                          ₹{Math.round(r.cost).toLocaleString()}
                        </td>
                        <td
                          className={`ta-r an2-bp-p ${r.profit >= 0 ? "v-pos" : "v-neg"}`}
                        >
                          {r.profit >= 0 ? "+" : "−"}₹
                          {Math.abs(Math.round(r.profit)).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </An2Section>

            {/* Payment mix + customers */}
            <div className="an2-grid2">
              <An2Section title="Payment mix" sub="COD vs online (UPI)">
                {(() => {
                  const tot = overview.codN + overview.upiN || 1;
                  const codPct = Math.round((overview.codN / tot) * 100);
                  return (
                    <>
                      <div className="an2-mix-bar">
                        <div
                          className="an2-mix-seg seg-cod"
                          style={{ width: `${codPct}%` }}
                        />
                        <div
                          className="an2-mix-seg seg-upi"
                          style={{ width: `${100 - codPct}%` }}
                        />
                      </div>
                      <div className="an2-mix-legend">
                        <span className="an2-leg">
                          <i className="an2-dot d-cod" /> COD · {overview.codN}{" "}
                          ({codPct}%)
                        </span>
                        <span className="an2-leg">
                          <i className="an2-dot d-upi" /> UPI · {overview.upiN}{" "}
                          ({100 - codPct}%)
                        </span>
                      </div>
                    </>
                  );
                })()}
              </An2Section>

              <An2Section
                title="Customers"
                sub={`Reach & loyalty this ${analyticsPeriod}`}
              >
                <div className="an2-cust">
                  <div className="an2-cust-item">
                    <span className="an2-cust-num">
                      {insights.uniqueCustomers}
                    </span>
                    <span className="an2-cust-lbl">Unique customers</span>
                  </div>
                  <div className="an2-cust-item">
                    <span className="an2-cust-num">{insights.repeat}</span>
                    <span className="an2-cust-lbl">Repeat buyers</span>
                  </div>
                  <div className="an2-cust-item">
                    <span className="an2-cust-num">{insights.repeatPct}%</span>
                    <span className="an2-cust-lbl">Repeat rate</span>
                  </div>
                </div>
              </An2Section>
            </div>

            {/* Top books + revenue by category */}
            <div className="an2-grid2">
              <An2Section title="Top-selling books" sub="By units sold">
                <HBars
                  items={insights.topBooks.map((b) => ({
                    label: b.name,
                    value: b.units,
                    display: `${b.units}`,
                  }))}
                />
              </An2Section>

              <An2Section
                title="Revenue by category"
                sub="Where the money comes from"
              >
                <HBars
                  items={insights.topCats.map((c) => ({
                    label: c.c,
                    value: c.rev,
                    display: `₹${Math.round(c.rev).toLocaleString()}`,
                  }))}
                  accent="#7c3aed"
                />
              </An2Section>
            </div>

            <An2Section
              title="Top delivery pincodes"
              sub="Where your orders ship to most"
            >
              <HBars
                items={insights.topPins.map((p) => ({
                  label: p.p,
                  value: p.c,
                  display: `${p.c}`,
                }))}
                accent="#0ea5e9"
              />
            </An2Section>
          </div>
        )}

        {/* Search + Filter row — inside the Orders tab only */}
        {activeTab === "orders" && (
          <div className="admin-search">
            {(() => {
              const chips = [];
              const statusSel = Array.isArray(statusFilter)
                ? statusFilter
                : [statusFilter];
              const statusLabel = (v) =>
                v === "all"
                  ? "All"
                  : v === "active"
                    ? "Active"
                    : v === "intransit-notrack"
                      ? "In Transit · no tracking"
                      : v === "confirmed"
                        ? "Confirmed only"
                        : v === "unconfirmed"
                          ? "Unconfirmed only"
                          : v;
              // A chip per selected status, unless it's just the default "active".
              if (!(statusSel.length === 1 && statusSel[0] === "active")) {
                statusSel.forEach((v) =>
                  chips.push({
                    key: `status-${v}`,
                    label: `Status: ${statusLabel(v)}`,
                    clear: () => toggleStatusFilter(v),
                  }),
                );
              }
              if (paymentFilter !== "all")
                chips.push({
                  key: "pay",
                  label: `Payment: ${paymentFilter}`,
                  clear: () => setPaymentFilter("all"),
                });
              if (dateFrom)
                chips.push({
                  key: "from",
                  label: `From: ${dateFrom}`,
                  clear: () => setDateFrom(""),
                });
              if (dateTo)
                chips.push({
                  key: "to",
                  label: `To: ${dateTo}`,
                  clear: () => setDateTo(""),
                });
              if (selectedDate)
                chips.push({
                  key: "date",
                  label: `Date: ${selectedDate}`,
                  clear: () => setSelectedDate(""),
                });
              const clearAll = () => {
                setStatusFilter(["active"]);
                setPaymentFilter("all");
                setDateFrom("");
                setDateTo("");
                setSelectedDate("");
              };
              // Compact stats for the currently-filtered orders (real orders
              // only — rows with an Order ID).
              const realOrders = filteredOrders.filter((o) => o["Order ID"]);
              const fRevenue = realOrders.reduce(
                (s, o) => s + (Number(o.revenue) || 0),
                0,
              );
              const fCod = realOrders.filter((o) =>
                /cod|cash/i.test(o["Payment Type"] || ""),
              ).length;
              const fUpi = realOrders.length - fCod;
              const fBooks = realOrders.reduce(
                (s, o) =>
                  s +
                  (o.parsedBooks || []).reduce(
                    (a, b) => a + (Number(b.quantity) || 1),
                    0,
                  ),
                0,
              );
              return (
                <>
                  <div className="admin-search-bar">
                    <div className="admin-search-input">
                      <Search size={16} />
                      <input
                        type="text"
                        placeholder="Search by name, order ID, phone, or shipping ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          className="admin-search-x"
                          onClick={() => setSearchQuery("")}
                          aria-label="Clear search"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      className={`admin-filter-btn${showFilters ? " open" : ""}`}
                      onClick={() => setShowFilters(!showFilters)}
                      aria-expanded={showFilters}
                    >
                      <Filter size={16} />
                      Filters
                      {chips.length > 0 && (
                        <span className="admin-filter-count">
                          {chips.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {chips.length > 0 && (
                    <div className="admin-chips-row">
                      <div className="admin-chips-scroll">
                        {chips.map((c) => (
                          <span className="admin-chip" key={c.key}>
                            {c.label}
                            <button
                              type="button"
                              onClick={c.clear}
                              aria-label={`Remove ${c.label}`}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="admin-chips-clear"
                        onClick={clearAll}
                      >
                        Clear all
                      </button>
                    </div>
                  )}

                  {/* Compact stats for the filtered orders */}
                  {realOrders.length > 0 && (
                    <details className="admin-stats">
                      <summary className="admin-stats-summary">
                        <BarChart3 size={14} />
                        Stats · {realOrders.length} order
                        {realOrders.length === 1 ? "" : "s"}
                        <ChevronDown size={15} className="admin-stats-caret" />
                      </summary>
                      <div className="admin-stats-grid">
                        <div className="admin-stat s-orders">
                          <div className="admin-stat-ic">
                            <ShoppingBag size={16} />
                          </div>
                          <span className="admin-stat-val">
                            {realOrders.length}
                          </span>
                          <span className="admin-stat-lbl">Orders</span>
                          <span className="admin-stat-x">in this filter</span>
                        </div>
                        <div className="admin-stat s-rev">
                          <div className="admin-stat-ic">
                            <IndianRupee size={16} />
                          </div>
                          <span className="admin-stat-val">
                            ₹{fRevenue.toLocaleString()}
                          </span>
                          <span className="admin-stat-lbl">Revenue</span>
                          <span className="admin-stat-x">
                            Avg ₹
                            {realOrders.length
                              ? Math.round(
                                  fRevenue / realOrders.length,
                                ).toLocaleString()
                              : 0}
                          </span>
                        </div>
                        <div className="admin-stat s-units">
                          <div className="admin-stat-ic">
                            <BarChart3 size={16} />
                          </div>
                          <span className="admin-stat-val">{fBooks}</span>
                          <span className="admin-stat-lbl">Books sold</span>
                          <span className="admin-stat-x">
                            across {realOrders.length} orders
                          </span>
                        </div>
                        <div className="admin-stat s-wallet">
                          <div className="admin-stat-ic">
                            <Wallet size={16} />
                          </div>
                          <span className="admin-stat-val">
                            {fCod} / {fUpi}
                          </span>
                          <span className="admin-stat-lbl">COD / UPI</span>
                          <span className="admin-stat-x">payment split</span>
                        </div>
                      </div>
                    </details>
                  )}

                  {/* Filter dropdown panel — absolute overlay */}
                  <AnimatePresence>
                    {showFilters && (
                      <>
                        <div
                          className="admin-filter-backdrop"
                          onClick={() => setShowFilters(false)}
                        />
                        <motion.div
                          className="admin-filter-panel"
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                        >
                          <div className="admin-filter-head">
                          <span className="admin-filter-title">
                            <SlidersHorizontal size={15} /> Filters
                          </span>
                          <button
                            type="button"
                            className="admin-filter-x"
                            onClick={() => setShowFilters(false)}
                            aria-label="Close filters"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="admin-filter-grid">
                          <div className="admin-field">
                            <label className="admin-field-label">
                              Analytics period
                            </label>
                            <div className="admin-select-wrap">
                              <select
                                className="admin-select"
                                value={analyticsPeriod}
                                onChange={(e) => selectPeriod(e.target.value)}
                              >
                                <option value="day">Day</option>
                                <option value="week">Week</option>
                                <option value="month">Month</option>
                                <option value="year">Year</option>
                                <option value="all">All time</option>
                              </select>
                            </div>
                          </div>
                          <div className="admin-field">
                            <label className="admin-field-label">
                              Order Status
                            </label>
                            <div className="admin-status-multi">
                              {[
                                {
                                  value: "active",
                                  label:
                                    "Active (Pending + Processing + Getting Shipped)",
                                },
                                { value: "all", label: "All Statuses" },
                                ...distinctStatuses.map((s) => ({
                                  value: s,
                                  label: s,
                                })),
                                {
                                  value: "intransit-notrack",
                                  label: "In Transit — without tracking ID",
                                },
                                {
                                  value: "confirmed",
                                  label: "Confirmed only",
                                },
                                {
                                  value: "unconfirmed",
                                  label: "Unconfirmed only",
                                },
                              ].map((opt) => {
                                const sel = Array.isArray(statusFilter)
                                  ? statusFilter
                                  : [statusFilter];
                                const checked = sel.includes(opt.value);
                                return (
                                  <label
                                    key={opt.value}
                                    className={`admin-status-opt${checked ? " checked" : ""}`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() =>
                                        toggleStatusFilter(opt.value)
                                      }
                                    />
                                    <span>{opt.label}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                          <div className="admin-field">
                            <label className="admin-field-label">
                              Payment Type
                            </label>
                            <div className="admin-select-wrap">
                              <select
                                className="admin-select"
                                value={paymentFilter}
                                onChange={(e) =>
                                  setPaymentFilter(e.target.value)
                                }
                              >
                                <option value="all">All Payments</option>
                                {distinctPayments.map((p) => (
                                  <option key={p} value={p}>
                                    {p}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="admin-field">
                            <label className="admin-field-label">
                              From date
                            </label>
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

                        <div className="admin-filter-foot">
                          <button
                            type="button"
                            className="admin-filter-reset"
                            disabled={chips.length === 0}
                            onClick={clearAll}
                          >
                            <X size={14} /> Reset
                          </button>
                          <button
                            type="button"
                            className="admin-filter-done"
                            onClick={() => setShowFilters(false)}
                          >
                            Done
                          </button>
                        </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </>
              );
            })()}
          </div>
        )}

        {/* ===== Users (customer management) ===== */}
        {activeTab === "users" && (
          <div className="an2 um">
            <div className="an2-stats">
              <div className="an2-stat s-orders">
                <div className="an2-stat-ic">
                  <User size={16} />
                </div>
                <span className="an2-stat-val">{userSummary.total}</span>
                <span className="an2-stat-lbl">Total customers</span>
              </div>
              <div className="an2-stat s-profit">
                <div className="an2-stat-ic">
                  <TrendingUp size={16} />
                </div>
                <span className="an2-stat-val">{userSummary.repeatCount}</span>
                <span className="an2-stat-lbl">
                  Repeat buyers · {userSummary.repeatPct}%
                </span>
              </div>
              <div className="an2-stat s-aov">
                <div className="an2-stat-ic">
                  <IndianRupee size={16} />
                </div>
                <span className="an2-stat-val">
                  ₹{userSummary.repeatAvg.toLocaleString()}
                </span>
                <span className="an2-stat-lbl">Avg order · repeat</span>
              </div>
              <div className="an2-stat s-units">
                <div className="an2-stat-ic">
                  <IndianRupee size={16} />
                </div>
                <span className="an2-stat-val">
                  ₹{userSummary.overallAvg.toLocaleString()}
                </span>
                <span className="an2-stat-lbl">Avg order · all</span>
              </div>
              <div className="an2-stat s-rev">
                <div className="an2-stat-ic">
                  <Wallet size={16} />
                </div>
                <span className="an2-stat-val">
                  ₹{userSummary.walletTotal.toLocaleString()}
                </span>
                <span className="an2-stat-lbl">
                  Wallet liability · {userSummary.walletHolders} holder
                  {userSummary.walletHolders === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <section className="an2-card um-section">
              <div className="an2-card-head">
                <div>
                  <h3 className="an2-card-title">All customers</h3>
                  <p className="an2-card-sub">
                    Search, filter by wallet balance & sort
                  </p>
                </div>
                <span className="an2-card-total">{filteredUsers.length}</span>
              </div>

              {/* Users toolbar — own search + wallet filters + sort */}
              <div className="um-toolbar">
                <div className="um-search">
                  <Search size={15} />
                  <input
                    type="text"
                    placeholder="Search name or phone…"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  {userSearch && (
                    <button
                      type="button"
                      className="um-search-x"
                      onClick={() => setUserSearch("")}
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <select
                  className="um-hold-filter"
                  value={walletMinFilter}
                  onChange={(e) => setWalletMinFilter(Number(e.target.value))}
                  title="Show only customers whose wallet balance is above this"
                >
                  <option value={0}>Balance: any</option>
                  <option value={1}>Balance above ₹0</option>
                  <option value={10}>Balance above ₹10</option>
                  <option value={25}>Balance above ₹25</option>
                  <option value={50}>Balance above ₹50</option>
                  <option value={100}>Balance above ₹100</option>
                  <option value={200}>Balance above ₹200</option>
                </select>
                <select
                  className="um-hold-filter"
                  value={walletHoldFilter}
                  onChange={(e) => setWalletHoldFilter(Number(e.target.value))}
                  title="Filter by how long the wallet balance has been held"
                >
                  <option value={0}>Holding: all</option>
                  <option value={7}>Holding ≥ 7 days</option>
                  <option value={15}>Holding ≥ 15 days</option>
                  <option value={30}>Holding ≥ 30 days</option>
                  <option value={45}>Holding ≥ 45 days</option>
                </select>
                <select
                  className="um-hold-filter"
                  value={userSort}
                  onChange={(e) => setUserSort(e.target.value)}
                  title="Sort customers"
                >
                  <option value="recent">Sort: Recent</option>
                  <option value="walletDesc">Wallet: High Low</option>
                  <option value="walletAsc">Wallet: Low High</option>
                </select>
              </div>
              <div className="um-list">
                {filteredUsers.length === 0 && (
                  <div className="an2-bp-empty">No customers found.</div>
                )}
                {filteredUsers.slice(0, userVisible).map((u) => (
                  <div className="um-row" key={u.phone}>
                    <div className="um-main">
                      <div className="um-name-row">
                        <span className="um-name">{u.name || "Unknown"}</span>
                        {u.repeat && (
                          <span className="um-badge repeat">Repeat</span>
                        )}
                        {u.wallet > 0 && (
                          <span className="um-badge wallet">
                            ₹{u.wallet.toLocaleString()} wallet
                          </span>
                        )}
                        {u.wallet > 0 && u.holdingDays != null && (
                          <span
                            className={`um-badge hold${u.holdingDays >= 45 ? " urgent" : ""}`}
                          >
                            holding {u.holdingDays}d
                          </span>
                        )}
                      </div>
                      <div className="um-meta">
                        <span>+91 {u.phone}</span>
                        {u.city ? <span>· {u.city}</span> : null}
                        {u.lastDate ? (
                          <span>
                            · last{" "}
                            {u.lastDate.toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="um-stats">
                      <div className="um-stat">
                        <strong>{u.orders}</strong>
                        <span>orders</span>
                      </div>
                      <div className="um-stat">
                        <strong>₹{u.spent.toLocaleString()}</strong>
                        <span>spent</span>
                      </div>
                      <div className="um-stat">
                        <strong>₹{u.avg.toLocaleString()}</strong>
                        <span>avg</span>
                      </div>
                    </div>
                    <div className="um-actions">
                      <button
                        type="button"
                        className="um-kebab"
                        aria-label="Actions"
                        onClick={() =>
                          setOpenUserMenu((p) =>
                            p === u.phone ? null : u.phone,
                          )
                        }
                      >
                        <MoreVertical size={18} />
                      </button>
                      {openUserMenu === u.phone && (
                        <>
                          <div
                            className="um-menu-backdrop"
                            onClick={() => setOpenUserMenu(null)}
                          />
                          <div className="um-menu" role="menu">
                            <button
                              type="button"
                              className="um-menu-item"
                              onClick={() => {
                                setWalletModal(u);
                                setOpenUserMenu(null);
                              }}
                            >
                              <Wallet size={15} /> Adjust wallet
                            </button>
                            {u.wallet > 0 && (
                              <button
                                type="button"
                                className="um-menu-item"
                                onClick={() => {
                                  openWhatsApp(
                                    u.phone,
                                    `Hi${u.name ? " " + u.name.split(" ")[0] : ""}! You have ₹${u.wallet} waiting in your TheBookX wallet. Use it on your next order before it expires — view your balance & orders here: ${PROFILE_URL}`,
                                  );
                                  setOpenUserMenu(null);
                                }}
                              >
                                <FaWhatsapp size={15} /> WhatsApp reminder
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {filteredUsers.length > userVisible && (
                  <button
                    type="button"
                    className="um-loadmore"
                    onClick={() => setUserVisible((n) => n + 20)}
                  >
                    Load more ({filteredUsers.length - userVisible} left)
                  </button>
                )}
              </div>
            </section>

            {walletModal && (
              <WalletModal
                user={walletModal}
                busy={walletBusy}
                onClose={() => setWalletModal(null)}
                onApply={applyWalletChange}
              />
            )}
          </div>
        )}

        {/* ===== Track orders ===== */}
        {activeTab === "track" && (
          <div className="mo-track-notify mo-track-plain">
            <div className="mo-track-paste">
              <textarea
                className="admin-input mo-track-textarea"
                rows={5}
                placeholder={
                  "Paste tracking IDs, the SMS text, or India Post booking rows (with receiver names to auto-link new numbers)…\ne.g. CX042819326IN EY484883105IN CM149478023IN"
                }
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value)}
              />
              <div className="mo-track-paste-actions">
                <span className="mo-track-hint">
                  {extractArticleNumbers(trackInput).length} ID
                  {extractArticleNumbers(trackInput).length === 1
                    ? ""
                    : "s"}{" "}
                  detected
                </span>
                <button
                  type="button"
                  className="mo-track-add"
                  disabled={extractArticleNumbers(trackInput).length === 0}
                  onClick={addTrackingBatch}
                >
                  <Search size={15} /> Match orders
                </button>
              </div>
            </div>
            {trackError && <div className="mo-track-error">{trackError}</div>}
            {trackSummary && (
              <div className="mo-track-summary">
                <span className="mo-track-chip ok">
                  <Check size={13} /> {trackSummary.added} added
                </span>
                {trackSummary.attached > 0 && (
                  <span className="mo-track-chip ok">
                    <Check size={13} /> {trackSummary.attached} linked &amp;
                    saved
                  </span>
                )}
                {trackSummary.dup > 0 && (
                  <span className="mo-track-chip dup">
                    {trackSummary.dup} already listed
                  </span>
                )}
                {trackSummary.failed > 0 && (
                  <span className="mo-track-chip fail">
                    <AlertCircle size={13} /> {trackSummary.failed} not matched
                  </span>
                )}
              </div>
            )}
            {trackFailed.length > 0 && (
              <div className="mo-track-failed">
                <span className="mo-track-failed-title">
                  No order found for these IDs:
                </span>
                <div className="mo-track-failed-ids">
                  {trackFailed.map((id) => (
                    <span key={id} className="mo-track-failed-id">
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {trackList.length > 0 &&
              (() => {
                const groups = (() => {
                  const g = {};
                  trackList.forEach((r) => {
                    const k = r.dateLabel || "Undated";
                    if (!g[k])
                      g[k] = { label: k, dateT: r.dateT || 0, rows: [] };
                    g[k].rows.push(r);
                  });
                  return Object.values(g).sort((a, b) => b.dateT - a.dateT);
                })();
                return (
                  <div className="mo-track-groups">
                    <div className="mo-track-selrow">
                      <button
                        type="button"
                        className={`mo-view-btn mo-select-btn${trackSelectMode ? " active" : ""}`}
                        onClick={() =>
                          setTrackSelectMode((v) => {
                            if (v) setTrackSel([]);
                            return !v;
                          })
                        }
                      >
                        <CheckSquare size={15} />
                        <span className="mo-select-btn-lbl">
                          {trackSelectMode ? "Done" : "Select"}
                        </span>
                      </button>
                      {trackSelectMode && (
                        <button
                          type="button"
                          className="mo-track-selall"
                          onClick={() =>
                            setTrackSel(
                              trackList.map((r) => String(r["Shipping ID"])),
                            )
                          }
                        >
                          Select all ({trackList.length})
                        </button>
                      )}
                    </div>

                    {trackSelectMode && (
                      <div className="mo-cardbulk-bar mo-track-bulkbar">
                        <div className="mo-cardbulk-left">
                          <CheckSquare size={16} />
                          <span className="mo-cardbulk-count">
                            {trackSel.length} selected
                          </span>
                          {trackSel.length > 0 && (
                            <button
                              type="button"
                              className="mo-cardbulk-clear"
                              onClick={() => setTrackSel([])}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <div className="mo-cardbulk-right">
                          <span className="mo-cardbulk-lbl">Set status</span>
                          <select
                            className="mo-tp-status-select"
                            value={trackBulkStat}
                            onChange={(e) => setTrackBulkStat(e.target.value)}
                          >
                            {TRACK_STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="mo-cardbulk-apply"
                            disabled={trackSel.length === 0 || trackBulkBusy}
                            onClick={applyTrackBulkStatus}
                          >
                            {trackBulkBusy
                              ? "Applying…"
                              : `Apply to ${trackSel.length || ""}`}
                          </button>
                        </div>
                      </div>
                    )}

                    {groups.map((grp) => {
                      const open = trackDateOpen[grp.label] !== false;
                      return (
                        <div className="mo-track-group" key={grp.label}>
                          <button
                            type="button"
                            className="mo-track-group-head"
                            onClick={() =>
                              setTrackDateOpen((p) => ({
                                ...p,
                                [grp.label]: !open,
                              }))
                            }
                          >
                            <span className="mo-track-group-date">
                              <Calendar size={14} /> {grp.label}
                            </span>
                            <span className="mo-track-group-count">
                              {grp.rows.length}
                            </span>
                            <ChevronDown
                              size={16}
                              className={`mo-track-caret${open ? " open" : ""}`}
                            />
                          </button>
                          {open && (
                            <div className="mo-track-cards">
                              {grp.rows.map((r) => {
                                const key = String(r["Shipping ID"]);
                                const stage = trackPicks[key] || "ofd";
                                const tSel = trackSel.some(
                                  (k) => sidUp(k) === sidUp(key),
                                );
                                return (
                                  <div
                                    className={`mo-track-card${tSel ? " selected" : ""}`}
                                    key={key}
                                  >
                                    <div className="mo-track-card-top">
                                      {trackSelectMode && (
                                        <button
                                          type="button"
                                          className={`mo-track-check${tSel ? " on" : ""}`}
                                          onClick={() =>
                                            setTrackSel((prev) =>
                                              prev.some(
                                                (k) => sidUp(k) === sidUp(key),
                                              )
                                                ? prev.filter(
                                                    (k) =>
                                                      sidUp(k) !== sidUp(key),
                                                  )
                                                : [...prev, key],
                                            )
                                          }
                                          aria-pressed={tSel}
                                          title={tSel ? "Deselect" : "Select"}
                                        >
                                          {tSel && <Check size={13} />}
                                        </button>
                                      )}
                                      <div className="mo-track-card-who">
                                        <span className="mo-track-card-name">
                                          {r["Customer Name"] || "Unknown"}
                                          {(() => {
                                            const isCOD = /cash|cod/i.test(
                                              r["Payment Type"] || "",
                                            );
                                            return (
                                              <span
                                                className={`mo-track-pay ${isCOD ? "cod" : "upi"}`}
                                              >
                                                {isCOD ? "COD" : "Prepaid"}
                                              </span>
                                            );
                                          })()}
                                        </span>
                                        <span className="mo-track-card-meta">
                                          {r["Order ID"] || "—"}
                                          {r.city ? ` · ${r.city}` : ""}
                                          {r.amount ? ` · ₹${r.amount}` : ""}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        className="mo-track-del"
                                        title="Remove"
                                        aria-label="Remove"
                                        onClick={() => removeTracking(key)}
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                    {r.booksList && (
                                      <div className="mo-track-card-books">
                                        {r.booksList}
                                      </div>
                                    )}
                                    <button
                                      type="button"
                                      className="mo-track-tid-btn"
                                      title="Copy ID & open India Post tracking"
                                      onClick={() => handleTrackPackage(key)}
                                    >
                                      {key}
                                      <ExternalLink size={12} />
                                    </button>
                                    <div className="mo-track-card-row">
                                      <select
                                        className="bulk-wa-select mo-track-status"
                                        value={r.status || "Processing"}
                                        onChange={(e) =>
                                          updateTrackStatus(key, e.target.value)
                                        }
                                        title="Change & save order status"
                                      >
                                        {TRACK_STATUS_OPTIONS.map((s) => (
                                          <option key={s} value={s}>
                                            {s}
                                          </option>
                                        ))}
                                      </select>
                                      <div className="mo-track-wa">
                                        <select
                                          className="bulk-wa-select"
                                          value={stage}
                                          onChange={(e) =>
                                            setTrackPicks((p) => ({
                                              ...p,
                                              [key]: e.target.value,
                                            }))
                                          }
                                        >
                                          {waMessages({}).map((m) => (
                                            <option key={m.key} value={m.key}>
                                              {m.label}
                                            </option>
                                          ))}
                                        </select>
                                        <button
                                          type="button"
                                          className="mo-track-send"
                                          title="Send on WhatsApp"
                                          aria-label="Send on WhatsApp"
                                          onClick={() => {
                                            const msg = waMessages(r).find(
                                              (m) => m.key === stage,
                                            );
                                            if (msg)
                                              openWhatsApp(
                                                r["Phone Number"],
                                                msg.text,
                                              );
                                          }}
                                        >
                                          <FaWhatsapp size={15} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div className="mo-track-foot">
                      <span>{trackList.length} tracked</span>
                      <button
                        type="button"
                        className="mo-track-clear"
                        onClick={clearTracking}
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                );
              })()}
          </div>
        )}

        {/* ===== Tracking (bulk paste tracking IDs → Tracking sheet) ===== */}
        {activeTab === "tracking" && (
          <div className="mo-trackpush">
            <div className="mo-trackpush-head">
              <Truck size={18} />
              <div>
                <div className="mo-trackpush-title">Bulk tracking upload</div>
                <div className="mo-trackpush-sub">
                  Paste a JSON array of <strong>orderId</strong> +{" "}
                  <strong>trackingId</strong>. Each tracking ID is written to
                  the Shipping ID column of that order&apos;s row in Form
                  responses, and shows on the customer&apos;s profile.
                </div>
              </div>
            </div>

            <textarea
              className="admin-input mo-trackpush-textarea"
              rows={9}
              spellCheck={false}
              placeholder={
                '[\n  { "orderId": "ORD1786215470091", "trackingId": "CX042819326IN" },\n  { "orderId": "ORD1786256569477", "trackingId": "EY484883105IN" }\n]'
              }
              value={trackingJsonInput}
              onChange={(e) => {
                setTrackingJsonInput(e.target.value);
                setTrackingResult(null);
              }}
              onBlur={parseTrackingJson}
            />

            <div className="mo-trackpush-actions">
              <button
                type="button"
                className="mo-trackpush-parse"
                onClick={parseTrackingJson}
                disabled={!trackingJsonInput.trim()}
              >
                <Search size={15} /> Parse &amp; preview
              </button>
              <button
                type="button"
                className="mo-trackpush-submit"
                onClick={pushTrackingRows}
                disabled={trackingRows.length === 0 || trackingBusy}
              >
                {trackingBusy ? (
                  "Pushing…"
                ) : (
                  <>
                    <Package size={15} /> Write {trackingRows.length || ""} to
                    Shipping ID
                    {trackChangeStatus ? " + status" : ""}
                  </>
                )}
              </button>
            </div>

            {trackingParseError && (
              <div className="mo-track-error">{trackingParseError}</div>
            )}

            {trackingResult && (
              <div className="mo-track-summary">
                <span className="mo-track-chip ok">
                  <Check size={13} /> {trackingResult.pushed} tracking ID
                  {trackingResult.pushed === 1 ? "" : "s"} written to Shipping
                  ID
                  {trackingResult.statusChanged
                    ? ` · ${trackingResult.statusChanged} status${trackingResult.statusChanged === 1 ? "" : "es"} updated`
                    : ""}
                  . Give the sheet a moment, then check a customer profile.
                </span>
              </div>
            )}

            {trackingRows.length > 0 && (
              <div className="mo-trackpush-preview">
                <div className="mo-trackpush-preview-head">
                  <span>
                    {trackingRows.length} entr
                    {trackingRows.length === 1 ? "y" : "ies"} ready
                  </span>
                  <label className="mo-tp-statustoggle">
                    <input
                      type="checkbox"
                      checked={trackChangeStatus}
                      onChange={(e) => setTrackChangeStatus(e.target.checked)}
                    />
                    Also change status
                  </label>
                </div>

                {trackChangeStatus && (
                  <div className="mo-tp-bulkbar">
                    <span className="mo-tp-bulkbar-lbl">
                      Set all {trackingRows.length} to
                    </span>
                    <select
                      className="mo-tp-status-select"
                      value={trackBulkStatus}
                      onChange={(e) => {
                        setTrackBulkStatus(e.target.value);
                        setTrackRowStatus({}); // all rows follow the bulk value
                      }}
                    >
                      {TRACK_STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <span className="mo-tp-bulkbar-hint">
                      or override a row below
                    </span>
                  </div>
                )}

                <div
                  className={`mo-trackpush-table ${trackChangeStatus ? "mo-trackpush-table-3col" : "mo-trackpush-table-2col"}`}
                >
                  <div className="mo-trackpush-trow mo-trackpush-thead">
                    <span>Order &amp; customer</span>
                    <span>Tracking ID</span>
                    {trackChangeStatus && <span>New status</span>}
                  </div>
                  {trackingRows.map((r, i) => {
                    const o = orders.find(
                      (x) =>
                        String(x["Order ID"] || "").trim() ===
                        String(r.orderId || "").trim(),
                    );
                    const cName = o
                      ? String(o["Customer Name"] || "")
                          .replace(/\s*\(unconfirmed\)\s*/i, "")
                          .trim()
                      : "";
                    const cVal = o ? o["Total Amount"] || o.revenue || "" : "";
                    const isCOD = /cash|cod/i.test(o?.["Payment Type"] || "");
                    return (
                      <div
                        className="mo-trackpush-trow"
                        key={`${r.orderId}-${i}`}
                      >
                        <div className="mo-tp-left">
                          <span className="mo-tp-oid">{r.orderId || "—"}</span>
                          {o ? (
                            <span className="mo-tp-meta">
                              {cName || "—"}
                              {cVal ? ` · ₹${cVal}` : ""}
                              <span
                                className={`mo-tp-pay ${isCOD ? "cod" : "prepaid"}`}
                              >
                                {isCOD ? "COD" : "Prepaid"}
                              </span>
                            </span>
                          ) : (
                            <span className="mo-tp-meta mo-tp-missing">
                              order not in view
                            </span>
                          )}
                        </div>
                        <span className="mo-trackpush-tid">{r.trackingId}</span>
                        {trackChangeStatus && (
                          <select
                            className="mo-tp-status-select mo-tp-status-row"
                            value={trackRowStatus[r.orderId] || trackBulkStatus}
                            onChange={(e) =>
                              setTrackRowStatus((prev) => ({
                                ...prev,
                                [r.orderId]: e.target.value,
                              }))
                            }
                          >
                            {TRACK_STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== Orders (accordion) ===== */}
        {activeTab === "orders" && (
          <>
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
                        {orderView === "cards" && (
                          <>
                            <span className="mo-view-div" />
                            <button
                              type="button"
                              className={`mo-view-btn mo-select-btn${cardSelectMode ? " active" : ""}`}
                              onClick={() => {
                                setCardSelectMode((v) => {
                                  if (v) setSelectedIds([]);
                                  return !v;
                                });
                              }}
                              title={
                                cardSelectMode ? "Exit select mode" : "Select orders"
                              }
                            >
                              <CheckSquare size={16} />
                              <span className="mo-select-btn-lbl">
                                {cardSelectMode ? "Done" : "Select"}
                              </span>
                            </button>
                          </>
                        )}
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

                  {Object.keys(pendingStatus).length > 0 && (
                    <div className="mo-status-pushbar">
                      <span className="mo-status-pushbar-lbl">
                        {Object.keys(pendingStatus).length} status change
                        {Object.keys(pendingStatus).length === 1 ? "" : "s"}{" "}
                        queued
                      </span>
                      <div className="mo-status-pushbar-actions">
                        <button
                          type="button"
                          className="mo-status-discard"
                          onClick={discardPendingStatus}
                          disabled={pushingStatus}
                        >
                          Discard
                        </button>
                        <button
                          type="button"
                          className="mo-status-push"
                          onClick={pushPendingStatus}
                          disabled={pushingStatus}
                        >
                          {pushingStatus
                            ? "Pushing…"
                            : `Push ${Object.keys(pendingStatus).length} to sheet`}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="orders-toolbar">
                    <div className="mo-view-toggle">
                      {[
                        { k: "all", label: "All" },
                        { k: "pending", label: "Not picked" },
                        { k: "picked", label: "Picked" },
                        {
                          k: "noted",
                          label: `Noted${notedOrdersCount > 0 ? ` (${notedOrdersCount})` : ""}`,
                        },
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

                  {orderView === "cards" && cardSelectMode && (
                    <div className="mo-cardbulk-bar">
                      <div className="mo-cardbulk-left">
                        <CheckSquare size={16} />
                        <span className="mo-cardbulk-count">
                          {selectedIds.length} selected
                        </span>
                        {selectedIds.length > 0 && (
                          <button
                            type="button"
                            className="mo-cardbulk-clear"
                            onClick={() => setSelectedIds([])}
                          >
                            Clear
                          </button>
                        )}
                        <button
                          type="button"
                          className="mo-cardbulk-clear"
                          onClick={() =>
                            setSelectedIds(
                              visibleOrders
                                .map((o) => o["Order ID"])
                                .filter(Boolean),
                            )
                          }
                        >
                          Select all
                        </button>
                      </div>
                      <div className="mo-cardbulk-right">
                        <span className="mo-cardbulk-lbl">Set status</span>
                        <select
                          className="mo-tp-status-select"
                          value={cardBulkStatus}
                          onChange={(e) => setCardBulkStatus(e.target.value)}
                        >
                          {TRACK_STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="mo-cardbulk-apply"
                          disabled={selectedIds.length === 0 || cardBulkBusy}
                          onClick={applyCardBulkStatus}
                        >
                          {cardBulkBusy
                            ? "Applying…"
                            : `Apply to ${selectedIds.length || ""}`}
                        </button>
                      </div>
                    </div>
                  )}

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

                        {/* Address label only — the bottom From/To section,
                            without the India Post declaration */}
                        <div className="mo-dl-group">
                          <span className="mo-dl-group-label">
                            <span className="mo-dl-icon">
                              <MapPin size={20} />
                            </span>
                            <span className="mo-dl-text">
                              Address label only
                              <em>From/To section, no India Post form</em>
                            </span>
                          </span>
                          <button
                            type="button"
                            className="mo-form-btn mo-dl-pdf"
                            onClick={() => downloadSelectedForms("pdf", true)}
                            title="Selected orders' address labels in one PDF"
                          >
                            PDF
                          </button>
                          <button
                            type="button"
                            className="mo-form-btn mo-dl-png"
                            onClick={() => downloadSelectedForms("png", true)}
                            title="One address-label PNG per selected order"
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

                  {mergeGroups.length > 0 && (
                    <div className="mo-merge-strip">
                      <div className="mo-merge-strip-head">
                        <Package size={15} />
                        <span>
                          {mergeGroups.length} customer
                          {mergeGroups.length > 1 ? "s" : ""} with multiple
                          orders — tap to merge into one
                        </span>
                      </div>
                      <div className="mo-merge-chips">
                        {mergeGroups.map((g) => (
                          <button
                            key={g.phone}
                            type="button"
                            className="mo-merge-chip"
                            onClick={() => setMergeGroup(g)}
                          >
                            <span className="mo-merge-chip-name">
                              {g.orders[0]["Customer Name"] || g.phone}
                            </span>
                            <span className="mo-merge-chip-count">
                              {g.orders.length}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {orderView === "cards" ? (
                    <div className="admin-orders-grid">
                      {visibleOrders.map((order, idx) => {
                        const orderId = order["Order ID"];
                        const books = order.parsedBooks || [];
                        const pnl = order.pnl;
                        const hasTracking =
                          order.shippingId &&
                          String(order.shippingId).trim() !== "";
                        const tinyUrl = order["TinyURL"];
                        const hasTinyUrl =
                          tinyUrl && String(tinyUrl).trim() !== "";
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

                        const isExpanded = !!expandedCards[orderId];
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
                            (pickChecked[bookKey(orderId, i)]
                              ? b.total || 0
                              : 0),
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
                        const isCOD = /cash|cod/i.test(
                          order["Payment Type"] || "",
                        );
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

                        const isSelected =
                          cardSelectMode && selectedIds.includes(orderId);
                        const toggleCardSelect = () =>
                          setSelectedIds((prev) =>
                            prev.includes(orderId)
                              ? prev.filter((x) => x !== orderId)
                              : [...prev, orderId],
                          );

                        return (
                          <motion.div
                            key={orderId || idx}
                            initial={{ opacity: 0, y: 18, scale: 0.985 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{
                              duration: 0.36,
                              ease: EASE_OUT,
                              delay: Math.min((idx % ORDERS_BATCH) * 0.035, 0.32),
                            }}
                            className={`admin-order-card mo-card ${
                              isCOD ? "mo-card-cod" : "mo-card-online"
                            }${isPacked ? " packed" : ""}${
                              isExpanded ? " expanded" : ""
                            }${cardSelectMode ? " selectable" : ""}${
                              isSelected ? " selected" : ""
                            }`}
                            onPointerDown={() => {
                              if (cardSelectMode) return;
                              longPressRef.current = false;
                              clearTimeout(lpTimer.current);
                              lpTimer.current = setTimeout(() => {
                                longPressRef.current = true;
                                setCardSelectMode(true);
                                setSelectedIds((p) =>
                                  p.includes(orderId)
                                    ? p
                                    : [...p, orderId],
                                );
                                if (navigator.vibrate) navigator.vibrate(15);
                              }, 480);
                            }}
                            onPointerUp={() =>
                              clearTimeout(lpTimer.current)
                            }
                            onPointerMove={() =>
                              clearTimeout(lpTimer.current)
                            }
                            onPointerLeave={() =>
                              clearTimeout(lpTimer.current)
                            }
                          >
                            {cardSelectMode && (
                              <button
                                type="button"
                                className={`mo-card-checkbox${isSelected ? " on" : ""}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCardSelect();
                                }}
                                aria-pressed={isSelected}
                                title={isSelected ? "Deselect" : "Select"}
                              >
                                {isSelected && <Check size={14} />}
                              </button>
                            )}
                            {/* Top — serial · name · payment pill. */}
                            <div
                              className="mo-card-top mo-card-top-toggle"
                              onClick={() => {
                                if (longPressRef.current) {
                                  longPressRef.current = false;
                                  return;
                                }
                                cardSelectMode
                                  ? toggleCardSelect()
                                  : setBillOrderId(orderId);
                              }}
                              title={
                                cardSelectMode
                                  ? isSelected
                                    ? "Deselect"
                                    : "Select"
                                  : "Open order bill"
                              }
                            >
                              <div className="mo-card-id">
                                <div className="mo-name-row">
                                  <span className="mo-srno">{idx + 1}</span>
                                  <span className="mo-name">
                                    {order["Customer Name"] || "—"}
                                  </span>
                                  <div className="mo-name-right">
                                    <span
                                      className={`mo-pay-pill ${isCOD ? "cod" : "upi"}`}
                                    >
                                      {isCOD ? "COD" : "UPI"}
                                    </span>
                                    <button
                                      type="button"
                                      className="mo-copy-ic"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(
                                          orderId,
                                          `order-${idx}`,
                                        );
                                      }}
                                      title="Copy order ID"
                                    >
                                      {copiedId === `order-${idx}` ? (
                                        <Check
                                          size={13}
                                          className="text-green"
                                        />
                                      ) : (
                                        <Copy
                                          size={13}
                                          className="gray-500"
                                        />
                                      )}
                                    </button>
                                  </div>
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
                              </div>
                            </div>

                            {/* Order date · time | relative age. */}
                            <div
                              className="mo-when-row"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Calendar size={12} />
                              <span className="mo-when-date">
                                {formatDate(
                                  order["Timestamp(D)"] || order["Timestamp"],
                                )}
                              </span>
                              {agoLabel && (
                                <>
                                  <span className="mo-when-sep">|</span>
                                  <span
                                    className="mo-when-ago"
                                    title={
                                      orderDate
                                        ? orderDate.toLocaleString("en-IN")
                                        : ""
                                    }
                                  >
                                    {agoLabel}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Unified panel — status row + price row, one
                                bordered grid separated by lines. */}
                            <div
                              className="mo-panel"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="mo-panel-status">
                              <div className="mo-status-select-wrap">
                                <select
                                  className={`mo-status-quick${pendingStatus[orderId] ? " dirty" : ""}`}
                                  value={order.status || "Processing"}
                                  title="Change status (queued — push to save)"
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    patchLocalOrder(orderId, {
                                      "Order Status": val,
                                      status: val,
                                    });
                                    setPendingStatus((prev) => ({
                                      ...prev,
                                      [orderId]: val,
                                    }));
                                  }}
                                >
                                  {TRACK_STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown
                                  size={15}
                                  className="mo-status-chev"
                                />
                              </div>
                              <button
                                type="button"
                                className="mo-frame-ic mo-frame-wa"
                                onClick={() => {
                                  setWaCustomText("");
                                  setWaPickerOrder(order);
                                }}
                                title="WhatsApp the customer"
                                aria-label="WhatsApp the customer"
                              >
                                <FaWhatsapp size={17} />
                              </button>
                              {orderId && (
                                <a
                                  className="mo-frame-ic"
                                  href={`/profile/${String(
                                    order["Phone Number"] || "",
                                  )
                                    .replace(/\D/g, "")
                                    .slice(-10)}/orders/${encodeURIComponent(orderId)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Open customer order page"
                                >
                                  <ExternalLink size={15} />
                                </a>
                              )}
                              </div>

                              {/* Book total + benefit badges (add-ons / savings). */}
                              <div className="mo-panel-price">
                              {(() => {
                                const rev = Number(order.revenue) || 0;
                                // 5.9% deduction applies to COD orders only.
                                const fee = isCOD ? Math.round(rev * 0.059) : 0;
                                const net = Math.round(rev - fee);
                                return (
                                  <button
                                    type="button"
                                    className="mo-amount"
                                    onClick={() => setBillOrderId(orderId)}
                                    title={
                                      isCOD
                                        ? `Net after 5.9% deduction (₹${rev.toLocaleString()} − ₹${fee}) · tap for bill`
                                        : `₹${rev.toLocaleString()} · tap for bill`
                                    }
                                  >
                                    <span className="mo-amount-num">
                                      ₹{net.toLocaleString()}
                                    </span>
                                    {isCOD && (
                                      <span className="mo-amount-fee">
                                        −₹{fee.toLocaleString()} (5.9%)
                                      </span>
                                    )}
                                    {Number(order.pnl) < 0 && (
                                      <span className="mo-loss-flag">
                                        <AlertCircle size={11} /> Loss ₹
                                        {Math.abs(
                                          Math.round(Number(order.pnl)),
                                        ).toLocaleString()}
                                      </span>
                                    )}
                                  </button>
                                );
                              })()}
                              {(() => {
                                const deliv = String(
                                  order["Delivery Type"] || "",
                                );
                                const fasterD =
                                  /faster|express/i.test(deliv) ||
                                  /^e/i.test(
                                    String(order.shippingId || "").trim(),
                                  );
                                const freeD = /free/i.test(deliv);
                                const giftOn = order["Gift Wrap"] === "Yes";
                                const subB = books.reduce(
                                  (s, b) =>
                                    s +
                                    (b.total ||
                                      b.price * (b.quantity || 1) ||
                                      0),
                                  0,
                                );
                                const grandB =
                                  parseFloat(order["Total Amount"]) ||
                                  Number(order.revenue) ||
                                  subB;
                                const delFeeB =
                                  parseFloat(order["Delivery Charge"]) || 0;
                                const giftFeeB = giftOn
                                  ? parseFloat(order["Gift Wrap Charge"]) || 0
                                  : 0;
                                const extraB =
                                  grandB - subB - delFeeB - giftFeeB;
                                const discB = extraB < 0 ? -extraB : 0;
                                const badges = [];
                                if (fasterD)
                                  badges.push({ e: "⚡", t: "Faster" });
                                if (freeD)
                                  badges.push({ e: "🚚", t: "Free delivery" });
                                if (giftOn)
                                  badges.push({ e: "🎁", t: "Gift wrap" });
                                if (discB > 0)
                                  badges.push({
                                    e: "🏷️",
                                    t: `Saved ₹${Math.round(discB).toLocaleString()}`,
                                  });
                                if (!badges.length) return null;
                                return (
                                  <div className="mo-addon-badges">
                                    {badges.map((b, bi) => (
                                      <span className="mo-addon-badge" key={bi}>
                                        <span className="mo-addon-emoji">
                                          {b.e}
                                        </span>
                                        {b.t}
                                      </span>
                                    ))}
                                  </div>
                                );
                              })()}
                              </div>
                            </div>

                            {/* Book covers — scrollable row with name + price,
                            tap the cover to mark it picked. */}
                            {books.length > 0 && (
                              <div
                                className="mo-covers"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {books.map((b, ci) => {
                                  const img = getBookImage(b.name);
                                  const checked =
                                    !!pickChecked[bookKey(orderId, ci)];
                                  const price =
                                    b.total > 0
                                      ? b.total
                                      : b.price > 0
                                        ? b.price
                                        : 0;
                                  return (
                                    <div className="mo-cover-item" key={ci}>
                                      <button
                                        type="button"
                                        className={`mo-cover${checked ? " checked" : ""}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleBook(orderId, ci);
                                        }}
                                        title={b.name}
                                      >
                                        {img ? (
                                          <img
                                            src={img}
                                            alt={b.name}
                                            loading="lazy"
                                          />
                                        ) : (
                                          <div className="mo-cover-ph">
                                            <Package size={18} />
                                          </div>
                                        )}
                                        {b.quantity > 1 && (
                                          <span className="mo-cover-qty">
                                            ×{b.quantity}
                                          </span>
                                        )}
                                        <span className="mo-cover-check">
                                          <Check size={16} />
                                        </span>
                                      </button>
                                      <span
                                        className="mo-cover-name"
                                        title={b.name}
                                      >
                                        {b.name}
                                      </span>
                                      <span className="mo-cover-price">
                                        {price > 0 ? `₹${price}` : "—"}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Book count · picked badge — below the images
                                (date now lives in the header row above). */}
                            <div className="mo-card-desc">
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
                                    ? ` Picked · ₹${pickedValue.toLocaleString()}`
                                    : pickedCount > 0
                                      ? `Partially picked ${pickedCount}/${books.length} · ₹${pickedValue.toLocaleString()} of ₹${totalBooksValue.toLocaleString()}`
                                      : "Not picked"}
                                </span>
                              )}
                            </div>

                            {/* Customer's own note left at checkout. */}
                            {order["Order Comment"] && (
                              <div className="mo-cust-note">
                                <MessageCircle size={12} />
                                <span>{order["Order Comment"]}</span>
                              </div>
                            )}

                            {/* Comment + Book online moved into the bill modal. */}

                            {billOrderId === orderId &&
                              typeof document !== "undefined" &&
                              createPortal(
                                <div
                                  className="bill-modal-overlay"
                                  onClick={() => setBillOrderId(null)}
                                >
                                  <motion.div
                                    className="bill-modal mo-bill"
                                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.24, ease: EASE_OUT }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="bill-header">
                                      <div className="mo-bill-head-l">
                                        <span className="mo-bill-title">
                                          Order bill
                                        </span>
                                        <span className="mo-bill-sub">
                                          {order["Customer Name"] || "Customer"}{" "}
                                          · #{oidStr.slice(-6)}
                                        </span>
                                      </div>
                                      <span
                                        className="mo-bill-x"
                                        onClick={() => setBillOrderId(null)}
                                      >
                                        <X size={18} />
                                      </span>
                                    </div>
                                    <div className="mo-bill-body">
                                      {books.length > 0 && (
                                        <div className="mo-bill-sec">
                                          <div className="mo-bill-sec-t">
                                            Items · {books.length}
                                          </div>
                                          <div className="mo-bill-items">
                                            {books.map((b, bi) => {
                                              const price =
                                                b.total > 0
                                                  ? b.total
                                                  : b.price > 0
                                                    ? b.price
                                                    : 0;
                                              const bimg = getBookImage(
                                                b.name,
                                              );
                                              return (
                                                <div
                                                  className="mo-bill-item"
                                                  key={bi}
                                                >
                                                  <span className="mo-bill-item-thumb">
                                                    {bimg ? (
                                                      <img
                                                        src={bimg}
                                                        alt={b.name}
                                                        loading="lazy"
                                                      />
                                                    ) : (
                                                      <Package size={16} />
                                                    )}
                                                  </span>
                                                  <span className="mo-bill-item-nm">
                                                    {b.name}
                                                    {b.quantity > 1
                                                      ? ` ×${b.quantity}`
                                                      : ""}
                                                  </span>
                                                  <span className="mo-bill-item-pr">
                                                    {price > 0
                                                      ? `₹${price.toLocaleString()}`
                                                      : "—"}
                                                  </span>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}

                                      {(() => {
                                        const rev = Number(order.revenue) || 0;
                                        const fee = isCOD
                                          ? Math.round(rev * 0.059)
                                          : 0;
                                        const net = Math.round(rev - fee);
                                        return (
                                          <div className="mo-bill-sec">
                                            <div className="mo-bill-sec-t">
                                              Payment
                                            </div>
                                            <div className="mo-bill-rows">
                                              <div className="mo-bill-row">
                                                <span>Order value</span>
                                                <b>₹{rev.toLocaleString()}</b>
                                              </div>
                                              {isCOD && (
                                                <>
                                                  <div className="mo-bill-row muted">
                                                    <span>COD fee · 5.9%</span>
                                                    <b>−₹{fee.toLocaleString()}</b>
                                                  </div>
                                                  <div className="mo-bill-row">
                                                    <span>Net receivable</span>
                                                    <b>₹{net.toLocaleString()}</b>
                                                  </div>
                                                </>
                                              )}
                                              <div className="mo-bill-row muted">
                                                <span>Cost</span>
                                                <b>
                                                  ₹
                                                  {order.totalCost.toLocaleString()}
                                                </b>
                                              </div>
                                              <div
                                                className={`mo-bill-row total ${pnl >= 0 ? "pos" : "neg"}`}
                                              >
                                                <span>Profit</span>
                                                <b>
                                                  {pnl >= 0 ? "+" : "−"}₹
                                                  {Math.abs(
                                                    pnl,
                                                  ).toLocaleString()}
                                                </b>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    {(() => {
                                      // India Post autofill payload — identical
                                      // shape to the "Book online" modal copy.
                                      const bkCount = books.length || 1;
                                      const amtRaw =
                                        order["Total Amount"] ||
                                        order.revenue ||
                                        "";
                                      const gross =
                                        Number(
                                          String(amtRaw).replace(/[^\d.]/g, ""),
                                        ) || 0;
                                      const codNet = Math.max(
                                        0,
                                        gross - Math.round(gross * 0.059),
                                      );
                                      const ch = ipChunks(order["Address"]);
                                      const jsonPayload = JSON.stringify({
                                        v: "tbx-ip-1",
                                        orderId: orderId || "",
                                        isCOD,
                                        dropPincode: "400017",
                                        dropOffice: "Dharavi Road S.O",
                                        mailShape: "Box Type (Non Roll Form)",
                                        deliveryType: "Normal Delivery",
                                        weight: "500",
                                        length: "22",
                                        width: "13",
                                        height: String(bkCount),
                                        codAmount: isCOD ? String(codNet) : "",
                                        name: ipSanitize(
                                          order["Customer Name"],
                                        ).slice(0, 30),
                                        mobile: String(
                                          order["Phone Number"] || "",
                                        ),
                                        addr1: ch[0] || "",
                                        addr2: [ch[1], ...ch.slice(3)]
                                          .filter(Boolean)
                                          .join(", "),
                                        landmark: ch[2] || "",
                                        city: order["City"] || "",
                                        state: order["State"] || "",
                                        pincode: String(order["Pincode"] || ""),
                                      });
                                      const editing = !!addrEdit[orderId];
                                      const draft = addrEdit[orderId] || {
                                        address: order["Address"] || "",
                                        city: order["City"] || "",
                                        state: order["State"] || "",
                                        pincode: order["Pincode"] || "",
                                      };
                                      const setDraft = (patch) =>
                                        setAddrEdit((p) => ({
                                          ...p,
                                          [orderId]: { ...draft, ...patch },
                                        }));
                                      const savingRow = rowSaving[orderId];
                                      return (
                                        <div className="aoc-section">
                                          <div className="aoc-section-title">
                                            <MapPin size={13} /> Shipping address
                                            <button
                                              type="button"
                                              className="aoc-json-btn"
                                              title="Copy India Post autofill JSON"
                                              onClick={() =>
                                                copyToClipboard(
                                                  jsonPayload,
                                                  `json-${idx}`,
                                                )
                                              }
                                            >
                                              {copiedId === `json-${idx}` ? (
                                                <>
                                                  <Check size={12} /> Copied
                                                </>
                                              ) : (
                                                <>
                                                  <Copy size={12} /> Copy JSON
                                                </>
                                              )}
                                            </button>
                                          </div>

                                          {!editing ? (
                                            <div className="aoc-addr">
                                              <div className="aoc-addr-line">
                                                {order["Address"] || "—"}
                                              </div>
                                              <div className="aoc-addr-grid">
                                                <span>
                                                  <b>City</b>{" "}
                                                  {order["City"] || "—"}
                                                </span>
                                                <span>
                                                  <b>State</b>{" "}
                                                  {order["State"] || "—"}
                                                </span>
                                                <span>
                                                  <b>Pincode</b>{" "}
                                                  {order["Pincode"] || "—"}
                                                </span>
                                              </div>
                                              <div className="aoc-addr-actions">
                                                <button
                                                  type="button"
                                                  className="aoc-mini-btn"
                                                  onClick={() =>
                                                    copyToClipboard(
                                                      addressLine,
                                                      `address-${idx}`,
                                                    )
                                                  }
                                                >
                                                  {copiedId ===
                                                  `address-${idx}` ? (
                                                    <>
                                                      <Check size={12} /> Copied
                                                    </>
                                                  ) : (
                                                    <>
                                                      <Copy size={12} /> Copy
                                                    </>
                                                  )}
                                                </button>
                                                <button
                                                  type="button"
                                                  className="aoc-mini-btn"
                                                  onClick={() =>
                                                    setAddrEdit((p) => ({
                                                      ...p,
                                                      [orderId]: {
                                                        address:
                                                          order["Address"] || "",
                                                        city:
                                                          order["City"] || "",
                                                        state:
                                                          order["State"] || "",
                                                        pincode:
                                                          order["Pincode"] || "",
                                                      },
                                                    }))
                                                  }
                                                >
                                                  <Edit size={12} /> Edit
                                                </button>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="aoc-addr-edit">
                                              <textarea
                                                className="admin-input aoc-addr-input"
                                                rows={2}
                                                value={draft.address}
                                                placeholder="Address"
                                                onChange={(e) =>
                                                  setDraft({
                                                    address: e.target.value,
                                                  })
                                                }
                                              />
                                              <div className="aoc-addr-edit-row">
                                                <input
                                                  className="admin-input"
                                                  value={draft.city}
                                                  placeholder="City"
                                                  onChange={(e) =>
                                                    setDraft({
                                                      city: e.target.value,
                                                    })
                                                  }
                                                />
                                                <input
                                                  className="admin-input"
                                                  value={draft.state}
                                                  placeholder="State"
                                                  onChange={(e) =>
                                                    setDraft({
                                                      state: e.target.value,
                                                    })
                                                  }
                                                />
                                                <input
                                                  className="admin-input"
                                                  value={draft.pincode}
                                                  placeholder="Pincode"
                                                  onChange={(e) =>
                                                    setDraft({
                                                      pincode: e.target.value,
                                                    })
                                                  }
                                                />
                                              </div>
                                              <div className="aoc-addr-actions">
                                                <button
                                                  type="button"
                                                  className="aoc-mini-btn primary"
                                                  disabled={
                                                    savingRow === "address"
                                                  }
                                                  onClick={() =>
                                                    saveAddress(order)
                                                  }
                                                >
                                                  {savingRow === "address" ? (
                                                    "Saving…"
                                                  ) : (
                                                    <>
                                                      <Check size={12} /> Save to
                                                      sheet
                                                    </>
                                                  )}
                                                </button>
                                                <button
                                                  type="button"
                                                  className="aoc-mini-btn"
                                                  onClick={() =>
                                                    setAddrEdit((p) => {
                                                      const n = { ...p };
                                                      delete n[orderId];
                                                      return n;
                                                    })
                                                  }
                                                >
                                                  Cancel
                                                </button>
                                              </div>
                                            </div>
                                          )}

                                          {/* Tracking ID — show if set, always
                                          allow add/replace pushed to the sheet. */}
                                          <div className="aoc-track-edit">
                                            {hasTracking && (
                                              <div className="aoc-track-cur">
                                                <span className="aoc-track-id">
                                                  Tracking:{" "}
                                                  <strong>
                                                    {order.shippingId}
                                                  </strong>
                                                </span>
                                                <button
                                                  type="button"
                                                  className="track-btn-small flex flex-row items-center gap-4"
                                                  onClick={() =>
                                                    handleTrackPackage(
                                                      order.shippingId,
                                                    )
                                                  }
                                                >
                                                  <Truck size={12} /> Track
                                                </button>
                                              </div>
                                            )}
                                            <div className="aoc-track-add">
                                              <input
                                                className="admin-input"
                                                placeholder={
                                                  hasTracking
                                                    ? "Replace tracking ID…"
                                                    : "Add tracking ID (e.g. CX…IN)"
                                                }
                                                value={
                                                  trackDrafts[orderId] ?? ""
                                                }
                                                onChange={(e) =>
                                                  setTrackDrafts((p) => ({
                                                    ...p,
                                                    [orderId]: e.target.value,
                                                  }))
                                                }
                                                onKeyDown={(e) => {
                                                  if (e.key === "Enter")
                                                    saveTrackingId(
                                                      order,
                                                      trackDrafts[orderId],
                                                    );
                                                }}
                                              />
                                              <button
                                                type="button"
                                                className="aoc-mini-btn primary"
                                                disabled={
                                                  !String(
                                                    trackDrafts[orderId] || "",
                                                  ).trim() ||
                                                  savingRow === "tracking"
                                                }
                                                onClick={() =>
                                                  saveTrackingId(
                                                    order,
                                                    trackDrafts[orderId],
                                                  )
                                                }
                                              >
                                                {savingRow === "tracking" ? (
                                                  "Saving…"
                                                ) : (
                                                  <>
                                                    <Check size={12} /> Save
                                                  </>
                                                )}
                                              </button>
                                            </div>
                                            {hasTinyUrl && (
                                              <button
                                                type="button"
                                                className="aoc-orderlink"
                                                title="Open the customer's order link"
                                                onClick={() =>
                                                  window.open(
                                                    tinyUrl,
                                                    "_blank",
                                                    "noopener,noreferrer",
                                                  )
                                                }
                                              >
                                                <ExternalLink size={12} /> Order{" "}
                                                {oidStr} link
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })()}

                                    <div className="mo-bill-sec">
                                      <div className="mo-bill-sec-t">Status</div>
                                    <div className="aoc-status-row">
                                      <select
                                        className="bulk-wa-select aoc-status-select"
                                        value={order.status || "Processing"}
                                        title="Change & save order status"
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          patchLocalOrder(orderId, {
                                            "Order Status": val,
                                            status: val,
                                          });
                                          updateOrderRow(orderId, {
                                            "Order Status": val,
                                          }).then(() =>
                                            setTimeout(fetchOrders, 1300),
                                          );
                                        }}
                                      >
                                        {TRACK_STATUS_OPTIONS.map((s) => (
                                          <option key={s} value={s}>
                                            {s}
                                          </option>
                                        ))}
                                      </select>
                                      <button
                                        type="button"
                                        className={`aoc-pack-btn${isPacked ? " done" : ""}`}
                                        onClick={() => togglePacked(orderId)}
                                      >
                                        {isPacked ? (
                                          <>
                                            <CheckCircle size={14} /> Packed
                                          </>
                                        ) : (
                                          <>
                                            <Package size={14} /> Mark as packed
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    </div>

                                    <div className="mo-bill-sec">
                                      <div className="mo-bill-sec-t">
                                        Actions
                                      </div>
                                      <div className="mo-bill-actions">
                                        {(() => {
                                          const cmt =
                                            orderNotes[orderId] ??
                                            (order["Comment"] || "");
                                          return (
                                            <button
                                              type="button"
                                              className="sec-big-btn mo-note-add"
                                              onClick={() =>
                                                setNoteEditor({
                                                  orderId,
                                                  draft: cmt,
                                                })
                                              }
                                            >
                                              <MessageCircle size={14} />{" "}
                                              {cmt ? "Edit comment" : "Comment"}
                                            </button>
                                          );
                                        })()}
                                        <button
                                          type="button"
                                          className={`sec-big-btn mo-book-btn${bookedOrders[orderId] ? " done" : ""}`}
                                          onClick={() => setBookOrder(order)}
                                          title={
                                            bookedOrders[orderId]
                                              ? "Booked with India Post"
                                              : "Book online with India Post"
                                          }
                                        >
                                          {bookedOrders[orderId] ? (
                                            <>
                                              <CheckCircle size={14} /> Booked
                                            </>
                                          ) : (
                                            <>
                                              <Truck size={14} /> Book online
                                            </>
                                          )}
                                        </button>
                                        <button
                                          type="button"
                                          className="mo-card-delete mo-bill-del"
                                          title="Delete order from sheet"
                                          onClick={() => deleteOrderRow(order)}
                                        >
                                          <Trash2 size={15} />
                                        </button>
                                      </div>
                                    </div>

                                    <div className="aoc-foot">
                                      <div className="aoc-meta">
                                        <span>
                                          {order["Payment Type"] || "—"}
                                        </span>
                                        <span className="aoc-dot">·</span>
                                        <span>
                                          {cleanDeliveryType(order["Delivery Type"])}
                                        </span>
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
                                </div>,
                                document.body,
                              )}
                          </motion.div>
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
                          {visibleOrders.map((order, i) => {
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

                  {hasMoreOrders && (
                    <div
                      ref={ordersSentinelRef}
                      className="admin-orders-more"
                    >
                      <button
                        type="button"
                        className="admin-orders-more-btn"
                        onClick={() =>
                          setOrdersVisible((v) => v + ORDERS_BATCH)
                        }
                      >
                        Load more · {listOrders.length - visibleOrders.length}{" "}
                        remaining
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="error-state">
                  <div className="error-icon"></div>
                  <p>No orders found</p>
                  <span className="font-12 gray-500">
                    Try adjusting your search or filters
                  </span>
                </div>
              )}
            </Accordion>
          </>
        )}
        </motion.div>
        </div>
        {/* ===== /mo-main ===== */}

        {/* ===== Mobile bottom navigation ===== */}
        <nav className="mo-bottomnav" aria-label="Dashboard sections">
          {/* "IDs" (tracking) tab hidden for now — filtered out here. */}
          {SECTION_TABS.filter((t) => t.key !== "tracking").map((t) => {
            const Icon = t.Icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                className={`mo-nav-item${isActive ? " active" : ""}`}
                onClick={() => goToTab(t.key)}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <motion.span
                    layoutId="mo-bottomnav-pill"
                    className="mo-nav-pill"
                    transition={PILL_SPRING}
                  />
                )}
                <Icon size={18} />
                <span>{t.short}</span>
                {t.key === "orders" && filteredOrders.length > 0 && (
                  <span className="mo-nav-count">
                    {filteredOrders.length > 99 ? "99+" : filteredOrders.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
      {/* ===== /mo-shell ===== */}

      {/* ===== Calculator ===== */}
      <AnimatePresence>
        {showCalc && <CalculatorModal onClose={() => setShowCalc(false)} />}
      </AnimatePresence>

      {/* ===== India Post booking (modal) ===== */}
      <AnimatePresence>
        {showIndiaPost && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowIndiaPost(false)}
            style={{ maxWidth: "980px", margin: "0 auto" }}
          >
            <motion.div
              className="bill-modal ip-modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              ref={setIpScrollNode}
              style={{ maxHeight: "92vh", overflowY: "auto" }}
            >
              {(() => {
                const shippingList = (orders || []).filter((o) =>
                  /getting shipped/i.test(o["Order Status"] || ""),
                );
                const doneCount = shippingList.filter(
                  (o) => !!bookedOrders[o["Order ID"]],
                ).length;
                const pct = shippingList.length
                  ? Math.round((doneCount / shippingList.length) * 100)
                  : 0;
                return (
                  <div className="ip-modal-head">
                    <div className="ip-modal-head-main">
                      <span className="ip-modal-title">
                        <Truck size={17} /> India Post booking
                      </span>
                      <span className="ip-modal-sub">
                        {doneCount} of {shippingList.length} booked · tap any
                        field to copy into the portal
                      </span>
                      <div className="ip-progress" aria-hidden="true">
                        <motion.span
                          className="ip-progress-fill"
                          initial={false}
                          animate={{ width: `${pct}%` }}
                          transition={{
                            type: "spring",
                            stiffness: 180,
                            damping: 28,
                          }}
                        />
                      </div>
                    </div>
                    <div className="ip-modal-head-actions">
                      <button
                        type="button"
                        className="ip-export-btn"
                        onClick={exportBookedCsv}
                        disabled={!doneCount}
                        title={
                          doneCount
                            ? `Download ${doneCount} booked order${doneCount === 1 ? "" : "s"} as CSV`
                            : "Save a tracking ID first"
                        }
                      >
                        <Download size={14} /> Export CSV
                        {doneCount > 0 && (
                          <span className="ip-export-count">{doneCount}</span>
                        )}
                      </button>
                      <button
                        type="button"
                        className="ip-modal-x"
                        onClick={() => setShowIndiaPost(false)}
                        aria-label="Close"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                );
              })()}

              <div className="ip-modal-search">
                <Search size={15} />
                <input
                  className="ip-modal-search-input"
                  placeholder="Search by name, price, pincode, UPI or COD…"
                  value={ipSearch}
                  onChange={(e) => setIpSearch(e.target.value)}
                />
                {ipSearch && (
                  <button
                    type="button"
                    className="ip-modal-search-clear"
                    onClick={() => setIpSearch("")}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="ip-modal-body">
                <IndiaPostSheet
                  orders={orders}
                  copyToClipboard={copyToClipboard}
                  copiedId={copiedId}
                  search={ipSearch}
                  orderNotes={orderNotes}
                  bookedOrders={bookedOrders}
                  onBook={markOrderBooked}
                  onUnbook={unmarkOrderBooked}
                  scrollRef={ipScrollReady ? ipScrollRef : null}
                  showBooking
                  pickChecked={pickChecked}
                  bookKey={bookKey}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Book online with India Post (paginated) ===== */}
      <AnimatePresence>
        {bookOrder &&
          (() => {
            // Page through the same list the user is viewing so they can book
            // one after another without closing the modal.
            const bookList = listOrders;
            const bookIdx = bookList.findIndex(
              (o) =>
                String(o["Order ID"]) === String(bookOrder["Order ID"]),
            );
            const total = bookList.length;
            const hasPrev = bookIdx > 0;
            const hasNext = bookIdx >= 0 && bookIdx < total - 1;
            const goBook = (delta) => {
              const t = bookList[bookIdx + delta];
              if (t) setBookOrder(t);
            };
            const isBooked = !!bookedOrders[bookOrder["Order ID"]];
            return (
              <motion.div
                className="bill-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setBookOrder(null)}
              >
                <motion.div
                  className="bill-modal ip-book-modal"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bill-header">
                    <div className="flex flex-col gap-2">
                      <span className="weight-700 font-16 flex items-center gap-6">
                        <Truck size={17} /> Book online · India Post
                        {bookIdx >= 0 && (
                          <span className="ip-page-count">
                            {bookIdx + 1} / {total}
                          </span>
                        )}
                        {isBooked && (
                          <span className="ip-booked-chip">
                            <CheckCircle size={12} /> Booked
                          </span>
                        )}
                      </span>
                      <span className="font-11 dark-50">
                        {bookOrder["Customer Name"] || "—"} · Order{" "}
                        {bookOrder["Order ID"] || "—"} · tap any field to copy
                      </span>
                    </div>
                    <span
                      className="cursor-pointer"
                      onClick={() => setBookOrder(null)}
                    >
                      <X size={18} />
                    </span>
                  </div>

                  <div className="ip-modal-body">
                    {/* Order comment — shown at the top so the packer sees any
                    note left on this order (e.g. "call before dispatch"). */}
                    {(() => {
                      const cmt =
                        orderNotes[bookOrder["Order ID"]] ??
                        (bookOrder["Comment"] || "");
                      if (!cmt) return null;
                      return (
                        <div className="ip-comment">
                          <span className="ip-comment-title">
                            <MessageCircle size={14} /> Comment
                          </span>
                          <span className="ip-comment-text">{cmt}</span>
                        </div>
                      );
                    })()}

                    <IndiaPostSheet
                      orders={[bookOrder]}
                      copyToClipboard={copyToClipboard}
                      copiedId={copiedId}
                      bypassFilter
                      pickChecked={pickChecked}
                      bookKey={bookKey}
                    />

                    {/* Tracking ID — view + set the article number without
                    leaving the booking flow (writes to the sheet). */}
                    {(() => {
                      const bid = bookOrder["Order ID"];
                      const cur = String(
                        bookOrder["Shipping ID"] ||
                          bookOrder.shippingId ||
                          "",
                      ).trim();
                      const saving = rowSaving[bid] === "tracking";
                      return (
                        <div className="ip-track">
                          <div className="ip-track-title">
                            <Truck size={14} /> Tracking ID
                            {cur && (
                              <span className="ip-track-cur">{cur}</span>
                            )}
                          </div>
                          <div className="ip-track-row">
                            <input
                              className="admin-input"
                              placeholder={
                                cur
                                  ? "Replace tracking ID…"
                                  : "Add tracking ID (e.g. CX…IN)"
                              }
                              value={trackDrafts[bid] ?? ""}
                              onChange={(e) =>
                                setTrackDrafts((p) => ({
                                  ...p,
                                  [bid]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  saveTrackingId(bookOrder, trackDrafts[bid]);
                              }}
                            />
                            <button
                              type="button"
                              className="aoc-mini-btn primary"
                              disabled={
                                !String(trackDrafts[bid] || "").trim() ||
                                saving
                              }
                              onClick={() =>
                                saveTrackingId(bookOrder, trackDrafts[bid])
                              }
                            >
                              {saving ? (
                                "Saving…"
                              ) : (
                                <>
                                  <Check size={13} /> Save
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="ip-book-foot ip-book-foot-nav">
                    <button
                      type="button"
                      className="ip-nav-btn"
                      disabled={!hasPrev}
                      onClick={() => goBook(-1)}
                    >
                      <ChevronLeft size={16} /> Prev
                    </button>

                    {isBooked ? (
                      <button
                        type="button"
                        className="ip-book-undo"
                        onClick={() =>
                          unmarkOrderBooked(bookOrder["Order ID"])
                        }
                      >
                        Undo booked
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="ip-book-done-btn"
                        onClick={() => {
                          // Carry whatever article number is already on the
                          // order so the CSV export isn't missing it.
                          markOrderBooked(
                            bookOrder["Order ID"],
                            String(
                              bookOrder["Shipping ID"] ||
                                bookOrder.shippingId ||
                                "",
                            ).trim(),
                          );
                          // Auto-advance to the next order for a smooth run.
                          if (hasNext) goBook(1);
                        }}
                      >
                        <CheckCircle size={16} />
                        {hasNext ? "Booked · Next" : "Mark as booked"}
                      </button>
                    )}

                    <button
                      type="button"
                      className="ip-nav-btn"
                      disabled={!hasNext}
                      onClick={() => goBook(1)}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
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

              {/* Books unavailable — only when this order still has unpicked
                  books; messages the customer the out-of-stock title(s). */}
              {(() => {
                const wpBooks = waPickerOrder.parsedBooks || [];
                const oid = waPickerOrder["Order ID"];
                const unpicked = wpBooks.filter(
                  (_b, i) => !pickChecked[bookKey(oid, i)],
                );
                if (unpicked.length === 0) return null;
                return (
                  <button
                    type="button"
                    className="wa-unavail-btn"
                    onClick={() => {
                      openWhatsApp(
                        waPickerOrder["Phone Number"],
                        booksUnavailableMessage(
                          waPickerOrder,
                          unpicked.map((b) => b.name),
                        ),
                      );
                      setWaPickerOrder(null);
                    }}
                    title="Tell the customer these books are out of stock"
                  >
                    <AlertCircle size={15} /> Books unavailable ({unpicked.length})
                  </button>
                );
              })()}

              {/* Send the printed-receipt / invoice link (opens the receipt
                  modal for the customer via thebookx.in?orderID=…). */}
              <button
                type="button"
                className="wa-receipt-btn"
                onClick={() => {
                  const oid = String(waPickerOrder["Order ID"] || "").trim();
                  const nm = String(waPickerOrder["Customer Name"] || "")
                    .replace(/\s*\(unconfirmed\)\s*/i, "")
                    .trim();
                  const invoice = `https://thebookx.in?orderID=${encodeURIComponent(
                    oid,
                  )}`;
                  const msg = `Hi${
                    nm ? " " + nm.split(" ")[0] : ""
                  } Thank you for shopping with TheBookX!\n\n View your invoice & full order details: ${invoice}\n Track all your orders anytime: ${PROFILE_URL}`;
                  openWhatsApp(waPickerOrder["Phone Number"], msg);
                  setWaPickerOrder(null);
                }}
              >
                <FaWhatsapp size={15} /> Send receipt / invoice
              </button>

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
                  <MessageCircle size={16} /> Order comment
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
                  <Send size={15} /> Save comment
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

      {/* ===== Merge customer orders (slide-up) ===== */}
      <AnimatePresence>
        {mergeGroup && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (merging) return;
              setMergeGroup(null);
              setMergeStatusDrafts({});
            }}
          >
            <motion.div
              className="bill-modal merge-modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const m = computeMergedOrder(mergeGroup);
                return (
                  <>
                    <div className="bill-header">
                      <span className="weight-600 font-16 flex flex-col">
                        <span className="flex flex-row gap-8 items-center">
                          <Package size={18} /> Merge orders
                        </span>
                        <span className="font-12 dark-50">
                          {m.primary["Customer Name"] || m.primary["Phone Number"]}{" "}
                          · {m.orders.length} orders → 1
                        </span>
                      </span>
                      <span
                        className="cursor-pointer"
                        onClick={() => {
                          if (merging) return;
                          setMergeGroup(null);
                          setMergeStatusDrafts({});
                        }}
                      >
                        <X size={16} />
                      </span>
                    </div>

                    <div className="merge-orders-list">
                      {m.orders.map((o) => {
                        const oBooks = o.parsedBooks || [];
                        const oTotal =
                          parseFloat(o["Total Amount"]) ||
                          o.revenue ||
                          oBooks.reduce((s, b) => s + (b.total || 0), 0);
                        const oCOD = /cash|cod/i.test(
                          o["Payment Type"] || "",
                        );
                        return (
                          <div className="merge-oc" key={o["Order ID"]}>
                            <div className="merge-oc-head">
                              <span className="merge-oc-id">
                                {o["Order ID"]}
                              </span>
                              <span
                                className={`merge-oc-pay ${oCOD ? "cod" : "upi"}`}
                              >
                                {oCOD ? "COD" : "Prepaid"}
                              </span>
                              <span className="merge-oc-total">₹{oTotal}</span>
                            </div>
                            <div className="merge-oc-status-row">
                              <span className="merge-oc-status-label">
                                Status
                              </span>
                              <select
                                className="bulk-wa-select merge-oc-status"
                                value={
                                  mergeStatusDrafts[o["Order ID"]] ??
                                  o.status ??
                                  o["Order Status"] ??
                                  "Processing"
                                }
                                title="Change & save this order's status"
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const oid = o["Order ID"];
                                  setMergeStatusDrafts((p) => ({
                                    ...p,
                                    [oid]: val,
                                  }));
                                  patchLocalOrder(oid, {
                                    "Order Status": val,
                                    status: val,
                                  });
                                  updateOrderRow(oid, {
                                    "Order Status": val,
                                  }).then(() => setTimeout(fetchOrders, 1300));
                                }}
                              >
                                {TRACK_STATUS_OPTIONS.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="merge-oc-books">
                              {oBooks.map((b, i) => {
                                const img = getBookImage(b.name);
                                return (
                                  <div className="merge-oc-book" key={i}>
                                    {img ? (
                                      <img src={img} alt="" loading="lazy" />
                                    ) : (
                                      <span className="merge-oc-ph">
                                        <Package size={12} />
                                      </span>
                                    )}
                                    <span className="merge-oc-bname">
                                      {b.name}
                                    </span>
                                    <span className="merge-oc-bqty">
                                      ×{b.quantity}
                                    </span>
                                    <span className="merge-oc-btotal">
                                      ₹{b.total}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="merge-totals">
                      <div className="merge-total-row">
                        <span>Combined subtotal ({m.books.length} titles)</span>
                        <span>₹{m.subtotal}</span>
                      </div>
                      <div className="merge-total-row">
                        <span>Delivery / handling</span>
                        <span>
                          {m.deliveryCharge === 0
                            ? "FREE"
                            : `₹${m.deliveryCharge}`}
                        </span>
                      </div>
                      {m.isCOD && (
                        <div className="merge-total-row">
                          <span>COD handling</span>
                          <span>₹{m.codFee}</span>
                        </div>
                      )}
                      <div className="merge-total-row merge-grand">
                        <span>
                          Total {m.isCOD ? "(COD)" : "(Prepaid)"}
                        </span>
                        <span>₹{m.total}</span>
                      </div>
                    </div>

                    <p className="merge-note">
                      A new merged order will be created and the{" "}
                      {m.orders.length} original orders will be marked
                      Cancelled.
                    </p>

                    <button
                      type="button"
                      className="pri-big-btn width100"
                      disabled={merging}
                      onClick={performMerge}
                    >
                      {merging ? (
                        <>
                          <RefreshCw size={15} className="cr-spin" /> Merging…
                        </>
                      ) : (
                        <>
                          <Package size={15} /> Merge into one order · ₹
                          {m.total}
                        </>
                      )}
                    </button>
                  </>
                );
              })()}
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
                        {t.note || (t.type === "income" ? "Income" : "Expense")}
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
                            {formatDate(o["Timestamp(D)"] || o["Timestamp"])}
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
                    No new orders since your last visit
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
            // Books not yet picked (checked) offer an out-of-stock hold message
            const dUnpicked = dbooks.filter(
              (_b, i) => !pickChecked[bookKey(oid, i)],
            );
            const dCustName = order["Customer Name"]
              ? String(order["Customer Name"]).trim()
              : "there";
            const oosMany = dUnpicked.length > 1;
            const oosMessage =
              `Hi ${dCustName}, this is TheBookX \n\n` +
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
              } reserved for you. \n\n` +
              `Thank you for your patience! \n\n` +
              ` View your order anytime: ${PROFILE_URL}\n— Team TheBookX `;
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
                            Out of stock ({dUnpicked.length}) · hold
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
                        <span>{cleanDeliveryType(order["Delivery Type"])}</span>
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
