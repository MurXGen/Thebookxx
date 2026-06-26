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
  ExternalLink,
  ShoppingBag,
  ChevronDown,
  ArrowUpDown,
  Phone,
  TrendingUp,
  TrendingDown,
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
  const [sortOrder, setSortOrder] = useState("desc"); // "desc" = latest first
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [prefsLoaded, setPrefsLoaded] = useState(false);

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

    setFilteredOrders(sortByDate(filtered, sortOrder));
  }, [
    searchQuery,
    orders,
    statusFilter,
    paymentFilter,
    sortOrder,
    dateFrom,
    dateTo,
  ]);

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

        {/* ===== Colorful dashboard ===== */}
        <div className="admin-dash">
          <div className="admin-dash-top">
            <span className="admin-dash-title">Dashboard overview</span>
            <div className="flex flex-row gap-8">
              <button className="sec-mid-btn" onClick={() => fetchOrders()} title="Refresh">
                <RefreshCw size={14} /> Refresh
              </button>
              <button className="sec-mid-btn" onClick={exportToCSV} title="Export CSV">
                <Download size={14} /> Export
              </button>
            </div>
          </div>

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
        </div>

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
                  <div className="filter-group-inline">
                    <label className="font-12 dark-50">From date</label>
                    <input
                      type="date"
                      className="sec-mid-btn width100"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="filter-group-inline">
                    <label className="font-12 dark-50">To date</label>
                    <input
                      type="date"
                      className="sec-mid-btn width100"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                  {(statusFilter !== "all" ||
                    paymentFilter !== "all" ||
                    dateFrom ||
                    dateTo) && (
                    <button
                      className="sec-mid-btn"
                      onClick={() => {
                        setStatusFilter("all");
                        setPaymentFilter("all");
                        setDateFrom("");
                        setDateTo("");
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

        {/* Orders list, flattened single cards */}
        {filteredOrders.length > 0 ? (
          <div className="flex flex-col gap-4">
            <div className="orders-list-header">
              <span className="orders-count">
                {filteredOrders.length}{" "}
                {filteredOrders.length === 1 ? "Order" : "Orders"}
              </span>
            </div>
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

              const isExpanded = expandedOrders.has(orderId);
              const tintA = (0.05 + (order.revenue / maxRevenue) * 0.16).toFixed(3);
              const cardStyle = {
                background: `linear-gradient(135deg, #ffffff 0%, rgba(251,133,0,${tintA}) 100%)`,
              };

              return (
                <div
                  key={orderId || idx}
                  className="admin-order-card"
                  style={cardStyle}
                >
                  <div
                    className="aoc-head"
                    onClick={() => toggleExpanded(orderId)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="aoc-head-left">
                      <span
                        className="aoc-id"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(orderId, `order-${idx}`);
                        }}
                        title="Tap to copy Order ID"
                      >
                        {orderId}
                        {copiedId === `order-${idx}` && (
                          <Check size={10} className="text-green" style={{ marginLeft: 4 }} />
                        )}
                      </span>
                      <span className="aoc-date">
                        <Calendar size={11} />
                        {formatDate(order["Timestamp(D)"] || order["Timestamp"])}
                      </span>
                    </div>
                    <div className="aoc-head-right">
                      <span className="aoc-rev-pill">
                        ₹{order.revenue.toLocaleString()}
                      </span>
                      <div className={`order-status-badge ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{order.status}</span>
                      </div>
                      <ChevronDown
                        size={18}
                        className="aoc-chev"
                        style={{
                          transform: isExpanded ? "rotate(180deg)" : "none",
                          transition: "transform 0.25s ease",
                        }}
                      />
                    </div>
                  </div>

                  <div className="aoc-chips">
                    <button
                      type="button"
                      className="aoc-chip"
                      onClick={() => copyToClipboard(order["Customer Name"] || "", `name-${idx}`)}
                      title="Copy name"
                    >
                      <User size={13} />
                      <span>{order["Customer Name"] || "—"}</span>
                      {copiedId === `name-${idx}` ? (
                        <Check size={12} className="text-green" />
                      ) : (
                        <Copy size={12} className="gray-500" />
                      )}
                    </button>
                    <button
                      type="button"
                      className="aoc-chip"
                      onClick={() => copyToClipboard(String(order["Phone Number"] || ""), `phone-${idx}`)}
                      title="Copy phone"
                    >
                      <Phone size={13} />
                      <span>+91 {order["Phone Number"]}</span>
                      {copiedId === `phone-${idx}` ? (
                        <Check size={12} className="text-green" />
                      ) : (
                        <Copy size={12} className="gray-500" />
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
                      <Package size={13} /> Items ({books.length})
                    </div>
                    <div className="aoc-table">
                      {books.length > 0 ? (
                        books.map((b, bi) => (
                          <div key={bi} className="aoc-trow">
                            <span className="aoc-tname">{b.name}</span>
                            <span className="aoc-tqty">×{b.quantity}</span>
                            <span className="aoc-tprice">
                              {b.total > 0 ? `₹${b.total}` : b.price > 0 ? `₹${b.price}` : "—"}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="aoc-trow">
                          <span className="aoc-tname">Books not listed</span>
                          <span />
                          <span />
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
