"use client";

export default function BillModal({
  open,
  onClose,
  totalOriginal,
  totalDiscounted,
  offerLabel,
  offerDiscount,
}) {
  if (!open) return null;

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

        <div className="bill-row total">
          <span>You Pay</span>
          <span>₹{totalDiscounted - offerDiscount}</span>
        </div>
      </div>
    </div>
  );
}
