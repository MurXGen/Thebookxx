// components/COList/AddCustomOrderModal.jsx
"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Gift } from "lucide-react";
import { saveOrder } from "@/utils/indexDB";
import {
  CART_OFFERS,
  getDeliveryCharge,
  getDeliveryLabel,
} from "@/utils/cartOffers";

export default function AddCustomOrderModal({ isOpen, onClose, onOrderAdded }) {
  const [customOrder, setCustomOrder] = useState({
    orderId: `CUST${Date.now()}`,
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "COD",
    paymentStatus: "pending",
    advancePaid: false,
    advanceAmount: 99,
    isGiftWrap: false,
    giftWrapCharge: 50,
    isFasterDelivery: false,
    books: [],
    subtotal: 0,
    deliveryCharge: 0,
    deliveryLabel: "",
    offerDiscount: 0,
    offerLabel: "",
    totalAmount: 0,
  });
  const [newBook, setNewBook] = useState({ name: "", quantity: 1, price: 0 });

  // Calculate delivery charge, offer discount, and total whenever books, gift wrap, or faster delivery changes
  useEffect(() => {
    const subtotal = customOrder.books.reduce(
      (sum, book) => sum + book.total,
      0,
    );

    // Get applied offer based on subtotal
    const appliedOffer =
      [...CART_OFFERS].reverse().find((o) => subtotal >= o.target) || null;

    let offerDiscount = 0;
    let offerLabel = "";

    if (appliedOffer) {
      if (appliedOffer.type === "flat") {
        offerDiscount = appliedOffer.value;
        offerLabel = `₹${appliedOffer.value} OFF`;
      }
      if (appliedOffer.type === "percentage") {
        offerDiscount = Math.round((subtotal * appliedOffer.value) / 100);
        offerLabel = `${appliedOffer.value}% OFF`;
      }
      if (appliedOffer.type === "free_shipping") {
        offerLabel = "Free Delivery";
      }
    }

    const discountedSubtotal = subtotal - offerDiscount;

    // Get delivery charge
    const deliveryCharge = getDeliveryCharge(
      subtotal,
      customOrder.isFasterDelivery,
    );
    const deliveryLabel = getDeliveryLabel(
      subtotal,
      customOrder.isFasterDelivery,
    );

    const giftWrapAmount = customOrder.isGiftWrap
      ? customOrder.giftWrapCharge
      : 0;
    const totalAmount = discountedSubtotal + deliveryCharge + giftWrapAmount;

    setCustomOrder((prev) => ({
      ...prev,
      subtotal,
      offerDiscount,
      offerLabel,
      deliveryCharge,
      deliveryLabel,
      totalAmount,
    }));
  }, [customOrder.books, customOrder.isGiftWrap, customOrder.isFasterDelivery]);

  if (!isOpen) return null;

  const addBook = () => {
    if (newBook.name && newBook.price > 0) {
      const bookTotal = newBook.price * newBook.quantity;
      setCustomOrder((prev) => ({
        ...prev,
        books: [
          ...prev.books,
          {
            name: newBook.name,
            quantity: newBook.quantity,
            price: newBook.price,
            total: bookTotal,
          },
        ],
      }));
      setNewBook({ name: "", quantity: 1, price: 0 });
    }
  };

  const removeBook = (index) => {
    setCustomOrder((prev) => ({
      ...prev,
      books: prev.books.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!customOrder.name || !customOrder.phone || !customOrder.address) {
      alert("Please fill required fields");
      return;
    }

    const orderToSave = {
      orderId: customOrder.orderId,
      name: customOrder.name,
      phone: customOrder.phone,
      address: customOrder.address,
      city: customOrder.city,
      state: customOrder.state,
      pincode: customOrder.pincode,
      paymentMethod: customOrder.paymentMethod,
      paymentStatus: customOrder.paymentStatus,
      isFasterDelivery: customOrder.isFasterDelivery,
      isGiftWrap: customOrder.isGiftWrap,
      giftWrapCharge: customOrder.giftWrapCharge,
      deliveryCharge: customOrder.deliveryCharge,
      deliveryLabel: customOrder.deliveryLabel,
      offerDiscount: customOrder.offerDiscount,
      offerLabel: customOrder.offerLabel,
      totalAmount: customOrder.totalAmount,
      books: customOrder.books,
      orderDate: new Date().toISOString(),
      advanceAmount: customOrder.advanceAmount,
      status: {
        advancePaid: customOrder.advancePaid,
        isShipped: false,
        isDelivered: false,
      },
    };

    try {
      await saveOrder(orderToSave);
      onOrderAdded();
      onClose();
      alert("Custom order added successfully!");
    } catch (error) {
      console.error("Error saving custom order:", error);
      alert("Failed to add order");
    }
  };

  return (
    <div className="bill-modal-overlay" onClick={onClose}>
      <div
        className="bill-modal"
        style={{ maxWidth: "700px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bill-header">
          <span className="weight-600 font-16">Add Custom Order</span>
          <span className="cursor-pointer" onClick={onClose}>
            <X size={16} />
          </span>
        </div>

        <div
          className="address-form-content"
          style={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          {/* Customer Details */}
          <h4 className="font-14 weight-600 mb-12">Customer Details</h4>
          <div className="input-group">
            <input
              type="text"
              className="sec-mid-btn"
              placeholder="Name *"
              value={customOrder.name}
              onChange={(e) =>
                setCustomOrder({ ...customOrder, name: e.target.value })
              }
            />
          </div>
          <div className="input-group">
            <input
              type="tel"
              className="sec-mid-btn"
              placeholder="Phone *"
              value={customOrder.phone}
              onChange={(e) =>
                setCustomOrder({ ...customOrder, phone: e.target.value })
              }
            />
          </div>
          <div className="input-group">
            <textarea
              className="sec-mid-btn"
              placeholder="Address *"
              rows={2}
              value={customOrder.address}
              onChange={(e) =>
                setCustomOrder({ ...customOrder, address: e.target.value })
              }
            />
          </div>
          <div className="flex gap-12">
            <div className="input-group flex-1">
              <input
                type="text"
                className="sec-mid-btn"
                placeholder="City"
                value={customOrder.city}
                onChange={(e) =>
                  setCustomOrder({ ...customOrder, city: e.target.value })
                }
              />
            </div>
            <div className="input-group flex-1">
              <input
                type="text"
                className="sec-mid-btn"
                placeholder="Pincode"
                value={customOrder.pincode}
                onChange={(e) =>
                  setCustomOrder({ ...customOrder, pincode: e.target.value })
                }
              />
            </div>
          </div>

          {/* Books Section */}
          <h4 className="font-14 weight-600 mb-12 mt-16">Books</h4>
          <div className="flex gap-8 mb-12 width100 flex-wrap">
            <input
              type="text"
              className="sec-mid-btn flex-1"
              placeholder="Book Name"
              value={newBook.name}
              onChange={(e) => setNewBook({ ...newBook, name: e.target.value })}
            />
            <input
              type="number"
              className="sec-mid-btn w-80"
              placeholder="Qty"
              value={newBook.quantity}
              onChange={(e) =>
                setNewBook({
                  ...newBook,
                  quantity: parseInt(e.target.value) || 1,
                })
              }
            />
            <input
              type="number"
              className="sec-mid-btn w-100"
              placeholder="Price"
              value={newBook.price}
              onChange={(e) =>
                setNewBook({ ...newBook, price: parseInt(e.target.value) || 0 })
              }
            />
            <button className="pri-big-btn" onClick={addBook}>
              <Plus size={16} /> Add
            </button>
          </div>

          {customOrder.books.map((book, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center p-8 bg-gray-50 rounded-lg mb-8"
            >
              <div>
                <span className="weight-500">{book.name}</span> ×{" "}
                {book.quantity} = ₹{book.total}
              </div>
              <button
                className="sec-mid-btn red"
                onClick={() => removeBook(idx)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {/* Delivery & Gift Wrap Options */}
          <h4 className="font-14 weight-600 mb-12 mt-16">Delivery Options</h4>

          <div className="flex gap-12 mb-12">
            <label className="flex items-center gap-8">
              <input
                type="checkbox"
                checked={customOrder.isFasterDelivery}
                onChange={(e) =>
                  setCustomOrder({
                    ...customOrder,
                    isFasterDelivery: e.target.checked,
                  })
                }
              />
              Faster Delivery (+₹{getDeliveryCharge(customOrder.subtotal, true)}
              )
            </label>
          </div>

          <div className="flex gap-12 mb-12">
            <label className="flex items-center gap-8">
              <input
                type="checkbox"
                checked={customOrder.isGiftWrap}
                onChange={(e) =>
                  setCustomOrder({
                    ...customOrder,
                    isGiftWrap: e.target.checked,
                  })
                }
              />
              <Gift size={14} /> Gift Wrap (+₹{customOrder.giftWrapCharge})
            </label>
          </div>

          {/* Price Breakdown */}
          <div className="dashed-border my-12"></div>
          <h4 className="font-14 weight-600 mb-12">Price Breakdown</h4>

          <div className="flex justify-between mb-8">
            <span>Subtotal:</span>
            <span>₹{customOrder.subtotal}</span>
          </div>

          {customOrder.offerDiscount > 0 && (
            <div className="flex justify-between mb-8 text-green">
              <span>Offer Applied ({customOrder.offerLabel}):</span>
              <span>-₹{customOrder.offerDiscount}</span>
            </div>
          )}

          <div className="flex justify-between mb-8">
            <span>Delivery ({customOrder.deliveryLabel}):</span>
            <span>+₹{customOrder.deliveryCharge}</span>
          </div>

          {customOrder.isGiftWrap && (
            <div className="flex justify-between mb-8">
              <span>Gift Wrap:</span>
              <span>+₹{customOrder.giftWrapCharge}</span>
            </div>
          )}

          <div className="dashed-border my-12"></div>

          <div className="flex justify-between items-center">
            <span className="weight-600">Total Amount:</span>
            <span className="font-20 weight-700 green">
              ₹{customOrder.totalAmount}
            </span>
          </div>

          {/* Payment Section */}
          <h4 className="font-14 weight-600 mb-12 mt-16">Payment</h4>
          <div className="flex gap-12 mb-12">
            <label className="flex items-center gap-8">
              <input
                type="radio"
                name="paymentStatus"
                checked={customOrder.paymentStatus === "pending"}
                onChange={() =>
                  setCustomOrder({ ...customOrder, paymentStatus: "pending" })
                }
              />{" "}
              Pending
            </label>
            <label className="flex items-center gap-8">
              <input
                type="radio"
                name="paymentStatus"
                checked={customOrder.paymentStatus === "paid"}
                onChange={() =>
                  setCustomOrder({
                    ...customOrder,
                    paymentStatus: "paid",
                    advancePaid: false,
                  })
                }
              />{" "}
              Paid
            </label>
          </div>
          {customOrder.paymentStatus === "pending" && (
            <>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={customOrder.advancePaid}
                  onChange={(e) =>
                    setCustomOrder({
                      ...customOrder,
                      advancePaid: e.target.checked,
                    })
                  }
                />{" "}
                Advance Paid
              </label>
              {customOrder.advancePaid && (
                <input
                  type="number"
                  className="sec-mid-btn mt-8"
                  placeholder="Advance Amount"
                  value={customOrder.advanceAmount}
                  onChange={(e) =>
                    setCustomOrder({
                      ...customOrder,
                      advanceAmount: parseInt(e.target.value) || 0,
                    })
                  }
                />
              )}
            </>
          )}

          <div className="flex gap-12 mt-16">
            <button className="pri-big-btn flex-1" onClick={handleSubmit}>
              Add Order
            </button>
            <button className="sec-mid-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
