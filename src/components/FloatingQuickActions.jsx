"use client";

import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import SearchOverlay from "./SearchOverlay";

/**
 * Mobile-only floating quick actions, pinned bottom-right above the cart bar.
 * Gives one-tap access to Search and Suggest (AI recommendations) without
 * reaching for the top navbar — better thumb reach on phones.
 */
export default function FloatingQuickActions() {
  const [overlay, setOverlay] = useState({ open: false, suggest: false });

  return (
    <>
      <div className="fab-quick" aria-label="Quick actions">
        <button
          type="button"
          className="fab-btn fab-suggest"
          onClick={() => setOverlay({ open: true, suggest: true })}
          aria-label="Get book suggestions"
        >
          <Sparkles size={20} />
        </button>
        <button
          type="button"
          className="fab-btn fab-search"
          onClick={() => setOverlay({ open: true, suggest: false })}
          aria-label="Search books"
        >
          <Search size={20} />
        </button>
      </div>

      <SearchOverlay
        open={overlay.open}
        initialSuggest={overlay.suggest}
        onClose={() => setOverlay({ open: false, suggest: false })}
      />
    </>
  );
}
