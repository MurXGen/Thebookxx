import { Suspense } from "react";
import ViewBagClient from "./ViewBagClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ViewBagPage() {
  return (
    <Suspense fallback={<div className="section-1200">Loading bag…</div>}>
      <ViewBagClient />
    </Suspense>
  );
}
