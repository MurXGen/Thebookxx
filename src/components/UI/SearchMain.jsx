"use client";

import { useState } from "react";
import SearchOverlay from "../SearchOverlay";
import SearchButton from "./SearchButton";

export default function SearchMain() {
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <>
      <header className="header">
        <SearchButton onClick={() => setSearchOpen(true)} />
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
