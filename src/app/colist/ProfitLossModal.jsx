// components/COList/ProfitLossModal.jsx
"use client";

import { useState, useEffect } from "react";
import { X, Save, TrendingUp, TrendingDown, Edit2 } from "lucide-react";

const PACKING_ACTUAL_COST = 25;
const STANDARD_DELIVERY_ACTUAL_COST = 65;
const BELOW_599_DELIVERY_ACTUAL_COST = 90;

export default function ProfitLossModal({ isOpen, onClose, order, onUpdate }) {
  const [plData, setPlData] = useState({
    bookCosts: [], // Individual book costs
    bookCostPercentage: 60,
    useCustomBookCosts: false,
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
    bookBreakdown: [],
  });

  // Initialize book costs from order
  useEffect(() => {
    if (order && isOpen && plData.bookCosts.length === 0) {
      const initialBookCosts =
        order.books?.map((book) => ({
          id: book.id || Math.random(),
          name: book.name,
          quantity: book.quantity,
          sellingPrice: book.price,
          totalSelling: book.total,
          costPrice: Math.round(book.price * 0.6), // Default 60% of selling price
          totalCost: Math.round(book.total * 0.6),
          profit: Math.round(book.total - book.total * 0.6),
        })) || [];
      setPlData((prev) => ({ ...prev, bookCosts: initialBookCosts }));
    }
  }, [order, isOpen]);

  // Calculate P&L whenever costs change
  useEffect(() => {
    if (order && isOpen) {
      let totalBookCost = 0;
      let bookBreakdown = [];

      if (plData.useCustomBookCosts) {
        // Use individual book costs
        bookBreakdown = plData.bookCosts.map((book) => {
          const cost = book.costPrice * book.quantity;
          totalBookCost += cost;
          return {
            name: book.name,
            quantity: book.quantity,
            sellingPrice: book.sellingPrice,
            totalSelling: book.totalSelling,
            costPrice: book.costPrice,
            totalCost: cost,
            profit: book.totalSelling - cost,
            profitPerUnit: book.sellingPrice - book.costPrice,
          };
        });
      } else {
        // Use percentage-based calculation
        const totalBookSelling =
          order.books?.reduce((sum, book) => sum + book.total, 0) || 0;
        totalBookCost = totalBookSelling * (plData.bookCostPercentage / 100);

        bookBreakdown =
          order.books?.map((book) => ({
            name: book.name,
            quantity: book.quantity,
            sellingPrice: book.price,
            totalSelling: book.total,
            costPrice: Math.round(
              book.price * (plData.bookCostPercentage / 100),
            ),
            totalCost: Math.round(
              book.total * (plData.bookCostPercentage / 100),
            ),
            profit: Math.round(
              book.total - book.total * (plData.bookCostPercentage / 100),
            ),
            profitPerUnit: Math.round(
              book.price - book.price * (plData.bookCostPercentage / 100),
            ),
          })) || [];
      }

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
        bookBreakdown,
      });
    }
  }, [order, isOpen, plData]);

  const updateBookCost = (index, newCostPrice) => {
    const updatedBookCosts = [...plData.bookCosts];
    const book = updatedBookCosts[index];
    const costPrice = Math.max(0, newCostPrice);
    updatedBookCosts[index] = {
      ...book,
      costPrice: costPrice,
      totalCost: costPrice * book.quantity,
      profit: book.totalSelling - costPrice * book.quantity,
      profitPerUnit: book.sellingPrice - costPrice,
    };
    setPlData((prev) => ({ ...prev, bookCosts: updatedBookCosts }));
  };

  const handleSave = () => {
    onUpdate({
      ...calculatedPL,
      settings: {
        bookCosts: plData.bookCosts,
        bookCostPercentage: plData.bookCostPercentage,
        useCustomBookCosts: plData.useCustomBookCosts,
        deliveryActualCost: calculatedPL.deliveryActualCost,
        packingActualCost: plData.packingActualCost,
      },
    });
    onClose();
  };

  if (!isOpen) return null;

  const totalBookSelling =
    order?.books?.reduce((sum, book) => sum + book.total, 0) || 0;

  return (
    <div className="bill-modal-overlay" onClick={onClose}>
      <div
        className="bill-modal"
        style={{ maxWidth: "700px" }}
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
          {/* Book Cost Method Selection */}
          <div className="pl-section">
            <div className="flex gap-12 mb-16">
              <label className="flex items-center gap-8">
                <input
                  type="radio"
                  checked={!plData.useCustomBookCosts}
                  onChange={() =>
                    setPlData((prev) => ({
                      ...prev,
                      useCustomBookCosts: false,
                    }))
                  }
                />
                Use Percentage-based Cost
              </label>
              <label className="flex items-center gap-8">
                <input
                  type="radio"
                  checked={plData.useCustomBookCosts}
                  onChange={() =>
                    setPlData((prev) => ({ ...prev, useCustomBookCosts: true }))
                  }
                />
                Set Individual Book Costs
              </label>
            </div>
          </div>

          {/* Books Section */}
          <div className="pl-section">
            <h4>Books Breakdown</h4>

            {!plData.useCustomBookCosts ? (
              // Percentage-based view
              <>
                <div className="pl-books">
                  {calculatedPL.bookBreakdown.map((book, idx) => (
                    <div key={idx} className="pl-book-item">
                      <div className="pl-book-name">
                        {book.name} × {book.quantity}
                      </div>
                      <div className="pl-book-prices">
                        <span>Selling: ₹{book.totalSelling}</span>
                        <span>
                          Cost ({plData.bookCostPercentage}%): ₹
                          {Math.round(book.totalCost)}
                        </span>
                        <span
                          className={
                            book.profit >= 0 ? "text-green" : "text-red"
                          }
                        >
                          P/L: ₹{Math.round(book.profit)} (₹
                          {Math.round(book.profitPerUnit)}/unit)
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
                      setPlData((prev) => ({
                        ...prev,
                        bookCostPercentage: parseInt(e.target.value),
                      }))
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
              </>
            ) : (
              // Individual book costs view
              <div className="pl-books">
                {plData.bookCosts.map((book, idx) => (
                  <div key={idx} className="pl-book-item">
                    <div className="pl-book-name">
                      {book.name} × {book.quantity}
                    </div>
                    <div className="pl-book-prices">
                      <span>Selling: ₹{book.totalSelling}</span>
                      <div className="flex items-center gap-8">
                        <span>Cost Price:</span>
                        <input
                          type="number"
                          className="sec-mid-btn"
                          value={book.costPrice}
                          onChange={(e) =>
                            updateBookCost(idx, parseInt(e.target.value) || 0)
                          }
                          step="1"
                          min="0"
                        />
                        <span>
                          × {book.quantity} = ₹{book.totalCost}
                        </span>
                      </div>
                      <span
                        className={book.profit >= 0 ? "text-green" : "text-red"}
                      >
                        P/L: ₹{Math.round(book.profit)} (₹
                        {Math.round(book.profitPerUnit)}/unit)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                  setPlData((prev) => ({
                    ...prev,
                    customDeliveryCost: e.target.checked,
                  }))
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
                    setPlData((prev) => ({
                      ...prev,
                      deliveryActualCost: parseInt(e.target.value) || 0,
                    }))
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
                  setPlData((prev) => ({
                    ...prev,
                    packingActualCost: parseInt(e.target.value) || 0,
                  }))
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
              <span>Books Cost:</span>
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
