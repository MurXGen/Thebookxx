// context/PLContext.jsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getAllOrders, updateOrder } from "@/utils/indexDB";

const PLContext = createContext(null);

export function PLProvider({ children }) {
  const [ordersPL, setOrdersPL] = useState({});
  const [loading, setLoading] = useState(false);

  // Load P&L data from localStorage on mount
  useEffect(() => {
    const savedPL = localStorage.getItem("orders_pl_data");
    if (savedPL) {
      try {
        setOrdersPL(JSON.parse(savedPL));
      } catch (e) {
        console.error("Error loading PL data:", e);
      }
    }
  }, []);

  // Save P&L data to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(ordersPL).length > 0) {
      localStorage.setItem("orders_pl_data", JSON.stringify(ordersPL));
    }
  }, [ordersPL]);

  // Update P&L for a specific order
  const updateOrderPL = async (orderId, plData) => {
    setOrdersPL((prev) => ({
      ...prev,
      [orderId]: {
        ...plData,
        updatedAt: Date.now(),
      },
    }));

    // Also try to update in IndexedDB if the order exists there
    try {
      const allOrders = await getAllOrders();
      const orderToUpdate = allOrders.find((o) => o.orderId === orderId);
      if (orderToUpdate) {
        const updatedOrder = {
          ...orderToUpdate,
          profitLoss: plData,
          hasCustomPL: true,
          plUpdatedAt: Date.now(),
        };
        await updateOrder(updatedOrder);
      }
    } catch (error) {
      console.error("Error updating order in IndexedDB:", error);
    }
  };

  // Get P&L for a specific order
  const getOrderPL = (orderId) => {
    return ordersPL[orderId] || null;
  };

  // Delete P&L for an order
  const deleteOrderPL = (orderId) => {
    setOrdersPL((prev) => {
      const newState = { ...prev };
      delete newState[orderId];
      return newState;
    });
  };

  return (
    <PLContext.Provider
      value={{
        ordersPL,
        updateOrderPL,
        getOrderPL,
        deleteOrderPL,
        loading,
      }}
    >
      {children}
    </PLContext.Provider>
  );
}

export const usePL = () => {
  const ctx = useContext(PLContext);
  if (!ctx) throw new Error("usePL must be used within PLProvider");
  return ctx;
};
