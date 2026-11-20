"use client";

// Browser side of the show/hide switch (sheet tab "Book Visibility"). Only
// the books in SWITCHABLE_BOOK_IDS have a switch — every other book is never
// checked and costs nothing. The switch is fetched lazily: only when one of
// those books is about to be shown (a card or a search result), once per page
// load, and the last answer is remembered on the device so a hidden book
// doesn't flash in on the next visit.

import { useCallback, useSyncExternalStore } from "react";
import { SWITCHABLE_BOOK_IDS } from "@/utils/switchableBooks";

const KEY = "tbx_hidden_books";
const norm = (id) => String(id || "").toLowerCase();
export const isSwitchableBook = (id) => SWITCHABLE_BOOK_IDS.includes(norm(id));

let hidden = null; // Set of hidden ids once known
let version = 0;
let fetched = false;
const subs = new Set();
const notify = () => {
  version += 1;
  subs.forEach((f) => f());
};

function load() {
  if (typeof window === "undefined") return;
  if (!hidden) {
    try {
      hidden = new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));
    } catch {
      hidden = new Set();
    }
    if (hidden.size) notify();
  }
  if (fetched) return;
  fetched = true;
  fetch("/api/book-visibility")
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => {
      if (!j || !Array.isArray(j.hidden)) return;
      hidden = new Set(j.hidden.map(norm));
      try {
        localStorage.setItem(KEY, JSON.stringify([...hidden]));
      } catch {}
      notify();
    })
    .catch(() => {});
}

const subscribe = (f) => {
  subs.add(f);
  load();
  return () => subs.delete(f);
};
const noop = () => () => {};

// True when `id` is a switchable book that is switched off. For any other
// book it returns false and never fetches. Server render / hydration = shown.
export function useBookHidden(id) {
  const switchable = isSwitchableBook(id);
  const getSnap = useCallback(() => switchable && !!hidden?.has(norm(id)), [switchable, id]);
  return useSyncExternalStore(switchable ? subscribe : noop, getSnap, () => false);
}

// Plain check for lists (search). Pair with useHiddenBooksVersion(active) in
// the component so it re-renders when the sheet's answer arrives.
export function isBookHidden(id) {
  if (!isSwitchableBook(id) || typeof window === "undefined") return false;
  return !!hidden?.has(norm(id));
}

export function useHiddenBooksVersion(active) {
  return useSyncExternalStore(active ? subscribe : noop, () => version, () => 0);
}
