import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { combos, getComboBySlug, getComboBooks, getComboPricing } from "@/utils/combos";

// Combined-cover share card for a combo (1200×630): the books' covers side by
// side with the combo price and the savings star. Used as og:image and as the
// first Product image in the combo page's JSON-LD.
export const runtime = "nodejs";
export const alt = "TheBookX book combo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return combos.map((c) => ({ slug: c.slug }));
}

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

// The built-in OG font has no ₹ glyph: pull a tiny Noto Sans subset with just
// the ₹ sign from Google Fonts. If that fails, fall back to "Rs.".
async function rupeeFont() {
  try {
    const css = await (
      await fetch("https://fonts.googleapis.com/css2?family=Noto+Sans:wght@800&text=%E2%82%B9", {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36" },
      })
    ).text();
    const url = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

export default async function ComboOgImage({ params }) {
  const { slug } = await params;
  const combo = getComboBySlug(slug);
  const items = combo ? getComboBooks(combo).slice(0, 4) : [];
  const { price, sum, comboOff, mrp, savings } = combo
    ? getComboPricing(combo)
    : { price: 0, sum: 0, comboOff: 0, mrp: 0, savings: 0 };
  const [covers, rupee] = await Promise.all([
    Promise.all(items.map((b) => coverData(b.image))),
    rupeeFont(),
  ]);
  const R = rupee ? "₹" : "Rs.";
  const isPair = !!combo?.discountPct;
  const saveAmt = isPair ? comboOff : savings;
  const w = items.length > 2 ? 210 : 270;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #fff7ed 0%, #fde68a 100%)",
          fontFamily: "sans-serif, NotoRupee",
          padding: 56,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22, width: 660, position: "relative" }}>
          {items.map((b, i) => (
            <div
              key={b.id}
              style={{
                display: "flex",
                width: w,
                height: w * 1.45,
                borderRadius: 14,
                overflow: "hidden",
                border: "6px solid #fff",
                boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
                transform: `rotate(${items.length === 2 ? (i === 0 ? -4 : 4) : (i - 1.5) * 3}deg)`,
                background: "#e5e7eb",
              }}
            >
              {covers[i] ? (
                <img src={covers[i]} width={w} height={w * 1.45} style={{ objectFit: "cover" }} />
              ) : (
                <div style={{ display: "flex", padding: 20, fontSize: 28, fontWeight: 800 }}>{b.name}</div>
              )}
            </div>
          ))}
          {isPair && (
            <div
              style={{
                position: "absolute",
                left: w + 4,
                top: 250,
                width: 56,
                height: 56,
                borderRadius: 28,
                background: "#fb8500",
                color: "#fff",
                fontSize: 44,
                fontWeight: 900,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "5px solid #fff",
              }}
            >
              +
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, paddingLeft: 24 }}>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 800, color: "#c2410c" }}>
            TheBookX · Book Combo
          </div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 900, color: "#111", lineHeight: 1.1, marginTop: 14 }}>
            {combo?.title || "Book Combo"}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 24 }}>
            <span style={{ fontSize: 64, fontWeight: 900, color: "#111" }}>{R}{price}</span>
            <span style={{ fontSize: 34, color: "#6b7280", textDecoration: "line-through" }}>
              {R}{isPair ? sum : mrp}
            </span>
          </div>
          {saveAmt > 0 && (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                marginTop: 18,
                padding: "10px 22px",
                borderRadius: 999,
                background: "#e11d48",
                color: "#fff",
                fontSize: 30,
                fontWeight: 900,
              }}
            >
              Save {R}{saveAmt}
              {isPair ? ` · ${combo.discountPct}% off` : ""}
            </div>
          )}
          <div style={{ display: "flex", fontSize: 22, color: "#374151", marginTop: 22 }}>
            {`Cash on Delivery · Free delivery from ${R}199`}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      ...(rupee && {
        fonts: [{ name: "NotoRupee", data: rupee, weight: 800, style: "normal" }],
      }),
    },
  );
}
