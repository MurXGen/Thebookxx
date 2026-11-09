import { Lock, Ban, Truck, UserCheck, Trash2, MessageCircle } from "lucide-react";
import { POLICY_EFFECTIVE_DATE, SUPPORT, mailto } from "@/lib/policy";
import {
  LegalGlance,
  LegalToc,
  GrievanceCard,
} from "@/components/legal/LegalBits";

export const metadata = {
  title: "Privacy Policy",
  description:
    "What personal data TheBookX collects, why, who it is shared with, how long we keep it, and how to access, correct or delete it under India's DPDP Act, 2023.",
  alternates: { canonical: "https://www.thebookx.in/privacy" },
};

const GLANCE = [
  {
    icon: Truck,
    title: "Only what we need to deliver",
    text: "Name, phone, address and order details. No Aadhaar, PAN or other ID documents.",
  },
  {
    icon: Ban,
    title: "We never sell your data",
    text: "Not to advertisers, not to data brokers, not to anyone.",
  },
  {
    icon: Lock,
    title: "We never see your bank details",
    text: "You pay in your own UPI app. We never see or store your UPI PIN, card or bank password.",
  },
  {
    icon: UserCheck,
    title: "You stay in control",
    text: "Ask for a copy, a correction or deletion of your data at any time.",
  },
  {
    icon: Trash2,
    title: "Kept only as long as needed",
    text: "Order records for tax law (8 years); everything else is deleted sooner.",
  },
  {
    icon: MessageCircle,
    title: "One message away",
    text: `WhatsApp ${SUPPORT.phoneDisplay} or email ${SUPPORT.email}.`,
  },
];

const SECTIONS = [
  { id: "scope", label: "1. Who this applies to" },
  { id: "info-collected", label: "2. Data we collect" },
  { id: "purpose", label: "3. Why we use it" },
  { id: "sharing", label: "4. Who we share it with" },
  { id: "cookies", label: "5. Cookies & analytics" },
  { id: "retention", label: "6. How long we keep it" },
  { id: "security", label: "7. How we protect it" },
  { id: "rights", label: "8. Your rights" },
  { id: "children", label: "9. Children" },
  { id: "changes", label: "10. Changes to this policy" },
  { id: "grievance", label: "11. Contact & Grievance Officer" },
];

export default function PrivacyPolicy() {
  return (
    <main className="legal-page">
      <div className="legal-header">
        <h1>Privacy Policy</h1>
        <div className="legal-header-meta">
          <span className="last-updated">
            Last updated: {POLICY_EFFECTIVE_DATE}
          </span>
          <p className="legal-intro">
            This policy explains what personal data TheBookX collects when you
            use <a href="https://thebookx.in">thebookx.in</a> or talk to us on
            WhatsApp, why we need it, who we share it with and how you can
            control it. TheBookX is the &ldquo;Data Fiduciary&rdquo; for your
            data under the Digital Personal Data Protection Act, 2023 (&ldquo;DPDP
            Act&rdquo;), and this policy also follows the Information Technology
            Act, 2000 and its rules.
          </p>
        </div>
      </div>

      <LegalGlance items={GLANCE} />
      <LegalToc sections={SECTIONS} />

      <section id="scope">
        <h2>1. Who this applies to</h2>
        <p>
          Everyone who visits the Website, places an order, or contacts us on
          WhatsApp, phone or email.
        </p>
      </section>

      <section id="info-collected">
        <h2>2. Data we collect</h2>
        <h3>2.1 What you give us</h3>
        <ul>
          <li>
            <strong>Order details:</strong> name, mobile number, delivery
            address, pincode, the books you order, delivery and gift
            preferences.
          </li>
          <li>
            <strong>Email address,</strong> if you choose to share it.
          </li>
          <li>
            <strong>Messages and photos</strong> you send us, for example on
            WhatsApp for support or a refund claim.
          </li>
          <li>
            <strong>Payment confirmations:</strong> the UPI transaction reference
            or screenshot you share, and the UPI ID or bank account you give us
            for a refund.
          </li>
          <li>
            <strong>Reviews</strong> and any photos you submit with them.
          </li>
        </ul>
        <h3>2.2 What we collect automatically</h3>
        <ul>
          <li>
            Device and browser type, IP address, approximate location (city
            level), pages viewed, searches and clicks on the Website.
          </li>
          <li>
            Items saved in your browser, such as your bag, wishlist and recently
            viewed books (see Section 5).
          </li>
        </ul>
        <h3>2.3 What we never collect</h3>
        <p>
          We don&apos;t ask for or store Aadhaar, PAN, passport or other ID
          documents, card numbers, CVVs, UPI PINs or banking passwords. You pay
          inside your own UPI app, and we only receive the payment confirmation.
        </p>
      </section>

      <section id="purpose">
        <h2>3. Why we use it</h2>
        <table className="legal-table">
          <thead>
            <tr>
              <th>Purpose</th>
              <th>Basis under the DPDP Act</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Process, pack, ship and track your order; send order updates</td>
              <td>Your order, i.e. data you provided for this purpose (legitimate use)</td>
            </tr>
            <tr>
              <td>Support, cancellations, returns, refunds and your wallet</td>
              <td>Legitimate use for your order</td>
            </tr>
            <tr>
              <td>Preventing fraud and misuse of offers</td>
              <td>Legitimate use</td>
            </tr>
            <tr>
              <td>Tax, accounting and legal obligations</td>
              <td>Compliance with law</td>
            </tr>
            <tr>
              <td>Improving the Website using analytics</td>
              <td>Consent</td>
            </tr>
            <tr>
              <td>Offers, new arrivals and reading recommendations on WhatsApp/SMS/email</td>
              <td>Consent. Opt out any time by replying STOP or messaging us.</td>
            </tr>
          </tbody>
        </table>
        <div className="legal-note">
          <p>
            <strong>We never sell your personal data</strong> or share it with
            anyone for their own marketing.
          </p>
        </div>
      </section>

      <section id="sharing">
        <h2>4. Who we share it with</h2>
        <p>
          We share only what each partner needs to do its job for us, and they
          may use it only for that job:
        </p>
        <table className="legal-table">
          <thead>
            <tr>
              <th>Partner</th>
              <th>What they get</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Courier partners (Delhivery, India Post and regional couriers)</td>
              <td>Name, address, phone, parcel details</td>
              <td>To deliver your order</td>
            </tr>
            <tr>
              <td>Google (Workspace, Sheets and Forms)</td>
              <td>Order and support records</td>
              <td>Secure storage of our order records</td>
            </tr>
            <tr>
              <td>WhatsApp (Meta) and SMS providers</td>
              <td>Phone number, order messages</td>
              <td>Order updates and support</td>
            </tr>
            <tr>
              <td>Google Analytics and Meta Pixel</td>
              <td>Device and browsing data</td>
              <td>Measuring and improving the Website and our ads</td>
            </tr>
            <tr>
              <td>Website hosting provider</td>
              <td>Technical data needed to serve the Website</td>
              <td>Running the Website</td>
            </tr>
          </tbody>
        </table>
        <p>
          We may also disclose data when the law requires it, for example to a
          court or a government authority with a lawful request. Some of these
          providers may store data on servers outside India, which is permitted
          under the DPDP Act.
        </p>
      </section>

      <section id="cookies">
        <h2>5. Cookies &amp; analytics</h2>
        <p>
          We use cookies and your browser&apos;s local storage to keep your bag,
          wishlist and preferences (essential), and Google Analytics and Meta
          Pixel to understand how the Website is used and to measure our ads
          (analytics and marketing).
        </p>
        <p>
          You can block or delete cookies in your browser settings, or opt out
          with the{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            rel="noopener noreferrer"
          >
            Google Analytics opt-out add-on
          </a>{" "}
          and your Facebook/Instagram ad settings. Blocking essential storage
          may stop the bag and checkout from working.
        </p>
      </section>

      <section id="retention">
        <h2>6. How long we keep it</h2>
        <table className="legal-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Kept for</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Orders, invoices and payment records</td>
              <td>8 years, as required by Indian tax law</td>
            </tr>
            <tr>
              <td>Support chats and refund photos</td>
              <td>Up to 3 years from your last order or message</td>
            </tr>
            <tr>
              <td>Marketing preferences</td>
              <td>Until you opt out</td>
            </tr>
            <tr>
              <td>Analytics data</td>
              <td>Up to 26 months</td>
            </tr>
          </tbody>
        </table>
        <p>After that, data is deleted or anonymised.</p>
      </section>

      <section id="security">
        <h2>7. How we protect it</h2>
        <p>
          The Website uses HTTPS encryption, access to order records is limited
          to the team members who need it, and payments happen inside your own
          UPI app. No system is perfectly secure. If a breach affects your
          personal data, we&apos;ll inform you and the Data Protection Board of
          India as the DPDP Act requires.
        </p>
      </section>

      <section id="rights">
        <h2>8. Your rights</h2>
        <p>Under the DPDP Act you can:</p>
        <ul>
          <li>
            <strong>Access:</strong> get a summary of the personal data we hold
            about you and who we&apos;ve shared it with.
          </li>
          <li>
            <strong>Correct or update</strong> anything inaccurate or
            incomplete.
          </li>
          <li>
            <strong>Erase:</strong> ask us to delete your data, except records
            we must keep by law.
          </li>
          <li>
            <strong>Withdraw consent</strong> for analytics or marketing at any
            time. Withdrawing is as easy as giving it.
          </li>
          <li>
            <strong>Nominate</strong> someone to exercise these rights if you
            die or become unable to.
          </li>
          <li>
            <strong>Complain:</strong> raise a grievance with us (Section 11).
            If you&apos;re not satisfied, complain to the Data Protection Board
            of India.
          </li>
        </ul>
        <p>
          To use any of these rights, message us from your registered mobile
          number on <a href={SUPPORT.whatsapp}>WhatsApp</a> or email{" "}
          <a href={mailto}>{SUPPORT.email}</a>. We may verify that it&apos;s you
          first, and we&apos;ll respond within 30 days at the latest.
        </p>
      </section>

      <section id="children">
        <h2>9. Children</h2>
        <p>
          Orders must be placed by an adult. If a parent or guardian orders
          books for a child, we only collect the adult&apos;s details. We
          don&apos;t knowingly collect data from children or track them for
          advertising. If you think a child has shared data with us, tell us and
          we&apos;ll delete it.
        </p>
      </section>

      <section id="changes">
        <h2>10. Changes to this policy</h2>
        <p>
          We&apos;ll update the &ldquo;Last updated&rdquo; date when this policy
          changes. For important changes, we&apos;ll also let you know on
          WhatsApp or on the Website.
        </p>
      </section>

      <section id="grievance">
        <h2>11. Contact &amp; Grievance Officer</h2>
        <p>
          For any privacy question, request or complaint, contact our Grievance
          Officer:
        </p>
        <GrievanceCard />
      </section>
    </main>
  );
}
