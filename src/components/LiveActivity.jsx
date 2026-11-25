"use client";
import { optImg } from "@/lib/optImg";
import "./LiveActivity.styles.css";

import { useEffect, useRef, useState } from "react";
import { ShoppingBag, Zap, BookPlus, Star, Camera } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { REVIEWS } from "./ReviewGallery";

const ICONS = {
  order: { Icon: ShoppingBag, cls: "la-ic-order" },
  faster: { Icon: Zap, cls: "la-ic-fast" },
  cart: { Icon: BookPlus, cls: "la-ic-cart" },
  review: { Icon: Star, cls: "la-ic-review" },
};

/**
 * "Readers loving TheBookX" — real orders, Faster-delivery picks, books going
 * into bags and reader reviews, as two endless rows of cards drifting in
 * opposite directions (pause on hover / press). Data from /api/live-activity
 * (privacy-safe: first names only).
 */
function Card({ e }) {
  const { Icon, cls } = ICONS[e.type] || ICONS.order;
  return (
    <div className="la-card">
      <span className={`la-ic ${cls}`}>
        <Icon size={15} />
      </span>
      <span className="la-txt">
        <span className="la-line">
          <b>{e.name}</b>
          {e.city ? <span className="la-city"> · {e.city}</span> : null}{" "}
          {e.type === "review" && e.rating ? (
            <span className="la-stars" aria-label={`${e.rating} stars`}>
              {"★".repeat(e.rating)}
            </span>
          ) : null}
        </span>
        <span className="la-what">{e.text}</span>
        <span className="la-time">{e.time}</span>
      </span>
    </div>
  );
}

function Row({ items, reverse, duration, render }) {
  return (
    <div className={`la-row${reverse ? " rev" : ""}`}>
      <div className="la-track" style={{ animationDuration: `${duration}s` }}>
        {[0, 1].map((copy) => (
          <div key={copy} className="la-group" aria-hidden={copy === 1 ? "true" : undefined}>
            {items.map((e, i) => render(e, `${copy}-${i}`, copy === 1))}
          </div>
        ))}
      </div>
    </div>
  );
}

// A real reader photo tile (from the reader-photos gallery).
// Shimmer skeleton until the image loads; a photo that fails is dropped
// instead of showing its alt text.
function Photo({ r, hidden }) {
  const imgRef = useRef(null);
  const [state, setState] = useState("loading"); // loading | ok | failed
  // Cached images can finish before React attaches onLoad/onError.
  useEffect(() => {
    const el = imgRef.current;
    if (!el?.complete) return;
    const t = setTimeout(() => setState(el.naturalWidth > 0 ? "ok" : "failed"), 0);
    return () => clearTimeout(t);
  }, []);
  if (state === "failed") return null;
  return (
    <figure className={`la-photo${state === "loading" ? " is-loading" : ""}`}>
      <img
        ref={imgRef}
        src={optImg(r.img, 118)}
        alt={hidden ? "" : r.alt || `TheBookX reader photo${r.name ? ` from ${r.name}` : ""}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setState("ok")}
        onError={() => setState("failed")}
      />
      <figcaption className="la-photo-cap">
        {r.rating ? (
          <span className="la-photo-stars" aria-label={`${r.rating} out of 5`}>{"★".repeat(r.rating)}</span>
        ) : (
          <span className="la-photo-tag">Customer photo</span>
        )}
        <span className="la-photo-who">{r.name ? `${r.name.split(" ")[0]} · ${r.city}` : (r.books || []).slice(0, 2).join(" · ")}</span>
      </figcaption>
    </figure>
  );
}

const SHARE_URL = `https://wa.me/917710892108?text=${encodeURIComponent("Hi TheBookX! Sharing a photo of the books I received 📚")}`;

export default function LiveActivity() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/live-activity")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && d?.events?.length && setData(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const events = data?.events || [];
  const photos = REVIEWS.filter((r) => r.img);

  return (
    <section id="hs-reviews" className="la la-marquee hs-anchor" aria-labelledby="la-title">
      <div className="la-head">
        <span id="la-title" className="la-label">
          <span className="la-live" aria-hidden="true" />
          Readers loving <b>TheBookX</b>
        </span>
        <span className="la-score" aria-label="Rated 4.4 out of 5">
          <Star size={12} fill="#f59e0b" stroke="#f59e0b" /> 4.4
        </span>
      </div>
      <span className="la-sub">
        <Camera size={13} /> Real photos &amp; orders from readers across India
      </span>

      {/* Row 1 — real reader photos */}
      <Row
        items={photos}
        duration={Math.max(36, photos.length * 4)}
        render={(r, key, hidden) => <Photo key={key} r={r} hidden={hidden} />}
      />
      {/* Row 2 — live orders, picks & reviews, drifting the other way */}
      {events.length > 0 && (
        <Row
          items={events.length < 4 ? events.concat(events, events) : events}
          reverse
          duration={Math.max(32, events.length * 6)}
          render={(e, key) => <Card key={key} e={e} />}
        />
      )}

      <a href={SHARE_URL} target="_blank" rel="noopener noreferrer" className="la-share">
        <FaWhatsapp size={15} /> Got your books? Share a photo
      </a>
    </section>
  );
}
