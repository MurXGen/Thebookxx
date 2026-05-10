"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { X, Volume2, VolumeX } from "lucide-react";

const INTRO_SEEN_KEY = "intro_video_seen";

export default function IntroVideo() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has seen the intro in this browser
    const hasSeenIntro = localStorage.getItem(INTRO_SEEN_KEY);

    if (!hasSeenIntro) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleVideoEnd = () => {
    setIsVideoEnded(true);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem(INTRO_SEEN_KEY, "true");
    }, 500);
  };

  const handleSkip = () => {
    setIsVisible(false);
    localStorage.setItem(INTRO_SEEN_KEY, "true");
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="intro-video-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Video Container */}
          <div className="intro-video-container">
            <video
              className="intro-video"
              autoPlay
              muted={isMuted}
              playsInline
              onEnded={handleVideoEnd}
              onCanPlay={handleVideoLoad}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            >
              <source src="/bookx_intro.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Loading Overlay */}
            {isLoading && (
              <div className="intro-loading">
                <div className="loading-spinner"></div>
              </div>
            )}

            {/* Controls */}
            <button onClick={toggleMute} className="intro-volume-btn">
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            <button onClick={handleSkip} className="intro-close-btn">
              <X size={20} />
            </button>

            {/* Progress Indicator */}
            {/* {!isVideoEnded && (
              <div className="intro-progress">
                <div className="intro-progress-bar">
                  <motion.div
                    className="intro-progress-fill"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                  />
                </div>
              </div>
            )} */}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
