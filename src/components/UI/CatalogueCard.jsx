// src/components/catalogue/CatalogueCard.jsx
"use client";

export default function CatalogueCard({ icon: Icon, label, onClick }) {
  return (
    <button className="catalogue-card" onClick={onClick}>
      {/* <div className="catalogue-icon">
        <Icon size={18} />
      </div> */}

      <span className="catalogue-label">{label}</span>
    </button>
  );
}
