"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Show the browser's native "Leave site?" confirmation when a visitor tries to
// close the tab, reload, or navigate away to another site. Fires only on a real
// page unload (not on internal Next.js navigations), and — per browser rules —
// only after the visitor has interacted with the page at least once.
//
// Admin/internal paths are excluded so it never nags while managing orders.
const ADMIN_PREFIXES = ["/manage-orders"];

export default function ExitGuard() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    const isAdmin = ADMIN_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    );
    if (isAdmin) return;

    const handler = (e) => {
      e.preventDefault();
      // Chrome/Firefox require returnValue to be set to trigger the prompt.
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [pathname]);

  return null;
}
