"use client";

import { Search, StarsIcon } from "lucide-react";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import RecommendationModal from "../RecommendationModal";

export default function SearchButton({ onClick }) {
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);

  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowRecommendationModal(true);
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
