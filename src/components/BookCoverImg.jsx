"use client";

import { useState } from "react";

// Clean light "designed cover" palette for books with no image. The cover is
// always white/cream (never black) with a deterministic muted accent hue derived
// from the title, so each book gets a distinct but tasteful, premium-looking
// placeholder that stays consistent across renders.
export function coverFallbackVars(name) {
  const s = String(name || "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  const accent = `hsl(${h}, 48%, 44%)`;
  const accentSoft = `hsl(${h}, 46%, 92%)`;
  const tint = `hsl(${h}, 42%, 97.5%)`;
  return {
    "--cf-bg": "#ffffff",
    "--cf-fg": "#20242b",
    "--cf-bd": "#e8eaef",
    "--cf-accent": accent,
    "--cf-accent-soft": accentSoft,
    "--cf-tint": tint,
  };
}

// Renders a book cover image, falling back to a designed "cover" (title +
// author on a deterministic colour) when the image is missing or fails to load.
// Reuses the .book-cover-fallback styles in globals.css.
export default function BookCoverImg({
  src,
  name,
  author = "",
  className = "",
  loading = "lazy",
  // thumb: try the small WebP from public/books/thumbs first (npm run thumbs),
  // then the full cover, then the designed fallback.
  thumb = false,
}) {
  const thumbSrc =
    thumb && typeof src === "string" && /^\/books\/[^/]+\.(jpe?g|png|webp)$/i.test(src)
      ? src.replace(/^\/books\//, "/books/thumbs/").replace(/\.[^.]+$/, ".webp")
      : "";
  // 0 = thumb (when there is one), 1 = full image, 2 = fallback
  const [stage, setStage] = useState(thumbSrc ? 0 : 1);

  const fallbackStyle = coverFallbackVars(name);

  if (src && stage < 2) {
    return (
      <img
        src={stage === 0 ? thumbSrc : src}
        alt={name}
        loading={loading}
        decoding="async"
        className={className}
        onError={() => setStage((s) => s + 1)}
      />
    );
  }

  return (
    <div
      className={`book-cover-fallback ${className}`}
      style={fallbackStyle}
      aria-label={name}
    >
      <span className="bcf-brand">THE BOOKX</span>
      <span className="bcf-rule" />
      <span className="bcf-title">{name}</span>
      {author && <span className="bcf-author">{author}</span>}
    </div>
  );
}
