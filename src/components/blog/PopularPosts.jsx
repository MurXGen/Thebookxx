"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, Eye } from "lucide-react";

// Shows the most-viewed posts using the batch views API. If view data isn't
// available (backend not configured yet), it keeps the order it was given
// (already trending/most-recent) so the section is always useful.
export default function PopularPosts({ posts = [], limit = 5 }) {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    const slugs = posts.map((p) => p.slug).filter(Boolean);
    if (!slugs.length) return;
    let cancelled = false;
    fetch(`/api/views?slugs=${encodeURIComponent(slugs.join(","))}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d && d.counts) setCounts(d.counts);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [posts]);

  const ranked = [...posts]
    .map((p) => ({ ...p, views: counts ? counts[p.slug] || 0 : 0 }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);

  if (!ranked.length) return null;

  return (
    <div className="popular-posts">
      <div className="popular-posts-head">
        <TrendingUp size={16} /> Popular right now
      </div>
      <ol className="popular-posts-list">
        {ranked.map((p, i) => (
          <li key={p.slug}>
            <Link href={`/blogs/${p.slug}`} className="popular-post">
              <span className="popular-rank">{i + 1}</span>
              <span className="popular-body">
                <span className="popular-title">{p.title}</span>
                {counts && p.views > 0 && (
                  <span className="popular-views">
                    <Eye size={12} /> {p.views.toLocaleString("en-IN")}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
