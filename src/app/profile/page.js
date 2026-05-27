// app/my-orders/page.js
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
} from "lucide-react";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";

const SHEET_ID = "1ovqFn50d0TKjV0nm4q1lb3N9XvimUgIsHCOlHh6QRdg";

// ===== Order Tracking Timeline =====
// Renders 4-stage horizontal stepper: Ordered → Shipped → Out for Delivery → Delivered
// `stage` is the index of the most recently completed step (0-based).
function OrderTrackingTimeline({ order }) {
  // Determine current stage from order data
  const statusLower = (order.status || "").toLowerCase();
  const advancePaid = order.advancePaid === "Yes";

  // Stage detection — falls back gracefully
  let activeStage = 0; // Ordered is always done
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

  // Parse the order date — the "Timestamp" column in the sheet can hold
  // several different formats depending on when the row was written:
  //   "27/05/2026, 04:50:03 pm"   (dd/mm/yyyy, 12-hour w/ am-pm)
  //   "27/05/2026, 16:50:04"      (dd/mm/yyyy, 24-hour, NO am-pm)
  //   "Date(2026,4,27,16,50,3)"   (Google Sheets serialized — months 0-based)
  //   Date object instances       (some gviz responses)
  //   ISO strings                 (fallback)
  const parseOrderDate = (dateStr) => {
    if (!dateStr) return null;

    // Already a Date object?
    if (dateStr instanceof Date) {
      return isNaN(dateStr.getTime()) ? null : dateStr;
    }

    const str = String(dateStr).trim();

    // Google Sheets Date() literal — months are ALREADY 0-based
    if (str.startsWith("Date(")) {
      const m = str.match(/Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?/);
      if (m) {
        const year = parseInt(m[1], 10);
        const month = parseInt(m[2], 10); // already 0-based
        const day = parseInt(m[3], 10);
        const hours = m[4] ? parseInt(m[4], 10) : 0;
        const minutes = m[5] ? parseInt(m[5], 10) : 0;
        const seconds = m[6] ? parseInt(m[6], 10) : 0;
        const d = new Date(year, month, day, hours, minutes, seconds);
        if (!isNaN(d.getTime())) return d;
      }
    }

    // dd/mm/yyyy with optional time (12-hour with am/pm OR 24-hour)
    // Matches: "27/05/2026", "27/05/2026 16:50:04", "27/05/2026, 04:50:03 pm"
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

        // Convert 12-hour to 24-hour only if am/pm is present
        if (meridiem === "pm" && hours < 12) hours += 12;
        if (meridiem === "am" && hours === 12) hours = 0;

        const d = new Date(year, month, day, hours, minutes, seconds);
        if (!isNaN(d.getTime())) return d;
      }
    }

    // ISO / fallback
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  };

  // The sheet stores the human-readable date in the "Timestamp" column.
  // Use it as the primary source; fall back to other columns if missing.
  const orderDateRaw =
    order["Timestamp"] ||
    order["Timestamp (D)"] ||
    order["Timestamp(D)"] ||
    order["Order Date"];
  const orderDate = parseOrderDate(orderDateRaw);

  // Diagnostic — remove once verified working
  if (typeof window !== "undefined" && !window.__loggedOrderDate) {
    console.log("[OrderTrackingTimeline] raw Timestamp value:", orderDateRaw);
    console.log("[OrderTrackingTimeline] parsed Date:", orderDate);
    console.log("[OrderTrackingTimeline] typeof:", typeof orderDateRaw);
    window.__loggedOrderDate = true;
  }

  // Estimated delivery window: 3-15 days from order date
  const DAY_MS = 24 * 60 * 60 * 1000;
  const minDeliveryDate = orderDate
    ? new Date(orderDate.getTime() + 3 * DAY_MS)
    : null;
  const maxDeliveryDate = orderDate
    ? new Date(orderDate.getTime() + 15 * DAY_MS)
    : null;
  // Use the midpoint for the step-level "expected" date markers (~9 days)
  const estimatedDelivery = orderDate
    ? new Date(orderDate.getTime() + 9 * DAY_MS)
    : null;

  const shortDate = (d) => {
    if (!d) return "—";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const longDate = (d) => {
    if (!d) return "—";
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  // Format the delivery-window range — "30 May – 11 Jun"
  const deliveryRangeLabel = (() => {
    if (!minDeliveryDate || !maxDeliveryDate) return "—";
    return `${shortDate(minDeliveryDate)} – ${shortDate(maxDeliveryDate)}`;
  })();

  // Compute each step's date label
  const orderedDate = orderDate ? shortDate(orderDate) : "—";
  const shippedDate =
    activeStage >= 1
      ? shortDate(
          orderDate
            ? new Date(orderDate.getTime() + 1 * 24 * 60 * 60 * 1000)
            : null,
        )
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

  // Banner text — Mumbai gets a stat-driven line, others get a generic line
  const city = (order.City || "").toLowerCase();
  const bannerText = city.includes("mumbai")
    ? "95% orders delivered early in Mumbai"
    : `Most orders delivered on time across India`;

  // The "tooltip" attaches to the step that is *next* to be reached
  // (i.e. activeStage + 1, unless we're already at the final step)
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
      {/* Header */}
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

      {/* Stepper */}
      <div className="tracking-stepper">
        {/* Tooltip pointing at next step */}
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

        {/* Track line behind dots */}
        <div className="tracking-track">
          <div
            className="tracking-track-filled"
            style={{
              width: `${(activeStage / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Step dots */}
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

        {/* Step labels */}
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
                {/* <span className="tracking-step-date">{step.date}</span> */}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom banner */}
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
          // gviz returns dates as raw Date literals in `v` but human-readable
          // strings in `f`. Prefer the formatted string for date-like columns
          // so the downstream parser sees something it can handle reliably.
          const formatted = cell?.f;
          if (
            value &&
            typeof value === "object" &&
            value.hasOwnProperty("value")
          ) {
            value = value.value;
          }
          // If `v` looks like a Date literal AND we have a formatted version,
          // use the formatted human-readable string instead.
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

      // ---- Diagnostic: log the first row so we can see the actual data shape
      if (allOrders.length > 0) {
        console.log("[my-orders] first row keys:", Object.keys(allOrders[0]));
        console.log("[my-orders] Timestamp candidates:", {
          Timestamp: allOrders[0]["Timestamp"],
          "Timestamp(D)": allOrders[0]["Timestamp(D)"],
          "Order Date": allOrders[0]["Order Date"],
        });
      }
      const userOrders = allOrders.filter((order) => {
        const orderPhone = order["Phone Number"];
        return String(orderPhone).trim() === String(phone).trim();
      });
      const sortedOrders = userOrders.sort((a, b) => {
        const dateA = new Date(a["Timestamp(D)"] || a["Order Date"] || 0);
        const dateB = new Date(b["Timestamp"] || b["Order Date"] || 0);
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

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    try {
      if (typeof dateString === "string" && dateString.startsWith("Date(")) {
        const match = dateString.match(
          /Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/,
        );
        if (match) {
          const year = parseInt(match[1]);
          const month = parseInt(match[2]);
          const day = parseInt(match[3]);
          const hours = parseInt(match[4]);
          const minutes = parseInt(match[5]);
          const seconds = parseInt(match[6]);
          let date = new Date(year, month, day, hours, minutes, seconds);
          if (date.getMonth() !== month && month > 0) {
            date = new Date(year, month - 1, day, hours, minutes, seconds);
          }
          if (!isNaN(date.getTime())) return formatDateToCustomString(date);
        }
      }
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) return formatDateToCustomString(date);
      return dateString;
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
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
                        {formatDate(
                          order["Timestamp(D)"] || order["Order Date"],
                        )}
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

                  {/* NEW: Order Tracking Timeline */}
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
                    <div className="detail-item">
                      <MapPin size={14} className="gray-500" />
                      <div>
                        <span className="detail-label">Address</span>
                        <span className="detail-value">
                          {order["City"]}, {order["Pincode"]}
                        </span>
                      </div>
                    </div>
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
              href="https://wa.me/917710892108?text=Hi%2C%20I%20need%20help%20with%20my%20order%20from%20TheBookX"
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

      {/* Payment Modal — unchanged */}
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
    </div>
  );
}
