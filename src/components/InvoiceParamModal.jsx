"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { CODSuccessModal } from "@/components/UI/AddressModal";
import { fetchOrderById } from "@/utils/googleFormOrder";

// Parse the sheet "Books List" string into receipt-ready items.
const parseBooks = (booksStr) => {
  if (!booksStr) return [];
  return String(booksStr)
    .split("\n")
    .map((line) => {
      if (!line.trim()) return null;
      const m = line.match(
        /\d+\.\s([^|]+)\s*\|\s*Qty:\s*(\d+)\s*\|\s*₹(\d+)\s*each/,
      );
      if (m) {
        return {
          name: m[1].trim(),
          qty: parseInt(m[2], 10) || 1,
          discountedPrice: parseInt(m[3], 10) || 0,
        };
      }
      const nm = line.match(/\d+\.\s([^|]+)/);
      return nm ? { name: nm[1].trim(), qty: 1, discountedPrice: 0 } : null;
    })
    .filter(Boolean);
};

const num = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
};

// When a customer opens thebookx.in?orderID=…, fetch that order from the sheet
// and show the printed-receipt invoice (no scratch card).
export default function InvoiceParamModal() {
  const [order, setOrder] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const id = (
      params.get("orderID") ||
      params.get("orderId") ||
      params.get("orderid") ||
      ""
    ).trim();
    if (!id) return;
    setOpen(true);
    fetchOrderById(id)
      .then((row) => {
        if (row) setOrder(row);
        else setOpen(false);
      })
      .catch(() => setOpen(false));
  }, []);

  const close = () => {
    setOpen(false);
    // Clean the URL so a refresh doesn't reopen it.
    try {
      const url = new URL(window.location.href);
      ["orderID", "orderId", "orderid"].forEach((k) =>
        url.searchParams.delete(k),
      );
      window.history.replaceState({}, "", url.pathname + url.search);
    } catch {}
  };

  if (!open || !order) return null;

  const books = parseBooks(order["Books List"]);
  const subtotal = books.reduce((s, b) => s + b.discountedPrice * b.qty, 0);
  const payType = String(order["Payment Type"] || "");
  const isCOD = /cod|cash/i.test(payType);
  const deliveryType = String(order["Delivery Type"] || "");
  const dateStr = String(order["Timestamp"] || "").split(" ")[0];

  return (
    <AnimatePresence>
      <CODSuccessModal
        key="invoice"
        showReward={false}
        hapticOnTap
        loadingTitle="Fetching your invoice…"
        loadingSub="Loading your order details"
        orderRefIn={String(order["Order ID"] || "")}
        dateIn={dateStr}
        name={String(order["Customer Name"] || "").replace(
          /\s*\(unconfirmed\)\s*/i,
          "",
        )}
        phone={String(order["Phone Number"] || "")}
        address={String(order["Address"] || "")}
        city={String(order["City"] || "")}
        pincode={String(order["Pincode"] || "")}
        fasterDelivery={/faster/i.test(deliveryType)}
        totalAmount={num(order["Total Amount"])}
        totalDiscounted={subtotal}
        deliveryCharge={num(order["Delivery Charge"])}
        giftWrap={/yes/i.test(String(order["Gift Wrap"] || ""))}
        giftWrapCharge={num(order["Gift Wrap Charge"])}
        cartBooks={books}
        paymentMode={isCOD ? "COD" : "UPI"}
        onClose={close}
        onViewProfile={() => {
          window.location.href = "/profile";
        }}
      />
    </AnimatePresence>
  );
}
