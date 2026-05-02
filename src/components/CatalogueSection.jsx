// src/components/CatalogueSection.jsx
"use client";

import { useState, useEffect } from "react";
import CatalogueCard from "./UI/CatalogueCard";
import LabelDivider from "./UI/LineDivider";
import { getCatalogueData } from "@/utils/catalogueUtils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CatalogueSection() {
  const router = useRouter();
  const [catalogueData, setCatalogueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getCatalogueData();
    // Take top 6 categories
    const topCategories = data.slice(0, 6);
    setCatalogueData(topCategories);
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

        {/* Categories Grid */}
        <div className="catalogue-grid">
          {catalogueData.map((cat) => (
            <CatalogueCard
              key={cat.key}
              emoji={cat.emoji}
              label={cat.label}
              count={cat.count}
              onClick={() => handleCategoryClick(cat.key)}
              color={cat.color}
            />
          ))}
        </div>

        {/* View All Button */}
        <Link
          href="/category"
          className="sec-mid-btn flex flex-row gap-8 justify-center items-center"
          style={{ marginTop: "8px" }}
        >
          View All Categories
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
