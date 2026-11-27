"use client";
import { optImg } from "@/lib/optImg";
import "./HomeNavbar.styles.css";

// Homepage-only header (quick-commerce style): delivery promise up top with the
// delivery address, wallet / profile / cart on the right, a full-width search
// bar and a row of category shortcuts. Christmas red-and-white theme that runs
// straight into the hero. Every other page keeps the regular Navbar.

import Link from "next/link";
import { useEffect, useState } from "react";
import { BadgeCheck, Bookmark, ChevronDown, RotateCcw, Search, Star, Truck, User, Wallet, Banknote, Zap } from "lucide-react";
import { books as ALL_BOOKS } from "@/utils/book";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { useStore } from "@/context/StoreContext";
import { trackEvent } from "@/lib/ga";
import { GetAppButton } from "./AppInstall";
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

const TITLE_COUNT = Math.max(100, Math.floor(ALL_BOOKS.length / 100) * 100);
// Trust points in the black strip above the header.
const TRUST = [
  { icon: Bookmark, label: "Free bookmark", hi: true },
  { icon: Star, label: "4.4 rating" },
  { icon: BadgeCheck, label: `${TITLE_COUNT}+ titles` },
  { icon: RotateCcw, label: "7-day replacement" },
  { icon: Banknote, label: "Cash on Delivery" },
  { icon: Truck, label: "Free delivery from ₹249" },
];


export default function HomeNavbar({ onSearch }) {
  const { cart, qrCart } = useStore();
  const cartCount = cart.reduce((s, i) => s + (i.qty || 1), 0) + (qrCart?.length || 0);

  const [ready, setReady] = useState(false); // saved pincode read yet?
  const [pin, setPin] = useState("");
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [wallet, setWallet] = useState(null); // null = loading, number = balance
  const [walletKnown, setWalletKnown] = useState(true);

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


  const fast = pin && isMaharashtraPin(pin);
  const eta = !pin ? "4–9 days" : fast ? "1–5 days" : "4–9 days";

  return (
    <>
    {/* ===== Desktop (≥1024px): promo strip + floating navbar ===== */}
    <div className="hnd">
      <div className="hnd-promo">
        {TRUST.map(({ icon: Ic, label, hi }) => (
          <span key={label} className={hi ? "hi" : undefined}>
            <Ic size={14} strokeWidth={2.4} /> {label}
          </span>
        ))}
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
          <GetAppButton source="home_nav_desktop" />
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

    <div className="hn hn2">
      {/* Black trust strip — slow endless marquee (list doubled for a seamless loop) */}
      <div className="hn2-strip">
        <div className="hn2-strip-track">
          {[0, 1].map((k) => (
            <ul key={k} className="hn2-strip-list" aria-hidden={k === 1 ? "true" : undefined}>
              {TRUST.map(({ icon: Ic, label, hi }) => (
                <li key={label} className={hi ? "hi" : undefined}>
                  <Ic size={13} strokeWidth={2.4} />
                  {label}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {/* White bar: brand left; search, account, cart right */}
      <div className="hn2-bar">
        <Link href="/" className="hn2-brand" aria-label="TheBookX home">
          <span className="hn2-logo">TheBookX</span>
          <span className="hn2-logo-sub">formerly Uskillbook</span>
        </Link>
        <div className="hn2-acts">
          <button
            type="button"
            className="hn2-ic"
            aria-label="Search books"
            onClick={() => {
              trackEvent("search_opened", { source: "home_header" });
              onSearch?.();
            }}
          >
            <Search size={20} />
          </button>
          {walletKnown && wallet > 0 && (
            <Link href="/wallet" className="hn2-wallet" aria-label={`Wallet ₹${wallet}`}>
              <Wallet size={14} />₹{wallet}
            </Link>
          )}
          <Link href="/profile" className="hn2-ic" aria-label="Account">
            <User size={20} />
          </Link>
          <Link href="/bag" className="hn2-ic hn2-cart" aria-label="Cart" id="cart-fly-target">
            <HiOutlineShoppingBag size={21} />
            {cartCount > 0 && <span className="hn-badge">{cartCount > 99 ? "99+" : cartCount}</span>}
          </Link>
        </div>
      </div>

      {/* Delivery promise + pincode, one slim tappable line */}
      <button type="button" className="hn2-del" onClick={openPincodeSheet} aria-label="Change delivery pincode">
        {fast ? <Zap size={14} className="hn2-del-ic fast" /> : <Truck size={14} className="hn2-del-ic" />}
        {ready ? (
          <>
            <span className="hn2-del-eta">
              Delivery in <b>{eta}</b>
            </span>
            <span className={`hn2-del-pin${pin ? "" : " unset"}`}>
              <span className="hn2-del-place">{pin ? `${city ? `${city} · ` : ""}${pin}` : "Set pincode"}</span>
              <ChevronDown size={13} />
            </span>
          </>
        ) : (
          <span className="hn-skel hn-skel-addr" />
        )}
      </button>

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
                <img key={c} src={optImg(c, 40)} alt="" loading="lazy" decoding="async" className={`catrow-cover catrow-cover-${k}`} />
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
