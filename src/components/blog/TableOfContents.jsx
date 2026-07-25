"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";

// On-page table of contents built from the post's H2 headings. Smooth-scrolls
// and highlights the section currently in view (scrollspy). Hidden if a post
// has fewer than 2 sections.
export default function TableOfContents({ items = [] }) {
  const [active, setActive] = useState(items[0]?.id || "");

  useEffect(() => {
    if (!items.length) return;
    const els = items
      .map((it) => document.getElementById(it.id))
      .filter(Boolean);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [items]);

  if (!items || items.length < 2) return null;

  const go = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
      setActive(id);
    }
  };

  return (
    <nav className="blog-toc" aria-label="Table of contents">
      <div className="blog-toc-head">
        <List size={15} /> On this page
      </div>
      <ul>
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              onClick={(e) => go(e, it.id)}
              className={active === it.id ? "active" : ""}
            >
              {it.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
