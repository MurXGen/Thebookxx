// app/not-found.js
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, BookOpen } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      className="section-1200"
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* 404 Code */}
        <h1
          style={{
            fontSize: "80px",
            fontWeight: "700",
            color: "#ffb703",
            marginBottom: "16px",
          }}
        >
          404
        </h1>

        {/* Message */}
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "600",
            color: "#1a1a1a",
            marginBottom: "12px",
          }}
        >
          Page not found
        </h2>

        <p
          style={{
            fontSize: "14px",
            color: "#6b7280",
            marginBottom: "32px",
          }}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent: "center",
            marginBottom: "48px",
          }}
        >
          <button
            onClick={() => router.back()}
            className="sec-mid-btn"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <ArrowLeft size={16} />
            Go Back
          </button>

          <Link
            href="/"
            className="pri-big-btn"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Home size={16} />
            Home
          </Link>

          <Link
            href="/books"
            className="sec-mid-btn"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <BookOpen size={16} />
            Browse Books
          </Link>
        </div>

        {/* Quick Links */}
        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "32px" }}>
          <p
            style={{ fontSize: "12px", color: "#6b7280", marginBottom: "16px" }}
          >
            Popular Categories:
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              justifyContent: "center",
            }}
          >
            {[
              "self-help",
              "fiction",
              "romance",
              "thriller",
              "mythology",
              "finance",
            ].map((category) => (
              <Link
                key={category}
                href={`/category/${category}`}
                className="sec-mid-btn"
                style={{ padding: "6px 14px", fontSize: "12px" }}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
