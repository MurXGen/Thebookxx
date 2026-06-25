"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Consistent page header used across Bag, Wishlist, Profile and Categories.
 * Back button + title + optional subtitle, with an optional right-side action.
 */
export default function PageHeader({
  title,
  subtitle,
  backHref = "/",
  right = null,
}) {
  const router = useRouter();
  return (
    <div className="page-header">
      <button
        type="button"
        className="page-header-back"
        onClick={() => router.push(backHref)}
        aria-label="Go back"
      >
        <ArrowLeft size={20} />
      </button>
      <div className="page-header-titles">
        <h1 className="page-header-title">{title}</h1>
        {subtitle && <span className="page-header-sub">{subtitle}</span>}
      </div>
      {right && <div className="page-header-right">{right}</div>}
    </div>
  );
}
