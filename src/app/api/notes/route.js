// Operator notes board.
//
// GET  /api/notes                         → every note (newest first)
// POST { action: "create", title, note }  → add a note
// POST { action: "status", id, status }   → mark a note Open / Done
//
// Notes are stored in the "Notes" tab of the orders spreadsheet. Columns:
//   Note ID | Timestamp | Title | Note | Category | Related Order ID |
//   Status | Author

import { notesAppend, notesAllRows, notesUpdate } from "@/lib/serverSheets";
import { rateLimit, clientIp, tooMany } from "@/lib/rateLimit";

const fmtTs = (d) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(
    d.getHours(),
  )}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

export async function GET(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`notes-get:${ip}`, { limit: 40, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  try {
    const rows = await notesAllRows();
    const notes = rows
      .map((r) => ({
        id: String(r["Note ID"] ?? "").trim(),
        timestamp: String(r["Timestamp"] ?? ""),
        title: String(r["Title"] ?? "").trim(),
        note: String(r["Note"] ?? "").trim(),
        category: String(r["Category"] ?? "").trim(),
        orderId: String(r["Related Order ID"] ?? "").trim(),
        status: String(r["Status"] ?? "Open").trim() || "Open",
        author: String(r["Author"] ?? "").trim(),
      }))
      .filter((n) => n.title || n.note)
      .reverse(); // newest first (sheet appends at the bottom)
    return Response.json({ notes });
  } catch {
    return Response.json({ notes: [] }, { status: 200 });
  }
}

export async function POST(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`notes-post:${ip}`, { limit: 20, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "bad json" }, { status: 400 });
  }
  const action = String(body.action || "create");

  try {
    if (action === "status") {
      const id = String(body.id || "").trim();
      if (!id)
        return Response.json(
          { success: false, error: "missing id" },
          { status: 400 },
        );
      await notesUpdate(id, { Status: String(body.status || "Open") });
      return Response.json({ success: true });
    }

    // create
    const title = String(body.title || "").trim();
    const note = String(body.note || "").trim();
    if (!title && !note)
      return Response.json(
        { success: false, error: "empty note" },
        { status: 400 },
      );
    const id = `N${Date.now()}`;
    await notesAppend({
      "Note ID": id,
      Timestamp: fmtTs(new Date()),
      Title: title,
      Note: note,
      Category: String(body.category || "General").trim() || "General",
      "Related Order ID": String(body.orderId || "").trim(),
      Status: "Open",
      Author: String(body.author || "Admin").trim() || "Admin",
    });
    return Response.json({ success: true, id });
  } catch (e) {
    return Response.json(
      { success: false, error: String(e) },
      { status: 500 },
    );
  }
}
