"use client";

// Slim rows above the homepage hero for returning shoppers:
//  • books in the bag → covers + total + the next reward + "Checkout"
//  • recent orders (saved on this device at checkout):
//      one order  → its book covers + status + "Track" (order page)
//      several    → stacked covers with a count badge + "View" (orders list)
// Reads only local state (cart + localStorage), never the network.

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Package, ShoppingBag } from "lucide-react";
import { books } from "@/utils/book";
import { getCartOffers } from "@/utils/cartOffers";
import { useStore } from "@/context/StoreContext";
import { trackEvent } from "@/lib/ga";

const ORDERS_KEY = "tbx_recent_orders";
const LEGACY_KEY = "tbx_last_order";
const ORDER_SHOW_DAYS = 10;
const MAX_ORDERS = 6;
const OPEN_KEY = "tbx_resume_open"; // remembers the accordion state
const DAY = 86400000;

export function readOrders() {
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    if (!Array.isArray(list)) list = [];
    // Earlier builds stored a single order under another key.
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || "null");
    if (legacy?.orderId && !list.some((o) => o.orderId === legacy.orderId)) {
      list.push({
        ...legacy,
        books: legacy.books || [{ name: legacy.title, cover: legacy.cover, qty: legacy.count || 1 }],
      });
    }
  } catch {
    /* ignore */
  }
  return list.filter((o) => o?.orderId).sort((a, b) => (b.ts || 0) - (a.ts || 0));
}

// Called at checkout success so the homepage can show the order.
// order: { orderId, phone, pending, books: [{ name, cover, qty }] }
export function saveLastOrder(order) {
  try {
    const list = readOrders().filter((o) => o.orderId !== order.orderId);
    list.unshift({ ...order, ts: Date.now() });
    localStorage.setItem(ORDERS_KEY, JSON.stringify(list.slice(0, MAX_ORDERS)));
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* storage blocked */
  }
}

const coverOf = (b) => (typeof b?.image === "string" ? b.image : b?.image?.src) || "";

function agoText(ts) {
  const days = Math.floor((Date.now() - ts) / DAY);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

function Covers({ list, badge }) {
  return (
    <span className="hrs-covers" aria-hidden="true">
      {list.slice(0, 3).map((src, i) => (
        <span key={i} className="hrs-cover" style={{ zIndex: 3 - i }}>
          {src ? <img src={src} alt="" loading="lazy" /> : <Package size={12} />}
        </span>
      ))}
      {badge ? <span className="hrs-badge">{badge}</span> : null}
    </span>
  );
}

export default function HomeResumeStrip() {
  const { cart } = useStore();
  const [ready, setReady] = useState(false);
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);

  // Local-only reads after mount (keeps SSR markup identical).
  useEffect(() => {
    const recent = readOrders().filter((o) => Date.now() - (o.ts || 0) < ORDER_SHOW_DAYS * DAY);
    let o = false;
    try {
      o = localStorage.getItem(OPEN_KEY) === "1";
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => {
      setOrders(recent);
      setOpen(o);
      setReady(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  if (!ready) return null;

  const items = cart
    .map((it) => ({ b: books.find((x) => x.id === it.id), qty: it.qty || 1 }))
    .filter((x) => x.b);
  const count = items.reduce((n, x) => n + x.qty, 0);
  if (!count && !orders.length) return null;

  const toggle = () => {
    const v = !open;
    setOpen(v);
    try {
      localStorage.setItem(OPEN_KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
    trackEvent("home_resume_toggle", { open: v });
  };

  const total = items.reduce((s, x) => s + (x.b.discountedPrice || 0) * x.qty, 0);
  let bagRow = null;
  if (count > 0) {
    const hasOne = items.some((x) => x.b.discountedPrice === 1);
    const next = getCartOffers(hasOne).find((o) => total >= o.min && total < o.target);
    // Short nudge toward the next reward (same tiers as the bag).
    const nudge = next ? `Add ₹${next.target - total} more for ${next.reward}` : "All rewards unlocked 🎉";
    bagRow = (
      <Link href="/bag" className="hrs-row" onClick={() => trackEvent("home_resume_click", { kind: "bag", count })}>
        <Covers list={items.map(({ b }) => coverOf(b))} />
        <span className="hrs-txt">
          <b>
            {count} in your bag · ₹{total}
          </b>
          <small className="hot">{nudge}</small>
        </span>
        <span className="hrs-go">
          Checkout <ChevronRight size={14} strokeWidth={2.6} />
        </span>
      </Link>
    );
  }

  let orderRow = null;
  if (orders.length) {
    const latest = orders[0];
    const phone = orders.find((o) => o.phone)?.phone || "";
    if (orders.length === 1) {
      const bks = latest.books || [];
      const n = bks.reduce((s, b) => s + (b.qty || 1), 0);
      const href =
        latest.phone ? `/profile/${latest.phone}/orders/${encodeURIComponent(latest.orderId)}` : "/profile";
      orderRow = (
        <Link
          href={href}
          className="hrs-row green"
          onClick={() => trackEvent("home_resume_click", { kind: "order", orders: 1 })}
        >
          <Covers list={bks.map((b) => b.cover)} />
          <span className="hrs-txt">
            <b>
              {latest.pending ? "Placed" : "Ordered"} {agoText(latest.ts)}
            </b>
            <small>{bks[0]?.name ? (n > 1 ? `${bks[0].name} + ${n - 1} more` : bks[0].name) : `#${latest.orderId}`}</small>
          </span>
          <span className="hrs-go">
            Track <ChevronRight size={14} strokeWidth={2.6} />
          </span>
        </Link>
      );
    } else {
      // One cover per order (its first book), newest first, with a count badge.
      orderRow = (
        <Link
          href={phone ? `/profile/${phone}/orders` : "/profile"}
          className="hrs-row green"
          onClick={() => trackEvent("home_resume_click", { kind: "order", orders: orders.length })}
        >
          <Covers list={orders.map((o) => o.books?.[0]?.cover || "")} badge={orders.length} />
          <span className="hrs-txt">
            <b>{orders.length} recent orders</b>
            <small>Latest: {agoText(latest.ts)}</small>
          </span>
          <span className="hrs-go">
            View all <ChevronRight size={14} strokeWidth={2.6} />
          </span>
        </Link>
      );
    }
  }

  // Collapsed summary: "₹378 in bag · 3 orders"
  const summary = [
    count > 0 && `₹${total} in bag`,
    orders.length > 0 && `${orders.length} ${orders.length === 1 ? "order" : "orders"}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className={`hrs${open ? " open" : ""}`} aria-label="Your bag and orders">
      <div className="hrs-head">
        <button type="button" className="hrs-toggle" onClick={toggle} aria-expanded={open} aria-controls="hrs-body">
          <span className="hrs-ic" aria-hidden="true">
            {count > 0 ? <ShoppingBag size={16} strokeWidth={2.3} /> : <Package size={16} strokeWidth={2.3} />}
          </span>
          <span className="hrs-head-txt">
            <small>Your activity</small>
            <b>{summary}</b>
          </span>
          <ChevronDown size={18} className="hrs-chev" aria-hidden="true" />
        </button>
        {/* Collapsed: keep the one action that matters within a tap. */}
        {!open && count > 0 && (
          <Link
            href="/bag"
            className="hrs-pill"
            onClick={() => trackEvent("home_resume_click", { kind: "bag_pill", count })}
          >
            Checkout
          </Link>
        )}
      </div>
      <div className="hrs-wrap" id="hrs-body">
        <div className="hrs-body">
          {bagRow}
          {orderRow}
        </div>
      </div>
    </section>
  );
}
