// Abandoned-cart helpers shared by Manage Orders → Track (carts board) and
// Visitors (abandoned-cart analytics): parse the sheet's "Books" snapshot into
// catalogue books, and build the WhatsApp recovery message + link.

import { books as ALL_BOOKS } from "@/utils/book";

const SITE = "https://www.thebookx.in";

// "Name, Other Name x2, …" → [{ id, name, qty }]. Titles can contain commas,
// so known catalogue titles are matched longest-first.
const BY_LEN = [...(ALL_BOOKS || [])]
  .filter((b) => b && b.id && b.name)
  .sort((a, b) => b.name.length - a.name.length);

export function parseCartBooks(str) {
  let rest = String(str || "").trim();
  const out = [];
  while (rest) {
    const low = rest.toLowerCase();
    const hit = BY_LEN.find((b) => low.startsWith(b.name.toLowerCase()));
    if (!hit) {
      // Unknown title: keep it (no id) up to the next ", ".
      const cut = rest.indexOf(", ");
      const raw = (cut < 0 ? rest : rest.slice(0, cut)).trim();
      const q = raw.match(/\s+x(\d+)$/i);
      const name = q ? raw.slice(0, -q[0].length) : raw;
      if (name) out.push({ id: null, name, qty: q ? Number(q[1]) : 1 });
      if (cut < 0) break;
      rest = rest.slice(cut + 2);
      continue;
    }
    rest = rest.slice(hit.name.length);
    const q = rest.match(/^ x(\d+)/);
    if (q) rest = rest.slice(q[0].length);
    out.push({ id: hit.id, name: hit.name, qty: q ? Number(q[1]) : 1 });
    rest = rest.replace(/^,\s*/, "");
  }
  return out;
}

const only10 = (v) => String(v || "").replace(/\D/g, "").slice(-10);

// WhatsApp recovery message for a cart (or a thank-you + tracking link when
// it already became an order). Returns { phone, url } or null when there's no
// phone number to message.
export function cartWhatsApp(c) {
  const phone = only10(c?.phone);
  if (phone.length !== 10) return null;
  const first = (c?.name || "").trim().split(/\s+/)[0] || "there";
  const converted = /convert/i.test(String(c?.status || ""));
  let msg;
  if (converted && c?.orderId) {
    msg =
      `Hi ${first} 👋 Thanks for ordering from TheBookX! 📚\n\n` +
      `Track your order here:\n${SITE}/profile/${phone}/orders/${encodeURIComponent(c.orderId)}\n\n` +
      `Happy reading! 💛\n— Team TheBookX`;
  } else {
    const picks = parseCartBooks(c?.books);
    const known = picks.filter((p) => p.id);
    const link = known.length
      ? `${SITE}/bag?shared=${known.map((p) => `${p.id}:${p.qty}`).join(",")}`
      : `${SITE}/bag`;
    const list = picks
      .slice(0, 6)
      .map((p, i) => `${i + 1}. *${p.name}*${p.qty > 1 ? ` ×${p.qty}` : ""}`)
      .join("\n");
    const more = picks.length > 6 ? `\n…and ${picks.length - 6} more` : "";
    const value = Number(c?.cartValue) || 0;
    const n = picks.reduce((s, p) => s + (p.qty || 1), 0) || Number(c?.itemCount) || 0;
    msg =
      `Hi ${first} 👋\n\n` +
      `This is TheBookX 📚 You left ${n === 1 ? "a book" : n ? `${n} books` : "some books"} in your bag — we've saved ${n === 1 ? "it" : "them"} for you:\n\n` +
      (list ? `${list}${more}\n\n` : "") +
      (value ? `🛍️ Bag total: *₹${value.toLocaleString("en-IN")}*\n\n` : "") +
      `One tap brings your bag back — checkout takes under a minute 👇\n${link}\n\n` +
      `Why readers love ordering from us:\n` +
      `✅ Cash on Delivery available\n` +
      `🚚 Free delivery from ₹249\n` +
      `🔁 Easy 7-day replacement\n` +
      `🔖 Free bookmark on prepaid orders\n\n` +
      `Order today and we'll get ${n === 1 ? "it" : "them"} packed for you 📦\n` +
      `Any questions? Just reply here — happy to help 😊\n\n` +
      `— Team TheBookX`;
  }
  return { phone, url: `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}` };
}
