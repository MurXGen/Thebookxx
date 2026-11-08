"use client";

// /books — find a category fast: filter box, Popular / A–Z sort, the biggest
// shelves featured on top, then every category as a crawlable link card.

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, X, ChevronRight, BookOpen } from "lucide-react";
import CartBar from "@/components/CartBar";
import MobileBottomNav from "@/components/MobileBottomNav";
import SearchOverlay from "@/components/SearchOverlay";

const FEATURED = 4;

function Fan({ covers, color, big = false }) {
  const list = covers.slice(0, 3);
  return (
    <span
      className={`bkb-fan${big ? " big" : ""}`}
      style={{ background: `linear-gradient(160deg, ${color}26, ${color}0d)` }}
      aria-hidden="true"
    >
      {list.length ? (
        list.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src + i} src={src} alt="" loading="lazy" className={`bkb-cv n${list.length} i${i}`} />
        ))
      ) : (
        <BookOpen size={24} style={{ color }} />
      )}
    </span>
  );
}

function CatCard({ c, big = false }) {
  return (
    <Link href={`/category/${c.slug}`} className={`bkb-card${big ? " big" : ""}`}>
      <Fan covers={c.covers} color={c.color} big={big} />
      <span className="bkb-body">
        <span className="bkb-name">{c.label}</span>
        <span className="bkb-meta">
          {c.count} books
          {c.from && <em>From ₹{c.from}</em>}
        </span>
      </span>
      <ChevronRight size={16} className="bkb-go" aria-hidden="true" />
    </Link>
  );
}

export default function BooksBrowser({ categories, totalBooks }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("popular");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchSeed, setSearchSeed] = useState("");

  const query = q.trim().toLowerCase();
  const list = useMemo(() => {
    let l = categories;
    if (query) l = l.filter((c) => c.label.toLowerCase().includes(query) || c.key.includes(query));
    if (sort === "az") l = [...l].sort((a, b) => a.label.localeCompare(b.label));
    return l;
  }, [categories, query, sort]);

  const showFeatured = !query && sort === "popular";
  const featured = showFeatured ? list.slice(0, FEATURED) : [];
  const rest = showFeatured ? list.slice(FEATURED) : list;

  const openSearch = (seed = "") => {
    setSearchSeed(seed);
    setSearchOpen(true);
  };

  return (
    <>
      <header className="bkb-top">
        <div className="bkb-top-in">
          <button type="button" className="bkb-icon" onClick={() => router.push("/")} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <span className="bkb-top-title">Categories</span>
          <button type="button" className="bkb-icon" onClick={() => openSearch()} aria-label="Search books">
            <Search size={20} />
          </button>
        </div>
      </header>

      <main className="bkb">
        <div className="bkb-hero">
          <h1>Browse books by category</h1>
          <p>
            {categories.length} categories · {totalBooks}+ books · Cash on Delivery
          </p>
        </div>

        <div className="bkb-tools">
          <label className="bkb-find">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Find a category"
              aria-label="Find a category"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} aria-label="Clear">
                <X size={16} />
              </button>
            )}
          </label>
          <div className="bkb-sort" role="tablist" aria-label="Sort categories">
            {[
              ["popular", "Popular"],
              ["az", "A–Z"],
            ].map(([k, l]) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={sort === k}
                className={sort === k ? "on" : ""}
                onClick={() => setSort(k)}
                data-no-busy
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {featured.length > 0 && (
          <section className="bkb-sec" aria-labelledby="bkb-top-h">
            <h2 id="bkb-top-h" className="bkb-h2">Biggest shelves</h2>
            <div className="bkb-feat">
              {featured.map((c) => (
                <CatCard key={c.key} c={c} big />
              ))}
            </div>
          </section>
        )}

        {rest.length > 0 && (
          <section className="bkb-sec" aria-labelledby="bkb-all-h">
            <h2 id="bkb-all-h" className="bkb-h2">
              {query ? `${list.length} match${list.length === 1 ? "" : "es"}` : showFeatured ? "More categories" : "All categories"}
            </h2>
            <div className="bkb-grid">
              {rest.map((c) => (
                <CatCard key={c.key} c={c} />
              ))}
            </div>
          </section>
        )}

        {list.length === 0 && (
          <div className="bkb-empty">
            <b>No category called “{q.trim()}”</b>
            <span>It might still be a book title or an author.</span>
            <button type="button" className="bkb-empty-btn" onClick={() => openSearch(q.trim())}>
              <Search size={16} /> Search books for “{q.trim()}”
            </button>
          </div>
        )}

        <section className="bkb-seo" aria-labelledby="bkb-seo-h">
          <h2 id="bkb-seo-h">Buy books online by category</h2>
          <p>
            TheBookX stocks {totalBooks}+ genuine books across {categories.length} categories, from{" "}
            {categories.slice(0, 6).map((c, i, arr) => (
              <span key={c.key}>
                <Link href={`/category/${c.slug}`}>{c.label.toLowerCase()}</Link>
                {i < arr.length - 2 ? ", " : i === arr.length - 2 ? " and " : ""}
              </span>
            ))}{" "}
            to niche shelves. Every order ships within a day with Cash on Delivery, free delivery above ₹199 and
            7-day returns.
          </p>
        </section>
      </main>

      <CartBar />
      <MobileBottomNav />
      <SearchOverlay
        key={searchSeed}
        open={searchOpen}
        initialQuery={searchSeed}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
