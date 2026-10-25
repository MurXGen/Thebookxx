/*************************************************************************
 * TheBookX — FILE 3 / 6 : Setup.gs
 * setup() builds + styles every tab from scratch and seeds Config,
 * the 10 hook formulas and the 14 books. Safe to re-run (idempotent:
 * it rebuilds tab structure but will not wipe your Posted Log or the
 * "Last Used" history unless you choose Reset).
 *************************************************************************/

function setup() {
  const ss = SpreadsheetApp.getActive();
  ss.setSpreadsheetTimeZone(CFG.TZ);

  ensureSheet_(ss, CFG.TAB.CONFIG,   () => seedKeyValue_(ss, CFG.TAB.CONFIG, CFG.CONFIG_SEED));
  ensureSheet_(ss, CFG.TAB.BOOKS,    () => seedTable_(ss, CFG.TAB.BOOKS, CFG.BOOKS_SEED));
  ensureSheet_(ss, CFG.TAB.HOOKS,    () => seedTable_(ss, CFG.TAB.HOOKS, CFG.HOOKS_SEED));

  ensureSheet_(ss, CFG.TAB.REEL,     () => headerRow_(ss, CFG.TAB.REEL, CFG.HEAD.REEL));
  ensureSheet_(ss, CFG.TAB.CAROUSEL, () => headerRow_(ss, CFG.TAB.CAROUSEL, CFG.HEAD.CAROUSEL));
  ensureSheet_(ss, CFG.TAB.WHATSAPP, () => headerRow_(ss, CFG.TAB.WHATSAPP, CFG.HEAD.WHATSAPP));
  ensureSheet_(ss, CFG.TAB.READING,  () => headerRow_(ss, CFG.TAB.READING, CFG.HEAD.READING));
  ensureSheet_(ss, CFG.TAB.LOG,      () => headerRow_(ss, CFG.TAB.LOG, CFG.HEAD.LOG));

  buildTodayTab_(ss);
  orderTabs_(ss);
  ss.toast('Setup complete. Add your Gemini key (First-time setup), then Generate today.', 'TheBookX', 8);
}

/* --------------------------- tab helpers --------------------------- */

function ensureSheet_(ss, name, seedFn) {
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); seedFn(); }
  return sh;
}

function getSheet_(name) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) throw new Error('Missing tab "' + name + '". Run First-time setup.');
  return sh;
}

function headerRow_(ss, name, headers) {
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clear();
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  styleHeader_(sh, headers.length);
  sh.setFrozenRows(1);
  autosize_(sh, headers.length);
  return sh;
}

function seedTable_(ss, name, rows) {
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clear();
  sh.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  styleHeader_(sh, rows[0].length);
  zebra_(sh, rows.length, rows[0].length);
  sh.setFrozenRows(1);
  autosize_(sh, rows[0].length);
  return sh;
}

function seedKeyValue_(ss, name, rows) {
  const sh = seedTable_(ss, name, rows);
  sh.getRange(1, 1, rows.length, 1).setFontWeight('bold');
  sh.setColumnWidth(1, 170);
  sh.setColumnWidth(2, 320);
  sh.setColumnWidth(3, 380);
  return sh;
}

function styleHeader_(sh, cols) {
  sh.getRange(1, 1, 1, cols)
    .setBackground(CFG.COLOR.HEADER)
    .setFontColor(CFG.COLOR.HEADERTEXT)
    .setFontWeight('bold')
    .setVerticalAlignment('middle');
  sh.setRowHeight(1, 32);
}

function zebra_(sh, rows, cols) {
  if (rows < 2) return;
  for (let r = 2; r <= rows; r++) {
    sh.getRange(r, 1, 1, cols).setBackground(r % 2 ? CFG.COLOR.BANDB : CFG.COLOR.BANDA);
  }
}

function autosize_(sh, cols) {
  for (let c = 1; c <= cols; c++) {
    sh.autoResizeColumn(c);
    if (sh.getColumnWidth(c) > 360) sh.setColumnWidth(c, 360);
  }
}

/* --------------------------- 🎬 Today ----------------------------- */

function buildTodayTab_(ss) {
  const sh = ss.getSheetByName(CFG.TAB.TODAY) || ss.insertSheet(CFG.TAB.TODAY);
  sh.clear();
  sh.getRange('A1').setValue('🎬  TheBookX — Today').setFontSize(18).setFontWeight('bold').setFontColor(CFG.COLOR.INK);
  sh.getRange('A2').setValue('Run  Menu ▸ TheBookX ▸ Generate today  to fill this.').setFontColor(CFG.COLOR.GREY);
  sh.getRange('A1:D1').merge();
  sh.getRange('A2:D2').merge();
  sh.setColumnWidth(1, 160);
  sh.setColumnWidth(2, 520);
  sh.setColumnWidth(3, 160);
  sh.setColumnWidth(4, 160);
  sh.setHiddenGridlines(true);
  sh.setFrozenRows(2);
  return sh;
}

/** Repaint 🎬 Today from the latest row in each format tab. */
function paintToday_() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(CFG.TAB.TODAY) || buildTodayTab_(ss);
  // wipe content below header band
  if (sh.getMaxRows() > 3) sh.getRange(3, 1, sh.getMaxRows() - 2, sh.getMaxColumns()).clearContent().setBackground(null);

  const today = todayStr_();
  sh.getRange('A1').setValue('🎬  TheBookX — ' + today);
  sh.getRange('A2').setValue('Today\'s four formats. Open the Web App on your phone for copy buttons.');

  let r = 4;
  r = todayBlock_(sh, r, '📕 Daily Book Reel', latestRow_(CFG.TAB.REEL), [
    ['Hook', 4], ['Caption', 13]
  ]);
  r = todayBlock_(sh, r, '🖼️ Editorial Carousel', latestRow_(CFG.TAB.CAROUSEL), [
    ['Cover (slide 1)', 4], ['Caption', 14]
  ]);
  r = todayBlock_(sh, r, '💬 WhatsApp Post', latestRow_(CFG.TAB.WHATSAPP), [
    ['Quote', 3], ['Caption', 4]
  ]);
  r = todayBlock_(sh, r, '📚 Reading Reel', latestRow_(CFG.TAB.READING), [
    ['Hook line 1', 2], ['Hook line 2', 3], ['Caption', 9]
  ]);
}

function todayBlock_(sh, r, label, row, fields) {
  sh.getRange(r, 1).setValue(label).setFontWeight('bold').setFontColor('#ffffff').setBackground(CFG.COLOR.ORANGE);
  sh.getRange(r, 1, 1, 2).merge();
  r++;
  if (!row) { sh.getRange(r, 1).setValue('— not generated yet —').setFontColor(CFG.COLOR.GREY); return r + 2; }
  fields.forEach(f => {
    sh.getRange(r, 1).setValue(f[0]).setFontWeight('bold').setFontColor(CFG.COLOR.GREY);
    sh.getRange(r, 2).setValue(row[f[1]] || '').setWrap(true);
    r++;
  });
  return r + 1;
}

function latestRow_(tabName) {
  const sh = SpreadsheetApp.getActive().getSheetByName(tabName);
  if (!sh || sh.getLastRow() < 2) return null;
  return sh.getRange(sh.getLastRow(), 1, 1, sh.getLastColumn()).getValues()[0];
}

function orderTabs_(ss) {
  const order = [CFG.TAB.TODAY, CFG.TAB.CONFIG, CFG.TAB.BOOKS, CFG.TAB.HOOKS,
    CFG.TAB.REEL, CFG.TAB.CAROUSEL, CFG.TAB.WHATSAPP, CFG.TAB.READING, CFG.TAB.LOG];
  order.forEach((name, i) => {
    const sh = ss.getSheetByName(name);
    if (sh) { ss.setActiveSheet(sh); ss.moveActiveSheet(i + 1); }
  });
  ss.setActiveSheet(ss.getSheetByName(CFG.TAB.TODAY));
}

/* ------------------------ small utilities ------------------------- */

function getConfig_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(CFG.TAB.CONFIG);
  const o = {};
  if (sh && sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(([k, v]) => { if (k) o[k] = v; });
  }
  // fall back to seed defaults for anything missing
  CFG.CONFIG_SEED.slice(1).forEach(([k, v]) => { if (o[k] === undefined || o[k] === '') o[k] = v; });
  return o;
}

function todayStr_() {
  return Utilities.formatDate(new Date(), CFG.TZ, 'yyyy-MM-dd');
}
