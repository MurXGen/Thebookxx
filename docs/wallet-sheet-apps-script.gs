/**
 * TheBookX — Wallet ledger tab (Apps Script)
 * ------------------------------------------------------------------
 * The app now keeps wallet balances in a dedicated "Wallet" tab instead of the
 * "Wallet" column of the Form responses sheet.
 *
 * ONE-TIME SETUP
 * 1. In the spreadsheet, add a tab named exactly:  Wallet
 * 2. Put these headers in row 1 (A1:F1), in this order:
 *      Timestamp | Phone Number | Amount | Type | Reason | Order ID
 * 3. Run migrateWalletColumnToWalletSheet() once (from the Apps Script editor)
 *    to copy every existing Wallet-column value into the new tab.
 * 4. Paste the doPost `append` handling below into your ORDER web app's Code.gs
 *    (the one behind APPSCRIPT_ORDER_URL) and RE-DEPLOY (Manage deployments →
 *    edit → New version).
 *
 * The server sends wallet transactions to the ORDER web app with an extra
 * `sheet=Wallet` parameter. When that parameter is present, append to that tab
 * instead of the default responses tab.
 */

// ---- Inside your existing doPost(e), for action === "append" ----------------
// Replace your current append block with something like this:
/*
function doPost(e) {
  var p = e.parameter || {};
  var action = p.action;
  var data = p.data ? JSON.parse(p.data) : {};

  if (action === "append") {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var targetName = p.sheet && p.sheet.trim() ? p.sheet.trim() : "Form responses 1";
    var sheet = ss.getSheetByName(targetName);
    if (!sheet) return json({ success: false, error: "sheet not found: " + targetName });

    // Read the header row and write values in header order (so column order
    // in the tab can change without breaking this).
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var row = headers.map(function (h) {
      return data[h] !== undefined && data[h] !== null ? data[h] : "";
    });
    sheet.appendRow(row);
    return json({ success: true });
  }

  // ... your existing update / delete handling ...
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
*/

// ---- ONE-TIME MIGRATION ----------------------------------------------------
// Copies every non-empty "Wallet" value from "Form responses 1" into the new
// "Wallet" tab as a transaction row. Positive = Credit, negative = Debit.
function migrateWalletColumnToWalletSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var src = ss.getSheetByName("Form responses 1");
  var dst = ss.getSheetByName("Wallet");
  if (!src || !dst) throw new Error('Need both "Form responses 1" and "Wallet" tabs.');

  var values = src.getDataRange().getValues();
  var headers = values[0];
  var idx = function (name) { return headers.indexOf(name); };
  var cTs = idx("Timestamp");
  var cPhone = idx("Phone Number");
  var cWallet = idx("Wallet");
  var cOrder = idx("Order ID");
  var cName = idx("Customer Name");
  if (cWallet < 0 || cPhone < 0) throw new Error("Wallet / Phone Number column not found.");

  var out = [];
  for (var r = 1; r < values.length; r++) {
    var raw = values[r][cWallet];
    var amt = parseFloat(raw);
    if (!raw && raw !== 0) continue;
    if (isNaN(amt) || amt === 0) continue;
    var phone = String(values[r][cPhone] || "").replace(/\D/g, "").slice(-10);
    if (phone.length !== 10) continue;
    var ts = values[r][cTs] || new Date();
    var orderId = cOrder >= 0 ? values[r][cOrder] : "";
    var isCredit = amt > 0;
    // Reason: reward when it's a standalone credit row (no order books), else
    // "Used on order" for negative amounts tied to an order.
    var reason = isCredit ? "Scratch card reward" : "Used on order";
    out.push([ts, phone, amt, isCredit ? "Credit" : "Debit", reason, orderId || ""]);
  }

  if (out.length) {
    dst.getRange(dst.getLastRow() + 1, 1, out.length, 6).setValues(out);
  }
  SpreadsheetApp.getUi().alert("Migrated " + out.length + " wallet rows to the Wallet tab.");
}

// ---- OPTIONAL: when deleting an order, also remove its Wallet-tab rows ------
// Call this from your delete handler (matched by Order ID) so a scratch reward
// tied to a deleted order is reversed.
function deleteWalletRowsByOrderId(orderId) {
  if (!orderId) return 0;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Wallet");
  if (!sheet) return 0;
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var cOrder = headers.indexOf("Order ID");
  if (cOrder < 0) return 0;
  var deleted = 0;
  for (var r = values.length - 1; r >= 1; r--) {
    if (String(values[r][cOrder]).trim() === String(orderId).trim()) {
      sheet.deleteRow(r + 1);
      deleted++;
    }
  }
  return deleted;
}
