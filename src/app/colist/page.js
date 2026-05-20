// app/colist/page.js
"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  Download,
  Plus,
  Filter,
  X,
  TrendingUp,
  TrendingDown,
  Calculator,
  DollarSign,
  PlusCircle,
  Trash2,
  Edit2,
  Star,
} from "lucide-react";
import Link from "next/link";
import { getAllOrders, updateOrder, deleteOrder } from "@/utils/indexDB";
import OrderCard from "./OrderCard";
import AddCustomOrderModal from "./AddCustomOrderModal";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PACKING_ACTUAL_COST = 25;
const PACKING_CHARGE_CUSTOMER = 50;
const STANDARD_DELIVERY_ACTUAL_COST = 65;
const BELOW_599_DELIVERY_ACTUAL_COST = 90;

const calculateProfitLoss = (order) => {
  const totalBookCost =
    order.books?.reduce((sum, book) => {
      const bookCost = book.price * 0.6;
      return sum + bookCost * book.quantity;
    }, 0) || 0;

  const sellingPrice = order.totalAmount || 0;

  let deliveryActualCost = STANDARD_DELIVERY_ACTUAL_COST;
  if (order.totalAmount < 599) {
    deliveryActualCost = BELOW_599_DELIVERY_ACTUAL_COST;
  } else if (order.totalAmount >= 799) {
    deliveryActualCost = order.totalAmount * 0.15;
  }

  const packingActualCost = PACKING_ACTUAL_COST;
  const totalCost = totalBookCost + deliveryActualCost + packingActualCost;
  const totalRevenue = sellingPrice - (order.offerDiscount || 0);
  const profit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  return {
    totalBookCost,
    sellingPrice,
    deliveryActualCost,
    packingActualCost,
    totalCost,
    profit,
    margin,
  };
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// Filter options without emojis
const FILTER_OPTIONS = {
  SHIPPED: "shipped",
  NOT_SHIPPED: "not_shipped",
  DELIVERED: "delivered",
  ADVANCE_PAID: "advance_paid",
  PENDING: "pending",
  PAID: "paid",
  STARRED: "starred",
};

export default function COListPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [exporting, setExporting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    name: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
  });
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    shipped: false,
    not_shipped: false,
    delivered: false,
    advance_paid: false,
    pending: false,
    paid: false,
    starred: false,
  });
  const [isPLExpanded, setIsPLExpanded] = useState(true);

  // Load expenses and starred orders from localStorage
  useEffect(() => {
    const savedExpenses = localStorage.getItem("colist_expenses");
    if (savedExpenses) {
      try {
        setExpenses(JSON.parse(savedExpenses));
      } catch (e) {
        console.error("Error loading expenses:", e);
      }
    }
  }, []);

  // Save expenses to localStorage
  useEffect(() => {
    if (expenses.length > 0 || localStorage.getItem("colist_expenses")) {
      localStorage.setItem("colist_expenses", JSON.stringify(expenses));
    }
  }, [expenses]);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [searchQuery, orders, activeFilters]);

  const applyFiltersAndSearch = () => {
    let filtered = [...orders];

    if (Object.values(activeFilters).some(Boolean)) {
      filtered = filtered.filter((order) => {
        let matches = false;
        if (activeFilters.shipped && order.status?.isShipped) matches = true;
        if (
          activeFilters.not_shipped &&
          !order.status?.isShipped &&
          !order.status?.isDelivered
        )
          matches = true;
        if (activeFilters.delivered && order.status?.isDelivered)
          matches = true;
        if (activeFilters.advance_paid && order.status?.advancePaid)
          matches = true;
        if (activeFilters.pending && order.paymentStatus === "pending")
          matches = true;
        if (activeFilters.paid && order.paymentStatus === "paid")
          matches = true;
        if (activeFilters.starred && order.isStarred === true) matches = true;
        return matches;
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.phone?.includes(searchQuery) ||
          order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredOrders(filtered);
  };

  const loadOrders = async () => {
    try {
      const allOrders = await getAllOrders();

      // Load starred orders from localStorage
      const starredOrders = JSON.parse(
        localStorage.getItem("starred_orders") || "[]",
      );

      const processedOrders = allOrders.map((order) => {
        if (order.profitLoss?.settings || order.plData?.settings) {
          return {
            ...order,
            profitLoss: order.profitLoss || order.plData,
            useCustomBookCosts:
              order.profitLoss?.settings?.useCustomBookCosts ||
              order.plData?.settings?.useCustomBookCosts ||
              false,
            customBookCosts:
              order.profitLoss?.settings?.bookCosts ||
              order.plData?.settings?.bookCosts ||
              null,
            isStarred: starredOrders.includes(order.orderId) || false,
          };
        }
        return {
          ...order,
          isStarred: starredOrders.includes(order.orderId) || false,
        };
      });

      const sorted = processedOrders.sort(
        (a, b) => new Date(b.orderDate) - new Date(a.orderDate),
      );
      setOrders(sorted);
      setFilteredOrders(sorted);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStarred = async (orderId) => {
    // Update localStorage
    const starredOrders = JSON.parse(
      localStorage.getItem("starred_orders") || "[]",
    );
    let updatedStarred;

    if (starredOrders.includes(orderId)) {
      updatedStarred = starredOrders.filter((id) => id !== orderId);
    } else {
      updatedStarred = [...starredOrders, orderId];
    }

    localStorage.setItem("starred_orders", JSON.stringify(updatedStarred));

    // Update orders state
    const updatedOrders = orders.map((order) =>
      order.orderId === orderId
        ? { ...order, isStarred: !order.isStarred }
        : order,
    );
    setOrders(updatedOrders);
    setFilteredOrders((prev) =>
      prev.map((order) =>
        order.orderId === orderId
          ? { ...order, isStarred: !order.isStarred }
          : order,
      ),
    );
  };

  const handleEdit = (order) => {
    setEditingOrderId(order.orderId);
    setEditFormData({
      name: order.name,
      phone: order.phone,
      address: order.address,
      city: order.city,
      state: order.state,
      pincode: order.pincode,
      trackingId: order.trackingId || "",
      paymentStatus: order.paymentStatus || "pending",
      advancePaid: order.status?.advancePaid || false,
      advanceAmount: order.advanceAmount || 99,
      isShipped: order.status?.isShipped || false,
      isDelivered: order.status?.isDelivered || false,
    });
  };

  const handleSave = async (orderId) => {
    const orderToUpdate = orders.find((o) => o.orderId === orderId);
    const updatedOrder = {
      ...orderToUpdate,
      name: editFormData.name,
      phone: editFormData.phone,
      address: editFormData.address,
      city: editFormData.city,
      state: editFormData.state,
      pincode: editFormData.pincode,
      trackingId: editFormData.trackingId,
      paymentStatus: editFormData.paymentStatus,
      advanceAmount: editFormData.advanceAmount,
      status: {
        advancePaid: editFormData.advancePaid,
        isShipped: editFormData.isShipped,
        isDelivered: editFormData.isDelivered,
      },
    };
    try {
      await updateOrder(updatedOrder);
      await loadOrders();
      setEditingOrderId(null);
      setEditFormData({});
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const handleDelete = async (orderId) => {
    if (confirm("Delete this order? This cannot be undone.")) {
      try {
        await deleteOrder(orderId);
        // Also remove from starred if exists
        const starredOrders = JSON.parse(
          localStorage.getItem("starred_orders") || "[]",
        );
        const updatedStarred = starredOrders.filter((id) => id !== orderId);
        localStorage.setItem("starred_orders", JSON.stringify(updatedStarred));
        await loadOrders();
      } catch (error) {
        console.error("Error deleting order:", error);
      }
    }
  };

  const exportToCSV = () => {
    setExporting(true);
    const headers = [
      "Order ID",
      "Customer Name",
      "Phone",
      "Address",
      "City",
      "State",
      "Pincode",
      "Payment Status",
      "Advance Paid",
      "Is Shipped",
      "Is Delivered",
      "Is Starred",
      "Total Amount",
      "Order Date",
      "Books",
    ];
    const rows = filteredOrders.map((order) => [
      order.orderId,
      order.name || "",
      order.phone || "",
      order.address || "",
      order.city || "",
      order.state || "",
      order.pincode || "",
      order.paymentStatus === "paid" ? "Paid" : "Pending",
      order.status?.advancePaid ? "Yes" : "No",
      order.status?.isShipped ? "Yes" : "No",
      order.status?.isDelivered ? "Yes" : "No",
      order.isStarred ? "Yes" : "No",
      order.totalAmount || 0,
      formatDate(order.orderDate),
      order.books?.map((b) => `${b.name} (${b.quantity})`).join(" | ") || "",
    ]);
    let csvContent = headers.join(",") + "\n";
    rows.forEach(
      (row) =>
        (csvContent +=
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",") +
          "\n"),
    );
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `orders_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.click();
    URL.revokeObjectURL(link.href);
    setExporting(false);
  };

  const handleReminder = (order) => {
    const formattedNumber = order.phone.startsWith("+")
      ? order.phone
      : `+91${order.phone}`;
    const message = encodeURIComponent(
      `📚 *Order Update from TheBookX*\n\nDear ${order.name},\n\nYour order #${order.orderId} is confirmed and will be shipped within 1-2 business days.\n\nThank you for shopping with TheBookX!`,
    );
    window.open(`https://wa.me/${formattedNumber}?text=${message}`, "_blank");
  };

  const toggleFilter = (filterName) => {
    setActiveFilters((prev) => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      shipped: false,
      not_shipped: false,
      delivered: false,
      advance_paid: false,
      pending: false,
      paid: false,
      starred: false,
    });
    setSearchQuery("");
  };

  const getActiveFilterCount = () =>
    Object.values(activeFilters).filter(Boolean).length;

  // Calculate total P&L
  const calculateTotalPL = () => {
    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;

    filteredOrders.forEach((order) => {
      const pl = calculateProfitLoss(order);
      totalRevenue += pl.sellingPrice;
      totalCost += pl.totalCost;
      totalProfit += pl.profit;
    });

    return { totalRevenue, totalCost, totalProfit };
  };

  const { totalRevenue, totalCost, totalProfit } = calculateTotalPL();
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalProfit - totalExpenses;
  const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const addExpense = () => {
    if (newExpense.name && newExpense.amount > 0) {
      setExpenses([...expenses, { ...newExpense, id: Date.now() }]);
      setNewExpense({
        name: "",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
      });
      setShowExpenseModal(false);
    }
  };

  const updateExpense = () => {
    if (newExpense.name && newExpense.amount > 0 && editingExpenseId) {
      setExpenses(
        expenses.map((exp) =>
          exp.id === editingExpenseId
            ? { ...newExpense, id: editingExpenseId }
            : exp,
        ),
      );
      setEditingExpenseId(null);
      setNewExpense({
        name: "",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
      });
      setShowExpenseModal(false);
    }
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
  };

  const openExpenseModal = (expense = null) => {
    if (expense) {
      setEditingExpenseId(expense.id);
      setNewExpense({
        name: expense.name,
        amount: expense.amount,
        date: expense.date,
      });
    } else {
      setEditingExpenseId(null);
      setNewExpense({
        name: "",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
      });
    }
    setShowExpenseModal(true);
  };

  if (loading) {
    return (
      <div className="section-1200 p-40">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const ordersWithPL = filteredOrders.map((order) => ({
    ...order,
    profitLoss: calculateProfitLoss(order),
    formattedDate: formatDate(order.orderDate),
  }));

  const handleUpdatePL = async (orderId, plData) => {
    const orderToUpdate = orders.find((o) => o.orderId === orderId);
    if (!orderToUpdate) return;
    const updatedOrder = {
      ...orderToUpdate,
      profitLoss: {
        totalBookCost: plData.totalBookCost,
        sellingPrice: plData.sellingPrice,
        deliveryActualCost: plData.deliveryActualCost,
        packingActualCost: plData.packingActualCost,
        totalCost: plData.totalCost,
        profit: plData.profit,
        margin: plData.margin,
        settings: plData.settings,
      },
      plData: plData,
      useCustomBookCosts: plData.settings?.useCustomBookCosts || false,
      customBookCosts: plData.settings?.useCustomBookCosts
        ? plData.settings.bookCosts
        : null,
      hasCustomPL: true,
    };
    try {
      await updateOrder(updatedOrder);
      await loadOrders();
      alert("P&L data saved successfully!");
    } catch (error) {
      console.error("Error saving P&L data:", error);
      alert("Failed to save P&L data");
    }
  };

  return (
    <div className="section-1200 flex flex-col gap-24 p-20">
      <div className="flex gap-12 justify-between items-center flex-wrap">
        <div className="flex flex-col gap-12">
          <Link href="/" className="back-btn">
            <ArrowLeft size={18} /> Back to Home
          </Link>
          <div>
            <h1 className="font-24 mt-12">Customer Orders List</h1>
            <p className="font-16 gray-500">
              Manage and track all customer orders from TheBookX
            </p>
          </div>
        </div>
        <button className="pri-big-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Order
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-12 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            className="sec-mid-btn width100"
            placeholder="Search by name, phone, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          className={`sec-mid-btn flex items-center gap-8 ${getActiveFilterCount() > 0 ? "active-filter" : ""}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={16} /> Filters{" "}
          {getActiveFilterCount() > 0 && (
            <span className="filter-count">{getActiveFilterCount()}</span>
          )}
        </button>
        <button
          onClick={exportToCSV}
          disabled={exporting || filteredOrders.length === 0}
          className="sec-mid-btn"
        >
          <Download size={18} /> {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      {/* Filter Panel - No Emojis */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-header">
            <span className="weight-600">Filter Orders</span>
            <button onClick={clearAllFilters} className="clear-filters-btn">
              <X size={14} /> Clear All
            </button>
          </div>
          <div className="filter-group">
            <span className="filter-group-title">Shipping Status</span>
            <div className="filter-options">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={activeFilters.shipped}
                  onChange={() => toggleFilter("shipped")}
                />{" "}
                <span>Shipped</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={activeFilters.not_shipped}
                  onChange={() => toggleFilter("not_shipped")}
                />{" "}
                <span>Not Shipped Yet</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={activeFilters.delivered}
                  onChange={() => toggleFilter("delivered")}
                />{" "}
                <span>Delivered</span>
              </label>
            </div>
          </div>
          <div className="filter-group">
            <span className="filter-group-title">Payment Status</span>
            <div className="filter-options">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={activeFilters.paid}
                  onChange={() => toggleFilter("paid")}
                />{" "}
                <span>Paid</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={activeFilters.pending}
                  onChange={() => toggleFilter("pending")}
                />{" "}
                <span>Pending</span>
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={activeFilters.advance_paid}
                  onChange={() => toggleFilter("advance_paid")}
                />{" "}
                <span>Advance Paid</span>
              </label>
            </div>
          </div>
          <div className="filter-group">
            <span className="filter-group-title">Other</span>
            <div className="filter-options">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={activeFilters.starred}
                  onChange={() => toggleFilter("starred")}
                />{" "}
                <span>Starred</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Total P&L Summary Card */}
      <div className="total-pl-summary">
        <div className="total-pl-header">
          <div
            className="flex items-center gap-8 cursor-pointer select-none"
            onClick={() => setIsPLExpanded(!isPLExpanded)}
          >
            <Calculator size={20} className="orange" />
            <span className="weight-600 font-16">
              Total Profit & Loss Summary
            </span>
            {isPLExpanded ? (
              <ChevronUp size={18} className="gray-500" />
            ) : (
              <ChevronDown size={18} className="gray-500" />
            )}
          </div>
          <button
            className="sec-mid-btn flex items-center gap-8"
            onClick={() => openExpenseModal()}
          >
            <PlusCircle size={14} /> Add Expense
          </button>
        </div>

        <AnimatePresence initial={false}>
          {isPLExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
                opacity: { duration: 0.2 },
              }}
              className="total-pl-content"
            >
              <div className="total-pl-stats">
                <div className="pl-stat">
                  <span className="pl-stat-label">Total Revenue</span>
                  <span className="pl-stat-value">
                    ₹{Math.round(totalRevenue)}
                  </span>
                </div>
                <div className="pl-stat">
                  <span className="pl-stat-label">Total Cost</span>
                  <span className="pl-stat-value">
                    ₹{Math.round(totalCost)}
                  </span>
                </div>
                <div className="pl-stat">
                  <span className="pl-stat-label">Order Profit</span>
                  <span
                    className={`pl-stat-value ${totalProfit >= 0 ? "text-green" : "text-red"}`}
                  >
                    {totalProfit >= 0 ? "+" : ""}₹{Math.round(totalProfit)}
                  </span>
                </div>
                <div className="pl-stat">
                  <span className="pl-stat-label">Expenses</span>
                  <span className="pl-stat-value text-red">
                    -₹{Math.round(totalExpenses)}
                  </span>
                </div>
                <div className="pl-stat total">
                  <span className="pl-stat-label">Net Profit</span>
                  <span
                    className={`pl-stat-value font-20 weight-700 ${netProfit >= 0 ? "text-green" : "text-red"}`}
                  >
                    {netProfit >= 0 ? "+" : ""}₹{Math.round(netProfit)}
                  </span>
                </div>
                <div className="pl-stat">
                  <span className="pl-stat-label">Net Margin</span>
                  <span
                    className={`pl-stat-value ${netMargin >= 20 ? "text-green" : "text-orange"}`}
                  >
                    {Math.round(netMargin)}%
                  </span>
                </div>
              </div>

              {/* Expenses List */}
              {expenses.length > 0 && (
                <motion.div
                  className="expenses-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                >
                  <div className="expenses-header">
                    <span className="font-12 weight-600 gray-500">
                      Expense Name
                    </span>
                    <span className="font-12 weight-600 gray-500">Date</span>
                    <span className="font-12 weight-600 gray-500">Amount</span>
                    <span></span>
                  </div>
                  {expenses.map((exp, idx) => (
                    <motion.div
                      key={exp.id}
                      className="expense-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.2 }}
                    >
                      <span>{exp.name}</span>
                      <span className="font-12 gray-500">{exp.date}</span>
                      <span className="red">-₹{Math.round(exp.amount)}</span>
                      <div className="expense-actions">
                        <button
                          onClick={() => openExpenseModal(exp)}
                          className="expense-edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="expense-delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <div className="tracker-stats">
        <div className="stat-card">
          <div>
            <div className="stat-value">{filteredOrders.length}</div>
            <div className="stat-label">
              {getActiveFilterCount() > 0 ? "Filtered Orders" : "Total Orders"}
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-value">
              {filteredOrders.filter((o) => o.status?.isShipped).length}
            </div>
            <div className="stat-label">Shipped</div>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-value">
              {filteredOrders.filter((o) => o.status?.isDelivered).length}
            </div>
            <div className="stat-label">Delivered</div>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-value">
              {filteredOrders.filter((o) => o.paymentStatus === "paid").length}
            </div>
            <div className="stat-label">Paid</div>
          </div>
        </div>
      </div>

      {ordersWithPL.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No orders found</h3>
          <p>Try adjusting your filters or search criteria</p>
          {(searchQuery || getActiveFilterCount() > 0) && (
            <button onClick={clearAllFilters} className="pri-big-btn mt-16">
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="orders-list flex flex-col gap-24">
          {ordersWithPL.map((order) => (
            <OrderCard
              key={order.orderId}
              order={order}
              onEdit={handleEdit}
              onSave={handleSave}
              onDelete={handleDelete}
              onCalculator={handleUpdatePL}
              onReminder={handleReminder}
              onToggleStarred={toggleStarred}
              editingOrderId={editingOrderId}
              editFormData={editFormData}
              setEditFormData={setEditFormData}
            />
          ))}
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div
          className="bill-modal-overlay"
          onClick={() => setShowExpenseModal(false)}
        >
          <div className="bill-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bill-header">
              <span className="weight-600 font-16">
                {editingExpenseId ? "Edit Expense" : "Add Expense"}
              </span>
              <span
                className="cursor-pointer"
                onClick={() => setShowExpenseModal(false)}
              >
                <X size={16} />
              </span>
            </div>
            <div className="address-form-content">
              <div className="input-group">
                <label>Expense Name</label>
                <input
                  type="text"
                  className="sec-mid-btn"
                  placeholder="e.g., Google Ads, Marketing, Shipping"
                  value={newExpense.name}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, name: e.target.value })
                  }
                />
              </div>
              <div className="input-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  className="sec-mid-btn"
                  placeholder="Enter amount"
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="input-group">
                <label>Date</label>
                <input
                  type="date"
                  className="sec-mid-btn"
                  value={newExpense.date}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, date: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-12 mt-16">
                <button
                  className="pri-big-btn flex-1"
                  onClick={editingExpenseId ? updateExpense : addExpense}
                >
                  {editingExpenseId ? "Update" : "Add Expense"}
                </button>
                <button
                  className="sec-mid-btn"
                  onClick={() => setShowExpenseModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddCustomOrderModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onOrderAdded={loadOrders}
      />
    </div>
  );
}
