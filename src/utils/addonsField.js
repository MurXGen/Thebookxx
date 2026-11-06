// utils/addonsField.js
// The sheet "Gift Wrap" column doubles as the add-ons column: it records both
// the gift-wrap opt-in AND the bookmark quantity (charged vs free).
//
// Encoded formats (prefix Yes/No = gift wrap on/off):
//   "No"                        → no gift wrap, no bookmarks
//   "Yes"                       → gift wrap only
//   "No-Bookmark 4-2"           → no gift wrap · 4 bookmarks charged, 2 free (6 total)
//   "Yes-Bookmark 0-1"          → gift wrap · 1 bookmark, all free
//   Legacy: "No-Bookmark×6", "Yes-Bookmark" (count only / opt-in only)

export const BOOKMARK_UNIT = 9;

export function parseAddonsField(raw) {
  const s = String(raw || "");
  const giftOn = /^\s*yes/i.test(s);
  const hasBookmark = /bookmark/i.test(s);
  let charged = 0;
  let free = 0;
  let qty = 0;
  if (hasBookmark) {
    // New "charged-free" split, e.g. "Bookmark 4-2".
    const split = s.match(/bookmark\s*(\d+)\s*-\s*(\d+)/i);
    if (split) {
      charged = parseInt(split[1], 10) || 0;
      free = parseInt(split[2], 10) || 0;
      qty = charged + free;
    } else {
      // Legacy "Bookmark×6" (count only) — split unknown, treat as all free.
      const times = s.match(/bookmark\s*[×x]\s*(\d+)/i);
      qty = times ? parseInt(times[1], 10) || 0 : 0;
      free = qty;
      charged = 0;
    }
  }
  // Optional gift-wrap note is appended as "· Note: <text>" — pull it back out.
  const noteMatch = s.match(/·\s*Note:\s*([\s\S]+)$/i);
  const message = noteMatch ? noteMatch[1].trim() : "";
  return {
    giftOn,
    bookmarkQty: qty,
    bookmarkCharged: charged,
    bookmarkFree: free,
    bookmarkCharge: charged * BOOKMARK_UNIT,
    message,
  };
}

// Pull just the gift-wrap note out of a Gift Wrap column value.
export function parseGiftMessage(raw) {
  const m = String(raw || "").match(/·\s*Note:\s*([\s\S]+)$/i);
  return m ? m[1].trim() : "";
}

export function encodeAddonsField({
  giftOn,
  bookmarkQty = 0,
  bookmarkFree = 0,
  message = "",
}) {
  const prefix = giftOn ? "Yes" : "No";
  const qty = Math.max(0, Number(bookmarkQty) || 0);
  let base;
  if (qty > 0) {
    const free = Math.min(Math.max(0, Number(bookmarkFree) || 0), qty);
    const charged = Math.max(0, qty - free);
    base = `${prefix}-Bookmark ${charged}-${free}`;
  } else {
    base = prefix;
  }
  // Gift note rides in the same column (decoder-safe: it's a trailing suffix).
  const note = String(message || "").trim().replace(/\s+/g, " ");
  return note ? `${base} · Note: ${note}` : base;
}
