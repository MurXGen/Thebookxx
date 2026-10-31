// Two-party escrow deals, reviewed by TheBookX.
//
// Party actions (POST, JSON body):
//   { action: "create", p1Name, p1Phone, p1Role, p2Phone, title, terms, amount }
//        → { id, pin }   (creator shares the id/link + PIN with the other party)
//   { action: "lookup", phone }            → escrows this phone is part of
//                                            (summary only — no terms/links)
//   { action: "open",   id, phone, pin, name? }      → full escrow
//   { action: "agree",  id, phone, pin, agree }      → set my agreement
//   { action: "terms",  id, phone, pin, terms, amount } (creator only;
//                                            resets both agreements)
//   { action: "source", id, phone, pin, label, url } → add a proof link
//   { action: "note",   id, phone, pin, text }       → add a note
//
// Reviewer actions (header "x-admin-code" = the console unlock code):
//   GET ?admin=1                           → every escrow, full detail
//   { action: "review", id, decision: "approve"|"reject", note }
//
// Flow: Awaiting P2 → Open (other party joined) → Under review (both agreed to
// the terms AND each added at least one proof link) → Approved | Rejected.
// Data lives in the "Escrow" tab — see ESCROW_SHEET_NAME in lib/serverSheets.

import {
  escrowAppend,
  escrowAllRows,
  escrowUpdate,
} from "@/lib/serverSheets";
import { rateLimit, clientIp, tooMany } from "@/lib/rateLimit";
import { isValidAdminCode } from "@/lib/adminCode";

const fmtTs = (d) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(
    d.getHours(),
  )}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};
const phone10 = (v) => String(v || "").replace(/\D/g, "").slice(-10);
const clean = (v, max = 2000) => String(v ?? "").trim().slice(0, max);
const parseJson = (v) => {
  try {
    const a = JSON.parse(String(v || "[]"));
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
};
const yes = (v) => /^\s*(yes|true)/i.test(String(v || ""));
const bad = (error, status = 400) =>
  Response.json({ success: false, error }, { status });

// Row → API shape. `full` adds terms, links, notes and the PIN-free detail.
function shape(r, full) {
  const base = {
    id: clean(r["Escrow ID"]),
    title: clean(r["Title"]),
    status: clean(r["Status"]) || "Awaiting P2",
    amount: clean(r["Amount"]),
    createdAt: clean(r["Created At"]),
    updatedAt: clean(r["Updated At"]),
    p1: {
      phone: phone10(r["P1 Phone"]),
      name: clean(r["P1 Name"]),
      role: clean(r["P1 Role"]) || "Buyer",
      agreed: yes(r["P1 Agreed"]),
    },
    p2: {
      phone: phone10(r["P2 Phone"]),
      name: clean(r["P2 Name"]),
      joinedAt: clean(r["P2 Joined At"]),
      agreed: yes(r["P2 Agreed"]),
    },
  };
  if (!full) return base;
  return {
    ...base,
    terms: clean(r["Terms"], 8000),
    sources: parseJson(r["Sources"]),
    notes: parseJson(r["Notes"]),
    reviewNote: clean(r["Review Note"]),
    reviewedAt: clean(r["Reviewed At"]),
  };
}

// Status after a party change: both agreed + both added a proof → review.
function nextStatus(row, patch) {
  const cur = clean(patch.Status ?? row["Status"]) || "Awaiting P2";
  if (/approved|rejected|under review/i.test(cur)) return cur;
  const p2Joined = clean(patch["P2 Joined At"] ?? row["P2 Joined At"]);
  if (!p2Joined) return "Awaiting P2";
  const a1 = yes(patch["P1 Agreed"] ?? row["P1 Agreed"]);
  const a2 = yes(patch["P2 Agreed"] ?? row["P2 Agreed"]);
  const sources = parseJson(patch.Sources ?? row["Sources"]);
  const p1 = phone10(row["P1 Phone"]);
  const p2 = phone10(row["P2 Phone"]);
  const has1 = sources.some((s) => s.by === p1);
  const has2 = sources.some((s) => s.by === p2);
  return a1 && a2 && has1 && has2 ? "Under review" : "Open";
}

async function findRow(id) {
  const rows = await escrowAllRows();
  return rows.find((r) => clean(r["Escrow ID"]) === clean(id)) || null;
}

// Party guard: phone must be P1 or P2 and the PIN must match.
async function authParty(body) {
  const row = await findRow(body.id);
  if (!row) return { error: "Escrow not found" };
  const phone = phone10(body.phone);
  const isP1 = phone && phone === phone10(row["P1 Phone"]);
  const isP2 = phone && phone === phone10(row["P2 Phone"]);
  if (!isP1 && !isP2) return { error: "This number isn't part of that escrow" };
  if (clean(body.pin) !== clean(row["PIN"])) return { error: "Wrong PIN" };
  return { row, phone, me: isP1 ? "p1" : "p2" };
}

async function save(row, patch) {
  const full = { ...patch, "Updated At": fmtTs(new Date()) };
  full.Status = nextStatus(row, full);
  await escrowUpdate(row["Escrow ID"], full);
  return { ...row, ...full };
}

export async function GET(request) {
  const url = new URL(request.url);
  if (url.searchParams.get("admin") !== "1") return bad("unsupported");
  if (!isValidAdminCode(request.headers.get("x-admin-code")))
    return bad("unauthorised", 401);
  const rows = await escrowAllRows();
  const escrows = rows
    .filter((r) => clean(r["Escrow ID"]))
    .map((r) => shape(r, true))
    .reverse();
  return Response.json({ success: true, escrows });
}

export async function POST(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`escrow:${ip}`, { limit: 40, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  let body;
  try {
    body = await request.json();
  } catch {
    return bad("bad json");
  }
  const action = clean(body.action);

  try {
    if (action === "create") {
      const p1Phone = phone10(body.p1Phone);
      const p2Phone = phone10(body.p2Phone);
      const title = clean(body.title, 140);
      const terms = clean(body.terms, 8000);
      if (p1Phone.length !== 10 || p2Phone.length !== 10)
        return bad("Enter both 10-digit phone numbers");
      if (p1Phone === p2Phone) return bad("The other party needs a different number");
      if (!title || !terms) return bad("Add a title and the terms");
      const id = `ESC${Date.now().toString(36).toUpperCase()}`;
      const pin = String(Math.floor(1000 + Math.random() * 9000));
      const now = fmtTs(new Date());
      await escrowAppend({
        "Escrow ID": id,
        "Created At": now,
        "Updated At": now,
        Status: "Awaiting P2",
        Title: title,
        Terms: terms,
        Amount: clean(body.amount, 20),
        PIN: pin,
        "P1 Phone": p1Phone,
        "P1 Name": clean(body.p1Name, 80),
        "P1 Role": /seller/i.test(body.p1Role) ? "Seller" : "Buyer",
        "P2 Phone": p2Phone,
        "P2 Name": "",
        "P2 Joined At": "",
        "P1 Agreed": "Yes", // the creator wrote the terms
        "P2 Agreed": "",
        Sources: "[]",
        Notes: "[]",
        "Review Note": "",
        "Reviewed At": "",
        "Reviewed By": "",
      });
      return Response.json({ success: true, id, pin });
    }

    if (action === "lookup") {
      // Tighter limit: this is the one call that takes only a phone number.
      const rl2 = rateLimit(`escrow-lookup:${ip}`, { limit: 10, windowMs: 60000 });
      if (!rl2.allowed) return tooMany(rl2.retryAfter);
      const phone = phone10(body.phone);
      if (phone.length !== 10) return bad("Enter a 10-digit number");
      const rows = await escrowAllRows();
      const mine = rows
        .filter(
          (r) =>
            phone10(r["P1 Phone"]) === phone || phone10(r["P2 Phone"]) === phone,
        )
        .map((r) => {
          const s = shape(r, false);
          const meP1 = s.p1.phone === phone;
          const other = meP1 ? s.p2 : s.p1;
          // Summary only: the other number is masked until the PIN is entered.
          return {
            id: s.id,
            title: s.title,
            status: s.status,
            createdAt: s.createdAt,
            myRole: meP1 ? "Creator" : "Invited",
            otherMasked: other.phone
              ? `${other.phone.slice(0, 2)}••••••${other.phone.slice(-2)}`
              : "",
          };
        })
        .reverse();
      return Response.json({ success: true, escrows: mine });
    }

    if (action === "review") {
      if (!isValidAdminCode(request.headers.get("x-admin-code")))
        return bad("unauthorised", 401);
      const row = await findRow(body.id);
      if (!row) return bad("Escrow not found", 404);
      const approve = body.decision === "approve";
      const note = clean(body.note, 2000);
      if (!approve && !note) return bad("Add a note explaining the rejection");
      const now = fmtTs(new Date());
      await escrowUpdate(row["Escrow ID"], {
        Status: approve ? "Approved" : "Rejected",
        "Review Note": note,
        "Reviewed At": now,
        "Reviewed By": "TheBookX",
        "Updated At": now,
      });
      return Response.json({ success: true });
    }

    // Everything below needs id + phone + PIN.
    const auth = await authParty(body);
    if (auth.error) return bad(auth.error, 403);
    const { row, phone, me } = auth;
    const locked = /under review|approved|rejected/i.test(clean(row["Status"]));

    if (action === "open") {
      let cur = row;
      // First time the invited party opens it → mark joined.
      if (me === "p2" && !clean(row["P2 Joined At"])) {
        cur = await save(row, {
          "P2 Joined At": fmtTs(new Date()),
          "P2 Name": clean(body.name, 80) || clean(row["P2 Name"]),
        });
      }
      return Response.json({ success: true, me, escrow: shape(cur, true) });
    }

    if (locked) return bad("This escrow is locked for review");

    if (action === "agree") {
      const col = me === "p1" ? "P1 Agreed" : "P2 Agreed";
      const cur = await save(row, { [col]: body.agree ? "Yes" : "" });
      return Response.json({ success: true, me, escrow: shape(cur, true) });
    }

    if (action === "terms") {
      if (me !== "p1") return bad("Only the creator can change the terms", 403);
      const terms = clean(body.terms, 8000);
      if (!terms) return bad("Terms can't be empty");
      // New terms → both must agree again.
      const cur = await save(row, {
        Terms: terms,
        Amount: clean(body.amount ?? row["Amount"], 20),
        "P1 Agreed": "Yes",
        "P2 Agreed": "",
      });
      return Response.json({ success: true, me, escrow: shape(cur, true) });
    }

    if (action === "source") {
      const url = clean(body.url, 600);
      if (!/^https?:\/\/\S+$/i.test(url)) return bad("Add a full link (https://…)");
      const list = parseJson(row["Sources"]);
      list.push({
        by: phone,
        label: clean(body.label, 120) || "Proof",
        url,
        at: fmtTs(new Date()),
      });
      const cur = await save(row, { Sources: JSON.stringify(list) });
      return Response.json({ success: true, me, escrow: shape(cur, true) });
    }

    if (action === "note") {
      const text = clean(body.text, 2000);
      if (!text) return bad("Write a note first");
      const list = parseJson(row["Notes"]);
      list.push({ by: phone, text, at: fmtTs(new Date()) });
      const cur = await save(row, { Notes: JSON.stringify(list) });
      return Response.json({ success: true, me, escrow: shape(cur, true) });
    }

    return bad("unknown action");
  } catch (e) {
    return bad(String(e?.message || e), 500);
  }
}
