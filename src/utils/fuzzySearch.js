// Typo-tolerant book search, used when the normal search finds nothing.
// "rixh da" → Rich Dad Poor Dad, "rich daddy" → Rich Dad Poor Dad,
// "colen hover" → Colleen Hoover. Each query word is matched against the
// words of the title, author and series, allowing a few typos (more for
// longer words), extra letters ("daddy" vs "dad") and half-typed words.

const words = (s) =>
  String(s || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

// Optimal string alignment distance (Levenshtein + adjacent swaps), capped.
function editDistance(a, b, max = 3) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const m = a.length;
  const n = b.length;
  let prev2 = null;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, prev2[j - 2] + 1);
      }
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[n];
}

// How well one typed word matches one word in the book (0..1).
function wordScore(t, w) {
  if (w === t) return 1;
  if (w.startsWith(t)) return t.length >= 2 ? 0.95 : 0.6; // half-typed
  if (t.startsWith(w) && w.length >= 3) return 0.85; // "daddy" ~ "dad"
  const allow = t.length <= 3 ? 1 : t.length <= 6 ? 2 : 3;
  const whole = editDistance(t, w, allow);
  // Typos in a half-typed word: compare against the same-length start
  // (scored a little lower than a typo in the whole word).
  const part = w.length > t.length ? editDistance(t, w.slice(0, t.length), allow) : allow + 1;
  const d = Math.min(whole, part);
  if (d > allow) return 0;
  if (t[0] !== w[0] && d > 1) return 0; // big typos must still start right
  const s = Math.max(0, 0.9 - (d / Math.max(t.length, 1)) * 0.6);
  return whole <= part ? s : s * 0.93;
}

// Best fuzzy matches for `query`, best first: [{ book, score, label }].
// `label` is the title or author the shopper most likely meant.
export function fuzzyMatchBooks(query, books, { limit = 24, min = 0.62 } = {}) {
  const tokens = words(query).filter((t) => t.length >= 2 || /\d/.test(t));
  if (!tokens.length) return [];
  const out = [];
  for (const book of books) {
    const fields = [
      { label: book.name, ws: words(book.name) },
      { label: book.author, ws: words(book.author) },
      { label: book.series, ws: words(book.series) },
    ].filter((f) => f.ws.length);
    let best = null;
    for (const f of fields) {
      let sum = 0;
      let hits = 0;
      for (const t of tokens) {
        let s = 0;
        for (const w of f.ws) s = Math.max(s, wordScore(t, w));
        sum += s;
        if (s >= 0.5) hits++;
      }
      // Every typed word must land somewhere (one miss allowed in 3+ words).
      if (hits < tokens.length - (tokens.length >= 3 ? 1 : 0)) continue;
      const score = sum / tokens.length;
      // Tie-break: the field the query covers more of (shorter title).
      const cover = tokens.length / f.ws.length;
      if (!best || score > best.score || (score === best.score && cover > best.cover)) {
        best = { score, label: f.label, cover };
      }
    }
    if (best && best.score >= min) out.push({ book, score: best.score, label: best.label, cover: best.cover });
  }
  out.sort((a, b) => b.score - a.score || b.cover - a.cover);
  return out.slice(0, limit);
}

// Up to `n` distinct "Did you mean" labels from the matches.
export function didYouMean(hits, n = 3) {
  const seen = new Set();
  const out = [];
  for (const h of hits) {
    const label = String(h.label || "").replace(/\s*\([^)]*\)\s*/g, " ").trim();
    const k = label.toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(label);
    if (out.length >= n) break;
  }
  return out;
}
