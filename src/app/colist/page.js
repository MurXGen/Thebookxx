// app/colist/page.js
"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Search, Download, Plus } from "lucide-react";
import Link from "next/link";
import { getAllOrders, updateOrder, deleteOrder } from "@/utils/indexDB";
import OrderCard from "./OrderCard";
import AddCustomOrderModal from "./AddCustomOrderModal";

const PACKING_ACTUAL_COST = 25;
const PACKING_CHARGE_CUSTOMER = 50;
const STANDARD_DELIVERY_ACTUAL_COST = 65;
const BELOW_599_DELIVERY_ACTUAL_COST = 90;

const calculateProfitLoss = (order) => {
  const totalBookCost =
    order.books?.reduce((sum, book) => {
      // Assuming 40% profit margin on books, so cost is 60% of selling price
      const bookCost = book.price * 0.6;
      return sum + bookCost * book.quantity;
    }, 0) || 0;

  const sellingPrice = order.totalAmount || 0;

  // Calculate delivery actual cost based on order total
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

export default function COListPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [exporting, setExporting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredOrders(
        orders.filter(
          (order) =>
            order.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.phone?.includes(searchQuery) ||
            order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      );
    } else {
      setFilteredOrders(orders);
    }
  }, [searchQuery, orders]);

  const loadOrders = async () => {
    try {
      const allOrders = await getAllOrders();
      const sorted = allOrders.sort(
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
    // Find the order to update
    const orderToUpdate = orders.find((o) => o.orderId === orderId);
    if (!orderToUpdate) return;

    // Create updated order with new P&L data
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
      // Also store custom book costs if individual mode was used
      customBookCosts: plData.settings?.useCustomBookCosts
        ? plData.settings.bookCosts
        : null,
      customBookCostPercentage: plData.settings?.bookCostPercentage,
      useCustomBookCosts: plData.settings?.useCustomBookCosts,
    };

    try {
      await updateOrder(updatedOrder);
      await loadOrders(); // Refresh the orders list
      alert("P&L data saved successfully!");
    } catch (error) {
      console.error("Error saving P&L data:", error);
      alert("Failed to save P&L data");
    }
  };

  return (
    <div className="section-1200 flex flex-col gap-24 p-20">
      <div className="flex gap-12 justify-between items-center">
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

      <div className="flex gap-12">
        <input
          type="text"
          className="sec-mid-btn flex-1"
          placeholder="Search by name, phone, or order ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={exportToCSV}
          disabled={exporting || filteredOrders.length === 0}
          className="sec-mid-btn"
        >
          <Download size={18} /> {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

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
        <div className="stat-card">
          <div>
            <div className="stat-value">
              {orders.filter((o) => o.paymentStatus === "paid").length}
            </div>
            <div className="stat-label">Paid</div>
          </div>
        </div>
      </div>

      {ordersWithPL.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No orders found</h3>
          <p>Orders exported from the bag page will appear here</p>
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
              onCalculator={handleUpdatePL} // Pass the update function
              onReminder={handleReminder}
              editingOrderId={editingOrderId}
              editFormData={editFormData}
              setEditFormData={setEditFormData}
            />
          ))}
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
