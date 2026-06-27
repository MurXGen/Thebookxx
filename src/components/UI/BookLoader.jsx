"use client";

/**
 * Simple, enhanced loader for TheBookX — a smooth brand-orange ring spinner
 * with an optional shimmering label.
 *
 * Props:
 *  - label: text under the spinner (set to "" to hide)
 *  - compact: smaller, inline variant (row layout)
 */
export default function BookLoader({ label = "Loading…", compact = false }) {
  return (
    <div
      className={`book-loader ${compact ? "book-loader--compact" : ""}`}
      role="status"
      aria-label="Loading"
    >
      <span className="bl-spin" />
      {label ? <span className="bl-label">{label}</span> : null}
    </div>
  );
}
