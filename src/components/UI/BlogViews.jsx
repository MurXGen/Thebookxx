"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

// Shows a live view count for a blog post. Counts a view at most once per
// visitor per day (localStorage guard); on repeat visits it only reads.
// Renders nothing until a real number is available (so it stays invisible
// when the counter backend isn't configured yet).
export default function BlogViews({ slug }) {
  const [count, setCount] = useState(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const guardKey = `blogview:${slug}`;
    let alreadyToday = false;
    try {
      alreadyToday = localStorage.getItem(guardKey) === today;
    } catch (_) {}

    const run = async () => {
      try {
        const res = await fetch(`/api/views/${encodeURIComponent(slug)}`, {
          method: alreadyToday ? "GET" : "POST",
        });
        const data = await res.json();
        if (cancelled) return;
        if (typeof data.count === "number") setCount(data.count);
        if (!alreadyToday) {
          try {
            localStorage.setItem(guardKey, today);
          } catch (_) {}
        }
      } catch (_) {
        /* stay hidden on failure */
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (count === null) return null;

  return (
    <span className="flex items-center gap-4" title="Total views">
      <Eye size={14} />
      {count.toLocaleString("en-IN")} {count === 1 ? "view" : "views"}
    </span>
  );
}
