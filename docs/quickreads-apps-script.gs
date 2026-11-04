/**
 * TheBookX — QuickReads sheet editor (Google Apps Script Web App)
 * ----------------------------------------------------------------
 * Lets the Telegram "✅ Passed / ❌ Failed" buttons UPDATE a QuickReads order
 * row IN PLACE (the Google Form can only append new rows).
 *
 * SETUP (one time):
 *  1. Open the QuickReads Google Sheet
 *     (https://docs.google.com/spreadsheets/d/1k0_wc0iziyWNpmuebhhz7PNOqcOD86VFHAS-3J6M52M).
 *  2. Extensions → Apps Script. Delete any code, paste THIS file, Save.
 *  3. Set SHARED_SECRET below to a long random string.
 *  4. Deploy → New deployment → type "Web app".
 *       - Execute as:      Me
 *       - Who has access:  Anyone
 *  5. Copy the Web app URL (ends with /exec).
 *  6. In the JournalX backend env (JX_NEW/backend/.env) set:
 *       THEBOOKX_QR_APPSCRIPT_URL=<the /exec URL>
 *       THEBOOKX_QR_APPSCRIPT_SECRET=<the same SHARED_SECRET>
 *     and restart the backend. Without these the backend falls back to
 *     appending a new form row per tap (the old behaviour).
 *  7. Open the /exec URL in a browser: it should show {"ok":true,...}.
 *
 * The backend POSTs form-encoded data:
 *   action=setStatus
 *   secret=<SHARED_SECRET>
 *   mobile=<10-digit number>
 *   bookIds=<comma-separated Book IDs, e.g. bk-391,bk-002 or SUB-MONTHLY>
 *   paymentStatus=<e.g. "Paid (verified)" or "Payment failed">
 *   approvalStatus=<e.g. "Approved" or "Rejected">
 *   txnRef=<optional note, e.g. "Telegram: passed">
 *
 * For each Book ID it updates the NEWEST row with that mobile + Book ID whose
 * payment isn't verified yet. If there is no such row (e.g. the form write was
 * slow), it appends one so the decision is never lost.
 */

var SHEET_NAME = "Form responses 1"; // the QuickReads responses tab
var SHARED_SECRET = ""; // 🔒 must equal THEBOOKX_QR_APPSCRIPT_SECRET in the backend env

// Column headers (matched after trimming spaces, case-insensitive).
var H_TIMESTAMP = "Timestamp";
var H_NAME = "Customer Name";
var H_MOBILE = "CustMobile Number";
var H_BOOK_ID = "Book ID";
var H_BOOK_NAME = "Book Name";
var H_AMOUNT = "Amount";
var H_PAY_METHOD = "Payment Method";
var H_PAY_STATUS = "Payment Status";
var H_APPROVAL = "Approval Status";
var H_TXN_REF = "Transaction Reference";

function doGet() {
  return jsonOut({ ok: true, service: "TheBookX QuickReads editor" });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000); // two taps at once can't race on the same row
    var p = (e && e.parameter) || {};
    if (SHARED_SECRET && String(p.secret || "") !== SHARED_SECRET) {
      return jsonOut({ ok: false, error: "Unauthorized" });
    }
    var action = String(p.action || "").toLowerCase();
    if (action === "setstatus") return handleSetStatus_(p);
    return jsonOut({ ok: false, error: "Unknown action: " + action });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  } finally {
    try {
      lock.releaseLock();
    } catch (_) {}
  }
}

function handleSetStatus_(p) {
  var mobile = String(p.mobile || "").replace(/\D/g, "").slice(-10);
  var bookIds = String(p.bookIds || "")
    .split(",")
    .map(function (s) {
      return s.trim();
    })
    .filter(Boolean);
  var payStatus = String(p.paymentStatus || "").trim();
  var approval = String(p.approvalStatus || "").trim();
  var txnRef = String(p.txnRef || "").trim();
  if (mobile.length !== 10) return jsonOut({ ok: false, error: "Bad mobile" });
  if (!bookIds.length) return jsonOut({ ok: false, error: "Missing bookIds" });
  if (!payStatus && !approval)
    return jsonOut({ ok: false, error: "Nothing to update" });

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return jsonOut({ ok: false, error: "Sheet tab not found" });

  var values = sheet.getDataRange().getValues();
  var col = headerIndex_(values[0]);
  if (col[H_MOBILE] == null || col[H_BOOK_ID] == null || col[H_PAY_STATUS] == null)
    return jsonOut({ ok: false, error: "Required columns not found" });

  var results = [];
  bookIds.forEach(function (bookId) {
    // Newest matching row first; prefer one that isn't verified yet.
    var target = -1;
    var fallback = -1;
    for (var r = values.length - 1; r >= 1; r--) {
      var rowMobile = String(values[r][col[H_MOBILE]]).replace(/\D/g, "").slice(-10);
      var rowBook = String(values[r][col[H_BOOK_ID]]).trim();
      if (rowMobile !== mobile || rowBook.toLowerCase() !== bookId.toLowerCase()) continue;
      if (fallback === -1) fallback = r;
      var pay = String(values[r][col[H_PAY_STATUS]]).toLowerCase();
      var verified = pay.indexOf("unverified") === -1 && /paid|verified|success/.test(pay);
      if (!verified) {
        target = r;
        break;
      }
    }
    if (target === -1) target = fallback;

    if (target !== -1) {
      var row = target + 1; // sheet rows are 1-based
      if (payStatus) sheet.getRange(row, col[H_PAY_STATUS] + 1).setValue(payStatus);
      if (approval && col[H_APPROVAL] != null)
        sheet.getRange(row, col[H_APPROVAL] + 1).setValue(approval);
      if (txnRef && col[H_TXN_REF] != null)
        sheet.getRange(row, col[H_TXN_REF] + 1).setValue(txnRef);
      results.push({ bookId: bookId, row: row, updated: true });
    } else {
      // No order row yet → append one so the decision isn't lost.
      var newRow = new Array(values[0].length).fill("");
      if (col[H_TIMESTAMP] != null) newRow[col[H_TIMESTAMP]] = new Date();
      if (col[H_NAME] != null) newRow[col[H_NAME]] = String(p.name || "");
      newRow[col[H_MOBILE]] = mobile;
      newRow[col[H_BOOK_ID]] = bookId;
      if (col[H_PAY_METHOD] != null) newRow[col[H_PAY_METHOD]] = "UPI Payment";
      newRow[col[H_PAY_STATUS]] = payStatus;
      if (col[H_APPROVAL] != null) newRow[col[H_APPROVAL]] = approval;
      if (col[H_TXN_REF] != null) newRow[col[H_TXN_REF]] = txnRef;
      sheet.appendRow(newRow);
      results.push({ bookId: bookId, row: sheet.getLastRow(), appended: true });
    }
  });

  return jsonOut({ ok: true, results: results });
}

// { "<header as defined above>": columnIndex } — tolerant of stray spaces/case.
function headerIndex_(headers) {
  var wanted = [
    H_TIMESTAMP, H_NAME, H_MOBILE, H_BOOK_ID, H_BOOK_NAME, H_AMOUNT,
    H_PAY_METHOD, H_PAY_STATUS, H_APPROVAL, H_TXN_REF,
  ];
  var norm = headers.map(function (h) {
    return String(h).trim().toLowerCase();
  });
  var out = {};
  wanted.forEach(function (w) {
    var i = norm.indexOf(w.toLowerCase());
    if (i !== -1) out[w] = i;
  });
  return out;
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
