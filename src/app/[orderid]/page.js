"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Lock, CheckCircle2, Loader2, PackageCheck } from "lucide-react";
import { fetchOrderById, submitConfirmedOrder } from "@/utils/googleFormOrder";

const MERCHANT_PASSWORD = "987321";

export default function MerchantConfirmPage() {
  const params = useParams();
  const search = useSearchParams();
  const orderId = decodeURIComponent(params?.orderid || "");
  const walletUsed = Math.max(0, parseInt(search.get("w") || "0", 10) || 0);

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const row = await fetchOrderById(orderId);
      setOrder(row);
      setLoading(false);
    })();
  }, [orderId]);

  const alreadyConfirmed =
    order && !/unconfirmed/i.test(String(order["Customer Name"] || ""));

  // Parse the "Books List" cell into line items.
  const parseBooks = (str) =>
    String(str || "")
      .split("\n")
      .map((line) => {
        const name = (line.split("|")[0] || "").replace(/^\d+\.\s*/, "").trim();
        const qty = (line.match(/Qty:\s*(\d+)/i) || [])[1] || "";
        const total = (line.match(/Total:\s*₹?\s*(\d+)/i) || [])[1] || "";
        const price = (line.match(/₹\s*(\d+)\s*each/i) || [])[1] || "";
        return { name, qty, total, price };
      })
      .filter((b) => b.name);

  const num = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };
  const items = order ? parseBooks(order["Books List"]) : [];
  const subtotal = items.reduce((s, b) => s + num(b.total), 0);
  const deliveryCharge = order ? num(order["Delivery Charge"]) : 0;
  const giftYes = order && String(order["Gift Wrap"] || "").toLowerCase() === "yes";
  const giftCharge = giftYes ? num(order["Gift Wrap Charge"]) : 0;
  const totalAmount = order ? num(order["Total Amount"]) : 0;
  const isCOD = order && /cash|cod/i.test(String(order["Payment Type"] || ""));

  const handleConfirm = async () => {
    if (pwd !== MERCHANT_PASSWORD) {
      setErr("Incorrect merchant password.");
      return;
    }
    setErr("");
    setSubmitting(true);
    const res = await submitConfirmedOrder(order, { walletUsed });
    setSubmitting(false);
    if (res.success) setDone(true);
    else setErr("Could not confirm the order. Please try again.");
  };

  return (
    <main className="mc-page">
      <div className="mc-card">
        {loading ? (
          <div className="mc-loading">
            <Loader2 size={28} className="lb-spinner" />
            <span>Loading order…</span>
          </div>
        ) : !order ? (
          <div className="mc-empty">
            <p>No order found for this link.</p>
            <span className="mc-oid">{orderId || "—"}</span>
          </div>
        ) : done ? (
          <div className="mc-success">
            <div className="mc-success-ic">
              <CheckCircle2 size={40} />
            </div>
            <h1>Order confirmed</h1>
            <p>
              The order has been confirmed
              {walletUsed > 0 ? ` and ₹${walletUsed} was debited from the customer's wallet.` : "."}
            </p>
            <span className="mc-oid">Order {orderId}</span>
          </div>
        ) : (
          <>
            <div className="mc-head">
              <PackageCheck size={22} />
              <span>Confirm order</span>
            </div>

            <div className="mc-summary">
              <Row label="Order ID" value={orderId} />
              <Row
                label="Customer"
                value={String(order["Customer Name"] || "").replace(
                  /\s*\(unconfirmed\)\s*/i,
                  "",
                )}
              />
              <Row label="Phone" value={order["Phone Number"]} />
              <Row
                label="Address"
                value={`${order["Address"] || ""}, ${order["City"] || ""}${
                  order["State"] ? ", " + order["State"] : ""
                } - ${order["Pincode"] || ""}`}
              />
              <Row label="Payment" value={order["Payment Type"] || "—"} />
              <Row label="Delivery" value={order["Delivery Type"] || "—"} />
              <Row label="Placed on" value={order["Timestamp (D)"] || order["Timestamp"] || "—"} />
            </div>

            {/* Order items */}
            {items.length > 0 && (
              <div className="mc-block">
                <div className="mc-block-title">Items ({items.length})</div>
                {items.map((b, i) => (
                  <div key={i} className="mc-item">
                    <span className="mc-item-name">
                      {i + 1}. {b.name}
                    </span>
                    <span className="mc-item-qty">×{b.qty || 1}</span>
                    <span className="mc-item-amt">₹{b.total || b.price || 0}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Bill */}
            <div className="mc-block">
              <div className="mc-block-title">Bill details</div>
              {subtotal > 0 && (
                <div className="mc-bill-row">
                  <span>Items subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
              )}
              <div className="mc-bill-row">
                <span>Delivery</span>
                <span>{deliveryCharge > 0 ? `₹${deliveryCharge}` : "FREE"}</span>
              </div>
              {giftCharge > 0 && (
                <div className="mc-bill-row">
                  <span>Gift wrap</span>
                  <span>₹{giftCharge}</span>
                </div>
              )}
              {walletUsed > 0 && (
                <div className="mc-bill-row">
                  <span>Wallet {isCOD ? "to debit" : "used"}</span>
                  <span className="mc-neg">−₹{walletUsed}</span>
                </div>
              )}
              <div className="mc-bill-row mc-bill-total">
                <span>{isCOD ? "To collect on delivery" : "Amount paid"}</span>
                <span>₹{totalAmount || "—"}</span>
              </div>
            </div>

            {alreadyConfirmed && (
              <div className="mc-note">
                This order looks already confirmed. Confirming again will add a
                new confirmed row{walletUsed > 0 ? " and debit the wallet again" : ""}.
              </div>
            )}

            <label className="mc-label">
              <Lock size={14} /> Merchant password
            </label>
            <input
              type="password"
              className="sec-mid-btn mc-input"
              placeholder="Enter merchant password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              inputMode="numeric"
              autoComplete="off"
            />
            {err && <span className="mc-err">{err}</span>}

            <button
              type="button"
              className="pri-big-btn width100 mc-btn"
              onClick={handleConfirm}
              disabled={submitting || !pwd}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="lb-spinner" /> Confirming…
                </>
              ) : (
                "Confirm order"
              )}
            </button>
          </>
        )}
      </div>
    </main>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="mc-row">
      <span className="mc-row-l">{label}</span>
      <span className={`mc-row-v${highlight ? " hl" : ""}`}>{value || "—"}</span>
    </div>
  );
}
