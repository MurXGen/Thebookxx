"use client";

export default function BillModal({
  open,
  onClose,
  totalOriginal,
  totalDiscounted,
  offerLabel,
  offerDiscount,
  extraDeliveryCharge = 0,
  totalWithDelivery = null,
}) {
  if (!open) return null;

  const finalPayable = totalDiscounted - offerDiscount;
  const finalTotal =
    totalWithDelivery !== null
      ? totalWithDelivery
      : finalPayable + extraDeliveryCharge;

  return (
    <div className="bill-modal-overlay" onClick={onClose}>
      <div className="bill-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bill-header">
          <span className="weight-600">Bill Details</span>
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

        {extraDeliveryCharge > 0 && (
          <div className="bill-row">
            <span>Delivery Charges</span>
            <span className="red">+ ₹{extraDeliveryCharge}</span>
          </div>
        )}

        <div className="dashed-border my-12"></div>

        <div className="bill-row total">
          <span>You Pay</span>
          <span>₹{finalTotal}</span>
        </div>

        {extraDeliveryCharge > 0 && (
          <div className="bill-note">
            <span className="font-10 red">
              ⚠️ Extra delivery charge of ₹{extraDeliveryCharge} applied for
              orders below ₹400
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
