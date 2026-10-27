"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, LayoutGrid, Package } from "lucide-react";
import { readProfileCache } from "@/utils/profileCache";

/**
 * Fixed mobile-only bottom navigation for the storefront.
 * Tabs: Home · Categories · Orders (count badge). Hidden on tablets/desktop
 * (>=768px). The floating Checkout bar (CartBar) stacks just above this nav —
 * handled in CSS via `body.has-bottom-nav`.
 */
export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [orderCount, setOrderCount] = useState(0);

  // Order count comes from the cached profile snapshot (saved phone). Read it on
  // mount and whenever the tab regains focus, so it reflects new orders.
  useEffect(() => {
    const readOrders = () => {
      try {
        const phone = localStorage.getItem("track_orders_phone");
        if (!phone) {
          setOrderCount(0);
          return;
        }
        const cached = readProfileCache(phone);
        const live = (cached?.orders || []).length;
        const pending = (cached?.pendingOrders || []).length;
        setOrderCount(live + pending);
      } catch {
        setOrderCount(0);
      }
    };
    readOrders();
    const onVisible = () => {
      if (document.visibilityState === "visible") readOrders();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", readOrders);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", readOrders);
    };
  }, []);

  // Flag the body so CartBar + page content can make room for the fixed nav.
  useEffect(() => {
    document.body.classList.add("has-bottom-nav");
    return () => document.body.classList.remove("has-bottom-nav");
  }, []);

  const tabs = [
    { key: "home", label: "Home", Icon: Home, href: "/" },
    { key: "categories", label: "Categories", Icon: LayoutGrid, href: "/books" },
    {
      key: "orders",
      label: "Orders",
      Icon: Package,
      href: "/profile",
      badge: orderCount,
    },
  ];

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <nav className="tbx-bottomnav" aria-label="Primary">
      {tabs.map(({ key, label, Icon, href, badge }) => {
        const active = isActive(href);
        return (
          <button
            key={key}
            type="button"
            className={`tbx-bn-item${active ? " active" : ""}`}
            onClick={() => router.push(href)}
            aria-current={active ? "page" : undefined}
            aria-label={
              badge ? `${label}, ${badge} item${badge > 1 ? "s" : ""}` : label
            }
          >
            <span className="tbx-bn-ic">
              <Icon size={21} strokeWidth={active ? 2 : 1.75} />
              {badge > 0 && (
                <span className="tbx-bn-badge">{badge > 99 ? "99+" : badge}</span>
              )}
            </span>
            <span className="tbx-bn-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
