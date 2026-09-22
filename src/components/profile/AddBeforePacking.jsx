"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Plus, Check, TrendingUp, X, Package } from "lucide-react";
import { books as ALL_BOOKS } from "@/utils/book";
import { getCatalogueData, getBooksByCategory } from "@/utils/catalogueUtils";
import { FaWhatsapp } from "react-icons/fa";

const ADDON_DISCOUNT = 0.2; // flat 20% off add-ons
const MERCHANT_WA = "917710892108";
const BATCH = 10; // lazy-load step

const normName = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

// Add-more-before-packing upsell — mirrors the homepage "Find your next read"
// browser (category tabs + lazy-loaded 2-row rail) but adds at a flat 20% off
// into a per-order package the customer confirms on WhatsApp.
export default function AddBeforePacking({ order, orderId, phone }) {
  const storeKey = `tbx_addpack_${orderId}`;
  const [added, setAdded] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(storeKey);
      return raw ? JSON.parse(raw) || [] : [];
    } catch {
      return [];
    }
  });
  const [active, setActive] = useState("all");
  const [visible, setVisible] = useState(BATCH);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollRef = useRef(null);

  const persist = (next) => {
    setAdded(next);
    try {
      localStorage.setItem(storeKey, JSON.stringify(next));
    } catch {}
  };

  // Category tabs — All first, then every catalogue category by size.
  const cats = useMemo(() => {
    const data = getCatalogueData()
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);
    return [{ key: "all", label: "All" }, ...data];
  }, []);

  // Names already in the order → excluded.
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

  // Full pool for the active category (revealed lazily).
  const full = useMemo(() => {
    const src =
      active === "all" ? ALL_BOOKS : getBooksByCategory(active);
    return src.filter(
      (b) =>
        b.image &&
        b.id &&
        (b.discountedPrice ?? 0) > 1 &&
        !inOrder.has(normName(b.name)),
    );
  }, [active, inOrder]);
  const shown = full.slice(0, visible);
  const hasMore = visible < full.length;

  const onRailScroll = () => {
    const el = scrollRef.current;
    if (!el || loadingMore || !hasMore) return;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 220) {
      setLoadingMore(true);
      setTimeout(() => {
        setVisible((v) => Math.min(v + BATCH, full.length));
        setLoadingMore(false);
      }, 350);
    }
  };
  const selectCat = (key) => {
    if (key === active) return;
    setActive(key);
    setVisible(BATCH);
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  };

  const isAdded = (id) => added.some((x) => x.id === id);
  const addBook = (b) => {
    if (isAdded(b.id)) return;
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

  if (!full.length && !added.length) return null;

  return (
    <section className="abp">
      {/* Added-to-package summary */}
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

      {/* Header */}
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

      {/* Category tabs (underlined, scrollable) — same as homepage */}
      <div className="cb-tabbar abp-tabbar">
        <div className="cb-tabs" role="tablist">
          {cats.map((c) => (
            <button
              key={c.key}
              type="button"
              role="tab"
              aria-selected={active === c.key}
              className={`cb-tab${active === c.key ? " on" : ""}`}
              onClick={() => selectCat(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2-row lazy-loaded rail — same card style as homepage */}
      {shown.length === 0 ? (
        <p className="cb-empty">No books in this category yet.</p>
      ) : (
        <div className="or1-scroll" ref={scrollRef} onScroll={onRailScroll}>
          <div className="or1-grid">
            {shown.map((b) => {
              const price = disc(b);
              const orig = b.discountedPrice ?? 0;
              const on = isAdded(b.id);
              return (
                <div className="or1-card" key={b.id}>
                  <div className="or1-cover">
                    <span className="or1-cover-link">
                      <Image
                        src={b.image}
                        alt={b.name}
                        width={120}
                        height={150}
                        loading="lazy"
                      />
                    </span>
                    {on ? (
                      <button
                        type="button"
                        className="or1-add on"
                        onClick={() => removeBook(b.id)}
                        aria-label={`Remove ${b.name}`}
                      >
                        <Check size={17} strokeWidth={3} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="or1-add"
                        onClick={() => addBook(b)}
                        aria-label={`Add ${b.name}`}
                      >
                        <Plus size={18} />
                      </button>
                    )}
                  </div>
                  <span className="or1-name">{b.name}</span>
                  <div className="or1-price">
                    <span className="or1-now">₹{price}</span>
                    {orig > price && <span className="or1-mrp">₹{orig}</span>}
                  </div>
                  {orig > price && (
                    <span className="or1-save-tag">You save ₹{orig - price}</span>
                  )}
                </div>
              );
            })}
            {loadingMore &&
              Array.from({ length: 4 }).map((_, i) => (
                <div className="cb-skel" key={`more-${i}`}>
                  <span className="cb-skel-cover">
                    <span className="cb-skel-shine" />
                  </span>
                  <span className="cb-skel-line w70" />
                  <span className="cb-skel-line w40" />
                </div>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}
