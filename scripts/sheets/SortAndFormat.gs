/**
 * TheBookX — keep sheet tabs newest-first and nicely formatted.
 *
 * Paste into the spreadsheet: Extensions → Apps Script → new file
 * "SortAndFormat.gs" → Save. Reload the sheet; a "TheBookX" menu appears:
 *   • Sort tabs (newest first)   — run it any time
 *   • Format tabs                — header, freeze, filter, banding, widths
 *   • Turn on auto-sort (5 min)  — keeps every tab newest-first on its own
 *   • Turn off auto-sort
 *
 * The website (and Google Form) always add new rows at the BOTTOM; auto-sort
 * moves them to the top a few minutes later. Updates from the website find
 * rows by ID (Device ID, Order ID, phone…), so re-ordering is safe.
 *
 * Whole rows move together (values, formulas and colours), via Range.sort on a
 * temporary helper column that is removed again afterwards.
 */

// Tabs to keep newest-first, with the column to sort by (first header found).
// Edit freely: add a tab name, or put the exact date header first.
var SORT_TABS = {
  'Form responses 1': ['Timestamp', 'Order Date'],
  'Timers':           ['Started At'],
  'Abandoned Cart':   ['Last Updated', 'First Added'],
  'Exchange books':   ['Timestamp', 'Date', 'Created At'],
  'Referrals':        ['Timestamp', 'Date', 'Created At'],
  'Wallet':           ['Updated At', 'Timestamp', 'Date'],
  'Returning Orders': ['Timestamp', 'Order Date', 'Date'],
  'Orders backup':    ['Timestamp', 'Order Date'],
  'Pro Plan':         ['Timestamp', 'Started At', 'Date', 'Created At'],
  'utm':              ['Timestamp', 'Date', 'Created At']
};
// NOT sorted on purpose: "Reviews" and "Notes" — the website reads their LAST
// rows as the newest. Lookup tabs (Pincodes, Coupons, ReferralCodes,
// tracking_ids) have no date order.

// Tabs to format (header, freeze, filter, banding, widths). Defaults to the
// sort tabs plus the read-mostly ones.
var FORMAT_TABS = Object.keys(SORT_TABS).concat(['Reviews', 'Notes', 'Coupons', 'ReferralCodes', 'Pincodes']);

var HEADER_BG = '#14532d';
var HEADER_FG = '#ffffff';
var BAND_1 = '#ffffff';
var BAND_2 = '#f6faf7';
var MAX_COL_PX = 320;

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('TheBookX')
    .addItem('Sort tabs (newest first)', 'sortAllTabs')
    .addItem('Format tabs', 'formatAllTabs')
    .addSeparator()
    .addItem('Turn on auto-sort (every 5 min)', 'installAutoSort')
    .addItem('Turn off auto-sort', 'removeAutoSort')
    .addToUi();
}

// ── Sorting ────────────────────────────────────────────────────────────────

function sortAllTabs() {
  var lock = LockService.getDocumentLock();
  if (!lock.tryLock(20000)) return; // someone else is writing; try next run
  try {
    var ss = SpreadsheetApp.getActive();
    Object.keys(SORT_TABS).forEach(function (name) {
      var sh = ss.getSheetByName(name);
      if (sh) sortSheetNewestFirst_(sh, SORT_TABS[name]);
    });
  } finally {
    lock.releaseLock();
  }
}

function sortSheetNewestFirst_(sh, headerCandidates) {
  var lastRow = sh.getLastRow();
  var lastCol = sh.getLastColumn();
  if (lastRow < 3 || lastCol < 1) return; // header + at least 2 rows

  var headers = sh.getRange(1, 1, 1, lastCol).getDisplayValues()[0].map(function (h) {
    return String(h).trim().toLowerCase();
  });
  var col = -1;
  for (var i = 0; i < headerCandidates.length && col < 0; i++) {
    col = headers.indexOf(String(headerCandidates[i]).toLowerCase());
  }
  if (col < 0) return; // no date column on this tab

  var n = lastRow - 1;
  var raw = sh.getRange(2, col + 1, n, 1).getValues();
  var shown = sh.getRange(2, col + 1, n, 1).getDisplayValues();
  var keys = [];
  var alreadySorted = true;
  var prev = Infinity;
  for (var r = 0; r < n; r++) {
    var t = toTime_(raw[r][0], shown[r][0]);
    // Undated rows sink to the bottom; ties keep their current order.
    var key = t ? t : -1;
    keys.push([key, r]);
    if (key > prev) alreadySorted = false;
    prev = key;
  }
  if (alreadySorted) return;

  // A filter on the tab blocks sorting a wider range: lift it, then put it
  // back with the same column criteria.
  var filter = sh.getFilter();
  var saved = null;
  if (filter) {
    saved = [];
    for (var c = 1; c <= lastCol; c++) {
      var crit = filter.getColumnFilterCriteria(c);
      if (crit) saved.push([c, crit.copy().build()]);
    }
    filter.remove();
  }

  // Helper columns right after the data: [time, original position]
  if (sh.getMaxColumns() < lastCol + 2) sh.insertColumnsAfter(sh.getMaxColumns(), lastCol + 2 - sh.getMaxColumns());
  var helper = sh.getRange(2, lastCol + 1, n, 2);
  try {
    helper.setValues(keys);
    sh.getRange(2, 1, n, lastCol + 2).sort([
      { column: lastCol + 1, ascending: false },
      { column: lastCol + 2, ascending: true }
    ]);
  } finally {
    helper.clearContent();
    if (saved) {
      var f2 = sh.getRange(1, 1, lastRow, lastCol).createFilter();
      saved.forEach(function (s) { f2.setColumnFilterCriteria(s[0], s[1]); });
    }
  }
}

// Parse a sheet date: real Date, or text like "17/11/2026 12:18:12",
// "17/11/2026, 12:18:12 pm", "2026-11-17T12:18:12Z". Day comes first (India).
function toTime_(v, shown) {
  if (v instanceof Date && !isNaN(v)) return v.getTime();
  var s = String(shown || v || '').trim();
  if (!s) return 0;
  var m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})(?:[ ,T]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([ap]\.?m\.?)?)?/i);
  if (m) {
    var y = Number(m[3]); if (y < 100) y += 2000;
    var h = Number(m[4] || 0);
    var ap = (m[7] || '').toLowerCase();
    if (ap.charAt(0) === 'p' && h < 12) h += 12;
    if (ap.charAt(0) === 'a' && h === 12) h = 0;
    return new Date(y, Number(m[2]) - 1, Number(m[1]), h, Number(m[5] || 0), Number(m[6] || 0)).getTime();
  }
  var d = new Date(s);
  return isNaN(d) ? 0 : d.getTime();
}

// ── Formatting ─────────────────────────────────────────────────────────────

function formatAllTabs() {
  var ss = SpreadsheetApp.getActive();
  FORMAT_TABS.forEach(function (name) {
    var sh = ss.getSheetByName(name);
    if (sh) formatSheet_(sh);
  });
}

function formatSheet_(sh) {
  var lastCol = Math.max(1, sh.getLastColumn());
  var lastRow = Math.max(2, sh.getLastRow());
  var maxRows = sh.getMaxRows();

  // Whole tab: one font, middle-aligned, no wrapping (rows stay one line).
  sh.getRange(1, 1, maxRows, lastCol)
    .setFontFamily('Arial')
    .setFontSize(10)
    .setVerticalAlignment('middle')
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

  // Header row
  sh.getRange(1, 1, 1, lastCol)
    .setBackground(HEADER_BG)
    .setFontColor(HEADER_FG)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
  sh.setRowHeight(1, 34);
  sh.setFrozenRows(1);
  if (sh.getFrozenColumns() < 1) sh.setFrozenColumns(1);

  // Alternating rows (only if the tab has no banding yet)
  if (sh.getBandings().length === 0) {
    sh.getRange(1, 1, maxRows, lastCol)
      .applyRowBanding(SpreadsheetApp.BandingTheme.GREEN, true, false)
      .setHeaderRowColor(HEADER_BG)
      .setFirstRowColor(BAND_1)
      .setSecondRowColor(BAND_2);
  }

  // Filter on the header (so you can filter/sort by any column)
  if (!sh.getFilter()) sh.getRange(1, 1, lastRow, lastCol).createFilter();

  // Column widths: fit the content, capped
  sh.autoResizeColumns(1, lastCol);
  for (var c = 1; c <= lastCol; c++) {
    var w = sh.getColumnWidth(c);
    if (w > MAX_COL_PX) sh.setColumnWidth(c, MAX_COL_PX);
    if (w < 70) sh.setColumnWidth(c, 70);
  }

  statusColours_(sh, lastCol);
}

// Colour common status words wherever they appear in Status-like columns.
function statusColours_(sh, lastCol) {
  var headers = sh.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
  var cols = [];
  headers.forEach(function (h, i) {
    if (/^(status|order status|converted|payment status|offer claimed)$/i.test(String(h).trim())) cols.push(i + 1);
  });
  if (!cols.length) return;

  var maxRows = sh.getMaxRows();
  var ranges = cols.map(function (c) { return sh.getRange(2, c, maxRows - 1, 1); });
  var rule = function (text, bg, fg) {
    return SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains(text).setBackground(bg).setFontColor(fg).setRanges(ranges).build();
  };
  var mine = [
    rule('Delivered', '#dcfce7', '#166534'),
    rule('Yes', '#dcfce7', '#166534'),
    rule('Visited', '#e0f2fe', '#075985'),
    rule('Running', '#fef9c3', '#854d0e'),
    rule('Processing', '#fef9c3', '#854d0e'),
    rule('Shipped', '#e0e7ff', '#3730a3'),
    rule('Expired', '#fee2e2', '#991b1b'),
    rule('Cancel', '#fee2e2', '#991b1b'),
    rule('RTO', '#fee2e2', '#991b1b')
  ];
  // Replace only our earlier rules on these columns; keep anything else.
  var keep = sh.getConditionalFormatRules().filter(function (r) {
    return !r.getRanges().some(function (rg) {
      return rg.getRow() === 2 && cols.indexOf(rg.getColumn()) >= 0 && rg.getNumColumns() === 1;
    });
  });
  sh.setConditionalFormatRules(keep.concat(mine));
}

// ── Auto-sort trigger ──────────────────────────────────────────────────────

function installAutoSort() {
  removeAutoSort();
  ScriptApp.newTrigger('sortAllTabs').timeBased().everyMinutes(5).create();
  sortAllTabs();
  SpreadsheetApp.getActive().toast('Auto-sort is on: tabs stay newest-first (every 5 minutes).', 'TheBookX', 5);
}

function removeAutoSort() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'sortAllTabs') ScriptApp.deleteTrigger(t);
  });
}
