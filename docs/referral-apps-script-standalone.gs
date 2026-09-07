/**
 * TheBookX — DEDICATED Refer & Earn web app
 * ------------------------------------------------------------------
 * Appends/updates rows in the referral tabs so Refer & Earn never depends on
 * the order web app. Handles TWO tabs by name (passed as `sheet`):
 *
 *   ReferralCodes : Phone Number | Code | Created At | Total Referred | Total Earned
 *   Referrals     : Referrer Phone | Code | Referred Phone | Applied At | Status
 *                   | Reason | Reward | Qualifying Order ID | Rewarded At
 *
 * SETUP (one time):
 * 1. Open your spreadsheet → Extensions → Apps Script.
 * 2. Add a new script file, paste EVERYTHING below.
 * 3. (Optional) create the two tabs with the headers above — the script also
 *    auto-creates them with headers if missing.
 * 4. Deploy → New deployment → type "Web app":
 *       Execute as: Me
 *       Who has access: Anyone
 *    Copy the /exec URL.
 * 5. In the app env set  APPSCRIPT_REFERRAL_URL = <that /exec URL>
 *    (or paste it as the fallback in src/lib/serverSheets.js).
 * 6. Set SHARED_SECRET below to the SAME value as APPSCRIPT_SHARED_SECRET.
 *
 * POST params (application/x-www-form-urlencoded):
 *   action=append   sheet=<tab>  data={...}                       secret=...
 *   action=update   sheet=<tab>  matchColumn=<hdr> matchValue=<v> data={...} secret=...
 */

var SHARED_SECRET = ""; // 🔒 must equal APPSCRIPT_SHARED_SECRET in the app env

var HEADERS = {
  ReferralCodes: [
    "Phone Number",
    "Code",
    "Created At",
    "Total Referred",
    "Total Earned",
  ],
  Referrals: [
    "Referrer Phone",
    "Code",
    "Referred Phone",
    "Applied At",
    "Status",
    "Reason",
    "Reward",
    "Qualifying Order ID",
    "Rewarded At",
  ],
};

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};
    if (SHARED_SECRET && String(p.secret || "") !== SHARED_SECRET) {
      return json({ success: false, error: "unauthorized" });
    }
    var action = String(p.action || "");
    var sheetName = String(p.sheet || "");
    if (!sheetName) return json({ success: false, error: "sheet required" });

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      var hdrs = HEADERS[sheetName];
      if (hdrs) sheet.getRange(1, 1, 1, hdrs.length).setValues([hdrs]);
    }
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var data = p.data ? JSON.parse(p.data) : {};

    if (action === "append") {
      var row = headers.map(function (h) {
        return data[h] !== undefined && data[h] !== null ? data[h] : "";
      });
      sheet.appendRow(row);
      return json({ success: true });
    }

    if (action === "update") {
      var matchColumn = String(p.matchColumn || "");
      var matchValue = String(p.matchValue || "");
      var colIdx = headers.indexOf(matchColumn);
      if (colIdx < 0) return json({ success: false, error: "bad matchColumn" });

      var last = sheet.getLastRow();
      if (last < 2) return json({ success: true, updated: 0 });
      var values = sheet.getRange(2, 1, last - 1, headers.length).getValues();
      var updated = 0;
      for (var i = 0; i < values.length; i++) {
        // normalise phone-ish compares by trimming
        if (String(values[i][colIdx]).trim() === matchValue.trim()) {
          for (var h = 0; h < headers.length; h++) {
            if (data[headers[h]] !== undefined && data[headers[h]] !== null) {
              values[i][h] = data[headers[h]];
            }
          }
          updated++;
          break; // update first match only
        }
      }
      if (updated) {
        sheet.getRange(2, 1, values.length, headers.length).setValues(values);
      }
      return json({ success: true, updated: updated });
    }

    return json({ success: false, error: "unknown action" });
  } catch (err) {
    return json({ success: false, error: String(err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
