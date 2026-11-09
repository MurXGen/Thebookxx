import {
  XCircle,
  PackageX,
  Camera,
  Scale,
  Wallet,
  Landmark,
} from "lucide-react";
import {
  POLICY_EFFECTIVE_DATE,
  SUPPORT,
  RETURNS,
  COD,
  WALLET,
  CONDITION_BANDS,
  mailto,
} from "@/lib/policy";
import {
  LegalGlance,
  LegalToc,
  GrievanceCard,
  legalLinks,
} from "@/components/legal/LegalBits";

export const metadata = {
  title: "Refund & Cancellation Policy",
  description: `Free cancellation before dispatch. Damaged, defective or wrong book? Report it within ${RETURNS.reportWindowDays} days and we replace it or refund you based on the actual issue.`,
  alternates: { canonical: "https://www.thebookx.in/refund" },
};

const GLANCE = [
  {
    icon: XCircle,
    title: "Free cancellation before dispatch",
    text: "Changed your mind? Cancel free of charge until your order is handed to the courier.",
  },
  {
    icon: PackageX,
    title: `Damaged or wrong book? ${RETURNS.reportWindowDays} days`,
    text: `Report a damaged, defective or wrong book within ${RETURNS.reportWindowDays} days of delivery (missing book: ${RETURNS.missingItemHours} hours).`,
  },
  {
    icon: Camera,
    title: "Just send photos",
    text: "A few clear photos of the book and packaging are usually all we need. No forms.",
  },
  {
    icon: Scale,
    title: "Refund matches the issue",
    text: "Wrong or badly damaged copy: full value or a replacement. Smaller issues: a fair partial refund.",
  },
  {
    icon: Wallet,
    title: "Fast wallet refund",
    text: `Approved refunds land in your TheBookX wallet within ${RETURNS.walletCreditWithin}.`,
  },
  {
    icon: Landmark,
    title: "Bank refund where eligible",
    text: "Cancelled, lost or failed orders, and eligible claims on request, go back to your bank or original payment method.",
  },
];

const SECTIONS = [
  { id: "scope-refund", label: "1. Scope" },
  { id: "cancellation", label: "2. Cancelling an order" },
  { id: "post-order-unavailability", label: "3. Book unavailable after ordering" },
  { id: "eligibility-return", label: "4. Damaged, wrong or missing books" },
  { id: "assessment", label: "5. How we assess your claim" },
  { id: "non-returnable", label: "6. What isn't covered" },
  { id: "return-process", label: "7. How to raise a request" },
  { id: "undelivered", label: "8. Undelivered or refused orders" },
  { id: "lost", label: "9. Lost shipments" },
  { id: "failed-payment", label: "10. Failed payments & double charges" },
  { id: "refund-destination", label: "11. Where your refund goes" },
  { id: "disputes", label: "12. Questions & grievances" },
  { id: "changes-refund", label: "13. Changes to this policy" },
];

export default function RefundCancellationPolicy() {
  return (
    <main className="legal-page">
      <div className="legal-header">
        <h1>Refund &amp; Cancellation Policy</h1>
        <div className="legal-header-meta">
          <span className="last-updated">
            Last updated: {POLICY_EFFECTIVE_DATE}
          </span>
          <p className="legal-intro">
            We want every book to reach you in good shape. If something goes
            wrong, this page explains exactly what we do about it: how to cancel,
            how to report a problem, how much you get back, and where the money
            goes. It applies to orders placed on{" "}
            <a href="https://thebookx.in">thebookx.in</a> and is part of our
            agreement with you, together with our {legalLinks}.
          </p>
        </div>
      </div>

      <LegalGlance items={GLANCE} />
      <LegalToc sections={SECTIONS} />

      <section id="scope-refund">
        <h2>1. Scope</h2>
        <p>
          This policy covers every product sold by TheBookX, including books,
          combos, box sets and discounted items. It follows the Consumer
          Protection Act, 2019 and the Consumer Protection (E-Commerce) Rules,
          2020. Nothing in it reduces the rights you have under Indian
          consumer law.
        </p>
      </section>

      <section id="cancellation">
        <h2>2. Cancelling an order</h2>
        <h3>2.1 If you cancel</h3>
        <ul>
          <li>
            <strong>Before dispatch:</strong> cancel free of charge by messaging
            us on WhatsApp at {SUPPORT.phoneDisplay} with your Order ID. We pack
            orders quickly, so please message as soon as you can. You get back
            everything you paid, with no deductions.
          </li>
          <li>
            <strong>After dispatch:</strong> the order can no longer be
            cancelled. You can refuse the parcel at the door (see Section 8) or,
            if there is a problem with the book, raise a claim after delivery
            (see Section 4).
          </li>
        </ul>
        <h3>2.2 If we cancel</h3>
        <p>
          We may have to cancel an order if a book goes out of stock, a price or
          listing was clearly wrong, the pincode can&apos;t be served, we
          can&apos;t reach you to confirm a Cash on Delivery order, or a payment
          looks fraudulent. When we cancel, you always get a{" "}
          <strong>full refund with no deductions</strong>, including any COD
          advance, to your original payment method (see Section 11).
        </p>
      </section>

      <section id="post-order-unavailability">
        <h2>3. Book unavailable after ordering</h2>
        <p>
          We source genuine copies from shops, retailers and distributors.
          Occasionally a supplier&apos;s copy sells out or doesn&apos;t pass our
          quality check after you&apos;ve ordered. If that happens, we contact
          you and <strong>you choose</strong>:
        </p>
        <ul>
          <li>an alternative book of equal or similar value, or</li>
          <li>
            a refund for that book, to your TheBookX wallet or your original
            payment method, as you prefer.
          </li>
        </ul>
        <p>
          The rest of a multi-book order ships as normal. Only the unavailable
          book is swapped or refunded.
        </p>
      </section>

      <section id="eligibility-return">
        <h2>4. Damaged, defective, wrong or missing books</h2>
        <p>
          Tell us within these windows, counted from the delivery time shown by
          the courier:
        </p>
        <table className="legal-table">
          <thead>
            <tr>
              <th>Issue</th>
              <th>Report within</th>
              <th>What to send</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Book damaged in transit</td>
              <td>{RETURNS.reportWindowDays} days</td>
              <td>Photos of the book and the packaging</td>
            </tr>
            <tr>
              <td>Printing or binding defect (blank, missing or repeated pages)</td>
              <td>{RETURNS.reportWindowDays} days</td>
              <td>Photos of the defect</td>
            </tr>
            <tr>
              <td>Wrong title or edition delivered</td>
              <td>{RETURNS.reportWindowDays} days</td>
              <td>Photo of the book received</td>
            </tr>
            <tr>
              <td>Book missing from a multi-book parcel</td>
              <td>{RETURNS.missingItemHours} hours</td>
              <td>Photo of the parcel and contents; unboxing video if you have one</td>
            </tr>
          </tbody>
        </table>
        <div className="legal-note">
          <p>
            <strong>Tip:</strong> a short unboxing video is the quickest way to
            settle a missing-book or tampered-parcel claim. It&apos;s
            recommended, not required. Photos are enough for damage, defects and
            wrong books.
          </p>
        </div>
        <h3>Do I need to send the book back?</h3>
        <ul>
          <li>
            <strong>Outside Mumbai:</strong> usually not. Keep the book; we
            settle the claim from your photos.
          </li>
          <li>
            <strong>Within Mumbai:</strong> for a replacement or a full refund we
            may arrange a free pickup of the affected book.
          </li>
          <li>
            If we ever ask you to ship a book back, we tell you how and we pay
            the return postage for any issue that was our fault.
          </li>
        </ul>
      </section>

      <section id="assessment">
        <h2>5. How we assess your claim and how much you get back</h2>
        <p>
          We refund <strong>based on the actual issue and the condition of the
          book</strong> as shown in your photos. The guide below is how we
          decide. Amounts are a share of the price you paid for that specific
          book, after any discount.
        </p>
        <table className="legal-table">
          <thead>
            <tr>
              <th>Condition / issue</th>
              <th>What you get</th>
            </tr>
          </thead>
          <tbody>
            {CONDITION_BANDS.map((b) => (
              <tr key={b.issue}>
                <td>{b.issue}</td>
                <td>{b.outcome}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          We reply within {RETURNS.reviewWithin} and tell you the amount and the
          reason before we credit it. If you disagree with our assessment, reply
          with more photos or ask for a review by our Grievance Officer (Section
          12).
        </p>
        <p>
          A replacement depends on stock. If the same book isn&apos;t available,
          we offer an alternative or the refund shown above.
        </p>
      </section>

      <section id="non-returnable">
        <h2>6. What isn&apos;t covered</h2>
        <ul>
          <li>
            Change of mind, or not liking the content, writing style or cover
            (you can always cancel free before dispatch instead)
          </li>
          <li>
            Damage that happened after delivery, such as reading wear, writing,
            highlighting, folds or water damage
          </li>
          <li>
            Claims reported after the windows in Section 4, unless there&apos;s a
            good reason we can verify
          </li>
          <li>
            Free gifts and promotional freebies, and the gift-wrap charge
          </li>
          <li>
            Items clearly marked &ldquo;final sale&rdquo; at the time of
            purchase, unless they arrive damaged, defective or wrong
          </li>
        </ul>
        <p>
          Our books are genuine paperback editions from the retail supply chain,
          not direct-from-publisher stock. Ordinary signs of handling from that
          supply chain, such as a light shelf mark, aren&apos;t a defect. Anything
          beyond that is covered by Section 5.
        </p>
      </section>

      <section id="return-process">
        <h2>7. How to raise a request</h2>
        <ol>
          <li>
            Message us on{" "}
            <a href={SUPPORT.whatsapp}>WhatsApp ({SUPPORT.phoneDisplay})</a> or
            email <a href={mailto}>{SUPPORT.email}</a> with your{" "}
            <strong>Order ID</strong>.
          </li>
          <li>Tell us what&apos;s wrong and attach the photos from Section 4.</li>
          <li>
            We review it and reply within {RETURNS.reviewWithin} with the outcome
            (replacement, refund amount, or pickup in Mumbai).
          </li>
          <li>
            Once approved, we credit the refund or dispatch the replacement as
            described in Section 11.
          </li>
        </ol>
      </section>

      <section id="undelivered">
        <h2>8. Undelivered or refused orders</h2>
        <p>
          If a parcel comes back to us because delivery was refused without a
          valid reason, the address was incorrect, or the courier couldn&apos;t
          reach you after its delivery attempts:
        </p>
        <ul>
          <li>
            <strong>Prepaid orders:</strong> we refund what you paid minus the
            actual forward and return shipping cost on that parcel. We tell you
            the exact deduction before we process the refund.
          </li>
          <li>
            <strong>COD with ₹{COD.advance} advance:</strong> the ₹{COD.advance}{" "}
            advance covers the shipping already spent and isn&apos;t refunded in
            this case.
          </li>
        </ul>
        <p>
          If you refuse a parcel because it&apos;s visibly damaged or opened,
          that&apos;s a valid reason. Tell us the same day and you&apos;ll get a
          full refund or a fresh shipment.
        </p>
      </section>

      <section id="lost">
        <h2>9. Lost shipments</h2>
        <p>
          If tracking shows &ldquo;delivered&rdquo; but you didn&apos;t receive
          the parcel, tell us within {RETURNS.notDeliveredHours} hours. We
          investigate with the courier, which usually takes 5–7 business days.
          If the parcel is confirmed lost, you choose a{" "}
          <strong>free replacement or a full refund</strong>. If the courier has
          clear proof of delivery to you (OTP, signature or photo), we&apos;ll
          share it and keep helping you raise it with the courier.
        </p>
      </section>

      <section id="failed-payment">
        <h2>10. Failed payments &amp; double charges</h2>
        <p>
          If money left your account but no order was confirmed, the payment
          gateway normally reverses it automatically within 3–7 business days.
          If it hasn&apos;t come back after 7 business days, or you were charged
          twice for one order, send us the transaction reference and a
          screenshot. These amounts always go back to the account they came
          from, never to the wallet.
        </p>
      </section>

      <section id="refund-destination">
        <h2>11. Where your refund goes</h2>
        <p>
          Every approved refund is calculated from the{" "}
          <strong>actual issue and the condition of the book</strong> (Section
          5). Where the money goes depends on what happened:
        </p>

        <h3>11.1 TheBookX wallet (default)</h3>
        <p>
          Unless a rule below sends it elsewhere, the refund is credited to the{" "}
          <strong>TheBookX wallet</strong> linked to your mobile number, within{" "}
          {RETURNS.walletCreditWithin} of approval. Wallet balance can be used on any order,
          and it&apos;s the fastest way to get your next book.
          Wallet credits are valid for {WALLET.validityDays} days.
        </p>

        <h3>11.2 Back to your bank or original payment method</h3>
        <p>
          Refunds are transferred to your bank account, UPI or original payment
          method when the conditions allow it:
        </p>
        <table className="legal-table">
          <thead>
            <tr>
              <th>Situation</th>
              <th>Where it goes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>We cancelled your order, or couldn&apos;t deliver to your pincode</td>
              <td>Original payment method, automatically</td>
            </tr>
            <tr>
              <td>Parcel confirmed lost in transit</td>
              <td>Original payment method, if you choose a refund</td>
            </tr>
            <tr>
              <td>Failed payment or double charge</td>
              <td>The account it was debited from, always</td>
            </tr>
            <tr>
              <td>
                Damaged, defective, wrong or missing book, or a book that became
                unavailable
              </td>
              <td>
                Wallet by default; your bank or UPI if you ask us when you raise
                the claim
              </td>
            </tr>
            <tr>
              <td>You cancelled a prepaid order before dispatch</td>
              <td>Wallet by default; original payment method on request</td>
            </tr>
            <tr>
              <td>Cash on Delivery orders</td>
              <td>Wallet, or a UPI ID / bank account you verify with us</td>
            </tr>
          </tbody>
        </table>
        <p>
          A refund credited to your wallet for one of the eligible situations
          above can still be moved to your bank or UPI.{" "}
          <strong>
            Just ask before it expires ({WALLET.validityDays} days)
          </strong>{" "}
          and we&apos;ll transfer the unused amount.
        </p>
        <p>
          Promotional wallet credits, cashback, referral or review rewards and
          other bonus coins are not cash and can&apos;t be transferred to a bank.
        </p>

        <h3>11.3 How long it takes</h3>
        <table className="legal-table">
          <thead>
            <tr>
              <th>Refund to</th>
              <th>Timeline after approval</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>TheBookX wallet</td>
              <td>Within {RETURNS.walletCreditWithin}</td>
            </tr>
            <tr>
              <td>UPI / bank transfer</td>
              <td>{RETURNS.bankTransferWithin}</td>
            </tr>
            <tr>
              <td>Card / net banking (original method)</td>
              <td>5–7 business days, depending on your bank</td>
            </tr>
          </tbody>
        </table>
        <p>
          For transfers we share the reference number (UTR/ARN) so you can
          track it with your bank.
        </p>
      </section>

      <section id="disputes">
        <h2>12. Questions &amp; grievances</h2>
        <p>
          Almost everything is sorted fastest on WhatsApp. If you&apos;re not
          happy with how a request was handled, write to our Grievance Officer,
          who will acknowledge it within 48 hours and resolve it within one
          month. Please contact us before raising a chargeback with your bank,
          since a direct refund is quicker for you. You can also approach the
          National Consumer Helpline (1915 or{" "}
          <a href="https://consumerhelpline.gov.in" rel="noopener noreferrer">
            consumerhelpline.gov.in
          </a>
          ).
        </p>
        <GrievanceCard />
      </section>

      <section id="changes-refund">
        <h2>13. Changes to this policy</h2>
        <p>
          We may update this policy and will change the &ldquo;Last
          updated&rdquo; date when we do. Your order is always covered by the
          version that was live when you placed it.
        </p>
      </section>
    </main>
  );
}
