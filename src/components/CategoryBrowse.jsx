"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Check, Loader2, LayoutGrid, Search } from "lucide-react";
import { books } from "@/utils/book";
import { getCatalogueData, getBooksByCategory } from "@/utils/catalogueUtils";
import { useStore } from "@/context/StoreContext";
import { showToast } from "@/context/ToastContext";
import SearchOverlay from "@/components/SearchOverlay";

const slugify = (t) =>
  String(t || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const CAP = 24; // books shown per tab

export default function CategoryBrowse() {
  const { cart, addToCart } = useStore();
  const [active, setActive] = useState("all");
  const [switching, setSwitching] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // Tabs: "All" first, then categories with the most books.
  const cats = useMemo(() => {
    const data = getCatalogueData()
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);
    return [{ key: "all", label: "All" }, ...data];
  }, []);

  const shown = useMemo(() => {
    const list =
      active === "all"
        ? books.filter((b) => b.image)
        : getBooksByCategory(active).filter((b) => b.image);
    return list.slice(0, CAP);
  }, [active]);

  if (cats.length <= 1) return null;

  const inCart = (id) => cart.some((i) => i.id === id);
  const oneRupeeInCartId =
    cart.find((i) => {
      const b = books.find((x) => x.id === i.id);
      return b?.discountedPrice === 1;
    })?.id || null;

  const selectTab = (key) => {
    if (key === active) return;
    setSwitching(true);
    setActive(key);
    // Brief, interactive loader while the grid swaps.
    setTimeout(() => setSwitching(false), 480);
  };

  const handleAdd = (book) => {
    if (loadingId) return;
    if (inCart(book.id)) {
      showToast("It's already in your bag 🛍️", "info");
      return;
    }
    if (
      book.discountedPrice === 1 &&
      oneRupeeInCartId &&
      oneRupeeInCartId !== book.id
    ) {
      showToast(
        "Just one ₹1 book per order 😊 Remove the one in your bag to pick this instead.",
        "info",
      );
      return;
    }
    setLoadingId(book.id);
    setTimeout(() => {
      addToCart(book.id);
      setLoadingId(null);
      showToast(`Added to your bag 🎉 “${book.name}”`, "success");
    }, 450);
  };

  return (
    <section className="or1-section cb-section" aria-labelledby="cb-heading">
      <div className="section-1200 or1-inner">
        <div className="or1-head">
          <div className="or1-head-left">
            <span className="or1-badge">
              <LayoutGrid size={13} /> BROWSE
            </span>
            <h2 id="cb-heading" className="or1-title">
              Find your next read
            </h2>
            <p className="or1-sub">Pick a category to explore.</p>
          </div>
        </div>

        {/* Underlined, scrollable category tabs + a pinned search button */}
        <div className="cb-tabbar">
          <div className="cb-tabs" role="tablist">
            {cats.map((c) => (
              <button
                key={c.key}
                type="button"
                role="tab"
                aria-selected={active === c.key}
                className={`cb-tab${active === c.key ? " on" : ""}`}
                onClick={() => selectTab(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="cb-search"
            onClick={() => setSearchOpen(true)}
            aria-label="Search books"
          >
            <Search size={18} />
          </button>
        </div>

        {/* Compact 2-row scrollable rail (same as ₹1 / trending) or loader */}
        {switching ? (
          <div className="or1-scroll" aria-busy="true">
            <div className="or1-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div className="cb-skel" key={i}>
                  <span className="cb-skel-cover">
                    <span className="cb-skel-shine" />
                  </span>
                  <span className="cb-skel-line w70" />
                  <span className="cb-skel-line w40" />
                </div>
              ))}
            </div>
          </div>
        ) : shown.length === 0 ? (
          <p className="cb-empty">No books in this category yet.</p>
        ) : (
          <div className="or1-scroll">
          <div className="or1-grid">
            {shown.map((b) => {
              const on = inCart(b.id);
              const loading = loadingId === b.id;
              const url = `/books/${slugify(b.name)}`;
              const mrp = Number(b.originalPrice) || 0;
              const now = Number(b.discountedPrice) || 0;
              const save = mrp > now ? mrp - now : 0;
              return (
                <div className="or1-card" key={b.id}>
                  <div className="or1-cover">
                    <Link href={url} className="or1-cover-link" aria-label={b.name}>
                      <img src={b.image} alt={b.name} loading="lazy" />
                    </Link>
                    <button
                      type="button"
                      className={`or1-add${on ? " on" : ""}${loading ? " loading" : ""}`}
                      onClick={() => handleAdd(b)}
                      disabled={loading}
                      aria-label={on ? "In your bag" : `Add ${b.name} to bag`}
                    >
                      {loading ? (
                        <Loader2 size={16} className="or1-spin" />
                      ) : on ? (
                        <Check size={16} strokeWidth={3} />
                      ) : (
                        <Plus size={18} />
                      )}
                    </button>
                  </div>
                  <Link href={url} className="or1-name">
                    {b.name}
                  </Link>
                  <div className="or1-price">
                    <span className="or1-now">₹{now}</span>
                    {mrp > now && <span className="or1-mrp">₹{mrp}</span>}
                  </div>
                  {save > 0 && (
                    <span className="or1-save-tag">You save ₹{save}</span>
                  )}
                </div>
              );
            })}
          </div>
          </div>
        )}
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </section>
  );
}
