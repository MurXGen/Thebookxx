"use client";
import "./BagEmptyOrders.styles.css";

// Empty bag: a way back to their orders. No network — it only reads what this
// browser already saved (latest order from checkout, saved phone number).

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { readOrders } from "@/components/HomeResumeStrip";
import { getSavedPhone } from "@/utils/userPhone";
import { readProfileCache } from "@/utils/profileCache";
import { optImg } from "@/lib/optImg";

// Newest order in the cached profile snapshot, shaped like readOrders() rows.
// Order IDs are "ORD" + a millisecond timestamp, so the biggest is the newest.
function latestFromProfileCache(phone) {
  const cache = readProfileCache(phone);
  const rows = [...(cache?.pendingOrders || []), ...(cache?.orders || [])].filter((o) => o && o["Order ID"]);
  if (!rows.length) return null;
  const num = (o) => Number(String(o["Order ID"]).replace(/\D/g, "")) || 0;
  const o = rows.reduce((a, b) => (num(b) > num(a) ? b : a));
  const books = String(o["Books List"] || "")
    .split("\n")
    .map((line) => {
      const name = (line.split("|")[0] || "").replace(/^\d+\.\s*/, "").trim();
      const qty = parseInt((line.match(/Qty:\s*(\d+)/i) || [])[1] || "1", 10);
      return name ? { name, qty } : null;
    })
    .filter(Boolean);
  return { orderId: String(o["Order ID"]), phone, books };
}

export default function BagEmptyOrders() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    let latest = null;
    let phone = "";
    try {
      latest = readOrders()[0] || null;
      phone = String(latest?.phone || getSavedPhone() || "").replace(/\D/g, "").slice(-10);
      // Not placed from this browser's checkout? Use the orders list the
      // profile page already cached in localStorage (no API call).
      if (!latest && phone.length === 10) latest = latestFromProfileCache(phone);
    } catch (_) {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads localStorage once after mount
    setInfo({ latest, phone: phone.length === 10 ? phone : "" });
  }, []);

  if (!info) return null;
  const { latest, phone } = info;
  const ordersHref = phone ? `/profile/${phone}/orders` : "/profile";
  const orderHref = latest && phone ? `/profile/${phone}/orders/${encodeURIComponent(latest.orderId)}` : ordersHref;
  const books = (latest?.books || []).filter((b) => b && (b.cover || b.name));
  const count = books.reduce((n, b) => n + (Number(b.qty) || 1), 0);

  return (
    <div className="beo">
      {latest ? (
        <Link href={orderHref} className="beo-latest">
          <span className="beo-covers" aria-hidden="true">
            {books.slice(0, 3).map((b, i) =>
              b.cover ? (
                <img key={i} src={optImg(b.cover, 80)} alt="" loading="lazy" />
              ) : (
                <i key={i}>
                  <Package size={14} />
                </i>
              ),
            )}
            {!books.length && (
              <i>
                <Package size={16} />
              </i>
            )}
          </span>
          <span className="beo-tx">
            <small>Your latest order</small>
            <b>{books[0]?.name || latest.orderId}</b>
            <em>
              {count > 1 ? `${count} books · ` : ""}
              {latest.orderId}
            </em>
          </span>
          <span className="beo-go">
            Track <ChevronRight size={15} />
          </span>
        </Link>
      ) : null}
      <Link href={ordersHref} className="beo-all">
        <span className="beo-all-ic" aria-hidden="true">
          <Package size={17} />
        </span>
        <span className="beo-all-tx">
          <b>{latest ? "See all your orders" : "Your orders"}</b>
          <small>Track deliveries and view past orders</small>
        </span>
        <ChevronRight size={17} className="beo-all-arrow" aria-hidden="true" />
      </Link>
    </div>
  );
}
