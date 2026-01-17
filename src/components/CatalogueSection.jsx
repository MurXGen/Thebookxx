"use client";

import { useState, useEffect } from "react";
import CatalogueModal from "./CatalogueModal";
import CatalogueCard from "./UI/CatalogueCard";
import LabelDivider from "./UI/LineDivider";
import { getCatalogueData } from "@/utils/catalogueUtils";

export default function CatalogueSection() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [catalogueData, setCatalogueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get dynamic catalogue data
    const data = getCatalogueData();
    setCatalogueData(data);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-12 section-1200">
        <LabelDivider label="Curated for you" />
        <div className="catalogue-labels gap-16 flex-wrap">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 h-16 w-32 rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 section-1200">
      <LabelDivider label="Curated for you" />

      <div className="catalogue-labels gap-16 flex-wrap">
        {catalogueData.map((cat) => (
          <CatalogueCard
            key={cat.key}
            icon={cat.icon}
            label={`${cat.label} (${cat.count})`}
            onClick={() => setActiveCategory(cat.key)}
          />
        ))}
      </div>

      {activeCategory && (
        <CatalogueModal
          category={activeCategory}
          onClose={() => setActiveCategory(null)}
        />
      )}
    </div>
  );
}
