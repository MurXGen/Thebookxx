// components/COList/ProfitLossModal.jsx
"use client";

import { useState, useEffect } from "react";
import { X, Save, TrendingUp, TrendingDown } from "lucide-react";

const PACKING_ACTUAL_COST = 25;
const STANDARD_DELIVERY_ACTUAL_COST = 65;
const BELOW_599_DELIVERY_ACTUAL_COST = 90;

export default function ProfitLossModal({ isOpen, onClose, order, onUpdate }) {
  const [plData, setPlData] = useState({
    bookCostPercentage: 60, // Default 60% of selling price as cost
    deliveryActualCost: 0,
    packingActualCost: PACKING_ACTUAL_COST,
    customDeliveryCost: false,
  });

  const [calculatedPL, setCalculatedPL] = useState({
    totalBookCost: 0,
    sellingPrice: 0,
    deliveryActualCost: 0,
    packingActualCost: 0,
    totalCost: 0,
    profit: 0,
    margin: 0,
  });

  useEffect(() => {
    if (order && isOpen) {
      // Calculate book costs based on percentage
      const totalBookSelling =
        order.books?.reduce((sum, book) => sum + book.total, 0) || 0;
      const totalBookCost =
        totalBookSelling * (plData.bookCostPercentage / 100);

      // Calculate delivery actual cost
      let deliveryActualCost = plData.deliveryActualCost;
      if (!plData.customDeliveryCost) {
        if (order.totalAmount < 599) {
          deliveryActualCost = BELOW_599_DELIVERY_ACTUAL_COST;
        } else if (order.totalAmount >= 799) {
          deliveryActualCost = order.totalAmount * 0.15;
        } else {
          deliveryActualCost = STANDARD_DELIVERY_ACTUAL_COST;
        }
      }

      const totalCost =
        totalBookCost + deliveryActualCost + plData.packingActualCost;
      const totalRevenue = order.totalAmount - (order.offerDiscount || 0);
      const profit = totalRevenue - totalCost;
      const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

      setCalculatedPL({
        totalBookCost,
        sellingPrice: totalRevenue,
        deliveryActualCost,
        packingActualCost: plData.packingActualCost,
        totalCost,
        profit,
        margin,
      });
    }
  }, [order, isOpen, plData]);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdate({
      ...calculatedPL,
      settings: plData,
    });
    onClose();
  };

  const totalBookSelling =
    order?.books?.reduce((sum, book) => sum + book.total, 0) || 0;

  return (
    <div className="bill-modal-overlay" onClick={onClose}>
      <div
        className="bill-modal"
        style={{ maxWidth: "600px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bill-header">
          <span className="weight-600 font-16">
            P&L Calculator - {order?.orderId}
          </span>
          <span className="cursor-pointer" onClick={onClose}>
            <X size={16} />
          </span>
        </div>

        <div
          className="address-form-content"
          style={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          {/* Books Section */}
          <div className="pl-section">
            <h4>Books Breakdown</h4>
            <div className="pl-books">
              {order?.books?.map((book, idx) => (
                <div key={idx} className="pl-book-item">
                  <div className="pl-book-name">
                    {book.name} × {book.quantity}
                  </div>
                  <div className="pl-book-prices">
                    <span>Selling: ₹{book.total}</span>
                    <span>
                      Cost ({plData.bookCostPercentage}%): ₹
                      {Math.round(
                        (book.total * plData.bookCostPercentage) / 100,
                      )}
                    </span>
                    <span
                      className={
                        book.total -
                          (book.total * plData.bookCostPercentage) / 100 >=
                        0
                          ? "text-green"
                          : "text-red"
                      }
                    >
                      P/L: ₹
                      {Math.round(
                        book.total -
                          (book.total * plData.bookCostPercentage) / 100,
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="input-group mt-12">
              <label className="flex flex-row gap-4">
                Book Cost Percentage
              </label>
              <input
                type="range"
                min="30"
                max="80"
                step="5"
                value={plData.bookCostPercentage}
                onChange={(e) =>
                  setPlData({
                    ...plData,
                    bookCostPercentage: parseInt(e.target.value),
                  })
                }
                className="width100"
              />
              <div className="flex justify-between">
                <span className="font-12">30% (High Profit)</span>
                <span className="font-12 weight-600">
                  {plData.bookCostPercentage}%
                </span>
                <span className="font-12">80% (Low Profit)</span>
              </div>
            </div>
          </div>

          <div className="dashed-border my-12"></div>

          {/* Delivery Cost Section */}
          <div className="pl-section">
            <h4>Delivery Cost</h4>
            <label className="checkbox-label mb-8">
              <input
                type="checkbox"
                checked={plData.customDeliveryCost}
                onChange={(e) =>
                  setPlData({ ...plData, customDeliveryCost: e.target.checked })
                }
              />
              Use Custom Delivery Cost
            </label>

            {plData.customDeliveryCost ? (
              <div className="input-group">
                <input
                  type="number"
                  className="sec-mid-btn"
                  value={plData.deliveryActualCost}
                  onChange={(e) =>
                    setPlData({
                      ...plData,
                      deliveryActualCost: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Enter delivery cost"
                />
              </div>
            ) : (
              <div className="pl-row">
                <span>Auto-calculated based on order total:</span>
                <span className="weight-600">
                  ₹{Math.round(calculatedPL.deliveryActualCost)}
                </span>
              </div>
            )}
          </div>

          {/* Packing Cost Section */}
          <div className="pl-section">
            <h4>Packing Cost</h4>
            <div className="input-group">
              <input
                type="number"
                className="sec-mid-btn"
                value={plData.packingActualCost}
                onChange={(e) =>
                  setPlData({
                    ...plData,
                    packingActualCost: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Enter packing cost"
              />
            </div>
          </div>

          <div className="dashed-border my-12"></div>

          {/* Revenue Section */}
          <div className="pl-section">
            <h4>Revenue</h4>
            <div className="pl-row">
              <span>Books Selling Price:</span>
              <span>₹{totalBookSelling}</span>
            </div>
            {order?.deliveryCharge > 0 && (
              <div className="pl-row">
                <span>Delivery Charge (Customer):</span>
                <span>+₹{order.deliveryCharge}</span>
              </div>
            )}
            {order?.isGiftWrap && (
              <div className="pl-row">
                <span>Gift Wrap Charge (Customer):</span>
                <span>+₹{order.giftWrapCharge}</span>
              </div>
            )}
            {order?.offerDiscount > 0 && (
              <div className="pl-row text-red">
                <span>Offer Discount:</span>
                <span>-₹{order.offerDiscount}</span>
              </div>
            )}
            <div className="pl-row total">
              <span>Total Revenue:</span>
              <span>₹{calculatedPL.sellingPrice}</span>
            </div>
          </div>

          <div className="dashed-border my-12"></div>

          {/* Cost Section */}
          <div className="pl-section">
            <h4>Costs</h4>
            <div className="pl-row">
              <span>Books Cost ({plData.bookCostPercentage}% of SP):</span>
              <span>₹{Math.round(calculatedPL.totalBookCost)}</span>
            </div>
            <div className="pl-row">
              <span>Delivery Actual Cost:</span>
              <span>₹{Math.round(calculatedPL.deliveryActualCost)}</span>
            </div>
            <div className="pl-row">
              <span>Packing Actual Cost:</span>
              <span>₹{calculatedPL.packingActualCost}</span>
            </div>
            <div className="pl-row total">
              <span>Total Cost:</span>
              <span>₹{Math.round(calculatedPL.totalCost)}</span>
            </div>
          </div>

          <div className="dashed-border my-12"></div>

          {/* Profit/Loss Summary */}
          <div
            className={`pl-summary ${calculatedPL.profit >= 0 ? "profit" : "loss"}`}
          >
            <div className="flex justify-between items-center mb-12">
              <span className="weight-600">Net Profit / Loss:</span>
              <span
                className={`weight-700 font-24 ${calculatedPL.profit >= 0 ? "text-green" : "text-red"}`}
              >
                {calculatedPL.profit >= 0 ? "+" : ""}₹
                {Math.round(calculatedPL.profit)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Profit Margin:</span>
              <span
                className={
                  calculatedPL.margin >= 20 ? "text-green" : "text-orange"
                }
              >
                {Math.round(calculatedPL.margin)}%
              </span>
            </div>
          </div>

          <div className="flex gap-12 mt-16">
            <button className="pri-big-btn flex-1" onClick={handleSave}>
              <Save size={16} /> Save Changes
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
