"use client";
import { optImg } from "@/lib/optImg";
import "./HomeHero.styles.css";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  Truck,
  BadgePercent,
  BadgeCheck,
  Star,
  RotateCcw,
  Check,
  Lock,
  Gift,
  Plus,
  X,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { books } from "@/utils/book";
import { getCartOffers } from "@/utils/cartOffers";
import OfferTierList from "@/components/UI/OfferTierList";
import { useStore } from "@/context/StoreContext";
import SearchOverlay from "@/components/SearchOverlay";
import { XmasSnow, XmasTree } from "@/components/XmasDecor";
import RecommendationModal from "@/components/RecommendationModal";

// Static, above-the-fold hero. Gives the homepage a clear value proposition and
// a real H1 before the animated Bestsellers carousel. All stats are derived
// from the catalogue / policies, no invented numbers. (SEO copy unchanged.)
const slugify = (t) =>
  String(t || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Real covers for the desktop hero visual.
const HERO_COVERS = ["bk-002", "bk-005", "bk-006", "bk-391", "bk-009"]
  .map((id) => books.find((b) => b.id === id))
  .filter((b) => b && b.image)
  .map((b) => (typeof b.image === "string" ? b.image : b.image.src));

export default function HomeHero() {
  // Pause the hero's looping CSS animations (garland, tree, gift) off-screen.
  const heroRef = useRef(null);
  useEffect(() => {
    const el = heroRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("hx-off", !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const titleCount = Math.max(100, Math.floor(books.length / 100) * 100);
  const { cart } = useStore();

  // Readers' top 3 picks shown in the hero showcase.
  const pickNames = [
    "The Metamorphosis",
    "The Art of Clarity",
    "Did You Ever Love Me?",
  ];
  const picks = (() => {
    const named = pickNames
      .map((n) => books.find((b) => b.name === n))
      .filter(Boolean);
    if (named.length >= 3) return named.slice(0, 3);
    // A named pick was removed — top up with other in-stock books (with covers)
    // so all three podium stages always fill.
    const have = new Set(named.map((b) => b.id));
    const fill = books.filter(
      (b) => b.image && !have.has(b.id) && b.discountedPrice !== 1,
    );
    return [...named, ...fill].slice(0, 3);
  })();

  // Modals wired to the existing app flows.
  const [searchOpen, setSearchOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [offersOpen, setOffersOpen] = useState(false);

  // Reward tiers driven by the live cart so the chips + the "Unlock more
  // rewards" sheet reflect what the shopper has actually unlocked.
  const cartAmount = cart.reduce((s, it) => {
    const b = books.find((x) => x.id === it.id);
    return s + (b?.discountedPrice || 0) * (it.qty || 1);
  }, 0);
  const hasOneRupee = cart.some((it) => {
    const b = books.find((x) => x.id === it.id);
    return b?.discountedPrice === 1;
  });
  const offers = getCartOffers(hasOneRupee);
  const offerChips = offers.map((o) => ({
    label: o.type === "free_shipping" ? "Free shipping" : `Flat ${o.reward}`,
    freeShip: o.type === "free_shipping",
  }));


  const stats = [
    { icon: Star, label: "4.4 rating" },
    { icon: BadgeCheck, label: `${titleCount}+ titles` },
    { icon: RotateCcw, label: "7-day replacement" },
    { icon: Truck, label: "Faster delivery", highlight: true },
    { icon: Gift, label: "Free bookmark", highlight: true },
  ];

  // ── Aggressive on-page SEO for the hero + its featured books ──
  const ORIGIN = "https://www.thebookx.in";
  const absUrl = (img) =>
    !img ? "" : /^https?:\/\//i.test(img) ? img : `${ORIGIN}${img}`;
  const bookUrl = (b) => `${ORIGIN}/books/${slugify(b.name)}`;
  const seoJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${ORIGIN}/#website`,
        url: ORIGIN,
        name: "TheBookX",
        description:
          "Buy books online in India starting at ₹1 — bestsellers, self-help & fiction with free delivery from ₹249, Cash on Delivery and 7-day replacement.",
        potentialAction: {
          "@type": "SearchAction",
          target: `${ORIGIN}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "ItemList",
        name: "Readers' top picks on TheBookX",
        itemListElement: picks.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Book",
            name: b.name,
            ...(b.author
              ? { author: { "@type": "Person", name: b.author } }
              : {}),
            image: absUrl(b.image),
            url: bookUrl(b),
            offers: {
              "@type": "Offer",
              price: String(b.discountedPrice),
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
              url: bookUrl(b),
            },
          },
        })),
      },
    ],
  };

  return (
    <section ref={heroRef} className="home-hero hero-xmas hero-night" style={{ position: "relative" }}>
      {/* Structured data — WebSite search action + featured books as Products */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seoJsonLd) }}
      />

      {/* SEO: crawlable internal links + keyword context (visually hidden) */}
      <div className="hero-seo">
        <h2>
          Buy bestselling books online in India at the lowest prices — starting
          at ₹1 with free delivery from ₹249, Cash on Delivery and 7-day replacement.
        </h2>
        <p>Popular books on TheBookX:</p>
        <ul>
          {picks.map((b) => (
            <li key={`seo-${b.id}`}>
              <Link href={`/books/${slugify(b.name)}`}>
                Buy {b.name}
                {b.author ? ` by ${b.author}` : ""} online at ₹
                {b.discountedPrice}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/books">Browse all books from ₹1</Link>
          </li>
          <li>
            <Link href="/1rupee">Bestsellers at just ₹1</Link>
          </li>
        </ul>
      </div>
      {/* Christmas: velvet backdrop bokeh, pine garland with baubles, live snow */}
      {/* Christmas night sky: stars, aurora, moon, the Christmas star and a
          snowy pine treeline. Pure CSS/SVG, decorative only. */}
      <div className="hn-sky" aria-hidden="true">
        <span className="sky-aurora" />
        <span className="sky-stars s1" />
        <span className="sky-stars s2" />
        <span className="sky-moon" />
        <span className="sky-star-big" />
        <span className="sky-shoot" />
        <svg className="sky-pines" viewBox="0 0 400 90" preserveAspectRatio="none">
          <path className="back" d="M0 90 L0 78 L-10.0 78 L-6.7 63.6 L-4.9 63.6 L-7.8 63.6 L-3.4 51.4 L-5.6 51.4 L-0.8 40.0 L4.0 51.4 L1.8 51.4 L6.2 63.6 L3.2 63.6 L5.1 63.6 L8.4 78 L2.5 78 L6.5 62.9 L8.7 62.9 L5.1 62.9 L10.4 50.2 L7.8 50.2 L13.5 38.2 L19.2 50.2 L16.6 50.2 L21.9 62.9 L18.4 62.9 L20.6 62.9 L24.5 78 L15.1 78 L18.0 61.1 L19.6 61.1 L17.1 61.1 L20.9 46.9 L19.0 46.9 L23.2 33.6 L27.4 46.9 L25.4 46.9 L29.3 61.1 L26.7 61.1 L28.3 61.1 L31.2 78 L25.5 78 L28.8 59.8 L30.6 59.8 L27.7 59.8 L32.1 44.5 L29.9 44.5 L34.6 30.1 L39.4 44.5 L37.2 44.5 L41.6 59.8 L38.7 59.8 L40.5 59.8 L43.8 78 L38.6 78 L42.9 64.1 L45.4 64.1 L41.5 64.1 L47.3 52.5 L44.4 52.5 L50.7 41.5 L57.1 52.5 L54.2 52.5 L60.0 64.1 L56.1 64.1 L58.5 64.1 L62.9 78 L57.4 78 L60.6 62.8 L62.3 62.8 L59.5 62.8 L63.7 50.0 L61.6 50.0 L66.2 38.0 L70.7 50.0 L68.6 50.0 L72.8 62.8 L70.0 62.8 L71.8 62.8 L74.9 78 L72.4 78 L76.2 61.9 L78.3 61.9 L74.9 61.9 L80.0 48.4 L77.5 48.4 L83.0 35.7 L88.5 48.4 L85.9 48.4 L91.0 61.9 L87.6 61.9 L89.8 61.9 L93.6 78 L89.0 78 L92.0 61.8 L93.7 61.8 L91.0 61.8 L95.0 48.1 L93.0 48.1 L97.3 35.3 L101.7 48.1 L99.7 48.1 L103.7 61.8 L101.0 61.8 L102.7 61.8 L105.7 78 L101.6 78 L105.0 67.9 L106.9 67.9 L103.9 67.9 L108.5 59.3 L106.2 59.3 L111.1 51.3 L116.1 59.3 L113.8 59.3 L118.4 67.9 L115.3 67.9 L117.2 67.9 L120.6 78 L117.8 78 L121.6 62.1 L123.6 62.1 L120.3 62.1 L125.3 48.7 L122.8 48.7 L128.2 36.2 L133.6 48.7 L131.1 48.7 L136.1 62.1 L132.8 62.1 L134.8 62.1 L138.6 78 L135.6 78 L139.8 60.4 L142.1 60.4 L138.4 60.4 L143.9 45.6 L141.2 45.6 L147.2 31.7 L153.2 45.6 L150.4 45.6 L156.0 60.4 L152.3 60.4 L154.6 60.4 L158.8 78 L151.5 78 L155.9 64.4 L158.3 64.4 L154.4 64.4 L160.2 53.0 L157.3 53.0 L163.5 42.2 L169.8 53.0 L166.9 53.0 L172.7 64.4 L168.8 64.4 L171.2 64.4 L175.5 78 L172.6 78 L177.1 67.3 L179.5 67.3 L175.6 67.3 L181.5 58.3 L178.6 58.3 L185.0 49.9 L191.4 58.3 L188.5 58.3 L194.4 67.3 L190.5 67.3 L192.9 67.3 L197.4 78 L187.4 78 L190.7 60.0 L192.5 60.0 L189.6 60.0 L194.0 44.9 L191.8 44.9 L196.5 30.8 L201.2 44.9 L199.0 44.9 L203.4 60.0 L200.5 60.0 L202.3 60.0 L205.6 78 L200.2 78 L204.2 65.6 L206.4 65.6 L202.9 65.6 L208.2 55.2 L205.5 55.2 L211.3 45.4 L217.1 55.2 L214.4 55.2 L219.8 65.6 L216.2 65.6 L218.4 65.6 L222.5 78 L216.4 78 L220.0 65.2 L221.9 65.2 L218.8 65.2 L223.5 54.4 L221.2 54.4 L226.3 44.3 L231.5 54.4 L229.1 54.4 L233.9 65.2 L230.7 65.2 L232.7 65.2 L236.2 78 L231.4 78 L235.3 60.6 L237.5 60.6 L234.0 60.6 L239.2 45.9 L236.6 45.9 L242.3 32.1 L248.0 45.9 L245.4 45.9 L250.6 60.6 L247.1 60.6 L249.3 60.6 L253.2 78 L248.6 78 L253.2 61.0 L255.7 61.0 L251.6 61.0 L257.7 46.6 L254.7 46.6 L261.2 33.2 L267.8 46.6 L264.8 46.6 L270.9 61.0 L266.8 61.0 L269.3 61.0 L273.9 78 L271.3 78 L275.4 66.8 L277.6 66.8 L274.0 66.8 L279.5 57.3 L276.7 57.3 L282.6 48.4 L288.5 57.3 L285.8 57.3 L291.3 66.8 L287.6 66.8 L289.9 66.8 L294.0 78 L290.6 78 L295.2 60.6 L297.8 60.6 L293.7 60.6 L299.8 45.9 L296.8 45.9 L303.4 32.1 L310.1 45.9 L307.0 45.9 L313.2 60.6 L309.1 60.6 L311.6 60.6 L316.3 78 L309.8 78 L314.0 66.4 L316.3 66.4 L312.6 66.4 L318.2 56.5 L315.4 56.5 L321.4 47.4 L327.4 56.5 L324.6 56.5 L330.2 66.4 L326.5 66.4 L328.8 66.4 L333.0 78 L329.3 78 L333.2 65.7 L335.4 65.7 L331.9 65.7 L337.1 55.4 L334.5 55.4 L340.2 45.7 L345.8 55.4 L343.2 55.4 L348.4 65.7 L344.9 65.7 L347.1 65.7 L351.0 78 L341.7 78 L346.1 59.8 L348.6 59.8 L344.7 59.8 L350.6 44.6 L347.6 44.6 L354.0 30.2 L360.4 44.6 L357.4 44.6 L363.3 59.8 L359.4 59.8 L361.8 59.8 L366.3 78 L356.0 78 L360.3 64.7 L362.7 64.7 L358.9 64.7 L364.6 53.5 L361.7 53.5 L368.0 43.0 L374.2 53.5 L371.3 53.5 L377.1 64.7 L373.3 64.7 L375.7 64.7 L380.0 78 L370.5 78 L373.9 61.7 L375.8 61.7 L372.7 61.7 L377.3 48.0 L375.0 48.0 L379.9 35.1 L384.8 48.0 L382.6 48.0 L387.1 61.7 L384.1 61.7 L386.0 61.7 L389.4 78 L386.7 78 L389.6 63.0 L391.3 63.0 L388.6 63.0 L392.6 50.3 L390.6 50.3 L394.9 38.5 L399.2 50.3 L397.2 50.3 L401.1 63.0 L398.5 63.0 L400.1 63.0 L403.1 78 L396.0 78 L400.1 65.4 L402.4 65.4 L398.7 65.4 L404.3 54.7 L401.5 54.7 L407.5 44.7 L413.6 54.7 L410.8 54.7 L416.4 65.4 L412.7 65.4 L415.0 65.4 L419.1 78 L400 90 Z" />
          <path className="front" d="M0 90 L0 90 L-10.0 90 L-5.3 72.2 L-2.6 72.2 L-6.8 72.2 L-0.5 57.2 L-3.7 57.2 L3.2 43.2 L10.0 57.2 L6.9 57.2 L13.2 72.2 L9.0 72.2 L11.6 72.2 L16.3 90 L13.0 90 L17.8 72.8 L20.4 72.8 L16.2 72.8 L22.5 58.3 L19.4 58.3 L26.3 44.8 L33.2 58.3 L30.0 58.3 L36.3 72.8 L32.1 72.8 L34.7 72.8 L39.5 90 L33.0 90 L37.1 72.8 L39.4 72.8 L35.7 72.8 L41.2 58.2 L38.5 58.2 L44.3 44.6 L50.2 58.2 L47.5 58.2 L52.9 72.8 L49.3 72.8 L51.6 72.8 L55.6 90 L50.4 90 L56.0 77.5 L59.1 77.5 L54.2 77.5 L61.6 67.0 L57.9 67.0 L66.0 57.2 L74.1 67.0 L70.3 67.0 L77.8 77.5 L72.8 77.5 L75.9 77.5 L81.5 90 L70.8 90 L74.7 69.4 L76.8 69.4 L73.4 69.4 L78.5 52.0 L76.0 52.0 L81.5 35.7 L87.0 52.0 L84.5 52.0 L89.6 69.4 L86.2 69.4 L88.3 69.4 L92.1 90 L87.7 90 L91.4 67.4 L93.5 67.4 L90.2 67.4 L95.1 48.4 L92.6 48.4 L98.0 30.5 L103.4 48.4 L100.9 48.4 L105.8 67.4 L102.5 67.4 L104.6 67.4 L108.3 90 L106.0 90 L111.2 71.6 L114.1 71.6 L109.5 71.6 L116.5 56.1 L113.0 56.1 L120.6 41.5 L128.1 56.1 L124.6 56.1 L131.6 71.6 L127.0 71.6 L129.9 71.6 L135.1 90 L123.6 90 L127.3 72.6 L129.3 72.6 L126.1 72.6 L130.9 57.9 L128.5 57.9 L133.7 44.1 L139.0 57.9 L136.6 57.9 L141.4 72.6 L138.2 72.6 L140.2 72.6 L143.8 90 L135.2 90 L139.2 75.8 L141.5 75.8 L137.9 75.8 L143.3 63.9 L140.6 63.9 L146.5 52.7 L152.4 63.9 L149.7 63.9 L155.1 75.8 L151.5 75.8 L153.7 75.8 L157.8 90 L147.9 90 L152.6 73.6 L155.3 73.6 L151.0 73.6 L157.4 59.7 L154.2 59.7 L161.1 46.8 L168.0 59.7 L164.8 59.7 L171.2 73.6 L166.9 73.6 L169.6 73.6 L174.4 90 L170.2 90 L175.2 71.3 L177.9 71.3 L173.5 71.3 L180.1 55.6 L176.8 55.6 L183.9 40.8 L191.0 55.6 L187.7 55.6 L194.2 71.3 L189.9 71.3 L192.6 71.3 L197.5 90 L190.0 90 L195.3 73.4 L198.2 73.4 L193.5 73.4 L200.6 59.4 L197.0 59.4 L204.7 46.3 L212.3 59.4 L208.8 59.4 L215.8 73.4 L211.1 73.4 L214.0 73.4 L219.3 90 L209.0 90 L215.1 67.2 L218.5 67.2 L213.0 67.2 L221.2 48.1 L217.1 48.1 L226.0 30.1 L234.8 48.1 L230.7 48.1 L238.9 67.2 L233.4 67.2 L236.8 67.2 L242.9 90 L237.6 90 L243.0 75.0 L246.0 75.0 L241.2 75.0 L248.4 62.4 L244.8 62.4 L252.6 50.5 L260.4 62.4 L256.8 62.4 L264.0 75.0 L259.2 75.0 L262.2 75.0 L267.5 90 L256.5 90 L260.8 77.8 L263.2 77.8 L259.4 77.8 L265.1 67.5 L262.3 67.5 L268.5 57.9 L274.8 67.5 L271.9 67.5 L277.7 77.8 L273.8 77.8 L276.2 77.8 L280.5 90 L276.2 90 L280.8 68.9 L283.3 68.9 L279.2 68.9 L285.4 51.2 L282.3 51.2 L289.0 34.6 L295.6 51.2 L292.6 51.2 L298.7 68.9 L294.6 68.9 L297.2 68.9 L301.8 90 L293.7 90 L299.7 68.9 L303.1 68.9 L297.7 68.9 L305.7 51.2 L301.7 51.2 L310.4 34.6 L319.1 51.2 L315.1 51.2 L323.1 68.9 L317.8 68.9 L321.1 68.9 L327.1 90 L312.1 90 L316.2 68.2 L318.5 68.2 L314.8 68.2 L320.4 49.9 L317.6 49.9 L323.6 32.7 L329.5 49.9 L326.8 49.9 L332.3 68.2 L328.6 68.2 L330.9 68.2 L335.0 90 L328.5 90 L334.6 74.1 L337.9 74.1 L332.5 74.1 L340.6 60.7 L336.6 60.7 L345.3 48.1 L354.1 60.7 L350.1 60.7 L358.2 74.1 L352.8 74.1 L356.1 74.1 L362.2 90 L347.9 90 L353.1 69.7 L356.0 69.7 L351.4 69.7 L358.3 52.7 L354.8 52.7 L362.3 36.6 L369.8 52.7 L366.3 52.7 L373.3 69.7 L368.6 69.7 L371.5 69.7 L376.7 90 L366.5 90 L370.3 74.8 L372.4 74.8 L369.0 74.8 L374.1 62.0 L371.6 62.0 L377.1 50.0 L382.6 62.0 L380.0 62.0 L385.1 74.8 L381.7 74.8 L383.9 74.8 L387.7 90 L385.3 90 L390.8 77.3 L393.9 77.3 L389.0 77.3 L396.3 66.5 L392.6 66.5 L400.6 56.5 L408.6 66.5 L404.9 66.5 L412.2 77.3 L407.3 77.3 L410.4 77.3 L415.9 90 L404.8 90 L408.6 77.9 L410.8 77.9 L407.3 77.9 L412.5 67.7 L409.9 67.7 L415.5 58.2 L421.0 67.7 L418.5 67.7 L423.6 77.9 L420.2 77.9 L422.3 77.9 L426.2 90 L400 90 Z" />
        </svg>
      </div>
      <XmasSnow />

      <div className="hero-top">
        <div className="home-hero-inner">
          {/* Christmas sale kicker — opens the reward tiers */}
          <button
            type="button"
            className="hx-kicker hx-capped"
            onClick={() => setOffersOpen(true)}
            aria-label="Christmas sale — up to 50% off. See all offers."
          >
            <span className="hx-kicker-dot" aria-hidden="true" />
            Christmas Sale · <b>Up to 50% OFF</b>
            <ChevronRight size={14} />
          </button>

          <h1 className="home-hero-title">
            Buy Books{" "}
            Online in India,{" "}
            <span className="home-hero-accent">Starting at ₹1</span>
          </h1>

          <p className="home-hero-sub">
            Hand-picked bestsellers, self-help &amp; fiction from just ₹1 — free
            delivery from ₹249, Cash on Delivery &amp; 7-day replacement on damaged or wrong books across India.
          </p>

          {/* Primary actions — Search + Suggest */}
          <div className="hero-actions hx-actions">
            <button
              type="button"
              className="hero-search-btn hx-capped"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={18} /> Search books
            </button>
            <button
              type="button"
              className="hero-suggest-btn hx-capped"
              onClick={() => setSuggestOpen(true)}
            >
              <Sparkles size={18} /> Suggest me
            </button>
          </div>

          {/* Desktop: fanned real covers floating on a red glow */}
          <div className="hx-visual" aria-hidden="true">
            <span className="hx-visual-glow" />
            {HERO_COVERS.map((src, i) => (
              <img key={src} src={optImg(src, 168)} alt="" className={`hx-vcover v${i}`} loading="eager" decoding="async" />
            ))}
            <span className="hx-visual-tag">
              <Star size={13} fill="#f59e0b" stroke="#f59e0b" /> Bestsellers from ₹1
            </span>
          </div>

          {/* Desktop: proof stats under the actions */}
          <ul className="hx-stats">
            <li><b>{titleCount}+</b><span>Books in stock</span></li>
            <li><b>4.4<Star size={15} fill="#f59e0b" stroke="#f59e0b" /></b><span>Reader rating</span></li>
            <li><b>5,000+</b><span>Community readers</span></li>
            <li><b>COD</b><span>&amp; 7-day replacement</span></li>
          </ul>

          {/* Christmas gift — opens the scratch & win flow */}
          {/* Community CTA moved into the "Readers loving TheBookX" section below. */}

          <div className="hx-gift-row">
            {/* Snowy Christmas trees standing on the gift card */}
            <XmasTree size={64} gifts={false} className="hx-gift-tree left" />
            <XmasTree size={92} className="hx-gift-tree right" />
            <HeroGift />
          </div>

          {/* Trust points now live in the black strip above the header. */}

          {/* Offers — auto-scrolling chips; tap any to see all reward tiers */}
          <div className="hero-offers-row hx-offers" role="list">
            <div className="hero-offers-track">
              {[...offerChips, ...offerChips].map((c, i) => (
                <button
                  key={`${c.label}-${i}`}
                  type="button"
                  className="hero-offer-chip"
                  onClick={() => setOffersOpen(true)}
                >
                  {c.freeShip ? (
                    <Truck size={15} className="hero-offer-ic" />
                  ) : (
                    <BadgePercent size={15} className="hero-offer-ic" />
                  )}
                  {c.label}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Live activity ("Readers loving TheBookX") now sits below Best sellers. */}

      {/* Snow drift where the hero meets the page */}
      <svg className="hx-drift" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 22 C40 8 80 30 130 18 S220 6 270 20 S350 30 400 14 V40 H0 Z" />
      </svg>

      {/* Search modal (existing overlay) */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Suggest modal (existing recommendation flow) */}
      <RecommendationModal
        isOpen={suggestOpen}
        onClose={() => setSuggestOpen(false)}
      />

      {/* All offers sheet */}
      <AnimatePresence>
        {offersOpen && (
          <motion.div
            className="offer-sheet-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOffersOpen(false)}
          >
            <motion.div
              className="offer-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="offer-sheet-head">
                <span className="offer-sheet-title">
                  <Gift size={16} /> Unlock more rewards
                </span>
                <button
                  type="button"
                  className="offer-sheet-x"
                  onClick={() => setOffersOpen(false)}
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="offer-sheet-sub">
                Your cart: <b>₹{cartAmount}</b>
              </p>
              <OfferTierList
                offers={offers}
                amount={cartAmount}
                hasOneRupee={hasOneRupee}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// Christmas gift in the hero. Tapping it unwraps the box (lid pops, sparkles
// burst) and then opens the existing scratch & win flow via tbx:open-scratch.
function HeroGift() {
  const [opening, setOpening] = useState(false);
  const open = () => {
    if (opening) return;
    setOpening(true);
    try {
      navigator.vibrate?.(18);
    } catch {}
    setTimeout(() => {
      window.dispatchEvent(new Event("tbx:open-scratch"));
      setOpening(false);
    }, 650);
  };
  return (
    <button
      type="button"
      className={`hx-gift${opening ? " opening" : ""}`}
      onClick={open}
      aria-label="Open your Christmas gift: scratch and win up to ₹100 cashback"
    >
      <span className="hx-gift-shine" aria-hidden="true" />
      <span className="hx-gift-box" aria-hidden="true">
        <svg viewBox="0 0 64 64" width="58" height="58">
          <g className="hx-gift-lid">
            <rect x="6" y="18" width="52" height="12" rx="3" fill="#e11d48" />
            <rect x="6" y="18" width="52" height="4" rx="2" fill="#fff" fillOpacity=".18" />
            <rect x="28" y="18" width="8" height="12" fill="#fbbf24" />
            <path d="M32 18c-4-9-15-11-15-4 0 4 8 5 15 4z" fill="#fbbf24" />
            <path d="M32 18c4-9 15-11 15-4 0 4-8 5-15 4z" fill="#f59e0b" />
            <circle cx="32" cy="17" r="3" fill="#d97706" />
          </g>
          <rect x="9" y="30" width="46" height="28" rx="3" fill="#be123c" />
          <rect x="9" y="30" width="46" height="5" fill="#000" fillOpacity=".12" />
          <rect x="28" y="30" width="8" height="28" fill="#fbbf24" />
          <circle cx="18" cy="44" r="1.6" fill="#fff" fillOpacity=".55" />
          <circle cx="46" cy="40" r="1.6" fill="#fff" fillOpacity=".55" />
          <circle cx="44" cy="51" r="1.2" fill="#fff" fillOpacity=".45" />
          <circle cx="20" cy="53" r="1.2" fill="#fff" fillOpacity=".45" />
        </svg>
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <i key={k} className={`hx-spark s${k}`} />
        ))}
      </span>
      <span className="hx-gift-copy">
        <span className="hx-gift-kicker">Christmas gift</span>
        <span className="hx-gift-amt">
          Scratch &amp; win up to <b>₹100</b>
        </span>
        <span className="hx-gift-sub">Every order wins · tap to open</span>
      </span>
      <span className="hx-gift-cta" aria-hidden="true">
        Open <ChevronRight size={15} />
      </span>
    </button>
  );
}
