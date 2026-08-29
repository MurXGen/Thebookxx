// Server-side gated delivery of QuickReads frame content.
//
// The frame CONTENT lives in the server-only data module and is NEVER shipped in
// the client bundle. This endpoint returns:
//   - the free preview frames to anyone,
//   - the FULL frame set only when the caller's phone has a verified purchase
//     (or an active subscription) for that book, checked against the sheet.

import { quickReads, QUICKREAD_FREE_FRAMES } from "@/data/quickreads";
import { checkApproval, checkSubscription } from "@/lib/quickreads";
import { rateLimit, clientIp, tooMany } from "@/lib/rateLimit";

export async function GET(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`quickread:${ip}`, { limit: 60, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  const { searchParams } = new URL(request.url);
  const bookId = String(searchParams.get("bookId") || "").trim();
  const phone = String(searchParams.get("phone") || "")
    .replace(/\D/g, "")
    .slice(-10);

  const entry = quickReads[bookId];
  if (!entry) {
    return Response.json({ bookId, total: 0, unlocked: false, frames: [] });
  }
  const all = Array.isArray(entry.frames) ? entry.frames : [];

  let unlocked = false;
  if (phone.length === 10) {
    try {
      const sub = await checkSubscription(phone);
      if (sub?.active) unlocked = true;
      else unlocked = (await checkApproval(phone, bookId)) === "approved";
    } catch (_) {
      unlocked = false;
    }
  }

  const frames = unlocked ? all : all.slice(0, QUICKREAD_FREE_FRAMES);
  return Response.json({
    bookId,
    total: all.length,
    unlocked,
    frames,
  });
}
