"use client";

import { useState } from "react";

// Renders a blog cover image inside its own framed container. If there's no
// source, or the file fails to load, the WHOLE thing (container included)
// disappears — so posts without an image show nothing rather than an empty box.
export default function BlogCover({
  src,
  alt = "",
  fit = "cover",
  wrapperStyle,
  imgStyle,
}) {
  const [ok, setOk] = useState(Boolean(src));
  if (!src || !ok) return null;
  return (
    <div
      style={{
        background: "#f3f4f6",
        display: "flex",
        justifyContent: "center",
        overflow: "hidden",
        ...wrapperStyle,
      }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setOk(false)}
        style={{ objectFit: fit, ...imgStyle }}
      />
    </div>
  );
}
