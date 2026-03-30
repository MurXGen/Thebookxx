"use client";

import { Search } from "lucide-react";
import OffersGift from "../OffersGift";
import { FaWhatsapp } from "react-icons/fa";

export default function SearchButton({ onClick }) {
  return (
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

          <a
            href="https://wa.me/917710892108?text=Hey%20hi%20I’m%20looking%20for%20a%20book%20that’s%20not%20listed%20on%20your%20site.%20Could%20you%20please%20help%20me%20find%20it%3F"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            className="cursor-pointer"
            style={{ borderLeft: "1px solid ", paddingLeft: "8px" }}
          >
            <FaWhatsapp size={20} color="#25D366" />
          </a>
        </div>
      </button>
    </div>
  );
}
