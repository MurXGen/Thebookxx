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
} from "lucide-react";
import Link from "next/link";
import { getAllOrders, updateOrder, deleteOrder } from "@/utils/indexDB";
import { FaWhatsapp } from "react-icons/fa";

export default function COListPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [exporting, setExporting] = useState(false);

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

    // Prepare CSV headers
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

    // Prepare CSV rows
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

    // Create CSV content
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

    // Download file
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
        <div className=" flex flex-col gap-12">
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
            <div>
              <button
                onClick={exportToCSV}
                disabled={exporting || filteredOrders.length === 0}
                className="sec-mid-btn width100"
              >
                <Download size={18} />
                {exporting ? "Exporting..." : "Export"}
              </button>
            </div>
            {filteredOrders.map((order) => (
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
                          <p className="whatsapp-contact-row">
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
