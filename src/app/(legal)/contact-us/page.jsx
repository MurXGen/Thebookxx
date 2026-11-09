import Link from "next/link";

import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Building2,
  FileText,
  ShieldCheck,
  Package,
  Truck,
  Wallet,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { SUPPORT, mailto } from "@/lib/policy";
import { BusinessCard, GrievanceCard } from "@/components/legal/LegalBits";

export const metadata = {
  title: "Contact Us",
  description:
    "Talk to TheBookX on WhatsApp, phone or email. Order help, delivery, refunds, privacy requests and our Grievance Officer's details.",
  alternates: { canonical: "https://www.thebookx.in/contact-us" },
};

export default function ContactUs() {
  return (
    <main className="legal-page">
      {/* Header */}
      <div className="legal-header">
        <h1>Contact Us</h1>
        <div className="legal-header-meta">
          <p className="legal-intro">
            We&apos;re here to help. Whether you have a question about an order, a
            product, a return, or a general inquiry, our customer support team
            is available through the channels listed below. We aim to respond to
            all queries within one business day.
          </p>
        </div>
      </div>

      {/* Primary contact methods, visual grid */}
      <section id="contact-channels">
        <h2>Get In Touch</h2>

        <div className="contact-grid">
          {/* WhatsApp */}
          <a
            href="https://wa.me/917710892108?text=Hi%2C%20I%20need%20help%20with%20my%20order%20from%20TheBookX"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card-link"
          >
            <div className="contact-card-icon contact-icon-whatsapp">
              <FaWhatsapp size={22} />
            </div>
            <div className="contact-card-body">
              <span className="contact-card-title">WhatsApp</span>
              <span className="contact-card-value">+91 77108 92108</span>
              <span className="contact-card-meta">
                Fastest response · Mon–Sat, 10 AM–7 PM
              </span>
            </div>
          </a>

          {/* Email */}
          <a href={mailto} className="contact-card-link">
            <div className="contact-card-icon contact-icon-email">
              <Mail size={20} />
            </div>
            <div className="contact-card-body">
              <span className="contact-card-title">Email</span>
              <span className="contact-card-value">{SUPPORT.email}</span>
              <span className="contact-card-meta">
                Reply within 1 business day
              </span>
            </div>
          </a>

          {/* Phone */}
          <a href="tel:+917710892108" className="contact-card-link">
            <div className="contact-card-icon contact-icon-phone">
              <Phone size={20} />
            </div>
            <div className="contact-card-body">
              <span className="contact-card-title">Phone</span>
              <span className="contact-card-value">+91 77108 92108</span>
              <span className="contact-card-meta">
                Mon–Sat, 10 AM–7 PM IST
              </span>
            </div>
          </a>
        </div>
      </section>

      {/* Support hours */}
      <section id="support-hours">
        <h2>Support Hours</h2>
        <table className="legal-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Hours (IST)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Monday–Saturday</td>
              <td>10:00 AM–7:00 PM</td>
            </tr>
            <tr>
              <td>Sunday &amp; Public Holidays</td>
              <td>Closed</td>
            </tr>
          </tbody>
        </table>
        <p>
          Messages received outside of support hours will be addressed on the
          next business day. We observe public holidays as recognised in
          Maharashtra, India.
        </p>
      </section>

      {/* What to contact us about */}
      <section id="what-to-contact">
        <h2>What Can We Help With?</h2>
        <p>
          To help us respond to your query as quickly as possible, please share
          your <strong>Order ID</strong> (where applicable) and a brief
          description of the issue.
        </p>

        <div className="contact-topics-grid">
          <div className="contact-topic">
            <Package size={18} className="contact-topic-icon" />
            <div>
              <span className="contact-topic-title">Order Status</span>
              <p>Where is my order? When will it ship?</p>
            </div>
          </div>

          <div className="contact-topic">
            <Truck size={18} className="contact-topic-icon" />
            <div>
              <span className="contact-topic-title">Delivery Issues</span>
              <p>
                Delayed, missing, or damaged shipment, see our{" "}
                <Link href="/shipping">Shipping Policy</Link>
              </p>
            </div>
          </div>

          <div className="contact-topic">
            <Wallet size={18} className="contact-topic-icon" />
            <div>
              <span className="contact-topic-title">Refunds &amp; Returns</span>
              <p>
                Cancellations, refunds, returns, see our{" "}
                <Link href="/refund">Refund Policy</Link>
              </p>
            </div>
          </div>

          <div className="contact-topic">
            <FileText size={18} className="contact-topic-icon" />
            <div>
              <span className="contact-topic-title">Order Questions</span>
              <p>Help with placing or modifying an order</p>
            </div>
          </div>

          <div className="contact-topic">
            <ShieldCheck size={18} className="contact-topic-icon" />
            <div>
              <span className="contact-topic-title">Privacy &amp; Data</span>
              <p>
                Access, correction, or deletion of personal data, see our{" "}
                <Link href="/privacy">Privacy Policy</Link>
              </p>
            </div>
          </div>

          <div className="contact-topic">
            <Building2 size={18} className="contact-topic-icon" />
            <div>
              <span className="contact-topic-title">Bulk Orders</span>
              <p>
                Schools, libraries, and institutional purchases, email us for
                custom pricing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related policies */}
      <section id="related-policies">
        <h2>Related Policies</h2>
        <p>
          For specific queries, please refer to the relevant policy document:
        </p>
        <ul>
          <li>
            <Link href="/terms">Terms &amp; Conditions</Link>
          </li>
          <li>
            <Link href="/privacy">Privacy Policy</Link>
          </li>
          <li>
            <Link href="/refund">Refund &amp; Cancellation Policy</Link>
          </li>
          <li>
            <Link href="/shipping">Shipping &amp; Delivery Policy</Link>
          </li>
        </ul>
      </section>

      <section id="business-details">
        <h2>Business details</h2>
        <BusinessCard />
      </section>

      <section id="grievance">
        <h2>Grievance Officer</h2>
        <p>
          Not happy with how something was handled? Write to our Grievance
          Officer. Every complaint is acknowledged within 48 hours and resolved
          within one month, as required under the Consumer Protection
          (E-Commerce) Rules, 2020.
        </p>
        <GrievanceCard />
      </section>
    </main>
  );
}
