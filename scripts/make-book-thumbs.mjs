// Small WebP thumbnails of every book cover for manage-orders cards
// (public/books/thumbs/<name>.webp, 160 px wide ≈ 2× the 72–80 px card cover).
// Covers average ~56 KB; thumbs are a few KB — far less bandwidth per page.
// Run after adding covers:  npm run thumbs   (skips thumbs already up to date)
import { readdir, stat, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = path.join(process.cwd(), "public", "books");
const OUT = path.join(SRC, "thumbs");
await mkdir(OUT, { recursive: true });

let made = 0;
let kept = 0;
for (const f of await readdir(SRC)) {
  if (!/\.(jpe?g|png|webp)$/i.test(f)) continue;
  const src = path.join(SRC, f);
  const out = path.join(OUT, f.replace(/\.[^.]+$/, ".webp"));
  try {
    const [a, b] = await Promise.all([stat(src), stat(out).catch(() => null)]);
    if (b && b.mtimeMs >= a.mtimeMs) {
      kept++;
      continue;
    }
    await sharp(src).resize({ width: 160, withoutEnlargement: true }).webp({ quality: 68 }).toFile(out);
    made++;
  } catch (e) {
    console.warn("skip", f, e.message);
  }
}
console.log(`thumbs: ${made} made, ${kept} up to date → public/books/thumbs`);
