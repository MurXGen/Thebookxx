"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";

const INTRO_SEEN_KEY = "intro_image_seen";

export default function IntroImage() {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem(INTRO_SEEN_KEY);

    if (!hasSeenIntro) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleComplete = () => {
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem(INTRO_SEEN_KEY, "true");
    }, 500);
  };

  const handleSkip = () => {
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
                duration: 5,
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

            {/* Text Content */}
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
