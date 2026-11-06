/**
 * TheBookX × Art of Clarity — Daily Command Center (backend)
 *
 * Paste into Extensions → Apps Script as Code.gs, add an HTML file named "Index",
 * run setup() once, then Deploy → New deployment → Web app.
 *
 * The script only creates/uses its own tabs (DB_*). Your existing tabs are never touched.
 */
const SHEET_ID = '1BweJXh6xR8XnjqRpM672sHwvQi7ctVdNYkkbrfmpLUA';

const TABS = {
  tasks:    { name: 'DB_Tasks',    head: ['TaskID', 'Dashboard', 'Day', 'Time', 'Title', 'Category', 'Active', 'CreatedAt'] },
  log:      { name: 'DB_TaskLog',  head: ['Date', 'Dashboard', 'TaskID', 'Status', 'UpdatedAt'] },
  checkins: { name: 'DB_CheckIns', head: ['Date', 'Dashboard', 'CheckIn', 'Mood', 'Energy', 'Focus', 'CheckOut', 'Wins', 'Blockers', 'Rating', 'UpdatedAt'] },
  goals:    { name: 'DB_Goals',    head: ['GoalID', 'Dashboard', 'Goal', 'Target', 'Current', 'Unit', 'Start', 'End'] },
  goalLog:  { name: 'DB_GoalLog',  head: ['Date', 'Dashboard', 'GoalID', 'Delta', 'Total', 'UpdatedAt'] },
};
// Everything else is stored as plain text so dates/times never get auto-converted by Sheets.
const NUMERIC = new Set(['Mood', 'Energy', 'Rating', 'Target', 'Current', 'Delta', 'Total']);
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DASHBOARDS = ['bookx', 'clarity'];

// Day column values: Daily | Mon..Sun | Weekly (any day that week) | yyyy-MM-dd (one-off)
const SEED_TASKS = [
  // ── TheBookX: daily social engine ──
  ['B01', 'bookx', 'Daily', '08:00', "Sneak-peek today's ₹1 Drop on WhatsApp Channel + Telegram", 'WhatsApp'],
  ['B02', 'bookx', 'Daily', '09:00', "IG Story poll — \"Guess today's ₹1 book\"", 'Instagram'],
  ['B03', 'bookx', 'Daily', '13:00', 'Post Reel #1 → cross-post as YT Short + Facebook', 'Content'],
  ['B04', 'bookx', 'Daily', '17:00', 'Pinterest pins + Threads post', 'Distribution'],
  ['B05', 'bookx', 'Daily', '19:30', 'Countdown Story + WhatsApp reminder', 'Instagram'],
  ['B06', 'bookx', 'Daily', '20:00', '🔥 ₹1 Drop Reel + Short + links on WhatsApp/Telegram', 'Drop'],
  ['B07', 'bookx', 'Daily', '21:00', 'Reply to every comment & DM within the hour', 'Community'],
  ['B10', 'bookx', 'Mon', '11:00', 'Theme: Motivation / Self-help reel', 'Theme'],
  ['B11', 'bookx', 'Tue', '11:00', 'Theme: Exam-prep books reel', 'Theme'],
  ['B12', 'bookx', 'Wed', '11:00', 'Theme: Fiction picks reel', 'Theme'],
  ['B13', 'bookx', 'Thu', '11:00', 'Customer Haul Day — repost unboxings (#₹1Haul)', 'Theme'],
  ['B14', 'bookx', 'Fri', '11:00', 'Mystery Box reveal', 'Theme'],
  ['B15', 'bookx', 'Sat', '11:00', 'Regional / Kids books reel', 'Theme'],
  ['B16', 'bookx', 'Sun', '11:00', 'YouTube long video + weekly recap carousel', 'Theme'],
  ['B20', 'bookx', 'Weekly', '', 'Batch-shoot 14 Reels (session 1)', 'Content'],
  ['B21', 'bookx', 'Weekly', '', 'Batch-shoot 14 Reels (session 2)', 'Content'],
  ['B22', 'bookx', 'Weekly', '', '3 honest Reddit / Quora answers', 'Distribution'],
  ['B23', 'bookx', 'Weekly', '', '2 Google Business Profile posts', 'Distribution'],
  ['B24', 'bookx', 'Weekly', '', 'Send books to 2–3 micro bookstagrammers', 'Collabs'],
  ['B25', 'bookx', 'Weekly', '', 'Sunday review: remake top 3 posts, drop worst format', 'Review'],

  // ── Art of Clarity: road to 1,00,000 ──
  ['C01', 'clarity', 'Daily', '06:00', "Review yesterday's numbers & pick 3 priorities", 'Planning'],
  ['C02', 'clarity', 'Daily', '07:00', 'Record 2–3 clarity-tip Reels / Shorts', 'Content'],
  ['C03', 'clarity', 'Daily', '08:00', 'Post Reel #1 + LinkedIn post + WhatsApp morning message', 'Content'],
  ['C04', 'clarity', 'Daily', '08:30', 'Ads check — kill losers, scale winners', 'Ads'],
  ['C05', 'clarity', 'Daily', '09:00', 'Bulk sales: 10 calls/emails to colleges, HR & companies', 'Bulk sales'],
  ['C06', 'clarity', 'Daily', '12:00', '5 podcast pitches + PR follow-ups', 'PR'],
  ['C07', 'clarity', 'Daily', '13:00', 'Post Reel #2 + carousel, reply to comments', 'Content'],
  ['C08', 'clarity', 'Daily', '14:00', 'College talk / corporate meeting / film YouTube', 'Bulk sales'],
  ['C09', 'clarity', 'Daily', '16:00', 'DM 10 creators, ship books, track referral codes', 'Influencers'],
  ['C10', 'clarity', 'Daily', '17:00', 'Ambassadors: onboard new, share leaderboard & kit', 'Ambassadors'],
  ['C11', 'clarity', 'Daily', '18:00', 'TheBookX ops — ₹1 Drop prep & orders', 'TheBookX'],
  ['C12', 'clarity', 'Daily', '19:30', 'Stories + repost reader photos', 'Content'],
  ['C13', 'clarity', 'Daily', '20:00', 'Prime time: Drop / Live / Reel #3 + reply all DMs', 'Community'],
  ['C14', 'clarity', 'Daily', '21:00', "Tomorrow's scripts + update Road-to-1-Lakh counter", 'Planning'],
  ['C20', 'clarity', 'Weekly', '', 'YouTube long video #1 (chapter breakdown)', 'Content'],
  ['C21', 'clarity', 'Weekly', '', 'YouTube long video #2 (Q&A)', 'Content'],
  ['C22', 'clarity', 'Weekly', '', 'Live AMA — "Ask me anything about clarity"', 'Community'],
  ['C23', 'clarity', 'Weekly', '', '3–4 college talks booked & delivered', 'Bulk sales'],
  ['C24', 'clarity', 'Weekly', '', 'Media pitch round / press release', 'PR'],
  ['C25', 'clarity', 'Weekly', '', '5 fresh ad creatives + Kindle promo check', 'Ads'],
];

function seedGoals_() {
  const start = today_(), mid = addDays_(start, 29), end = addDays_(start, 59);
  return [
    ['G1', 'clarity', 'Copies in readers\' hands', 100000, 0, 'copies', start, end],
    ['G2', 'clarity', 'Bulk deals closed', 15, 0, 'deals', start, end],
    ['G3', 'clarity', 'Amazon reviews', 100, 0, 'reviews', start, end],
    ['G4', 'clarity', 'Student ambassadors', 500, 0, 'people', start, end],
    ['G5', 'clarity', 'Podcast appearances', 20, 0, 'episodes', start, end],
    ['G6', 'clarity', 'College talks', 25, 0, 'talks', start, end],
    ['G10', 'bookx', 'WhatsApp Channel followers', 1000, 0, 'followers', start, mid],
    ['G11', 'bookx', 'Reels posted', 60, 0, 'reels', start, end],
    ['G12', 'bookx', 'Micro-influencer collabs', 10, 0, 'collabs', start, end],
    ['G13', 'bookx', 'Reels over 50k views', 3, 0, 'reels', start, end],
    ['G14', 'bookx', 'Telegram members', 500, 0, 'members', start, end],
  ];
}

// ───────────────────────── Web app ─────────────────────────

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Daily Command Center')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Run once from the editor to authorize and create the DB_* tabs. */
function setup() {
  Object.keys(TABS).forEach(sheet_);
  return 'Command Center tabs ready';
}

// ───────────────────────── Read ─────────────────────────

function getData(dash, date) {
  if (DASHBOARDS.indexOf(dash) < 0) throw new Error('Unknown dashboard: ' + dash);
  date = date || today_();
  const wk = weekStart_(date);

  const tasks = rows_('tasks').filter(t => t.Dashboard === dash && active_(t.Active));
  const status = {};
  rows_('log').forEach(l => { if (l.Dashboard === dash) status[l.Date + '|' + l.TaskID] = String(l.Status || ''); });

  const scheduled = d => tasks.filter(t => t.Day !== 'Weekly' && appliesOn_(String(t.Day), d));
  const toTask = (t, key) => ({
    id: String(t.TaskID), title: String(t.Title), time: String(t.Time || ''),
    cat: String(t.Category || ''), day: String(t.Day), status: status[key + '|' + t.TaskID] || '',
  });
  const score = d => {
    const list = scheduled(d);
    let done = 0, skip = 0;
    list.forEach(t => {
      const s = status[d + '|' + t.TaskID];
      if (s === 'done') done++; else if (s === 'skip') skip++;
    });
    const total = list.length - skip;
    return { date: d, done: done, total: total, pct: total ? done / total : null };
  };

  const history = [];
  for (let i = 13; i >= 0; i--) history.push(score(addDays_(date, -i)));
  const week = [];
  for (let i = 0; i < 7; i++) week.push(score(addDays_(wk, i)));

  let streakBefore = 0;
  for (let i = 1; i <= 120; i++) {
    const s = score(addDays_(date, -i));
    if (s.pct !== null && s.pct >= 0.6) streakBefore++; else break;
  }

  // Tasks that keep slipping over the last 14 days → shown as "fix the friction" suggestions.
  const missCount = {};
  for (let i = 1; i <= 14; i++) {
    const d = addDays_(date, -i);
    scheduled(d).forEach(t => {
      if (!status[d + '|' + t.TaskID]) missCount[t.TaskID] = (missCount[t.TaskID] || 0) + 1;
    });
  }
  const missed = tasks
    .filter(t => (missCount[t.TaskID] || 0) >= 3)
    .map(t => Object.assign(toTask(t, date), { count: missCount[t.TaskID] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const ci = {};
  rows_('checkins').forEach(r => { if (r.Dashboard === dash) ci[r.Date] = r; });
  const c = ci[date];
  const checkin = c ? {
    checkIn: String(c.CheckIn || ''), mood: Number(c.Mood) || 0, energy: Number(c.Energy) || 0,
    focus: String(c.Focus || ''), checkOut: String(c.CheckOut || ''), wins: String(c.Wins || ''),
    blockers: String(c.Blockers || ''), rating: Number(c.Rating) || 0,
  } : {};
  const ciHistory = history.map(h => {
    const r = ci[h.date] || {};
    return { date: h.date, mood: Number(r.Mood) || 0, rating: Number(r.Rating) || 0, out: !!r.CheckOut, blockers: String(r.Blockers || '') };
  });

  const todayDelta = {};
  rows_('goalLog').forEach(g => {
    if (g.Dashboard === dash && g.Date === date) todayDelta[g.GoalID] = (todayDelta[g.GoalID] || 0) + (Number(g.Delta) || 0);
  });
  const goals = rows_('goals').filter(g => g.Dashboard === dash).map(g => ({
    id: String(g.GoalID), name: String(g.Goal), target: Number(g.Target) || 0, current: Number(g.Current) || 0,
    unit: String(g.Unit || ''), start: String(g.Start || ''), end: String(g.End || ''), todayDelta: todayDelta[g.GoalID] || 0,
  }));

  return {
    dash: dash, date: date, weekStart: wk,
    today: scheduled(date).map(t => toTask(t, date)).sort((a, b) => (a.time || '99').localeCompare(b.time || '99')),
    weekly: tasks.filter(t => t.Day === 'Weekly').map(t => toTask(t, wk)),
    history: history, week: week, streakBefore: streakBefore, missed: missed,
    checkin: checkin, ciHistory: ciHistory, goals: goals,
  };
}

// ───────────────────────── Write ─────────────────────────

/** status: 'done' | 'skip' | '' (unchecked). Weekly tasks are keyed to the week's Monday. */
function setTaskStatus(dash, date, taskId, status, weekly) {
  return withLock_(() => {
    const key = weekly ? weekStart_(date) : date;
    const hit = rows_('log').find(r => r.Date === key && r.Dashboard === dash && String(r.TaskID) === String(taskId));
    writeRow_('log', hit && hit._row, [key, dash, String(taskId), status || '', now_()]);
    return { ok: true };
  });
}

/** Merges check-in / check-out fields for a day. */
function saveDay(dash, date, patch) {
  return withLock_(() => {
    const fields = { checkIn: 'CheckIn', mood: 'Mood', energy: 'Energy', focus: 'Focus', checkOut: 'CheckOut', wins: 'Wins', blockers: 'Blockers', rating: 'Rating' };
    const head = TABS.checkins.head;
    const hit = rows_('checkins').find(r => r.Date === date && r.Dashboard === dash);
    const rec = {};
    head.forEach(h => { rec[h] = hit ? hit[h] : ''; });
    Object.keys(patch || {}).forEach(k => { if (fields[k]) rec[fields[k]] = patch[k]; });
    rec.Date = date; rec.Dashboard = dash; rec.UpdatedAt = now_();
    writeRow_('checkins', hit && hit._row, head.map(h => rec[h]));
    return { ok: true };
  });
}

/** mode 'add' adds value to the goal; mode 'set' replaces the total. */
function addGoalProgress(dash, goalId, value, date, mode) {
  return withLock_(() => {
    const g = rows_('goals').find(r => r.Dashboard === dash && String(r.GoalID) === String(goalId));
    if (!g) throw new Error('Goal not found: ' + goalId);
    const cur = Number(g.Current) || 0;
    const next = mode === 'set' ? Number(value) : cur + Number(value);
    sheet_('goals').getRange(g._row, TABS.goals.head.indexOf('Current') + 1).setValue(next);
    writeRow_('goalLog', null, [date || today_(), dash, String(goalId), next - cur, next, now_()]);
    return { current: next, delta: next - cur };
  });
}

/** list: [{id?, title, time, day, category}] */
function addTasks(dash, list) {
  return withLock_(() => {
    const sh = sheet_('tasks');
    const rows = (list || []).map((t, i) => [
      t.id || ('T' + Date.now().toString(36) + i), dash, t.day || 'Daily', t.time || '', t.title, t.category || '', 'TRUE', now_(),
    ]);
    if (rows.length) {
      const range = sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length);
      range.setNumberFormat('@');
      range.setValues(rows);
    }
    return { ok: true, ids: rows.map(r => r[0]) };
  });
}

/** patch: {title?, time?, day?, category?, active?} */
function updateTask(dash, taskId, patch) {
  return withLock_(() => {
    const t = rows_('tasks').find(r => r.Dashboard === dash && String(r.TaskID) === String(taskId));
    if (!t) throw new Error('Task not found: ' + taskId);
    const map = { title: 'Title', time: 'Time', day: 'Day', category: 'Category' };
    Object.keys(map).forEach(k => { if (patch[k] !== undefined) t[map[k]] = patch[k]; });
    if (patch.active !== undefined) t.Active = patch.active ? 'TRUE' : 'FALSE';
    writeRow_('tasks', t._row, TABS.tasks.head.map(h => t[h]));
    return { ok: true };
  });
}

// ───────────────────────── Helpers ─────────────────────────

let SS_;
function ss_() { return SS_ || (SS_ = SpreadsheetApp.openById(SHEET_ID)); }
function tz_() { return ss_().getSpreadsheetTimeZone(); }
function now_() { return Utilities.formatDate(new Date(), tz_(), 'yyyy-MM-dd HH:mm:ss'); }
function today_() { return Utilities.formatDate(new Date(), tz_(), 'yyyy-MM-dd'); }

function sheet_(key) {
  const t = TABS[key];
  let sh = ss_().getSheetByName(t.name);
  if (sh) return sh;
  sh = ss_().insertSheet(t.name);
  sh.getRange(1, 1, 1, t.head.length).setValues([t.head]).setFontWeight('bold').setBackground('#F1F3F9');
  sh.setFrozenRows(1);
  t.head.forEach((h, j) => {
    sh.getRange(2, j + 1, sh.getMaxRows() - 1, 1).setNumberFormat(NUMERIC.has(h) ? '0' : '@');
  });
  const seed = key === 'tasks' ? SEED_TASKS.map(r => r.concat(['TRUE', now_()]))
             : key === 'goals' ? seedGoals_() : null;
  if (seed) sh.getRange(2, 1, seed.length, t.head.length).setValues(seed);
  return sh;
}

function rows_(key) {
  const sh = sheet_(key), n = sh.getLastRow(), head = TABS[key].head;
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, head.length).getValues().map((r, i) => {
    const o = { _row: i + 2 };
    head.forEach((h, j) => {
      const v = r[j];
      o[h] = v instanceof Date ? Utilities.formatDate(v, tz_(), h === 'Time' ? 'HH:mm' : 'yyyy-MM-dd') : v;
    });
    return o;
  });
}

function writeRow_(key, row, values) {
  const sh = sheet_(key), head = TABS[key].head;
  const range = sh.getRange(row || sh.getLastRow() + 1, 1, 1, values.length);
  range.setNumberFormats([head.map(h => NUMERIC.has(h) ? '0' : '@')]);
  range.setValues([values]);
}

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function active_(v) { return v === true || String(v).toUpperCase() === 'TRUE'; }
function appliesOn_(day, date) { return day === 'Daily' || day === date || day === DAYS[weekday_(date)]; }
function parse_(s) { const p = String(s).split('-').map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2])); }
function addDays_(s, n) { const d = parse_(s); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function weekday_(s) { return parse_(s).getUTCDay(); }
function weekStart_(s) { return addDays_(s, -((weekday_(s) + 6) % 7)); }
