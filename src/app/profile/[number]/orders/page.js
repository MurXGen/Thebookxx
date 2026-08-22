"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, ChevronRight, Clock } from "lucide-react";

// Parse "Books List" cell → [{ name, qty, total }]
function parseBooks(str) {
  return String(str || "")
    .split("\n")
    .map((line) => {
      const name = (line.split("|")[0] || "").replace(/^\d+\.\s*/, "").trim();
      const qty = parseInt((line.match(/Qty:\s*(\d+)/i) || [])[1] || "1", 10);
      const total = parseInt(
        (line.match(/Total:\s*₹?\s*(\d+)/i) || [])[1] || "0",
        10,
      );
      return { name, qty, total };
    })
    .filter((b) => b.name);
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
  const [error, setError] = useState("");

  useEffect(() => {
    if (number.length !== 10) {
      setError("Invalid phone number.");
      setLoading(false);
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
          .filter(
            (o) =>
              String(o["Order ID"] || "").trim() ||
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
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1>My orders</h1>
          <span className="ord-sub">+91 {number}</span>
        </div>
      </header>

      {loading ? (
        <div className="ord-empty">Loading your orders…</div>
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
                const names = o._books.map((b) => b.name).join(", ");
                return (
                  <Link
                    key={oid || i}
                    href={`/profile/${number}/orders/${encodeURIComponent(oid)}`}
                    className="ord-card"
                  >
                    <div className="ord-card-main">
                      <div className="ord-card-top">
                        <span className="ord-card-id">{oid || "Order"}</span>
                        <span className={`ord-badge ${STATUS_TONE(o._status)}`}>
                          {o._status}
                        </span>
                      </div>
                      <div className="ord-card-names">{names || "—"}</div>
                      <div className="ord-card-meta">
                        {count} item{count === 1 ? "" : "s"}
                        {total ? ` · ₹${total}` : ""}
                        {o["Payment Type"] ? ` · ${o["Payment Type"]}` : ""}
                      </div>
                    </div>
                    <ChevronRight size={18} className="ord-card-caret" />
                  </Link>
                );
              })}
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
