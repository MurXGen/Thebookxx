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
}) {
  const [err, setErr] = useState(false);

  const fallbackStyle = coverFallbackVars(name);

  if (src && !err) {
    return (
      <img
        src={src}
        alt={name}
        loading={loading}
        className={className}
        onError={() => setErr(true)}
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
