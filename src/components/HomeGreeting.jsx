"use client";

import { useEffect, useState } from "react";

// A short, bold, book-buying prompt with the shopper's name. Shown only when
// the shopper is recognised (we have their saved name). Renders nothing for new
// visitors, so the homepage stays exactly as-is for them.
function readName() {
  if (typeof window === "undefined") return "";
  try {
    return (localStorage.getItem("track_orders_name") || "").trim();
  } catch {
    return "";
  }
}

// Capitalise the first name: first letter upper, rest untouched.
function firstNameCap(name) {
  const first = String(name || "").trim().split(/\s+/)[0] || "";
  if (!first) return "";
  return first.charAt(0).toUpperCase() + first.slice(1);
}

// Friendly "pick a book" prompts (no time-of-day greeting). {name} is filled in.
const PROMPTS = [
  "Looking for your next read, {name}?",
  "Find a book you will love, {name}",
  "What will you read next, {name}?",
  "Ready to pick a new book, {name}?",
  "Grab your next great read, {name}",
];

export default function HomeGreeting() {
  const [name, setName] = useState("");

  useEffect(() => {
    setName(readName());
  }, []);

  const display = firstNameCap(name);
  if (!display) return null;

  const template = PROMPTS[new Date().getDate() % PROMPTS.length];
  const [before, after] = template.split("{name}");

  return (
    <p className="home-greet-line">
      {before}
      <span className="home-greet-name">{display}</span>
      {after}
      <style jsx>{`
        .home-greet-line {
          margin: 0 0 4px;
          text-align: center;
          font-size: clamp(16px, 3.4vw, 20px);
          font-weight: 800;
          line-height: 1.3;
          color: var(--foreground, #1a1a1a);
          letter-spacing: -0.01em;
        }
        .home-greet-name {
          color: var(--tertiary, #fb8500);
        }
      `}</style>
    </p>
  );
}
