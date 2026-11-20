import { getHiddenBookIds } from "@/lib/bookVisibility";

// Which switchable books are switched OFF in the "Book Visibility" tab.
// Tiny response, cached at the CDN for a minute.
export const dynamic = "force-dynamic";

export async function GET() {
  const hidden = await getHiddenBookIds();
  return Response.json(
    { hidden },
    { headers: { "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=300" } },
  );
}
