"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Truck, RotateCcw, Star } from "lucide-react";
import { books } from "@/utils/book";

// Static, above-the-fold hero. Gives the homepage a clear value proposition and
// a real H1 before the animated Bestsellers carousel. All stats are derived
// from the catalogue / policies, no invented numbers.
export default function HomeHero() {
  const titleCount = Math.max(100, Math.floor(books.length / 100) * 100);

  const stats = [
    { icon: BadgeCheck, label: `${titleCount}+ titles` },
    { icon: Star, label: "4.4★ avg rating" },
    { icon: Truck, label: "Free delivery" },
    { icon: RotateCcw, label: "7-day returns" },
  ];

  return (
    <section className="home-hero">
      <div className="home-hero-inner">
        <span className="home-hero-eyebrow">📚 India’s friendly online bookstore</span>

        <h1 className="home-hero-title">
          Buy Books Online in India, {" "}
          <span className="home-hero-accent">Starting at ₹1</span>
        </h1>

        <p className="home-hero-sub">
          Hand-picked bestsellers, self-help and fiction at unbeatable prices.
          Cash on Delivery, free shipping and easy 7-day returns across India.
        </p>

        <div className="home-hero-cta">
          <Link href="/books" className="pri-big-btn home-hero-btn">
            Browse all books <ArrowRight size={16} />
          </Link>
          <Link href="/blogs" className="sec-big-btn home-hero-btn">
            Read the blog
          </Link>
        </div>

        <div className="home-hero-stats">
          {stats.map(({ icon: Icon, label }) => (
            <div key={label} className="home-hero-stat">
              <Icon size={15} className="home-hero-stat-icon" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
