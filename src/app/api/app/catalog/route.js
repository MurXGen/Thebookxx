import { books } from "@/utils/book";
import { combos } from "@/utils/combos";
import { QUICKREAD_META } from "@/data/quickreadsMeta";
import { getHiddenBookIds } from "@/lib/bookVisibility";
import { slimCatalog } from "@/lib/appCatalog.cjs";

// Slim catalogue for the Android app. The app ships a bundled snapshot and
// refreshes from here in the background, so prices/stock stay current without
// shipping a new APK.
export const dynamic = "force-dynamic";

export async function GET() {
  let hidden = [];
  try {
    hidden = await getHiddenBookIds();
  } catch {}
  return Response.json(slimCatalog(books, hidden, combos, QUICKREAD_META), {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=3600" },
  });
}
