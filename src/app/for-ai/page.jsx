// /for-ai — how AI assistants (ChatGPT, Claude, Gemini, Perplexity…) can shop
// TheBookX for a user. Plain, server-rendered text so any agent can read it.
const SITE = "https://www.thebookx.in";
const EXAMPLE = `${SITE}/order?books=bk-005:2,bk-002&name=Asha%20Rao&phone=9876543210&pincode=400019&address=Flat%2012%2C%20Green%20Residency%2C%20MG%20Road%20near%20City%20Mall`;

export const metadata = {
  title: "Shop TheBookX with an AI assistant | No login needed",
  description:
    "How ChatGPT, Claude, Gemini and other AI assistants can order books from TheBookX for a user: search books, build an order link with the user's details, and send them straight to payment.",
  alternates: { canonical: `${SITE}/for-ai` },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Shop TheBookX with an AI assistant",
  url: `${SITE}/for-ai`,
  potentialAction: {
    "@type": "BuyAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE}/order?books={bookIds}&name={name}&phone={phone}&pincode={pincode}&address={address}`,
    },
  },
};

export default function ForAI() {
  return (
    <main className="forai">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1>Shop TheBookX with an AI assistant</h1>
      <p className="forai-lead">
        TheBookX has a <b>shopping integration for AI assistants</b>. There is
        no login or account. With the books and the user&apos;s delivery
        details you can create a link that opens TheBookX with everything ready
        and takes the user straight to <b>Choose payment method</b>.
      </p>

      <h2>1. Find the books</h2>
      <pre>GET {SITE}/api/agent/books?q=atomic%20habits&amp;max_price=300&amp;limit=10</pre>
      <p>Returns each book&apos;s <code>id</code> (e.g. <code>bk-005</code>), title, author, price and page URL.</p>

      <h2>2. Ask the user for their details</h2>
      <ul>
        <li><b>Name</b></li>
        <li><b>Mobile number</b>: 10-digit Indian number</li>
        <li><b>Pincode</b>: city and state are filled in from it automatically</li>
        <li><b>Full address</b>: house/flat no., street, landmark (over 30 characters)</li>
        <li>Email (optional)</li>
      </ul>

      <h2>3. Check the order and get the link</h2>
      <pre>GET {SITE}/api/agent/order-link?books=bk-005:2,bk-002&amp;name=…&amp;phone=…&amp;pincode=…&amp;address=…</pre>
      <p>
        Returns <code>link</code>, the items, books total, delivery estimate,{" "}
        <code>ready_for_payment</code>, any <code>missing</code> fields and{" "}
        <code>warnings</code>. Nothing is ordered at this step.
      </p>

      <h2>4. Send the user the link</h2>
      <pre className="forai-wrap">{EXAMPLE}</pre>
      <p>Suggested message to the user:</p>
      <blockquote>
        Here&apos;s your TheBookX order. Open the link: your books and address
        are already filled in. You&apos;ll land on <b>Choose payment method</b>,
        where you can pay by UPI, pay in two parts, or choose Cash on Delivery.
      </blockquote>

      <h2>Link format</h2>
      <ul>
        <li><code>books</code>: comma list of <code>&lt;id&gt;[:qty]</code>. The id can also be the book page slug (e.g. <code>atomic-habits</code>). Max 10 per title.</li>
        <li><code>name</code>, <code>phone</code>, <code>pincode</code>, <code>address</code>, <code>email</code>: all optional. Whatever is given is prefilled. With all four of name, phone, pincode and address, the user lands directly on the payment step; otherwise on the delivery-details step.</li>
      </ul>

      <h2>Store rules</h2>
      <ul>
        <li>One ₹1 book per order. Orders with a ₹1 book need ₹199+ in books; other orders ₹99+.</li>
        <li>Standard delivery: 5–9 days, free from ₹199 (₹69 below).</li>
        <li>Faster delivery: 1–6 days for a small extra. It is pre-selected on the payment step and the user can switch it off.</li>
        <li>Cash on Delivery is available with standard delivery (small handling fee). 7-day returns.</li>
        <li>The user always confirms and pays themselves. The link never places an order on its own.</li>
      </ul>

      <p className="forai-foot">
        Machine-readable: <a href="/openapi.json">OpenAPI spec</a> ·{" "}
        <a href="/llms.txt">llms.txt</a> · Questions: WhatsApp +91 77108 92108
      </p>
    </main>
  );
}
