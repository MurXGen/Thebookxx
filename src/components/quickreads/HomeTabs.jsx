"use client";

import { motion } from "framer-motion";
import { BookOpen, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

const TABS = [
  { key: "books", label: "Books", icon: BookOpen, href: "/" },
  { key: "quickreads", label: "QuickReads", icon: Zap, href: "/quickreads" },
];

// The tabs now navigate between routes (/ and /quickreads) so the URL reflects
// the view and each tab is shareable. `onChange` is still honored if provided.
export default function HomeTabs({ active, onChange }) {
  const router = useRouter();
  const handleClick = (t) => {
    if (onChange) onChange(t.key);
    if (t.key !== active) router.push(t.href);
  };
  return (
    <motion.div
      className="home-tabs-wrap"
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="home-tabs" role="tablist">
        {TABS.map((t) => {
          const Icon = t.icon;
          const on = active === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={on}
              className={`home-tab${on ? " active" : ""}`}
              onClick={() => handleClick(t)}
            >
              <span className="home-tab-inner">
                <Icon size={16} />
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
