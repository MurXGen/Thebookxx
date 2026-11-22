// Netlify scheduled function — 11:00 AM IST every day: ask for a missing email / alternate number (days 1, 3, 6 after an order).
// Calls /api/push/daily?slot=contact with PUSH_CRON_SECRET. Published deploys only.

export default async () => {
  const base = process.env.URL || "https://www.thebookx.in";
  const secret = process.env.PUSH_CRON_SECRET || "";
  if (!secret) return new Response("PUSH_CRON_SECRET missing", { status: 500 });
  const res = await fetch(`${base}/api/push/daily?slot=contact`, {
    method: "POST",
    headers: { "x-cron-secret": secret },
  });
  const text = await res.text();
  console.log("push-contact", res.status, text.slice(0, 300));
  return new Response(text, { status: res.status });
};

export const config = { schedule: "30 5 * * *" };
