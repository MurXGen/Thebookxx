"use client";

import { Search } from "lucide-react";
import OffersGift from "../OffersGift";

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

        <Search size={18} color="#000" />
      </button>
    </div>
  );
}
