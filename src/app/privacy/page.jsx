"use client";

export default function PrivacyPolicy() {
  return (
    <main className="terms-page section-1200">
      <h1 className="font-24 weight-700">Privacy Policy</h1>

      <p className="font-14 dark-50">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <section>
        <h2>1. Information We Collect</h2>
        <p>
          We collect basic personal information required to process your order,
          including:
        </p>
        <ul>
          <li>Name</li>
          <li>Phone number</li>
          <li>Delivery address</li>
          <li>City and pincode</li>
        </ul>
      </section>

      <section>
        <h2>2. How We Use Your Information</h2>
        <p>Your information is used strictly for:</p>
        <ul>
          <li>Processing and delivering your order</li>
          <li>Customer support and communication</li>
          <li>Order confirmation and updates</li>
        </ul>
      </section>

      <section>
        <h2>3. Data Protection</h2>
        <p>
          TheBookX ensures that all customer data is stored securely and is not
          shared, sold, rented, or disclosed to any third party except as
          required for order fulfillment and payment processing.
        </p>
      </section>

      <section>
        <h2>4. Payment Security</h2>
        <p>
          All payments made on TheBookX are processed through trusted and secure
          third-party payment gateways such as PhonePe, UPI, and other
          authorized providers.
        </p>
        <p>
          We do not store your card details, UPI PIN, or banking information on
          our servers.
        </p>
      </section>

      <section>
        <h2>5. Third-Party Services</h2>
        <p>
          We may use third-party services for payment processing and delivery.
          These services have their own privacy policies and security standards.
        </p>
      </section>

      <section>
        <h2>6. Cookies</h2>
        <p>
          TheBookX may use cookies or local storage to improve user experience,
          such as saving delivery details for faster checkout. These do not
          collect sensitive personal information.
        </p>
      </section>

      <section>
        <h2>7. User Consent</h2>
        <p>
          By using our website and placing an order, you consent to the
          collection and use of your information as described in this Privacy
          Policy.
        </p>
      </section>

      <section>
        <h2>8. Data Retention</h2>
        <p>
          Customer data is retained only as long as necessary to fulfill orders
          and comply with legal obligations.
        </p>
      </section>

      <section>
        <h2>9. Policy Updates</h2>
        <p>
          TheBookX may update this Privacy Policy from time to time. Any changes
          will be reflected on this page.
        </p>
      </section>

      <section>
        <h2>10. Contact Information</h2>
        <p>
          If you have any questions about this Privacy Policy or your data,
          please contact us:
        </p>
        <p>
          📧 Email: murthyofficial3@gmail.com <br />
          📞 Phone / WhatsApp: +91 7977960242
        </p>
      </section>

      <p className="note">
        By using TheBookX, you agree to this Privacy Policy.
      </p>
    </main>
  );
}
