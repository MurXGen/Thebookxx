import Link from "next/link";
import { Truck, Zap, Wallet, MapPin, PackageCheck, Clock } from "lucide-react";
import {
  POLICY_EFFECTIVE_DATE,
  SUPPORT,
  DELIVERY,
  COD,
  RETURNS,
  mailto,
} from "@/lib/policy";
import { LegalGlance, LegalToc, legalLinks } from "@/components/legal/LegalBits";

export const metadata = {
  title: "Shipping & Delivery Policy",
  description: `Free delivery on orders from ₹${DELIVERY.freeMin} up to ₹1,000. Standard delivery in ${DELIVERY.standardDays}, Faster in ${DELIVERY.fasterDays}, Cash on Delivery across India.`,
  alternates: { canonical: "https://www.thebookx.in/shipping" },
};

const GLANCE = [
  {
    icon: Truck,
    title: `Free delivery from ₹${DELIVERY.freeMin}`,
    text: `Standard delivery is free on orders of ₹${DELIVERY.freeMin}–₹1,000 (₹${DELIVERY.oneRupeeFreeMin} if your cart has a ₹1 book).`,
  },
  {
    icon: Clock,
    title: `Standard: ${DELIVERY.standardDays}`,
    text: `Packed in ${DELIVERY.processingDays}, then ${DELIVERY.standardDays} with the courier.`,
  },
  {
    icon: Zap,
    title: `Faster: ${DELIVERY.fasterDays}`,
    text: `Priority dispatch for ₹${DELIVERY.fasterPriority[0].fee}–₹${DELIVERY.fasterPriority[DELIVERY.fasterPriority.length - 1].fee} extra on eligible pincodes.`,
  },
  {
    icon: Wallet,
    title: "Cash on Delivery",
    text: `Pay at your door. Small COD fee, or pay ₹${COD.advance} online and skip the fee.`,
  },
  {
    icon: MapPin,
    title: "All of India",
    text: "Delhivery and India Post reach almost every pincode. Check yours at checkout.",
  },
  {
    icon: PackageCheck,
    title: "Tracked & protected",
    text: "Every parcel is wrapped securely and gets a tracking ID on WhatsApp.",
  },
];

const SECTIONS = [
  { id: "serviceability", label: "1. Where we deliver" },
  { id: "timelines", label: "2. Delivery times" },
  { id: "charges", label: "3. Delivery charges" },
  { id: "cod-shipping", label: "4. Cash on Delivery" },
  { id: "tracking", label: "5. Tracking" },
  { id: "address-policy", label: "6. Address & delivery attempts" },
  { id: "packaging", label: "7. Packaging & checking your parcel" },
  { id: "delays", label: "8. Delays" },
  { id: "problems", label: "9. Lost, damaged or undelivered parcels" },
  { id: "changes-shipping", label: "10. Changes to this policy" },
];

const careFee = `${DELIVERY.careFeePct}% of the order value`;

export default function ShippingDeliveryPolicy() {
  return (
    <main className="legal-page">
      <div className="legal-header">
        <h1>Shipping &amp; Delivery Policy</h1>
        <div className="legal-header-meta">
          <span className="last-updated">
            Last updated: {POLICY_EFFECTIVE_DATE}
          </span>
          <p className="legal-intro">
            How we pack, ship and deliver your books, what it costs and how long
            it takes. Every charge below is the same one you see in your bill at
            checkout, before you pay. Read it with our {legalLinks}.
          </p>
        </div>
      </div>

      <LegalGlance items={GLANCE} />
      <LegalToc sections={SECTIONS} />

      <section id="serviceability">
        <h2>1. Where we deliver</h2>
        <p>
          We deliver across India through Delhivery, India Post (Speed Post) and
          regional courier partners, picked for your pincode. Checkout tells you
          whether your pincode is serviceable and which delivery options and
          payment methods are available. If we find out after you order that we
          can&apos;t reach your pincode, we cancel and refund you in full.
        </p>
        <p>
          We don&apos;t ship outside India yet. For bulk or institutional orders,
          email <a href={mailto}>{SUPPORT.email}</a>.
        </p>
      </section>

      <section id="timelines">
        <h2>2. Delivery times</h2>
        <table className="legal-table">
          <thead>
            <tr>
              <th>Option</th>
              <th>Packing</th>
              <th>With the courier</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Standard (incl. Cash on Delivery)</td>
              <td>{DELIVERY.processingDays}</td>
              <td>{DELIVERY.standardDays}</td>
            </tr>
            <tr>
              <td>Faster</td>
              <td>Priority, usually same or next business day</td>
              <td>{DELIVERY.fasterDays}</td>
            </tr>
          </tbody>
        </table>
        <p>
          Business days are Monday to Saturday, excluding Maharashtra public
          holidays. Orders placed after 5:00 PM IST, on Sundays or on holidays
          are packed from the next business day. Courier times depend on your
          location. Metro cities are usually quicker and remote areas can take
          a little longer.
        </p>
      </section>

      <section id="charges">
        <h2>3. Delivery charges</h2>
        <h3>3.1 Standard delivery</h3>
        <table className="legal-table">
          <thead>
            <tr>
              <th>Order value (after discounts)</th>
              <th>Regular cart</th>
              <th>Cart with a ₹1 book</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Below ₹{DELIVERY.freeMin}</td>
              <td>₹{DELIVERY.belowFreeFee}</td>
              <td>₹{DELIVERY.oneRupeeBelowFee}</td>
            </tr>
            <tr>
              <td>
                ₹{DELIVERY.freeMin}–₹{DELIVERY.oneRupeeFreeMin - 1}
              </td>
              <td>
                <strong>Free</strong>
              </td>
              <td>₹{DELIVERY.oneRupeeBelowFee}</td>
            </tr>
            <tr>
              <td>₹{DELIVERY.oneRupeeFreeMin}–₹1,000</td>
              <td>
                <strong>Free</strong>
              </td>
              <td>
                <strong>Free</strong>
              </td>
            </tr>
            <tr>
              <td>Above ₹1,000</td>
              <td>Handling &amp; Care fee: {careFee}</td>
              <td>
                Handling &amp; Care fee: {careFee}, max ₹
                {DELIVERY.careFeeCapOneRupee}
              </td>
            </tr>
          </tbody>
        </table>
        <p>
          The Handling &amp; Care fee on large orders covers the extra packing,
          weight and insurance of heavy multi-book parcels. It&apos;s shown as a
          separate line in your bill before you pay.
        </p>

        <h3>3.2 Faster delivery</h3>
        <p>Faster delivery costs the standard charge above plus a priority fee:</p>
        <table className="legal-table">
          <thead>
            <tr>
              <th>Order value</th>
              <th>Priority fee</th>
            </tr>
          </thead>
          <tbody>
            {DELIVERY.fasterPriority.map((r) => (
              <tr key={r.label}>
                <td>{r.label}</td>
                <td>₹{r.fee}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>3.3 Optional extras</h3>
        <p>
          Gift wrap and other add-ons are optional and priced at checkout. All
          prices include applicable taxes. The charges that apply to your order
          are the ones in your bill when you place it.
        </p>
      </section>

      <section id="cod-shipping">
        <h2>4. Cash on Delivery (COD)</h2>
        <p>
          COD is available with standard delivery on most pincodes. You can pick
          either option at checkout:
        </p>
        <table className="legal-table">
          <thead>
            <tr>
              <th>Option</th>
              <th>Pay now</th>
              <th>Pay at the door</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Regular COD</td>
              <td>Nothing</td>
              <td>
                Order total + COD fee (₹{COD.feeMin} or {COD.feePct}% of the
                bill, whichever is higher)
              </td>
            </tr>
            <tr>
              <td>COD with ₹{COD.advance} advance</td>
              <td>₹{COD.advance} via UPI</td>
              <td>The balance. No COD fee.</td>
            </tr>
          </tbody>
        </table>
        <p>
          TheBookX Exclusive members pay no COD fee. We may call or WhatsApp you
          to confirm a COD order before dispatch, so please keep your phone
          handy. If a COD parcel is refused without a valid reason, the ₹
          {COD.advance} advance isn&apos;t refunded, because it covers the
          shipping already spent (see the{" "}
          <Link href="/refund#undelivered">Refund Policy</Link>).
        </p>
      </section>

      <section id="tracking">
        <h2>5. Tracking</h2>
        <p>
          When your order ships we send the tracking ID (AWB) on WhatsApp. Track
          it from <Link href="/profile">My Orders</Link>, on the courier&apos;s
          website, or just message us. If tracking hasn&apos;t moved for 48
          hours, tell us and we&apos;ll chase the courier.
        </p>
      </section>

      <section id="address-policy">
        <h2>6. Address &amp; delivery attempts</h2>
        <p>
          Please give a complete address (house/flat number, building, area,
          landmark, pincode) and a mobile number that&apos;s reachable during the
          day. Need to change the address? Message us before dispatch. After
          dispatch, changes depend on the courier.
        </p>
        <p>
          Couriers usually make 2–3 delivery attempts and may ask for an OTP. If
          every attempt fails and the parcel comes back to us, our{" "}
          <Link href="/refund#undelivered">Refund Policy, Section 8</Link> explains
          what you get back.
        </p>
      </section>

      <section id="packaging">
        <h2>7. Packaging &amp; checking your parcel</h2>
        <p>
          Every order is wrapped in protective packaging. When it arrives:
        </p>
        <ul>
          <li>
            If the outer packaging is clearly damaged or opened, you can refuse
            it and message us. We&apos;ll send a fresh shipment or a full refund.
          </li>
          <li>
            Check your books when you open them. Report damage, defects or a
            wrong book within {RETURNS.reportWindowDays} days, and a missing
            book within {RETURNS.missingItemHours} hours.
          </li>
          <li>
            A quick unboxing video is the fastest way to settle a missing-book
            claim. It&apos;s recommended, not required.
          </li>
        </ul>
      </section>

      <section id="delays">
        <h2>8. Delays</h2>
        <p>
          Delivery times are estimates. Weather, festive-season volumes,
          strikes, local restrictions or courier issues can sometimes slow
          things down. If your order is running late we&apos;ll keep you
          updated on WhatsApp and push the courier. If it&apos;s badly delayed
          and hasn&apos;t been delivered yet, you can ask us about cancelling.
        </p>
      </section>

      <section id="problems">
        <h2>9. Lost, damaged or undelivered parcels</h2>
        <ul>
          <li>
            <strong>Lost in transit:</strong> free replacement or full refund,
            your choice.
          </li>
          <li>
            <strong>Damaged, defective or wrong book:</strong> replacement or a
            refund based on the actual issue.
          </li>
          <li>
            <strong>Returned undelivered:</strong> refund minus the actual
            shipping cost.
          </li>
        </ul>
        <p>
          Full details, including where refunds are credited, are in our{" "}
          <Link href="/refund">Refund &amp; Cancellation Policy</Link>.
        </p>
      </section>

      <section id="changes-shipping">
        <h2>10. Changes to this policy</h2>
        <p>
          Charges and timelines may change, and we&apos;ll update the
          &ldquo;Last updated&rdquo; date when they do. Your order is always
          charged as shown in your bill at the time you placed it.
        </p>
      </section>
    </main>
  );
}
