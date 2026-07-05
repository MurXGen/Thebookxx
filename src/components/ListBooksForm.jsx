"use client";

import { useState } from "react";
import {
  User,
  Phone,
  Mail,
  BookOpen,
  Sparkles,
  BadgeCheck,
  Megaphone,
  Send,
  Layers,
} from "lucide-react";

const WHATSAPP = "917710892108";

const ROLES = ["Author", "Publisher", "Bookstore", "Company / Brand"];
const LISTING_TYPES = [
  { key: "bulk", label: "Bulk listing (many titles)" },
  { key: "author", label: "All books by an author" },
  { key: "single", label: "A single / few titles" },
];

const ADDONS = [
  {
    key: "seo",
    label: "Book SEO",
    desc: "Rank your titles on Google & in-store search",
    icon: Sparkles,
  },
  {
    key: "branding",
    label: "Branding & Better Visibility",
    desc: "Featured placement, banners & author page",
    icon: BadgeCheck,
  },
  {
    key: "social",
    label: "Social Media Post",
    desc: "Promoted posts across our channels",
    icon: Megaphone,
  },
];

export default function ListBooksForm() {
  const [role, setRole] = useState("Author");
  const [listingType, setListingType] = useState("bulk");
  const [brand, setBrand] = useState("");
  const [titles, setTitles] = useState("");
  const [categories, setCategories] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [addons, setAddons] = useState({
    seo: false,
    branding: false,
    social: false,
  });
  const [error, setError] = useState("");

  const toggleAddon = (key) =>
    setAddons((a) => ({ ...a, [key]: !a[key] }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !brand.trim()) {
      setError("Please add your name, phone and author/brand name.");
      return;
    }
    setError("");

    const listingLabel =
      LISTING_TYPES.find((l) => l.key === listingType)?.label || listingType;
    const selectedAddons = ADDONS.filter((a) => addons[a.key]).map(
      (a) => a.label,
    );

    const msg = `📚 *New Book Listing Request — TheBookX*

*I'm a:* ${role}
*Listing type:* ${listingLabel}
*Author / Brand:* ${brand}${titles ? `\n*No. of titles:* ${titles}` : ""}${
      categories ? `\n*Categories / Genre:* ${categories}` : ""
    }

*Add-ons wanted:*
${selectedAddons.length ? selectedAddons.map((a) => `• ${a}`).join("\n") : "• (none selected)"}

*Contact*
👤 ${name}
📞 ${phone}${email ? `\n✉️ ${email}` : ""}${
      message ? `\n\n*Message:* ${message}` : ""
    }

_Sent from the List Your Books page on thebookx.in_`;

    window.open(
      `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  return (
    <form className="lb-form" onSubmit={handleSubmit} id="list-form">
      <h2 className="lb-form-title">Tell us about your books</h2>
      <p className="lb-form-sub">
        Fill this in and we&apos;ll continue on WhatsApp — quick, personal, no
        back-and-forth emails.
      </p>

      {/* Role */}
      <label className="lb-label">I am a</label>
      <div className="lb-chips">
        {ROLES.map((r) => (
          <button
            type="button"
            key={r}
            className={`lb-chip ${role === r ? "active" : ""}`}
            onClick={() => setRole(r)}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Listing type */}
      <label className="lb-label">What do you want to list?</label>
      <div className="lb-chips">
        {LISTING_TYPES.map((l) => (
          <button
            type="button"
            key={l.key}
            className={`lb-chip ${listingType === l.key ? "active" : ""}`}
            onClick={() => setListingType(l.key)}
          >
            <Layers size={13} /> {l.label}
          </button>
        ))}
      </div>

      {/* Book details */}
      <div className="lb-grid">
        <div className="lb-field">
          <label className="lb-label">Author / Brand name *</label>
          <div className="lb-input-wrap">
            <BookOpen size={16} className="lb-input-icon" />
            <input
              className="lb-input"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Murthy Thevar / Penguin"
            />
          </div>
        </div>
        <div className="lb-field">
          <label className="lb-label">Approx. no. of titles</label>
          <div className="lb-input-wrap">
            <Layers size={16} className="lb-input-icon" />
            <input
              className="lb-input"
              value={titles}
              onChange={(e) => setTitles(e.target.value)}
              placeholder="e.g. 12"
            />
          </div>
        </div>
      </div>

      <div className="lb-field">
        <label className="lb-label">Categories / Genre</label>
        <input
          className="lb-input lb-input-plain"
          value={categories}
          onChange={(e) => setCategories(e.target.value)}
          placeholder="e.g. Self-help, Fiction, Business"
        />
      </div>

      {/* Add-ons */}
      <label className="lb-label">
        Add-ons <span className="lb-optional">(optional, boost your sales)</span>
      </label>
      <div className="lb-addons">
        {ADDONS.map(({ key, label, desc, icon: Icon }) => (
          <button
            type="button"
            key={key}
            className={`lb-addon ${addons[key] ? "active" : ""}`}
            onClick={() => toggleAddon(key)}
            aria-pressed={addons[key]}
          >
            <span className="lb-addon-check">{addons[key] ? "✓" : ""}</span>
            <Icon size={20} className="lb-addon-icon" />
            <span className="lb-addon-text">
              <span className="lb-addon-label">{label}</span>
              <span className="lb-addon-desc">{desc}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Contact */}
      <div className="lb-grid">
        <div className="lb-field">
          <label className="lb-label">Your name *</label>
          <div className="lb-input-wrap">
            <User size={16} className="lb-input-icon" />
            <input
              className="lb-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>
        </div>
        <div className="lb-field">
          <label className="lb-label">WhatsApp number *</label>
          <div className="lb-input-wrap">
            <Phone size={16} className="lb-input-icon" />
            <input
              className="lb-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit number"
              inputMode="tel"
            />
          </div>
        </div>
      </div>

      <div className="lb-field">
        <label className="lb-label">Email (optional)</label>
        <div className="lb-input-wrap">
          <Mail size={16} className="lb-input-icon" />
          <input
            className="lb-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            type="email"
          />
        </div>
      </div>

      <div className="lb-field">
        <label className="lb-label">Anything else?</label>
        <textarea
          className="lb-input lb-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your books, timeline or goals…"
          rows={3}
        />
      </div>

      {error && <p className="lb-error">{error}</p>}

      <button type="submit" className="lb-submit">
        <Send size={18} />
        Continue on WhatsApp
      </button>
      <p className="lb-note">
        We&apos;ll open WhatsApp with your details pre-filled — just hit send and
        our team takes it from there.
      </p>
    </form>
  );
}
