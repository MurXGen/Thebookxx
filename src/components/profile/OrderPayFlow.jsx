"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { UPIPaymentModal } from "@/components/UI/AddressModal";
import { fetchOrderStatusById } from "@/utils/googleFormOrder";
import { PAYMENT_PENDING_STATUS, markPaymentPending } from "@/lib/paymentPending";
import { showToast } from "@/context/ToastContext";

const UPI_ID = "7977960242-1@okbizaxis";
const SUPPORT_WHATSAPP = "917710892108";
const TELEGRAM_URL = "https://api.journalx.app/api/bookxTelegram/order";

const writeStatus = (orderId, status, keepalive = false) =>
  fetch("/api/order-write", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive,
    body: JSON.stringify({ action: "update", orderId, data: { "Order Status": status } }),
  }).catch(() => {});

/**
 * "Complete payment" from the order details page — the same UPI QR flow as
 * checkout: 2s "preparing QR", then the QR with a 30s live check (the team gets
 * the order on Telegram with Passed / Failed buttons), then "I've paid, verify
 * status" with the full-screen checking loader. Confirmed → success tick;
 * Failed → failed screen with Try again; still unverified → the order is marked
 * "Payment Pending" and the page shows "Order is still processing".
 */
export default function OrderPayFlow({
  open,
  onClose,
  orderId,
  amount,
  advance = false,
  customer = {}, // { name, phone, address }
  items = [], // [{ name, qty, price, image }]
  onConfirmed, // payment confirmed by the team
  onPending, // shopper says they paid; awaiting verification
  resetFailed = false, // order reads "Payment Failed": clear it before the live check
}) {
  const [phase, setPhase] = useState("await");
  const [qrUnlocked, setQrUnlocked] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [copied, setCopied] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const timers = useRef({});
  const done = useRef(false);
  const notified = useRef(false);

  const clearTimers = () => {
    const t = timers.current;
    clearInterval(t.poll);
    clearInterval(t.tick);
    clearTimeout(t.to);
    clearTimeout(t.start);
    timers.current = {};
  };

  const success = useCallback(() => {
    if (done.current) return;
    done.current = true;
    clearTimers();
    setPhase("success");
    setTimeout(() => {
      onConfirmed?.();
      onClose?.();
    }, 1900);
  }, [onConfirmed, onClose]);

  const failed = () => {
    clearTimers();
    setPhase("failed");
  };

  const check = async () => {
    try {
      const r = await fetchOrderStatusById(orderId);
      if (r?.confirmed) {
        success();
        return true;
      }
      if (r?.failed) {
        failed();
        return true;
      }
    } catch {}
    return false;
  };

  // Post this order to the team's Telegram with Passed / Failed buttons.
  const notifyTeam = () => {
    if (notified.current) return;
    notified.current = true;
    const lines = items.map((it, i) => `${i + 1}. ${it.name} ×${it.qty || 1}`).join("\n");
    const msg =
      `💳 *Payment retry · order page*\n\n` +
      `👤 *${customer.name || "Customer"}*\n📞 ${customer.phone || "—"}\n` +
      (customer.address ? `📍 ${customer.address}\n` : "") +
      (lines ? `\n📚 *Items*\n${lines}\n` : "") +
      `\n💰 *Paying now: ₹${amount}*${advance ? " (advance)" : ""}\n\n🆔 ${orderId}`;
    const payload = JSON.stringify({
      orderDetails: msg,
      customerName: customer.name || "",
      customerPhone: customer.phone || "",
      totalAmount: amount,
      paymentMethod: advance ? "ADV" : "UPI",
      actionButtons: "verify",
      orderId,
    });
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(TELEGRAM_URL, new Blob([payload], { type: "application/json" }))) return;
    } catch {}
    fetch(TELEGRAM_URL, { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true, body: payload }).catch(() => {});
  };

  // Open → 2s "preparing QR" → QR + 30s live check → "verify status".
  const start = () => {
    clearTimers();
    done.current = false;
    setPhase("await");
    setQrUnlocked(false);
    timers.current.start = setTimeout(() => {
      setQrUnlocked(true);
      setCountdown(30);
      setPhase("counting");
      notifyTeam();
      check();
      timers.current.tick = setInterval(() => setCountdown((p) => (p <= 1 ? 0 : p - 1)), 1000);
      timers.current.poll = setInterval(check, 5000);
      timers.current.to = setTimeout(() => {
        clearInterval(timers.current.tick);
        clearInterval(timers.current.poll);
        setPhase((ph) => (ph === "counting" ? "ready" : ph));
      }, 30500);
    }, 2000);
  };

  useEffect(() => {
    if (!open) {
      clearTimers();
      return;
    }
    notified.current = false;
    let cancelled = false;
    // A failed order would make the live check bounce straight back to the
    // failed screen, so reset it to plain "Unconfirmed" first (like checkout's
    // "Try again").
    const go = resetFailed ? writeStatus(orderId, "Unconfirmed") : Promise.resolve();
    go.then(() => !cancelled && start());
    return () => {
      cancelled = true;
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // "I've paid, verify status" → same 3s checking loader as checkout.
  const verify = async () => {
    if (phase === "rechecking" || done.current) return;
    clearTimers();
    setPhase("rechecking");
    setVerifyLoading(true);
    const t0 = Date.now();
    let r = null;
    try {
      r = await fetchOrderStatusById(orderId);
    } catch {}
    await new Promise((res) => setTimeout(res, Math.max(0, 3000 - (Date.now() - t0))));
    setVerifyLoading(false);
    if (r?.confirmed) return success();
    if (r?.failed) return failed();
    writeStatus(orderId, PAYMENT_PENDING_STATUS, true);
    markPaymentPending(orderId);
    done.current = true;
    onPending?.(PAYMENT_PENDING_STATUS);
    onClose?.();
    showToast("Thanks! We're confirming your payment — this page updates on its own.", "success");
  };

  const tryAgain = () => {
    writeStatus(orderId, "Unconfirmed");
    notified.current = false;
    start();
  };

  const copyUpi = () => {
    try {
      navigator.clipboard.writeText(UPI_ID);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
    showToast("UPI ID copied to clipboard", "success");
  };

  const downloadQR = () => {
    const a = document.createElement("a");
    a.href = "/books/uskillbook.png";
    a.download = "thebookx-upi-qr.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast("QR code downloaded", "success");
  };

  const whatsApp = () => {
    const msg =
      `Hi TheBookX 👋\n\nI've *paid ₹${amount} via UPI* for my order — please verify:\n\n` +
      `📦 *Order ID:* ${orderId}\n👤 ${customer.name || ""}\n📱 ${customer.phone || ""}\n\nThank you! 🙏`;
    window.open(`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  const close = () => {
    clearTimers();
    onClose?.();
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <UPIPaymentModal
            finalPayable={amount}
            totalToPay={amount}
            fasterDelivery={false}
            fasterDeliveryCharge={0}
            standardDeliveryCharge={0}
            giftWrap={false}
            giftWrapCharge={0}
            advanceMode={advance}
            qrUnlocked={qrUnlocked}
            upiCopied={copied}
            upiPhase={phase}
            verifyCountdown={countdown}
            onVerifyStatus={verify}
            upiId={UPI_ID}
            onRevealQR={() => {}}
            onCopyUpi={copyUpi}
            onDownloadQR={downloadQR}
            onVerify={verify}
            onClose={close}
            onWhatsAppFallback={whatsApp}
            onCheckStatus={verify}
            onTryAgain={tryAgain}
            summaryName={customer.name || ""}
            summaryItems={items}
          />
        )}
      </AnimatePresence>

      {verifyLoading && (
        <div className="osc-overlay osc-verify-overlay" role="status" aria-live="polite">
          <div className="osc-placing">
            <span className="osc-placing-spinner" aria-hidden="true" />
            <span className="osc-placing-txt">Checking your payment status…</span>
            <span className="osc-placing-sub">Hang tight — this takes just a few seconds</span>
          </div>
        </div>
      )}
    </>
  );
}
