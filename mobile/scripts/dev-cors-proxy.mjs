// Dev-only: lets the Expo *web* preview call thebookx.in APIs (browsers block
// cross-origin calls; the Android app talks to the site directly).
// Reads (GET) pass through; writes are limited to orders (/api/order-write)
// and coupon validate/redeem (/api/coupons), so a preview checkout behaves like the app.
import http from "node:http";

const TARGET = "https://thebookx.in"; // apex: www 308-redirects, which breaks POST bodies
const PORT = Number(process.env.PORT || 8092);

http
  .createServer(async (req, res) => {
    const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" };
    if (req.method === "OPTIONS") return res.writeHead(204, cors).end();
    const path = req.url.split("?")[0];
    const isWrite = req.method === "POST" && (path === "/api/order-write" || path === "/api/coupons");
    if (!req.url.startsWith("/api/") || (req.method !== "GET" && !isWrite)) {
      res.writeHead(405, { ...cors, "Content-Type": "application/json" });
      return res.end(JSON.stringify({ success: false, error: "dev proxy is read-only" }));
    }
    try {
      let body;
      if (isWrite) {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        body = Buffer.concat(chunks);
      }
      const r = await fetch(TARGET + req.url, {
        method: req.method,
        headers: { "User-Agent": "thebookx-app-dev-proxy", ...(isWrite ? { "Content-Type": "application/json" } : {}) },
        body,
      });
      const out = Buffer.from(await r.arrayBuffer());
      res.writeHead(r.status, { ...cors, "Content-Type": r.headers.get("content-type") || "application/json" });
      res.end(out);
    } catch (e) {
      res.writeHead(502, cors).end(String(e));
    }
  })
  .listen(PORT, () => console.log(`dev CORS proxy → ${TARGET} on http://localhost:${PORT}`));
