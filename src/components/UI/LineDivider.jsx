// src/components/ui/LabelDivider.jsx
"use client";

export default function LabelDivider({ label, color }) {
  return (
    <div className="label-divider">
      <span className="label-text font-16">{label}</span>
      <div className="label-line" />
    </div>
  );
}
