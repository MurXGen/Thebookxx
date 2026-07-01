// Reuse the same branded card for Twitter/X previews.
// NOTE: route-segment config (runtime/size/etc.) must be declared directly, // Next.js 16 / Turbopack can't statically parse them when re-exported.
import OpengraphImage from "./opengraph-image";

export const runtime = "edge";
export const alt = "TheBookX — Buy Books Online in India, Starting at ₹1";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return OpengraphImage();
}
