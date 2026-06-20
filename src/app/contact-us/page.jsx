"use client";

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

export default function ContactUs() {
  return (
    <main className="legal-page">
      {/* Header */}
      <div className="legal-header">
        <h1>Contact Us</h1>
        <div className="legal-header-meta">
          <span className="last-updated">Effective Date: 1 May 2026</span>
          <p className="legal-intro">
            We're here to help. Whether you have a question about an order, a
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
                Fastest response · 10 AM-7 PM
              </span>
            </div>
          </a>

          {/* Email */}
          <a href="mailto:uskillbook@gmail.com" className="contact-card-link">
            <div className="contact-card-icon contact-icon-email">
              <Mail size={20} />
            </div>
            <div className="contact-card-body">
              <span className="contact-card-title">Email</span>
              <span className="contact-card-value">uskillbook@gmail.com</span>
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
                Mon-Sat, 10 AM-7 PM IST
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
              <td>Monday-Friday</td>
              <td>10:00 AM-7:00 PM</td>
            </tr>
            <tr>
              <td>Saturday</td>
              <td>10:00 AM-5:00 PM</td>
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
                <a href="/shipping">Shipping Policy</a>
              </p>
            </div>
          </div>

          <div className="contact-topic">
            <Wallet size={18} className="contact-topic-icon" />
            <div>
              <span className="contact-topic-title">Refunds &amp; Returns</span>
              <p>
                Cancellations, refunds, returns, see our{" "}
                <a href="/refund">Refund Policy</a>
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
                <a href="/privacy">Privacy Policy</a>
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
            <a href="/terms">Terms &amp; Conditions</a>
          </li>
          <li>
            <a href="/privacy">Privacy Policy</a>
          </li>
          <li>
            <a href="/refund">Refund &amp; Cancellation Policy</a>
          </li>
          <li>
            <a href="/shipping">Shipping &amp; Delivery Policy</a>
          </li>
        </ul>
      </section>

      <div className="legal-disclaimer">
        <p>
          TheBookX is operated as a sole proprietorship, with its registered
          place of business in Mumbai, Maharashtra, India. All communications
          are subject to applicable Indian laws and the exclusive jurisdiction
          of the competent courts located in Mumbai, Maharashtra.
        </p>
      </div>
    </main>
  );
}
