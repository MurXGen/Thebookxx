// Netlify scheduled function — 8:30 PM IST every day: wishlist nudges (days 2, 5, 9, 14, 21, 28).
// Calls /api/push/daily?slot=wishlist with PUSH_CRON_SECRET. Published deploys only.

export default async () => {
  const base = process.env.URL || "https://www.thebookx.in";
  const secret = process.env.PUSH_CRON_SECRET || "";
  if (!secret) return new Response("PUSH_CRON_SECRET missing", { status: 500 });
  const res = await fetch(`${base}/api/push/daily?slot=wishlist`, {
    method: "POST",
    headers: { "x-cron-secret": secret },
  });
  const text = await res.text();
  console.log("push-wishlist", res.status, text.slice(0, 300));
  return new Response(text, { status: res.status });
};

export const config = { schedule: "0 15 * * *" };
