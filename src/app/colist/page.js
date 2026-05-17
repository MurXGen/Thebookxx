// app/colist/page.js
"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  Edit,
  Save,
  X,
  Trash2,
  Package,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  Gift,
  Clock,
  CheckCircle,
  Download,
  Share2,
  Calculator,
  TrendingUp,
  TrendingDown,
  Bell,
  Send,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { getAllOrders, updateOrder, deleteOrder } from "@/utils/indexDB";
import { FaWhatsapp } from "react-icons/fa";
import {
  getDeliveryCharge,
  getDeliveryLabel,
  getOriginalCharge,
} from "@/utils/cartOffers";

export default function COListPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorData, setCalculatorData] = useState({
    bookCosts: [],
    totalCost: 0,
    sellingPrice: 0,
    deliveryChargeCustomer: 0,
    deliveryActualCost: 0,
    packingChargeCustomer: 0,
    packingActualCost: 0,
    offerDiscount: 0,
    profit: 0,
    margin: 0,
  });
  const [reminderPhone, setReminderPhone] = useState("");
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderOrder, setReminderOrder] = useState(null);
  const [reminderMessageType, setReminderMessageType] = useState("shipping");

  // Constants for costs
  const PACKING_ACTUAL_COST = 25;
  const PACKING_CHARGE_CUSTOMER = 50;
  const STANDARD_DELIVERY_ACTUAL_COST = 65;
  const BELOW_599_DELIVERY_ACTUAL_COST = 90;

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = orders.filter(
        (order) =>
          order.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.phone?.includes(searchQuery) ||
          order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchQuery, orders]);

  const loadOrders = async () => {
    try {
      const allOrders = await getAllOrders();
      setOrders(
        allOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)),
      );
      setFilteredOrders(
        allOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)),
      );
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (order) => {
    setEditingOrderId(order.orderId);
    setEditFormData({
      name: order.name,
      phone: order.phone,
      address: order.address,
      city: order.city,
      district: order.district,
      state: order.state,
      pincode: order.pincode,
      trackingId: order.trackingId || "",
      advancePaid: order.status?.advancePaid || false,
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
      district: editFormData.district,
      state: editFormData.state,
      pincode: editFormData.pincode,
      trackingId: editFormData.trackingId,
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
    if (
      confirm(
        "Are you sure you want to delete this order? This action cannot be undone.",
      )
    ) {
      try {
        await deleteOrder(orderId);
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
      "District",
      "State",
      "Pincode",
      "Payment Method",
      "Delivery Type",
      "Delivery Charge",
      "Gift Wrap",
      "Gift Wrap Charge",
      "Tracking ID",
      "Advance Paid",
      "Item Shipped",
      "Item Delivered",
      "Total Amount",
      "Order Date",
      "Books",
    ];

    const rows = filteredOrders.map((order) => {
      const booksList =
        order.books
          ?.map((b) => `${b.name} (${b.quantity} x ₹${b.price})`)
          .join(" | ") || "";

      return [
        order.orderId,
        order.name || "",
        order.phone || "",
        order.address || "",
        order.city || "",
        order.district || "",
        order.state || "",
        order.pincode || "",
        order.paymentMethod || "",
        order.isFasterDelivery ? "Faster Delivery" : "Standard Delivery",
        order.deliveryCharge || 0,
        order.isGiftWrap ? "Yes" : "No",
        order.giftWrapCharge || 0,
        order.trackingId || "",
        order.status?.advancePaid ? "Yes" : "No",
        order.status?.isShipped ? "Yes" : "No",
        order.status?.isDelivered ? "Yes" : "No",
        order.totalAmount || 0,
        new Date(order.orderDate).toLocaleString(),
        booksList,
      ];
    });

    let csvContent = headers.join(",") + "\n";
    rows.forEach((row) => {
      const escapedRow = row.map((cell) => {
        if (
          typeof cell === "string" &&
          (cell.includes(",") || cell.includes("\n") || cell.includes('"'))
        ) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      });
      csvContent += escapedRow.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute(
      "download",
      `customer_orders_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExporting(false);
  };

  const calculateProfitLoss = (order) => {
    // Calculate total cost of books (actual cost price)
    const totalBookCost =
      order.books?.reduce((sum, book) => {
        // Assuming 40% profit margin on books, so cost is 60% of selling price
        const bookCost = book.price * 0.6;
        return sum + bookCost * book.quantity;
      }, 0) || 0;

    // Calculate selling price
    const sellingPrice = order.totalAmount;

    // Calculate delivery actual cost based on order total
    let deliveryActualCost = STANDARD_DELIVERY_ACTUAL_COST;
    if (order.totalAmount < 599) {
      deliveryActualCost = BELOW_599_DELIVERY_ACTUAL_COST;
    } else if (order.totalAmount >= 799) {
      deliveryActualCost = order.totalAmount * 0.15; // 15% actual cost for bulk orders
    }

    // Delivery charge customer paid
    const deliveryChargeCustomer = order.deliveryCharge || 0;

    // Packing actual cost vs customer paid
    const packingActualCost = PACKING_ACTUAL_COST;
    const packingChargeCustomer = order.isGiftWrap
      ? PACKING_CHARGE_CUSTOMER
      : 0;

    // Offer discount (if any)
    const offerDiscount = order.offerDiscount || 0;

    // Calculate profit
    const totalCost = totalBookCost + deliveryActualCost + packingActualCost;
    const totalRevenue = sellingPrice - offerDiscount;
    const profit = totalRevenue - totalCost;
    const margin = (profit / totalRevenue) * 100;

    return {
      totalBookCost,
      sellingPrice,
      deliveryActualCost,
      deliveryChargeCustomer,
      packingActualCost,
      packingChargeCustomer,
      offerDiscount,
      profit,
      margin,
    };
  };

  const openCalculator = (order) => {
    const pl = calculateProfitLoss(order);
    setCalculatorData({
      bookCosts:
        order.books?.map((book) => ({
          name: book.name,
          quantity: book.quantity,
          sellingPrice: book.price,
          cost: book.price * 0.6,
          totalSelling: book.price * book.quantity,
          totalCost: book.price * 0.6 * book.quantity,
        })) || [],
      totalCost: pl.totalBookCost,
      sellingPrice: pl.sellingPrice,
      deliveryChargeCustomer: pl.deliveryChargeCustomer,
      deliveryActualCost: pl.deliveryActualCost,
      packingChargeCustomer: pl.packingChargeCustomer,
      packingActualCost: pl.packingActualCost,
      offerDiscount: pl.offerDiscount,
      profit: pl.profit,
      margin: pl.margin,
    });
    setSelectedOrder(order);
    setShowCalculator(true);
  };

  const sendReminder = async (order, messageType) => {
    const formattedNumber = order.phone.startsWith("+")
      ? order.phone
      : `+91${order.phone}`;

    const deliveryDays = order.isFasterDelivery ? "3-5" : "5-7";
    const deliveryText = order.isFasterDelivery
      ? `delivered in ${deliveryDays} business days (Priority Shipping)`
      : `delivered in ${deliveryDays} business days`;

    let message = "";
    if (messageType === "shipped") {
      message = encodeURIComponent(
        `📚 *Order Update from TheBookX*\n\n` +
          `Dear ${order.name || "Customer"},\n\n` +
          `Your order #${order.orderId} has been shipped and will be ${deliveryText}.\n\n` +
          `📦 Tracking ID: ${order.trackingId || "Not available"}\n\n` +
          `Here is the link to track : https://www.indiapost.gov.in \n\n` +
          `Thank you for shopping with TheBookX! Happy reading! 📖✨\n\n` +
          `For any queries, feel free to reach out to us.`,
      );
    } else if (messageType === "shipping") {
      message = encodeURIComponent(
        `📚 *Order Update from TheBookX*\n\n` +
          `Dear ${order.name || "Customer"},\n\n` +
          `Your order #${order.orderId} is confirmed and will be shipped within 1-2 business days.\n\n` +
          `Expected delivery: ${deliveryDays} business days after shipping.\n\n` +
          `You will receive a tracking ID once shipped.\n\n` +
          `Thank you for your patience! 📖✨\n\n` +
          `For any queries, feel free to reach out to us.`,
      );
    }

    window.open(`https://wa.me/${formattedNumber}?text=${message}`, "_blank");
    setShowReminderModal(false);
    setReminderOrder(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="section-1200" style={{ padding: "40px 20px" }}>
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

  return (
    <div>
      <div className="section-1200 flex flex-col gap-24">
        <div className="flex flex-col gap-12">
          <Link href="/" className="back-btn">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          <div className="flex flex-col">
            <h1 className="font-24">Customer Orders List</h1>
            <p className="font-16">
              Manage and track all customer orders from TheBookX
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-row gap-4">
          <div className="width100">
            <input
              type="text"
              className="sec-mid-btn width100"
              placeholder="Search by name, phone, or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="tracker-stats">
          <div className="stat-card">
            <div>
              <div className="stat-value">{orders.length}</div>
              <div className="stat-label">Total Orders</div>
            </div>
          </div>
          <div className="stat-card">
            <div>
              <div className="stat-value">
                {orders.filter((o) => o.status?.isShipped).length}
              </div>
              <div className="stat-label">Shipped</div>
            </div>
          </div>
          <div className="stat-card">
            <div>
              <div className="stat-value">
                {orders.filter((o) => o.status?.isDelivered).length}
              </div>
              <div className="stat-label">Delivered</div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No orders found</h3>
            <p>Orders exported from the bag page will appear here</p>
          </div>
        ) : (
          <div className="orders-list flex flex-col gap-24">
            <div className="flex flex-row gap-12">
              <button
                onClick={exportToCSV}
                disabled={exporting || filteredOrders.length === 0}
                className="sec-mid-btn"
              >
                <Download size={18} />
                {exporting ? "Exporting..." : "Export CSV"}
              </button>
            </div>
            {filteredOrders.map((order) => {
              const pl = calculateProfitLoss(order);
              return (
                <div key={order.orderId} className="order-card">
                  <div className="order-header">
                    <div className="order-id">
                      <span className="order-id-label">Order ID:</span>
                      <span className="order-id-value">{order.orderId}</span>
                    </div>
                    <div className="order-date">
                      {formatDate(order.orderDate)}
                    </div>
                    <div className="order-actions">
                      <button
                        onClick={() => openCalculator(order)}
                        className="sec-mid-btn"
                        title="View P&L"
                      >
                        <Calculator size={16} /> P&L
                      </button>
                      {editingOrderId === order.orderId ? (
                        <button
                          onClick={() => handleSave(order.orderId)}
                          className="pri-big-btn save"
                        >
                          <Save size={16} /> Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(order)}
                          className="sec-mid-btn"
                        >
                          <Edit size={16} /> Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(order.orderId)}
                        className="sec-mid-btn red"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Profit/Loss Summary Row */}
                  <div
                    className={`profit-summary ${pl.profit >= 0 ? "profit" : "loss"}`}
                  >
                    <div className="profit-item">
                      <span>Profit/Loss:</span>
                      <strong
                        className={pl.profit >= 0 ? "text-green" : "text-red"}
                      >
                        {pl.profit >= 0 ? "+" : ""}₹{Math.round(pl.profit)}
                      </strong>
                    </div>
                    <div className="profit-item">
                      <span>Margin:</span>
                      <strong
                        className={
                          pl.margin >= 20 ? "text-green" : "text-orange"
                        }
                      >
                        {Math.round(pl.margin)}%
                      </strong>
                    </div>
                    <div className="profit-item">
                      <span>Total Revenue:</span>
                      <strong>₹{pl.sellingPrice}</strong>
                    </div>
                    <div className="profit-item">
                      <span>Total Cost:</span>
                      <strong>
                        ₹
                        {Math.round(
                          pl.totalBookCost +
                            pl.deliveryActualCost +
                            pl.packingActualCost,
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="order-body">
                    <div className="order-info">
                      <div className="info-section">
                        <h4>Customer Details</h4>
                        {editingOrderId === order.orderId ? (
                          <>
                            <input
                              type="text"
                              className="edit-input"
                              value={editFormData.name}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  name: e.target.value,
                                })
                              }
                              placeholder="Name"
                            />
                            <input
                              type="tel"
                              className="edit-input"
                              value={editFormData.phone}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  phone: e.target.value,
                                })
                              }
                              placeholder="Phone"
                            />
                            <textarea
                              className="edit-input"
                              value={editFormData.address}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  address: e.target.value,
                                })
                              }
                              placeholder="Address"
                              rows={2}
                            />
                            <div className="edit-row">
                              <input
                                type="text"
                                className="edit-input"
                                value={editFormData.city}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    city: e.target.value,
                                  })
                                }
                                placeholder="City"
                              />
                              <input
                                type="text"
                                className="edit-input"
                                value={editFormData.pincode}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    pincode: e.target.value,
                                  })
                                }
                                placeholder="Pincode"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <p>
                              <strong>Name:</strong> {order.name}
                            </p>
                            <p className="flex flex-row items-center gap-12">
                              <strong>Phone:</strong> {order.phone}
                              <a
                                href={`https://wa.me/91${order.phone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="whatsapp-contact-btn"
                                title="Chat on WhatsApp"
                              >
                                <FaWhatsapp size={16} color="#25D366" />
                                Chat
                              </a>
                              <a
                                onClick={() => {
                                  setReminderOrder(order);
                                  setReminderMessageType("shipping");
                                  setShowReminderModal(true);
                                }}
                                className="whatsapp-contact-btn"
                                title="Send Reminder"
                              >
                                <Bell size={14} /> Remind
                              </a>
                            </p>
                            <p>
                              <strong>Address:</strong> {order.address},{" "}
                              {order.city}, {order.state} - {order.pincode}
                            </p>
                          </>
                        )}
                      </div>

                      <div className="info-section">
                        <h4>Order Summary</h4>
                        <div className="books-list">
                          {order.books?.map((book, idx) => (
                            <div key={idx} className="book-item">
                              <span>
                                {book.name} × {book.quantity}
                              </span>
                              <span>₹{book.total}</span>
                            </div>
                          ))}
                        </div>
                        <div className="order-total">
                          <span>Total Amount:</span>
                          <strong>₹{order.totalAmount}</strong>
                        </div>
                        {order.deliveryCharge > 0 && (
                          <p>
                            <strong>Delivery Charge:</strong> +₹
                            {order.deliveryCharge}
                          </p>
                        )}
                        {order.isGiftWrap && (
                          <p>
                            <strong>Gift Wrap:</strong> +₹{order.giftWrapCharge}
                          </p>
                        )}
                        <p>
                          <strong>Payment:</strong> {order.paymentMethod}
                        </p>
                        <p>
                          <strong>Delivery:</strong>{" "}
                          {order.isFasterDelivery
                            ? "Faster (2-5 days)"
                            : "Standard (5-7 days)"}
                        </p>
                      </div>

                      <div className="info-section">
                        <h4>Tracking & Status</h4>
                        {editingOrderId === order.orderId ? (
                          <>
                            <input
                              type="text"
                              className="edit-input"
                              value={editFormData.trackingId}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  trackingId: e.target.value,
                                })
                              }
                              placeholder="Tracking ID"
                            />
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={editFormData.advancePaid}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    advancePaid: e.target.checked,
                                  })
                                }
                              />
                              Advance Paid
                            </label>
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={editFormData.isShipped}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    isShipped: e.target.checked,
                                  })
                                }
                              />
                              Item Shipped
                            </label>
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={editFormData.isDelivered}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    isDelivered: e.target.checked,
                                  })
                                }
                              />
                              Item Delivered
                            </label>
                          </>
                        ) : (
                          <>
                            {order.trackingId && (
                              <p>
                                <strong>Tracking ID:</strong> {order.trackingId}
                              </p>
                            )}
                            <p>
                              <strong>Advance Paid:</strong>{" "}
                              {order.status?.advancePaid ? "✅ Yes" : "❌ No"}
                            </p>
                            <p>
                              <strong>Item Shipped:</strong>{" "}
                              {order.status?.isShipped ? "✅ Yes" : "❌ No"}
                            </p>
                            <p>
                              <strong>Item Delivered:</strong>{" "}
                              {order.status?.isDelivered ? "✅ Yes" : "❌ No"}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* P&L Calculator Modal */}
      {showCalculator && selectedOrder && (
        <div
          className="bill-modal-overlay"
          onClick={() => setShowCalculator(false)}
        >
          <div
            className="bill-modal"
            style={{ maxWidth: "600px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bill-header">
              <span className="weight-600 font-16">
                P&L Calculator - {selectedOrder.orderId}
              </span>
              <span
                className="cursor-pointer"
                onClick={() => setShowCalculator(false)}
              >
                <X size={16} />
              </span>
            </div>
            <div className="address-form-content">
              {/* Books List */}
              <div className="pl-section">
                <h4>Books Breakdown</h4>
                <div className="pl-books">
                  {calculatorData.bookCosts.map((book, idx) => (
                    <div key={idx} className="pl-book-item">
                      <div className="pl-book-name">
                        {book.name} × {book.quantity}
                      </div>
                      <div className="pl-book-prices">
                        <span>Selling: ₹{book.totalSelling}</span>
                        <span>Cost: ₹{Math.round(book.totalCost)}</span>
                        <span
                          className={
                            book.totalSelling - book.totalCost >= 0
                              ? "text-green"
                              : "text-red"
                          }
                        >
                          P/L: ₹{Math.round(book.totalSelling - book.totalCost)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashed-border my-12"></div>

              {/* Revenue Section */}
              <div className="pl-section">
                <h4>Revenue</h4>
                <div className="pl-row">
                  <span>Books Selling Price:</span>
                  <span>
                    ₹
                    {calculatorData.sellingPrice -
                      calculatorData.deliveryChargeCustomer -
                      calculatorData.packingChargeCustomer +
                      calculatorData.offerDiscount}
                  </span>
                </div>
                <div className="pl-row">
                  <span>Delivery Charge (Customer):</span>
                  <span>+₹{calculatorData.deliveryChargeCustomer}</span>
                </div>
                <div className="pl-row">
                  <span>Packing Charge (Customer):</span>
                  <span>+₹{calculatorData.packingChargeCustomer}</span>
                </div>
                <div className="pl-row text-red">
                  <span>Offer Discount:</span>
                  <span>-₹{calculatorData.offerDiscount}</span>
                </div>
                <div className="pl-row total">
                  <span>Total Revenue:</span>
                  <span>₹{calculatorData.sellingPrice}</span>
                </div>
              </div>

              <div className="dashed-border my-12"></div>

              {/* Cost Section */}
              <div className="pl-section">
                <h4>Costs</h4>
                <div className="pl-row">
                  <span>Books Cost (estimated 60% of SP):</span>
                  <span>₹{Math.round(calculatorData.totalCost)}</span>
                </div>
                <div className="pl-row">
                  <span>Delivery Actual Cost:</span>
                  <span>₹{Math.round(calculatorData.deliveryActualCost)}</span>
                </div>
                <div className="pl-row">
                  <span>Packing Actual Cost:</span>
                  <span>₹{calculatorData.packingActualCost}</span>
                </div>
                <div className="pl-row total">
                  <span>Total Cost:</span>
                  <span>
                    ₹
                    {Math.round(
                      calculatorData.totalCost +
                        calculatorData.deliveryActualCost +
                        calculatorData.packingActualCost,
                    )}
                  </span>
                </div>
              </div>

              <div className="dashed-border my-12"></div>

              {/* Profit/Loss Summary */}
              <div
                className={`pl-summary ${calculatorData.profit >= 0 ? "profit" : "loss"}`}
              >
                <div className="pl-row profit-loss">
                  <span className="weight-600">Net Profit / Loss:</span>
                  <span
                    className={`weight-700 font-20 ${calculatorData.profit >= 0 ? "text-green" : "text-red"}`}
                  >
                    {calculatorData.profit >= 0 ? "+" : ""}₹
                    {Math.round(calculatorData.profit)}
                  </span>
                </div>
                <div className="pl-row">
                  <span>Profit Margin:</span>
                  <span
                    className={
                      calculatorData.margin >= 20 ? "text-green" : "text-orange"
                    }
                  >
                    {Math.round(calculatorData.margin)}%
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-12 mt-16">
                <button
                  className="pri-big-btn"
                  onClick={() => setShowCalculator(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && reminderOrder && (
        <div
          className="bill-modal-overlay"
          onClick={() => setShowReminderModal(false)}
        >
          <div
            className="bill-modal"
            style={{ maxWidth: "400px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bill-header">
              <span className="weight-600 font-16">Send Reminder</span>
              <span
                className="cursor-pointer"
                onClick={() => setShowReminderModal(false)}
              >
                <X size={16} />
              </span>
            </div>
            <div className="address-form-content">
              <p className="font-14 mb-16">
                Send reminder to {reminderOrder.name} at +91
                {reminderOrder.phone}
              </p>
              <div className="flex flex-col gap-12">
                <button
                  className="pri-big-btn"
                  onClick={() => sendReminder(reminderOrder, "shipping")}
                >
                  <Calendar size={16} />
                  Shipping in 1-2 days
                </button>
                <button
                  className="pri-big-btn"
                  onClick={() => sendReminder(reminderOrder, "shipped")}
                  disabled={!reminderOrder.trackingId}
                  style={{ opacity: !reminderOrder.trackingId ? 0.5 : 1 }}
                >
                  <Truck size={16} />
                  Order Shipped
                </button>
                <button
                  className="sec-mid-btn"
                  onClick={() => setShowReminderModal(false)}
                >
                  Cancel
                </button>
              </div>
              {!reminderOrder.trackingId && (
                <p className="font-10 red mt-12">
                  Please add tracking ID before sending shipped reminder
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
