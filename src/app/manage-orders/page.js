// app/manage-orders/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

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
  advancePaid: "entry.392734436",
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
// Returns null if it can't be parsed — callers use that to push the
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

// Pick the best timestamp field on an order and return it as a Date (or null).
// We check the timestamp fields in order of preference.
const getOrderDate = (order) =>
  parseAnyDate(order["Timestamp(D)"]) ||
  parseAnyDate(order["Timestamp"]) ||
  parseAnyDate(order["Order Date"]);

// Sort newest first. Orders without a parseable date go to the bottom.
const sortByDateDesc = (list) =>
  [...list].sort((a, b) => {
    const da = getOrderDate(a);
    const db = getOrderDate(b);
    if (!da && !db) return 0;
    if (!da) return 1; // a goes after b
    if (!db) return -1; // b goes after a
    return db.getTime() - da.getTime();
  });

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

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);
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
        return order;
      });

      // Newest first (proper date parsing so the comparison actually works)
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

  // Apply filters — re-sort at the end so search/filter results stay newest-first
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

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order["Order Status"] === statusFilter,
      );
    }

    if (paymentFilter !== "all") {
      filtered = filtered.filter(
        (order) => order["Payment Type"] === paymentFilter,
      );
    }

    setFilteredOrders(sortByDateDesc(filtered));
  }, [searchQuery, orders, statusFilter, paymentFilter]);

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
    // In your checkout submission
    params.append(FORM_FIELD_IDS.advancePaid, advancePaid ? "Yes" : "No");

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

    const originalTimestamp =
      selectedOrder["Timestamp"] || formatDateForSheet(new Date());

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
    params.append(FORM_FIELD_IDS.advancePaid, advancePaid ? "Yes" : "No");

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
      timestamp: order["Timestamp"] || "",
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

  // Stats
  const totalRevenue = filteredOrders.reduce(
    (sum, o) => sum + (parseFloat(o["Total Amount"]) || 0),
    0,
  );
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
        {/* Header — same shape as my-orders */}
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

        {/* Admin info card — same shape as the "Welcome back" card */}
        <div className="customer-info-section">
          <div className="customer-info-card">
            <div className=" flex flex-row gap-12">
              <div className="customer-details">
                <span className="customer-label">Admin Panel</span>
                <span className="customer-name">
                  {filteredOrders.length} Orders
                </span>
                <span className="customer-phone">
                  Total Revenue ₹{totalRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-row gap-8">
                <button
                  className="sec-mid-btn"
                  onClick={() => fetchOrders()}
                  title="Refresh"
                >
                  <RefreshCw size={14} />
                  Refresh
                </button>
                <button
                  className="sec-mid-btn"
                  onClick={exportToCSV}
                  title="Export CSV"
                >
                  <Download size={14} />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search + Filter row — matches phone-search-section pattern */}
        <div className="phone-search-section">
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
              {(statusFilter !== "all" || paymentFilter !== "all") && (
                <span className="orange weight-600">●</span>
              )}
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
                <div className="filter-row-inline">
                  <div className="filter-group-inline">
                    <label className="font-12 dark-50">Order Status</label>
                    <select
                      className="sec-mid-btn width100"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="filter-group-inline">
                    <label className="font-12 dark-50">Payment Type</label>
                    <select
                      className="sec-mid-btn width100"
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                    >
                      <option value="all">All Payments</option>
                      <option value="COD">Cash on Delivery</option>
                      <option value="UPI Payment">UPI Payment</option>
                      <option value="Card Payment">Card Payment</option>
                    </select>
                  </div>
                  {(statusFilter !== "all" || paymentFilter !== "all") && (
                    <button
                      className="sec-mid-btn"
                      onClick={() => {
                        setStatusFilter("all");
                        setPaymentFilter("all");
                      }}
                    >
                      <X size={14} /> Clear
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick stats row — minimal, matches the lightweight feel */}
        <div className="admin-stats-row">
          <div className="admin-stat">
            <span className="admin-stat-value">{filteredOrders.length}</span>
            <span className="admin-stat-label">Total</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-value">{deliveredCount}</span>
            <span className="admin-stat-label">Delivered</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-value">{inTransitCount}</span>
            <span className="admin-stat-label">In Transit</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-value">{withTrackingCount}</span>
            <span className="admin-stat-label">With Tracking</span>
          </div>
        </div>

        {/* Orders list — same card structure as my-orders */}
        {filteredOrders.length > 0 ? (
          <div className="flex flex-col gap-4">
            <div className="orders-list-header">
              <span className="orders-count">
                {filteredOrders.length}{" "}
                {filteredOrders.length === 1 ? "Order" : "Orders"}
              </span>
            </div>
            {filteredOrders.map((order, idx) => (
              <div key={idx} className="order-card">
                {/* Order Header */}
                <div className="order-card-header">
                  <div className="order-id-section">
                    <span className="order-id-label">Order ID</span>
                    <span
                      className="order-id-value cursor-pointer flex flex-row gap-4 items-center"
                      onClick={() =>
                        copyToClipboard(order["Order ID"], `order-${idx}`)
                      }
                    >
                      {order["Order ID"]}
                      {copiedId === `order-${idx}` ? (
                        <Check size={12} className="text-green" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </span>
                  </div>
                  <div className="order-date-section">
                    <Calendar size={14} />
                    <span className="time-full">
                      {formatDate(order["Timestamp(D)"] || order["Timestamp"])}
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

                {/* Customer line — admin-only addition (sits between header and items) */}
                <div className="admin-customer-line">
                  <div className="flex flex-row gap-4 items-center">
                    <User size={24} className="gray-500" />
                    <span className="weight-600">{order["Customer Name"]}</span>
                  </div>
                  <div
                    className="flex flex-row gap-4 items-center cursor-pointer"
                    onClick={() =>
                      copyToClipboard(order["Phone Number"], `phone-${idx}`)
                    }
                  >
                    <span className="gray-500 font-12">
                      {order["Phone Number"]}
                    </span>
                    {copiedId === `phone-${idx}` ? (
                      <Check size={12} className="text-green" />
                    ) : (
                      <Copy size={12} className="gray-500" />
                    )}
                  </div>
                </div>

                {/* Items Preview */}
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

                {/* Details Grid */}
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

                {/* Tracking Info */}
                {order.shippingId && String(order.shippingId).trim() !== "" && (
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

                {/* Expandable Details */}
                <details className="order-details">
                  <summary className="order-details-summary">
                    <span>View Order Details</span>
                    <ChevronRight size={16} />
                  </summary>
                  <div className="order-details-content">
                    <div className="full-address">
                      <h4>Delivery Address</h4>
                      <p>
                        {order["Address"]}, {order["City"]}, {order["State"]} -{" "}
                        {order["Pincode"]}
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

                    {order["Offer Applied"] && (
                      <div className="delivery-charge">
                        <span>Offer Applied</span>
                        <span>{order["Offer Applied"]}</span>
                      </div>
                    )}

                    {order["TinyURL"] && (
                      <div className="full-address">
                        <h4>Order Link</h4>
                        <a
                          href={order["TinyURL"]}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {order["TinyURL"]}
                        </a>
                      </div>
                    )}
                  </div>
                </details>

                {/* Admin-only edit action — uses same style as the cod-action-row pattern */}
                <div className="admin-edit-row">
                  <button
                    className="pri-big-btn width100"
                    onClick={() => openEditModal(order)}
                  >
                    <Edit size={14} />
                    Edit Order
                  </button>
                </div>
              </div>
            ))}
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
      </div>

      {/* Add/Edit Modal — kept as-is, uses existing bill-modal classes */}
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
                      placeholder="e.g., ₹100 OFF"
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
                    placeholder="e.g., CM160465548IN or tracking number"
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
