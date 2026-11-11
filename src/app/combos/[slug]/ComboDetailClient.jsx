"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  Check,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Banknote,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { showToast } from "@/context/ToastContext";
import { getComboBooks, getComboPricing } from "@/utils/combos";
import ComboCard, { ComboCoverArt, ComboSaveBurst } from "@/components/ComboCard";

const slugify = (t) =>
  String(t || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function ComboDetailClient({ combo, related = [], faqs = [], about = [] }) {
  const router = useRouter();
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);
  const items = getComboBooks(combo);
  const { price, mrp, sum, comboOff, savings, count } = getComboPricing(combo);
  const isPair = !!combo.discountPct;
  const burstAmt = isPair ? comboOff : savings;

  const addAll = (goToBag) => {
    items.forEach((b) => addToCart(b.id, "detail"));
    setAdded(true);
    showToast(
      isPair
        ? `Combo added: ${combo.discountPct}% off (₹${comboOff}) applied in your bag`
        : `${count} books added to your bag`,
      "success",
    );
    if (goToBag) router.push("/bag");
  };

  return (
    <main className="cd-page">
      <nav className="cd-crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <ChevronRight size={13} />
        <Link href="/combos">Combos</Link>
        <ChevronRight size={13} />
        <span aria-current="page">{combo.title}</span>
      </nav>

      <section className="cd-hero">
        <div className="cd-art">
          <ComboCoverArt
            items={items}
            className="cd-covers"
            burst={<ComboSaveBurst amount={burstAmt} pct={combo.discountPct} size="lg" />}
          />
        </div>

        <div className="cd-info">
          <span className="cd-eyebrow">
            <Sparkles size={14} /> {combo.category}
          </span>
          <h1 className="cd-title">{combo.title} Combo</h1>
          <p className="cd-tagline">{combo.tagline}</p>

          <div className="cd-price">
            <span className="cd-price-now">₹{price}</span>
            <s className="cd-price-was">₹{isPair ? sum : mrp}</s>
            <span className="cd-price-off">
              {isPair ? `${combo.discountPct}% off together` : `Save ₹${savings}`}
            </span>
          </div>

          {/* Savings breakdown — where the money is saved. */}
          <div className="cd-savings">
            <div className="cd-sav-row">
              <span>Bought separately</span>
              <span>₹{sum}</span>
            </div>
            {isPair && (
              <div className="cd-sav-row green">
                <span>
                  <Star size={13} fill="currentColor" /> Combo discount ({combo.discountPct}%)
                </span>
                <span>−₹{comboOff}</span>
              </div>
            )}
            <div className="cd-sav-row total">
              <span>Combo price</span>
              <span>₹{price}</span>
            </div>
            <p className="cd-sav-note">
              You save <b>₹{savings}</b> on the ₹{mrp} MRP
              {isPair ? ", and the 10% combo discount is applied automatically in your bag" : ""}.
            </p>
          </div>

          <div className="cd-actions">
            <button type="button" className={`cd-add${added ? " added" : ""}`} onClick={() => addAll(false)}>
              {added ? (
                <>
                  <Check size={18} /> Added to bag
                </>
              ) : (
                <>
                  <ShoppingBag size={18} /> Add combo to bag
                </>
              )}
            </button>
            <button type="button" className="cd-buy" onClick={() => addAll(true)}>
              Buy now · ₹{price}
            </button>
          </div>

          <ul className="cd-trust">
            <li>
              <Banknote size={15} /> Cash on Delivery
            </li>
            <li>
              <Truck size={15} /> Free delivery from ₹199
            </li>
            <li>
              <RotateCcw size={15} /> 7-day replacement
            </li>
            <li>
              <ShieldCheck size={15} /> 100% genuine books
            </li>
          </ul>
        </div>
      </section>

      <section className="cd-sec">
        <h2>What&apos;s in this combo</h2>
        <div className="cd-books">
          {items.map((b) => (
            <Link key={b.id} href={`/books/${slugify(b.name)}`} className="cd-book">
              <span className="cd-book-cover">
                {b.image && <img src={b.image} alt={`${b.name} book cover`} loading="lazy" />}
                {isPair && <span className="cd-book-star" aria-hidden="true"><Star size={11} fill="currentColor" /> 10% off</span>}
              </span>
              <span className="cd-book-txt">
                <strong>{b.name}</strong>
                {b.author && <span>by {b.author}</span>}
                <span className="cd-book-price">
                  ₹{b.discountedPrice}
                  {b.originalPrice > b.discountedPrice && <s>₹{b.originalPrice}</s>}
                </span>
              </span>
              <ChevronRight size={16} className="cd-book-go" />
            </Link>
          ))}
        </div>
      </section>

      {about.length > 0 && (
        <section className="cd-sec cd-about">
          <h2>Why read these together</h2>
          {about.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
      )}

      {faqs.length > 0 && (
        <section className="cd-sec">
          <h2>Frequently asked questions</h2>
          <div className="cd-faq">
            {faqs.map((f, i) => (
              <details key={i} open={i === 0}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="cd-sec">
          <h2>{isPair ? "More 2-book combos" : "More combos like this"}</h2>
          <div className="cd-related">
            {related.map((c) => (
              <ComboCard key={c.id} combo={c} />
            ))}
          </div>
          <Link href="/combos" className="cd-all">
            <ArrowLeft size={15} /> See all combos
          </Link>
        </section>
      )}

      {/* Sticky buy bar on phones */}
      <div className="cd-sticky">
        <span className="cd-sticky-price">
          <b>₹{price}</b>
          <s>₹{isPair ? sum : mrp}</s>
        </span>
        <button type="button" className="cd-buy" onClick={() => addAll(true)}>
          Buy combo
        </button>
      </div>
    </main>
  );
}
