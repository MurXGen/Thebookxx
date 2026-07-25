"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";

// Renders a blog cover image inside a framed container. When there's no image
// (or it fails to load) it shows a branded placeholder instead of an empty box.
// Pass placeholder={false} to render nothing when there's no image.
export default function BlogCover({
  src,
  alt = "",
  fit = "cover",
  wrapperStyle,
  imgStyle,
  placeholder = true,
}) {
  const [ok, setOk] = useState(Boolean(src));
  const showImg = src && ok;

  if (!showImg && !placeholder) return null;

  return (
    <div className="blogcover-wrap" style={wrapperStyle}>
      {showImg ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setOk(false)}
          style={{ objectFit: fit, ...imgStyle }}
        />
      ) : (
        <div className="blogcover-ph" aria-hidden="true">
          <BookOpen size={26} strokeWidth={1.8} />
          <span className="blogcover-ph-brand">TheBookX</span>
        </div>
      )}
    </div>
  );
}
