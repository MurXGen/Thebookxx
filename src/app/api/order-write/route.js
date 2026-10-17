// Server-side proxy for order writes (append / update) to the Apps Script web
// apps. The /exec URLs stay on the server so nobody can call them directly to
// forge or edit sheet rows.
//
// Body (JSON): { action: "append" | "update", orderId?, data, target? }
//   target: "order" (default) -> APPSCRIPT_ORDER_URL (new orders + updates)
//           "edit"            -> APPSCRIPT_EDIT_URL   (profile address edits)

import {
  APPSCRIPT_ORDER_URL,
  APPSCRIPT_EDIT_URL,
  APPSCRIPT_WALLET_URL,
  APPSCRIPT_SHARED_SECRET,
  WALLET_SHEET_NAME,
  ORDERS_SHEET_NAME,
  reconcileOrderWalletDebit,
  readOrderRowById,
} from "@/lib/serverSheets";
import { rateLimit, clientIp, tooMany } from "@/lib/rateLimit";

// When an order is written, record its wallet spend as a debit — server-side
// and idempotent (keyed by Order ID). This replaces the fragile client-side
// fire-and-forget debit that was dropped on navigation / absent for admin-
// confirmed UPI orders. The debit row is written REGARDLESS of whether the order
// is confirmed yet; whether it actually reduces the shown/spendable balance is
// decided at read time by /api/wallet, based on the linked order's status. So an
// unpaid UPI draft stores the debit but doesn't reduce the balance until it's
// confirmed — no dropped deductions, no double-counting.
async function reconcileOrderWallet({ action, orderId, data }) {
  try {
    let phone;
    let walletApplied;
    let oid;

    if (action === "append") {
      // The freshly-appended row isn't reliably queryable via gviz yet, so trust
      // the payload we just wrote — it carries the authoritative values.
      oid = String(data?.["Order ID"] ?? data?.["Order Id"] ?? "").trim();
      phone = data?.["Phone Number"];
      walletApplied = data?.["Wallet Applied"];
    } else {
      // update: the row already exists — read it for the authoritative phone +
      // Wallet Applied, preferring any amount carried in this update's payload.
      oid = String(orderId ?? "").trim();
      if (!oid) return;
      const row = await readOrderRowById(oid);
      phone = row?.["Phone Number"];
      walletApplied =
        data && data["Wallet Applied"] != null
          ? data["Wallet Applied"]
          : row?.["Wallet Applied"];
    }

    const applied = Math.round(Number(walletApplied) || 0);
    if (!oid || applied <= 0) return;

    await reconcileOrderWalletDebit({
      phone,
      orderId: oid,
      amount: applied,
      reason: `Used on order ${oid}`,
    });
  } catch {
    // Never let wallet reconciliation break the order write itself.
  }
}

export async function POST(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`order-write:${ip}`, { limit: 20, windowMs: 60000 });
  if (!rl.allowed) return tooMany(rl.retryAfter);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ success: false, error: "bad json" }, { status: 400 });
  }

  const { action, orderId, data, target } = payload || {};
  if (action !== "append" && action !== "update" && action !== "bulkUpdate") {
    return Response.json(
      { success: false, error: "invalid action" },
      { status: 400 },
    );
  }
  if (action === "update" && !orderId) {
    return Response.json(
      { success: false, error: "orderId required for update" },
      { status: 400 },
    );
  }

  // Bulk update: ONE client request → the server fans out each row update to the
  // Apps Script (in small concurrent batches). Keeps the client under the
  // per-IP rate limit and avoids N round-trips from the browser.
  if (action === "bulkUpdate") {
    const updates = Array.isArray(payload.updates) ? payload.updates : [];
    if (!updates.length) return Response.json({ success: true, updated: 0 });
    const url = target === "edit" ? APPSCRIPT_EDIT_URL : APPSCRIPT_ORDER_URL;
    const doOne = async (u) => {
      if (!u || !u.orderId) return false;
      const b = new URLSearchParams();
      b.set("action", "update");
      b.set("orderId", String(u.orderId));
      b.set("data", JSON.stringify(u.data || {}));
      if (target !== "edit") b.set("sheet", ORDERS_SHEET_NAME);
      try {
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: b,
        });
        return true;
      } catch {
        return false;
      }
    };
    let updated = 0;
    const CH = 12;
    for (let i = 0; i < updates.length; i += CH) {
      // eslint-disable-next-line no-await-in-loop
      const res = await Promise.all(updates.slice(i, i + CH).map(doOne));
      updated += res.filter(Boolean).length;
    }
    return Response.json({ success: true, updated });
  }

  // Wallet transactions: prefer the dedicated wallet web app (always writes to
  // the Wallet tab). Fall back to the order web app + `sheet=Wallet` param.
  let url;
  if (target === "wallet" && APPSCRIPT_WALLET_URL) url = APPSCRIPT_WALLET_URL;
  else if (target === "edit") url = APPSCRIPT_EDIT_URL;
  else url = APPSCRIPT_ORDER_URL;

  const body = new URLSearchParams();
  body.set("action", action);
  if (orderId) body.set("orderId", String(orderId));
  body.set("data", JSON.stringify(data || {}));
  // Always pass the target tab name so the `sheet`-aware Apps Script routes
  // every write to the correct sheet. Without this, order appends (which used
  // to send no `sheet`) were falling into the Wallet tab.
  if (target === "wallet") {
    body.set("sheet", WALLET_SHEET_NAME);
    // Shared-secret auth — only the server knows it; the wallet script rejects
    // any POST without it. Sent from the server only, never the browser.
    if (APPSCRIPT_SHARED_SECRET) body.set("secret", APPSCRIPT_SHARED_SECRET);
  } else if (target !== "edit") {
    // Orders (append + update) must land in "Form responses 1".
    body.set("sheet", ORDERS_SHEET_NAME);
  }

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    // Order writes (not wallet/edit) reconcile the wallet spend server-side.
    // Awaited so it completes before the serverless function can freeze.
    if (target !== "wallet" && target !== "edit") {
      await reconcileOrderWallet({ action, orderId, data });
    }
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ success: false }, { status: 502 });
  }
}
