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

  const getDeliveryCharge = () => {
    if (isFasterDelivery) return fasterDeliveryCharge;
    return standardDeliveryCharge;
  };

  const deliveryCharge = getDeliveryCharge();

  // When hiding delivery, the displayed total excludes it.
  // Final total still includes gift wrap (that's already a confirmed selection).
  const finalTotal = hideDeliveryCharges
    ? finalPayable + giftWrapCharge
    : totalWithDelivery !== null
      ? totalWithDelivery
      : finalPayable + deliveryCharge + giftWrapCharge;

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
                      <span>🚀 Faster Delivery</span>
                      <span className="font-10 orange">(2-5 days)</span>
                    </span>
                  ) : deliveryCharge === 100 ? (
                    <div className="flex flex-col">
                      <span> Standard Delivery</span>
                      <span className="dark-50 font-10">
                        Books more than ₹399 : Free Delivery
                      </span>
                    </div>
                  ) : (
                    <span className="flex flex-col gap-4">
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
          </>
        )}

        {/* Subtle hint when delivery is intentionally hidden */}
        {hideDeliveryCharges && (
          <div className="bill-row" style={{ opacity: 0.7 }}>
            <span className="font-10 dark-50">
              📦 Shipping will be calculated at checkout
            </span>
          </div>
        )}

        {/* Gift Wrap */}
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
