/**
 * TheBookX — DEDICATED Wallet web app
 * ------------------------------------------------------------------
 * This is a STANDALONE Apps Script whose ONLY job is to append a transaction
 * row to the "Wallet" tab. Use it so wallet credits/debits never depend on the
 * (more complex) order web app routing correctly.
 *
 * SETUP (one time):
 * 1. Open your spreadsheet → Extensions → Apps Script.
 * 2. Add a new script file, paste EVERYTHING below.
 * 3. Make sure a tab named exactly  Wallet  exists with headers in row 1:
 *       Timestamp | Phone Number | Amount | Type | Reason | Order ID
 * 4. Deploy → New deployment → type "Web app":
 *       Execute as: Me
 *       Who has access: Anyone
 *    Copy the /exec URL.
 * 5. In the app, set env var  APPSCRIPT_WALLET_URL = <that /exec URL>
 *    (or paste it as the fallback in src/lib/serverSheets.js APPSCRIPT_WALLET_URL).
 * 6. Redeploy the site. Done — every scratch/debit/admin-adjust lands in Wallet.
 *
 * The app POSTs (application/x-www-form-urlencoded):
 *   action=append
 *   secret=<the shared secret>
 *   data={"Timestamp":"..","Phone Number":"..","Amount":"11","Type":"Credit",
 *         "Reason":"Scratch card reward","Order ID":".."}
 *
 * AUTH: set SHARED_SECRET below to a long random string and set the SAME value
 * in the app env as APPSCRIPT_SHARED_SECRET. The script rejects any POST whose
 * `secret` doesn't match, so only your server (which sends it server-side) can
 * write. Leave SHARED_SECRET empty to disable the check (not recommended).
 */

var WALLET_TAB = "Wallet";
// 🔒 Replace with a long random string, e.g. "tbx_wallet_9f3c...". Must equal
// the app's APPSCRIPT_SHARED_SECRET env var.
var SHARED_SECRET = "";

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};
    // Reject unauthenticated writes when a secret is configured.
    if (SHARED_SECRET && String(p.secret || "") !== SHARED_SECRET) {
      return json({ success: false, error: "unauthorized" });
    }
    var data = p.data ? JSON.parse(p.data) : {};
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(WALLET_TAB);
    if (!sheet) {
      // Create the tab with headers if it doesn't exist yet.
      sheet = ss.insertSheet(WALLET_TAB);
      sheet
        .getRange(1, 1, 1, 6)
        .setValues([[
          "Timestamp",
          "Phone Number",
          "Amount",
          "Type",
          "Reason",
          "Order ID",
        ]]);
    }
    var headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    var row = headers.map(function (h) {
      return data[h] !== undefined && data[h] !== null ? data[h] : "";
    });
    sheet.appendRow(row);
    return json({ success: true });
  } catch (err) {
    return json({ success: false, error: String(err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
