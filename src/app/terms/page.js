"use client";

export default function TermsAndConditions() {
  return (
    <main className="terms-page section-1200">
      <h1 className="font-24 weight-700">Terms & Conditions</h1>

      <p className="font-14 dark-50">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <section>
        <h2>1. About Us</h2>
        <p>
          TheBookX (thebookx.in) is an online platform for purchasing books and
          educational materials. By accessing or using this website, you agree
          to comply with and be bound by these Terms and Conditions.
        </p>
      </section>

      <section>
        <h2>2. Data & Privacy</h2>
        <p>
          We collect only the necessary information required to process your
          orders such as name, address, city, pincode, and contact number. Your
          information is used strictly for order fulfillment and customer
          support. We do not sell or share your personal data with third parties
          except payment and delivery partners.
        </p>
      </section>

      <section>
        <h2>3. Ordering Process</h2>
        <p>
          Orders can be placed through our website and confirmed via WhatsApp or
          online payment. Once payment is successfully completed, your order
          will be processed within 1–2 working days.
        </p>
        <p>
          Delivery typically takes 3–7 working days depending on your location
          and courier availability.
        </p>
      </section>

      <section>
        <h2>4. Pricing & Payments</h2>
        <p>
          All prices listed on the website are in Indian Rupees (INR). Payments
          are processed securely through authorized payment gateways such as
          PhonePe, UPI, or other supported providers. We do not store any card
          or UPI details on our servers.
        </p>
      </section>

      <section>
        <h2>5. Delivery & Inspection</h2>
        <p>
          Upon receiving your order, please inspect it immediately. If the book
          is damaged, missing, or incorrect, you must notify us within 24 hours
          of delivery with clear images or an unboxing video for verification.
        </p>
      </section>

      <section>
        <h2>6. Refund & Return Policy</h2>
        <p>Refunds or returns are applicable only in the following cases:</p>
        <ul>
          <li>Damaged product received</li>
          <li>Wrong product delivered</li>
          <li>Product missing from the order</li>
        </ul>
        <p>
          Books must be returned in their original unused condition. Used or
          damaged items after delivery may not be eligible for refund or
          replacement.
        </p>
      </section>

      <section>
        <h2>7. Refund Processing</h2>
        <p>
          Once the returned book is received and verified, the refund will be
          processed to the original payment method within 5–7 working days.
        </p>
      </section>

      <section>
        <h2>8. Cancellation Policy</h2>
        <p>
          Orders can be cancelled only before they are shipped. Once shipped,
          cancellation requests will not be accepted.
        </p>
      </section>

      <section>
        <h2>9. User Responsibilities</h2>
        <p>
          You agree to provide accurate delivery details and contact
          information. Any delay or failure in delivery due to incorrect
          information will be the customer’s responsibility.
        </p>
      </section>

      <section>
        <h2>10. Limitation of Liability</h2>
        <p>
          TheBookX shall not be responsible for any indirect, incidental, or
          consequential damages arising from the use of our services. Our
          maximum liability is limited to the amount paid for the product.
        </p>
      </section>

      <section>
        <h2>11. Governing Law</h2>
        <p>
          These Terms and Conditions shall be governed by and interpreted in
          accordance with the laws of India. Any disputes shall be subject to
          the jurisdiction of Mumbai, Maharashtra.
        </p>
      </section>

      <section>
        <h2>12. Contact Information</h2>
        <p>
          For any questions regarding orders or these Terms, you can contact us
          at:
        </p>
        <p>
          📧 Email: murthyofficial3@gmail.com <br />
          📞 Phone: +91 7977960242
        </p>
      </section>

      <p className="note">
        By using our website or placing an order, you agree to these Terms and
        Conditions.
      </p>
    </main>
  );
}
