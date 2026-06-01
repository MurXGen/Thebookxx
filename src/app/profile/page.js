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
  Notebook,
  CalendarClock,
  Ban,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";

const SHEET_ID = "1ovqFn50d0TKjV0nm4q1lb3N9XvimUgIsHCOlHh6QRdg";
const SUPPORT_PHONE = "917710892108";

// ===================================================================
// Robust date parser — used by both the timeline and formatDate.
// Handles every format the gviz response can throw at us:
//   "20/05/2026 23:14:14"          dd/mm/yyyy 24-hour (space, no comma)
//   "27/05/2026, 04:50:03 pm"      dd/mm/yyyy 12-hour with am/pm
//   "27/05/2026, 16:50:04"         dd/mm/yyyy 24-hour with comma
//   "Date(2026,4,27,16,50,3)"      Google Sheets serialized — months 0-based
//   Date object                    occasionally returned directly
//   ISO strings                    fallback
// ===================================================================
function parseAnyDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

  const str = String(value).trim();

  // Google Sheets Date() literal — months are ALREADY 0-based
  if (str.startsWith("Date(")) {
    const m = str.match(/Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?/);
    if (m) {
      const year = parseInt(m[1], 10);
      const month = parseInt(m[2], 10);
      const day = parseInt(m[3], 10);
      const hours = m[4] ? parseInt(m[4], 10) : 0;
      const minutes = m[5] ? parseInt(m[5], 10) : 0;
      const seconds = m[6] ? parseInt(m[6], 10) : 0;
      const d = new Date(year, month, day, hours, minutes, seconds);
      if (!isNaN(d.getTime())) return d;
    }
  }

  // dd/mm/yyyy with optional time (12-hour OR 24-hour, comma OR space sep)
  if (str.includes("/")) {
    const m = str.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?)?/i,
    );
    if (m) {
      const day = parseInt(m[1], 10);
      const month = parseInt(m[2], 10) - 1; // dd/mm/yyyy → 0-based
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

  // ISO / native fallback
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

// Look up the timestamp from any of the possible column names.
// Sheet header is "Timestamp (D)" *with a space* — older code missed this.
function getOrderTimestamp(order) {
  return (
    order["Timestamp (D)"] ||
    order["Timestamp(D)"] ||
    order["Timestamp"] ||
    order["Order Date"] ||
    null
  );
}

// ===== Order Tracking Timeline =====
// Renders 4-stage horizontal stepper: Ordered → Shipped → Out for Delivery → Delivered
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

  const orderDate = parseAnyDate(getOrderTimestamp(order));

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

  const shortDate = (d) =>
    d ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—";

  const longDate = (d) =>
    d
      ? d.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        })
      : "—";

  const deliveryRangeLabel =
    minDeliveryDate && maxDeliveryDate
      ? `${shortDate(minDeliveryDate)} – ${shortDate(maxDeliveryDate)}`
      : "—";

  const orderedDate = orderDate ? shortDate(orderDate) : "—";
  const shippedDate =
    activeStage >= 1
      ? shortDate(orderDate ? new Date(orderDate.getTime() + DAY_MS) : null)
      : "Soon";
  const outForDeliveryDate =
    activeStage >= 2
      ? shortDate(estimatedDelivery)
      : estimatedDelivery
        ? shortDate(estimatedDelivery)
        : "—";
  const deliveredDate =
    activeStage >= 3
      ? shortDate(new Date())
      : estimatedDelivery
        ? shortDate(estimatedDelivery)
        : "—";

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
    : "Most orders delivered on time across India";

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
            {activeStage === 3
              ? `Delivered on ${longDate(new Date())}`
              : `Delivery expected ${deliveryRangeLabel}`}
          </span>
        </div>
      </div>

      <div className="tracking-stepper">
        {tooltipLabel && tooltipStage !== null && (
          <div
            className="tracking-tooltip"
            style={{
              left: `calc(${(tooltipStage / (steps.length - 1)) * 100}% - 0px)`,
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

  // NEW — reschedule modal state
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleOrder, setRescheduleOrder] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTimeSlot, setRescheduleTimeSlot] = useState("");
  const [rescheduleNotes, setRescheduleNotes] = useState("");

  // NEW — cancel confirmation modal state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelOrder, setCancelOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const UPI_ID = "7977960242-1@okbizaxis";

  useEffect(() => {
    const savedPhone = localStorage.getItem("track_orders_phone");
    const savedName = localStorage.getItem("track_orders_name");
    if (savedPhone) {
      setPhoneNumber(savedPhone);
      if (savedName) setCustomerName(savedName);
      fetchOrders(savedPhone);
      setShowPhoneInput(false);
    }
  }, []);

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

      // Sort newest-first using the robust parser
      const sortedOrders = userOrders.sort((a, b) => {
        const dateA = parseAnyDate(getOrderTimestamp(a));
        const dateB = parseAnyDate(getOrderTimestamp(b));
        const tsA = dateA ? dateA.getTime() : 0;
        const tsB = dateB ? dateB.getTime() : 0;
        return tsB - tsA;
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
      setOrders(parsedOrders);
      if (parsedOrders.length === 0) {
        setError(`No profile found for phone number ${phone}`);
      } else {
        setShowPhoneInput(false);
        localStorage.setItem("track_orders_phone", phone);
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

  // -----------------------------------------------------------------
  // Cancel & Reschedule eligibility + handlers
  // -----------------------------------------------------------------
  const canCancelOrder = (order) => {
    const s = (order.status || "").toLowerCase();
    if (s.includes("delivered") || s.includes("cancelled")) return false;
    if (
      s.includes("shipped") ||
      s.includes("in transit") ||
      s.includes("out for delivery") ||
      s.includes("dispatched")
    )
      return false;
    return true; // pending, placed, empty → cancellable
  };

  const canRescheduleOrder = (order) => {
    const s = (order.status || "").toLowerCase();
    if (s.includes("delivered") || s.includes("cancelled")) return false;
    return (
      s.includes("shipped") ||
      s.includes("in transit") ||
      s.includes("out for delivery") ||
      s.includes("dispatched")
    );
  };

  // ===== Cancel — opens confirm modal, then redirects to WhatsApp =====
  const handleOpenCancel = (order) => {
    setCancelOrder(order);
    setCancelReason("");
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = () => {
    const order = cancelOrder;
    if (!order) return;

    const orderId = order["Order ID"] || "—";
    const customer = order["Customer Name"] || customerName || "Customer";
    const phone = order["Phone Number"] || phoneNumber;
    const orderDate = formatDate(getOrderTimestamp(order));
    const total = order["Total Amount"] || "—";
    const itemsList = (order.parsedBooks || [])
      .map((b, i) => `${i + 1}. ${b.name} × ${b.quantity}`)
      .join("\n");

    const message = `🚫 *ORDER CANCELLATION REQUEST*

Hi TheBookX 👋

I'd like to cancel the following order:

📋 *Order ID:* ${orderId}
👤 *Name:* ${customer}
📞 *Phone:* ${phone}
📅 *Order Date:* ${orderDate}
💰 *Total:* ₹${total}

*Items:*
${itemsList || "(see order)"}
${cancelReason ? `\n📝 *Reason:* ${cancelReason}` : ""}

Please confirm the cancellation. Thank you!`;

    window.open(
      `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(message)}`,
      "_blank",
    );

    setShowCancelConfirm(false);
    setCancelOrder(null);
    setCancelReason("");
  };

  // ===== Reschedule — opens modal, collects date/time, redirects to WhatsApp =====
  const handleOpenReschedule = (order) => {
    setRescheduleOrder(order);
    setRescheduleDate("");
    setRescheduleTimeSlot("");
    setRescheduleNotes("");
    setShowRescheduleModal(true);
  };

  const handleSubmitReschedule = () => {
    if (!rescheduleDate || !rescheduleTimeSlot) {
      alert("Please pick a date and a time slot");
      return;
    }
    const order = rescheduleOrder;
    if (!order) return;

    const orderId = order["Order ID"] || "—";
    const customer = order["Customer Name"] || customerName || "Customer";
    const phone = order["Phone Number"] || phoneNumber;
    const address = [
      order["Address"],
      order["City"],
      order["State"],
      order["Pincode"] ? `- ${order["Pincode"]}` : "",
    ]
      .filter(Boolean)
      .join(", ");

    const niceDate = (() => {
      try {
        const d = new Date(rescheduleDate);
        return d.toLocaleDateString("en-IN", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
      } catch {
        return rescheduleDate;
      }
    })();

    const message = `📅 *DELIVERY RESCHEDULE REQUEST*

Hi TheBookX 👋

I'd like to reschedule the delivery for:

📋 *Order ID:* ${orderId}
👤 *Name:* ${customer}
📞 *Phone:* ${phone}
📍 *Address:* ${address || "(see order)"}

🗓️ *Preferred Date:* ${niceDate}
⏰ *Preferred Time:* ${rescheduleTimeSlot}${rescheduleNotes ? `\n📝 *Notes:* ${rescheduleNotes}` : ""}

Please confirm the new slot. Thank you!`;

    window.open(
      `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(message)}`,
      "_blank",
    );

    setShowRescheduleModal(false);
    setRescheduleOrder(null);
    setRescheduleDate("");
    setRescheduleTimeSlot("");
    setRescheduleNotes("");
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

  const isPaymentDue = (order) => {
    const paymentType = order["Payment Type"] || "";
    const status = order.status;
    const advancePaid = order.advancePaid === "Yes";
    if (paymentType.includes("Cash on Delivery")) {
      return status !== "Delivered" && !advancePaid;
    }
    return false;
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

  // -----------------------------------------------------------------
  // Date formatting — uses the robust parser, so it handles every
  // sheet format including "20/05/2026 23:14:14"
  // -----------------------------------------------------------------
  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    const parsed = parseAnyDate(dateString);
    if (parsed) return formatDateToCustomString(parsed);
    return String(dateString); // fallback to raw
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

  // Min date for reschedule input — today
  const todayIso = new Date().toISOString().split("T")[0];

  return (
    <div className="my-orders-page">
      <div className="section-1200 flex flex-col gap-24">
        {/* Header */}
        <div className="orders-header">
          <Link href="/" className="flex flex-row gap-8 items-center">
            <ArrowLeft size={18} />
            <div className="flex flex-col">
              <h1 className="font-24">Profile</h1>
              <p className="font-12 dark-50">
                Manage your profile and orders history.
              </p>
            </div>
          </Link>
        </div>

        {/* Phone Input Section */}
        <AnimatePresence mode="wait">
          {showPhoneInput ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="phone-search-section"
            >
              <div className="flex flex-row gap-12 width100">
                <input
                  type="tel"
                  className="sec-mid-btn width100"
                  placeholder="Enter your 10-digit mobile number"
                  value={phoneNumber}
                  maxLength={10}
                  onChange={(e) =>
                    setPhoneNumber(e.target.value.replace(/\D/g, ""))
                  }
                  onKeyPress={(e) => e.key === "Enter" && fetchOrders()}
                />
                <button
                  className="pri-big-btn width100"
                  onClick={() => fetchOrders()}
                  style={{ maxWidth: "fit-content" }}
                  disabled={loading}
                >
                  {loading ? "Searching..." : <span>Submit</span>}
                </button>
              </div>
              {error && <p className="error-message">{error}</p>}
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
                  <button className="sec-mid-btn" onClick={handleNewSearch}>
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
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
              const paymentStatus = getPaymentStatusMessage(order);
              const amountToShow = getAmountToShow(order);
              const hasComment = order.comment && order.comment.trim() !== "";
              const showCancel = canCancelOrder(order);
              const showReschedule = canRescheduleOrder(order);

              return (
                <div key={idx} className="order-card">
                  {/* Order Header */}
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
                        {formatDate(getOrderTimestamp(order))}
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

                  {/* Tracking Timeline */}
                  <OrderTrackingTimeline order={order} />

                  {/* Order Items Preview */}
                  <div className="order-items-preview">
                    <div className="items-icon">
                      <Package size={16} />
                    </div>
                    <div className="items-list">
                      {order.parsedBooks?.slice(0, 2).map((book, bidx) => (
                        <span key={bidx} className="item-name">
                          {book.name}
                          {bidx === 0 &&
                            order.parsedBooks?.length > 1 &&
                            ` + ${order.parsedBooks.length - 1} more`}
                        </span>
                      ))}
                      {(!order.parsedBooks ||
                        order.parsedBooks.length === 0) && (
                        <span className="item-name">Books not listed</span>
                      )}
                    </div>
                  </div>

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

                  {order.advancePaid === "Yes" && (
                    <div className="advance-paid-badge">
                      <BadgeCheck size={12} />
                      <span>Advance payment of ₹99 completed</span>
                    </div>
                  )}

                  {/* NEW — Cancel / Reschedule action row */}
                  {(showCancel || showReschedule) && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 8,
                        marginTop: 12,
                      }}
                    >
                      {showCancel && (
                        <button
                          type="button"
                          onClick={() => handleOpenCancel(order)}
                          style={{
                            flex: 1,
                            padding: "10px 12px",
                            border: "1px solid var(--danger, #ef4444)",
                            background: "transparent",
                            color: "var(--danger, #ef4444)",
                            borderRadius: 8,
                            fontWeight: 600,
                            fontSize: 12,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                          }}
                        >
                          <Ban size={14} />
                          Cancel Order
                        </button>
                      )}
                      {showReschedule && (
                        <button
                          type="button"
                          onClick={() => handleOpenReschedule(order)}
                          style={{
                            flex: 1,
                            padding: "10px 12px",
                            border: "1px solid var(--tertiary, #fb8500)",
                            background: "var(--tertiary-10, #fb850010)",
                            color: "var(--tertiary, #fb8500)",
                            borderRadius: 8,
                            fontWeight: 600,
                            fontSize: 12,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                          }}
                        >
                          <CalendarClock size={14} />
                          Reschedule Delivery
                        </button>
                      )}
                    </div>
                  )}

                  <details className="order-details">
                    <summary className="order-details-summary">
                      <span>View Order Details</span>
                      <ChevronRight size={16} />
                    </summary>
                    <div className="order-details-content">
                      <div className="full-address">
                        <h4>Delivery Address</h4>
                        <p>
                          {order["Address"]}, {order["City"]}, {order["State"]}{" "}
                          - {order["Pincode"]}
                        </p>
                      </div>
                      <div className="all-books">
                        <h4>Order Items ({order.parsedBooks?.length || 0})</h4>
                        {order.parsedBooks && order.parsedBooks.length > 0 ? (
                          order.parsedBooks.map((book, bidx) => (
                            <div key={bidx} className="book-row">
                              <span className="book-name">{book.name}</span>
                              <div className="flex flex-row items-center gap-12 font-12 justify-between width100">
                                <div className="flex flex-row gap-12">
                                  {book.quantity > 0 && (
                                    <span>Qty: {book.quantity}</span>
                                  )}
                                  {book.price > 0 && (
                                    <span>₹{book.price} each</span>
                                  )}
                                </div>
                                {book.total > 0 && (
                                  <span className="book-total">
                                    ₹{book.total}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="no-books">Book details not available</p>
                        )}
                      </div>
                      {order["Delivery Charge"] > 0 && (
                        <div className="delivery-charge">
                          <span>Delivery Charge</span>
                          <span>+₹{order["Delivery Charge"]}</span>
                        </div>
                      )}
                      {order["Gift Wrap"] === "Yes" && (
                        <div className="gift-wrap-info">
                          <Gift size={14} />
                          <span>
                            Gift Wrap included (+₹{order["Gift Wrap Charge"]})
                          </span>
                        </div>
                      )}
                    </div>
                  </details>
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
              href={`https://wa.me/${SUPPORT_PHONE}?text=Hi%2C%20I%20need%20help%20with%20my%20order%20from%20TheBookX`}
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

      {/* ===== Payment Modal — unchanged ===== */}
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

      {/* ===== NEW — Cancel Confirmation Modal ===== */}
      <AnimatePresence>
        {showCancelConfirm && cancelOrder && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCancelConfirm(false)}
          >
            <motion.div
              className="bill-modal"
              style={{ maxWidth: 480 }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <span className="weight-600 font-16">Cancel this order?</span>
                <span
                  className="cursor-pointer"
                  onClick={() => setShowCancelConfirm(false)}
                >
                  <X size={16} />
                </span>
              </div>

              <div
                style={{
                  padding: "16px 20px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {/* Warning card */}
                <div
                  style={{
                    padding: 14,
                    background:
                      "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.03) 100%)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: 10,
                    display: "flex",
                    flexDirection: "row",
                    gap: 10,
                    alignItems: "flex-start",
                  }}
                >
                  <AlertTriangle
                    size={18}
                    style={{
                      color: "var(--danger, #ef4444)",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  />
                  <div>
                    <div className="font-13 weight-600">
                      This will send a cancellation request to our team
                    </div>
                    <div
                      className="font-11 dark-50"
                      style={{ marginTop: 4, lineHeight: 1.4 }}
                    >
                      We&apos;ll confirm via WhatsApp. Cancellation is possible
                      only before the order is shipped.
                    </div>
                  </div>
                </div>

                {/* Order info */}
                <div
                  style={{
                    padding: 12,
                    background: "var(--dark-4)",
                    borderRadius: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <span className="font-12 dark-50">Order ID</span>
                  <span className="font-14 weight-600">
                    {cancelOrder["Order ID"]}
                  </span>
                  <span className="font-12" style={{ marginTop: 4 }}>
                    Total: ₹{cancelOrder["Total Amount"]}
                  </span>
                </div>

                {/* Optional reason */}
                <div className="input-group">
                  <label className="font-12 weight-500">
                    Reason for cancellation (optional)
                  </label>
                  <textarea
                    className="sec-mid-btn textarea"
                    rows={2}
                    placeholder="Tell us why — helps us improve"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                </div>

                {/* CTAs */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    marginTop: 4,
                  }}
                >
                  <button
                    type="button"
                    onClick={handleConfirmCancel}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "none",
                      background: "var(--danger, #ef4444)",
                      color: "#fff",
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <FaWhatsapp size={16} />
                    Send Cancellation Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(false)}
                    className="sec-mid-btn width100"
                    style={{ padding: "10px 16px" }}
                  >
                    Keep my order
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== NEW — Reschedule Modal ===== */}
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
              style={{ maxWidth: 500 }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <span className="weight-600 font-16">Reschedule Delivery</span>
                <span
                  className="cursor-pointer"
                  onClick={() => setShowRescheduleModal(false)}
                >
                  <X size={16} />
                </span>
              </div>

              <div
                style={{
                  padding: "16px 20px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {/* Order info card */}
                <div
                  style={{
                    padding: 12,
                    background:
                      "linear-gradient(135deg, var(--tertiary-10, #fb850010) 0%, var(--tertiary-light-10, #ffb70310) 100%)",
                    border: "1px solid var(--tertiary, #fb8500)",
                    borderRadius: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <span className="font-12 dark-50">Rescheduling</span>
                  <span className="font-14 weight-600">
                    {rescheduleOrder["Order ID"]}
                  </span>
                  <span className="font-11 dark-50" style={{ marginTop: 2 }}>
                    We&apos;ll confirm the new slot via WhatsApp
                  </span>
                </div>

                {/* Date picker */}
                <div className="input-group">
                  <label className="flex flex-row gap-4 items-center font-12 weight-500">
                    <Calendar size={14} />
                    Preferred Date <span className="red">*</span>
                  </label>
                  <input
                    type="date"
                    className="sec-mid-btn width100"
                    value={rescheduleDate}
                    min={todayIso}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                  />
                </div>

                {/* Time slot picker */}
                <div className="input-group">
                  <label className="flex flex-row gap-4 items-center font-12 weight-500">
                    <Clock size={14} />
                    Preferred Time Slot <span className="red">*</span>
                  </label>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      marginTop: 4,
                    }}
                  >
                    {[
                      {
                        value: "Morning (9 AM - 12 PM)",
                        label: "Morning",
                        sub: "9 AM – 12 PM",
                      },
                      {
                        value: "Afternoon (12 PM - 4 PM)",
                        label: "Afternoon",
                        sub: "12 PM – 4 PM",
                      },
                      {
                        value: "Evening (4 PM - 7 PM)",
                        label: "Evening",
                        sub: "4 PM – 7 PM",
                      },
                    ].map((slot) => {
                      const isSelected = rescheduleTimeSlot === slot.value;
                      return (
                        <button
                          key={slot.value}
                          type="button"
                          onClick={() => setRescheduleTimeSlot(slot.value)}
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 14px",
                            border: `1.5px solid ${
                              isSelected
                                ? "var(--tertiary, #fb8500)"
                                : "var(--dark-10)"
                            }`,
                            background: isSelected
                              ? "var(--tertiary-10, #fb850010)"
                              : "var(--background)",
                            borderRadius: 8,
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          <div className="flex flex-col">
                            <span
                              className="font-13"
                              style={{
                                fontWeight: isSelected ? 600 : 500,
                                color: isSelected
                                  ? "var(--tertiary, #fb8500)"
                                  : "var(--foreground)",
                              }}
                            >
                              {slot.label}
                            </span>
                            <span className="font-10 dark-50">{slot.sub}</span>
                          </div>
                          {isSelected && (
                            <Check
                              size={16}
                              style={{ color: "var(--tertiary, #fb8500)" }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional notes */}
                <div className="input-group">
                  <label className="font-12 weight-500">
                    Additional notes (optional)
                  </label>
                  <textarea
                    className="sec-mid-btn textarea"
                    rows={2}
                    placeholder="Any special instructions for the delivery person..."
                    value={rescheduleNotes}
                    onChange={(e) => setRescheduleNotes(e.target.value)}
                  />
                </div>

                {/* Submit */}
                <button
                  className="pri-big-btn width100 flex flex-row items-center justify-center gap-8"
                  onClick={handleSubmitReschedule}
                  disabled={!rescheduleDate || !rescheduleTimeSlot}
                  style={{
                    opacity: !rescheduleDate || !rescheduleTimeSlot ? 0.6 : 1,
                    cursor:
                      !rescheduleDate || !rescheduleTimeSlot
                        ? "not-allowed"
                        : "pointer",
                    padding: "12px 16px",
                  }}
                >
                  <FaWhatsapp size={16} />
                  Send Reschedule Request
                </button>

                <span
                  className="font-10 dark-50"
                  style={{ textAlign: "center" }}
                >
                  Opens WhatsApp with your request prefilled
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
