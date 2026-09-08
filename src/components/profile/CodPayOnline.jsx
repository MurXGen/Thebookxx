"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowLeft,
  Gift,
  ShieldCheck,
  Copy,
  Check,
  Download,
  Loader2,
  Wallet,
  Zap,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { updateOrderRow } from "@/utils/googleFormOrder";
import { showToast } from "@/context/ToastContext";

const UPI_ID = "7977960242-1@okbizaxis";
const SUPPORT_WA = "917710892108";

// COD → pay-online upgrade for the order-detail page. Shows the perks (free
// bookmark, no COD fee), lets the shopper choose "pay in full" or "pay ₹99
// advance", takes the UPI payment, then marks the order for verification:
// the name is set to "(unconfirmed)" and the payment/total updated to the
// chosen option, so the team can verify and confirm (removing "(unconfirmed)").
export default function CodPayOnline({
  order,
  orderId,
  phone,
  name,
  codFee = 0,
  grand = 0,
  onPaid,
}) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState("choose"); // choose | qr | done
  const [mode, setMode] = useState(""); // full | advance
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const onlineTotal = Math.max(0, Math.round(grand - codFee));
  const advanceAmt = 99;
  const remaining = Math.max(0, onlineTotal - advanceAmt);
  const payAmount = mode === "advance" ? advanceAmt : onlineTotal;

  const pendingVerify = /\(unconfirmed\)/i.test(
    name || order?.["Customer Name"] || "",
  );

  const openModal = () => {
    setStage("choose");
    setMode("");
    setOpen(true);
  };
  const choose = (m) => {
    setMode(m);
    setStage("qr");
  };
  const copyUpi = () => {
    try {
      navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  const saveQR = () => {
    const a = document.createElement("a");
    a.href = "/books/uskillbook.png";
    a.download = "thebookx-upi-qr.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const markPaid = async () => {
    if (busy) return;
    setBusy(true);
    const baseName = String(name || order?.["Customer Name"] || "")
      .replace(/\s*\(unconfirmed\)\s*/gi, "")
      .trim();
    const unconfirmedName = `${baseName} (unconfirmed)`;
    // Full online → switch payment type; advance → keep COD but mark advance.
    // Either way the COD fee is dropped from the total.
    const fields =
      mode === "advance"
        ? {
            "Customer Name": unconfirmedName,
            "Advance Paid": "Yes",
            "Total Amount": String(onlineTotal),
          }
        : {
            "Customer Name": unconfirmedName,
            "Payment Type": "UPI (Online)",
            "Total Amount": String(onlineTotal),
          };
    try {
      await updateOrderRow(orderId, fields);
      onPaid?.(fields);
      // Notify the team so they can verify the payment and confirm the order.
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://thebookx.in";
      const merchantLink = `${origin}/${encodeURIComponent(orderId)}`;
      const msg = [
        `Hi TheBookX, I've *paid ₹${payAmount}* online for order ${orderId} (${
          mode === "advance" ? "₹99 advance, rest at delivery" : "full online"
        }). Please verify & confirm.`,
        "",
        `Order: ${origin}/profile/${phone}/orders/${orderId}`,
        "",
        "——— Merchant only:",
        merchantLink,
      ].join("\n");
      window.open(
        `https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent(msg)}`,
        "_blank",
        "noopener,noreferrer",
      );
      setStage("done");
    } catch (e) {
      showToast(
        "Couldn't record your payment. Please retry or contact support.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };

  // Payment already made & awaiting verification — show a status strip.
  if (pendingVerify) {
    return (
      <div className="cpo-verifying">
        <Loader2 size={16} className="cpo-spin" />
        <span>
          Payment received — we&apos;re verifying and will confirm your order
          shortly.
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="cpo-card">
        <div className="cpo-card-top">
          <span className="cpo-badge-ic">
            <Wallet size={18} />
          </span>
          <div className="cpo-card-txt">
            <h3 className="cpo-title">Paying cash on delivery?</h3>
            <p className="cpo-sub">Pay online now and unlock extra perks.</p>
          </div>
        </div>
        <div className="cpo-perks">
          <span className="cpo-perk">
            <Gift size={14} /> Free bookmark
          </span>
          <span className="cpo-perk">
            <ShieldCheck size={14} /> No COD fee
          </span>
          {codFee > 0 && (
            <span className="cpo-perk save">Save ₹{Math.round(codFee)}</span>
          )}
        </div>
        <button type="button" className="cpo-cta" onClick={openModal}>
          Pay online now
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{ maxWidth: "980px", margin: "0 auto" }}
          >
            <motion.div
              className="bill-modal cpo-modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <span className="weight-600 font-16 flex items-center gap-8">
                  {stage === "qr" && (
                    <button
                      type="button"
                      className="paymeth-back"
                      onClick={() => setStage("choose")}
                      aria-label="Back"
                    >
                      <ArrowLeft size={16} />
                    </button>
                  )}
                  {stage === "choose"
                    ? "Choose how to pay"
                    : stage === "qr"
                      ? `Pay ₹${payAmount}`
                      : "Payment received"}
                </span>
                <span className="cursor-pointer" onClick={() => setOpen(false)}>
                  <X size={18} />
                </span>
              </div>

              {stage === "choose" && (
                <div className="cpo-choose">
                  <button
                    type="button"
                    className="cpo-opt"
                    onClick={() => choose("full")}
                  >
                    <div className="cpo-opt-head">
                      <span className="cpo-opt-ic full">
                        <Zap size={18} />
                      </span>
                      <div className="cpo-opt-t">
                        <strong>Pay online (full)</strong>
                        <small>Pay now · nothing at delivery</small>
                      </div>
                      <span className="cpo-opt-amt">₹{onlineTotal}</span>
                    </div>
                    <div className="cpo-opt-perks">
                      <span>
                        <Gift size={12} /> Free bookmark
                      </span>
                      <span>
                        <ShieldCheck size={12} /> No COD fee
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="cpo-opt"
                    onClick={() => choose("advance")}
                  >
                    <div className="cpo-opt-head">
                      <span className="cpo-opt-ic">
                        <Wallet size={18} />
                      </span>
                      <div className="cpo-opt-t">
                        <strong>Pay in two parts</strong>
                        <small>
                          ₹{advanceAmt} now · ₹{remaining} at delivery
                        </small>
                      </div>
                      <span className="cpo-opt-amt">₹{advanceAmt}</span>
                    </div>
                    <div className="cpo-opt-perks">
                      <span>
                        <Gift size={12} /> Free bookmark
                      </span>
                      <span>
                        <ShieldCheck size={12} /> No COD fee
                      </span>
                    </div>
                  </button>
                </div>
              )}

              {stage === "qr" && (
                <div className="paynow-upi">
                  <div className="paynow-upi-amt">
                    Pay ₹{payAmount} to TheBookX
                  </div>
                  <img
                    src="/books/uskillbook.png"
                    alt="UPI QR code"
                    className="paynow-qr"
                  />
                  <div className="paynow-upi-id-row">
                    <span className="paynow-upi-id">{UPI_ID}</span>
                    <button
                      type="button"
                      className="paynow-upi-copy"
                      onClick={copyUpi}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="paynow-upi-btns">
                    <button
                      type="button"
                      className="sec-big-btn paynow-upi-save"
                      onClick={saveQR}
                    >
                      <Download size={15} /> Save QR
                    </button>
                    <button
                      type="button"
                      className="pri-big-btn paynow-upi-done"
                      disabled={busy}
                      onClick={markPaid}
                    >
                      {busy ? (
                        <Loader2 size={16} className="cpo-spin" />
                      ) : (
                        <FaWhatsapp size={16} />
                      )}{" "}
                      I&apos;ve paid
                    </button>
                  </div>
                  <p className="paymeth-gift-fine">
                    Scan in any UPI app to pay. Then tap “I&apos;ve paid” — we
                    verify and confirm your order shortly.
                  </p>
                </div>
              )}

              {stage === "done" && (
                <div className="cpo-done">
                  <span className="cpo-done-ic">
                    <Check size={26} strokeWidth={3} />
                  </span>
                  <h3>Thanks! Payment noted</h3>
                  <p>
                    We&apos;re verifying your payment. Your order will be
                    confirmed shortly and you&apos;ll see it update here.
                  </p>
                  <button
                    type="button"
                    className="pri-big-btn"
                    onClick={() => setOpen(false)}
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
