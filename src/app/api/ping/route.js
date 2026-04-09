// app/api/ping/route.js
import { NextResponse } from "next/server";

export async function GET() {
  const sitemapUrl = "https://thebookx.in/sitemap.xml";

  // Ping Google
  await fetch(
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  );

  // Ping Bing
  await fetch(
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  );

  // Ping Yandex
  await fetch(
    `https://webmaster.yandex.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  );

  return NextResponse.json({
    message: "Search engines notified successfully",
    timestamp: new Date().toISOString(),
  });
}
