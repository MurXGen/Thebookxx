"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Package, ChevronRight, Clock, MessageCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { books as ALL_BOOKS } from "@/utils/book";
import SupportSheet from "@/components/profile/SupportSheet";

const SUPPORT_WHATSAPP = "917710892108";

// name -> cover image (order items come from the sheet, names may vary slightly)
const normName = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
const BOOK_IMAGE_BY_NAME = {};
ALL_BOOKS.forEach((b) => {
  if (b.image) BOOK_IMAGE_BY_NAME[normName(b.name)] = b.image;
});
function getBookImage(name) {
  const n = normName(name);
  if (!n) return null;
  if (BOOK_IMAGE_BY_NAME[n]) return BOOK_IMAGE_BY_NAME[n];
  const key = Object.keys(BOOK_IMAGE_BY_NAME).find(
    (k) => k.includes(n) || n.includes(k),
  );
  return key ? BOOK_IMAGE_BY_NAME[key] : null;
}

// Parse "Books List" cell → [{ name, qty, price, total }]
function parseBooks(str) {
  return String(str || "")
    .split("\n")
    .map((line) => {
      if (!line.trim()) return null;
      const full = line.match(
        /\d+\.\s([^|]+)\s*\|\s*Qty:\s*(\d+)\s*\|\s*₹(\d+)\s*each\s*\|\s*Total:\s*₹(\d+)/,
      );
      if (full) {
        return {
          name: full[1].trim(),
          qty: parseInt(full[2], 10),
          price: parseInt(full[3], 10),
          total: parseInt(full[4], 10),
        };
      }
      const name = (line.split("|")[0] || "").replace(/^\d+\.\s*/, "").trim();
      const qty = parseInt((line.match(/Qty:\s*(\d+)/i) || [])[1] || "1", 10);
      const total = parseInt(
        (line.match(/Total:\s*₹?\s*(\d+)/i) || [])[1] || "0",
        10,
      );
      return name ? { name, qty, price: 0, total } : null;
    })
    .filter(Boolean);
}

function parseSheetDate(v) {
  if (!v) return null;
  const s = String(v);
  const m = s.match(/Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?/);
  if (m) return new Date(+m[1], +m[2], +m[3], +(m[4] || 0), +(m[5] || 0), 0);
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmy) return new Date(+dmy[3], +dmy[2] - 1, +dmy[1]);
  const d = new Date(s);
  return isNaN(d) ? null : d;
}

const STATUS_TONE = (st = "") => {
  const s = st.toLowerCase();
  if (/delivered|money received/.test(s)) return "ord-badge-green";
  if (/out for delivery/.test(s)) return "ord-badge-blue";
  if (/in\s*transit|shipped/.test(s)) return "ord-badge-purple";
  if (/cancel/.test(s)) return "ord-badge-red";
  return "ord-badge-amber";
};

export default function OrdersListPage() {
  const params = useParams();
  const router = useRouter();
  const number = String(params?.number || "").replace(/\D/g, "").slice(-10);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSupport, setShowSupport] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (number.length !== 10) {
      setError("Invalid phone number.");
      setLoading(false);
      return;
    }
    // Only let a visitor view the number they actually signed in with. Viewing
    // an arbitrary number's orders via the URL is blocked → back to login.
    let savedPhone = "";
    try {
      savedPhone = String(localStorage.getItem("track_orders_phone") || "")
        .replace(/\D/g, "")
        .slice(-10);
    } catch (_) {}
    if (savedPhone !== number) {
      router.replace("/profile");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/orders?phone=${number}`);
        const json = await res.json();
        const all = Array.isArray(json.orders) ? json.orders : [];
        const real = all
          .filter((o) => {
            const nm = o["Customer Name"] || "";
            const wa = /whatsapp/i.test(o["Payment Type"] || "");
            return !/\(unconfirmed\)/i.test(nm) && !wa;
          })
          .map((o) => ({
            ...o,
            _books: parseBooks(o["Books List"]),
            _date: parseSheetDate(
              o["Timestamp (D)"] || o["Timestamp"] || o["Timestamp(D)"],
            ),
            _status: o["Order Status"] || "Processing",
          }))
          // Keep only real orders — a row must have items or a non-zero total.
          // (Stray sheet rows that only carry an Order ID are skipped.)
          .filter(
            (o) =>
              o._books.length > 0 ||
              parseFloat(o["Total Amount"] || 0) > 0,
          )
          .sort((a, b) => (b._date || 0) - (a._date || 0));
        setOrders(real);
      } catch (e) {
        setError("Couldn't load your orders. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [number]);

  const contactSupport = () => {
    const msg = `Hi TheBookX, I need help with my orders (${number}).`;
    window.open(
      `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  // Group by date label
  const groups = [];
  const byKey = {};
  orders.forEach((o) => {
    const key = o._date
      ? o._date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Earlier";
    if (!byKey[key]) {
      byKey[key] = { label: key, items: [] };
      groups.push(byKey[key]);
    }
    byKey[key].items.push(o);
  });

  return (
    <main className="ord-page">
      <header className="ord-head">
        <button
          type="button"
          className="ord-back"
          onClick={() => router.push("/profile")}
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="ord-head-titles">
          <h1>My orders</h1>
          <span className="ord-sub">+91 {number}</span>
        </div>
        <button
          type="button"
          className="ord-support-btn"
          onClick={() => setShowSupport(true)}
        >
          <MessageCircle size={16} />
          Support
        </button>
      </header>

      {loading ? (
        <div className="ord-groups" aria-busy="true" aria-label="Loading your orders">
          <section className="ord-group">
            <div className="ord-group-date ord-sk-line" style={{ width: 120 }} />
            {[0, 1, 2].map((i) => (
              <div className="ord-card ord-card-skeleton" key={i}>
                <div className="ord-card-row">
                  <div className="ord-card-covers">
                    <span className="ord-sk-cover" />
                    <span className="ord-sk-cover" />
                    <span className="ord-sk-cover" />
                  </div>
                  <div className="ord-card-main">
                    <span className="ord-sk-line" style={{ width: "45%" }} />
                    <span className="ord-sk-line" style={{ width: "80%" }} />
                    <span className="ord-sk-line" style={{ width: "30%" }} />
                  </div>
                  <span className="ord-sk-badge" />
                </div>
                <div className="ord-card-foot">
                  <span className="ord-sk-line" style={{ width: 90 }} />
                  <span className="ord-sk-line" style={{ width: 70 }} />
                </div>
              </div>
            ))}
          </section>
        </div>
      ) : error ? (
        <div className="ord-empty">{error}</div>
      ) : orders.length === 0 ? (
        <div className="ord-empty">
          <Package size={26} />
          <strong>No orders yet</strong>
          <span>When you place an order it will show up here.</span>
        </div>
      ) : (
        <div className="ord-groups">
          {groups.map((g) => (
            <section className="ord-group" key={g.label}>
              <div className="ord-group-date">
                <Clock size={13} /> {g.label}
                <span className="ord-group-count">{g.items.length}</span>
              </div>
              {g.items.map((o, i) => {
                const oid = String(o["Order ID"] || "");
                const total = o["Total Amount"] || o.revenue || "";
                const count = o._books.reduce((s, b) => s + (b.qty || 1), 0);
                const covers = o._books
                  .map((b) => getBookImage(b.name))
                  .filter(Boolean)
                  .slice(0, 4);
                const extra = o._books.length - covers.length;
                const names = o._books.map((b) => b.name).join(", ");
                return (
                  <Link
                    key={oid || i}
                    href={`/profile/${number}/orders/${encodeURIComponent(oid)}`}
                    className="ord-card"
                  >
                    <div className="ord-card-row">
                      <div className="ord-card-covers">
                        {covers.length > 0 ? (
                          covers.map((src, ci) => (
                            <Image
                              key={ci}
                              src={src}
                              alt=""
                              width={44}
                              height={58}
                              className="ord-cover"
                            />
                          ))
                        ) : (
                          <span className="ord-cover ord-cover-ph">
                            <Package size={18} />
                          </span>
                        )}
                        {extra > 0 && (
                          <span className="ord-cover-more">+{extra}</span>
                        )}
                      </div>
                      <div className="ord-card-main">
                        <span className="ord-card-id">{oid || "Order"}</span>
                        <div className="ord-card-names">{names || "—"}</div>
                        <div className="ord-card-count">
                          {count} item{count === 1 ? "" : "s"}
                        </div>
                      </div>
                      <span className={`ord-badge ${STATUS_TONE(o._status)}`}>
                        {o._status}
                      </span>
                    </div>
                    <div className="ord-card-foot">
                      <div className="ord-card-foot-left">
                        {total ? (
                          <span className="ord-card-amt">₹{total}</span>
                        ) : null}
                        {o["Payment Type"] ? (
                          <span className="ord-card-pay">
                            {o["Payment Type"].replace("Payment", "").trim()}
                          </span>
                        ) : null}
                      </div>
                      <span className="ord-card-view">
                        View details
                        <ChevronRight size={15} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </section>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showSupport && (
          <SupportSheet phone={number} onClose={() => setShowSupport(false)} />
        )}
      </AnimatePresence>
    </main>
  );
}
