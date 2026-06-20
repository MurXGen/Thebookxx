"use client";

import { lazy, Suspense, useState, useEffect } from "react";
import { motion } from "framer-motion";
import AllBooks from "@/components/AllBooks";
import CartBar from "@/components/CartBar";
import Navbar from "@/components/Navbar";
import PincodeModal from "@/components/UI/PincodeModal";
import CountdownTimer from "@/components/UI/CountDownTimer";
import LabelDivider from "@/components/UI/LineDivider";
import { Loader2 } from "lucide-react";
import UnlockChip from "@/components/UI/UnlockChip";
import StoreReviews from "@/components/StoreReviews";
import OneRupeeHero from "@/components/OneRupeeHero";

// Lazy load components with named exports
const BestsellerStage = lazy(() => import("@/components/BestsellerStage"));
const RecommendationModal = lazy(
  () => import("@/components/RecommendationModal"),
);
const OffersGift = lazy(() => import("@/components/OffersGift"));
const CatalogueSection = lazy(() => import("@/components/CatalogueSection"));
const OneRupeeDeals = lazy(() => import("@/components/OneRupeeDeals"));
const RecentlyViewed = lazy(() => import("@/components/RecentlyViewed"));
const NewlyAddedBooks = lazy(() => import("@/components/NewlyAddedBooks"));
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
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <Loader2 size={32} className="text-gray-400" />
    </motion.div>
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
          Buy Books Online in India at Best Prices — TheBookX | Books Starting at ₹1
        </h1>
        <LoadingFallback />
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
      <IntroVideo />

      <Navbar />

      <h1 className="sr-only">
        Buy Books Online in India at Best Prices — TheBookX | Books Starting at ₹1
      </h1>

      <PincodeModal />

      {/* <UnlockModal /> */}

      <BestsellerStage />
      <OneRupeeHero />

      <StoreReviews />

      <LazySection threshold={0.05}>
        <Suspense fallback={<LoadingFallback delay={0.4} />}>
          <SmoothAppear delay={0.4}>
            <RecommendationModal />
          </SmoothAppear>
        </Suspense>
      </LazySection>

      {/* <OffersGift /> */}
      <LazySection threshold={0.05}>
        <Suspense fallback={<LoadingFallback delay={0.7} />}>
          <SmoothAppear delay={0.7}>
            <OneRupeeDeals />
          </SmoothAppear>
        </Suspense>
      </LazySection>

      <LazySection threshold={0.05}>
        <Suspense fallback={<LoadingFallback delay={0.6} />}>
          <SmoothAppear delay={0.6}>
            <CatalogueSection />
          </SmoothAppear>
        </Suspense>
      </LazySection>

      {/* <LazySection threshold={0.05}>
        <Suspense fallback={<LoadingFallback delay={0.8} />}>
          <SmoothAppear delay={0.8}>
            <RecentlyViewed />
          </SmoothAppear>
        </Suspense>
      </LazySection> */}

      {/* <LazySection threshold={0.05}>
        <Suspense fallback={<LoadingFallback delay={0.9} />}>
          <SmoothAppear delay={0.9}>
            <NewlyAddedBooks />
          </SmoothAppear>
        </Suspense>
      </LazySection> */}

      {/* <LazySection threshold={0.05}>
        <Suspense fallback={<LoadingFallback delay={1.0} />}>
          <SmoothAppear delay={1.0}>
            <TrendingBooks />
          </SmoothAppear>
        </Suspense>
      </LazySection> */}

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

      <CartBar />

      {/* PWA Install - Lazy Load */}
      <LazySection threshold={0.1}>
        <Suspense fallback={null}>
          <InstallPWA />
        </Suspense>
      </LazySection>
    </>
  );
}
