"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Calendar,
  MapPin,
  Phone,
  IndianRupee,
  MessageCircle,
  Copy,
  Download,
  X,
  CreditCard,
  Gift,
  User,
  LogOut,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  BadgeCheck,
  Check,
  Zap,
  MessageSquare,
  RefreshCw,
  Notebook,
  XCircle,
  CalendarClock,
  AlertTriangle,
  Wallet,
  ClipboardPaste,
  Star,
  Users,
  Share2,
  FileText,
  ShieldCheck,
  Pencil,
  Home,
} from "lucide-react";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";
import PageHeader from "@/components/UI/PageHeader";
import InstallAppBar from "@/components/InstallAppBar";
import RecommendationModal from "@/components/RecommendationModal";
import ProfileQuickReads from "@/components/quickreads/ProfileQuickReads";
import { getVerifiedBookIdsForPhone } from "@/lib/quickreads";
import { books as ALL_BOOKS } from "@/utils/book";

// Match an order-item name to its book cover (order items come from the sheet,
// so names may vary slightly — try exact then partial match).
const normName = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
const BOOK_IMAGE_BY_NAME = {};
ALL_BOOKS.forEach((b) => {
  if (b.image) BOOK_IMAGE_BY_NAME[normName(b.name)] = b.image;
});
function getBookImage(name) {
  const n = normName(name);
  if (!n) return null;
  if (BOOK_IMAGE_BY_NAME[n]) return BOOK_IMAGE_BY_NAME[n];
  const key = Object.keys(BOOK_IMAGE_BY_NAME).find(
    (k) => k.includes(n) || n.includes(k),
  );
  return key ? BOOK_IMAGE_BY_NAME[key] : null;
}

const SHEET_ID = "1ovqFn50d0TKjV0nm4q1lb3N9XvimUgIsHCOlHh6QRdg";
const SUPPORT_WHATSAPP = "917710892108";

// Capitalise the first letter of every word in a name (e.g. "jnjnjn kumar" →
// "Jnjnjn Kumar"), leaving the rest of each word untouched.
const capName = (str) =>
  String(str || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
// Apps Script web app that edits order rows in place (same endpoint the
// manage-orders dashboard uses). Lets a customer's address edit save straight
// to their order row.
const SHEET_EDIT_API_URL =
  "https://script.google.com/macros/s/AKfycbzYyEYufYZBP4pV-sJvgTvTBrcIb3iNUH3BgDD31zCL9xiULoKWnATFfad2awNMgvyC/exec";

// =====================================================================
// Module-level date parser, handles every format the Google Sheet emits
// =====================================================================
// The "Timestamp" / "Timestamp (D)" columns can hold any of:
// "20/05/2026 23:14:14" (dd/mm/yyyy, 24-hour, NO am/pm, NO comma)
// "20/05/2026, 23:14:12" (dd/mm/yyyy, 24-hour, with comma)
// "27/05/2026, 04:50:03 pm" (dd/mm/yyyy, 12-hour with am/pm)
// "Date(2026,4,27,16,50,3)" (Google Sheets serialized, months 0-based)
// Date object instances (some gviz responses)
// ISO strings (fallback)
function parseSheetDate(input) {
  if (!input) return null;
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  const str = String(input).trim();
  if (!str) return null;

  // Google Sheets Date() literal, months ALREADY 0-based
  if (str.startsWith("Date(")) {
    const m = str.match(/Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?/);
    if (m) {
      const d = new Date(
        parseInt(m[1], 10),
        parseInt(m[2], 10),
        parseInt(m[3], 10),
        m[4] ? parseInt(m[4], 10) : 0,
        m[5] ? parseInt(m[5], 10) : 0,
        m[6] ? parseInt(m[6], 10) : 0,
      );
      if (!isNaN(d.getTime())) return d;
    }
  }

  // dd/mm/yyyy [optional HH:mm:ss [am/pm]]
  // [,\s]+ matches " ", ", ", ",", handles all separators
  if (str.includes("/")) {
    const m = str.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?)?/i,
    );
    if (m) {
      const day = parseInt(m[1], 10);
      const month = parseInt(m[2], 10) - 1; // dd/mm/yyyy 0-based for JS
      const year = parseInt(m[3], 10);
      let hours = m[4] ? parseInt(m[4], 10) : 0;
      const minutes = m[5] ? parseInt(m[5], 10) : 0;
      const seconds = m[6] ? parseInt(m[6], 10) : 0;
      const meridiem = (m[7] || "").toLowerCase();

      if (meridiem === "pm" && hours < 12) hours += 12;
      if (meridiem === "am" && hours === 12) hours = 0;

      const d = new Date(year, month, day, hours, minutes, seconds);
      if (!isNaN(d.getTime())) return d;
    }
  }

  // ISO / fallback
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

// Order date lookup, sheet column header has a SPACE: "Timestamp (D)"
function getOrderDateValue(order) {
  return (
    order["Timestamp (D)"] ||
    order["Timestamp"] ||
    order["Timestamp(D)"] ||
    order["Order Date"] ||
    null
  );
}

// ===== Order Tracking Timeline =====
function OrderTrackingTimeline({ order }) {
  const statusLower = (order.status || "").toLowerCase();

  let activeStage = 0;
  if (statusLower.includes("delivered")) {
    activeStage = 3;
  } else if (statusLower.includes("out for delivery")) {
    activeStage = 2;
  } else if (
    statusLower.includes("shipped") ||
    statusLower.includes("in transit")
  ) {
    activeStage = 1;
  }

  const orderDate = parseSheetDate(getOrderDateValue(order));

  const DAY_MS = 24 * 60 * 60 * 1000;
  const minDeliveryDate = orderDate
    ? new Date(orderDate.getTime() + 3 * DAY_MS)
    : null;
  const maxDeliveryDate = orderDate
    ? new Date(orderDate.getTime() + 15 * DAY_MS)
    : null;
  const estimatedDelivery = orderDate
    ? new Date(orderDate.getTime() + 9 * DAY_MS)
    : null;

  const shortDate = (d) => {
    if (!d) return "Pending";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const longDate = (d) => {
    if (!d) return "Pending";
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  const deliveryRangeLabel = (() => {
    if (!minDeliveryDate || !maxDeliveryDate) return "Pending";
    return `${shortDate(minDeliveryDate)}-${shortDate(maxDeliveryDate)}`;
  })();

  const orderedDate = orderDate ? shortDate(orderDate) : "Pending";
  const shippedDate =
    activeStage >= 1
      ? shortDate(orderDate ? new Date(orderDate.getTime() + 1 * DAY_MS) : null)
      : "Soon";
  const outForDeliveryDate =
    activeStage >= 2
      ? shortDate(estimatedDelivery)
      : estimatedDelivery
        ? shortDate(estimatedDelivery)
        : "Pending";
  const deliveredDate =
    activeStage >= 3
      ? shortDate(new Date())
      : estimatedDelivery
        ? shortDate(estimatedDelivery)
        : "Pending";

  const steps = [
    { key: "ordered", label: "Ordered", date: orderedDate },
    { key: "shipped", label: "Shipped", date: shippedDate },
    {
      key: "out_for_delivery",
      label: "Out for Delivery",
      date: outForDeliveryDate,
    },
    { key: "delivered", label: "Delivery", date: deliveredDate },
  ];

  const city = (order.City || "").toLowerCase();
  const bannerText = city.includes("mumbai")
    ? "95% orders delivered early in Mumbai"
    : `Most orders delivered on time across India`;

  const tooltipStage = activeStage < 3 ? activeStage + 1 : null;
  const tooltipLabel =
    tooltipStage === 1
      ? "Shipping Soon!"
      : tooltipStage === 2
        ? "Out for Delivery Soon!"
        : tooltipStage === 3
          ? "Arriving Soon!"
          : null;

  return (
    <div className="tracking-timeline-card">
      <div className="tracking-header">
        <div className="tracking-header-icon">
          <span className="tracking-package-icon" aria-hidden="true">
            🚚
          </span>
          <CheckCircle size={16} className="tracking-check-icon" />
        </div>
        <div className="tracking-header-text">
          <span className="tracking-title">
            {activeStage === 3 ? "Delivered" : "Order Placed"}
          </span>
          <span className="tracking-subtitle">
            {activeStage === 3 ? (
              <>Your order has been delivered</>
            ) : (
              <>
                Delivery expected{" "}
                <strong className="tracking-eta">{deliveryRangeLabel}</strong>
              </>
            )}
          </span>
        </div>
      </div>

      <div className="tracking-stepper">
        {tooltipLabel && tooltipStage !== null && (
          <div
            className="tracking-tooltip"
            style={{
              left: `${((tooltipStage + 0.5) / steps.length) * 100}%`,
            }}
          >
            <div className="tracking-tooltip-content">
              <span className="tracking-tooltip-dot" />
              <span>{tooltipLabel}</span>
            </div>
            <div className="tracking-tooltip-arrow" />
          </div>
        )}

        <div className="tracking-track">
          <div
            className="tracking-track-filled"
            style={{
              width: `${(activeStage / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        <div className="tracking-steps-row">
          {steps.map((step, idx) => {
            const isComplete = idx <= activeStage;
            const isTruckPosition = idx === tooltipStage;
            return (
              <div key={step.key} className="tracking-step">
                <div
                  className={`tracking-step-dot ${isComplete ? "complete" : ""} ${isTruckPosition ? "active-truck" : ""}`}
                >
                  {isTruckPosition ? (
                    <Truck size={14} className="tracking-truck-icon" />
                  ) : (
                    <Check
                      size={12}
                      className="tracking-step-check"
                      strokeWidth={3}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="tracking-labels-row">
          {steps.map((step, idx) => {
            const isComplete = idx <= activeStage;
            return (
              <div key={step.key} className="tracking-label-col">
                <span
                  className={`tracking-step-label ${isComplete ? "complete" : ""}`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="tracking-banner">
        <Zap size={14} className="tracking-banner-icon" />
        <span className="tracking-banner-text">{bannerText}</span>
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [qrUnlocked, setQrUnlocked] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);
  const [canVerify, setCanVerify] = useState(false);
  const [verifyTimer, setVerifyTimer] = useState(30);
  const [showPhoneInput, setShowPhoneInput] = useState(true);
  const [verifying, setVerifying] = useState(false); // 3s "verifying number" screen
  const [ordersOpen, setOrdersOpen] = useState(false); // orders history accordion
  const [showSupport, setShowSupport] = useState(false); // support templates sheet
  // ── Edit-profile modal (name / number / addresses) ──
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [epName, setEpName] = useState("");
  const [epPhone, setEpPhone] = useState("");
  const [epAddrOpen, setEpAddrOpen] = useState(false); // show all addresses
  const [epEditId, setEpEditId] = useState(null); // orderId whose address is editing
  const [epDraft, setEpDraft] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [epPrimaryId, setEpPrimaryId] = useState("");
  const [epSaving, setEpSaving] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [savedPhones, setSavedPhones] = useState([]);
  // Which order cards are expanded (Amazon/Flipkart-style collapsed by default)
  const [expandedOrders, setExpandedOrders] = useState({});
  // Track-shipment slide-up modal — holds the order being tracked (or null).
  const [trackOrder, setTrackOrder] = useState(null);
  const [trackCopied, setTrackCopied] = useState(false);
  const toggleOrder = (key) =>
    setExpandedOrders((p) => ({ ...p, [key]: !p[key] }));

  // Track button on the collapsed card — opens India Post tracking with the
  // Shipping ID copied; if not dispatched yet, expands the card's timeline so
  // customers see status here instead of asking on WhatsApp.
  const handleTrackOrder = (order, key) => {
    const sid = String(order["Shipping ID"] || order.shippingId || "").trim();
    if (sid) {
      try {
        navigator.clipboard.writeText(sid);
      } catch (_) {}
      window.open(
        "https://www.indiapost.gov.in/",
        "_blank",
        "noopener,noreferrer",
      );
    } else if (!expandedOrders[key]) {
      toggleOrder(key);
    }
  };

  // ----- NEW state for cancel + reschedule -----
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleOrder, setRescheduleOrder] = useState(null);
  // "Enquire about this order" — order whose enquiry chooser is open.
  const [enquireOrder, setEnquireOrder] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleNote, setRescheduleNote] = useState("");
  // ===== Edit-address bottom sheet =====
  const [showAddressEditModal, setShowAddressEditModal] = useState(false);
  const [addressEditOrder, setAddressEditOrder] = useState(null);
  const [addrEdit, setAddrEdit] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    locationLink: "",
  });
  const [addrLocating, setAddrLocating] = useState(false);

  // Pin current location inside the Edit-address modal (manual only — never
  // auto-prompts). Captures a Google Maps link into addrEdit.locationLink.
  const pinEditLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      alert("Location isn't supported on this device.");
      return;
    }
    setAddrLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setAddrEdit((p) => ({
          ...p,
          locationLink: `https://maps.google.com/?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`,
        }));
        setAddrLocating(false);
      },
      () => {
        setAddrLocating(false);
        alert("Couldn't get your location. Please allow permission and retry.");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
  };

  const UPI_ID = "7977960242-1@okbizaxis";

  // Tomorrow as YYYY-MM-DD for the date picker minimum
  const tomorrowISO = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();

  useEffect(() => {
    const savedPhone = localStorage.getItem("track_orders_phone");
    const savedName = localStorage.getItem("track_orders_name");
    try {
      const list = JSON.parse(
        localStorage.getItem("track_orders_saved_phones") || "[]",
      );
      if (Array.isArray(list)) setSavedPhones(list);
    } catch (_) {}
    if (savedPhone) {
      setPhoneNumber(savedPhone);
      if (savedName) setCustomerName(savedName);
      fetchOrders(savedPhone);
      setShowPhoneInput(false);
    }
  }, []);

  // Cache the shopper's ordered books so the Reading Tracker can import them.
  useEffect(() => {
    if (!orders || !orders.length) return;
    try {
      const byName = new Map();
      orders.forEach((o) =>
        (o.parsedBooks || []).forEach((b) => {
          const key = String(b.name || "").trim();
          if (!key || byName.has(key)) return;
          const match = ALL_BOOKS.find(
            (x) => x.name.toLowerCase() === key.toLowerCase(),
          );
          byName.set(key, {
            id:
              match?.id ||
              `ordered_${key.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
            name: key,
            author: match?.author || "",
            image: match?.image || "/default-book.jpg",
            pages: match?.pages || 200,
          });
        }),
      );
      localStorage.setItem(
        "user_ordered_books",
        JSON.stringify([...byName.values()]),
      );
    } catch {}
  }, [orders]);

  // Persist a phone number to the saved list (most-recent first, max 5)
  const savePhoneNumber = (num) => {
    if (!num || num.length !== 10) return;
    setSavedPhones((prev) => {
      const next = [num, ...prev.filter((p) => p !== num)].slice(0, 5);
      localStorage.setItem("track_orders_saved_phones", JSON.stringify(next));
      return next;
    });
  };

  const removeSavedPhone = (num) => {
    setSavedPhones((prev) => {
      const next = prev.filter((p) => p !== num);
      localStorage.setItem("track_orders_saved_phones", JSON.stringify(next));
      return next;
    });
  };

  const useSavedPhone = (num) => {
    setPhoneNumber(num);
    fetchOrders(num);
  };

  // Strip spaces / +91 / any non-digits from a pasted/typed value and keep the
  // last 10 digits, e.g. "+91 98989 89898" -> "9898989898".
  const normalizePhone = (raw) => {
    let d = (raw || "").replace(/\D/g, "");
    if (d.length > 10) d = d.slice(-10);
    return d;
  };

  const handlePasteClick = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const n = normalizePhone(text);
      if (n) {
        setPhoneNumber(n);
        setError("");
      }
    } catch (_) {
      setError("Couldn't read clipboard. Please paste manually.");
    }
  };

  // Render + download a PNG invoice for an order (canvas, no dependencies).
  const downloadInvoice = (order) => {
    const items = order.parsedBooks || [];
    const sub = items.reduce(
      (s, b) => s + (b.total || b.price * b.quantity || 0),
      0,
    );
    const grand = parseFloat(order["Total Amount"]) || sub;
    const isFree = (order["Delivery Type"] || "")
      .toLowerCase()
      .includes("free");
    let deliveryFee = parseFloat(order["Delivery Charge"]) || 0;
    const giftFee =
      order["Gift Wrap"] === "Yes"
        ? parseFloat(order["Gift Wrap Charge"]) || 0
        : 0;
    const isCODOrder = (order["Payment Type"] || "").includes(
      "Cash on Delivery",
    );
    let codFee = 0;
    let discount = 0;
    const extra = grand - sub - deliveryFee - giftFee;
    if (extra > 0) {
      if (isCODOrder) codFee = extra;
      else deliveryFee += extra;
    } else if (extra < 0) {
      discount = -extra;
    }
    const freeDelivery = isFree || deliveryFee === 0;
    // When a handling/care fee is charged, label the line "Handling & Care"
    // rather than "Delivery" (delivery itself is free above ₹199).
    const isHandlingFee = /handling/i.test(order["Delivery Type"] || "");
    const deliveryLineLabel =
      !freeDelivery && isHandlingFee ? "Handling & Care" : "Delivery";

    const W = 700;
    const P = 44;
    const rowH = 32;
    const scale = 2;
    const summaryCount =
      (sub > 0 ? 1 : 0) +
      1 +
      (giftFee > 0 ? 1 : 0) +
      (codFee > 0 ? 1 : 0) +
      (discount > 0 ? 1 : 0);
    const H = 300 + items.length * rowH + summaryCount * 26 + 70 + 70;

    const canvas = document.createElement("canvas");
    canvas.width = W * scale;
    canvas.height = H * scale;
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);
    ctx.textBaseline = "alphabetic";

    // background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    let y = P + 10;
    ctx.fillStyle = "#fb8500";
    ctx.font = "700 30px Arial";
    ctx.fillText("TheBookX", P, y);
    y += 26;
    ctx.fillStyle = "#888888";
    ctx.font = "13px Arial";
    ctx.fillText(`Invoice · Order ${order["Order ID"] || ""}`, P, y);
    y += 18;
    ctx.fillText(`${order["Timestamp"] || ""}`, P, y);
    y += 18;
    ctx.fillText(
      `${customerName || ""} · ${phoneNumber || order["Phone"] || ""}`,
      P,
      y,
    );
    y += 18;
    const addr = `${order["Address"] || ""}, ${order["City"] || ""} ${order["Pincode"] || ""}`;
    ctx.fillText(addr.slice(0, 84), P, y);
    y += 26;

    // table head
    ctx.strokeStyle = "#eeeeee";
    ctx.beginPath();
    ctx.moveTo(P, y);
    ctx.lineTo(W - P, y);
    ctx.stroke();
    y += 22;
    ctx.fillStyle = "#888888";
    ctx.font = "700 11px Arial";
    ctx.fillText("ITEM", P, y);
    ctx.textAlign = "right";
    ctx.fillText("AMOUNT", W - P, y);
    ctx.textAlign = "left";
    y += 8;
    ctx.beginPath();
    ctx.moveTo(P, y);
    ctx.lineTo(W - P, y);
    ctx.stroke();

    // item rows
    items.forEach((b) => {
      y += rowH;
      ctx.fillStyle = "#0a0a0a";
      ctx.font = "600 14px Arial";
      ctx.fillText(`${b.name} × ${b.quantity}`.slice(0, 50), P, y - 9);
      ctx.textAlign = "right";
      ctx.font = "700 14px Arial";
      ctx.fillText(`₹${b.total || b.price * b.quantity || 0}`, W - P, y - 9);
      ctx.textAlign = "left";
      ctx.strokeStyle = "#f2f2f2";
      ctx.beginPath();
      ctx.moveTo(P, y);
      ctx.lineTo(W - P, y);
      ctx.stroke();
    });

    // summary
    const sumLine = (label, val, color) => {
      y += 26;
      ctx.fillStyle = "#666666";
      ctx.font = "13px Arial";
      ctx.fillText(label, P, y);
      ctx.textAlign = "right";
      ctx.fillStyle = color || "#0a0a0a";
      ctx.font = "600 13px Arial";
      ctx.fillText(val, W - P, y);
      ctx.textAlign = "left";
    };
    y += 8;
    if (sub > 0) sumLine(`Subtotal (${items.length} items)`, `₹${sub}`);
    sumLine(
      deliveryLineLabel,
      freeDelivery ? "FREE" : `+₹${deliveryFee}`,
      freeDelivery ? "#008f0c" : "#0a0a0a",
    );
    if (giftFee > 0) sumLine("Gift wrapping", `+₹${giftFee}`);
    if (codFee > 0) sumLine("COD handling fee", `+₹${codFee}`);
    if (discount > 0) sumLine("Discount", `−₹${discount}`, "#008f0c");

    // total
    y += 18;
    ctx.strokeStyle = "#cccccc";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(P, y);
    ctx.lineTo(W - P, y);
    ctx.stroke();
    ctx.setLineDash([]);
    y += 28;
    ctx.fillStyle = "#0a0a0a";
    ctx.font = "700 17px Arial";
    ctx.fillText("Total paid", P, y);
    ctx.textAlign = "right";
    ctx.fillText(`₹${grand}`, W - P, y);
    ctx.textAlign = "left";

    // footer
    y += 36;
    ctx.fillStyle = "#888888";
    ctx.font = "12px Arial";
    ctx.fillText(
      `Payment: ${order["Payment Type"] || ""} · Delivery: ${order["Delivery Type"] || ""}`,
      P,
      y,
    );
    y += 20;
    ctx.fillText("Thank you for shopping with TheBookX.", P, y);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `TheBookX-Invoice-${order["Order ID"] || "order"}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

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

  const fetchOrders = async (phone = phoneNumber) => {
    if (!phone || phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    // Remember every submitted number (chip), regardless of result.
    savePhoneNumber(phone);
    setLoading(true);
    setVerifying(true); // show the verifying-number splash for the whole fetch
    setError("");
    setSearched(true);
    try {
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const text = await response.text();
      const jsonString = text.substring(47, text.length - 2);
      const data = JSON.parse(jsonString);
      if (!data.table || !data.table.rows) {
        setError("No data found in sheet.");
        setLoading(false);
        return;
      }
      const rows = data.table.rows;
      const headers = data.table.cols.map((col) => col.label);
      const allOrders = rows.map((row) => {
        const order = {};
        row.c.forEach((cell, idx) => {
          const header = headers[idx];
          let value = cell?.v;
          const formatted = cell?.f;
          if (
            value &&
            typeof value === "object" &&
            value.hasOwnProperty("value")
          ) {
            value = value.value;
          }
          if (
            formatted &&
            typeof value === "string" &&
            value.startsWith("Date(")
          ) {
            value = formatted;
          }
          order[header] = value;
        });
        return order;
      });

      const userOrders = allOrders.filter((order) => {
        const orderPhone = order["Phone Number"];
        // Hide "(unconfirmed)" drop-off rows from the customer's history —
        // only orders the customer actually confirmed should appear.
        const isUnconfirmed = /\(unconfirmed\)/i.test(
          order["Customer Name"] || "",
        );
        // Only UPI and COD orders belong in the profile — WhatsApp-button
        // orders are handled over chat and must not show here.
        const isWhatsApp = /whatsapp/i.test(order["Payment Type"] || "");
        return (
          !isUnconfirmed &&
          !isWhatsApp &&
          String(orderPhone).trim() === String(phone).trim()
        );
      });

      // Sort newest-first using the proper sheet date parser
      const sortedOrders = userOrders.sort((a, b) => {
        const dateA = parseSheetDate(getOrderDateValue(a)) || new Date(0);
        const dateB = parseSheetDate(getOrderDateValue(b)) || new Date(0);
        return dateB - dateA;
      });

      // Name from the newest order with one on record (re-login safe: always
      // refresh so a blank "Customer" card never lingers after logout).
      const freshName =
        (sortedOrders.find((o) => (o["Customer Name"] || "").trim()) || {})[
          "Customer Name"
        ] || "";
      if (freshName) {
        setCustomerName(freshName);
        try {
          localStorage.setItem("track_orders_name", freshName);
        } catch {}
      }

      const parsedOrders = sortedOrders.map((order) => {
        return {
          ...order,
          parsedBooks: parseBooksList(order["Books List"]),
          status: order["Order Status"] || "Pending",
          shippingId: order["Shipping ID"] || "",
          advancePaid: order["Advance Paid"] || "No",
          comment: order["Comment for this order"] || order["Comment"] || "",
        };
      });
      // Wallet balance = SUM of all "Wallet" ledger entries for this phone
      // (rewards positive, wallet spent on orders negative). Never below 0.
      const walletValue = Math.max(
        0,
        Math.round(
          parsedOrders.reduce((sum, order) => {
            const w = parseFloat(order["Wallet"] ?? order["wallet"] ?? 0);
            return isNaN(w) ? sum : sum + w;
          }, 0),
        ),
      );
      setWalletBalance(walletValue);

      // Only show genuine orders in the list. Wallet-only reward rows (pushed
      // with just phone + wallet + timestamp) have no order id / books / total,
      // so they must not appear as an order card.
      const isRealOrder = (o) => {
        const hasId = String(o["Order ID"] || "").trim() !== "";
        const hasBooks = (o.parsedBooks || []).length > 0;
        const total = parseFloat(o["Total Amount"] ?? 0);
        return hasId || hasBooks || (!isNaN(total) && total > 0);
      };
      const realOrders = parsedOrders.filter(isRealOrder);

      setOrders(realOrders);

      // A number may have QuickReads but no physical book orders — treat that
      // as a valid "profile" too (show only QuickReads in that case).
      let qrCount = 0;
      try {
        const qrIds = await getVerifiedBookIdsForPhone(phone);
        qrCount = qrIds.length;
      } catch (_) {}

      if (realOrders.length === 0 && qrCount === 0 && walletValue <= 0) {
        setError(`No profile found for phone number ${phone}`);
      } else {
        setShowPhoneInput(false);
        localStorage.setItem("track_orders_phone", phone);
        savePhoneNumber(phone);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(`Unable to fetch orders. Please try again later.`);
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  const handleNewSearch = () => {
    setShowPhoneInput(true);
    setPhoneNumber("");
    setOrders([]);
    setSearched(false);
    setError("");
    setCustomerName("");
    setWalletBalance(0);
    localStorage.removeItem("track_orders_phone");
    localStorage.removeItem("track_orders_name");
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

  const handleTrackPackage = (shippingId) => {
    if (shippingId) {
      navigator.clipboard.writeText(shippingId);
      alert(`Tracking ID ${shippingId} copied to clipboard!`);
      window.open("https://www.indiapost.gov.in", "_blank");
    }
  };

  const handlePayNow = (order) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
    setQrUnlocked(false);
    setCanVerify(false);
    setVerifyTimer(30);
  };

  useEffect(() => {
    if (!qrUnlocked) return;
    setVerifyTimer(30);
    setCanVerify(false);
    const interval = setInterval(() => {
      setVerifyTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanVerify(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [qrUnlocked]);

  const getAmountToShow = (order) => {
    const total = parseFloat(order["Total Amount"]) || 0;
    const paymentType = order["Payment Type"] || "";
    const advancePaid = order.advancePaid === "Yes";
    if (paymentType.includes("Cash on Delivery")) {
      if (advancePaid) return Math.max(0, total - 99);
      return total;
    }
    return total;
  };

  const getRemainingAmount = (order) => {
    const total = parseFloat(order["Total Amount"]) || 0;
    const paymentType = order["Payment Type"] || "";
    const advancePaid = order.advancePaid === "Yes";
    if (paymentType.includes("Cash on Delivery") && advancePaid) {
      return total - 99;
    }
    return 0;
  };

  const getPaymentStatusMessage = (order) => {
    const paymentType = order["Payment Type"] || "";
    const advancePaid = order.advancePaid === "Yes";
    if (paymentType.includes("Cash on Delivery")) {
      if (advancePaid) {
        return {
          message: " Advance Paid (₹99)",
          type: "success",
          remaining: `₹${getRemainingAmount(order)} pending at delivery`,
        };
      }
      return {
        message: " Payment Pending",
        type: "warning",
        remaining: `Pay ₹${getAmountToShow(order)} at delivery`,
      };
    }
    return {
      message: " Payment Completed",
      type: "success",
      remaining: null,
    };
  };

  // ===== NEW, Cancel & Reschedule handlers =====

  const handleCancelOrder = (order) => {
    const ok = window.confirm(
      `Cancel order ${order["Order ID"]}? You'll be redirected to WhatsApp to confirm with our team.`,
    );
    if (!ok) return;

    const itemsList = (order.parsedBooks || [])
      .map((b, i) => `${i + 1}. ${b.name} × ${b.quantity}`)
      .join("\n");

    const message = `Hi TheBookX

I'd like to *cancel* my order. Here are the details:

 *Order ID:* ${order["Order ID"]}
 *Name:* ${order["Customer Name"] || ""}
 *Phone:* ${order["Phone Number"] || ""}
 *Total Amount:* ₹${order["Total Amount"] || ""}
 *Payment:* ${order["Payment Type"] || ""}

 *Items:*
${itemsList || ""}

Please cancel this order. Thank you `;

    window.open(
      `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  // Open WhatsApp with a pre-filled enquiry about a specific order. The message
  // includes the order details + the order link (thebookx.in?orderID=…).
  const sendOrderEnquiry = (order, question) => {
    const oid = order["Order ID"] || "";
    const itemsList = (order.parsedBooks || [])
      .map((b, i) => `${i + 1}. ${b.name} × ${b.quantity || 1}`)
      .join("\n");
    const orderLink = oid
      ? `https://thebookx.in?orderID=${encodeURIComponent(oid)}`
      : "";
    const message = [
      "Hi TheBookX,",
      "",
      question,
      "",
      `*Order ID:* ${oid}`,
      `*Name:* ${order["Customer Name"] || ""}`,
      `*Phone:* ${order["Phone Number"] || ""}`,
      `*Total:* ₹${order["Total Amount"] || ""}`,
      itemsList ? `\n*Items:*\n${itemsList}` : "",
      orderLink ? `\n*Order details:* ${orderLink}` : "",
      "",
      "Thank you!",
    ]
      .filter((l) => l !== null && l !== undefined)
      .join("\n");
    window.open(
      `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
    setEnquireOrder(null);
  };

  const handleRescheduleClick = (order) => {
    setRescheduleOrder(order);
    setRescheduleDate("");
    setRescheduleTime("");
    setRescheduleNote("");
    setShowRescheduleModal(true);
  };

  const handleEditAddressClick = (order) => {
    setAddressEditOrder(order);
    // Split any existing "Pinned location: <url>" out of the saved address.
    const rawAddr = String(order["Address"] || "");
    const pinMatch = rawAddr.match(
      /(?:[,\s·]*)Pinned location:\s*(https?:\/\/\S+)/i,
    );
    const cleanAddr = rawAddr
      .replace(/(?:[,\s·]*)Pinned location:\s*https?:\/\/\S+/i, "")
      .replace(/(\s*,\s*){2,}/g, ", ")
      .replace(/^[\s,·]+|[\s,·]+$/g, "")
      .trim();
    setAddrEdit({
      name: order["Customer Name"] || customerName || "",
      phone: String(order["Phone Number"] || phoneNumber || ""),
      address: cleanAddr,
      city: order["City"] || "",
      state: order["State"] || "",
      pincode: String(order["Pincode"] || ""),
      locationLink: pinMatch ? pinMatch[1] : "",
    });
    setShowAddressEditModal(true);
  };

  const handleAddressEditSubmit = async () => {
    if (!addrEdit.address.trim() || !addrEdit.phone.trim()) {
      alert("Please fill in at least the address and phone number.");
      return;
    }
    const order = addressEditOrder;
    const orderId = order?.["Order ID"] || "";
    // Store the pinned map link inside the Address field so it travels with the
    // order (same convention used elsewhere).
    const fullAddress = addrEdit.locationLink
      ? `${addrEdit.address}, Pinned location: ${addrEdit.locationLink}`
      : addrEdit.address;

    // 1) Save the change to the customer's order row in the sheet.
    if (orderId) {
      const fields = {
        "Customer Name": addrEdit.name || "",
        "Phone Number": addrEdit.phone || "",
        Address: fullAddress,
        City: addrEdit.city || "",
        State: addrEdit.state || "",
        Pincode: addrEdit.pincode || "",
      };
      try {
        await fetch(SHEET_EDIT_API_URL, {
          method: "POST",
          mode: "no-cors",
          body: new URLSearchParams({
            action: "update",
            orderId,
            data: JSON.stringify(fields),
          }),
        });
        // Reflect it immediately in the profile list.
        setOrders((prev) =>
          prev.map((o) =>
            o["Order ID"] === orderId
              ? {
                  ...o,
                  "Customer Name": fields["Customer Name"],
                  "Phone Number": fields["Phone Number"],
                  Address: fields.Address,
                  City: fields.City,
                  State: fields.State,
                  Pincode: fields.Pincode,
                }
              : o,
          ),
        );
      } catch (e) {
        console.error("Address update failed:", e);
      }
    }

    // 2) Auto-redirect to WhatsApp so support knows the address changed.
    const lines = [
      "Hi TheBookX ",
      "",
      "I have *changed my delivery address* for my order.",
      "",
      ` *Order ID:* ${orderId}`,
      ` *Name:* ${addrEdit.name || ""}`,
      ` *Phone:* ${addrEdit.phone || ""}`,
      "",
      "* New Address*",
      ` ${addrEdit.address || ""}`,
      ` ${addrEdit.city || ""}${addrEdit.state ? `, ${addrEdit.state}` : ""}`,
      ` Pincode: ${addrEdit.pincode || ""}`,
      addrEdit.locationLink ? ` Pinned location: ${addrEdit.locationLink}` : "",
      "",
      "I've already updated it here — please confirm. Thank you ",
    ].filter((l) => l !== "");
    window.open(
      `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`,
      "_blank",
    );
    setShowAddressEditModal(false);
  };

  const handleRescheduleSubmit = () => {
    if (!rescheduleDate) {
      alert("Please pick a preferred dispatch date.");
      return;
    }
    const order = rescheduleOrder;
    if (!order) return;

    // Format date nicely, "Saturday, 14 June 2026"
    const formattedDate = new Date(rescheduleDate).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const lines = [
      "Hi TheBookX ",
      "",
      "I'd like to choose *when to ship* (dispatch) my order.",
      "",
      ` *Order ID:* ${order["Order ID"]}`,
      ` *Name:* ${order["Customer Name"] || ""}`,
      ` *Phone:* ${order["Phone Number"] || ""}`,
      "",
      ` *Preferred Date:* ${formattedDate}`,
    ];
    if (rescheduleTime) {
      lines.push(`⏰ *Preferred Time:* ${rescheduleTime}`);
    }
    if (rescheduleNote.trim()) {
      lines.push(` *Note:* ${rescheduleNote.trim()}`);
    }
    lines.push("", "Please dispatch my order accordingly. Thank you ");

    const message = lines.join("\n");

    window.open(
      `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`,
      "_blank",
    );

    setShowRescheduleModal(false);
  };

  // ===== Date formatting for the order card header =====
  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    const d = parseSheetDate(dateString);
    if (d) return formatDateToCustomString(d);
    // Last resort, show the raw string so the user sees *something*
    return String(dateString);
  };

  const formatDateToCustomString = (date) => {
    const day = date.getDate();
    const month = date.toLocaleString("en-IN", { month: "long" });
    const year = date.getFullYear();
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

  // Days since the shopper's most recent order prompt "what to read next"
  const lastOrderDate = (orders || []).reduce((latest, o) => {
    const d = parseSheetDate(getOrderDateValue(o));
    return d && (!latest || d > latest) ? d : latest;
  }, null);
  const daysSinceLastOrder = lastOrderDate
    ? Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const showReadNext =
    orders.length > 0 && daysSinceLastOrder !== null && daysSinceLastOrder > 10;

  // Three hero books shown in the Rapido-style login header.
  const heroBooks = [
    ALL_BOOKS.find((b) => /too good to be true/i.test(b.name)),
    ALL_BOOKS.find((b) => /art of clarity/i.test(b.name)),
    ALL_BOOKS.find((b) => /atomic habits/i.test(b.name)),
  ].filter((b) => b && b.image);

  // ── Edit-profile helpers ──
  const openEditProfile = () => {
    setEpName(customerName || "");
    setEpPhone(phoneNumber || "");
    setEpAddrOpen(false);
    setEpEditId(null);
    try {
      setEpPrimaryId(
        localStorage.getItem(`primary_addr_${phoneNumber}`) || "",
      );
    } catch {}
    setShowEditProfile(true);
  };

  // Unique delivery addresses from this shopper's orders (primary shown first).
  const profileAddresses = (() => {
    const seen = new Set();
    const list = [];
    (orders || []).forEach((o) => {
      const addr = String(o["Address"] || "")
        .replace(/,?\s*Pinned location:\s*https?:\/\/\S+/i, "")
        .trim();
      if (!addr) return;
      const key = `${addr}|${o["Pincode"] || ""}`.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      list.push({
        orderId: o["Order ID"],
        address: addr,
        city: o["City"] || "",
        state: o["State"] || "",
        pincode: String(o["Pincode"] || ""),
      });
    });
    if (epPrimaryId) {
      const i = list.findIndex((a) => a.orderId === epPrimaryId);
      if (i > 0) {
        const [p] = list.splice(i, 1);
        list.unshift(p);
      }
    }
    return list;
  })();

  const saveProfileBasics = () => {
    const nm = epName.trim();
    if (nm) {
      setCustomerName(nm);
      try {
        localStorage.setItem("track_orders_name", nm);
      } catch {}
    }
    const digits = String(epPhone).replace(/\D/g, "").slice(-10);
    setShowEditProfile(false);
    if (digits.length === 10 && digits !== phoneNumber) {
      setPhoneNumber(digits);
      fetchOrders(digits);
    }
  };

  const setPrimaryAddress = (orderId) => {
    setEpPrimaryId(orderId);
    try {
      localStorage.setItem(`primary_addr_${phoneNumber}`, orderId);
    } catch {}
  };

  const startEditAddress = (a) => {
    setEpEditId(a.orderId);
    setEpDraft({
      address: a.address,
      city: a.city,
      state: a.state,
      pincode: a.pincode,
    });
  };

  const saveAddressEdit = async () => {
    const orderId = epEditId;
    if (!orderId) return;
    setEpSaving(true);
    try {
      await fetch(SHEET_EDIT_API_URL, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams({
          action: "update",
          orderId,
          data: JSON.stringify({
            Address: epDraft.address,
            City: epDraft.city,
            State: epDraft.state,
            Pincode: epDraft.pincode,
          }),
        }),
      });
      setOrders((prev) =>
        prev.map((o) =>
          o["Order ID"] === orderId
            ? {
                ...o,
                Address: epDraft.address,
                City: epDraft.city,
                State: epDraft.state,
                Pincode: epDraft.pincode,
              }
            : o,
        ),
      );
      setEpEditId(null);
      setTimeout(() => fetchOrders(phoneNumber), 1300);
    } catch (e) {
      console.error("Address save failed:", e);
    } finally {
      setEpSaving(false);
    }
  };

  return (
    <div className="my-orders-page">
      {/* Verifying-number splash (3s) after a successful lookup */}
      {verifying && (
        <div className="verify-overlay">
          <div className="verify-box">
            <div className="verify-phone-ic">
              <Phone size={26} />
            </div>
            <div className="verify-spinner" />
            <h3 className="verify-title">Verifying your number</h3>
            <p className="verify-num">+91 {phoneNumber}</p>
            <span className="verify-sub">
              Fetching your orders and wallet…
            </span>
          </div>
        </div>
      )}

      <div className="section-680 flex flex-col gap-24">
        {/* Header */}
        <div className="orders-header profile-header-row">
          <PageHeader title="Profile" />
          {!showPhoneInput && (
            <button
              type="button"
              className="profile-support-btn"
              onClick={() => setShowSupport(true)}
              aria-label="Support"
            >
              <MessageCircle size={16} />
              Support
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {showPhoneInput ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="phone-search-section"
            >
              <div className="phone-card rapido-card">
                {/* Branded header — TheBookX + three 3D book covers */}
                <div className="rapido-hero">
                  <div className="rapido-brand">
                    <span className="rapido-logo">TheBookX</span>
                    <span className="rapido-brand-sub">
                      Books starting at ₹1
                    </span>
                  </div>
                  <div className="rapido-books" aria-hidden="true">
                    {heroBooks.map((b, i) => (
                      <div className={`rapido-book rb-${i}`} key={b.id || i}>
                        <img src={b.image} alt="" loading="lazy" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rapido-body">
                  <h2 className="phone-card-title">What&apos;s your number?</h2>
                  <p className="phone-card-sub">
                    Enter the mobile number you used at checkout to see your
                    orders and wallet.
                  </p>

                  <div className="phone-input-wrap rapido-input">
                    <span className="rapido-cc">+91</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      className="phone-card-input"
                      placeholder="10-digit mobile number"
                      value={phoneNumber}
                      onChange={(e) =>
                        setPhoneNumber(normalizePhone(e.target.value))
                      }
                      onKeyDown={(e) => e.key === "Enter" && fetchOrders()}
                    />
                    <button
                      type="button"
                      className="phone-paste"
                      onClick={handlePasteClick}
                      title="Paste from clipboard"
                      aria-label="Paste from clipboard"
                    >
                      <ClipboardPaste size={16} />
                    </button>
                  </div>

                  <button
                    className="pri-big-btn rapido-submit"
                    onClick={() => fetchOrders()}
                    disabled={loading || phoneNumber.length !== 10}
                  >
                    {loading ? "Searching..." : "Submit"}
                  </button>

                  {error && <p className="error-message">{error}</p>}

                {/* Saved numbers (localStorage) */}
                {savedPhones.length > 0 && (
                  <div className="phone-saved">
                    <span className="phone-saved-label">Saved numbers</span>
                    <div className="phone-saved-chips">
                      {savedPhones.map((num) => (
                        <span key={num} className="phone-chip">
                          <button
                            type="button"
                            className="phone-chip-use"
                            onClick={() => useSavedPhone(num)}
                            aria-label={`Use ${num}`}
                          >
                            <Phone size={12} />
                            {num}
                          </button>
                          <button
                            type="button"
                            className="phone-chip-remove"
                            onClick={() => removeSavedPhone(num)}
                            aria-label={`Remove ${num}`}
                          >
                            <X size={13} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* WhatsApp help */}
                <a
                  href="https://wa.me/917710892108?text=Hi%2C%20I%20need%20help%20with%20my%20order%20on%20TheBookX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="phone-card-help"
                >
                  <FaWhatsapp size={16} color="#25D366" />
                  Facing an issue? Chat with us
                </a>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="customer-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="customer-info-section"
            >
              <div className="customer-info-card">
                <div className="customer-info-content">
                  <div className="customer-avatar">
                    <User size={20} />
                  </div>
                  <div className="customer-details">
                    <span className="customer-label">Welcome back,</span>
                    <span className="customer-name">
                      {capName(customerName) || "Customer"}
                    </span>
                    <span className="customer-phone">{phoneNumber}</span>
                  </div>
                  <div className="flex flex-row gap-8 items-center">
                    <button
                      className="profile-refresh-btn"
                      onClick={() => fetchOrders(phoneNumber)}
                      disabled={loading}
                      aria-label="Refresh orders"
                      title="Refresh orders"
                    >
                      <RefreshCw
                        size={15}
                        className={loading ? "cr-spin" : ""}
                      />
                    </button>
                    <button
                      className="profile-refresh-btn"
                      onClick={openEditProfile}
                      aria-label="Edit profile"
                      title="Edit profile"
                    >
                      <Pencil size={15} />
                    </button>
                  </div>
                </div>

                {/* Wallet balance strip, only shown when balance > 0 */}
                {walletBalance > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                      marginTop: 12,
                      padding: "12px 14px",
                      background:
                        "linear-gradient(135deg, var(--tertiary-10, #fb850010) 0%, var(--tertiary-light-10, #ffb70310) 100%)",
                      border: "1px solid var(--tertiary, #fb8500)",
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <motion.div
                      animate={{
                        boxShadow: [
                          "0 2px 8px rgba(251, 133, 0, 0.25)",
                          "0 4px 14px rgba(251, 133, 0, 0.45)",
                          "0 2px 8px rgba(251, 133, 0, 0.25)",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{
                        flexShrink: 0,
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "var(--tertiary, #fb8500)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Wallet size={18} strokeWidth={2.4} />
                    </motion.div>

                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        minWidth: 0,
                      }}
                    >
                      <span
                        className="font-10 dark-50"
                        style={{ fontWeight: 600, letterSpacing: 0.2 }}
                      >
                        Wallet Balance
                      </span>
                      <span
                        className="weight-700"
                        style={{
                          fontSize: 18,
                          color: "var(--tertiary, #fb8500)",
                        }}
                      >
                        ₹{walletBalance}
                      </span>
                    </div>

                    <Link
                      href="/wallet"
                      className="font-11 weight-700"
                      style={{
                        flexShrink: 0,
                        textDecoration: "none",
                        color: "var(--tertiary, #fb8500)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      View wallet
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* QuickReads library — shown once a number is loaded (works even if
            the number has QuickReads but no physical book orders). */}
        {!showPhoneInput && phoneNumber?.length === 10 && (
          <ProfileQuickReads
            phone={phoneNumber}
            onName={(qrName) => {
              // If the order sheet had no name (QuickReads-only customer), greet
              // them with the name from the QuickReads sheet.
              if (qrName && (!customerName || customerName === "Customer")) {
                setCustomerName(qrName);
                try {
                  localStorage.setItem("track_orders_name", qrName);
                } catch {}
              }
            }}
          />
        )}


        {loading && (
          <div className="loading-state flex flex-col items-center justify-center">
            <div className="spinner"></div>
            Getting your order details
          </div>
        )}

        {error && !showPhoneInput && (
          <div className="error-state">
            <div className="error-icon"></div>
            <p>{error}</p>
            <button className="retry-btn" onClick={handleNewSearch}>
              Try Another Number
            </button>
          </div>
        )}

        {/* Install app — inline card just above the account menu */}
        {!showPhoneInput && !verifying && !loading && <InstallAppBar inline />}

        {/* ── Rapido-style account menu ── */}
        {!showPhoneInput && !verifying && !loading && (
          <div className="profile-menu">
        {/* Orders — collapsed behind an "Order status & history" toggle */}
        {searched && !loading && !error && orders.length === 0 && (
          <div className="orders-accordion">
            <div className="orders-empty">
              <span className="orders-empty-ic">
                <Package size={26} />
              </span>
              <strong>No orders yet</strong>
              <span className="orders-empty-sub">
                When you place an order it will show up here with live status,
                delivery estimate and tracking.
              </span>
            </div>
          </div>
        )}

        {searched && !loading && orders.length > 0 && (
          <div className="orders-accordion">
            <button
              type="button"
              className="orders-toggle"
              onClick={() => setOrdersOpen((v) => !v)}
            >
              <span className="ot-ic">
                <Package size={18} />
              </span>
              <span className="ot-label">Order status &amp; history</span>
              <span className="ot-count">{orders.length}</span>
              <ChevronDown
                size={20}
                className={`ot-chev${ordersOpen ? " open" : ""}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {ordersOpen && (
                <motion.div
                  key="orders-body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="flex flex-col gap-4 orders-list-inner">
                    {orders.map((order, idx) => {
              const amountToShow = getAmountToShow(order);
              const hasComment = order.comment && order.comment.trim() !== "";
              const isPending = (order.status || "")
                .toLowerCase()
                .includes("pending");

              // Collapsed summary bits (thumbnails + item count + total)
              const summaryItems = order.parsedBooks || [];
              const summaryTotal =
                parseFloat(order["Total Amount"]) ||
                summaryItems.reduce(
                  (s, b) => s + (b.total || b.price * b.quantity || 0),
                  0,
                );
              const summaryCovers = summaryItems
                .map((b) => getBookImage(b.name))
                .filter(Boolean)
                .slice(0, 3);
              const orderKey = order["Order ID"] || String(idx);
              const isExpanded = !!expandedOrders[orderKey];

              return (
                <div
                  key={idx}
                  className={`order-card${isExpanded ? " expanded" : ""}`}
                >
                  <button
                    type="button"
                    className="order-card-toggle"
                    onClick={() => toggleOrder(orderKey)}
                    aria-expanded={isExpanded}
                  >
                    <div className="order-card-header">
                      <div className="order-id-section">
                        <span className="order-id-label">Order ID</span>
                        <span className="order-id-value">
                          {order["Order ID"] || "—"}
                        </span>
                      </div>
                      <div className="order-date-section">
                        <Calendar size={14} />
                        <span className="time-full">
                          {formatDate(getOrderDateValue(order))}
                        </span>
                      </div>
                    </div>

                    {/* Collapsed key-details strip (Amazon/Flipkart style) */}
                    <div className="order-summary-strip">
                      <div className="oss-thumbs">
                        {summaryCovers.length > 0 ? (
                          summaryCovers.map((src, ci) => (
                            <Image
                              key={ci}
                              src={src}
                              alt=""
                              width={34}
                              height={46}
                              className="oss-thumb"
                            />
                          ))
                        ) : (
                          <span className="oss-thumb oss-thumb-ph" />
                        )}
                      </div>
                      <div className="oss-meta">
                        <span className="oss-count">
                          {summaryItems.length || 0}{" "}
                          {summaryItems.length === 1 ? "item" : "items"}
                          {order["Payment Type"]
                            ? ` · ${order["Payment Type"].replace("Payment", "").trim()}`
                            : ""}
                        </span>
                        <span className="oss-total">₹{summaryTotal}</span>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`oss-chevron${isExpanded ? " open" : ""}`}
                      />
                    </div>
                  </button>

                  {/* Always-visible status + track (so customers don't have to
                      ask on WhatsApp to know where their order is) */}
                  <div className="order-card-cta">
                    <div className="occ-status">
                      <span className="occ-status-lbl">Delivery status</span>
                      <span
                        className={`order-status-badge ${getStatusColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        <span>{order.status}</span>
                      </span>
                    </div>
                    {!/delivered/i.test(order.status || "") && (
                      <button
                        type="button"
                        className="order-track-btn"
                        onClick={() => {
                          setTrackCopied(false);
                          setTrackOrder(order);
                        }}
                      >
                        <Truck size={14} />
                        {order.shippingId ? "Track shipment" : "Track order"}
                      </button>
                    )}
                  </div>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key="body"
                        className="order-card-body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.32,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        style={{ overflow: "hidden" }}
                      >
                        <OrderTrackingTimeline order={order} />

                        {(() => {
                          const items = order.parsedBooks || [];
                          const sub = items.reduce(
                            (s, b) =>
                              s + (b.total || b.price * b.quantity || 0),
                            0,
                          );
                          const grand =
                            parseFloat(order["Total Amount"]) || sub;
                          const isFree = (order["Delivery Type"] || "")
                            .toLowerCase()
                            .includes("free");
                          const diff = grand - sub;
                          // Break the difference into delivery, gift wrap and COD fee
                          // using the stored columns; the leftover is inferred.
                          let deliveryFee =
                            parseFloat(order["Delivery Charge"]) || 0;
                          const giftFee =
                            order["Gift Wrap"] === "Yes"
                              ? parseFloat(order["Gift Wrap Charge"]) || 0
                              : 0;
                          const isCODOrder = (
                            order["Payment Type"] || ""
                          ).includes("Cash on Delivery");
                          let codFee = 0;
                          let discount = 0;
                          const extra = grand - sub - deliveryFee - giftFee;
                          if (extra > 0) {
                            if (isCODOrder) codFee = extra;
                            else deliveryFee += extra;
                          } else if (extra < 0) {
                            discount = -extra;
                          }
                          const freeDelivery = isFree || deliveryFee === 0;
                          const isHandlingFee = /handling/i.test(
                            order["Delivery Type"] || "",
                          );
                          const deliveryLineLabel =
                            !freeDelivery && isHandlingFee
                              ? "Handling & Care"
                              : "Delivery";
                          return (
                            <div className="order-invoice">
                              <div className="order-invoice-table">
                                <div className="oit-head">
                                  <span>Item</span>
                                  <span>Qty</span>
                                  <span>Price</span>
                                </div>
                                {items.length > 0 ? (
                                  items.map((b, bidx) => {
                                    const cover = getBookImage(b.name);
                                    return (
                                      <div key={bidx} className="oit-row">
                                        <span className="oit-name">
                                          {cover ? (
                                            <Image
                                              src={cover}
                                              alt={b.name}
                                              width={30}
                                              height={42}
                                              className="oit-img"
                                            />
                                          ) : (
                                            <span className="oit-img oit-img-ph" />
                                          )}
                                          <span className="oit-name-text">
                                            {b.name}
                                          </span>
                                        </span>
                                        <span className="oit-qty">
                                          ×{b.quantity}
                                        </span>
                                        <span className="oit-price">
                                          ₹
                                          {b.total || b.price * b.quantity || 0}
                                        </span>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="oit-row">
                                    <span className="oit-name">
                                      Books not listed
                                    </span>
                                    <span className="oit-qty" />
                                    <span className="oit-price" />
                                  </div>
                                )}
                              </div>

                              <div className="order-invoice-summary">
                                {sub > 0 && (
                                  <div className="ois-row">
                                    <span>Subtotal ({items.length} items)</span>
                                    <span>₹{sub}</span>
                                  </div>
                                )}
                                <div className="ois-row">
                                  <span>{deliveryLineLabel}</span>
                                  {freeDelivery ? (
                                    <span className="ois-free">FREE</span>
                                  ) : (
                                    <span>+₹{deliveryFee}</span>
                                  )}
                                </div>
                                {giftFee > 0 && (
                                  <div className="ois-row">
                                    <span>Gift wrapping</span>
                                    <span>+₹{giftFee}</span>
                                  </div>
                                )}
                                {codFee > 0 && (
                                  <div className="ois-row">
                                    <span>COD handling fee</span>
                                    <span>+₹{codFee}</span>
                                  </div>
                                )}
                                {discount > 0 && (
                                  <div className="ois-row">
                                    <span>Discount</span>
                                    <span className="ois-free">
                                      −₹{discount}
                                    </span>
                                  </div>
                                )}
                                <div className="ois-row ois-total">
                                  <span>Total paid</span>
                                  <span>₹{grand}</span>
                                </div>
                              </div>

                              <button
                                type="button"
                                className="invoice-download-btn"
                                onClick={() => downloadInvoice(order)}
                              >
                                <Download size={16} /> Download invoice
                              </button>
                            </div>
                          );
                        })()}

                        <div className="order-details-grid">
                          <div className="detail-item">
                            <IndianRupee size={14} className="gray-500" />
                            <div>
                              <span className="detail-label">Total Amount</span>
                              <span className="detail-value">
                                ₹{order["Total Amount"]}
                              </span>
                            </div>
                          </div>
                          <div className="detail-item">
                            <Package size={14} className="gray-500" />
                            <div>
                              <span className="detail-label">
                                Payment Method
                              </span>
                              <span className="detail-value">
                                {order["Payment Type"]}
                              </span>
                            </div>
                          </div>
                          <div className="detail-item">
                            <Truck size={14} className="gray-500" />
                            <div>
                              <span className="detail-label">Delivery</span>
                              <span className="detail-value">
                                {order["Delivery Type"]}
                              </span>
                            </div>
                          </div>
                          {hasComment && (
                            <div className="detail-item">
                              <Notebook size={14} className="gray-500" />
                              <div>
                                <span className="detail-label">
                                  Note from TheBookX
                                </span>
                                <span className="detail-value">
                                  {order.comment}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* ===== NEW, Cancel + Reschedule actions for Pending orders ===== */}
                        {isPending && (
                          <div
                            className="pending-actions-row"
                            style={{
                              display: "flex",
                              gap: 10,
                              marginTop: 12,
                              paddingTop: 12,
                              borderTop: "1px dashed var(--dark-10)",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(order)}
                              style={{
                                flex: 1,
                                padding: "10px 14px",
                                background: "transparent",
                                border: "1.5px solid var(--danger, #ef4444)",
                                color: "var(--danger, #ef4444)",
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                              }}
                            >
                              <XCircle size={14} />
                              Cancel Order
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRescheduleClick(order)}
                              style={{
                                flex: 1,
                                padding: "10px 14px",
                                background: "transparent",
                                border: "1.5px solid var(--tertiary, #fb8500)",
                                color: "var(--tertiary, #fb8500)",
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                              }}
                            >
                              <CalendarClock size={14} />
                              When to ship
                            </button>
                          </div>
                        )}

                        {/* Edit address — only before the parcel is on the
                        move (hidden once in transit / out for delivery /
                        delivered / cancelled). */}
                        {!/in\s*transit|out\s*for\s*delivery|delivered|cancel/i.test(
                          order["Order Status"] || order.status || "",
                        ) && (
                          <button
                            type="button"
                            className="edit-address-btn"
                            onClick={() => handleEditAddressClick(order)}
                          >
                            <MapPin size={13} />
                            Edit delivery address
                          </button>
                        )}

                        {/* Ask about this order — enquiry chooser */}
                        <button
                          type="button"
                          className="edit-address-btn order-enquire-btn-full"
                          onClick={() => setEnquireOrder(order)}
                        >
                          <MessageCircle size={13} />
                          Ask about this order
                        </button>

                        {order.shippingId && (
                          <div className="tracking-info-row">
                            <div className="tracking-id-display">
                              <span className="tracking-label">
                                Tracking ID:
                              </span>
                              <span className="tracking-id">
                                {order.shippingId}
                              </span>
                            </div>
                            <button
                              className="track-btn-small"
                              onClick={() =>
                                handleTrackPackage(order.shippingId)
                              }
                            >
                              Track Package
                            </button>
                          </div>
                        )}

                        {/* {order.advancePaid === "Yes" && (
                    <div className="advance-paid-badge">
                      <BadgeCheck size={12} />
                      <span>Advance payment of ₹99 completed</span>
                    </div>
                  )} */}

                        {order["Payment Type"]?.includes("Cash on Delivery") &&
                          !/delivered/i.test(String(order.status || "")) &&
                          order.advancePaid !== "Yes" && (
                            <div className="cod-action-row">
                              <div className="cod-amount-info">
                                <span className="cod-label">
                                  Pay ₹{amountToShow} now
                                </span>
                                <span className="cod-hint">
                                  or pay at delivery
                                </span>
                              </div>
                              <button
                                className="pay-now-btn-small"
                                onClick={() => handlePayNow(order)}
                              >
                                <CreditCard size={14} />
                                Pay Now
                              </button>
                            </div>
                          )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

            <Link href="/reading-tracker" className="pm-row">
              <span className="pm-ic">
                <Notebook size={18} />
              </span>
              <span className="pm-label">My reading tracker</span>
              <ChevronRight size={18} className="pm-arrow" />
            </Link>

            <a
              href="https://chat.whatsapp.com/Lk3okPbq21s8kJeoM3UA4c?mode=gi_t"
              target="_blank"
              rel="noopener noreferrer"
              className="pm-row"
            >
              <span className="pm-ic">
                <Users size={18} />
              </span>
              <span className="pm-label">Join community</span>
              <ChevronRight size={18} className="pm-arrow" />
            </a>

            <button
              type="button"
              className="pm-row"
              onClick={async () => {
                const shareData = {
                  title: "TheBookX",
                  text: "Books starting at ₹1 on TheBookX! Check it out:",
                  url: "https://thebookx.in",
                };
                try {
                  if (navigator.share) await navigator.share(shareData);
                  else
                    window.open(
                      `https://wa.me/?text=${encodeURIComponent(
                        `${shareData.text} ${shareData.url}`,
                      )}`,
                      "_blank",
                    );
                } catch (_) {}
              }}
            >
              <span className="pm-ic">
                <Share2 size={18} />
              </span>
              <span className="pm-label">Refer a friend</span>
              <ChevronRight size={18} className="pm-arrow" />
            </button>

            <Link href="/review" className="pm-row">
              <span className="pm-ic">
                <Star size={18} />
              </span>
              <span className="pm-label">Rate us</span>
              <ChevronRight size={18} className="pm-arrow" />
            </Link>

            <Link href="/terms" className="pm-row">
              <span className="pm-ic">
                <FileText size={18} />
              </span>
              <span className="pm-label">Terms &amp; Conditions</span>
              <ChevronRight size={18} className="pm-arrow" />
            </Link>

            <Link href="/privacy" className="pm-row">
              <span className="pm-ic">
                <ShieldCheck size={18} />
              </span>
              <span className="pm-label">Privacy Policy</span>
              <ChevronRight size={18} className="pm-arrow" />
            </Link>

            <button
              type="button"
              className="pm-row pm-logout"
              onClick={handleNewSearch}
            >
              <span className="pm-ic">
                <LogOut size={18} />
              </span>
              <span className="pm-label">Log out</span>
              <ChevronRight size={18} className="pm-arrow" />
            </button>
          </div>
        )}
      </div>

      {/* ========== Edit profile modal ========== */}
      <AnimatePresence>
        {showEditProfile && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditProfile(false)}
          >
            <motion.div
              className="bill-modal ep-modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxHeight: "90vh", overflowY: "auto" }}
            >
              <div className="bill-header">
                <span className="weight-600 font-16 flex items-center gap-8">
                  <User size={17} /> Edit profile
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => setShowEditProfile(false)}
                >
                  <X size={18} />
                </span>
              </div>

              <div className="ep-body">
                <label className="ep-field">
                  <span className="ep-label">Full name</span>
                  <input
                    className="admin-input"
                    value={epName}
                    onChange={(e) => setEpName(e.target.value)}
                    placeholder="Your name"
                  />
                </label>
                <label className="ep-field">
                  <span className="ep-label">Mobile number</span>
                  <input
                    className="admin-input"
                    inputMode="numeric"
                    maxLength={10}
                    value={epPhone}
                    onChange={(e) =>
                      setEpPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    placeholder="10-digit number"
                  />
                  <span className="ep-hint">
                    Changing your number will load that profile.
                  </span>
                </label>

                {/* Addresses */}
                <div className="ep-addr-section">
                  <div className="ep-addr-head">
                    <span className="ep-label">
                      <Home size={13} /> Delivery address
                    </span>
                    {profileAddresses.length > 1 && (
                      <button
                        type="button"
                        className="ep-change"
                        onClick={() => setEpAddrOpen((v) => !v)}
                      >
                        {epAddrOpen ? "Done" : "Change"}
                      </button>
                    )}
                  </div>

                  {profileAddresses.length === 0 && (
                    <p className="ep-hint">No saved address yet.</p>
                  )}

                  {(epAddrOpen
                    ? profileAddresses
                    : profileAddresses.slice(0, 1)
                  ).map((a, i) => {
                    const isPrimary =
                      (epPrimaryId && a.orderId === epPrimaryId) ||
                      (!epPrimaryId && i === 0 && !epAddrOpen) ||
                      (!epPrimaryId &&
                        epAddrOpen &&
                        a.orderId === profileAddresses[0].orderId);
                    const editing = epEditId === a.orderId;
                    return (
                      <div
                        key={a.orderId || i}
                        className={`ep-addr-card${isPrimary ? " primary" : ""}`}
                      >
                        {editing ? (
                          <div className="ep-addr-edit">
                            <textarea
                              className="admin-input"
                              rows={2}
                              value={epDraft.address}
                              placeholder="Address"
                              onChange={(e) =>
                                setEpDraft((d) => ({
                                  ...d,
                                  address: e.target.value,
                                }))
                              }
                            />
                            <div className="ep-addr-row3">
                              <input
                                className="admin-input"
                                value={epDraft.city}
                                placeholder="City"
                                onChange={(e) =>
                                  setEpDraft((d) => ({
                                    ...d,
                                    city: e.target.value,
                                  }))
                                }
                              />
                              <input
                                className="admin-input"
                                value={epDraft.state}
                                placeholder="State"
                                onChange={(e) =>
                                  setEpDraft((d) => ({
                                    ...d,
                                    state: e.target.value,
                                  }))
                                }
                              />
                              <input
                                className="admin-input"
                                value={epDraft.pincode}
                                placeholder="Pincode"
                                onChange={(e) =>
                                  setEpDraft((d) => ({
                                    ...d,
                                    pincode: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div className="ep-addr-actions">
                              <button
                                type="button"
                                className="pri-mid-btn"
                                disabled={epSaving}
                                onClick={saveAddressEdit}
                              >
                                {epSaving ? "Saving…" : "Save address"}
                              </button>
                              <button
                                type="button"
                                className="sec-mid-btn"
                                onClick={() => setEpEditId(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="ep-addr-text">
                              <span className="ep-addr-line">{a.address}</span>
                              <span className="ep-addr-meta">
                                {[a.city, a.state, a.pincode]
                                  .filter(Boolean)
                                  .join(", ")}
                              </span>
                            </div>
                            <div className="ep-addr-tags">
                              {isPrimary && (
                                <span className="ep-primary-tag">Primary</span>
                              )}
                            </div>
                            {epAddrOpen && (
                              <div className="ep-addr-actions">
                                {!isPrimary && (
                                  <button
                                    type="button"
                                    className="sec-mid-btn"
                                    onClick={() =>
                                      setPrimaryAddress(a.orderId)
                                    }
                                  >
                                    Make primary
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="sec-mid-btn"
                                  onClick={() => startEditAddress(a)}
                                >
                                  <Pencil size={13} /> Edit
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="pri-big-btn ep-save"
                  onClick={saveProfileBasics}
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== Support templates sheet ========== */}
      <AnimatePresence>
        {showSupport && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSupport(false)}
          >
            <motion.div
              className="bill-modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxHeight: "85vh", overflowY: "auto" }}
            >
              <div className="bill-header">
                <span className="weight-600 font-16 flex items-center gap-8">
                  <FaWhatsapp size={16} color="#25D366" /> How can we help?
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => setShowSupport(false)}
                >
                  <X size={18} />
                </span>
              </div>
              <p className="ep-hint" style={{ marginBottom: 6 }}>
                Pick a topic and we&apos;ll open WhatsApp with a ready message.
              </p>
              <div className="support-templates">
                {[
                  {
                    label: "Where is my order?",
                    msg: "Hi TheBookX, I'd like an update on where my order is. My number is " +
                      phoneNumber +
                      ".",
                  },
                  {
                    label: "Delivery estimate",
                    msg: "Hi TheBookX, when can I expect my order to be delivered? My number is " +
                      phoneNumber +
                      ".",
                  },
                  {
                    label: "Change delivery address",
                    msg: "Hi TheBookX, I'd like to change the delivery address for my order. My number is " +
                      phoneNumber +
                      ".",
                  },
                  {
                    label: "Payment help",
                    msg: "Hi TheBookX, I need help with the payment for my order. My number is " +
                      phoneNumber +
                      ".",
                  },
                  {
                    label: "Wrong or damaged item",
                    msg: "Hi TheBookX, I received a wrong or damaged item and need help. My number is " +
                      phoneNumber +
                      ".",
                  },
                  {
                    label: "Something else",
                    msg: "Hi TheBookX, I need some help with my order. My number is " +
                      phoneNumber +
                      ".",
                  },
                ].map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    className="support-template-row"
                    onClick={() => {
                      window.open(
                        `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(
                          t.msg,
                        )}`,
                        "_blank",
                      );
                      setShowSupport(false);
                    }}
                  >
                    <span>{t.label}</span>
                    <ChevronRight size={18} />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== Payment Modal, unchanged ========== */}
      <AnimatePresence>
        {showPaymentModal && selectedOrder && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              className="bill-modal"
              style={{ maxWidth: "500px" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <span className="weight-600 font-16">
                  Pay for Order #{selectedOrder["Order ID"]}
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => setShowPaymentModal(false)}
                >
                  <X size={16} />
                </span>
              </div>
              <div className="address-form-content">
                <div className="flex flex-col items-center gap-16">
                  <motion.div
                    className="qr-wrapper"
                    animate={{
                      filter: qrUnlocked ? "blur(0px)" : "blur(12px)",
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <Image
                      src="/books/uskillbook.png"
                      alt="UPI QR Code for payment"
                      width={280}
                      height={380}
                    />
                    <div className="flex flex-row items-center justify-center gap-8 mt-12">
                      <button
                        className="sec-mid-btn flex flex-row gap-8"
                        onClick={() => {
                          navigator.clipboard.writeText(UPI_ID);
                          setUpiCopied(true);
                          setTimeout(() => setUpiCopied(false), 3000);
                        }}
                      >
                        <Copy size={16} />
                        {upiCopied ? "Copied!" : UPI_ID}
                      </button>
                      <button
                        className="pri-big-btn flex flex-row gap-8"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = "/books/uskillbook.png";
                          link.download = "payment-qr.png";
                          link.click();
                        }}
                      >
                        <Download size={16} /> Save QR
                      </button>
                    </div>
                  </motion.div>
                  {!qrUnlocked && (
                    <button
                      className="pri-big-btn"
                      onClick={() => setQrUnlocked(true)}
                    >
                      Reveal QR Code to Pay
                    </button>
                  )}
                  {qrUnlocked && (
                    <div className="width100 flex flex-col gap-8 items-center">
                      <span className="font-12">
                        After completing payment, click verify
                      </span>
                      <button
                        className={`pri-big-btn width100 ${!canVerify ? "disabled-btn" : ""}`}
                        disabled={!canVerify}
                        onClick={() => {
                          alert(
                            "Payment verification initiated! Status will be updated shortly.",
                          );
                          setShowPaymentModal(false);
                        }}
                      >
                        {canVerify
                          ? " Verify Payment"
                          : `Wait ${verifyTimer}s to verify`}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== Enquire-about-order chooser ========== */}
      <AnimatePresence>
        {enquireOrder && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEnquireOrder(null)}
            style={{ maxWidth: "980px", margin: "0 auto" }}
          >
            <motion.div
              className="bill-modal enquire-modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <div className="flex flex-col">
                  <span className="weight-600 font-16">
                    Ask about this order
                  </span>
                  <span className="font-12 gray-500">
                    Order {enquireOrder["Order ID"] || ""}
                  </span>
                </div>
                <span
                  className="cursor-pointer"
                  onClick={() => setEnquireOrder(null)}
                >
                  <X size={18} />
                </span>
              </div>

              <p className="enquire-sub">
                What would you like to ask? Pick one — we&apos;ll open WhatsApp
                with your order details filled in.
              </p>

              <div className="enquire-options">
                {[
                  {
                    label: "Delivery estimate",
                    q: "Could you please share the delivery estimate for this order?",
                  },
                  {
                    label: "Where is my order?",
                    q: "Could you please tell me where my order currently is?",
                  },
                  {
                    label: "Change delivery details",
                    q: "I'd like to update the delivery address / phone for this order.",
                  },
                  {
                    label: "Payment help",
                    q: "I need some help with the payment for this order.",
                  },
                  {
                    label: "Wrong or damaged item",
                    q: "There's an issue with an item in this order (wrong/damaged). Please help.",
                  },
                  {
                    label: "Cancel this order",
                    q: "I'd like to cancel this order. Please help me cancel it.",
                    danger: true,
                  },
                  {
                    label: "Something else",
                    q: "I have a question about this order.",
                    muted: true,
                  },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    className={`enquire-opt${opt.danger ? " danger" : ""}${opt.muted ? " muted" : ""}`}
                    onClick={() => sendOrderEnquiry(enquireOrder, opt.q)}
                  >
                    <span>{opt.label}</span>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== Reschedule Modal, NEW ========== */}
      <AnimatePresence>
        {showRescheduleModal && rescheduleOrder && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRescheduleModal(false)}
          >
            <motion.div
              className="bill-modal"
              style={{ maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <span className="weight-600 font-16 flex items-center gap-8">
                  <CalendarClock
                    size={18}
                    style={{ color: "var(--tertiary, #fb8500)" }}
                  />
                  Choose when to ship
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => setShowRescheduleModal(false)}
                >
                  <X size={16} />
                </span>
              </div>

              <div
                className="address-form-content"
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {/* Order ID strip */}
                <div
                  style={{
                    padding: "10px 12px",
                    background: "var(--dark-4)",
                    border: "1px solid var(--dark-10)",
                    borderRadius: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <span className="font-10 dark-50">Order ID</span>
                  <span className="font-14 weight-600">
                    {rescheduleOrder["Order ID"]}
                  </span>
                </div>

                <div className="input-group">
                  <label className="flex flex-row gap-4 items-center">
                    <Calendar size={14} />
                    Preferred dispatch date <span className="red">*</span>
                  </label>
                  <input
                    type="date"
                    className="sec-mid-btn width100"
                    min={tomorrowISO}
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="flex flex-row gap-4 items-center">
                    <Clock size={14} />
                    Preferred time slot
                  </label>
                  <select
                    className="sec-mid-btn width100"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                  >
                    <option value="">Any time</option>
                    <option value="Morning (9am-12pm)">
                      Morning (9am-12pm)
                    </option>
                    <option value="Afternoon (12pm-4pm)">
                      Afternoon (12pm-4pm)
                    </option>
                    <option value="Evening (4pm-8pm)">Evening (4pm-8pm)</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="flex flex-row gap-4 items-center">
                    <MessageSquare size={14} />
                    Note (optional)
                  </label>
                  <textarea
                    className="sec-mid-btn textarea"
                    rows={2}
                    placeholder="Any special instructions for delivery..."
                    value={rescheduleNote}
                    onChange={(e) => setRescheduleNote(e.target.value)}
                  />
                </div>

                {/* Info hint */}
                <div
                  style={{
                    padding: "8px 12px",
                    background:
                      "linear-gradient(135deg, var(--tertiary-10, #fb850010), transparent)",
                    border: "1px dashed var(--tertiary, #fb8500)",
                    borderRadius: 8,
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                  }}
                >
                  <AlertTriangle
                    size={14}
                    style={{
                      color: "var(--tertiary)",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  />
                  <span className="font-10 dark-50" style={{ lineHeight: 1.5 }}>
                    Your request will open in WhatsApp. Once our team confirms
                    the new slot, your delivery will be updated.
                  </span>
                </div>

                <div className="flex flex-col gap-8 mt-8">
                  <button
                    type="button"
                    onClick={handleRescheduleSubmit}
                    disabled={!rescheduleDate}
                    className="pri-big-btn width100 flex flex-row items-center justify-center gap-8"
                    style={{
                      opacity: rescheduleDate ? 1 : 0.6,
                      cursor: rescheduleDate ? "pointer" : "not-allowed",
                    }}
                  >
                    <FaWhatsapp size={16} />
                    Send via WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRescheduleModal(false)}
                    className="sec-mid-btn width100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== Edit Address Modal (bottom sheet) ========== */}
      <AnimatePresence>
        {showAddressEditModal && addressEditOrder && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddressEditModal(false)}
          >
            <motion.div
              className="bill-modal"
              style={{ maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <span className="weight-600 font-16 flex items-center gap-8">
                  <MapPin
                    size={18}
                    style={{ color: "var(--tertiary, #fb8500)" }}
                  />
                  Edit delivery address
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => setShowAddressEditModal(false)}
                >
                  <X size={16} />
                </span>
              </div>

              <div
                className="address-form-content"
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div
                  style={{
                    padding: "10px 12px",
                    background: "var(--dark-4)",
                    border: "1px solid var(--dark-10)",
                    borderRadius: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <span className="font-10 dark-50">Order ID</span>
                  <span className="font-14 weight-600">
                    {addressEditOrder["Order ID"]}
                  </span>
                </div>

                <div className="input-group">
                  <label className="flex flex-row gap-4 items-center">
                    <User size={14} /> Full name
                  </label>
                  <input
                    type="text"
                    className="sec-mid-btn width100"
                    value={addrEdit.name}
                    onChange={(e) =>
                      setAddrEdit((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Recipient name"
                  />
                </div>

                <div className="input-group">
                  <label className="flex flex-row gap-4 items-center">
                    <MessageSquare size={14} /> Phone number{" "}
                    <span className="red">*</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    className="sec-mid-btn width100"
                    value={addrEdit.phone}
                    onChange={(e) =>
                      setAddrEdit((p) => ({
                        ...p,
                        phone: e.target.value.replace(/[^\d+]/g, ""),
                      }))
                    }
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div className="input-group">
                  <div className="addr-label-row">
                    <label className="flex flex-row gap-4 items-center">
                      <MapPin size={14} /> Full address{" "}
                      <span className="red">*</span>
                    </label>
                    {addrEdit.locationLink ? (
                      <span className="addr-pin-done">
                        <MapPin size={13} /> Location pinned
                        <Check size={12} strokeWidth={3} />
                        <button
                          type="button"
                          className="addr-pin-mini"
                          onClick={pinEditLocation}
                          disabled={addrLocating}
                        >
                          Re-pin
                        </button>
                        <button
                          type="button"
                          className="addr-pin-mini danger"
                          onClick={() =>
                            setAddrEdit((p) => ({ ...p, locationLink: "" }))
                          }
                        >
                          Remove
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="addr-pin-btn"
                        onClick={pinEditLocation}
                        disabled={addrLocating}
                      >
                        <MapPin size={13} />
                        {addrLocating ? "Locating…" : "Pin my location"}
                      </button>
                    )}
                  </div>
                  <textarea
                    className="sec-mid-btn textarea"
                    rows={2}
                    value={addrEdit.address}
                    onChange={(e) =>
                      setAddrEdit((p) => ({ ...p, address: e.target.value }))
                    }
                    placeholder="e.g. 12/A, Green Residency, 2nd floor, MG Road, near City Mall"
                  />
                </div>

                <div className="flex flex-row gap-12">
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>City</label>
                    <input
                      type="text"
                      className="sec-mid-btn width100"
                      value={addrEdit.city}
                      onChange={(e) =>
                        setAddrEdit((p) => ({ ...p, city: e.target.value }))
                      }
                      placeholder="City"
                    />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>State</label>
                    <input
                      type="text"
                      className="sec-mid-btn width100"
                      value={addrEdit.state}
                      onChange={(e) =>
                        setAddrEdit((p) => ({ ...p, state: e.target.value }))
                      }
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Pincode</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    className="sec-mid-btn width100"
                    value={addrEdit.pincode}
                    onChange={(e) =>
                      setAddrEdit((p) => ({
                        ...p,
                        pincode: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    placeholder="6-digit pincode"
                  />
                </div>

                <div className="flex flex-col gap-8 mt-8">
                  <button
                    type="button"
                    onClick={handleAddressEditSubmit}
                    disabled={
                      !addrEdit.address.trim() || !addrEdit.phone.trim()
                    }
                    className="pri-big-btn width100 flex flex-row items-center justify-center gap-8"
                    style={{
                      opacity:
                        addrEdit.address.trim() && addrEdit.phone.trim()
                          ? 1
                          : 0.6,
                      cursor:
                        addrEdit.address.trim() && addrEdit.phone.trim()
                          ? "pointer"
                          : "not-allowed",
                    }}
                  >
                    <MessageSquare size={16} />
                    Submit & send on WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddressEditModal(false)}
                    className="sec-mid-btn width100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* "What to read next" suggestion modal */}
      <RecommendationModal
        isOpen={showSuggest}
        onClose={() => setShowSuggest(false)}
      />

      {/* ── Track shipment slide-up ── */}
      <AnimatePresence>
        {trackOrder && (
          <TrackSheet
            trackOrder={trackOrder}
            onClose={() => setTrackOrder(null)}
            trackCopied={trackCopied}
            setTrackCopied={setTrackCopied}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Track-shipment sheet with a vehicle that physically travels down the
// vertical timeline to the current stage — train for standard orders,
// flight for faster ones. Positions are measured from the real dots so the
// journey lands exactly on the active tick.
function TrackSheet({ trackOrder, onClose, trackCopied, setTrackCopied }) {
  const s = String(trackOrder.status || "").toLowerCase();
  const delivered = /delivered/.test(s);
  const outForDelivery = /out\s*for\s*delivery/.test(s);
  const inTransit = /in\s*transit/.test(s);
  const shipped =
    !!trackOrder.shippingId || inTransit || outForDelivery || delivered;
  const isFaster = /faster|express|flight|air/i.test(
    trackOrder["Delivery Type"] || trackOrder.deliveryType || "",
  );
  const vehicle = isFaster ? "✈️" : "🚆";

  // Estimated delivery window from the order date + speed of service.
  const DAY_MS = 24 * 60 * 60 * 1000;
  const orderDate = parseSheetDate(getOrderDateValue(trackOrder));
  const [minDays, maxDays] = isFaster ? [1, 5] : [4, 12];
  const estFrom = orderDate
    ? new Date(orderDate.getTime() + minDays * DAY_MS)
    : null;
  const estTo = orderDate
    ? new Date(orderDate.getTime() + maxDays * DAY_MS)
    : null;
  const fmtDate = (d) =>
    d
      ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
      : null;

  const stages = [
    {
      label: "Order confirmed",
      sub: "We've received your order",
      state: "done",
    },
    {
      label: "Getting shipped from Mumbai",
      sub: "Packed & handed to the courier",
      state: shipped ? "done" : "active",
    },
    {
      label: "In transit",
      sub:
        delivered || outForDelivery
          ? "Reached your city"
          : inTransit
            ? "Your parcel is on its way"
            : "We'll update this once it ships",
      state: delivered || outForDelivery ? "done" : inTransit ? "active" : "todo",
    },
    {
      label: "Out for delivery",
      sub: delivered
        ? "Handed to your local courier"
        : outForDelivery
          ? "Arriving today — keep your phone handy"
          : "Almost there",
      state: delivered ? "done" : outForDelivery ? "active" : "todo",
    },
    {
      label: "Delivered",
      sub: delivered
        ? "Your books have arrived — happy reading!"
        : "Arriving soon",
      state: delivered ? "done" : "todo",
    },
  ];
  const activeIndex = delivered
    ? stages.length - 1
    : Math.max(
        0,
        stages.findIndex((x) => x.state === "active"),
      );

  const railRef = useRef(null);
  const dotRefs = useRef([]);
  const trainControls = useAnimationControls();
  const fillControls = useAnimationControls();
  const [geo, setGeo] = useState(null); // { x, startY, targetY, endY }
  const [moving, setMoving] = useState(false);

  // Pass 1 — measure the real dot positions once the sheet has mounted.
  useEffect(() => {
    const measure = () => {
      const dots = dotRefs.current;
      const container = railRef.current;
      if (!container || !dots[0] || !dots[activeIndex] || !dots[stages.length - 1])
        return;
      // Cumulative offset up to the timeline container — robust even though
      // each step-rail is its own positioning context.
      const offsetWithin = (el) => {
        let x = 0;
        let y = 0;
        let node = el;
        while (node && node !== container) {
          y += node.offsetTop;
          x += node.offsetLeft;
          node = node.offsetParent;
        }
        return { x, y };
      };
      const cy = (el) => offsetWithin(el).y + el.offsetHeight / 2;
      const cx = (el) => offsetWithin(el).x + el.offsetWidth / 2;
      const next = {
        x: cx(dots[0]),
        startY: cy(dots[0]),
        targetY: cy(dots[activeIndex]),
        endY: cy(dots[stages.length - 1]),
      };
      setGeo((prev) =>
        prev &&
        prev.x === next.x &&
        prev.startY === next.startY &&
        prev.targetY === next.targetY &&
        prev.endY === next.endY
          ? prev
          : next,
      );
    };
    // Measure after paint (and again shortly after, once fonts settle).
    const id1 = requestAnimationFrame(measure);
    const id2 = setTimeout(measure, 250);
    return () => {
      cancelAnimationFrame(id1);
      clearTimeout(id2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackOrder]);

  // Pass 2 — once positions are known (train is mounted), run the journey.
  useEffect(() => {
    if (!geo) return;
    let cancelled = false;
    const { startY, targetY } = geo;
    trainControls.set({ y: startY, opacity: 0, scale: 0.85 });
    fillControls.set({ height: 0 });

    (async () => {
      // Let the sheet finish sliding up before the vehicle departs.
      await new Promise((r) => setTimeout(r, 500));
      if (cancelled) return;
      await trainControls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.35, ease: "easeOut" },
      });
      if (cancelled) return;
      setMoving(true);
      const dur = delivered ? 2.8 : 2.15;
      const ease = [0.45, 0.02, 0.25, 1]; // pull away, cruise, ease to a stop
      fillControls.start({
        height: Math.max(0, targetY - startY),
        transition: { duration: dur, ease },
      });
      await trainControls.start({
        y: targetY,
        transition: { duration: dur, ease },
      });
      if (cancelled) return;
      setMoving(false);
      // Settle with a soft, breathing bob at the current stop.
      trainControls.start({
        y: [targetY, targetY - 3, targetY],
        transition: { duration: 1.9, repeat: Infinity, ease: "easeInOut" },
      });
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo]);

  const openIndiaPost = () => {
    try {
      navigator.clipboard.writeText(trackOrder.shippingId || "");
      setTrackCopied(true);
    } catch {}
    window.open("https://www.indiapost.gov.in", "_blank", "noopener,noreferrer");
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
        className="bill-modal track-sheet"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.38, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bill-header">
          <div className="flex flex-col">
            <span className="weight-700 font-16">Track shipment</span>
            <span className="font-12 gray-500">
              Order {trackOrder.orderId || trackOrder["Order ID"] || ""}
            </span>
          </div>
          <span className="cursor-pointer" onClick={onClose}>
            <X size={18} />
          </span>
        </div>

        <div className="track-body">
          <div className="track-timeline" ref={railRef}>
            {/* Continuous vertical track behind the dots + animated fill */}
            {geo && (
              <div
                className="track-vline"
                style={{
                  left: geo.x,
                  top: geo.startY,
                  height: Math.max(0, geo.endY - geo.startY),
                }}
              >
                <motion.div className="track-vline-fill" animate={fillControls} />
              </div>
            )}

            {/* The travelling vehicle */}
            {geo && (
              <div className="track-train-wrap" style={{ left: geo.x }}>
                <motion.div
                  className="track-train"
                  initial={{ opacity: 0 }}
                  animate={trainControls}
                >
                  <span className={`track-train-tail${moving ? " on" : ""}`} />
                  <span className="track-train-glow" />
                  <span className="track-train-emoji">{vehicle}</span>
                </motion.div>
              </div>
            )}

            <motion.div
              className="track-steps"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.14, delayChildren: 0.18 },
                },
              }}
            >
              {stages.map((st, i) => (
                <motion.div
                  className={`track-step ${st.state}`}
                  key={i}
                  variants={{
                    hidden: { opacity: 0, x: -6 },
                    show: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.3, ease: "easeOut" },
                    },
                  }}
                >
                  <div className="track-step-rail">
                    <span
                      className="track-step-dot"
                      ref={(el) => {
                        dotRefs.current[i] = el;
                      }}
                    >
                      {st.state === "done" && (
                        <Check size={13} strokeWidth={3} />
                      )}
                    </span>
                  </div>
                  <div className="track-step-txt">
                    <strong>{st.label}</strong>
                    <span>{st.sub}</span>
                    {st.label === "In transit" &&
                      inTransit &&
                      trackOrder.shippingId && (
                        <button
                          type="button"
                          className="track-check-link"
                          onClick={openIndiaPost}
                        >
                          {trackCopied
                            ? "ID copied — paste on India Post ↗"
                            : "Track on India Post ↗"}
                        </button>
                      )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {estFrom && estTo && (
            <div className="track-eta-note">
              <CalendarClock size={15} />
              <span>
                {delivered ? (
                  <>Delivered within the estimated window — as promised.</>
                ) : (
                  <>
                    Estimated delivery{" "}
                    <strong>
                      {fmtDate(estFrom)} – {fmtDate(estTo)}
                    </strong>
                    . {isFaster ? "Express" : "Standard"} orders usually arrive
                    within {minDays}–{maxDays} days as estimated.
                  </>
                )}
              </span>
            </div>
          )}

          {trackOrder.shippingId && (
            <div className="track-tid">
              <div className="track-tid-info">
                <span className="track-tid-lbl">Tracking ID</span>
                <span className="track-tid-v">{trackOrder.shippingId}</span>
              </div>
              <button
                type="button"
                className="track-tid-copy"
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(trackOrder.shippingId || "");
                    setTrackCopied(true);
                  } catch {}
                }}
              >
                {trackCopied ? (
                  <>
                    <Check size={14} strokeWidth={3} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy
                  </>
                )}
              </button>
            </div>
          )}
          {delivered && (
            <div className="track-delivered">
              <Check size={14} strokeWidth={3} /> Delivered
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
