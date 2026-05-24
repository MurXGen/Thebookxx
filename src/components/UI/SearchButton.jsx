"use client";

import { Download, Search, StarsIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import RecommendationModal from "../RecommendationModal";
import { trackEvent } from "@/lib/ga";

export default function SearchButton({ onClick }) {
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);

  // ----- PWA install state -----
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const beforeInstallHandler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
      trackEvent("pwa_install_prompt_shown");
    };

    const installedHandler = () => {
      trackEvent("pwa_installed");
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", beforeInstallHandler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallHandler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  // ----- Listen for URL trigger event from RecommendationModal -----
  // When the URL contains ?suggest, RecommendationModal dispatches a
  // CustomEvent so any parent controlling its open state can react.
  useEffect(() => {
    const openHandler = () => setShowRecommendationModal(true);
    window.addEventListener("openRecommendationModal", openHandler);
    return () => {
      window.removeEventListener("openRecommendationModal", openHandler);
    };
  }, []);

  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowRecommendationModal(true);
  };

  const handleInstallClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!deferredPrompt) return;

    trackEvent("pwa_install_clicked");

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      trackEvent("pwa_install_accepted");
    } else {
      trackEvent("pwa_install_dismissed");
    }

    setDeferredPrompt(null);
    setCanInstall(false);
  };

  return (
    <>
      <div className="flex flex-row">
        <button
          onClick={onClick}
          aria-label="Search books"
          className="search-book flex flex-row items-center gap-12 justify-between"
          style={{ padding: "12px" }}
        >
          <span className="font-16">Search books</span>
          <div className="flex flex-row flex-center items-center gap-8">
            <div>
              <Search size={18} color="#000" />
            </div>

            <div
              onClick={handleWhatsAppClick}
              aria-label="Get book recommendations"
              className="cursor-pointer icon-rotate-wrapper font-14 flex flex-row gap-12 items-center"
              style={{
                borderLeft: "1px solid",
                paddingLeft: "8px",
                fontFamily: "poppins",
              }}
            >
              Suggest mode
              <StarsIcon className="rotate-icon" size={20} color="#fb8500" />
            </div>

            {/* PWA install icon — only shows when the app is installable */}
            {canInstall && (
              <div
                onClick={handleInstallClick}
                aria-label="Install app"
                title="Install app"
                className="cursor-pointer flex items-center"
                style={{
                  borderLeft: "1px solid",
                  paddingLeft: "8px",
                }}
              >
                <Download size={20} color="#fb8500" />
              </div>
            )}
          </div>
        </button>
      </div>

      <RecommendationModal
        isOpen={showRecommendationModal}
        onClose={() => setShowRecommendationModal(false)}
      />
    </>
  );
}
