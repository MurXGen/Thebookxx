"use client";

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
}) {
  if (!open) return null;

  const finalPayable = totalDiscounted - offerDiscount;

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
      : finalPayable + deliveryCharge;
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

        {/* Delivery Charges Section */}
        {deliveryCharge > 0 && (
          <div className="bill-row">
            <span>
              {isFasterDelivery ? (
                <span className="flex items-center gap-4">
                  <span>🚀 Faster Delivery</span>
                  <span className="font-10 orange">(2-5 days)</span>
                </span>
              ) : (
                <span>📦 Standard Delivery</span>
              )}
            </span>
            <span className={isFasterDelivery ? "orange" : "red"}>
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

        <div className="dashed-border my-12"></div>

        <div className="bill-row total">
          <span>You Pay</span>
          <span className="weight-700 green font-20">₹{finalTotal}</span>
        </div>

        {/* Savings Summary */}
        {/* {totalSavings > 0 && (
          <div className="bill-note savings-note">
            <span className="font-10 green">
              ✨ You saved ₹{totalSavings} on this order!
            </span>
          </div>
        )} */}

        {/* Delivery Notes */}
        {/* {isFasterDelivery && (
          <div className="bill-note delivery-note">
            <span className="font-10 orange">
              🚀 Faster delivery: Your order will arrive in 2-5 business days
            </span>
          </div>
        )} */}

        {/* {!isFasterDelivery &&
          standardDeliveryCharge === 0 &&
          totalDiscounted < 400 && (
            <div className="bill-note">
              <span className="font-10 red">
                ⚠️ Add ₹{400 - totalDiscounted} more to get free delivery
              </span>
            </div>
          )} */}
      </div>
    </div>
  );
}
