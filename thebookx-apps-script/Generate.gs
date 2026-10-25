/*************************************************************************
 * TheBookX — FILE 4 / 6 : Generate.gs
 * The daily brain: pick book (LRU) + hook (LRU) + reading topic (LRU),
 * call Gemini for all four formats, append a row to each tab, create a
 * dated Drive folder, repaint 🎬 Today.
 *************************************************************************/

function generateToday() {
  const ss = SpreadsheetApp.getActive();
  const date = todayStr_();

  // 1. Selections via least-recently-used rotation.
  const book  = pickLRUBook_();
  const hook  = pickLRUHook_();
  const topic = pickLRUTopic_();

  // 2. Generate (each format is independent; one failure won't block the rest).
  const results = {};
  results.reel     = safe_(() => genReel_(book, hook),     'Reel');
  results.carousel = safe_(() => genCarousel_(book, hook), 'Carousel');
  results.whatsapp = safe_(() => genWhatsapp_(book),       'WhatsApp');
  results.reading  = safe_(() => genReading_(topic),       'Reading');

  // 3. Write rows.
  if (results.reel)     writeReel_(date, book, hook, results.reel);
  if (results.carousel) writeCarousel_(date, book, hook, results.carousel);
  if (results.whatsapp) writeWhatsapp_(date, book, results.whatsapp);
  if (results.reading)  writeReading_(date, topic, results.reading);

  // 4. Mark rotation usage + stamp config.
  markBookUsed_(book.id);
  markHookUsed_(hook.id);
  setConfigValue_('last_generated', date + ' ' + Utilities.formatDate(new Date(), CFG.TZ, 'HH:mm'));

  // 5. Dated Drive folder for the day's rendered exports.
  const folderUrl = ensureDayFolder_(date);
  logDay_(date, book, folderUrl);

  // 6. Repaint dashboard.
  paintToday_();

  SpreadsheetApp.getActive().toast('Generated ' + date + ' — book: ' + book.title, 'TheBookX', 6);
  return { date: date, book: book.title, folder: folderUrl };
}

/** Generate a week ahead (handy before a trip). Rotation advances each day. */
function generateNext7Days() {
  for (let i = 0; i < 7; i++) generateToday();
  SpreadsheetApp.getActive().toast('Generated the next 7 days.', 'TheBookX', 6);
}

function safe_(fn, label) {
  try { return fn(); }
  catch (e) {
    SpreadsheetApp.getActive().toast(label + ' failed: ' + e.message, 'TheBookX', 10);
    Logger.log(label + ' error: ' + e.stack);
    return null;
  }
}

/* --------------------- least-recently-used --------------------- */
// Pick the ACTIVE row whose "Last Used" is oldest/empty. Empty wins first,
// so a full cycle completes before anything repeats. Ties break on Times Used.

function pickLRUBook_() {
  const sh = getSheet_(CFG.TAB.BOOKS);
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 9).getValues();
  let best = null, bestIdx = -1;
  rows.forEach((row, i) => {
    const active = row[7] === true || String(row[7]).toLowerCase() === 'true';
    if (!active) return;
    const last = row[8] ? new Date(row[8]).getTime() : 0;
    if (!best || last < best.last) { best = { last: last }; bestIdx = i; }
  });
  if (bestIdx < 0) throw new Error('No active books in Book Library.');
  const r = rows[bestIdx];
  return { rowIndex: bestIdx + 2, id: r[0], title: r[1], author: r[2], category: r[3],
           price: r[4], cover: r[5], link: r[6] };
}

function pickLRUHook_() {
  const sh = getSheet_(CFG.TAB.HOOKS);
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 5).getValues();
  let bestIdx = 0, bestKey = Infinity;
  rows.forEach((row, i) => {
    const last = row[4] ? new Date(row[4]).getTime() : 0;
    const used = Number(row[3]) || 0;
    const key = last * 1e6 + used; // oldest first, then least used
    if (key < bestKey) { bestKey = key; bestIdx = i; }
  });
  const r = rows[bestIdx];
  return { rowIndex: bestIdx + 2, id: r[0], formula: r[1] };
}

function pickLRUTopic_() {
  // Reading topics rotate via their appearance history in the Reading Reels tab.
  const sh = getSheet_(CFG.TAB.READING);
  const used = {};
  if (sh.getLastRow() > 1) {
    sh.getRange(2, 2, sh.getLastRow() - 1, 1).getValues().forEach((row, i) => { used[row[0]] = i; });
  }
  let pick = CFG.READING_TOPICS[0], bestKey = Infinity;
  CFG.READING_TOPICS.forEach(t => {
    const key = (t in used) ? used[t] + 1 : 0; // never-used wins
    if (key < bestKey) { bestKey = key; pick = t; }
  });
  return pick;
}

function markBookUsed_(id) {
  const sh = getSheet_(CFG.TAB.BOOKS);
  const ids = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) { sh.getRange(i + 2, 9).setValue(new Date()); return; }
  }
}

function markHookUsed_(id) {
  const sh = getSheet_(CFG.TAB.HOOKS);
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 5).getValues();
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === id) {
      sh.getRange(i + 2, 4).setValue((Number(rows[i][3]) || 0) + 1);
      sh.getRange(i + 2, 5).setValue(new Date());
      return;
    }
  }
}

/* --------------------------- writers --------------------------- */

function writeReel_(date, book, hook, d) {
  const row = [date, book.id, book.title, hook.id, d.hook]
    .concat(d.insights.slice(0, 8))
    .concat([d.caption, d.hashtags.join(' '), JSON.stringify(d)]);
  appendRow_(CFG.TAB.REEL, row);
}

function writeCarousel_(date, book, hook, d) {
  const texts  = d.slides.map(s => s.text);
  const words  = d.slides.map(s => s.script_word).join(' | ');
  const row = [date, book.id, book.title, hook.id]
    .concat(texts.slice(0, 9))
    .concat([words, d.caption, d.hashtags.join(' '), JSON.stringify(d)]);
  appendRow_(CFG.TAB.CAROUSEL, row);
}

function writeWhatsapp_(date, book, d) {
  const row = [date, book.id, book.title, d.quote, d.caption, d.link, d.hashtags.join(' '), JSON.stringify(d)];
  appendRow_(CFG.TAB.WHATSAPP, row);
}

function writeReading_(date, topic, d) {
  const row = [date, topic, d.line1, d.line2]
    .concat(d.reasons.slice(0, 5))
    .concat([d.caption, d.hashtags.join(' '), JSON.stringify(d)]);
  appendRow_(CFG.TAB.READING, row);
}

function appendRow_(tabName, row) {
  const sh = getSheet_(tabName);
  sh.appendRow(row);
  const r = sh.getLastRow();
  sh.getRange(r, 1, 1, row.length).setWrap(true).setVerticalAlignment('top')
    .setBackground(r % 2 ? CFG.COLOR.BANDB : CFG.COLOR.BANDA);
}

/* ----------------------------- Drive ---------------------------- */

function ensureDayFolder_(date) {
  const rootName = getConfig_().drive_root || 'TheBookX Content';
  const root = folderByName_(DriveApp.getRootFolder(), rootName) || DriveApp.createFolder(rootName);
  const day = folderByName_(root, date) || root.createFolder(date);
  return day.getUrl();
}

function folderByName_(parent, name) {
  const it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : null;
}

function logDay_(date, book, folderUrl) {
  const sh = getSheet_(CFG.TAB.LOG);
  sh.appendRow([date, 'ALL (generated)', book.title, '', '', '', '', '', '', 'Drive: ' + folderUrl]);
}

function setConfigValue_(key, value) {
  const sh = getSheet_(CFG.TAB.CONFIG);
  const keys = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < keys.length; i++) {
    if (keys[i][0] === key) { sh.getRange(i + 2, 2).setValue(value); return; }
  }
  sh.appendRow([key, value, '']);
}
