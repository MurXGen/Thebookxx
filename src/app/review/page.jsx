"use client";

import ReviewClient from "@/components/ReviewClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function ReviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReviewClient />
    </Suspense>
  );
}
