// components/COList/OrderCard.jsx
"use client";

import { useState } from "react";
import { Edit, Save, X, Trash2, Calculator, Bell } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import ProfitLossModal from "./ProfitLossModal";

export default function OrderCard({
  order,
  onEdit,
  onSave,
  onDelete,
  onCalculator,
  onReminder,
  editingOrderId,
  editFormData,
  setEditFormData,
}) {
  const isEditing = editingOrderId === order.orderId;
  const [showPLModal, setShowPLModal] = useState(false);
  // In OrderCard.jsx, update the profit/loss display to use saved data if available

  const pl = order.profitLoss || order.customProfitLoss || {};

  // Also check if there are custom book costs saved
  const hasCustomBookCosts = order.useCustomBookCosts && order.customBookCosts;

  // Safely calculate total cost with fallbacks
  const totalBookCost = pl.totalBookCost || 0;
  const deliveryActualCost = pl.deliveryActualCost || 0;
  const packingActualCost = pl.packingActualCost || 0;
  const totalCost = totalBookCost + deliveryActualCost + packingActualCost;

  const handleOpenPLModal = () => {
    setShowPLModal(true);
  };

  const handleClosePLModal = () => {
    setShowPLModal(false);
  };

  const handleUpdatePL = (updatedData) => {
    // Call the parent's onCalculator function with orderId and updated data
    if (onCalculator) {
      onCalculator(order.orderId, updatedData);
    }
    setShowPLModal(false);
  };

  return (
    <>
      <div className="order-card">
        <div className="order-header">
          <div className="order-id">
            <span className="order-id-label">Order ID:</span>
            <span className="order-id-value">{order.orderId}</span>
          </div>
          <div className="order-date">{order.formattedDate}</div>
          <div className="order-actions">
            <button
              onClick={handleOpenPLModal}
              className="sec-mid-btn"
              title="View P&L"
            >
              <Calculator size={16} /> P&L
            </button>
            {isEditing ? (
              <button
                onClick={() => onSave(order.orderId)}
                className="pri-big-btn save"
              >
                <Save size={16} /> Save
              </button>
            ) : (
              <button onClick={() => onEdit(order)} className="sec-mid-btn">
                <Edit size={16} /> Edit
              </button>
            )}
            <button
              onClick={() => onDelete(order.orderId)}
              className="sec-mid-btn red"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>

        {/* Payment Status Badge */}
        <div className="payment-status-badge">
          <span
            className={`status-badge ${order.paymentStatus === "paid" ? "paid" : "pending"}`}
          >
            {order.paymentStatus === "paid" ? "✅ Paid" : "⏳ Pending"}
          </span>
          {order.paymentStatus === "pending" && order.status?.advancePaid && (
            <span className="advance-badge">
              Advance: ₹{order.advanceAmount || 99}
            </span>
          )}
        </div>

        {/* Profit/Loss Summary Row */}
        {pl.profit !== undefined && (
          <div
            className={`profit-summary ${pl.profit >= 0 ? "profit" : "loss"}`}
          >
            <div className="profit-item">
              <span>Profit/Loss:</span>
              <strong className={pl.profit >= 0 ? "text-green" : "text-red"}>
                {pl.profit >= 0 ? "+" : ""}₹{Math.round(pl.profit)}
              </strong>
            </div>
            <div className="profit-item">
              <span>Margin:</span>
              <strong
                className={pl.margin >= 20 ? "text-green" : "text-orange"}
              >
                {Math.round(pl.margin)}%
              </strong>
            </div>
            <div className="profit-item">
              <span>Total Revenue:</span>
              <strong>₹{pl.sellingPrice || order.totalAmount || 0}</strong>
            </div>
            <div className="profit-item">
              <span>Total Cost:</span>
              <strong>
                ₹
                {Math.round(
                  (pl.totalBookCost || 0) +
                    (pl.deliveryActualCost || 0) +
                    (pl.packingActualCost || 0),
                )}
              </strong>
            </div>
            {order.useCustomBookCosts && (
              <div className="profit-item">
                <span className="font-10 gray-500">
                  Custom book costs applied
                </span>
              </div>
            )}
          </div>
        )}

        <div className="order-body">
          <div className="order-info">
            {/* Customer Details Section */}
            <div className="info-section">
              <h4>Customer Details</h4>
              {isEditing ? (
                <EditCustomerForm
                  editFormData={editFormData}
                  setEditFormData={setEditFormData}
                />
              ) : (
                <ViewCustomerDetails order={order} onReminder={onReminder} />
              )}
            </div>

            {/* Order Summary Section */}
            <div className="info-section">
              <h4>Order Summary</h4>
              <ViewOrderSummary order={order} />
            </div>

            {/* Tracking & Status Section */}
            <div className="info-section">
              <h4>Tracking & Status</h4>
              {isEditing ? (
                <EditStatusForm
                  editFormData={editFormData}
                  setEditFormData={setEditFormData}
                />
              ) : (
                <ViewStatusDetails order={order} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* P&L Modal */}
      <ProfitLossModal
        isOpen={showPLModal}
        onClose={handleClosePLModal}
        order={order}
        onUpdate={handleUpdatePL}
      />
    </>
  );
}

// Sub-components (keep the same as before)
function EditCustomerForm({ editFormData, setEditFormData }) {
  return (
    <>
      <input
        type="text"
        className="edit-input"
        value={editFormData.name || ""}
        onChange={(e) =>
          setEditFormData({ ...editFormData, name: e.target.value })
        }
        placeholder="Name"
      />
      <input
        type="tel"
        className="edit-input"
        value={editFormData.phone || ""}
        onChange={(e) =>
          setEditFormData({ ...editFormData, phone: e.target.value })
        }
        placeholder="Phone"
      />
      <textarea
        className="edit-input"
        value={editFormData.address || ""}
        onChange={(e) =>
          setEditFormData({ ...editFormData, address: e.target.value })
        }
        placeholder="Address"
        rows={2}
      />
      <div className="edit-row">
        <input
          type="text"
          className="edit-input"
          value={editFormData.city || ""}
          onChange={(e) =>
            setEditFormData({ ...editFormData, city: e.target.value })
          }
          placeholder="City"
        />
        <input
          type="text"
          className="edit-input"
          value={editFormData.pincode || ""}
          onChange={(e) =>
            setEditFormData({ ...editFormData, pincode: e.target.value })
          }
          placeholder="Pincode"
        />
      </div>
    </>
  );
}

function ViewCustomerDetails({ order, onReminder }) {
  return (
    <>
      <p>
        <strong>Name:</strong> {order.name || "N/A"}
      </p>
      <p className="flex flex-row items-center gap-12">
        <strong>Phone:</strong> {order.phone || "N/A"}
        {order.phone && (
          <>
            <a
              href={`https://wa.me/91${order.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-contact-btn"
              title="Chat on WhatsApp"
            >
              <FaWhatsapp size={16} color="#25D366" /> Chat
            </a>
            <a
              onClick={() => onReminder(order)}
              className="whatsapp-contact-btn"
              title="Send Reminder"
              style={{ cursor: "pointer" }}
            >
              <Bell size={14} /> Remind
            </a>
          </>
        )}
      </p>
      <p>
        <strong>Address:</strong> {order.address || "N/A"},{" "}
        {order.city || "N/A"}, {order.state || "N/A"} - {order.pincode || "N/A"}
      </p>
    </>
  );
}

function ViewOrderSummary({ order }) {
  return (
    <>
      <div className="books-list">
        {order.books && order.books.length > 0 ? (
          order.books.map((book, idx) => (
            <div key={idx} className="book-item">
              <span>
                {book.name} × {book.quantity}
              </span>
              <span>₹{book.total}</span>
            </div>
          ))
        ) : (
          <div className="book-item">No books listed</div>
        )}
      </div>
      <div className="order-total">
        <span>Total Amount:</span>
        <strong>₹{order.totalAmount || 0}</strong>
      </div>
      {order.deliveryCharge > 0 && (
        <p>
          <strong>Delivery Charge:</strong> +₹{order.deliveryCharge}
        </p>
      )}
      {order.isGiftWrap && (
        <p>
          <strong>Gift Wrap:</strong> +₹{order.giftWrapCharge}
        </p>
      )}
      <p>
        <strong>Payment:</strong> {order.paymentMethod || "N/A"}
      </p>
      <p>
        <strong>Delivery:</strong>{" "}
        {order.isFasterDelivery ? "Faster (2-5 days)" : "Standard (5-7 days)"}
      </p>
    </>
  );
}

function EditStatusForm({ editFormData, setEditFormData }) {
  return (
    <>
      <input
        type="text"
        className="edit-input"
        value={editFormData.trackingId || ""}
        onChange={(e) =>
          setEditFormData({ ...editFormData, trackingId: e.target.value })
        }
        placeholder="Tracking ID"
      />
      <div className="payment-edit-section">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={editFormData.paymentStatus === "paid"}
            onChange={(e) =>
              setEditFormData({
                ...editFormData,
                paymentStatus: e.target.checked ? "paid" : "pending",
              })
            }
          />
          Mark as Paid
        </label>
        {editFormData.paymentStatus !== "paid" && (
          <>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={editFormData.advancePaid || false}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    advancePaid: e.target.checked,
                  })
                }
              />
              Advance Paid
            </label>
            {editFormData.advancePaid && (
              <input
                type="number"
                className="edit-input mt-8"
                value={editFormData.advanceAmount || 99}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    advanceAmount: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Advance Amount"
              />
            )}
          </>
        )}
      </div>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={editFormData.isShipped || false}
          onChange={(e) =>
            setEditFormData({ ...editFormData, isShipped: e.target.checked })
          }
        />
        Item Shipped
      </label>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={editFormData.isDelivered || false}
          onChange={(e) =>
            setEditFormData({ ...editFormData, isDelivered: e.target.checked })
          }
        />
        Item Delivered
      </label>
    </>
  );
}

function ViewStatusDetails({ order }) {
  return (
    <>
      {order.trackingId && (
        <p>
          <strong>Tracking ID:</strong> {order.trackingId}
        </p>
      )}
      <p>
        <strong>Payment Status:</strong>{" "}
        {order.paymentStatus === "paid" ? "✅ Paid" : "⏳ Pending"}
      </p>
      {order.paymentStatus === "pending" && order.status?.advancePaid && (
        <p>
          <strong>Advance Paid:</strong> ₹{order.advanceAmount || 99}
        </p>
      )}
      <p>
        <strong>Item Shipped:</strong>{" "}
        {order.status?.isShipped ? "✅ Yes" : "❌ No"}
      </p>
      <p>
        <strong>Item Delivered:</strong>{" "}
        {order.status?.isDelivered ? "✅ Yes" : "❌ No"}
      </p>
    </>
  );
}
