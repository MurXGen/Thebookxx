/**
 * TheBookX — Orders sheet editor (Google Apps Script Web App)
 * ------------------------------------------------------------
 * Lets the manage-orders dashboard UPDATE and DELETE order rows IN PLACE
 * (instead of the Google Form which can only append new rows).
 *
 * SETUP (one time):
 *  1. Open your orders Google Sheet.
 *  2. Extensions → Apps Script. Delete any code, paste THIS file, Save.
 *  3. Deploy → New deployment → type "Web app".
 *       - Execute as:      Me
 *       - Who has access:  Anyone
 *  4. Copy the Web app URL (ends with /exec).
 *  5. In src/app/manage-orders/page.js set:
 *       const SHEET_EDIT_API_URL = "https://script.google.com/macros/s/XXXX/exec";
 *
 * The dashboard POSTs form-encoded data:
 *   action=update  orderId=<id>  data=<JSON of { "<Header>": value, ... }>
 *   action=delete  orderId=<id>
 * Rows are matched by the "Order ID" column.
 */

var SHEET_NAME = "Form responses 1"; // must match the tab name
var ORDER_ID_HEADER = "Order ID";

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) return jsonOut({ ok: false, error: "Sheet tab not found" });

    var action = (e.parameter.action || "").toLowerCase();
    var orderId = String(e.parameter.orderId || "").trim();
    if (!orderId) return jsonOut({ ok: false, error: "Missing orderId" });

    var values = sheet.getDataRange().getValues();
    var headers = values[0];
    var idCol = headers.indexOf(ORDER_ID_HEADER);
    if (idCol === -1)
      return jsonOut({ ok: false, error: "Order ID column not found" });

    // Find the row whose Order ID matches (values[0] is the header row).
    var rowIndex = -1;
    for (var r = 1; r < values.length; r++) {
      if (String(values[r][idCol]).trim() === orderId) {
        rowIndex = r;
        break;
      }
    }
    if (rowIndex === -1)
      return jsonOut({ ok: false, error: "Order not found: " + orderId });

    var sheetRow = rowIndex + 1; // sheet rows are 1-based

    if (action === "delete") {
      sheet.deleteRow(sheetRow);
      return jsonOut({ ok: true, deleted: orderId });
    }

    if (action === "update") {
      var data = {};
      try {
        data = JSON.parse(e.parameter.data || "{}");
      } catch (err) {
        return jsonOut({ ok: false, error: "Bad data JSON" });
      }
      Object.keys(data).forEach(function (key) {
        var c = headers.indexOf(key);
        if (c !== -1) sheet.getRange(sheetRow, c + 1).setValue(data[key]);
      });
      return jsonOut({ ok: true, updated: orderId });
    }

    return jsonOut({ ok: false, error: "Unknown action: " + action });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

// Simple GET for a health check
function doGet() {
  return jsonOut({ ok: true, service: "thebookx-orders-editor" });
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
