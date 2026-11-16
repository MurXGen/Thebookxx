"use client";

// Homepage-only header (quick-commerce style): delivery promise up top with the
// delivery address, wallet / profile / cart on the right, a full-width search
// bar and a row of category shortcuts. Christmas red-and-white theme that runs
// straight into the hero. Every other page keeps the regular Navbar.

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Search, Truck, User, Wallet, Zap } from "lucide-react";
import { books as ALL_BOOKS } from "@/utils/book";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { useStore } from "@/context/StoreContext";
import { XmasSnow, XmasTree } from "./XmasDecor";
import { trackEvent } from "@/lib/ga";
import { getSavedPhone } from "@/utils/userPhone";
import { fetchWalletLedger } from "@/utils/walletLedger";
import { isMaharashtraPin, openPincodeSheet } from "./DeliveryCheckBar";

// Category shortcuts, styled like "Shop by category": a pastel tile with two
// fanned covers from that shelf.
const src = (b) => (typeof b.image === "string" ? b.image : b.image?.src) || "";
const covers = (test) => ALL_BOOKS.filter((b) => b.image && test(b)).slice(0, 2).map(src);
const inCat = (c) => (b) => b.catalogue?.includes(c) && b.discountedPrice !== 1;
const TABS = [
  { href: "/", label: "All", color: "#fd6b01", covers: covers((b) => ["bk-002", "bk-005"].includes(b.id)) },
  { href: "/1rupee", label: "₹1 Books", color: "#dc2626", covers: covers((b) => b.discountedPrice === 1) },
  { href: "/category/self-help", label: "Self-help", color: "#16a34a", covers: covers(inCat("self-help")) },
  { href: "/category/fiction", label: "Fiction", color: "#2563eb", covers: covers(inCat("fiction")) },
  { href: "/combos", label: "Combos", color: "#9333ea", covers: covers((b) => ["bk-009", "bk-150"].includes(b.id)) },
  { href: "/category/romance", label: "Romance", color: "#e11d48", covers: covers(inCat("romance")) },
  { href: "/category/business", label: "Business", color: "#0891b2", covers: covers(inCat("business")) },
  { href: "/category/children", label: "Kids", color: "#f59e0b", covers: covers(inCat("children")) },
];

const HINTS = ["Atomic Habits", "Ikigai", "The Art of Clarity", "Rich Dad Poor Dad", "Fiction under ₹199"];

export default function HomeNavbar({ onSearch }) {
  const { cart, qrCart } = useStore();
  const cartCount = cart.reduce((s, i) => s + (i.qty || 1), 0) + (qrCart?.length || 0);

  const [ready, setReady] = useState(false); // saved pincode read yet?
  const [pin, setPin] = useState("");
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [wallet, setWallet] = useState(null); // null = loading, number = balance
  const [walletKnown, setWalletKnown] = useState(true);
  const [hint, setHint] = useState(0);

  // Saved pincode / city / first name (re-read when the pincode changes).
  useEffect(() => {
    const read = () => {
      try {
        const p = String(localStorage.getItem("delivery_pincode") || "").replace(/\D/g, "");
        setPin(p.length === 6 ? p : "");
        setCity(localStorage.getItem("delivery_city") || "");
        let n = localStorage.getItem("track_orders_name") || "";
        if (!n) n = JSON.parse(localStorage.getItem("checkoutAddress") || "null")?.name || "";
        setName(String(n).trim().split(/\s+/)[0] || "");
      } catch {
        /* storage blocked */
      }
      setReady(true);
    };
    read();
    window.addEventListener("tbx:pincode-set", read);
    return () => window.removeEventListener("tbx:pincode-set", read);
  }, []);

  // Wallet balance for a known shopper (cached for the visit; read-only GET).
  useEffect(() => {
    const phone = getSavedPhone();
    let alive = true;
    if (phone.length !== 10) {
      Promise.resolve().then(() => alive && setWalletKnown(false));
      return () => {
        alive = false;
      };
    }
    // Short cache (2 min, per phone) so the pill doesn't refetch on every page
    // but never shows a stale balance after spending / earning coins.
    let cached = null;
    try {
      const c = JSON.parse(sessionStorage.getItem("tbx_wallet_bal") || "null");
      if (c && c.p === phone && Date.now() - c.t < 120000) cached = c.v;
    } catch {
      /* ignore */
    }
    const load = cached !== null ? Promise.resolve({ balance: Number(cached) || 0 }) : fetchWalletLedger(phone);
    const timeout = setTimeout(() => alive && setWallet((w) => (w === null ? 0 : w)), 8000);
    load.then((l) => {
      clearTimeout(timeout);
      if (!alive) return;
      setWallet(l.balance || 0);
      try {
        sessionStorage.setItem("tbx_wallet_bal", JSON.stringify({ v: l.balance || 0, p: phone, t: Date.now() }));
      } catch {
        /* ignore */
      }
    }).catch(() => {
      clearTimeout(timeout);
      if (alive) setWallet(0);
    });
    return () => {
      alive = false;
      clearTimeout(timeout);
    };
  }, []);

  // Rotating search hint, like "Search “Atomic Habits”".
  useEffect(() => {
    const t = setInterval(() => setHint((h) => (h + 1) % HINTS.length), 2600);
    return () => clearInterval(t);
  }, []);

  const fast = pin && isMaharashtraPin(pin);
  const eta = !pin ? "4–9 days" : fast ? "1–5 days" : "4–9 days";

  return (
    <>
    {/* ===== Desktop (≥1024px): promo strip + floating navbar ===== */}
    <div className="hnd">
      <div className="hnd-promo">
        <span>🎄 Christmas Sale — up to 50% off</span>
        <i aria-hidden="true">·</i>
        <span>Free delivery from ₹249</span>
        <i aria-hidden="true">·</i>
        <span>Cash on Delivery &amp; 7-day replacement</span>
      </div>
      <div className="hnd-bar">
        <Link href="/" className="hnd-brand" aria-label="TheBookX home">
          <span className="hnd-logo">TheBookX</span>
          <span className="hnd-logo-sub">formerly Uskillbook</span>
        </Link>
        <nav className="hnd-links" aria-label="Main">
          <Link href="/books">Books</Link>
          <Link href="/1rupee">₹1 Books</Link>
          <Link href="/combos">Combos</Link>
          <Link href="/quickreads">QuickReads</Link>
        </nav>
        <button
          type="button"
          className="hnd-search"
          onClick={() => {
            trackEvent("search_opened", { source: "home_header_desktop" });
            onSearch?.();
          }}
          aria-label="Search books"
        >
          <Search size={16} />
          <span>Search books, authors…</span>
        </button>
        <button type="button" className="hnd-del" onClick={openPincodeSheet} aria-label="Change delivery pincode">
          <span className="hnd-del-ic" aria-hidden="true">
            {fast ? <Zap size={15} /> : <Truck size={15} />}
          </span>
          {ready ? (
            <span className="hnd-del-tx">
              <b>Delivery in {eta}</b>
              <span>
                {pin ? `${city ? `${city} · ` : ""}${pin}` : "Set your pincode"}
                <ChevronDown size={12} />
              </span>
            </span>
          ) : (
            <span className="hn-skel hn-skel-addr" />
          )}
        </button>
        <div className="hnd-acts">
          {walletKnown && (
            <Link href="/wallet" className="hn-wallet" aria-label="Wallet">
              <Wallet size={16} />
              {wallet === null ? <span className="hn-skel hn-skel-wal" /> : <span>₹{wallet}</span>}
            </Link>
          )}
          <Link href="/profile" className="hn-ic" aria-label="Account">
            <User size={19} />
          </Link>
          <Link href="/bag" className="hn-ic hn-cart" aria-label="Cart">
            <HiOutlineShoppingBag size={20} />
            {cartCount > 0 && <span className="hn-badge">{cartCount > 99 ? "99+" : cartCount}</span>}
          </Link>
        </div>
      </div>
    </div>

    <div className="hn">
      {/* Christmas: gentle snowfall across the header */}
      <XmasSnow className="hn-snow" density={0.6} max={36} />
      <div className="hn-top section-1200">
        <button type="button" className="hn-del" onClick={openPincodeSheet} aria-label="Change delivery pincode">
          <span className="hn-del-k">
            TheBookX delivers in <XmasTree size={22} gifts={false} className="hn-tree" />
          </span>
          {ready ? (
            <>
              <span className="hn-del-eta">
                {fast && <Zap size={15} className="hn-del-zap" />}
                {eta}
              </span>
              <span className="hn-del-addr">
                <span className="hn-del-place">{pin ? `${city ? `${city} · ` : ""}${pin}` : "Set delivery pincode"}</span>
                <ChevronDown size={15} />
              </span>
            </>
          ) : (
            <>
              <span className="hn-skel hn-skel-eta" />
              <span className="hn-skel hn-skel-addr" />
            </>
          )}
        </button>

        <div className="hn-acts">
          <Link href="/wallet" className="hn-wallet" aria-label="Wallet">
            <Wallet size={16} />
            {walletKnown && wallet === null ? <span className="hn-skel hn-skel-wal" /> : <span>₹{wallet ?? 0}</span>}
          </Link>
          <Link href="/profile" className="hn-ic" aria-label="Account">
            <User size={20} />
          </Link>
          <Link href="/bag" className="hn-ic hn-cart" aria-label="Cart" id="cart-fly-target">
            <HiOutlineShoppingBag size={21} />
            {cartCount > 0 && <span className="hn-badge">{cartCount > 99 ? "99+" : cartCount}</span>}
          </Link>
        </div>
      </div>

      <div className="section-1200 hn-search-wrap">
        <button
          type="button"
          className="hn-search hx-capped"
          onClick={() => {
            trackEvent("search_opened", { source: "home_header" });
            onSearch?.();
          }}
          aria-label="Search books"
        >
          <Search size={19} />
          <span className="hn-search-ph">
            Search{" "}
            <span key={hint} className="hn-search-hint">
              “{HINTS[hint]}”
            </span>
          </span>
        </button>
      </div>

      <nav className="hn-tabs section-1200" aria-label="Shop by category">
        {TABS.map((t, i) => (
          <Link
            key={t.href}
            href={t.href}
            className={`hn-tab catrow-item${i === 0 ? " on" : ""}`}
            style={{ "--cat": t.color }}
          >
            <span className="catrow-tile hn-tile" aria-hidden="true">
              {t.covers.map((c, k) => (
                <img key={c} src={c} alt="" loading="lazy" decoding="async" className={`catrow-cover catrow-cover-${k}`} />
              ))}
            </span>
            <span className="hn-tab-lbl">{t.label}</span>
          </Link>
        ))}
      </nav>
    </div>
    </>
  );
}
