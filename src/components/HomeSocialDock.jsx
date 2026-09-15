"use client";

import { Share2 } from "lucide-react";
import CommunityJoin from "@/components/CommunityJoin";
import { showToast } from "@/context/ToastContext";

const SITE = "https://www.thebookx.in";

// Small persistent dock at the bottom-left of the homepage: join the community
// + share the store. Sits clear of the centered cart bar.
export default function HomeSocialDock() {
  // Copy the website link so they can paste/share it anywhere on social media.
  const share = async () => {
    try {
      await navigator.clipboard.writeText(SITE);
      showToast("Link copied — share it on your socials 🎉", "success");
    } catch (_) {
      // Fallback to the native share sheet if clipboard is blocked.
      try {
        if (navigator.share) await navigator.share({ url: SITE });
      } catch {}
    }
  };

  return (
    <div className="home-social-dock">
      <CommunityJoin className="hsd-btn" />
      <button
        type="button"
        className="community-icon-btn hsd-btn hsd-share"
        onClick={share}
        aria-label="Share TheBookX"
        title="Share TheBookX"
      >
        <Share2 size={18} />
      </button>
    </div>
  );
}
