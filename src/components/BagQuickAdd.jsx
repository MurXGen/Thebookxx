"use client";

// One-tap "add one more" rows under the bag, built from what's already in it:
//   1. books that close the gap to the next order reward
//   2. more from the bag's top categories
// Each row scrolls sideways; every card has its own Add button.

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Plus } from "lucide-react";
import { books } from "@/utils/book";
import { useStore } from "@/context/StoreContext";
import { showToast } from "@/context/ToastContext";
import { getCategoryLabel } from "@/utils/catalogueUtils";
import { rewardProgress } from "@/utils/orderRewards";

const ROW = 12;
const slugify = (t = "") =>
  String(t).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const img = (b) => (typeof b.image === "string" ? b.image : b.image?.src);
const inStock = (b) => b.stock === undefined || b.stock === null || b.stock > 0;
const popularity = (b) =>
  (b.catalogue?.includes("bestseller") ? 2 : 0) +
  (b.catalogue?.includes("trending") ? 1 : 0) +
  (Number(b.rating) || 0) / 5;

function QuickCard({ book, inCart, onAdd }) {
  return (
    <div className="bqa-card">
      <Link href={`/books/${slugify(book.name)}`} className="bqa-cover">
        {img(book) ? <img src={img(book)} alt={book.name} loading="lazy" /> : null}
      </Link>
      <span className="bqa-name">{book.name}</span>
      <span className="bqa-price">
        ₹{book.discountedPrice}
        {book.originalPrice > book.discountedPrice && <s>₹{book.originalPrice}</s>}
      </span>
      <button
        type="button"
        className={`bqa-add${inCart ? " on" : ""}`}
        onClick={() => onAdd(book)}
        disabled={inCart}
        data-no-busy
      >
        {inCart ? (
          <>
            <Check size={14} strokeWidth={3} /> Added
          </>
        ) : (
          <>
            <Plus size={14} strokeWidth={3} /> Add
          </>
        )}
      </button>
    </div>
  );
}

// Empty bag: easy starting points instead of cart-based rows.
function emptyRows(pool) {
  const used = new Set();
  const take = (list) => {
    const out = list.filter((b) => !used.has(b.id)).slice(0, ROW);
    out.forEach((b) => used.add(b.id));
    return out;
  };
  const byPop = [...pool].sort((a, b) => popularity(b) - popularity(a));
  return [
    {
      key: "under199",
      title: "Bestsellers under ₹199",
      sub: "Delivery is free from ₹199, so two of these ship free",
      items: take(byPop.filter((b) => b.discountedPrice <= 199)),
    },
    {
      key: "trending",
      title: "Trending this week",
      sub: "What readers are adding right now",
      items: take(byPop.filter((b) => b.catalogue?.includes("trending"))),
    },
    {
      key: "selfhelp",
      title: "Start a better habit",
      sub: "Short, practical self-help reads",
      items: take(byPop.filter((b) => b.catalogue?.includes("self-help"))),
    },
    {
      key: "fiction",
      title: "Stories you won't put down",
      sub: "Fiction loved by our readers",
      items: take(byPop.filter((b) => b.catalogue?.includes("fiction"))),
    },
  ].filter((r) => r.items.length >= 3);
}

export default function BagQuickAdd({ cartBooks = [], amount = 0, empty = false }) {
  const { cart, addToCart } = useStore();
  // Books they looked at recently (same list the "Recently viewed" rail uses).
  const [recentIds, setRecentIds] = useState([]);
  useEffect(() => {
    if (!empty) return;
    // Read after paint so the first render matches the server.
    const t = setTimeout(() => {
      try {
        const ids = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
        if (Array.isArray(ids)) setRecentIds(ids);
      } catch {
        /* ignore */
      }
    }, 0);
    return () => clearTimeout(t);
  }, [empty]);
  const inCart = (id) => cart?.some((i) => i.id === id);
  const cartIds = new Set(cartBooks.map((b) => b.id));
  const pool = books.filter((b) => !cartIds.has(b.id) && b.discountedPrice > 1 && inStock(b));

  const add = (b) => {
    if (inCart(b.id)) return;
    addToCart(b.id);
    showToast(`${b.name} added to your bag`, "success");
  };

  const rows = [];
  if (empty) {
    const recent = recentIds
      .map((id) => pool.find((b) => b.id === id))
      .filter(Boolean)
      .slice(0, ROW);
    if (recent.length)
      rows.push({
        key: "recent",
        title: "Jump back in",
        sub: "Books you looked at recently",
        items: recent,
      });
    rows.push(...emptyRows(pool.filter((b) => !recentIds.includes(b.id))));
  }

  // 1 · Close the gap to the next reward (only when it's within reach).
  const { next, gap } = rewardProgress(amount);
  if (!empty && next && gap <= 800) {
    const fits = pool
      .filter((b) => b.discountedPrice >= gap)
      .sort((a, b) => a.discountedPrice - b.discountedPrice || popularity(b) - popularity(a))
      .slice(0, ROW);
    if (fits.length)
      rows.push({
        key: "reward",
        title: `Add one to unlock ${next.short}`,
        sub: `Any book here takes you past ₹${next.at.toLocaleString("en-IN")}`,
        items: fits,
      });
  }

  // 2 · More from the bag's strongest categories (skip the generic ones).
  const GENERIC = new Set(["bestseller", "trending", "fiction", "non-fiction"]);
  const counts = new Map();
  cartBooks.forEach((b) =>
    (b.catalogue || []).forEach((c) => !GENERIC.has(c) && counts.set(c, (counts.get(c) || 0) + 1)),
  );
  const used = new Set(rows.flatMap((r) => r.items.map((b) => b.id)));
  (empty ? [] : [...counts.entries()])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .forEach(([cat]) => {
      const items = pool
        .filter((b) => b.catalogue?.includes(cat) && !used.has(b.id))
        .sort((a, b) => popularity(b) - popularity(a))
        .slice(0, ROW);
      items.forEach((b) => used.add(b.id));
      if (items.length >= 3)
        rows.push({
          key: cat,
          title: `More in ${getCategoryLabel(cat) || cat}`,
          sub: "Readers of your picks add these next",
          items,
        });
    });

  if (!rows.length) return null;

  return (
    <div className="bqa">
      {rows.map((r) => (
        <section key={r.key} className={`bqa-row${r.key === "reward" ? " bqa-row--reward" : ""}`}>
          <div className="bqa-head">
            <b>{r.title}</b>
            <small>{r.sub}</small>
          </div>
          <div className="bqa-scroll">
            {r.items.map((b) => (
              <QuickCard key={b.id} book={b} inCart={inCart(b.id)} onAdd={add} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
