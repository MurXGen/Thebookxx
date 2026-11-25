// Resized, compressed version of a local image for plain <img> tags.
// Goes through Next.js image optimisation (/_next/image), which Netlify serves
// from its Image CDN: AVIF/WebP, sized for the slot instead of the full file.
// `width` is the CSS width the image is shown at; we ask for ~2x for sharp
// phone screens. Non-local or SVG sources are returned unchanged.
const WIDTHS = [32, 48, 64, 96, 128, 160, 240, 320, 360, 414, 640, 768, 1080, 1280, 1920];

export function optImg(src, width = 240) {
  const s = typeof src === "string" ? src : src?.src;
  if (!s || !s.startsWith("/") || s.startsWith("//") || s.startsWith("/_next/") || /\.svg($|\?)/i.test(s)) return s;
  const want = Math.ceil(width * 2);
  const w = WIDTHS.find((x) => x >= want) || WIDTHS[WIDTHS.length - 1];
  return `/_next/image?url=${encodeURIComponent(s)}&w=${w}&q=75`;
}
