"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";
import PageHeader from "@/components/UI/PageHeader";
import InstallAppBar from "@/components/InstallAppBar";

const SHEET_ID = "1ovqFn50d0TKjV0nm4q1lb3N9XvimUgIsHCOlHh6QRdg";
const SUPPORT_WHATSAPP = "917710892108";

// =====================================================================
// Module-level date parser, handles every format the Google Sheet emits
// =====================================================================
// The "Timestamp" / "Timestamp (D)" columns can hold any of:
//   "20/05/2026 23:14:14"        (dd/mm/yyyy, 24-hour, NO am/pm, NO comma)
//   "20/05/2026, 23:14:12"       (dd/mm/yyyy, 24-hour, with comma)
//   "27/05/2026, 04:50:03 pm"    (dd/mm/yyyy, 12-hour with am/pm)
//   "Date(2026,4,27,16,50,3)"    (Google Sheets serialized, months 0-based)
//   Date object instances        (some gviz responses)
//   ISO strings                  (fallback)
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
      const month = parseInt(m[2], 10) - 1; // dd/mm/yyyy → 0-based for JS
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
          <CheckCircle size={20} className="tracking-check-icon" />
          <div className="tracking-package-icon">📦</div>
        </div>
        <div className="tracking-header-text">
          <span className="tracking-title">
            {activeStage === 3 ? "Delivered" : "Order Placed"}
          </span>
          <span className="tracking-subtitle">
            {activeStage === 3 ? (
              <>
                Delivered on{" "}
                <strong className="tracking-eta">{longDate(new Date())}</strong>
              </>
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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [qrUnlocked, setQrUnlocked] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);
  const [canVerify, setCanVerify] = useState(false);
  const [verifyTimer, setVerifyTimer] = useState(30);
  const [showPhoneInput, setShowPhoneInput] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [savedPhones, setSavedPhones] = useState([]);

  // ----- NEW state for cancel + reschedule -----
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleOrder, setRescheduleOrder] = useState(null);
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
  });

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
    const isFree = (order["Delivery Type"] || "").toLowerCase().includes("free");
    const diff = grand - sub;

    const W = 700;
    const P = 44;
    const rowH = 32;
    const scale = 2;
    const summaryCount = (sub > 0 ? 1 : 0) + 1 + (diff < 0 ? 1 : 0);
    const H =
      300 + items.length * rowH + summaryCount * 26 + 70 + 70;

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
    ctx.fillText(`Invoice  ·  Order ${order["Order ID"] || ""}`, P, y);
    y += 18;
    ctx.fillText(`${order["Timestamp"] || ""}`, P, y);
    y += 18;
    ctx.fillText(
      `${customerName || ""}  ·  ${phoneNumber || order["Phone"] || ""}`,
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
      "Delivery",
      isFree ? "FREE" : diff > 0 ? `+₹${diff}` : "—",
      isFree ? "#008f0c" : "#0a0a0a",
    );
    if (diff < 0) sumLine("Discount", `−₹${-diff}`, "#008f0c");

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
      `Payment: ${order["Payment Type"] || ""}  ·  Delivery: ${order["Delivery Type"] || ""}`,
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
        return String(orderPhone).trim() === String(phone).trim();
      });

      // Sort newest-first using the proper sheet date parser
      const sortedOrders = userOrders.sort((a, b) => {
        const dateA = parseSheetDate(getOrderDateValue(a)) || new Date(0);
        const dateB = parseSheetDate(getOrderDateValue(b)) || new Date(0);
        return dateB - dateA;
      });

      const parsedOrders = sortedOrders.map((order) => {
        const customer = order["Customer Name"] || "";
        if (customer && !customerName) {
          setCustomerName(customer);
          localStorage.setItem("track_orders_name", customer);
        }
        return {
          ...order,
          parsedBooks: parseBooksList(order["Books List"]),
          status: order["Order Status"] || "Pending",
          shippingId: order["Shipping ID"] || "",
          advancePaid: order["Advance Paid"] || "No",
          comment: order["Comment for this order"] || order["Comment"] || "",
        };
      });
      // Compute wallet balance, read from the "Wallet" column.
      // Take the max across rows so blank cells in older orders don't
      // overwrite a positive balance from a more recent row.
      const walletValue = parsedOrders.reduce((max, order) => {
        const raw = order["Wallet"] ?? order["wallet"] ?? 0;
        const w = parseFloat(raw);
        return isNaN(w) ? max : Math.max(max, w);
      }, 0);
      setWalletBalance(walletValue);

      setOrders(parsedOrders);
      if (parsedOrders.length === 0) {
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
          message: "✓ Advance Paid (₹99)",
          type: "success",
          remaining: `₹${getRemainingAmount(order)} pending at delivery`,
        };
      }
      return {
        message: "⚠️ Payment Pending",
        type: "warning",
        remaining: `Pay ₹${getAmountToShow(order)} at delivery`,
      };
    }
    return {
      message: "✓ Payment Completed",
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

    const message = `Hi TheBookX 👋

I'd like to *cancel* my order. Here are the details:

📋 *Order ID:* ${order["Order ID"]}
👤 *Name:* ${order["Customer Name"] || ""}
📞 *Phone:* ${order["Phone Number"] || ""}
💰 *Total Amount:* ₹${order["Total Amount"] || ""}
💳 *Payment:* ${order["Payment Type"] || ""}

📦 *Items:*
${itemsList || ""}

Please cancel this order. Thank you 🙏`;

    window.open(
      `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
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
    setAddrEdit({
      name: order["Customer Name"] || customerName || "",
      phone: String(order["Phone Number"] || phoneNumber || ""),
      address: order["Address"] || "",
      city: order["City"] || "",
      state: order["State"] || "",
      pincode: String(order["Pincode"] || ""),
    });
    setShowAddressEditModal(true);
  };

  const handleAddressEditSubmit = () => {
    if (!addrEdit.address.trim() || !addrEdit.phone.trim()) {
      alert("Please fill in at least the address and phone number.");
      return;
    }
    const order = addressEditOrder;
    const lines = [
      "Hi TheBookX 👋",
      "",
      "I'd like to *update the delivery details* for my order.",
      "",
      `📋 *Order ID:* ${order?.["Order ID"] || ""}`,
      `👤 *Name:* ${addrEdit.name || ""}`,
      `📞 *Phone:* ${addrEdit.phone || ""}`,
      "",
      "*📍 Updated Address*",
      `🏠 ${addrEdit.address || ""}`,
      `🏙️ ${addrEdit.city || ""}${addrEdit.state ? `, ${addrEdit.state}` : ""}`,
      `📮 Pincode: ${addrEdit.pincode || ""}`,
      "",
      "Please update my order with these details. Thank you 🙏",
    ];
    window.open(
      `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`,
      "_blank",
    );
    setShowAddressEditModal(false);
  };

  const handleRescheduleSubmit = () => {
    if (!rescheduleDate) {
      alert("Please pick a preferred delivery date.");
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
      "Hi TheBookX 👋",
      "",
      "I'd like to *reschedule* the delivery of my order.",
      "",
      `📋 *Order ID:* ${order["Order ID"]}`,
      `👤 *Name:* ${order["Customer Name"] || ""}`,
      `📞 *Phone:* ${order["Phone Number"] || ""}`,
      "",
      `🗓 *Preferred Date:* ${formattedDate}`,
    ];
    if (rescheduleTime) {
      lines.push(`⏰ *Preferred Time:* ${rescheduleTime}`);
    }
    if (rescheduleNote.trim()) {
      lines.push(`📝 *Note:* ${rescheduleNote.trim()}`);
    }
    lines.push("", "Please update the delivery accordingly. Thank you 🙏");

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

  return (
    <div className="my-orders-page">
      <InstallAppBar />
      <div className="section-680 flex flex-col gap-24">
        {/* Header */}
        <div className="orders-header">
          <PageHeader
            title="Profile"
            subtitle="Manage your profile and orders history."
          />
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
              <div className="phone-card">
                <div className="phone-card-icon">
                  <Phone size={22} />
                </div>
                <h2 className="phone-card-title">Track your orders</h2>
                <p className="phone-card-sub">
                  Enter the mobile number you used at checkout to see your
                  orders and wallet.
                </p>

                <div className="phone-card-row">
                  <div className="phone-input-wrap">
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
                    className="phone-card-submit"
                    onClick={() => fetchOrders()}
                    disabled={loading || phoneNumber.length !== 10}
                  >
                    {loading ? "Searching..." : "Submit"}
                  </button>
                </div>

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
                      {customerName || "Customer"}
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
                    <button className="sec-mid-btn" onClick={handleNewSearch}>
                      <LogOut size={14} />
                      Logout
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

                    <span
                      className="font-10 dark-50"
                      style={{
                        textAlign: "right",
                        maxWidth: 120,
                        lineHeight: 1.4,
                      }}
                    >
                      Available on your next order
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orders List */}
        {searched && !loading && orders.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="orders-list-header">
              <span className="orders-count">
                {orders.length} {orders.length === 1 ? "Order" : "Orders"}
              </span>
            </div>
            {orders.map((order, idx) => {
              const amountToShow = getAmountToShow(order);
              const hasComment = order.comment && order.comment.trim() !== "";
              const isPending = (order.status || "")
                .toLowerCase()
                .includes("pending");

              return (
                <div key={idx} className="order-card">
                  <div className="order-card-header">
                    <div className="order-id-section">
                      <span className="order-id-label">Order ID</span>
                      <span className="order-id-value">
                        {order["Order ID"]}
                      </span>
                    </div>
                    <div className="order-date-section">
                      <Calendar size={14} />
                      <span className="time-full">
                        {formatDate(getOrderDateValue(order))}
                      </span>
                    </div>
                    <div className="flex flex-row gap-4 items-center">
                      <span className="order-id-label">Delivery status:</span>
                      <div
                        className={`order-status-badge ${getStatusColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        <span>{order.status}</span>
                      </div>
                    </div>
                  </div>

                  <OrderTrackingTimeline order={order} />

                  {(() => {
                    const items = order.parsedBooks || [];
                    const sub = items.reduce(
                      (s, b) => s + (b.total || b.price * b.quantity || 0),
                      0,
                    );
                    const grand = parseFloat(order["Total Amount"]) || sub;
                    const isFree = (order["Delivery Type"] || "")
                      .toLowerCase()
                      .includes("free");
                    const diff = grand - sub;
                    return (
                      <div className="order-invoice">
                        <div className="order-invoice-table">
                          <div className="oit-head">
                            <span>Item</span>
                            <span>Qty</span>
                            <span>Price</span>
                          </div>
                          {items.length > 0 ? (
                            items.map((b, bidx) => (
                              <div key={bidx} className="oit-row">
                                <span className="oit-name">{b.name}</span>
                                <span className="oit-qty">×{b.quantity}</span>
                                <span className="oit-price">
                                  ₹{b.total || b.price * b.quantity || 0}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="oit-row">
                              <span className="oit-name">Books not listed</span>
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
                            <span>Delivery</span>
                            {isFree ? (
                              <span className="ois-free">FREE</span>
                            ) : diff > 0 ? (
                              <span>+₹{diff}</span>
                            ) : (
                              <span>—</span>
                            )}
                          </div>
                          {diff < 0 && (
                            <div className="ois-row">
                              <span>Discount</span>
                              <span className="ois-free">−₹{-diff}</span>
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
                        <span className="detail-label">Payment Method</span>
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
                          <span className="detail-value">{order.comment}</span>
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
                        Reschedule
                      </button>
                    </div>
                  )}

                  {/* Edit address — available on every order */}
                  <button
                    type="button"
                    className="edit-address-btn"
                    onClick={() => handleEditAddressClick(order)}
                  >
                    <MapPin size={13} />
                    Edit delivery address
                  </button>

                  {order.shippingId && (
                    <div className="tracking-info-row">
                      <div className="tracking-id-display">
                        <span className="tracking-label">Tracking ID:</span>
                        <span className="tracking-id">{order.shippingId}</span>
                      </div>
                      <button
                        className="track-btn-small"
                        onClick={() => handleTrackPackage(order.shippingId)}
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
                    order.status !== "Delivered" &&
                    order.advancePaid !== "Yes" && (
                      <div className="cod-action-row">
                        <div className="cod-amount-info">
                          <span className="cod-label">
                            Pay ₹{amountToShow} now
                          </span>
                          <span className="cod-hint">or pay at delivery</span>
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

                </div>
              );
            })}
          </div>
        )}

        {loading && (
          <div className="loading-state flex flex-col items-center justify-center">
            <div className="spinner"></div>
            Getting your order details
          </div>
        )}

        {error && !showPhoneInput && (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button className="retry-btn" onClick={handleNewSearch}>
              Try Another Number
            </button>
          </div>
        )}

        {orders.length > 0 && (
          <div className="whatsapp-help-section">
            <a
              href={`https://wa.me/${SUPPORT_WHATSAPP}?text=Hi%2C%20I%20need%20help%20with%20my%20order%20from%20TheBookX`}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-help-link"
            >
              <div className="whatsapp-help-content">
                <div className="whatsapp-help-icon">
                  <FaWhatsapp size={24} color="#25D366" />
                </div>
                <div className="whatsapp-help-text">
                  <span className="whatsapp-help-title">Need any help?</span>
                  <span className="whatsapp-help-desc">
                    Chat with us on WhatsApp for quick support
                  </span>
                </div>
                <div className="whatsapp-help-arrow">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </a>
          </div>
        )}
      </div>

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
                          ? "✅ Verify Payment"
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
                  Reschedule Delivery
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
                    Preferred delivery date <span className="red">*</span>
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
                    <option value="Evening (4pm-8pm)">
                      Evening (4pm-8pm)
                    </option>
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
                  <label className="flex flex-row gap-4 items-center">
                    <MapPin size={14} /> Address <span className="red">*</span>
                  </label>
                  <textarea
                    className="sec-mid-btn textarea"
                    rows={2}
                    value={addrEdit.address}
                    onChange={(e) =>
                      setAddrEdit((p) => ({ ...p, address: e.target.value }))
                    }
                    placeholder="House / flat, street, area, landmark"
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
                    disabled={!addrEdit.address.trim() || !addrEdit.phone.trim()}
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
    </div>
  );
}
