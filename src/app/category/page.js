// app/categories/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, BookOpen } from "lucide-react";
import {
  getCatalogueData,
  getCategoryColor,
  getCategoryEmoji,
  getCategoryLabel,
} from "@/utils/catalogueUtils";

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getCatalogueData();
    // Sort by count (highest first)
    const sortedData = [...data].sort((a, b) => b.count - a.count);
    setCategories(sortedData);
    setLoading(false);
  }, []);

  const handleCategoryClick = (categoryKey) => {
    router.push(`/category/${categoryKey}`);
  };

  if (loading) {
    return (
      <div className="categories-page">
        <div className="section-1200">
          <div className="categories-header">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
          </div>
          <div className="categories-grid">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-28 bg-gray-200 rounded-2xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="section-1200 flex flex-col gap-12">
        {/* Header */}
        <div className="categories-header flex flex-col gap-12">
          <Link href="/" className="flex flex-row gap-4 items-center font-14">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          <div className="categories-title-wrapper">
            <div>
              <h1 className="categories-title">All Categories</h1>
              <p className="categories-subtitle">
                Explore genres and find your next favorite book
              </p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="categories-grid">
          {categories.map((category) => (
            <button
              key={category.key}
              className="category-card"
              onClick={() => handleCategoryClick(category.key)}
              style={{
                background: `linear-gradient(135deg, ${category.color}15, ${category.color}05)`,
                borderColor: `${category.color}30`,
                
              }}
            >
              <div className="category-card-content">
                <div
                  className="category-emoji"
                  style={{
                    background: `${category.color}20`,
                    color: category.color,
                  }}
                >
                  {category.emoji}
                </div>
                <div className="category-info">
                  <h3 className="category-name">{category.label}</h3>
                  <p className="category-book-count">
                    <BookOpen size={12} />
                    {category.count} books
                  </p>
                </div>
                <ChevronRight size={18} className="category-arrow" />
              </div>
            </button>
          ))}
        </div>

        {/* Trust Section */}
        <div className="categories-trust-section">
          <div className="trust-item">
            <span>📚</span>
            <span>1000+ Books</span>
          </div>
          <div className="trust-item">
            <span>🚚</span>
            <span>Free Delivery*</span>
          </div>
          <div className="trust-item">
            <span>💳</span>
            <span>COD Available</span>
          </div>
          <div className="trust-item">
            <span>⭐</span>
            <span>4.8/5 Rating</span>
          </div>
        </div>
      </div>
    </div>
  );
}
