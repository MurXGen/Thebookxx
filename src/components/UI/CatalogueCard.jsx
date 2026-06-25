// src/components/UI/CatalogueCard.jsx
"use client";

import { BookOpen } from "lucide-react";

export default function CatalogueCard({ label, count, onClick, color, covers = [] }) {
  const list = covers.slice(0, 3);

  // position class: with 3 covers -> left/center/right; 2 -> left/right; 1 -> center
  const posClass = (i) => {
    if (list.length === 1) return "center";
    if (list.length === 2) return i === 0 ? "left" : "right";
    return ["left", "center", "right"][i];
  };

  const srcOf = (c) => (typeof c === "string" ? c : c?.src);

  return (
    <button
      className="cat3d-card"
      onClick={onClick}
      style={{
        background: `linear-gradient(160deg, ${color}22, ${color}08)`,
        borderColor: `${color}33`,
      }}
      aria-label={`Browse ${label} books`}
    >
      <span className="cat3d-stage">
        {list.length > 0 ? (
          list.map((c, i) => (
            <img
              key={i}
              src={srcOf(c)}
              alt=""
              loading="lazy"
              className={`cat3d-book ${posClass(i)}`}
            />
          ))
        ) : (
          <span
            className="cat3d-fallback"
            style={{ background: `${color}22`, color }}
          >
            <BookOpen size={22} />
          </span>
        )}
      </span>

      <span className="cat3d-body">
        <span className="cat3d-label">{label}</span>
        <span className="cat3d-count">{count} books</span>
      </span>
    </button>
  );
}
