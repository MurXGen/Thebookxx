"use client";

import { useState, useEffect } from "react";
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
  Package,
  RefreshCw,
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
  bd = {},
  onPaid,
  autoOpen = false,
}) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState("choose"); // choose | qr | done
  const [mode, setMode] = useState(""); // full | advance
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  // UPI QR flow (mirrors the checkout modal): 2s "generating" loader, then the
  // sharp QR + a live "verifying" countdown while we wait for the payment.
  const [qrUnlocked, setQrUnlocked] = useState(false);
  const [verifyPhase, setVerifyPhase] = useState("await"); // await | verifying | timeout
  const [verifyCountdown, setVerifyCountdown] = useState(30);

  const codFee = Number(bd.codFee) || 0;
  const grand = Number(bd.grand) || 0;
  const sub = Number(bd.sub) || 0;
  const deliveryFee = Number(bd.deliveryFee) || 0;
  const discount = Number(bd.discount) || 0;
  const freeDelivery = !!bd.freeDelivery;
  const deliveryLabel = bd.deliveryLabel || "Delivery";
  // Gift-wrap charge: reuse what the order already carries, else a default.
  const giftWrapCharge = Number(order?.["Gift Wrap Charge"]) || 20;
  const giftWasOn = order?.["Gift Wrap"] === "Yes";

  // Add-ons — pre-checked from the order's existing data (exactly like checkout).
  const [giftWrap, setGiftWrap] = useState(giftWasOn);
  const [bookmark, setBookmark] = useState(true); // free with online payment

  // Gift-wrap amount for this pay (existing charge if it was on, else default).
  const giftAmt = giftWrap ? (giftWasOn ? Number(bd.giftFee) || giftWrapCharge : giftWrapCharge) : 0;
  // Online total = drop the COD fee, keep/adjust gift wrap, bookmark is free.
  const onlineTotal = Math.max(
    0,
    Math.round(grand - (Number(bd.giftFee) || 0) - codFee + giftAmt),
  );
  const advanceAmt = 99;
  const remaining = Math.max(0, onlineTotal - advanceAmt);
  // An explicit "Advance Amount" (e.g. a book-swap balance) means part is
  // already paid online — the customer now pays only the remaining balance.
  const alreadyPaid = Math.round(
    Number(String(order?.["Advance Amount"] ?? "").replace(/[^\d.]/g, "")) || 0,
  );
  const hasBalance = alreadyPaid > 0;
  const balanceDue = Math.max(0, onlineTotal - alreadyPaid);
  const payAmount = hasBalance
    ? balanceDue
    : mode === "advance"
      ? advanceAmt
      : onlineTotal;

  const pendingVerify = /unconfirmed/i.test(order?.["Order Status"] || "");

  const openModal = () => {
    setStage("choose");
    setMode("");
    setOpen(true);
  };

  // Shareable pay-link: open the pay flow automatically when arriving with the
  // ?pay param (and the order is still eligible / not already verifying).
  useEffect(() => {
    if (autoOpen && !pendingVerify) {
      setStage("choose");
      setMode("");
      setOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen]);
  const choose = (m) => {
    setMode(m);
    setStage("qr");
  };

  // Entering the QR stage: blur the QR for ~2s ("generating secure QR"), then
  // reveal the sharp code and start the live verification countdown.
  useEffect(() => {
    if (!open || stage !== "qr") return;
    setQrUnlocked(false);
    setVerifyPhase("await");
    const t = setTimeout(() => {
      setQrUnlocked(true);
      setVerifyCountdown(30);
      setVerifyPhase("verifying");
    }, 1800);
    return () => clearTimeout(t);
  }, [open, stage]);

  // Live "Verifying… Ns" countdown; falls back to a "Check again" state.
  useEffect(() => {
    if (verifyPhase !== "verifying") return;
    const tick = setInterval(() => {
      setVerifyCountdown((p) => (p <= 1 ? 0 : p - 1));
    }, 1000);
    const to = setTimeout(() => {
      setVerifyPhase((ph) => (ph === "verifying" ? "timeout" : ph));
    }, 30500);
    return () => {
      clearInterval(tick);
      clearTimeout(to);
    };
  }, [verifyPhase]);

  const checkAgain = () => {
    setVerifyCountdown(30);
    setVerifyPhase("verifying");
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
    // Online payment made → flag the order "Unconfirmed" so the team verifies
    // the payment, then moves it to "Processing". The name stays clean.
    const addonFields = {
      "Order Status": "Unconfirmed",
      "Gift Wrap": giftWrap ? "Yes" : "No",
      "Gift Wrap Charge": String(giftAmt),
    };
    const fields = hasBalance
      ? {
          // Balance paid online → order is now fully prepaid.
          "Payment Type": "UPI (Online)",
          "Total Amount": String(alreadyPaid + balanceDue),
          "Advance Paid": "No",
          "Advance Amount": "",
          ...addonFields,
        }
      : mode === "advance"
        ? {
            "Advance Paid": "Yes",
            "Total Amount": String(onlineTotal),
            ...addonFields,
          }
        : {
            "Payment Type": "UPI (Online)",
            "Total Amount": String(onlineTotal),
            ...addonFields,
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
            className={`bill-modal-overlay${stage === "qr" ? " upiv3-overlay" : ""}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{ maxWidth: "980px", margin: "0 auto" }}
          >
            <motion.div
              className={`bill-modal ${stage === "qr" ? "upiv3-modal" : "cpo-modal"}`}
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
                  {/* Bill summary — same rows/labels as checkout */}
                  <div className="cpo-bill">
                    <div className="bill-row">
                      <span>Item total</span>
                      <span>₹{sub}</span>
                    </div>
                    <div className="bill-row">
                      <span>{deliveryLabel}</span>
                      <span className={freeDelivery ? "cpo-free" : ""}>
                        {freeDelivery ? "FREE" : `+₹${deliveryFee}`}
                      </span>
                    </div>
                    {giftWrap && (
                      <div className="bill-row">
                        <span>Gift wrap</span>
                        <span>+₹{giftAmt}</span>
                      </div>
                    )}
                    <div className="bill-row">
                      <span>Bookmark</span>
                      <span className="cpo-free">FREE</span>
                    </div>
                    {codFee > 0 && (
                      <div className="bill-row">
                        <span>COD fee waived</span>
                        <span className="cpo-free">−₹{Math.round(codFee)}</span>
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="bill-row">
                        <span>Discount</span>
                        <span className="cpo-free">−₹{discount}</span>
                      </div>
                    )}
                    <div className="bill-row total">
                      <span>Total payable</span>
                      <span>₹{onlineTotal}</span>
                    </div>
                  </div>

                  {/* Add-ons — exact checkout UI, pre-checked from order data */}
                  <div className="pay-addon-block cpo-addons">
                    <span className="deliv-addon-head">Add-ons</span>
                    <div className="pa-list">
                      <button
                        type="button"
                        className={`pa-row${giftWrap ? " on" : ""}`}
                        onClick={() => setGiftWrap((v) => !v)}
                      >
                        <span className="pa-row-emoji">🎁</span>
                        <span className="pa-row-main">
                          <span className="pa-row-name">Gift wrap</span>
                        </span>
                        <span className="pa-row-price">+₹{giftWrapCharge}</span>
                        <span className={`pa-check${giftWrap ? " on" : ""}`}>
                          {giftWrap && <Check size={12} strokeWidth={3} />}
                        </span>
                      </button>
                      <button
                        type="button"
                        className={`pa-row${bookmark ? " on" : ""}`}
                        onClick={() => setBookmark((v) => !v)}
                      >
                        <span className="pa-row-emoji">🔖</span>
                        <span className="pa-row-main">
                          <span className="pa-row-name">Bookmark</span>
                          <span className="pa-row-sub free">
                            Free with online payment
                          </span>
                        </span>
                        <span className="pa-row-price free">FREE</span>
                        <span className={`pa-check${bookmark ? " on" : ""}`}>
                          {bookmark && <Check size={12} strokeWidth={3} />}
                        </span>
                      </button>
                    </div>
                  </div>

                  <span className="cpo-choose-head">
                    {hasBalance ? "Pay the balance" : "Choose how to pay"}
                  </span>
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
                        <strong>
                          {hasBalance ? "Pay balance online" : "Pay online (full)"}
                        </strong>
                        <small>
                          {hasBalance
                            ? `₹${alreadyPaid} already paid · ₹${balanceDue} due`
                            : "Pay now · nothing at delivery"}
                        </small>
                      </div>
                      <span className="cpo-opt-amt">
                        ₹{hasBalance ? balanceDue : onlineTotal}
                      </span>
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

                  {!hasBalance && (
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
                  )}
                </div>
              )}

              {stage === "qr" && (
                <>
                  <div className="upiv3 upiv3-scroll">
                    {/* Payee (merchant) card */}
                    <div className="upiv3-payee">
                      <span className="upiv3-payee-logo">TB</span>
                      <div className="upiv3-payee-info">
                        <span className="upiv3-payee-name">TheBookX</span>
                        <span className="upiv3-payee-upi">{UPI_ID}</span>
                      </div>
                      <span className="upiv3-verified">
                        <ShieldCheck size={11} /> Verified
                      </span>
                    </div>

                    {/* QR shows immediately; a loader blurs it while it "generates" */}
                    <motion.div
                      className="upiv3-qr"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="upiv3-qr-card">
                        <div className="upiv3-qr-top">
                          <div className="upiv3-qr-top-l">
                            <span className="upiv3-qr-payee-lbl">Paying to</span>
                            <span className="upiv3-qr-payee">TheBookX</span>
                          </div>
                          <span className="upiv3-qr-amt">
                            ₹{payAmount}
                            {mode === "advance" && (
                              <span className="upiv3-qr-adv">advance</span>
                            )}
                          </span>
                        </div>

                        <div
                          className={`upiv3-qr-img${qrUnlocked ? " ready" : " loading"}`}
                        >
                          <span className="upiv3-corner tl" aria-hidden="true" />
                          <span className="upiv3-corner tr" aria-hidden="true" />
                          <span className="upiv3-corner bl" aria-hidden="true" />
                          <span className="upiv3-corner br" aria-hidden="true" />
                          <img
                            src="/books/uskillbook.png"
                            alt="UPI QR Code"
                            width={300}
                            height={360}
                          />
                          {qrUnlocked && (
                            <span
                              className="upiv3-scanline"
                              aria-hidden="true"
                            />
                          )}
                          {!qrUnlocked && (
                            <div className="upiv3-qr-loader">
                              <span className="upiv3-spin lg" />
                              <span>Generating secure QR…</span>
                            </div>
                          )}
                        </div>

                        <span className="upiv3-qr-scan">
                          {qrUnlocked
                            ? "Scan with any UPI app to pay"
                            : "Hang tight — preparing your QR"}
                        </span>

                        {qrUnlocked && (
                          <span className="upiv3-status">
                            <span className="upiv3-status-dot" />
                            Waiting for your payment…
                          </span>
                        )}
                      </div>
                    </motion.div>

                    {/* Works with — real UPI apps */}
                    <div className="upiv3-apps" aria-hidden="true">
                      <span className="upiv3-apps-lbl">Works with</span>
                      <span className="upiv3-app-chip gpay">GPay</span>
                      <span className="upiv3-app-chip phonepe">PhonePe</span>
                      <span className="upiv3-app-chip paytm">Paytm</span>
                      <span className="upiv3-app-chip bhim">BHIM</span>
                      <span className="upiv3-apps-more">+ all UPI</span>
                    </div>

                    {/* Trust footer */}
                    <div className="upiv3-trust">
                      <span>
                        <ShieldCheck size={13} /> 256-bit encrypted
                      </span>
                      <span>
                        <Package size={13} /> Tracked end-to-end
                      </span>
                    </div>
                  </div>

                  {/* Fixed footer — UPI id / Save QR + verify actions */}
                  <div className="upiv3-footer">
                    <div className="upiv3-id-row">
                      <button
                        type="button"
                        className="upiv3-link"
                        onClick={copyUpi}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? "Copied!" : "Copy UPI ID"}
                      </button>
                      <span className="upiv3-link-sep">|</span>
                      <button
                        type="button"
                        className="upiv3-link"
                        onClick={saveQR}
                        disabled={!qrUnlocked}
                      >
                        <Download size={14} /> Save QR
                      </button>
                    </div>

                    <div className="upiv3-actions-row">
                      {verifyPhase === "timeout" ? (
                        <button
                          type="button"
                          className="sec-big-btn flex flex-row items-center justify-center gap-6"
                          onClick={checkAgain}
                        >
                          <RefreshCw size={15} /> Check again
                        </button>
                      ) : (
                        <span className="sec-big-btn is-loading flex flex-row items-center justify-center gap-6">
                          <span className="upiv3-spin dark" /> Verifying…{" "}
                          {verifyCountdown}s
                        </span>
                      )}
                      <button
                        type="button"
                        className="sec-big-btn flex flex-row items-center justify-center gap-6"
                        disabled={busy}
                        onClick={markPaid}
                      >
                        {busy ? (
                          <span className="upiv3-spin dark" />
                        ) : (
                          <FaWhatsapp size={16} color="#25D366" />
                        )}{" "}
                        I&apos;ve paid
                      </button>
                    </div>
                  </div>
                </>
              )}

              {stage === "done" && (
                <div className="cpo-done">
                  <span className="cpo-waiting-ic">
                    <Loader2 size={30} className="cpo-spin" />
                  </span>
                  <h3>Waiting for payment confirmation…</h3>
                  <p>
                    We&apos;ll confirm your payment shortly. Please send us the
                    payment screenshot on WhatsApp so we can verify and confirm
                    your order faster.
                  </p>
                  <a
                    className="pri-big-btn width100"
                    href={`https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent(
                      `Hi TheBookX, I've paid ₹${payAmount} online for order ${orderId}. Sharing my payment screenshot — please confirm.`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      textDecoration: "none",
                    }}
                  >
                    <FaWhatsapp size={17} /> Send screenshot on WhatsApp
                  </a>
                  <button
                    type="button"
                    className="cpo-waiting-close"
                    onClick={() => setOpen(false)}
                  >
                    Close
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
