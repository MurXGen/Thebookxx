import Link from "next/link";
import { BookOpen, ShieldCheck, XCircle, Wallet, Scale, MessageCircle } from "lucide-react";
import { POLICY_EFFECTIVE_DATE, SUPPORT, RETURNS, WALLET } from "@/lib/policy";
import {
  LegalGlance,
  LegalToc,
  BusinessCard,
  GrievanceCard,
} from "@/components/legal/LegalBits";

export const metadata = {
  title: "Terms & Conditions",
  description:
    "The terms for shopping on TheBookX: orders, pricing, genuine retail-sourced paperbacks, cancellations, refunds, your wallet and how disputes are handled.",
  alternates: { canonical: "https://www.thebookx.in/terms" },
};

const GLANCE = [
  {
    icon: BookOpen,
    title: "Genuine books, honestly sourced",
    text: "Legitimate published editions from shops and distributors. Never photocopies or pirated prints.",
  },
  {
    icon: ShieldCheck,
    title: "Price you see is what you pay",
    text: "Every charge is itemised in your bill before you pay. No hidden fees.",
  },
  {
    icon: XCircle,
    title: "Free cancellation before dispatch",
    text: "And if we ever cancel, you get a full refund with no deductions.",
  },
  {
    icon: Wallet,
    title: "Refunds match the issue",
    text: "Credited to your TheBookX wallet, or your bank where eligible.",
  },
  {
    icon: Scale,
    title: "Your consumer rights stay",
    text: "Nothing here takes away your rights under Indian consumer law.",
  },
  {
    icon: MessageCircle,
    title: "Real people on WhatsApp",
    text: `${SUPPORT.phoneDisplay}, ${SUPPORT.hoursWeekday}.`,
  },
];

const SECTIONS = [
  { id: "about", label: "1. Who we are" },
  { id: "acceptance", label: "2. Using these terms" },
  { id: "eligibility", label: "3. Who can order" },
  { id: "account", label: "4. Your details & account" },
  { id: "orders", label: "5. Orders" },
  { id: "authenticity", label: "6. Our books" },
  { id: "pricing", label: "7. Prices & payment" },
  { id: "wallet", label: "8. TheBookX wallet" },
  { id: "shipping-terms", label: "9. Delivery" },
  { id: "returns-terms", label: "10. Cancellations, returns & refunds" },
  { id: "intellectual", label: "11. Website content" },
  { id: "prohibited", label: "12. Fair use of the website" },
  { id: "liability", label: "13. Our responsibility" },
  { id: "force-majeure", label: "14. Events outside our control" },
  { id: "governing-law", label: "15. Disputes & governing law" },
  { id: "changes", label: "16. Changes to these terms" },
  { id: "contact-terms", label: "17. Contact & grievances" },
];

export default function TermsAndConditions() {
  return (
    <main className="legal-page">
      <div className="legal-header">
        <h1>Terms &amp; Conditions</h1>
        <div className="legal-header-meta">
          <span className="last-updated">
            Last updated: {POLICY_EFFECTIVE_DATE}
          </span>
          <p className="legal-intro">
            These terms explain how buying from TheBookX works and what each of
            us can expect from the other. We&apos;ve kept them as plain as we
            can. The summary below is a quick guide; the numbered sections are
            the full terms.
          </p>
        </div>
      </div>

      <LegalGlance items={GLANCE} />
      <LegalToc sections={SECTIONS} />

      <section id="about">
        <h2>1. Who we are</h2>
        <p>
          &ldquo;TheBookX&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo; and
          &ldquo;our&rdquo; mean TheBookX (formerly Uskillbook), a sole
          proprietorship based in Mumbai, Maharashtra, India, which sells books
          through <a href="https://thebookx.in">thebookx.in</a> (the
          &ldquo;Website&rdquo;). &ldquo;You&rdquo; means anyone who uses the
          Website or orders from us. Our full business and contact details are
          in Section 17.
        </p>
      </section>

      <section id="acceptance">
        <h2>2. Using these terms</h2>
        <p>
          By placing an order you agree to these terms and to our{" "}
          <Link href="/refund">Refund &amp; Cancellation Policy</Link>,{" "}
          <Link href="/shipping">Shipping &amp; Delivery Policy</Link> and{" "}
          <Link href="/privacy">Privacy Policy</Link>, which form part of them. If
          anything in these documents conflicts with your rights under the
          Consumer Protection Act, 2019 or the Consumer Protection
          (E-Commerce) Rules, 2020, the law wins.
        </p>
      </section>

      <section id="eligibility">
        <h2>3. Who can order</h2>
        <p>
          You need to be 18 or older to place an order. Younger readers are very
          welcome. A parent or guardian simply places the order for them and is
          responsible for it.
        </p>
      </section>

      <section id="account">
        <h2>4. Your details &amp; account</h2>
        <p>
          Your orders, wallet and order history are linked to your mobile
          number. Please give us an accurate name, address and reachable phone
          number, and keep any OTPs to yourself. We may decline or cancel orders
          that look fraudulent or abusive, and we&apos;ll refund any amount paid
          for an order we cancel.
        </p>
      </section>

      <section id="orders">
        <h2>5. Orders</h2>
        <p>
          When you place an order you&apos;re making an offer to buy. The order
          is accepted when we confirm it on WhatsApp, SMS, email or on the
          Website. We may decline an order if a book is out of stock, a price or
          listing was clearly wrong, your pincode can&apos;t be served, or we
          can&apos;t verify the order. If you already paid, you get a full
          refund.
        </p>
        <p>
          Because our stock comes from shops, retailers and distributors, a book
          may occasionally become unavailable after you order. We&apos;ll contact
          you and <strong>you choose</strong> an alternative of similar value or
          a refund for that book. The rest of your order ships as normal.
        </p>
      </section>

      <section id="authenticity">
        <h2>6. Our books</h2>
        <p>
          Our books are <strong>genuine, legitimately published editions</strong>
          , sourced from established shops, retailers and distributors.
          That&apos;s how we keep prices so low. They are never photocopied or
          pirated, and the text is always complete.
        </p>
        <p>
          Unless a listing says otherwise, they are standard paperback copies
          from the retail supply chain rather than direct-from-publisher stock.
          Every copy is checked and packed in good, readable condition. The
          print run, edition or cover design can differ from the photo. If you
          need a particular edition, message us before ordering and we&apos;ll
          confirm.
        </p>
      </section>

      <section id="pricing">
        <h2>7. Prices &amp; payment</h2>
        <p>
          Prices are in Indian Rupees and include applicable taxes. Delivery,
          Cash on Delivery and optional add-on charges are listed in our{" "}
          <Link href="/shipping">Shipping Policy</Link> and shown as separate lines in
          your bill <strong>before</strong> you pay. Prices and offers can change,
          but you always pay the amount shown when you placed your order.
        </p>
        <p>
          Online payments go through secure, PCI-DSS compliant payment providers.
          We never see or store your card number, CVV, UPI PIN or banking
          password.
        </p>
      </section>

      <section id="wallet">
        <h2>8. TheBookX wallet</h2>
        <p>
          Your TheBookX wallet is linked to your mobile number and can be used
          on future orders. It may hold refunds as well as promotional credits
          such as cashback or rewards. Wallet credits are valid for{" "}
          {WALLET.validityDays} days from the date they&apos;re added, and the
          oldest credits are used first.
        </p>
        <p>
          Refunds for eligible situations can be moved from the wallet to your
          bank or UPI on request before they expire, as set out in{" "}
          <Link href="/refund#refund-destination">Section 11 of our Refund Policy</Link>
          . Promotional credits and rewards aren&apos;t cash and can&apos;t be
          withdrawn.
        </p>
      </section>

      <section id="shipping-terms">
        <h2>9. Delivery</h2>
        <p>
          We deliver across India through Delhivery, India Post and regional
          partners. Delivery times and charges are in our{" "}
          <Link href="/shipping">Shipping &amp; Delivery Policy</Link>. Delivery times
          are estimates. We&apos;ll keep you updated if there&apos;s a delay.
        </p>
      </section>

      <section id="returns-terms">
        <h2>10. Cancellations, returns &amp; refunds</h2>
        <p>
          Our <Link href="/refund">Refund &amp; Cancellation Policy</Link> has the
          full details. In short:
        </p>
        <ul>
          <li>You can cancel free of charge until your order is dispatched.</li>
          <li>
            If we cancel an order, you get a full refund with no deductions.
          </li>
          <li>
            Report a damaged, defective or wrong book within{" "}
            {RETURNS.reportWindowDays} days of delivery, or a missing book within{" "}
            {RETURNS.missingItemHours} hours, with photos.
          </li>
          <li>
            We replace the book or refund you based on the actual issue and the
            book&apos;s condition, using the published guide in the Refund
            Policy.
          </li>
          <li>
            Refunds go to your TheBookX wallet by default, or to your bank or
            original payment method where the Refund Policy says so.
          </li>
        </ul>
      </section>

      <section id="intellectual">
        <h2>11. Website content</h2>
        <p>
          The Website&apos;s design, text, logos, graphics and code belong to
          TheBookX or its licensors. You&apos;re welcome to browse, share links
          and use it for personal shopping, but please don&apos;t copy or reuse
          our content commercially without permission. Book titles, covers and
          author names belong to their respective rights holders and are shown
          only to help you shop.
        </p>
      </section>

      <section id="prohibited">
        <h2>12. Fair use of the website</h2>
        <p>Please don&apos;t:</p>
        <ul>
          <li>use the Website for anything unlawful or fraudulent;</li>
          <li>
            try to break into, overload or disrupt the Website or our systems;
          </li>
          <li>
            scrape or bulk-copy the Website with bots without our written
            permission;
          </li>
          <li>
            give false details, or misuse offers, coupons, referrals or the
            wallet (for example by creating multiple accounts).
          </li>
        </ul>
        <p>
          If you do, we may cancel the affected orders (with a refund of any
          amount paid) or restrict access to offers or the Website.
        </p>
      </section>

      <section id="liability">
        <h2>13. Our responsibility</h2>
        <p>
          We&apos;re responsible for delivering the books you ordered as
          described, and for putting things right under our Refund Policy when
          we don&apos;t. Beyond that, and as far as the law allows, our total
          liability for an order is limited to the amount you paid for the
          product concerned, and we aren&apos;t liable for indirect losses.
          Nothing here limits liability for fraud, wilful misconduct, or
          anything that can&apos;t be limited under Indian law, including your
          statutory consumer rights.
        </p>
      </section>

      <section id="force-majeure">
        <h2>14. Events outside our control</h2>
        <p>
          We aren&apos;t responsible for delays caused by events we can&apos;t
          reasonably control, such as natural disasters, strikes, government
          restrictions, pandemics or major courier and network outages. If such
          an event stops us fulfilling your order, we&apos;ll let you know and
          you can cancel for a full refund.
        </p>
      </section>

      <section id="governing-law">
        <h2>15. Disputes &amp; governing law</h2>
        <p>
          Please talk to us first. Most issues are resolved within a day on
          WhatsApp, and our Grievance Officer (Section 17) handles anything
          that needs escalating. These terms are governed by Indian law. Subject
          to your right to file a consumer complaint where you live or work
          under the Consumer Protection Act, 2019, the courts of Mumbai,
          Maharashtra have jurisdiction.
        </p>
      </section>

      <section id="changes">
        <h2>16. Changes to these terms</h2>
        <p>
          We may update these terms and will change the &ldquo;Last
          updated&rdquo; date when we do. Orders are governed by the terms that
          were live when they were placed.
        </p>
      </section>

      <section id="contact-terms">
        <h2>17. Contact &amp; grievances</h2>
        <BusinessCard />
        <GrievanceCard />
      </section>
    </main>
  );
}
