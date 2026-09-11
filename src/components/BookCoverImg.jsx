"use client";

import { useState } from "react";

// Deterministic black-OR-white cover palette derived from the title, so a book
// without an image always gets the same monochrome designed cover.
export function coverFallbackVars(name) {
  const s = String(name || "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h % 2 === 0
    ? { "--cf-bg": "#0a0a0a", "--cf-fg": "#ffffff", "--cf-bd": "#0a0a0a" }
    : { "--cf-bg": "#ffffff", "--cf-fg": "#111111", "--cf-bd": "#e5e7eb" };
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
