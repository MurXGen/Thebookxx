"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { trackFunnelEvent } from "@/lib/analytics";
import { EVENTS } from "@/lib/trackingEvents";

const INTRO_SEEN_KEY = "intro_image_seen";

export default function IntroImage() {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const startTimeRef = useRef(null);
  const hasTrackedView = useRef(false);

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem(INTRO_SEEN_KEY);

    if (!hasSeenIntro) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        startTimeRef.current = Date.now();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Track intro view when it becomes visible
  useEffect(() => {
    if (isVisible && !hasTrackedView.current) {
      hasTrackedView.current = true;
      trackFunnelEvent(EVENTS.INTRO_VIEWED, {
        intro_type: "image",
        animation_duration: 4,
      });
    }
  }, [isVisible]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleComplete = () => {
    const timeSpent = startTimeRef.current
      ? (Date.now() - startTimeRef.current) / 1000
      : 0;

    // Track intro completion
    trackFunnelEvent(EVENTS.INTRO_COMPLETED, {
      time_spent_seconds: timeSpent,
      completed_naturally: true,
    });

    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem(INTRO_SEEN_KEY, "true");
    }, 500);
  };

  const handleSkip = () => {
    const timeSpent = startTimeRef.current
      ? (Date.now() - startTimeRef.current) / 1000
      : 0;

    // Track intro skip
    trackFunnelEvent(EVENTS.INTRO_SKIPPED, {
      time_spent_seconds: timeSpent,
      skipped_at: timeSpent,
    });

    setIsVisible(false);
    localStorage.setItem(INTRO_SEEN_KEY, "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="intro-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="intro-container">
            {/* Image Layer */}
            <div className="intro-image-wrapper">
              <Image
                src="/intro-image.jpeg"
                alt="Welcome to TheBookX"
                fill
                className="intro-image"
                priority
                onLoadingComplete={handleImageLoad}
                sizes="100vw"
              />
            </div>

            {/* Diagonal Reveal Layer - Only this area shows the image */}
            <motion.div
              className="intro-reveal"
              initial={{
                clipPath: "polygon(0 0, 0% 0, 0% 100%, 0% 100%)",
              }}
              animate={{
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
              }}
              transition={{
                duration: 4,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: 0.2,
              }}
              onAnimationComplete={handleComplete}
            />

            {/* Loading Spinner */}
            {!imageLoaded && (
              <div className="intro-loading">
                <div className="loading-spinner"></div>
              </div>
            )}

            {/* Close Button */}
            <button onClick={handleSkip} className="intro-close-btn">
              <X size={20} />
            </button>

            {/* Text Content - Commented out as per original */}
            {/* <motion.div
              className="intro-content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <h1 className="intro-title">Welcome to TheBookX</h1>
              <p className="intro-subtitle">
                Discover your next favourite read
              </p>
            </motion.div> */}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
