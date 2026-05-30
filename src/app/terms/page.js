"use client";

export default function TermsAndConditions() {
  return (
    <main className="legal-page">
      {/* Header */}
      <div className="legal-header">
        <h1>Terms &amp; Conditions</h1>
        <div className="legal-header-meta">
          <span className="last-updated">Effective Date: 1 May 2026</span>
          <p className="legal-intro">
            Please read these Terms and Conditions ("Terms") carefully before
            using TheBookX, accessible at{" "}
            <a href="https://thebookx.in">https://thebookx.in</a> (the
            "Website"). By accessing or placing an order on this Website, you
            agree to be legally bound by these Terms.
          </p>
        </div>
      </div>

      {/* Table of Contents */}
      {/* <nav className="legal-toc" aria-label="Table of contents">
        <h2 className="legal-toc-title">Contents</h2>
        <ul className="legal-toc-list">
          <li>
            <a href="#definitions">1. Definitions</a>
          </li>
          <li>
            <a href="#acceptance">2. Acceptance of Terms</a>
          </li>
          <li>
            <a href="#eligibility">3. Eligibility</a>
          </li>
          <li>
            <a href="#account">4. User Account &amp; Information</a>
          </li>
          <li>
            <a href="#orders">5. Orders &amp; Order Acceptance</a>
          </li>
          <li>
            <a href="#pricing">6. Pricing &amp; Payment</a>
          </li>
          <li>
            <a href="#shipping-terms">7. Shipping &amp; Delivery</a>
          </li>
          <li>
            <a href="#returns-terms">8. Returns, Refunds &amp; Cancellations</a>
          </li>
          <li>
            <a href="#intellectual">9. Intellectual Property</a>
          </li>
          <li>
            <a href="#prohibited">10. Prohibited Conduct</a>
          </li>
          <li>
            <a href="#liability">11. Limitation of Liability</a>
          </li>
          <li>
            <a href="#indemnity">12. Indemnification</a>
          </li>
          <li>
            <a href="#force-majeure">13. Force Majeure</a>
          </li>
          <li>
            <a href="#termination">14. Termination</a>
          </li>
          <li>
            <a href="#governing-law">15. Governing Law &amp; Jurisdiction</a>
          </li>
          <li>
            <a href="#changes">16. Changes to These Terms</a>
          </li>
          <li>
            <a href="#contact-terms">17. Contact Information</a>
          </li>
        </ul>
      </nav> */}

      <section id="definitions">
        <h2>1. Definitions</h2>
        <p>For the purposes of these Terms:</p>
        <ul>
          <li>
            <strong>"Company", "We", "Us", "Our"</strong> refers to TheBookX, a
            sole proprietorship operated, with its registered place of business
            in Mumbai, Maharashtra, India.
          </li>
          <li>
            <strong>"User", "You", "Your"</strong> refers to any individual
            accessing or using the Website, whether or not a purchase is made.
          </li>
          <li>
            <strong>"Products"</strong> refers to books, educational materials,
            and any other goods listed for sale on the Website.
          </li>
          <li>
            <strong>"Order"</strong> refers to a confirmed request placed by the
            User for the purchase of one or more Products.
          </li>
        </ul>
      </section>

      <section id="acceptance">
        <h2>2. Acceptance of Terms</h2>
        <p>
          By accessing the Website, creating an account, browsing Products, or
          placing an Order, you confirm that you have read, understood, and
          agree to be bound by these Terms, our{" "}
          <a href="/privacy">Privacy Policy</a>, our{" "}
          <a href="/refund">Refund &amp; Cancellation Policy</a>, and our{" "}
          <a href="/shipping">Shipping &amp; Delivery Policy</a>, each of which
          is incorporated herein by reference.
        </p>
        <p>
          If you do not agree to any part of these Terms, you must discontinue
          use of the Website immediately.
        </p>
      </section>

      <section id="eligibility">
        <h2>3. Eligibility</h2>
        <p>
          The Website is intended for use by individuals who are at least 18
          years of age and competent to enter into a legally binding contract
          under the Indian Contract Act, 1872. By placing an Order, you
          represent and warrant that you meet these requirements. Users under 18
          may use the Website only under the supervision of a parent or legal
          guardian, who shall be solely responsible for all activities conducted
          on the minor's behalf.
        </p>
      </section>

      <section id="account">
        <h2>4. User Account &amp; Information</h2>
        <p>
          You agree to provide accurate, current, and complete information when
          placing an Order, including but not limited to your full name,
          delivery address, valid Indian mobile number, and email address (where
          applicable). You are solely responsible for maintaining the
          confidentiality of your account credentials and for all activities
          that occur under your account.
        </p>
        <p>
          We reserve the right to refuse service, terminate accounts, or cancel
          Orders at our sole discretion in the event of suspected fraudulent
          activity, abuse, or violation of these Terms.
        </p>
      </section>

      <section id="orders">
        <h2>5. Orders &amp; Order Acceptance</h2>
        <p>
          The display of Products on the Website constitutes an invitation to
          offer and not a binding offer of sale. Placing an Order constitutes
          your offer to purchase the selected Products subject to these Terms.
        </p>
        <p>
          A binding contract of sale is formed only upon our explicit acceptance
          of your Order, which shall be communicated to you via WhatsApp, SMS,
          email, or in-app confirmation. We reserve the right to accept or
          reject any Order at our sole discretion, including but not limited to
          instances of:
        </p>
        <ul>
          <li>Product unavailability or inaccurate pricing</li>
          <li>Suspected fraudulent activity or payment irregularity</li>
          <li>Inability to verify the shipping address or contact details</li>
          <li>Geographical restrictions on delivery</li>
          <li>Errors in the Product description or images</li>
        </ul>
        <p>
          In the event of an Order being rejected after payment has been
          received, the full payment shall be refunded to the original payment
          method within 5–7 business days.
        </p>
      </section>

      <section id="pricing">
        <h2>6. Pricing &amp; Payment</h2>
        <p>
          All prices displayed on the Website are in Indian Rupees (INR) and are
          inclusive of applicable taxes unless stated otherwise. Prices, offers,
          and discounts are subject to change without prior notice. The price
          applicable to your Order is the price displayed at the time of Order
          confirmation.
        </p>
        <p>
          Payments are processed through secure, third-party payment gateways
          including but not limited to UPI, debit/credit card networks, and net
          banking. We do <strong>not</strong> store any card details, UPI PINs,
          or banking credentials on our servers. All payment-sensitive
          information is handled directly by PCI-DSS compliant payment
          processors.
        </p>
        <p>
          In the event of a payment failure, double charge, or technical
          discrepancy, kindly notify us within 48 hours so we may coordinate
          with the payment processor for resolution.
        </p>
        <div className="legal-note">
          <p>
            <strong>Cash on Delivery (COD):</strong> Where COD is available, a
            non-refundable advance payment of ₹99 may be applicable to confirm
            the Order. The balance amount shall be paid in cash to the delivery
            agent at the time of delivery.
          </p>
        </div>
      </section>

      <section id="shipping-terms">
        <h2>7. Shipping &amp; Delivery</h2>
        <p>
          Shipping is offered across India through partner courier services
          including India Post, Delhivery, and other reputable logistics
          providers. Standard delivery typically takes 3–7 business days
          depending on your location and product availability. Express delivery,
          where available, takes 2–5 business days.
        </p>
        <p>
          Delivery timelines are estimates and not guarantees. We are not liable
          for delays caused by courier partners, transit disruptions, incorrect
          addresses, natural calamities, or government-imposed restrictions. For
          complete shipping details, please refer to our{" "}
          <a href="/shipping">Shipping &amp; Delivery Policy</a>.
        </p>
      </section>

      <section id="returns-terms">
        <h2>8. Returns, Refunds &amp; Cancellations</h2>
        <p>
          Our return, refund, and cancellation procedures are governed
          exclusively by our{" "}
          <a href="/refund">Refund &amp; Cancellation Policy</a>, which forms an
          integral part of these Terms. In summary:
        </p>
        <ul>
          <li>
            Returns are accepted only for damaged, defective, or incorrectly
            delivered Products, provided we are notified within 24 hours of
            delivery accompanied by clear photographic or video evidence.
          </li>
          <li>
            Cancellations are permitted prior to Order dispatch. Once shipped,
            Orders cannot be cancelled.
          </li>
          <li>
            Approved refunds shall be processed to the original payment method
            within 5–7 business days of return verification.
          </li>
        </ul>
      </section>

      <section id="intellectual">
        <h2>9. Intellectual Property</h2>
        <p>
          All content available on the Website — including but not limited to
          text, graphics, logos, images, software, page layouts, and the
          underlying source code — is the property of TheBookX or its licensors
          and is protected by Indian and international copyright, trademark, and
          other intellectual property laws.
        </p>
        <p>
          You are granted a limited, non-exclusive, non-transferable, revocable
          licence to access and use the Website strictly for personal,
          non-commercial purposes. Any reproduction, distribution, modification,
          republication, or commercial use of any content from the Website
          without our prior written consent is strictly prohibited.
        </p>
        <p>
          Book titles, cover images, and author names referenced on the Website
          are the intellectual property of their respective rights holders and
          are displayed solely for the purpose of facilitating sales.
        </p>
      </section>

      <section id="prohibited">
        <h2>10. Prohibited Conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>
            Use the Website for any unlawful purpose or in violation of any
            applicable Indian or international law
          </li>
          <li>
            Attempt to gain unauthorised access to the Website, our servers, or
            any related systems or networks
          </li>
          <li>
            Use any automated system, including but not limited to robots,
            spiders, or scrapers, to access or extract data from the Website
            without our express written consent
          </li>
          <li>
            Interfere with or disrupt the proper functioning of the Website
          </li>
          <li>
            Submit false, misleading, or fraudulent information, including
            during the Order placement process
          </li>
          <li>
            Resell, redistribute, or commercially exploit any Product purchased
            from the Website without our written consent
          </li>
          <li>
            Engage in any conduct that violates the rights of TheBookX, its
            customers, or any third party
          </li>
        </ul>
      </section>

      <section id="liability">
        <h2>11. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted under applicable law, TheBookX, its
          proprietor, employees, agents, and partners shall not be liable for
          any indirect, incidental, special, consequential, punitive, or
          exemplary damages arising out of or in connection with your use of the
          Website or the Products, including but not limited to loss of profits,
          loss of data, loss of business, or any other intangible loss.
        </p>
        <p>
          Our total aggregate liability arising out of or in connection with any
          Order or use of the Website shall not exceed the amount actually paid
          by you for the specific Product giving rise to the claim.
        </p>
        <p>
          Nothing in these Terms shall exclude or limit liability for fraud,
          wilful misconduct, or any liability that cannot be excluded under
          applicable law.
        </p>
      </section>

      <section id="indemnity">
        <h2>12. Indemnification</h2>
        <p>
          You agree to indemnify, defend, and hold harmless TheBookX, its
          proprietor, employees, and affiliates from and against any and all
          claims, damages, losses, liabilities, costs, and expenses (including
          reasonable legal fees) arising out of or in connection with: (i) your
          breach of these Terms; (ii) your violation of any applicable law or
          third-party right; or (iii) your use or misuse of the Website or
          Products.
        </p>
      </section>

      <section id="force-majeure">
        <h2>13. Force Majeure</h2>
        <p>
          TheBookX shall not be liable for any failure or delay in the
          performance of its obligations arising out of or caused by events
          beyond its reasonable control, including but not limited to acts of
          God, natural disasters, war, terrorism, riots, civil unrest,
          government actions, labour strikes, pandemics, internet or
          telecommunications outages, or failures of third-party logistics
          partners.
        </p>
      </section>

      <section id="termination">
        <h2>14. Termination</h2>
        <p>
          We reserve the right to suspend, restrict, or terminate your access to
          the Website at any time, with or without notice, for any reason
          including but not limited to violation of these Terms. Upon
          termination, your right to use the Website shall cease immediately,
          though provisions relating to intellectual property, limitation of
          liability, indemnification, and governing law shall survive.
        </p>
      </section>

      <section id="governing-law">
        <h2>15. Governing Law &amp; Jurisdiction</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the
          laws of the Republic of India, without regard to its conflict of laws
          principles. Any dispute, controversy, or claim arising out of or
          relating to these Terms, the Website, or any Product shall be subject
          to the exclusive jurisdiction of the competent courts located in{" "}
          <strong>Mumbai, Maharashtra, India</strong>.
        </p>
      </section>

      <section id="changes">
        <h2>16. Changes to These Terms</h2>
        <p>
          We reserve the right to modify, amend, or update these Terms at any
          time, at our sole discretion. Any changes will be effective
          immediately upon being posted on the Website with a revised "Effective
          Date". Your continued use of the Website following the posting of
          changes constitutes your acceptance of the revised Terms. We encourage
          you to review these Terms periodically.
        </p>
      </section>

      <section id="contact-terms">
        <h2>17. Contact Information</h2>
        <p>
          For any questions, concerns, or notices relating to these Terms,
          please contact us using the details below:
        </p>

        <div className="legal-card">
          <h3 className="legal-card-title">Business Information</h3>
          <dl>
            <dt>Legal Name</dt>
            <dd>Murthy Poothapandi Thevar</dd>

            <dt>Trade Name</dt>
            <dd>TheBookX</dd>

            <dt>Business Type</dt>
            <dd>Sole Proprietorship</dd>

            <dt>Udyam Registration</dt>
            <dd>UDYAM-MH-19-0386866</dd>

            <dt>Registered Address</dt>
            <dd>
              Room No 107, A Wing, Thevar Suryoodaya CHS, UM Thevar Marg, Sion
              Mahim Link Road, Dharavi, Mumbai, Maharashtra 400017, India
            </dd>

            <dt>Email</dt>
            <dd>
              <a href="mailto:uskillbook@gmail.com">uskillbook@gmail.com</a>
            </dd>

            <dt>WhatsApp / Phone</dt>
            <dd>
              <a href="https://wa.me/917710892108">+91 77108 92108</a>
            </dd>

            <dt>Website</dt>
            <dd>
              <a href="https://thebookx.in">https://thebookx.in</a>
            </dd>
          </dl>
        </div>
      </section>

      <div className="legal-disclaimer">
        <p>
          By using TheBookX, you acknowledge that you have read, understood, and
          agree to be bound by these Terms and Conditions in their entirety.
          These Terms constitute the entire agreement between you and TheBookX
          with respect to your use of the Website and supersede all prior or
          contemporaneous agreements, communications, or proposals.
        </p>
      </div>
    </main>
  );
}
