"use client";

export default function ShippingDeliveryPolicy() {
  return (
    <main className="legal-page">
      {/* Header */}
      <div className="legal-header">
        <h1>Shipping &amp; Delivery Policy</h1>
        <div className="legal-header-meta">
          <span className="last-updated">Effective Date: 1 May 2026</span>
          <p className="legal-intro">
            This Shipping &amp; Delivery Policy ("Policy") describes how
            TheBookX ("we", "us", "our") processes, ships, and delivers products
            purchased through{" "}
            <a href="https://thebookx.in">https://thebookx.in</a> (the
            "Website"). By placing an order with us, you agree to the terms set
            out in this Policy. This Policy should be read together with our{" "}
            <a href="/terms">Terms &amp; Conditions</a>,{" "}
            <a href="/privacy">Privacy Policy</a>, and{" "}
            <a href="/refund">Refund &amp; Cancellation Policy</a>.
          </p>
        </div>
      </div>

      <section id="scope-shipping">
        <h2>1. Scope &amp; Applicability</h2>
        <p>
          This Policy applies to all orders placed through the Website,
          including standard, express, and Cash on Delivery (COD) orders. It is
          issued in compliance with the Consumer Protection Act, 2019, the
          Consumer Protection (E-Commerce) Rules, 2020, and other applicable
          Indian laws governing the sale and delivery of goods.
        </p>
      </section>

      <section id="serviceability">
        <h2>2. Service Areas</h2>
        <p>
          TheBookX ships orders to addresses across India, subject to pincode
          serviceability by our logistics partners. While we strive to deliver
          to every part of the country, certain remote or restricted pincodes
          may have limited or no courier coverage. In such cases:
        </p>
        <ul>
          <li>
            You will be notified during checkout if the destination pincode is
            non-serviceable
          </li>
          <li>
            If non-serviceability is identified after order placement, the order
            shall be cancelled and a full refund issued within 5–7 business days
          </li>
          <li>
            Where partial serviceability is available, we may reach out to
            confirm whether you wish to proceed with extended delivery timelines
          </li>
        </ul>
        <p>
          We currently do not ship to international addresses. Please refer to
          Section 15 for further details.
        </p>
      </section>

      <section id="processing">
        <h2>3. Order Processing</h2>
        <p>
          Once an order is successfully placed and payment is confirmed (or the
          COD advance is paid, as applicable), the order undergoes the following
          stages:
        </p>
        <ol>
          <li>
            <strong>Order confirmation</strong> — issued via WhatsApp, SMS, or
            email within a few hours of order placement
          </li>
          <li>
            <strong>Order processing</strong> — your order is picked, packed,
            and quality-checked at our facility, typically within 1–2 business
            days
          </li>
          <li>
            <strong>Dispatch</strong> — the order is handed over to our
            logistics partner. You will receive a tracking ID at this stage.
          </li>
          <li>
            <strong>In transit</strong> — the parcel moves through the courier's
            network
          </li>
          <li>
            <strong>Out for delivery</strong> — the courier's delivery agent
            attempts delivery to your address
          </li>
          <li>
            <strong>Delivered</strong> — the parcel is handed over to you or an
            authorised recipient at the address
          </li>
        </ol>
        <p>
          Business days exclude Sundays and public holidays observed in
          Maharashtra, India. Orders placed on Sundays, public holidays, or
          after 5:00 PM IST on business days are considered received the
          following business day for processing purposes.
        </p>
      </section>

      <section id="delivery-types">
        <h2>4. Delivery Options</h2>
        <p>
          Depending on your location and the products in your order, the
          following delivery options may be available:
        </p>

        <h3>4.1 Standard Delivery</h3>
        <p>
          Standard delivery is the default option and is fulfilled through our
          regular courier network. It is complimentary on orders meeting the
          applicable minimum cart value as displayed at checkout.
        </p>

        <h3>4.2 Express / Priority Delivery</h3>
        <p>
          Express delivery is available on select pincodes for customers who
          require faster turnaround. An additional charge is applicable, as
          displayed at checkout.
        </p>

        <h3>4.3 Cash on Delivery (COD)</h3>
        <p>
          COD is available on select pincodes for orders meeting the applicable
          cart value threshold. A non-refundable advance payment of ₹99 may be
          applicable to confirm COD orders, as detailed in our{" "}
          <a href="/refund">Refund &amp; Cancellation Policy</a>.
        </p>
      </section>

      <section id="timelines">
        <h2>5. Delivery Timelines</h2>
        <p>
          Estimated delivery timelines are provided below. These are working
          estimates based on courier network performance and may vary based on
          your specific location, weather, regional disruptions, or other
          factors beyond our control.
        </p>

        <table className="legal-table">
          <thead>
            <tr>
              <th>Delivery Type</th>
              <th>Estimated Time (Business Days)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Standard Delivery (Metro cities)</td>
              <td>3–5 days</td>
            </tr>
            <tr>
              <td>Standard Delivery (Non-Metro cities)</td>
              <td>5–7 days</td>
            </tr>
            <tr>
              <td>Standard Delivery (Remote / North-East / J&amp;K)</td>
              <td>7–12 days</td>
            </tr>
            <tr>
              <td>Express Delivery (where available)</td>
              <td>2–5 days</td>
            </tr>
            <tr>
              <td>Cash on Delivery</td>
              <td>5–10 days</td>
            </tr>
          </tbody>
        </table>

        <p>
          Timelines are calculated from the date of dispatch, not the date of
          order placement. Total delivery time is the sum of order processing
          time (1–2 business days) and the in-transit time shown above.
        </p>

        <div className="legal-note">
          <p>
            <strong>Important:</strong> Delivery timelines are estimates and not
            guarantees. We are not liable for delays caused by courier partners,
            regional restrictions, natural calamities, strikes, government
            action, or other circumstances beyond our reasonable control. Refer
            to Section 12 for our policy on shipping delays.
          </p>
        </div>
      </section>

      <section id="charges">
        <h2>6. Shipping Charges</h2>
        <p>
          Shipping charges are calculated automatically at checkout based on
          your cart value, delivery type, and destination. The applicable charge
          is displayed clearly before you confirm your order.
        </p>

        <h3>6.1 Standard Delivery Charges</h3>
        <table className="legal-table">
          <thead>
            <tr>
              <th>Order Value</th>
              <th>Standard Delivery</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Below ₹399</td>
              <td>Free (subject to applicable cart minimum)</td>
            </tr>
            <tr>
              <td>₹399 – ₹599</td>
              <td>Free</td>
            </tr>
            <tr>
              <td>₹599 – ₹799</td>
              <td>₹49 (small handling fee)</td>
            </tr>
            <tr>
              <td>Above ₹799</td>
              <td>Bulk-order handling fee (calculated at checkout)</td>
            </tr>
          </tbody>
        </table>

        <h3>6.2 Express Delivery Charges</h3>
        <p>
          Express delivery is available at an additional charge of ₹119 (or a
          percentage of the order value for high-value orders), as calculated
          and displayed at checkout.
        </p>

        <h3>6.3 Other Charges</h3>
        <ul>
          <li>
            <strong>Gift wrap:</strong> ₹15 (optional, selected at checkout)
          </li>
          <li>
            <strong>COD advance:</strong> ₹99 non-refundable (adjusted against
            the order total at delivery; refer to Section 14)
          </li>
        </ul>
        <p>
          All charges displayed are inclusive of applicable taxes unless stated
          otherwise. We reserve the right to revise shipping charges at any time
          without prior notice. The charges applicable to a given order are
          those displayed at the time of order confirmation.
        </p>
      </section>

      <section id="partners">
        <h2>7. Logistics Partners</h2>
        <p>
          We work with reputable Indian logistics providers to ensure your order
          reaches you safely. Our current shipping partners include:
        </p>
        <ul>
          <li>India Post (Speed Post / Registered Post)</li>
          <li>Delhivery</li>
          <li>Other regional and last-mile delivery providers as required</li>
        </ul>
        <p>
          The choice of courier partner for a given order is at our sole
          discretion and is based on factors such as destination pincode, parcel
          size, product type, and courier availability. While in transit, your
          parcel is subject to the terms and service standards of the assigned
          courier.
        </p>
      </section>

      <section id="tracking">
        <h2>8. Order Tracking</h2>
        <p>
          Once your order is dispatched, you will receive a tracking ID (also
          called Shipping ID, AWB number, or Consignment Number) via WhatsApp,
          SMS, or email. You may use this ID to track the live status of your
          shipment through:
        </p>
        <ul>
          <li>
            The order tracking page on our Website at{" "}
            <a href="https://thebookx.in/profile">
              https://thebookx.in/profile
            </a>
          </li>
          <li>
            The respective courier partner's website (e.g.{" "}
            <a href="https://www.indiapost.gov.in">www.indiapost.gov.in</a> for
            India Post)
          </li>
          <li>WhatsApp updates from our support team upon request</li>
        </ul>
        <p>
          Tracking information typically becomes available within 24 hours of
          dispatch. If your tracking ID does not show any movement for more than
          48 hours, please contact us so we can follow up with the courier.
        </p>
      </section>

      <section id="address-policy">
        <h2>9. Delivery Address &amp; Accuracy</h2>
        <p>
          It is your responsibility to provide a complete, accurate, and
          reachable delivery address, including:
        </p>
        <ul>
          <li>Full name of the recipient</li>
          <li>
            Complete street address with house / flat number, building name,
            area, and landmark
          </li>
          <li>Correct city, district, state, and pincode</li>
          <li>A valid Indian mobile number reachable during delivery hours</li>
        </ul>
        <p>
          Address changes after dispatch are generally not possible. If a parcel
          cannot be delivered due to incorrect, incomplete, or unreachable
          address information, the parcel may be returned to us, and the
          following shall apply:
        </p>
        <ul>
          <li>
            <strong>Prepaid orders:</strong> a refund will be issued after
            deducting forward and return shipping costs actually incurred
          </li>
          <li>
            <strong>COD orders:</strong> the ₹99 advance payment shall be
            forfeited as it covers initial shipping and handling
          </li>
        </ul>
      </section>

      <section id="attempts">
        <h2>10. Delivery Attempts</h2>
        <p>
          Our logistics partners typically make up to{" "}
          <strong>2–3 delivery attempts</strong> on consecutive working days.
          Before each attempt:
        </p>
        <ul>
          <li>
            The delivery agent may contact you on the registered mobile number
          </li>
          <li>
            For COD orders, the delivery agent will require the balance amount
            to be paid in cash at the time of delivery
          </li>
          <li>
            An OTP or signature may be required for confirmation of receipt
          </li>
        </ul>
        <p>
          If all delivery attempts fail (due to the recipient being unavailable,
          the address being inaccessible, or COD payment being refused), the
          parcel will be returned to us as undeliverable. In such cases, the
          terms set out in Section 9 shall apply.
        </p>
      </section>

      <section id="packaging">
        <h2>11. Packaging &amp; Inspection on Delivery</h2>
        <p>
          All orders are securely packaged in protective wrapping to minimise
          the risk of transit damage. Gift-wrapped orders include additional
          protective layers along with the gift packaging.
        </p>
        <div className="legal-note">
          <p>
            <strong>We strongly recommend recording an unboxing video</strong>{" "}
            while opening your parcel. In the event of a missing, damaged, or
            tampered product, an unboxing video is the most reliable form of
            evidence and is required to process certain claims (refer to our{" "}
            <a href="/refund">Refund &amp; Cancellation Policy</a>).
          </p>
        </div>
        <p>Upon receipt of your parcel:</p>
        <ul>
          <li>Inspect the outer packaging before accepting delivery</li>
          <li>
            If the outer packaging appears damaged, tampered, or has been
            opened, you may refuse delivery and contact us immediately
          </li>
          <li>
            Once accepted, inspect the contents within 24 hours and report any
            issues as set out in our Refund &amp; Cancellation Policy
          </li>
        </ul>
      </section>

      <section id="delays">
        <h2>12. Shipping Delays</h2>
        <p>
          While we and our courier partners make every effort to deliver your
          order within the estimated timelines, delays may occur due to factors
          beyond our reasonable control, including but not limited to:
        </p>
        <ul>
          <li>
            Severe weather, natural calamities, or environmental disruptions
          </li>
          <li>
            Civil unrest, strikes, or labour disputes affecting courier
            operations
          </li>
          <li>Government-imposed restrictions, curfews, or lockdowns</li>
          <li>Festive season volume surges</li>
          <li>Pincode-specific or regional courier delays</li>
          <li>Incorrect, incomplete, or unreachable delivery details</li>
          <li>
            Failure of the recipient to respond to the courier's contact
            attempts
          </li>
        </ul>
        <p>
          In the event of an extended delay, we will keep you informed and
          coordinate with the courier to expedite the delivery. We do not accept
          liability for any indirect or consequential losses arising from
          shipping delays.
        </p>
      </section>

      <section id="lost-damaged">
        <h2>13. Lost or Damaged Shipments</h2>
        <p>
          In the rare event that your shipment is lost in transit or delivered
          in a damaged condition:
        </p>

        <h3>13.1 Lost Shipments</h3>
        <p>
          If your order is marked as "delivered" by the courier but you have not
          received it, please notify us within{" "}
          <strong>48 hours of the marked delivery time</strong>. We will
          coordinate with the courier partner to investigate the matter.
          Investigations typically take 5–7 business days.
        </p>
        <p>
          If the courier confirms the parcel is lost in transit, we will, at
          your option, either:
        </p>
        <ul>
          <li>Issue a full refund to the original payment method, or</li>
          <li>Dispatch a replacement shipment at no additional cost</li>
        </ul>

        <h3>13.2 Damaged Shipments</h3>
        <p>
          If you receive a parcel in damaged condition, please notify us within{" "}
          <strong>24 hours of delivery</strong> with clear photographs and
          (where available) an unboxing video. The procedure thereafter is set
          out in our <a href="/refund">Refund &amp; Cancellation Policy</a>.
        </p>
      </section>

      <section id="cod-shipping">
        <h2>14. Cash on Delivery Orders</h2>
        <p>
          Cash on Delivery is available on select pincodes and is subject to the
          following terms:
        </p>
        <ul>
          <li>
            A non-refundable advance payment of <strong>₹99</strong> is
            applicable at the time of order placement to confirm the COD order.
            This advance covers packing, processing, and forward shipping costs.
          </li>
          <li>
            The balance amount (Total Order Value − ₹99) is to be paid in cash
            to the delivery agent at the time of delivery.
          </li>
          <li>
            COD orders may take an additional 1–2 business days for processing
            compared to prepaid orders.
          </li>
          <li>
            COD is not available for high-value orders, certain promotional
            items, or pincodes flagged as non-COD by our logistics partners.
            Eligibility is confirmed at checkout.
          </li>
          <li>
            If a COD order is refused at the time of delivery without a valid
            reason, the ₹99 advance is forfeited (refer to Section 9).
          </li>
        </ul>
      </section>

      <section id="international-shipping">
        <h2>15. International Shipping</h2>
        <p>
          We currently do <strong>not</strong> offer international shipping and
          ship only to addresses within India. For any inquiry regarding bulk or
          international orders, please contact us at{" "}
          <a href="mailto:support@thebookx.in">support@thebookx.in</a> and we
          will assess feasibility on a case-by-case basis.
        </p>
      </section>

      <section id="grievance-shipping">
        <h2>16. Grievance Redressal</h2>
        <p>
          For any shipping-related grievance, please first contact our customer
          support team using the channels listed in Section 18. Unresolved
          complaints may be escalated to our designated Grievance Officer:
        </p>

        <div className="legal-card">
          <h3 className="legal-card-title">Grievance Officer</h3>
          <dl>
            <dt>Name</dt>
            <dd>Murthy Poothapandi Thevar</dd>

            <dt>Designation</dt>
            <dd>Proprietor &amp; Grievance Officer</dd>

            <dt>Email</dt>
            <dd>
              <a href="mailto:support@thebookx.in">support@thebookx.in</a>
            </dd>

            <dt>Phone / WhatsApp</dt>
            <dd>
              <a href="https://wa.me/917710892108">+91 77108 92108</a>
            </dd>

            <dt>Address</dt>
            <dd>
              Room No 107, A Wing, Thevar Suryoodaya CHS, UM Thevar Marg, Sion
              Mahim Link Road, Dharavi, Mumbai, Maharashtra 400017, India
            </dd>

            <dt>Acknowledgement</dt>
            <dd>Within 48 hours of receipt</dd>

            <dt>Resolution Target</dt>
            <dd>Within 30 days of receipt of complaint</dd>
          </dl>
        </div>

        <p>
          Unresolved complaints may be further escalated to the appropriate
          Consumer Disputes Redressal Forum under the Consumer Protection Act,
          2019, or to the National Consumer Helpline (1800-11-4000 /{" "}
          <a href="https://consumerhelpline.gov.in">consumerhelpline.gov.in</a>
          ).
        </p>
      </section>

      <section id="changes-shipping">
        <h2>17. Changes to This Policy</h2>
        <p>
          We reserve the right to modify, amend, or update this Shipping &amp;
          Delivery Policy at any time, at our sole discretion. Any changes will
          be effective immediately upon being posted on the Website with a
          revised "Effective Date". The Policy applicable to a given order is
          the Policy in effect at the time of order placement.
        </p>
      </section>

      <div className="legal-disclaimer">
        <p>
          By placing an order on TheBookX, you confirm that you have read,
          understood, and agree to be bound by this Shipping &amp; Delivery
          Policy. This Policy forms an integral part of our Terms &amp;
          Conditions and must be read in conjunction with them.
        </p>
      </div>
    </main>
  );
}
