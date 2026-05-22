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
} from "lucide-react";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";

// Your Google Sheet ID
const SHEET_ID = "1ovqFn50d0TKjV0nm4q1lb3N9XvimUgIsHCOlHh6QRdg";

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

  // Load saved phone number from localStorage
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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
          if (
            value &&
            typeof value === "object" &&
            value.hasOwnProperty("value")
          ) {
            value = value.value;
          }
          order[header] = value;
        });
        return order;
      });

      const userOrders = allOrders.filter((order) => {
        const orderPhone = order["Phone Number"];
        const orderPhoneStr = String(orderPhone).trim();
        const inputPhoneStr = String(phone).trim();
        return orderPhoneStr === inputPhoneStr;
      });

      // Sort orders by timestamp (newest first)
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

  const getAdvanceAmount = (order) => {
    const total = parseFloat(order["Total Amount"]) || 0;
    const paymentType = order["Payment Type"] || "";
    if (paymentType.includes("Cash on Delivery")) {
      return Math.min(99, total);
    }
    return total;
  };

  const getRemainingAmount = (order) => {
    const total = parseFloat(order["Total Amount"]) || 0;
    const paymentType = order["Payment Type"] || "";
    if (paymentType.includes("Cash on Delivery")) {
      return total - 99;
    }
    return 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";

    try {
      // Handle Google Sheets serialized date format: Date(2026,4,20,23,14,14)
      if (typeof dateString === "string" && dateString.startsWith("Date(")) {
        const match = dateString.match(
          /Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/,
        );
        if (match) {
          const year = parseInt(match[1]);
          const month = parseInt(match[2]); // Google Sheets months are 0-indexed? Let's check
          const day = parseInt(match[3]);
          const hours = parseInt(match[4]);
          const minutes = parseInt(match[5]);
          const seconds = parseInt(match[6]);

          // Create date - if month is 4 (April), it might be 0-indexed or 1-indexed
          // Try both approaches
          let date = new Date(year, month, day, hours, minutes, seconds);

          // If the date seems off (e.g., shows wrong month), try with month-1
          if (date.getMonth() !== month && month > 0) {
            date = new Date(year, month - 1, day, hours, minutes, seconds);
          }

          if (!isNaN(date.getTime())) {
            return formatDateToCustomString(date);
          }
        }
      }

      // Handle standard Date objects or ISO strings
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return formatDateToCustomString(date);
      }

      // If all parsing fails, return original
      return dateString;
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };

  // Helper function to format date as "21st May, 2026 | 11:00pm"
  const formatDateToCustomString = (date) => {
    const day = date.getDate();
    const month = date.toLocaleString("en-IN", { month: "long" });
    const year = date.getFullYear();

    // Add ordinal suffix to day (st, nd, rd, th)
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

    // Format time to 12-hour format with am/pm
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedTime = `${hours}:${formattedMinutes}${ampm}`;

    return `${formattedDay} ${month}, ${year} | ${formattedTime}`;
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "";

    try {
      let date;

      // Handle Google Sheets serialized date format: Date(2026,4,20,23,14,14)
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

          date = new Date(year, month, day, hours, minutes, seconds);

          // If the date seems off, try with month-1
          if (date.getMonth() !== month && month > 0) {
            date = new Date(year, month - 1, day, hours, minutes, seconds);
          }
        }
      } else {
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) return "";

      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60)
        return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
      if (diffHours < 24)
        return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
      if (diffDays < 7)
        return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
      if (diffDays < 30)
        return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) === 1 ? "" : "s"} ago`;
      if (diffDays < 365)
        return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) === 1 ? "" : "s"} ago`;
      return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) === 1 ? "" : "s"} ago`;
    } catch {
      return "";
    }
  };

  return (
    <div className="my-orders-page">
      <div className="section-1200 flex flex-col gap-24">
        {/* Header with Back Button */}
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
                  <button className="edit-number-btn" onClick={handleNewSearch}>
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
            {orders.map((order, idx) => (
              <div key={idx} className="order-card">
                {/* Order Header */}
                <div className="order-card-header">
                  <div className="order-id-section">
                    <span className="order-id-label">Order ID</span>
                    <span className="order-id-value">{order["Order ID"]}</span>
                  </div>
                  <div className="order-date-section">
                    <Calendar size={14} />
                    <span className="time-full">
                      {formatDate(order["Timestamp(D)"] || order["Order Date"])}
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
                    {(!order.parsedBooks || order.parsedBooks.length === 0) && (
                      <span className="item-name">Books not listed</span>
                    )}
                  </div>
                </div>

                {/* Order Details Grid */}
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

                {/* Tracking Info if available */}
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

                {/* COD Payment Action */}
                {order["Payment Type"]?.includes("Cash on Delivery") &&
                  order.status !== "Delivered" && (
                    <div className="cod-action-row">
                      <div className="cod-amount-info">
                        <span className="cod-label">
                          Pay ₹{getRemainingAmount(order)} now
                        </span>
                        <span className="cod-hint">or pay at delivery</span>
                      </div>
                      <button
                        className="pay-now-btn-small"
                        onClick={() => handlePayNow(order)}
                      >
                        <CreditCard size={14} />
                        Pay Advance
                      </button>
                    </div>
                  )}

                {/* Expand/Collapse for More Details */}
                <details className="order-details">
                  <summary className="order-details-summary">
                    <span>View Order Details</span>
                    <ChevronRight size={16} />
                  </summary>
                  <div className="order-details-content">
                    {/* Full Address */}
                    <div className="full-address">
                      <h4>Delivery Address</h4>
                      <p>
                        {order["Address"]}, {order["City"]}, {order["State"]} -{" "}
                        {order["Pincode"]}
                      </p>
                    </div>

                    {/* All Books */}
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

                    {/* Delivery Charges */}
                    {order["Delivery Charge"] > 0 && (
                      <div className="delivery-charge">
                        <span>Delivery Charge</span>
                        <span>+₹{order["Delivery Charge"]}</span>
                      </div>
                    )}

                    {/* Gift Wrap */}
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
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Fetching your orders...</p>
          </div>
        )}

        {/* Error State */}
        {error && !showPhoneInput && (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button className="retry-btn" onClick={handleNewSearch}>
              Try Another Number
            </button>
          </div>
        )}

        {/* Need Help Section */}
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

      {/* Payment Modal */}
      {showPaymentModal && selectedOrder && (
        <div
          className="bill-modal-overlay"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="bill-modal"
            style={{ maxWidth: "500px" }}
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
              <div className="payment-order-summary">
                <div className="flex justify-between">
                  <span>Order Total</span>
                  <span>₹{selectedOrder["Total Amount"]}</span>
                </div>
                <div className="flex justify-between orange">
                  <span>Advance Payment</span>
                  <span>₹{getAdvanceAmount(selectedOrder)}</span>
                </div>
                {selectedOrder["Payment Type"]?.includes(
                  "Cash on Delivery",
                ) && (
                  <div className="flex justify-between">
                    <span>Remaining Due</span>
                    <span>₹{getRemainingAmount(selectedOrder)}</span>
                  </div>
                )}
                <div className="dashed-border my-12"></div>
                <div className="flex justify-between weight-600">
                  <span>Total Amount Due</span>
                  <span className="green weight-700 font-20">
                    ₹{getRemainingAmount(selectedOrder)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-16">
                <motion.div
                  className="qr-wrapper"
                  animate={{ filter: qrUnlocked ? "blur(0px)" : "blur(12px)" }}
                  transition={{ duration: 0.5 }}
                >
                  <Image
                    src="/books/uskillbook.png"
                    alt="UPI QR Code for payment"
                    width={280}
                    height={280}
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
          </div>
        </div>
      )}
    </div>
  );
}
