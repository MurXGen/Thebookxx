// src/components/UI/CatalogueCard.jsx
"use client";

export default function CatalogueCard({ emoji, label, count, onClick, color }) {
  return (
    <button
      className="catalogue-card"
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
        borderColor: `${color}30`,
      }}
    >
      <div
        className="catalogue-emoji"
        style={{
          background: `${color}20`,
          color: color,
        }}
      >
        {emoji}
      </div>
      <div className="catalogue-info">
        <span className="catalogue-label">{label}</span>
        <span className="catalogue-count">{count} books</span>
      </div>
    </button>
  );
}
