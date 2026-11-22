// Netlify scheduled function — 09:30 AM IST every day: the latest open order with its live tracking link.
// Calls /api/push/daily?slot=orders with PUSH_CRON_SECRET. Published deploys only.

export default async () => {
  const base = process.env.URL || "https://www.thebookx.in";
  const secret = process.env.PUSH_CRON_SECRET || "";
  if (!secret) return new Response("PUSH_CRON_SECRET missing", { status: 500 });
  const res = await fetch(`${base}/api/push/daily?slot=orders`, {
    method: "POST",
    headers: { "x-cron-secret": secret },
  });
  const text = await res.text();
  console.log("push-orders", res.status, text.slice(0, 300));
  return new Response(text, { status: res.status });
};

export const config = { schedule: "0 4 * * *" };
