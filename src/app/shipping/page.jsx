"use client";

export default function ShippingPolicy() {
  return (
    <main className="terms-page section-1200">
      <h1 className="font-24 weight-700">Shipping & Delivery Policy</h1>

      {/* <p className="font-14 dark-50">
        Last updated: {new Date().toLocaleDateString()}
      </p> */}

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
        <p className="processing-note">
          <strong>Note:</strong> For Quick Delivery orders, processing begins
          immediately after order confirmation. Cancellation requests for Quick
          Delivery orders will only be accepted within{" "}
          <strong>5 minutes</strong> of placing the order. After that, the order
          is handed over to the delivery partner and cannot be cancelled.
        </p>
      </section>

      <section>
        <h2>5. Delivery Address</h2>
        <p>
          Customers are responsible for providing accurate delivery address and
          contact details. TheBookX will not be responsible for delays or failed
          deliveries caused by incorrect information provided by the customer.
        </p>
        <p>
          <strong>Address Change Policy:</strong> Address change requests must
          be made within <strong>10 minutes</strong> of order placement. After
          this window, the order is processed and cannot be modified.
        </p>
      </section>

      <section>
        <h2>6. Delivery Confirmation</h2>
        <p>
          Once the order is delivered, customers are advised to inspect the
          package immediately as per our Refund & Return Policy. Any issues must
          be reported within <strong>5 minutes</strong> of package opening.
        </p>
      </section>

      <section>
        <h2>7. Failed Delivery Attempts</h2>
        <p>
          If a delivery fails due to the customer being unavailable or incorrect
          address details, the following will apply:
        </p>
        <ul>
          <li>
            <strong>For COD Orders:</strong> The advance payment (if any) will
            be forfeited as a cancellation fee.
          </li>
          <li>
            <strong>For Prepaid Orders (UPI/Card/Net Banking):</strong> A refund
            will be issued after deducting the shipping and handling charges.
            The refund will be processed within 5-7 working days.
          </li>
          <li>
            <strong>Re-delivery:</strong> Re-delivery attempts will be made only
            after additional shipping charges are paid by the customer.
          </li>
        </ul>
      </section>

      <section>
        <h2>8. Service Areas</h2>
        <p>
          Delivery services are currently available in selected cities and
          surrounding areas. Availability may change without prior notice.
        </p>
        <p>
          To check if we deliver to your location, please contact our support
          team before placing an order.
        </p>
      </section>

      <section>
        <h2>9. Shipping Restrictions</h2>
        <p>
          Certain products may have shipping restrictions based on size, weight,
          or delivery location. Such restrictions will be clearly mentioned on
          the product page.
        </p>
      </section>

      <section>
        <h2>10. Contact Information</h2>
        <p>
          For any shipping or delivery related queries, please contact us at:
        </p>
        <p>
          📧 Email: murthyofficial3@gmail.com <br />
          📞 Phone / WhatsApp: +91 7977960242
        </p>
      </section>

      <p className="note">
        By placing an order on TheBookX, you agree to this Shipping &amp;
        Delivery Policy.
      </p>
    </main>
  );
}
