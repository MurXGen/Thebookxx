"use client";

import { useEffect, useRef, useState } from "react";
import {
  Info,
  X,
  Receipt,
  PiggyBank,
  Gift,
  Truck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useTrackView } from "@/lib/trackingHooks";
import { EVENTS } from "@/lib/trackingEvents";
import { trackCartEvent } from "@/utils/cartEvents";

export default function BillModal({
  open,
  onClose,
  totalOriginal,
  totalDiscounted,
  offerLabel,
  offerDiscount,
  // Part of offerDiscount that comes from 2-book combos (shown as its own row).
  comboDiscount = 0,
  // Unlocked cart reward the shopper hasn't applied yet → one-tap Apply row.
  unlockedOffer = null,
  onApplyOffer,
  walletApplied = 0,
  standardDeliveryCharge = 0,
  fasterDeliveryCharge = 0,
  isFasterDelivery = false,
  totalWithDelivery = null,
  giftWrapCharge = 0,
  giftWrapSelected = false,
  // NEW, when true, hide all delivery-related rows AND exclude delivery
  // from the displayed "You Pay" total. Used when the user hasn't yet
  // committed to shipping (i.e. the nudge modal is still pending).
  hideDeliveryCharges = false,
  // QuickReads bundled onto this same bill (one combined checkout).
  quickReadItems = [],
  quickReadUnitPrice = 0,
  quickReadTotal = 0,
  // Small-gap wallet top-up (paid now, credited to the wallet for next order).
  walletTopUp = 0,
  // Exact bill from checkout (buildBillSnapshot). When present it drives every
  // line and the total, so View bill always matches the checkout footer.
  snapshot = null,
  // Bag-only extras (ignored when a checkout snapshot is shown):
  bookmarkCharge = 0, // extra bookmarks beyond the free ones
  bagCoupon = null, // { code, off, short } — coupon picked in the bag (WELCOME10)
  bagTotal = null, // bag "To pay" (after coupon)
  bagTotalBefore = null, // bag "To pay" before the coupon (struck through)
  freeDeliveryShort = 0, // ₹ more needed for free delivery
}) {
  const S = snapshot;
  if (S) {
    offerDiscount = S.offer || 0;
    walletApplied = S.wallet || 0;
    isFasterDelivery = !!S.faster;
    giftWrapSelected = (S.gift || 0) > 0;
    giftWrapCharge = S.gift || 0;
    walletTopUp = S.walletTopUp || 0;
    hideDeliveryCharges = false;
    bagCoupon = null;
    bagTotal = null;
    freeDeliveryShort = 0;
  }
  const bagCouponOn = !!bagCoupon && bagCoupon.off > 0;
  // A coupon at checkout switches offers (incl. the combo) off.
  const comboShown = S?.couponDiscount > 0 ? 0 : Math.min(comboDiscount || 0, offerDiscount || 0);
  useTrackView(
    EVENTS.BILL_MODAL_VIEWED,
    {
      total_original: totalOriginal,
      total_discounted: totalDiscounted,
      final_payable: totalDiscounted - offerDiscount,
      has_gift_wrap: giftWrapSelected,
      is_faster_delivery: isFasterDelivery,
      delivery_charge: isFasterDelivery
        ? fasterDeliveryCharge
        : standardDeliveryCharge,
      hide_delivery_charges: hideDeliveryCharges,
    },
    open,
  );

  const hasTrackedClose = useRef(false);
  const finalPayable = totalDiscounted - offerDiscount - (walletApplied || 0);
  // Handling & Care applies on carts above ₹1000.
  const isHandling = totalDiscounted > 1000;
  const [showHandlingInfo, setShowHandlingInfo] = useState(false);

  useEffect(() => {
    if (
      !open &&
      hasTrackedClose.current === false &&
      hasTrackedClose.current !== undefined
    ) {
      hasTrackedClose.current = true;
    }
    if (open) {
      hasTrackedClose.current = false;
      // Record "View bill" engagement on the shopper's abandoned-cart row.
      trackCartEvent("viewbill");
    }
  }, [open]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const getDeliveryCharge = () => {
    if (isFasterDelivery) return fasterDeliveryCharge;
    return standardDeliveryCharge;
  };

  const deliveryCharge = getDeliveryCharge();

  // When hiding delivery, the displayed total excludes it.
  // Only add gift wrap when it's actually selected.
  const qrTotal = quickReadTotal || 0;
  const gwCharge = giftWrapSelected ? giftWrapCharge : 0;
  const topUp = Number(walletTopUp) || 0;
  let finalTotal = topUp +
    (hideDeliveryCharges
      ? finalPayable + gwCharge
      : totalWithDelivery !== null
        ? totalWithDelivery
        : finalPayable + deliveryCharge + gwCharge) + qrTotal;

  // Savings story: what TheBookX knocked off the MRP on this order.
  const itemSaving = Math.max(0, (totalOriginal || 0) - (totalDiscounted || 0));
  const totalSaving = itemSaving + (offerDiscount || 0) + (bagCouponOn ? bagCoupon.off : 0);
  const savingPct =
    totalOriginal > 0 ? Math.round((totalSaving / totalOriginal) * 100) : 0;
  // Split delivery: Handling & Care (big carts) and the Faster priority fee
  // are shown as their own lines, never lumped together.
  let handlingAmt = isHandling ? standardDeliveryCharge : 0;
  let stdDeliveryAmt = isHandling ? 0 : standardDeliveryCharge;
  let fasterExtra = isFasterDelivery
    ? Math.max(0, fasterDeliveryCharge - standardDeliveryCharge)
    : 0;

  if (S) {
    handlingAmt = S.handling || 0;
    stdDeliveryAmt = S.deliveryStd || 0;
    fasterExtra = S.priority || 0;
    finalTotal = S.total || 0;
  } else if (bagTotal !== null) {
    // Bag view: use the bag's own To pay so the two always match.
    finalTotal = bagTotal;
  }
  const struckTotal = bagCouponOn && bagTotalBefore > finalTotal ? bagTotalBefore : 0;

  return createPortal(
    <div
      className="bill-modal-overlay"
      style={{ zIndex: 2147483002, maxWidth: "980px", margin: "0 auto" }}
      onClick={onClose}
    >
      <motion.div
        className="bill-modal bm2"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bm2-title"
        onClick={(e) => e.stopPropagation()}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(e, info) => {
          if (info.offset.y > 120 || info.velocity.y > 700) onClose();
        }}
      >
        <div className="bill-header">
          <span id="bm2-title" className="bm2-title">
            <Receipt size={17} /> Bill details
          </span>
          <button
            type="button"
            className="bm2-x"
            aria-label="Close bill"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {totalSaving > 0 && (
          <div className="bm2-save">
            <span className="bm2-save-ic">
              <PiggyBank size={22} />
            </span>
            <span className="bm2-save-txt">
              <strong>You&apos;re saving ₹{totalSaving}</strong>
              <span>
                That&apos;s {savingPct}% off the MRP of ₹{totalOriginal}
              </span>
            </span>
          </div>
        )}

        <div className="bm2-sec">
          <div className="bill-row">
            <span>Total MRP</span>
            <span className="bm2-strike">₹{totalOriginal}</span>
          </div>
          <div className="bill-row">
            <span>TheBookX discount</span>
            <span className="green">− ₹{itemSaving}</span>
          </div>
          {comboShown > 0 && (
            <div className="bill-row">
              <span>★ Combo discount (10%)</span>
              <span className="green">− ₹{comboShown}</span>
            </div>
          )}
          {offerDiscount - comboShown > 0 && (
            <div className="bill-row">
              <span>Achievement discount</span>
              <span className="green">− ₹{offerDiscount - comboShown}</span>
            </div>
          )}
          {S?.couponDiscount > 0 && (
            <div className="bill-row">
              <span>Coupon{S.coupon ? ` (${S.coupon})` : ""}</span>
              <span className="green">− ₹{S.couponDiscount}</span>
            </div>
          )}
          {bagCoupon && (
            <div className={`bill-row bm2-coupon${bagCouponOn ? " on" : ""}`}>
              <span className="flex flex-col">
                <span>
                  <b className="bm2-coupon-tag">{bagCoupon.code}</b>{" "}
                  {bagCouponOn ? "Coupon applied" : "Coupon saved"}
                </span>
                {!bagCouponOn && (
                  <span className="bm2-muted">
                    {bagCoupon.short > 0
                      ? `Add ₹${bagCoupon.short} more to unlock 10% off`
                      : "Your current offers already save more"}
                  </span>
                )}
              </span>
              {bagCouponOn && <span className="green">− ₹{bagCoupon.off}</span>}
            </div>
          )}
          {!S && unlockedOffer && onApplyOffer && (
            <button
              type="button"
              className="bm2-apply"
              onClick={() => onApplyOffer(unlockedOffer)}
            >
              <span className="bm2-apply-emoji" aria-hidden="true">
                🎁
              </span>
              <span className="bm2-apply-txt">
                <strong>{unlockedOffer.reward} unlocked</strong>
                <span>
                  {offerDiscount > 0
                    ? `Upgrade your reward and save ₹${unlockedOffer.value}`
                    : `Tap to apply and save ₹${unlockedOffer.value}`}
                </span>
              </span>
              <span className="bm2-apply-btn">Apply</span>
            </button>
          )}
          {walletApplied > 0 && (
            <div className="bill-row">
              <span>Wallet balance used</span>
              <span className="green">− ₹{walletApplied}</span>
            </div>
          )}
        </div>

        <div className="bm2-sec">
          {hideDeliveryCharges ? (
            <div className="bill-row">
              <span className="bm2-muted">
                Shipping will be calculated at checkout
              </span>
            </div>
          ) : (
            <>
              {/* Only ONE delivery line — Faster (when chosen) overrides and
                  replaces the standard line; otherwise standard (free/charged).
                  Handling & Care is a separate concept, shown below for big
                  carts. */}
              {isFasterDelivery ? (
                <div className="bill-row">
                  <span className="flex flex-col">
                    <span>Faster delivery</span>
                    <span className="bm2-muted">Priority dispatch · 1–6 days</span>
                  </span>
                  <span className="orange">
                    {fasterExtra > 0 ? `+ ₹${fasterExtra}` : "FREE"}
                  </span>
                </div>
              ) : (
                <div className="bill-row">
                  <span className="flex flex-col">
                    <span>Delivery</span>
                    <span className="bm2-muted">Standard · 4–9 days</span>
                    {stdDeliveryAmt > 0 && freeDeliveryShort > 0 && (
                      <span className="bm2-free-hint">
                        Add ₹{freeDeliveryShort} more to get FREE delivery
                      </span>
                    )}
                  </span>
                  <span className={stdDeliveryAmt > 0 ? "" : "green"}>
                    {stdDeliveryAmt > 0 ? `+ ₹${stdDeliveryAmt}` : "FREE"}
                  </span>
                </div>
              )}
              {handlingAmt > 0 && (
                <div className="bill-row">
                  <span className="flex flex-col gap-4">
                    <span className="bill-handling-head">
                      Handling &amp; Care
                      <button
                        type="button"
                        className="bill-info-btn"
                        aria-label="What is Handling & Care?"
                        onClick={() => setShowHandlingInfo((v) => !v)}
                      >
                        <Info size={13} />
                      </button>
                    </span>
                    <span className="bm2-muted">
                      Protective packing &amp; secure shipping
                    </span>
                    {showHandlingInfo && (
                      <span className="bill-info-tip">
                        Covers protective packing, careful handling and secure
                        doorstep delivery, so your books reach you in perfect
                        condition.
                      </span>
                    )}
                  </span>
                  <span>+ ₹{handlingAmt}</span>
                </div>
              )}
            </>
          )}
          {topUp > 0 && (
            <div className="bill-row">
              <span>Wallet top-up (back in your wallet for next order)</span>
              <span>₹{topUp}</span>
            </div>
          )}
          {giftWrapSelected && giftWrapCharge > 0 && (
            <div className="bill-row">
              <span>Gift wrap</span>
              <span className="orange">+ ₹{giftWrapCharge}</span>
            </div>
          )}
          {(S ? S.bookmarkCharge : bookmarkCharge) > 0 && (
            <div className="bill-row">
              <span>Extra bookmarks</span>
              <span className="orange">+ ₹{S ? S.bookmarkCharge : bookmarkCharge}</span>
            </div>
          )}
          {S?.codFee > 0 && (
            <div className="bill-row">
              <span>Cash on Delivery fee</span>
              <span className="orange">+ ₹{S.codFee}</span>
            </div>
          )}
          {quickReadItems.length > 0 && (
            <>
              <div className="bill-row" style={{ fontWeight: 600 }}>
                <span>QuickReads ({quickReadItems.length})</span>
                <span>₹{qrTotal}</span>
              </div>
              {quickReadItems.map((b) => (
                <div className="bill-row" key={`qr-${b.id}`}>
                  <span className="bm2-muted" style={{ paddingLeft: 14 }}>
                    {b.name}
                  </span>
                  <span className="bm2-muted">₹{quickReadUnitPrice}</span>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="bm2-total">
          <span>
            <strong>You pay</strong>
            <small>Inclusive of all taxes</small>
          </span>
          <b className={struckTotal ? "bm2-total-new" : undefined}>
            {struckTotal > 0 && <s className="bm2-total-was">₹{struckTotal}</s>}₹{finalTotal}
          </b>
        </div>
        {struckTotal > 0 && (
          <p className="bm2-coupon-save">
            🎉 {bagCoupon.code} saves you ₹{struckTotal - finalTotal} on this order
          </p>
        )}

        {/* What comes with every TheBookX order. */}
        <div className="bm2-perks">
          <span>
            <Gift size={15} /> Free collectible bookmark
          </span>
          <span>
            <Truck size={15} /> Doorstep delivery, tracked
          </span>
          <span>
            <RotateCcw size={15} /> 7-day replacement
          </span>
          <span>
            <ShieldCheck size={15} /> 100% genuine books
          </span>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
