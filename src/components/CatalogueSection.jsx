// src/components/CatalogueSection.jsx
"use client";

import { useState, useEffect } from "react";
import CatalogueCard from "./UI/CatalogueCard";
import LabelDivider from "./UI/LineDivider";
import { getCatalogueData, getBooksByCategory } from "@/utils/catalogueUtils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CatalogueSection() {
  const router = useRouter();
  const [catalogueData, setCatalogueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getCatalogueData();
    // Show ALL categories, each enriched with a few real book covers
    const enriched = data.map((cat) => ({
      ...cat,
      covers: getBooksByCategory(cat.key)
        .filter((b) => b.image)
        .slice(0, 3)
        .map((b) => b.image),
    }));
    setCatalogueData(enriched);
    setLoading(false);
  }, []);

  const handleCategoryClick = (categoryKey) => {
    router.push(`/category/${categoryKey}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-12 section-1200">
        <LabelDivider label="Explore Categories" />
        <div className="catalogue-grid">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 h-24 rounded-xl"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="catalogue-section-wrapper">
      <div className="section-1200 flex flex-col gap-12">
        <LabelDivider label="Explore Categories" />

        {/* Horizontally scrollable 3D category cards (books pop out) */}
        <div className="catalogue-scroll">
          {catalogueData.map((cat) => (
            <CatalogueCard
              key={cat.key}
              label={cat.label}
              count={cat.count}
              covers={cat.covers}
              onClick={() => handleCategoryClick(cat.key)}
              color={cat.color}
            />
          ))}

          {/* View-all card pinned at the end of the strip */}
          <Link href="/category" className="cat3d-viewall" aria-label="View all categories">
            <span className="cat3d-viewall-icon">
              <ChevronRight size={22} />
            </span>
            <span className="cat3d-viewall-label">View all</span>
            <span className="cat3d-viewall-sub">categories</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
