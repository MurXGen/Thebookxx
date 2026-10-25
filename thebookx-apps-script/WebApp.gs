/*************************************************************************
 * TheBookX — FILE 5 / 6 : WebApp.gs
 * doGet serves two things from the SAME url:
 *   (default)        a mobile page of today's content with Copy buttons
 *   ?format=json     today's content as JSON for the HTML studio renderer
 * Deploy: Deploy ▸ New deployment ▸ Web app ▸ Execute as Me ▸ Access: Anyone.
 *************************************************************************/

function doGet(e) {
  const asJson = e && e.parameter && e.parameter.format === 'json';
  const data = buildTodayPayload_();

  if (asJson) {
    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return HtmlService.createHtmlOutput(mobilePage_(data))
    .setTitle('TheBookX — Today')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Assemble today's content from the latest row (JSON column) of each tab. */
function buildTodayPayload_() {
  const latestJson = (tab) => {
    const sh = SpreadsheetApp.getActive().getSheetByName(tab);
    if (!sh || sh.getLastRow() < 2) return null;
    const lastCol = sh.getLastColumn();
    const date = sh.getRange(sh.getLastRow(), 1).getValue();
    const raw = sh.getRange(sh.getLastRow(), lastCol).getValue(); // JSON column is always last
    try { return { date: fmtDate_(date), data: JSON.parse(raw) }; }
    catch (err) { return { date: fmtDate_(date), data: null }; }
  };

  const reel = latestJson(CFG.TAB.REEL);
  const book = reel ? bookMetaById_(latestVal_(CFG.TAB.REEL, 2)) : null;

  return {
    brand: getConfig_().brand_name,
    site: getConfig_().site,
    handle: getConfig_().handle,
    date: (reel && reel.date) || todayStr_(),
    book: book,
    reel:     reel ? reel.data : null,
    carousel: (latestJson(CFG.TAB.CAROUSEL) || {}).data || null,
    whatsapp: (latestJson(CFG.TAB.WHATSAPP) || {}).data || null,
    reading:  (latestJson(CFG.TAB.READING) || {}).data || null
  };
}

function latestVal_(tab, col) {
  const sh = SpreadsheetApp.getActive().getSheetByName(tab);
  if (!sh || sh.getLastRow() < 2) return '';
  return sh.getRange(sh.getLastRow(), col).getValue();
}

function bookMetaById_(id) {
  const sh = SpreadsheetApp.getActive().getSheetByName(CFG.TAB.BOOKS);
  if (!sh) return null;
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 7).getValues();
  for (const r of rows) {
    if (r[0] === id) return { id: r[0], title: r[1], author: r[2], category: r[3], price: r[4], cover: r[5], link: r[6] };
  }
  return null;
}

function fmtDate_(d) {
  if (d instanceof Date) return Utilities.formatDate(d, CFG.TZ, 'yyyy-MM-dd');
  return String(d || '');
}

/* --------------------------- mobile page --------------------------- */

function mobilePage_(d) {
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const field = (label, value) => {
    const v = esc(value);
    return '' +
      '<div class="f">' +
        '<div class="l">' + esc(label) + '</div>' +
        '<div class="v" id="' + uid_() + '">' + v + '</div>' +
        '<button class="c" data-copy="' + v.replace(/"/g, '&quot;') + '">Copy</button>' +
      '</div>';
  };

  const sec = (title, inner) => '<section><h2>' + esc(title) + '</h2>' + inner + '</section>';

  let html = '';

  if (d.reel) {
    let r = field('Hook', d.reel.hook);
    (d.reel.insights || []).forEach((x, i) => r += field('Insight ' + (i + 1), x));
    r += field('Caption', d.reel.caption);
    r += field('Hashtags', (d.reel.hashtags || []).join(' '));
    html += sec('📕 Daily Book Reel', r);
  }
  if (d.carousel) {
    let r = '';
    (d.carousel.slides || []).forEach((s, i) =>
      r += field('Slide ' + (i + 1) + (s.script_word ? ' · script: ' + s.script_word : ''), s.text));
    r += field('Caption', d.carousel.caption);
    r += field('Hashtags', (d.carousel.hashtags || []).join(' '));
    html += sec('🖼️ Editorial Carousel', r);
  }
  if (d.whatsapp) {
    let r = field('Quote', d.whatsapp.quote);
    r += field('Caption', d.whatsapp.caption);
    r += field('Link', d.whatsapp.link);
    r += field('Hashtags', (d.whatsapp.hashtags || []).join(' '));
    html += sec('💬 WhatsApp Post', r);
  }
  if (d.reading) {
    let r = field('Hook line 1', d.reading.line1);
    r += field('Hook line 2 (script)', d.reading.line2);
    (d.reading.reasons || []).forEach((x, i) => r += field('Reason ' + (i + 1), x));
    r += field('Caption', d.reading.caption);
    r += field('Hashtags', (d.reading.hashtags || []).join(' '));
    html += sec('📚 Reading Reel', r);
  }
  if (!html) html = '<p class="empty">Nothing generated yet. Run Generate today in the Sheet.</p>';

  const bookLine = d.book ? (esc(d.book.title) + ' · ' + esc(d.book.author)) : '';

  return [
'<!doctype html><html><head><meta charset="utf-8"><style>',
'*{box-sizing:border-box}body{margin:0;font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#141414;color:#f2efea;padding:16px 14px 60px}',
'header{margin-bottom:14px}h1{font-size:19px;margin:0}.sub{color:#b5aea4;font-size:13px;margin-top:3px}',
'.book{color:#E8622A;font-weight:700;font-size:14px;margin-top:6px}',
'section{background:#1d1b19;border:1px solid #2b2824;border-radius:14px;padding:12px;margin:12px 0}',
'h2{font-size:15px;margin:0 0 8px}',
'.f{display:grid;grid-template-columns:1fr auto;gap:6px 10px;align-items:start;padding:8px 0;border-top:1px solid #272420}',
'.f:first-of-type{border-top:none}.l{grid-column:1;color:#8f877c;font-size:11px;text-transform:uppercase;letter-spacing:.4px}',
'.v{grid-column:1;white-space:pre-wrap;font-size:15px;line-height:1.35}',
'.c{grid-column:2;grid-row:1 / span 2;align-self:center;background:#E8622A;color:#fff;border:none;border-radius:9px;padding:9px 14px;font-weight:700;font-size:13px}',
'.c:active{opacity:.7}.empty{color:#b5aea4}',
'</style></head><body>',
'<header><h1>', esc(d.brand), ' — Today</h1><div class="sub">', esc(d.date), ' · ', esc(d.handle), '</div>',
bookLine ? '<div class="book">' + bookLine + '</div>' : '',
'</header>',
html,
'<script>',
'document.addEventListener("click",function(ev){',
'  var b=ev.target.closest(".c"); if(!b) return;',
'  var t=b.getAttribute("data-copy")||"";',
'  var done=function(){var o=b.textContent;b.textContent="Copied";setTimeout(function(){b.textContent=o;},1200);};',
'  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,function(){fallback(t,done);});}',
'  else{fallback(t,done);}',
'});',
'function fallback(t,cb){var a=document.createElement("textarea");a.value=t;document.body.appendChild(a);a.select();try{document.execCommand("copy");}catch(e){}document.body.removeChild(a);cb();}',
'</script>',
'</body></html>'
  ].join('');
}

var _uid = 0;
function uid_() { return 'v' + (++_uid); }
