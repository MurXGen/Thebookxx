import Link from "next/link";
// Shared building blocks for the policy pages. Server components (no hooks),
// so the pages can export `metadata` and render as static HTML.
import { BUSINESS, GRIEVANCE, SUPPORT, mailto } from "@/lib/policy";

/** "At a glance" summary cards shown at the top of each policy page. */
export function LegalGlance({ title = "At a glance", items }) {
  return (
    <section className="legal-glance" aria-label={title}>
      <h2>{title}</h2>
      <div className="contact-topics-grid">
        {items.map(({ icon: Icon, title: t, text }) => (
          <div className="contact-topic" key={t}>
            {Icon ? <Icon size={18} className="contact-topic-icon" /> : null}
            <div>
              <span className="contact-topic-title">{t}</span>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Table of contents. `sections` = [{ id, label }]. */
export function LegalToc({ sections }) {
  return (
    <nav className="legal-toc" aria-label="On this page">
      <h2 className="legal-toc-title">On this page</h2>
      <ul className="legal-toc-list">
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`}>{s.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Business identity + contact details (E-Commerce Rules 2020, Rule 4(1)). */
export function BusinessCard() {
  return (
    <div className="legal-card">
      <h3 className="legal-card-title">Business information</h3>
      <dl>
        <dt>Trade name</dt>
        <dd>
          {BUSINESS.tradeName} (formerly {BUSINESS.formerName})
        </dd>
        <dt>Business type</dt>
        <dd>{BUSINESS.type}</dd>
        <dt>Udyam registration</dt>
        <dd>{BUSINESS.udyam}</dd>
        {BUSINESS.gstin ? (
          <>
            <dt>GSTIN</dt>
            <dd>{BUSINESS.gstin}</dd>
          </>
        ) : null}
        <dt>Registered address</dt>
        <dd>
          {BUSINESS.address ? `${BUSINESS.address}, ` : ""}
          {BUSINESS.city}
        </dd>
        <dt>Email</dt>
        <dd>
          <a href={mailto}>{SUPPORT.email}</a>
        </dd>
        <dt>WhatsApp / Phone</dt>
        <dd>
          <a href={SUPPORT.whatsapp}>{SUPPORT.phoneDisplay}</a>
        </dd>
        <dt>Support hours</dt>
        <dd>{SUPPORT.hoursWeekday}</dd>
      </dl>
    </div>
  );
}

/** Grievance Officer block (E-Commerce Rules 2020; IT Rules 2011, Rule 5(9)). */
export function GrievanceCard() {
  return (
    <div className="legal-card">
      <h3 className="legal-card-title">Grievance Officer</h3>
      <dl>
        {GRIEVANCE.name ? (
          <>
            <dt>Name</dt>
            <dd>{GRIEVANCE.name}</dd>
          </>
        ) : null}
        <dt>Designation</dt>
        <dd>{GRIEVANCE.designation}</dd>
        <dt>Email</dt>
        <dd>
          <a href={`${mailto}?subject=Grievance`}>{SUPPORT.email}</a>{" "}
          (subject: &ldquo;Grievance&rdquo;)
        </dd>
        <dt>Phone / WhatsApp</dt>
        <dd>
          <a href={SUPPORT.whatsapp}>{SUPPORT.phoneDisplay}</a>
        </dd>
        <dt>Address</dt>
        <dd>
          {BUSINESS.address ? `${BUSINESS.address}, ` : ""}
          {BUSINESS.city}
        </dd>
        <dt>Response time</dt>
        <dd>
          Acknowledged within {GRIEVANCE.acknowledgeWithin}, resolved within{" "}
          {GRIEVANCE.resolveWithin}
        </dd>
      </dl>
    </div>
  );
}

export const legalLinks = (
  <>
    <Link href="/terms">Terms &amp; Conditions</Link>,{" "}
    <Link href="/privacy">Privacy Policy</Link>,{" "}
    <Link href="/refund">Refund &amp; Cancellation Policy</Link> and{" "}
    <Link href="/shipping">Shipping &amp; Delivery Policy</Link>
  </>
);
