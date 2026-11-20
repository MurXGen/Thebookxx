import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getComboBySlug, getComboBooks, getComboPricing } from "@/utils/combos";

// Square (1200×1200) product image for a combo: the book covers on a warm
// background with a "SAVE x%" badge and an "N-BOOK COMBO" chip (Google
// Shopping / AI Mode show product images in square tiles). Used
// as the Merchant feed image_link and the first Product image in JSON-LD.
// The wide 1200×630 card (opengraph-image) stays for link previews.
// Rendered on demand (not at build: ~300 combos × ~0.9 MB) and cached by the
// CDN for a week.
export const runtime = "nodejs";

const SIZE = 1200;
// Covers sit below the badge row.
const TOP = 170;
const AREA = SIZE - TOP - 40;
const midY = (h) => TOP + (AREA - h) / 2;

// Real format from the file's first bytes (some ".jpeg" covers are PNGs).
const sniff = (buf) => {
  if (buf[0] === 0xff && buf[1] === 0xd8) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  return null; // webp/avif etc. — satori can't draw them
};

async function coverData(src) {
  if (!src || src.startsWith("http")) return null;
  try {
    const buf = await readFile(path.join(process.cwd(), "public", src));
    const mime = sniff(buf);
    return mime ? `data:${mime};base64,${buf.toString("base64")}` : null;
  } catch {
    return null;
  }
}

// Where each cover sits (book covers are ~2:3). Fills most of the square.
function layout(n) {
  const R = 1.45; // cover height / width
  if (n <= 1) {
    const w = 660;
    return [{ x: (SIZE - w) / 2, y: midY(w * R), w, rot: 0, z: 1 }];
  }
  if (n === 2) {
    const w = 510;
    const h = w * R;
    const gap = 36;
    const x0 = (SIZE - (w * 2 + gap)) / 2;
    const y = midY(h);
    return [
      { x: x0, y: y + 10, w, rot: -3, z: 1 },
      { x: x0 + w + gap, y: y - 10, w, rot: 3, z: 2 },
    ];
  }
  if (n === 3) {
    // Fan: middle cover in front, slightly larger.
    const w = 430;
    const h = w * R;
    const step = 335;
    const cx = SIZE / 2;
    const y = midY(h);
    return [
      { x: cx - w / 2 - step, y: y + 30, w, rot: -6, z: 1 },
      { x: cx - w / 2 + step, y: y + 30, w, rot: 6, z: 1 },
      { x: cx - w / 2 - 15, y: y - 20, w: w + 30, rot: 0, z: 3 },
    ];
  }
  // 4+: 2×2 grid.
  const w = 318;
  const h = w * R;
  const gx = 44;
  const gy = 36;
  const x0 = (SIZE - (w * 2 + gx)) / 2;
  const y0 = midY(h * 2 + gy);
  return [0, 1, 2, 3].map((i) => ({
    x: x0 + (i % 2) * (w + gx),
    y: y0 + Math.floor(i / 2) * (h + gy),
    w,
    rot: 0,
    z: 1,
  }));
}

export async function GET(_req, { params }) {
  const { slug } = await params;
  const combo = getComboBySlug(slug);
  if (!combo) return new Response("Not found", { status: 404 });
  const items = getComboBooks(combo).slice(0, 4);
  const covers = await Promise.all(items.map((b) => coverData(b.image)));
  // Savings as a % (no ₹ glyph needed in the default font).
  const { price, sum, mrp } = getComboPricing(combo);
  const was = combo.discountPct ? sum : mrp;
  const pct = combo.discountPct || (was > price ? Math.round(((was - price) / was) * 100) : 0);
  const count = getComboBooks(combo).length;
  const spots = layout(items.length);
  // Draw back-to-front so the front cover overlaps the others.
  const order = items.map((b, i) => ({ b, i, s: spots[i] })).sort((a, z) => a.s.z - z.s.z);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "linear-gradient(160deg, #fff7ed 0%, #ffedd5 55%, #fed7aa 100%)",
        }}
      >
        {/* Soft light behind the covers */}
        <div
          style={{
            position: "absolute",
            left: 150,
            top: 230,
            width: 900,
            height: 900,
            borderRadius: 450,
            background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)",
          }}
        />
        {/* Savings badge + combo chip */}
        {pct > 0 && (
          <div
            style={{
              position: "absolute",
              left: 56,
              top: 52,
              display: "flex",
              alignItems: "center",
              padding: "16px 34px",
              borderRadius: 999,
              background: "#e11d48",
              color: "#fff",
              fontSize: 60,
              fontWeight: 800,
              letterSpacing: 1,
              boxShadow: "0 12px 28px rgba(225,29,72,0.35)",
            }}
          >
            {`SAVE ${pct}%`}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            right: 56,
            top: 64,
            display: "flex",
            alignItems: "center",
            padding: "14px 28px",
            borderRadius: 999,
            background: "#ffffff",
            color: "#c2410c",
            fontSize: 40,
            fontWeight: 800,
            letterSpacing: 2,
            boxShadow: "0 8px 20px rgba(194,65,12,0.15)",
          }}
        >
          {`${count}-BOOK COMBO`}
        </div>
        {order.map(({ b, i, s }) => (
          <div
            key={b.id}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y,
              width: s.w,
              height: s.w * 1.45,
              display: "flex",
              borderRadius: 12,
              overflow: "hidden",
              background: "#e5e7eb",
              boxShadow: "0 24px 48px rgba(0,0,0,0.22)",
              transform: `rotate(${s.rot}deg)`,
            }}
          >
            {covers[i] ? (
              // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
              <img src={covers[i]} width={s.w} height={s.w * 1.45} style={{ objectFit: "cover" }} />
            ) : (
              <div style={{ display: "flex", padding: 28, fontSize: 40, fontWeight: 800, color: "#111" }}>
                {b.name}
              </div>
            )}
          </div>
        ))}
      </div>
    ),
    {
      width: SIZE,
      height: SIZE,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800" },
    },
  );
}
