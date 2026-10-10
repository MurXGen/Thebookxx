"use client";

import { lazy, Suspense, useState, useEffect } from "react";
import { motion } from "framer-motion";
import AllBooks from "@/components/AllBooks";
import CartBar from "@/components/CartBar";
import Navbar from "@/components/Navbar";
import PincodeModal from "@/components/UI/PincodeModal";
import CountdownTimer from "@/components/UI/CountDownTimer";
import LabelDivider from "@/components/UI/LineDivider";
import BookLoader from "@/components/UI/BookLoader";
import UnlockChip from "@/components/UI/UnlockChip";
import StoreReviews from "@/components/StoreReviews";
import OneRupeeHero from "@/components/OneRupeeHero";
import HomeHero from "@/components/HomeHero";
import QuickReadsPromo from "@/components/QuickReadsPromo";
import QuickReadsTeaser from "@/components/QuickReadsTeaser";
import InvoiceParamModal from "@/components/InvoiceParamModal";
import ReviewGallery from "@/components/ReviewGallery";
import BundleDeals from "@/components/BundleDeals";
import CategoryBrowse from "@/components/CategoryBrowse";
import BookRail from "@/components/BookRail";
import { books as ALL_BOOKS } from "@/utils/book";
import { Sparkles, TrendingUp, Award, Tag } from "lucide-react";
import { BooksSkeleton } from "@/components/UI/BookCardSkeleton";

// Book lists for the homepage rails (real BookCard UI, like All Books).
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

// Lazy load components with named exports
const BestsellerStage = lazy(() => import("@/components/BestsellerStage"));
const RecommendationModal = lazy(
  () => import("@/components/RecommendationModal"),
);
const OffersGift = lazy(() => import("@/components/OffersGift"));
// eslint-disable-next-line no-unused-vars
const CatalogueSection = lazy(() => import("@/components/CatalogueSection"));
const ComboDeals = lazy(() => import("@/components/ComboDeals"));
// Kept for reference — the old ₹1 rail, now replaced by <OneRupeeGrid /> above.
// eslint-disable-next-line no-unused-vars
const OneRupeeDeals = lazy(() => import("@/components/OneRupeeDeals"));
const RecentlyViewed = lazy(() => import("@/components/RecentlyViewed"));
// Replaced by compact 2-row rails (NewlyAddedGrid / TrendingGrid); kept for reuse.
// eslint-disable-next-line no-unused-vars
const NewlyAddedBooks = lazy(() => import("@/components/NewlyAddedBooks"));
// eslint-disable-next-line no-unused-vars
const TrendingBooks = lazy(() => import("@/components/TrendingBooks"));
const UrgencyOffer = lazy(() => import("@/components/UrgencyOffer"));
const IntroVideo = lazy(() => import("@/components/IntroVideo"));
const UnlockModal = lazy(() => import("@/components/UnlockModal"));
const InstallPWA = lazy(() => import("@/components/InstallPWA"));

// Loading component with smooth animation
const LoadingFallback = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, filter: "blur(8px)" }}
    animate={{ opacity: 1, filter: "blur(0px)" }}
    exit={{ opacity: 0, filter: "blur(8px)" }}
    transition={{ duration: 0.4, delay }}
    className="flex justify-center items-center py-12"
  >
    <BookLoader />
  </motion.div>
);

// Wrapper component for smooth appearance
const SmoothAppear = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

// Intersection Observer wrapper for scroll-triggered loading
const LazySection = ({ children, threshold = 0.1 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "200px" }, // Load 200px before entering viewport
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return <div ref={setRef}>{isVisible && children}</div>;
};

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen flex flex-col gap-32">
        <Navbar />
        <h1 className="sr-only">
          Buy Books Online in India at Lowest Prices, TheBookX | Books Starting
          at ₹1
        </h1>
        <BooksSkeleton />
        <BooksSkeleton />
      </div>
    );
  }

  const handleOpenUnlockModal = () => {
    // Function to open the unlock modal
    // This should trigger the unlock modal to appear
    setIsUnlockModalOpen(true); // or however you control the unlock modal
  };

  return (
    <>
      {/* Shared invoice — opens the printed receipt when arriving via
          thebookx.in?orderID=… (no scratch card). */}
      <InvoiceParamModal />

      <IntroVideo />

      <Navbar />

      {/* Static hero, provides the visible H1 + value prop above the carousel. */}
      <HomeHero />

      <LazySection threshold={0.05}>
        <Suspense fallback={<BooksSkeleton />}>
          <SmoothAppear delay={0.2}>
            <CatalogueSection />
          </SmoothAppear>
        </Suspense>
      </LazySection>

      {/* Combo offers — curated multi-book bundles, above the ₹1 rail */}
      <LazySection threshold={0.05}>
        <Suspense fallback={<BooksSkeleton />}>
          <SmoothAppear delay={0.28}>
            <ComboDeals />
          </SmoothAppear>
        </Suspense>
      </LazySection>

      {/* Compact 2-row ₹1 books rail — above the review gallery. */}
      {/* <OneRupeeGrid /> */}

      {/* Share & earn now lives as a compact CTA in the navbar (ReviewRewardModal),
          opening the full flow in a slide-up modal. */}

      {/* Frequently-bought-together 3D duo bundles — right below the ₹1 store. */}
      {/* <BundleDeals /> */}

      {/* Compact 2-row trending rail — shows discounted price + savings. */}
      {/* <TrendingGrid /> */}

      {/* Compact 2-row newly-added rail. */}
      {/* <NewlyAddedGrid /> */}

      {/* Category tabs → 2-column book grid with a switch loader. */}
      {/* <CategoryBrowse /> */}

      <PincodeModal />

      {/* <UnlockModal /> */}
      {/* Small QuickReads teaser right below the reviews / write-a-review CTA */}
      <QuickReadsTeaser />

      {/* Review-photo trust gallery — replaces the Bestseller carousel */}
      <ReviewGallery />

      {/* Floating ₹1 gift box temporarily removed */}
      {/* <OneRupeeHero /> */}

      {/* Live-orders social proof now lives inside the hero (HomeHero). */}

      {/* Verified store reviews now live inside ReviewGallery, revealed via its
          "Read verified reviews" CTA. */}

      {/* QuickReads feature promo — below the bestseller + reviews section */}
      <QuickReadsPromo />

      <LazySection threshold={0.05}>
        <Suspense fallback={null}>
          <SmoothAppear delay={0.4}>
            <RecommendationModal />
          </SmoothAppear>
        </Suspense>
      </LazySection>

      {/* ₹1 books rail now lives above the review gallery (OneRupeeGrid).
          The old carousel is kept but hidden:
      <LazySection threshold={0.05}>
        <Suspense fallback={<BooksSkeleton />}>
          <SmoothAppear delay={0.3}>
            <OneRupeeDeals />
          </SmoothAppear>
        </Suspense>
      </LazySection>
      */}

      {/* BookCard rails (same UI as All Books) — above Recently viewed:
          ₹1 store, Trending, Bestsellers, New arrivals. */}
      <LazySection threshold={0.05}>
        <SmoothAppear delay={0.1}>
          <BookRail
            id="rail-rupee"
            icon={Tag}
            badge="JUST ₹1"
            title="Bestselling books from just ₹1"
            subtitle="Hand-picked reads at an unbeatable price — one ₹1 book per order."
            pill="Lowest price"
            books={RAIL_ONE_RUPEE}
          />
        </SmoothAppear>
      </LazySection>

      <LazySection threshold={0.05}>
        <SmoothAppear delay={0.1}>
          <BookRail
            id="rail-trending"
            icon={TrendingUp}
            badge="TRENDING NOW"
            title="What everyone's reading"
            subtitle="Loved by readers this week — grab yours before they're gone."
            books={RAIL_TRENDING}
          />
        </SmoothAppear>
      </LazySection>

      <LazySection threshold={0.05}>
        <SmoothAppear delay={0.1}>
          <BookRail
            id="rail-bestsellers"
            icon={Award}
            badge="BESTSELLERS"
            title="Our most-loved books"
            subtitle="Top picks readers keep coming back for."
            books={RAIL_BESTSELLERS}
          />
        </SmoothAppear>
      </LazySection>

      <LazySection threshold={0.05}>
        <SmoothAppear delay={0.1}>
          <BookRail
            id="rail-new"
            icon={Sparkles}
            badge="NEW ARRIVALS"
            title="Fresh off the shelf"
            subtitle="Just added — be the first to grab them."
            books={RAIL_NEW_ARRIVALS}
          />
        </SmoothAppear>
      </LazySection>

      <LazySection threshold={0.05}>
        <Suspense fallback={<LoadingFallback delay={0.8} />}>
          <SmoothAppear delay={0.8}>
            <RecentlyViewed />
          </SmoothAppear>
        </Suspense>
      </LazySection>

      {/* Newly Added & Trending carousels moved up as compact 2-row rails
          (NewlyAddedGrid / TrendingGrid) — old versions removed here. */}

      {/* 
      <LazySection threshold={0.05}>
        <Suspense fallback={<LoadingFallback delay={1.1} />}>
          <SmoothAppear delay={1.1}>
            <UrgencyOffer />
          </SmoothAppear>
        </Suspense>
      </LazySection> */}

      {/* Critical Components - Always Visible */}

      <AllBooks />

      <CartBar tab="books" />

      {/* PWA Install - Lazy Load */}
      <LazySection threshold={0.1}>
        <Suspense fallback={null}>
          <InstallPWA />
        </Suspense>
      </LazySection>
    </>
  );
}
