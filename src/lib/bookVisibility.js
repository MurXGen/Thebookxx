// SERVER-ONLY. Show/hide switch for the few books that have one, read from
// the "Book Visibility" sheet tab (Book ID | Show). Only the ids
// in SWITCHABLE_BOOK_IDS are ever checked; every other book is always shown.
// The sheet is read at most once a minute per server instance, and if it
// can't be read the last answer (or "shown") is used, so the site never
// breaks because of the sheet.

import { gvizQuery, tableToObjects, BOOK_VISIBILITY_SHEET_NAME } from "@/lib/serverSheets";
import { SWITCHABLE_BOOK_IDS } from "@/utils/switchableBooks";

const TTL_MS = 60 * 1000;
let cache = { at: 0, hidden: [] };
let inflight = null;

const OFF = /^(false|no|off|hide|hidden|0)$/i;

async function readSheet() {
  // Small read: if the tab is missing, gviz falls back to the FIRST tab
  // (orders), so cap the rows and require the "Book ID" header.
  const table = await gvizQuery({ sheet: BOOK_VISIBILITY_SHEET_NAME, tq: "select * limit 50" });
  if (!(table.cols || []).some((c) => String(c.label).trim() === "Book ID")) return [];
  const rows = tableToObjects(table);
  const hidden = [];
  for (const r of rows) {
    const id = String(r["Book ID"] || "").trim().toLowerCase();
    if (!SWITCHABLE_BOOK_IDS.includes(id)) continue;
    const show = r["Show"];
    if (show === false || OFF.test(String(show ?? "").trim())) hidden.push(id);
  }
  return hidden;
}

// Ids of switchable books that are switched OFF in the sheet.
export async function getHiddenBookIds() {
  if (Date.now() - cache.at < TTL_MS) return cache.hidden;
  if (!inflight) {
    inflight = readSheet()
      .then((hidden) => {
        cache = { at: Date.now(), hidden };
        return hidden;
      })
      .catch(() => {
        cache = { at: Date.now(), hidden: cache.hidden };
        return cache.hidden;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export async function isBookHiddenServer(id) {
  if (!SWITCHABLE_BOOK_IDS.includes(String(id || "").toLowerCase())) return false;
  return (await getHiddenBookIds()).includes(String(id).toLowerCase());
}
