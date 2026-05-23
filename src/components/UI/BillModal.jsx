"use client";

import { useEffect, useRef } from "react";
import { useTrackView } from "@/lib/trackingHooks";
import { EVENTS } from "@/lib/trackingEvents";

export default function BillModal({
  open,
  onClose,
  totalOriginal,
  totalDiscounted,
  offerLabel,
  offerDiscount,
  standardDeliveryCharge = 0,
  fasterDeliveryCharge = 0,
  isFasterDelivery = false,
  totalWithDelivery = null,
  giftWrapCharge = 0,
  giftWrapSelected = false,
}) {
  // Track when Bill Modal is viewed
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
    },
    open,
  );

  // Track when modal is closed
  const hasTrackedClose = useRef(false);

  const finalPayable = totalDiscounted - offerDiscount;

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
    }
  }, [open]);

  if (!open) return null;

  // Get the actual delivery charge based on selection
  const getDeliveryCharge = () => {
    if (isFasterDelivery) {
      return fasterDeliveryCharge;
    }
    return standardDeliveryCharge;
  };

  const deliveryCharge = getDeliveryCharge();

  const finalTotal =
    totalWithDelivery !== null
      ? totalWithDelivery
      : finalPayable + deliveryCharge + giftWrapCharge;
  const totalSavings = totalOriginal - finalPayable;

  return (
    <div className="bill-modal-overlay" onClick={onClose}>
      <div className="bill-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bill-header">
          <span className="font-16 weight-600">Bill Details</span>
          <span className="cursor-pointer" onClick={onClose}>
            ✕
          </span>
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

        {/* Delivery / Handling Charges */}
        {deliveryCharge > 0 && (
          <div className="bill-row">
            <span>
              {isFasterDelivery ? (
                <span className="flex items-center gap-4">
                  <span>🚀 Faster Delivery</span>
                  <span className="font-10 orange">(2-5 days)</span>
                </span>
              ) : deliveryCharge === 100 ? (
                <span>📦 Standard Delivery</span>
              ) : (
                <span className="flex items-center gap-4">
                  <span>💛 Handling & Care Fee</span>
                  <span className="font-10 dark-50">
                    (packing, support & secure shipping)
                  </span>
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
            <span>📦 Free Delivery</span>
            <span className="green">FREE</span>
          </div>
        )}

        {/* Gift Wrap Section */}
        {giftWrapSelected && giftWrapCharge > 0 && (
          <div className="bill-row">
            <span>🎁 Gift Wrap</span>
            <span className="orange">+ ₹{giftWrapCharge}</span>
          </div>
        )}

        <div className="dashed-border my-12"></div>

        <div className="bill-row total">
          <span>You Pay</span>
          <span className="weight-700 green font-20">₹{finalTotal}</span>
        </div>
      </div>
    </div>
  );
}
