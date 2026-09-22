"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  Lock,
  CheckCircle2,
  Loader2,
  PackageCheck,
  Banknote,
  Smartphone,
} from "lucide-react";
import {
  fetchOrderById,
  submitConfirmedOrder,
  updateOrderRow,
} from "@/utils/googleFormOrder";
import { getDeliveryCharge } from "@/utils/cartOffers";
import { Plane, BookPlus } from "lucide-react";
import { books as ALL_BOOKS } from "@/utils/book";

const MERCHANT_PASSWORD = "987321";
const ADDON_DISCOUNT = 0.2; // flat 20% off books added before packing
// Matches the checkout flow: flat COD handling fee (see bag/page.js).
const COD_HANDLING_FEE = 29;

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
  // For WhatsApp orders the merchant picks the final payment method here.
  const [payMethod, setPayMethod] = useState("COD"); // "COD" | "UPI"
  const [linkCopied, setLinkCopied] = useState(false);

  // Shareable link for the customer to pay online (auto-opens the pay flow).
  const copyPayLink = async () => {
    const digits = String(order?.["Phone Number"] || "")
      .replace(/\D/g, "")
      .slice(-10);
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://www.thebookx.in";
    const link = `${origin}/profile/${digits}/orders/${encodeURIComponent(
      orderId,
    )}?pay=online`;
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {}
  };

  useEffect(() => {
    (async () => {
      const row = await fetchOrderById(orderId);
      setOrder(row);
      setLoading(false);
    })();
  }, [orderId]);

  const alreadyConfirmed =
    order && !/unconfirmed/i.test(String(order["Order Status"] || ""));

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
  const giftYes = order && String(order["Gift Wrap"] || "").toLowerCase() === "yes";
  const giftCharge = giftYes ? num(order["Gift Wrap Charge"]) : 0;

  // A WhatsApp order has no final payment/charges yet — the merchant sets them.
  const isWhatsAppOrder =
    order && /whats\s*app/i.test(String(order["Payment Type"] || ""));
  const isFaster =
    order && /faster|express/i.test(String(order["Delivery Type"] || ""));
  const hasOneRupee = items.some(
    (b) => num(b.price) === 1 || num(b.total) === 1,
  );

  // When converting a WhatsApp order, recompute charges exactly like checkout.
  const convDelivery = getDeliveryCharge(subtotal, isFaster, hasOneRupee);
  const convCodFee = payMethod === "COD" ? COD_HANDLING_FEE : 0;
  const convTotal = Math.max(
    0,
    subtotal + convDelivery + giftCharge + convCodFee - walletUsed,
  );

  // Effective bill: recomputed for WhatsApp conversions, else the sheet values.
  const deliveryCharge = isWhatsAppOrder
    ? convDelivery
    : order
      ? num(order["Delivery Charge"])
      : 0;
  const codFee = isWhatsAppOrder ? convCodFee : 0;
  const totalAmount = isWhatsAppOrder
    ? convTotal
    : order
      ? num(order["Total Amount"])
      : 0;
  const isCOD = isWhatsAppOrder
    ? payMethod === "COD"
    : order && /cash|cod/i.test(String(order["Payment Type"] || ""));

  // Faster-delivery upgrade approval (customer paid the surplus, merchant
  // approves via the ?upgrade=faster link shared on WhatsApp).
  const upgradeReq = search.get("upgrade") === "faster";
  const approveUpgrade = async () => {
    if (pwd !== MERCHANT_PASSWORD) {
      setErr("Incorrect merchant password.");
      return;
    }
    setErr("");
    setSubmitting(true);
    const standard = getDeliveryCharge(subtotal, false, hasOneRupee);
    const faster = getDeliveryCharge(subtotal, true, hasOneRupee);
    const diff = Math.max(0, faster - standard);
    const newTotal = num(order["Total Amount"]) + diff;
    try {
      await updateOrderRow(orderId, {
        "Delivery Type": "Faster Delivery",
        "Delivery Charge": String(faster),
        "Total Amount": String(newTotal),
      });
      setDone(true);
    } catch (e) {
      setErr("Could not approve the upgrade. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Add-books-before-packing approval (?addbooks=<base64 [{id,q}]>) ──
  const addBooksReq = !!search.get("addbooks");
  const addBooks = (() => {
    const raw = search.get("addbooks");
    if (!raw) return [];
    let list = [];
    try {
      list = JSON.parse(atob(decodeURIComponent(raw)));
    } catch {
      return [];
    }
    if (!Array.isArray(list)) return [];
    return list
      .map((it) => {
        const b = ALL_BOOKS.find((x) => x.id === it.id);
        if (!b) return null;
        const qty = Math.max(1, Number(it.q) || 1);
        const unit = Math.max(
          1,
          Math.round((b.discountedPrice ?? 0) * (1 - ADDON_DISCOUNT)),
        );
        return { name: b.name, qty, unit, total: unit * qty };
      })
      .filter(Boolean);
  })();
  const addBooksAmount = addBooks.reduce((s, b) => s + b.total, 0);
  const approveAddBooks = async () => {
    if (pwd !== MERCHANT_PASSWORD) {
      setErr("Incorrect merchant password.");
      return;
    }
    if (!addBooks.length) {
      setErr("No valid books to add from this link.");
      return;
    }
    setErr("");
    setSubmitting(true);
    try {
      // Append the new (20%-off) lines to the existing Books List.
      const existing = String(order["Books List"] || "").trim();
      const startIdx = existing ? existing.split("\n").filter(Boolean).length : 0;
      const newLines = addBooks
        .map(
          (b, i) =>
            `${startIdx + i + 1}. ${b.name} | Qty: ${b.qty} | ₹${b.unit} each | Total: ₹${b.total}`,
        )
        .join("\n");
      const booksList = existing ? `${existing}\n${newLines}` : newLines;

      const curTotal = num(order["Total Amount"]);
      const orderIsCOD = /cash|cod/i.test(String(order["Payment Type"] || ""));
      const fields = { "Books List": booksList };
      if (orderIsCOD) {
        // COD (incl. ₹99-advance COD): add the extra to the amount collected.
        fields["Total Amount"] = String(curTotal + addBooksAmount);
      } else {
        // Online-paid order: collect the extra as COD (convert the order).
        fields["Payment Type"] = "Cash on Delivery";
        fields["Advance Paid"] = "No";
        fields["Total Amount"] = String(addBooksAmount);
      }
      // Confirm the order if it was still unconfirmed.
      if (/unconfirmed/i.test(String(order["Order Status"] || ""))) {
        fields["Order Status"] = "Processing";
      }
      await updateOrderRow(orderId, fields);
      setDone(true);
    } catch (e) {
      setErr("Could not add the books. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    if (pwd !== MERCHANT_PASSWORD) {
      setErr("Incorrect merchant password.");
      return;
    }
    setErr("");
    setSubmitting(true);
    // For a WhatsApp order, override the payment type + recomputed charges so
    // the confirmed row bills exactly like a normal COD / Online checkout.
    const overrides = isWhatsAppOrder
      ? {
          paymentType: payMethod === "COD" ? "Cash on Delivery" : "UPI Payment",
          deliveryType: order["Delivery Type"] || (isFaster ? "Faster" : "Standard"),
          deliveryCharge: convDelivery,
          totalAmount: convTotal,
          offerApplied:
            payMethod === "COD"
              ? `Confirmed as COD${convCodFee > 0 ? ` (fee ₹${convCodFee})` : ""}`
              : "Confirmed as Online",
        }
      : {};
    const res = await submitConfirmedOrder(order, { walletUsed, overrides });
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
            <h1>
              {upgradeReq
                ? "Upgrade approved"
                : addBooksReq
                  ? "Books added"
                  : "Order confirmed"}
            </h1>
            <p>
              {upgradeReq
                ? "The order is now marked as Faster (air) delivery."
                : addBooksReq
                  ? `${addBooks.length} book(s) added at 20% off. ₹${addBooksAmount} will be collected as cash on delivery.`
                  : `The order has been confirmed${
                      walletUsed > 0
                        ? ` and ₹${walletUsed} was debited from the customer's wallet.`
                        : "."
                    }`}
            </p>
            <span className="mc-oid">Order {orderId}</span>
          </div>
        ) : upgradeReq ? (
          <>
            <div className="mc-head">
              <Plane size={22} />
              <span>Approve Faster upgrade</span>
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
                label="Current delivery"
                value={order["Delivery Type"] || "Standard"}
              />
              <Row
                label="Surplus to apply"
                value={`+₹${Math.max(
                  0,
                  getDeliveryCharge(subtotal, true, hasOneRupee) -
                    getDeliveryCharge(subtotal, false, hasOneRupee),
                )}`}
                highlight
              />
            </div>
            <div className="mc-note">
              Approve only after confirming the customer paid the surplus. This
              sets the order to <b>Faster Delivery</b> and adds the difference to
              the total.
            </div>
            <label className="mc-label">
              <Lock size={14} /> Merchant password
            </label>
            <input
              type="password"
              className="sec-mid-btn mc-input"
              placeholder="Enter merchant password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && approveUpgrade()}
              inputMode="numeric"
              autoComplete="off"
            />
            {err && <span className="mc-err">{err}</span>}
            <button
              type="button"
              className="pri-big-btn width100 mc-btn"
              onClick={approveUpgrade}
              disabled={submitting || !pwd}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="lb-spinner" /> Approving…
                </>
              ) : (
                "Approve Faster upgrade"
              )}
            </button>
          </>
        ) : addBooksReq ? (
          <>
            <div className="mc-head">
              <BookPlus size={22} />
              <span>Add books to order</span>
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
                label="Current payment"
                value={order["Payment Type"] || "—"}
              />
              {addBooks.map((b, i) => (
                <Row
                  key={i}
                  label={`+ ${b.name}${b.qty > 1 ? ` ×${b.qty}` : ""}`}
                  value={`₹${b.total} (20% off)`}
                />
              ))}
              <Row
                label="Extra to collect (COD)"
                value={`+₹${addBooksAmount}`}
                highlight
              />
            </div>
            <div className="mc-note">
              Adds these books to the parcel at 20% off. For a prepaid order this
              extra is collected as <b>cash on delivery</b>; for COD it is added
              to the amount to collect.
            </div>
            <label className="mc-label">
              <Lock size={14} /> Merchant password
            </label>
            <input
              type="password"
              className="sec-mid-btn mc-input"
              placeholder="Enter merchant password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && approveAddBooks()}
              inputMode="numeric"
              autoComplete="off"
            />
            {err && <span className="mc-err">{err}</span>}
            <button
              type="button"
              className="pri-big-btn width100 mc-btn"
              onClick={approveAddBooks}
              disabled={submitting || !pwd}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="lb-spinner" /> Adding…
                </>
              ) : (
                `Add ${addBooks.length} book(s) · +₹${addBooksAmount}`
              )}
            </button>
          </>
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
              <Row
                label="Payment"
                value={
                  isWhatsAppOrder
                    ? payMethod === "COD"
                      ? "Cash on Delivery (converting)"
                      : "Online / UPI (converting)"
                    : order["Payment Type"] || "—"
                }
              />
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
              {codFee > 0 && (
                <div className="mc-bill-row">
                  <span>COD handling fee</span>
                  <span>₹{codFee}</span>
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

            {isWhatsAppOrder && (
              <div className="mc-block mc-paychoice">
                <div className="mc-block-title">
                  Set payment method (customer&apos;s choice)
                </div>
                <div className="mc-pay-toggle">
                  <button
                    type="button"
                    className={`mc-pay-opt${payMethod === "COD" ? " on" : ""}`}
                    onClick={() => setPayMethod("COD")}
                  >
                    <Banknote size={16} /> Cash on Delivery
                  </button>
                  <button
                    type="button"
                    className={`mc-pay-opt${payMethod === "UPI" ? " on" : ""}`}
                    onClick={() => setPayMethod("UPI")}
                  >
                    <Smartphone size={16} /> Online / UPI
                  </button>
                </div>
                <p className="mc-pay-hint">
                  {payMethod === "COD"
                    ? `COD handling fee ₹${convCodFee} is added — collect ₹${convTotal} on delivery.`
                    : `No COD fee — customer pays ₹${convTotal} online.`}
                </p>
                {payMethod === "UPI" && (
                  <button
                    type="button"
                    className="mc-paylink-btn"
                    onClick={copyPayLink}
                  >
                    {linkCopied
                      ? "✓ Payment link copied — share on WhatsApp"
                      : "Copy customer payment link"}
                  </button>
                )}
              </div>
            )}

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
