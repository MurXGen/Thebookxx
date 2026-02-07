"use client";

export default function ShippingPolicy() {
  return (
    <main className="terms-page section-1200">
      <h1 className="font-24 weight-700">Shipping & Delivery Policy</h1>

      <p className="font-14 dark-50">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <section>
        <h2>1. Delivery Options</h2>
        <p>TheBookX provides two types of delivery services:</p>
        <ul>
          <li>
            <strong>Quick Delivery (Express Delivery):</strong> Delivered within
            approximately <strong>30 to 60 minutes</strong> through third-party
            delivery partners such as Porter, Rapido, or similar courier
            services.
          </li>
          <li>
            <strong>Standard Delivery:</strong> Orders are shipped within{" "}
            <strong>1 to 2 working days</strong> and delivered within{" "}
            <strong>4 to 6 working days</strong>.
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Quick Delivery Disclaimer</h2>
        <p>
          Quick Delivery is dependent on availability of third-party delivery
          partners. While we aim to deliver within 30 to 60 minutes, delays may
          occur due to:
        </p>
        <ul>
          <li>Traffic conditions</li>
          <li>Weather conditions</li>
          <li>Delivery partner availability</li>
          <li>Operational or technical issues</li>
        </ul>
        <p>
          In case of such delays, TheBookX shall not be held responsible for
          slight delays caused by third-party delivery services.
        </p>
      </section>

      <section>
        <h2>3. Shipping Charges</h2>
        <p>
          Shipping charges (if any) will be displayed at the time of checkout.
          Quick Delivery may include an additional delivery fee depending on the
          delivery location.
        </p>
      </section>

      <section>
        <h2>4. Order Processing Time</h2>
        <p>
          Orders are processed within 1 to 2 working days after successful
          payment confirmation.
        </p>
      </section>

      <section>
        <h2>5. Delivery Address</h2>
        <p>
          Customers are responsible for providing accurate delivery address and
          contact details. TheBookX will not be responsible for delays or failed
          deliveries caused by incorrect information provided by the customer.
        </p>
      </section>

      <section>
        <h2>6. Delivery Confirmation</h2>
        <p>
          Once the order is delivered, customers are advised to inspect the
          package immediately as per our Refund & Return Policy.
        </p>
      </section>

      <section>
        <h2>7. Service Areas</h2>
        <p>
          Delivery services are currently available in selected cities and
          surrounding areas. Availability may change without prior notice.
        </p>
      </section>

      <section>
        <h2>8. Contact Information</h2>
        <p>
          For any shipping or delivery related queries, please contact us at:
        </p>
        <p>
          📧 Email: murthyofficial3@gmail.com <br />
          📞 Phone / WhatsApp: +91 7977960242
        </p>
      </section>

      <p className="note">
        By placing an order on TheBookX, you agree to this Shipping & Delivery
        Policy.
      </p>
    </main>
  );
}
