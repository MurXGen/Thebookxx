// Netlify scheduled function — 1:00 PM IST every day: bag reminders (days 1, 2, 4, 7 after the bag changed).
// Calls /api/push/daily?slot=bag with PUSH_CRON_SECRET. Published deploys only.

export default async () => {
  const base = process.env.URL || "https://www.thebookx.in";
  const secret = process.env.PUSH_CRON_SECRET || "";
  if (!secret) return new Response("PUSH_CRON_SECRET missing", { status: 500 });
  const res = await fetch(`${base}/api/push/daily?slot=bag`, {
    method: "POST",
    headers: { "x-cron-secret": secret },
  });
  const text = await res.text();
  console.log("push-bag", res.status, text.slice(0, 300));
  return new Response(text, { status: res.status });
};

export const config = { schedule: "30 7 * * *" };
