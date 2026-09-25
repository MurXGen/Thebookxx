"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Check, Layers } from "lucide-react";
import { bundles, getBundlePricing } from "@/utils/bundles";
import { useStore } from "@/context/StoreContext";
import { showToast } from "@/context/ToastContext";

const slugify = (t) =>
  String(t || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// "Frequently bought together" rail — compact, horizontally scrollable set of
// 3D two-book bundle cards. Sits right below the ₹1 store on the homepage.
export default function BundleDeals() {
  const { addToCart } = useStore();
  const [addedId, setAddedId] = useState(null);
  if (!bundles.length) return null;

  const maxSave = Math.max(
    0,
    ...bundles.map((bd) => getBundlePricing(bd).savings),
  );

  const handleAdd = (bundle) => {
    bundle.books.forEach((b) => addToCart(b.id));
    setAddedId(bundle.id);
    showToast(
      `Both books added to your bag 🎉 “${bundle.books[0].name}” + “${bundle.books[1].name}”`,
      "success",
    );
    setTimeout(() => setAddedId((id) => (id === bundle.id ? null : id)), 2000);
  };

  return (
    <section className="bdl-section" aria-labelledby="bdl-heading">
      <div className="section-1200 bdl-inner">
        <div className="bdl-head">
          <div className="bdl-head-left">
            <span className="bdl-badge">
              <Layers size={13} /> BOUGHT TOGETHER
            </span>
            <h2 id="bdl-heading" className="bdl-title">
              Perfect pairs — <span className="bdl-accent">buy the duo</span>
            </h2>
            <p className="bdl-sub">
              Readers grab these two together. One tap adds both.
            </p>
          </div>
          {maxSave > 0 && (
            <span className="bdl-save-pill">Save up to ₹{maxSave}</span>
          )}
        </div>

        <div className="bdl-scroll">
          <div className="bdl-rail">
            {bundles.map((bundle) => {
              const [a, b] = bundle.books;
              const { price, mrp, savings } = getBundlePricing(bundle);
              const added = addedId === bundle.id;
              return (
                <article className="bdl-card" key={bundle.id}>
                  <div className="bdl-stage" aria-hidden="true">
                    <Link
                      href={`/books/${slugify(a.name)}`}
                      className="bdl-book bdl-book-back"
                      aria-label={a.name}
                    >
                      <img src={a.image} alt="" loading="lazy" />
                      <span className="bdl-spine" />
                    </Link>
                    <Link
                      href={`/books/${slugify(b.name)}`}
                      className="bdl-book bdl-book-front"
                      aria-label={b.name}
                    >
                      <img src={b.image} alt="" loading="lazy" />
                      <span className="bdl-spine" />
                    </Link>
                    <span className="bdl-plus-badge">+</span>
                  </div>

                  <div className="bdl-body">
                    <p className="bdl-hook">{bundle.hook}</p>
                    <div className="bdl-names">
                      <Link
                        href={`/books/${slugify(a.name)}`}
                        className="bdl-name"
                        title={a.name}
                      >
                        {a.name}
                      </Link>
                      <span className="bdl-amp">+</span>
                      <Link
                        href={`/books/${slugify(b.name)}`}
                        className="bdl-name"
                        title={b.name}
                      >
                        {b.name}
                      </Link>
                    </div>

                    <div className="bdl-price-row">
                      <span className="bdl-now">₹{price}</span>
                      {mrp > price && <span className="bdl-mrp">₹{mrp}</span>}
                      {savings > 0 && (
                        <span className="bdl-save">Save ₹{savings}</span>
                      )}
                    </div>

                    <button
                      type="button"
                      className={`bdl-add${added ? " added" : ""}`}
                      onClick={() => handleAdd(bundle)}
                      aria-label={`Add both ${a.name} and ${b.name} to bag`}
                    >
                      {added ? (
                        <>
                          <Check size={16} /> Added both
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={16} /> Add both to bag
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
