"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
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
}) {
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
  // Handling & Care explainer tooltip.
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
  const finalTotal =
    (hideDeliveryCharges
      ? finalPayable + gwCharge
      : totalWithDelivery !== null
        ? totalWithDelivery
        : finalPayable + deliveryCharge + gwCharge) + qrTotal;

  return createPortal(
    <div
      className="bill-modal-overlay"
      style={{ zIndex: 2147483002 }}
      onClick={onClose}
    >
      <motion.div
        className="bill-modal"
        onClick={(e) => e.stopPropagation()}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(e, info) => {
          if (info.offset.y > 120 || info.velocity.y > 700) onClose();
        }}
      >
        <div className="bill-header">
          <span className="font-16 weight-600">Bill Details</span>
          <span className="cursor-pointer" onClick={onClose}></span>
        </div>

        <div className="bill-row">
          <span>Total MRP</span>
          <span>₹{totalOriginal}</span>
        </div>

        <div className="bill-row">
          <span>Item Discount</span>
          <span className="green">− ₹{totalOriginal - totalDiscounted}</span>
        </div>

        {offerDiscount > 0 && (
          <div className="bill-row">
            <span>{offerLabel}</span>
            <span className="green">− ₹{offerDiscount}</span>
          </div>
        )}

        {walletApplied > 0 && (
          <div className="bill-row">
            <span>Wallet balance</span>
            <span className="green">− ₹{walletApplied}</span>
          </div>
        )}

        {/* Delivery rows, hidden until user accepts shipping */}
        {!hideDeliveryCharges && (
          <>
            {deliveryCharge > 0 && (
              <div className="bill-row">
                <span>
                  {isFasterDelivery ? (
                    <span className="flex items-center gap-4">
                      <span> Faster Delivery</span>
                      <span className="font-10 orange">(2-5 days)</span>
                    </span>
                  ) : deliveryCharge === 100 ? (
                    <div className="flex flex-col">
                      <span> Standard Delivery</span>
                      <span className="dark-50 font-10">
                        Books more than ₹399: Free Delivery
                      </span>
                    </div>
                  ) : (
                    <span className="flex flex-col gap-4">
                      <span className="bill-handling-head">
                        Handling &amp; Care
                        <button
                          type="button"
                          className="bill-info-btn"
                          aria-label="What is Handling & Care?"
                          onClick={() => {
                            setShowHandlingInfo((v) => !v);
                            trackCartEvent("handlinginfo");
                          }}
                        >
                          <Info size={13} />
                        </button>
                      </span>
                      <span className="font-10 dark-50">
                        packing, support &amp; secure shipping
                      </span>
                      {showHandlingInfo && (
                        <span className="bill-info-tip">
                          A small charge that covers protective packing, careful
                          handling and secure doorstep delivery of your books —
                          so they reach you in perfect condition. It also helps
                          us keep our support team available for you.
                        </span>
                      )}
                    </span>
                  )}
                </span>

                <span
                  className={
                    isFasterDelivery
                      ? "orange"
                      : deliveryCharge === 100
                        ? "red"
                        : "dark-50"
                  }
                >
                  + ₹{deliveryCharge}
                </span>
              </div>
            )}

            {deliveryCharge === 0 && !isFasterDelivery && (
              <div className="bill-row">
                <span> Free Delivery</span>
                <span className="green">FREE</span>
              </div>
            )}
          </>
        )}

        {/* Subtle hint when delivery is intentionally hidden */}
        {hideDeliveryCharges && (
          <div className="bill-row" style={{ opacity: 0.7 }}>
            <span className="font-10 dark-50">
              Shipping will be calculated at checkout
            </span>
          </div>
        )}

        {/* Gift Wrap */}
        {giftWrapSelected && giftWrapCharge > 0 && (
          <div className="bill-row">
            <span> Gift Wrap</span>
            <span className="orange">+ ₹{giftWrapCharge}</span>
          </div>
        )}

        {/* QuickReads bundled onto the same bill */}
        {quickReadItems.length > 0 && (
          <>
            <div className="dashed-border my-12"></div>
            <div className="bill-row" style={{ fontWeight: 600 }}>
              <span className="flex items-center gap-4">
                QuickReads ({quickReadItems.length})
              </span>
              <span>₹{qrTotal}</span>
            </div>
            {quickReadItems.map((b) => (
              <div className="bill-row" key={`qr-${b.id}`}>
                <span className="font-12 dark-50" style={{ paddingLeft: 14 }}>
                  {b.name}
                </span>
                <span className="font-12 dark-50">₹{quickReadUnitPrice}</span>
              </div>
            ))}
          </>
        )}

        <div className="dashed-border my-12"></div>

        <div className="bill-row total">
          <span>You Pay</span>
          <span className="weight-700 green font-20">₹{finalTotal}</span>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
