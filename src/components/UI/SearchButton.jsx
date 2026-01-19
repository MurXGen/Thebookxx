"use client";

import { Search } from "lucide-react";

export default function SearchButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Search books"
      className="sec-mid-btn flex flex-row gap-12"
    >
      <span className="font-14">Search books</span>
      <Search size={18} color="#000" />
    </button>
  );
}
