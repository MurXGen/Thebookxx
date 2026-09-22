"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Plus, Check, TrendingUp, X, Package } from "lucide-react";
import { books as ALL_BOOKS } from "@/utils/book";
import { FaWhatsapp } from "react-icons/fa";

const ADDON_DISCOUNT = 0.2; // flat 20% off add-ons
const MERCHANT_WA = "917710892108";

const normName = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

// Add-more-before-packing upsell — shown on the order-detail page while the
// order is still packable. Adds ride at a flat 20% off; the customer confirms
// on WhatsApp with a merchant approve link that appends them to this order.
export default function AddBeforePacking({ order, orderId, phone }) {
  const storeKey = `tbx_addpack_${orderId}`;
  // Load any previously-added books from localStorage on first render (this
  // component only renders client-side once the order has loaded).
  const [added, setAdded] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(storeKey);
      return raw ? JSON.parse(raw) || [] : [];
    } catch {
      return [];
    }
  });
  const persist = (next) => {
    setAdded(next);
    try {
      localStorage.setItem(storeKey, JSON.stringify(next));
    } catch {}
  };

  // Names already in the order → excluded from the trending picks.
  const inOrder = useMemo(() => {
    const set = new Set();
    String(order?.["Books List"] || "")
      .split("\n")
      .forEach((l) => {
        const nm = (l.split("|")[0] || "").replace(/^\d+\.\s*/, "").trim();
        if (nm) set.add(normName(nm));
      });
    return set;
  }, [order]);

  const disc = (b) =>
    Math.max(1, Math.round((b.discountedPrice ?? 0) * (1 - ADDON_DISCOUNT)));

  // Trending pool: catalogue-tagged trending/bestseller, with a cover, not
  // already in the order, priced sensibly.
  const pool = useMemo(() => {
    const addedIds = new Set(added.map((a) => a.id));
    return ALL_BOOKS.filter((b) => {
      if (!b.image || !b.id) return false;
      if (inOrder.has(normName(b.name))) return false;
      if (addedIds.has(b.id)) return false;
      const tags = (b.catalogue || []).map((t) => String(t).toLowerCase());
      const price = b.discountedPrice ?? 0;
      return (
        price > 1 &&
        (tags.includes("trending") || tags.includes("bestseller"))
      );
    }).slice(0, 8);
  }, [inOrder, added]);

  const addBook = (b) => {
    if (added.some((x) => x.id === b.id)) return;
    persist([
      ...added,
      {
        id: b.id,
        name: b.name,
        image: b.image,
        orig: b.discountedPrice ?? 0,
        price: disc(b),
        qty: 1,
      },
    ]);
  };
  const removeBook = (id) => persist(added.filter((x) => x.id !== id));

  const addTotal = added.reduce((s, b) => s + b.price * b.qty, 0);
  const origTotal = added.reduce((s, b) => s + (b.orig || b.price) * b.qty, 0);
  const saved = Math.max(0, origTotal - addTotal);

  const confirm = () => {
    if (!added.length) return;
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://www.thebookx.in";
    const payload =
      typeof window !== "undefined"
        ? window.btoa(JSON.stringify(added.map((b) => ({ id: b.id, q: b.qty }))))
        : "";
    const link = `${origin}/${encodeURIComponent(orderId)}?addbooks=${encodeURIComponent(payload)}`;
    const lines = added
      .map((b, i) => `${i + 1}. ${b.name} — ₹${b.price} (20% off)`)
      .join("\n");
    const msg = [
      `Hi TheBookX, please *add these books to order ${orderId}* before packing (flat 20% off) 📚`,
      "",
      lines,
      "",
      `Extra to pay: *₹${addTotal}*`,
      "",
      "———",
      "*Merchant only* — approve & add these books:",
      link,
    ].join("\n");
    window.open(
      `https://wa.me/${MERCHANT_WA}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  if (!pool.length && !added.length) return null;

  return (
    <section className="abp">
      {/* Added-to-package summary (above the trending grid). */}
      {added.length > 0 && (
        <div className="abp-cart">
          <div className="abp-cart-head">
            <span className="abp-cart-title">
              <Package size={15} /> {added.length} book
              {added.length === 1 ? "" : "s"} added to this package
            </span>
            <span className="abp-cart-total">
              +₹{addTotal}
              {saved > 0 && <em> · saved ₹{saved}</em>}
            </span>
          </div>
          <div className="abp-cart-chips">
            {added.map((b) => (
              <span className="abp-chip" key={b.id}>
                {b.name}
                <button
                  type="button"
                  onClick={() => removeBook(b.id)}
                  aria-label={`Remove ${b.name}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <button type="button" className="abp-confirm" onClick={confirm}>
            <FaWhatsapp size={16} /> Confirm &amp; add to my package
          </button>
        </div>
      )}

      {/* Trending header */}
      <div className="abp-head">
        <div className="abp-head-txt">
          <span className="abp-tag">
            <TrendingUp size={13} /> ADD BEFORE PACKING
          </span>
          <h3 className="abp-title">Add more &amp; get flat 20% off</h3>
          <p className="abp-sub">
            Slip these into the same parcel — pay just the extra on delivery.
          </p>
        </div>
        <span className="abp-off">
          <TrendingUp size={14} /> Flat 20% off
        </span>
      </div>

      {/* Trending grid */}
      <div className="abp-grid">
        {pool.map((b) => {
          const price = disc(b);
          const orig = b.discountedPrice ?? 0;
          return (
            <div className="abp-item" key={b.id}>
              <div className="abp-cover">
                {b.image ? (
                  <Image src={b.image} alt={b.name} width={120} height={150} />
                ) : (
                  <span className="abp-cover-ph">
                    <Package size={20} />
                  </span>
                )}
                <button
                  type="button"
                  className="abp-add"
                  onClick={() => addBook(b)}
                  aria-label={`Add ${b.name}`}
                >
                  <Plus size={18} />
                </button>
              </div>
              <span className="abp-name" title={b.name}>
                {b.name}
              </span>
              <div className="abp-price">
                <b>₹{price}</b>
                {orig > price && <s>₹{orig}</s>}
              </div>
              {orig > price && (
                <span className="abp-save">You save ₹{orig - price}</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
