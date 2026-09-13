// Server route: push a generated India Post bulk-booking .xlsx straight to the
// Department of Posts API (no manual portal upload).
//
// Flow:
//   1) AUTH01  POST {BASE}/v1/access/Login            -> access_token
//   2) BBD01   POST {BASE}/process-articles-file/{customerID}  (multipart file)
//
// Credentials are read from server env vars ONLY — never from the browser or
// committed to code. Set these in .env.local (and in Vercel → Project →
// Settings → Environment Variables):
//
//   INDIA_POST_BASE_URL     e.g. https://apisandbox.indiapost.gov.in/...   (the {base_path})
//   INDIA_POST_USERNAME     your API login / client id
//   INDIA_POST_PASSWORD     your API password / client secret
//   INDIA_POST_CUSTOMER_ID  1479752753   (optional; defaults below)
//
// ─── TWO THINGS TO CONFIRM FROM YOUR API DOCS (portal → API Subscription) ───
// (A) AUTH01 request body shape — see buildAuthBody() below.
// (B) BBD01 multipart file field name — see FILE_FIELD below.
// Everything else is generic. Adjust those two and the flow is live.

import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_CUSTOMER_ID = "1479752753";
// (B) The multipart form field India Post expects the file under. If the docs
// name it differently (e.g. "articleFile" / "uploadFile"), change this.
const FILE_FIELD = "file";

// (A) The JSON body AUTH01 expects. Adjust the keys to match your docs.
function buildAuthBody() {
  return {
    userName: process.env.INDIA_POST_USERNAME,
    password: process.env.INDIA_POST_PASSWORD,
  };
}

// Pull a token out of whatever shape the login response uses.
function extractToken(json) {
  return (
    json?.access_token ||
    json?.accessToken ||
    json?.token ||
    json?.data?.access_token ||
    json?.data?.accessToken ||
    json?.data?.token ||
    ""
  );
}

export async function POST(req) {
  const BASE = (process.env.INDIA_POST_BASE_URL || "").replace(/\/+$/, "");
  const customerId =
    process.env.INDIA_POST_CUSTOMER_ID || DEFAULT_CUSTOMER_ID;

  if (!BASE || !process.env.INDIA_POST_USERNAME || !process.env.INDIA_POST_PASSWORD) {
    return NextResponse.json(
      {
        ok: false,
        stage: "config",
        error:
          "India Post API is not configured. Set INDIA_POST_BASE_URL, INDIA_POST_USERNAME and INDIA_POST_PASSWORD in your environment.",
      },
      { status: 501 },
    );
  }

  // Read the uploaded workbook from the incoming multipart form.
  let file;
  try {
    const form = await req.formData();
    file = form.get("file");
    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        { ok: false, stage: "input", error: "No file received." },
        { status: 400 },
      );
    }
  } catch (e) {
    return NextResponse.json(
      { ok: false, stage: "input", error: "Could not read upload." },
      { status: 400 },
    );
  }

  // 1) Authenticate (AUTH01)
  let token = "";
  try {
    const authRes = await fetch(`${BASE}/v1/access/Login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(buildAuthBody()),
    });
    const authJson = await authRes.json().catch(() => ({}));
    if (!authRes.ok) {
      return NextResponse.json(
        { ok: false, stage: "auth", status: authRes.status, response: authJson },
        { status: 502 },
      );
    }
    token = extractToken(authJson);
    if (!token) {
      return NextResponse.json(
        {
          ok: false,
          stage: "auth",
          error: "Login succeeded but no access token was found in the response.",
          response: authJson,
        },
        { status: 502 },
      );
    }
  } catch (e) {
    return NextResponse.json(
      { ok: false, stage: "auth", error: String(e?.message || e) },
      { status: 502 },
    );
  }

  // 2) Upload the batch (BBD01)
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const fd = new FormData();
    fd.append(
      FILE_FIELD,
      new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      file.name || "india-post-bulk.xlsx",
    );

    const bookRes = await fetch(
      `${BASE}/process-articles-file/${encodeURIComponent(customerId)}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        body: fd,
      },
    );
    const bookJson = await bookRes.json().catch(async () => ({
      raw: await bookRes.text().catch(() => ""),
    }));

    return NextResponse.json(
      { ok: bookRes.ok, stage: "book", status: bookRes.status, response: bookJson },
      { status: bookRes.ok ? 200 : 502 },
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, stage: "book", error: String(e?.message || e) },
      { status: 502 },
    );
  }
}
