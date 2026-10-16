"use client";

// The homepage's horizontal book rails, packaged for reuse (e.g. the empty-bag
// state). Same data + sections as the homepage.
import { Tag, TrendingUp, Award, Sparkles, Baby } from "lucide-react";
import BookRail from "@/components/BookRail";
import { books as ALL_BOOKS } from "@/utils/book";

const RAIL_ONE_RUPEE = ALL_BOOKS.filter(
  (b) => b.discountedPrice === 1 && b.image,
);
const RAIL_TRENDING = ALL_BOOKS.filter(
  (b) => b.catalogue?.includes("trending") && b.image && b.discountedPrice !== 1,
);
const RAIL_BESTSELLERS = ALL_BOOKS.filter(
  (b) =>
    b.catalogue?.includes("bestseller") && b.image && b.discountedPrice !== 1,
);
const RAIL_NEW_ARRIVALS = [...ALL_BOOKS]
  .slice(-50)
  .reverse()
  .filter((b) => b.image && b.discountedPrice !== 1)
  .slice(0, 24);
const RAIL_CHILDREN = ALL_BOOKS.filter(
  (b) =>
    (b.catalogue?.includes("children") ||
      b.catalogue?.includes("kids") ||
      b.catalogue?.includes("graphic-novel")) &&
    b.image,
);

// idPrefix keeps the rail IDs unique when this renders on a page that already
// has the homepage rails (avoids duplicate DOM ids).
export default function BookRails({ idPrefix = "bag" }) {
  return (
    <>
      <BookRail
        id={`${idPrefix}-rail-rupee`}
        icon={Tag}
        badge="JUST ₹1"
        title="Bestselling books from just ₹1"
        subtitle="Hand-picked reads at an unbeatable price — one ₹1 book per order."
        pill="Lowest price"
        books={RAIL_ONE_RUPEE}
      />
      <BookRail
        id={`${idPrefix}-rail-trending`}
        icon={TrendingUp}
        badge="TRENDING NOW"
        title="What everyone's reading"
        subtitle="Loved by readers this week — grab yours before they're gone."
        books={RAIL_TRENDING}
      />
      <BookRail
        id={`${idPrefix}-rail-bestsellers`}
        icon={Award}
        badge="BESTSELLERS"
        title="Our most-loved books"
        subtitle="Top picks readers keep coming back for."
        books={RAIL_BESTSELLERS}
      />
      <BookRail
        id={`${idPrefix}-rail-new`}
        icon={Sparkles}
        badge="NEW ARRIVALS"
        title="Fresh off the shelf"
        subtitle="Just added — be the first to grab them."
        books={RAIL_NEW_ARRIVALS}
      />
      <BookRail
        id={`${idPrefix}-rail-children`}
        icon={Baby}
        badge="FOR KIDS"
        title="Children's corner"
        subtitle="Fun, colourful reads kids will love — comics, graphic novels & more."
        books={RAIL_CHILDREN}
      />
    </>
  );
}
