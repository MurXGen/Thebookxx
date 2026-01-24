"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window.gtag !== "undefined") {
      window.gtag("config", "G-VZX7GSTR9Z", {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return null;
}
