/*************************************************************************
 * TheBookX — Daily Instagram Content Engine
 * FILE 1 / 6 : Config.gs   (constants + seed data, no logic)
 *
 * The brain lives in this Sheet. Apps Script has no canvas and cannot
 * encode video, so it only generates COPY + SCHEDULING and exposes it
 * as JSON. The local HTML studio stays the renderer.
 *
 * Decisions I made (noted per your instruction):
 *  - Model: gemini-3.5-flash-lite. As of Oct 2026 the 2.5 models are
 *    gated to prior users and 2.0 is shut down; Google tells new projects
 *    to use 3.5-flash-lite (cheap, fast, structured-output capable) or
 *    3.8-flash (higher quality). The model is a Config cell, so you can
 *    switch it in the Sheet without touching code.
 *  - API key lives in Script Properties under GEMINI_API_KEY, never here.
 *  - Timezone Asia/Kolkata for the daily trigger and all date stamps.
 *************************************************************************/

const CFG = {
  TZ: 'Asia/Kolkata',

  // Tab names (emoji kept on the dashboard tab only).
  TAB: {
    TODAY:     '🎬 Today',
    CONFIG:    'Config',
    BOOKS:     'Book Library',
    HOOKS:     'Hook Library',
    REEL:      'Daily Book Reel',
    CAROUSEL:  'Editorial Carousel',
    WHATSAPP:  'WhatsApp Post',
    READING:   'Reading Reels',
    LOG:       'Posted Log'
  },

  // Brand palette for sheet styling.
  COLOR: {
    INK:    '#141414',
    ORANGE: '#E8622A',
    PAPER:  '#F7F1E7',
    GREY:   '#6b5f54',
    HEADER: '#141414',
    HEADERTEXT: '#ffffff',
    BANDA:  '#ffffff',
    BANDB:  '#faf7f2',
    ACCENTBG: '#fdece4'
  },

  // Config-tab defaults (key, value, note). Read live via getConfig().
  CONFIG_SEED: [
    ['Key', 'Value', 'Notes'],
    ['brand_name',    'TheBookX',                      'Brand name used in copy'],
    ['site',          'thebookx.in',                   'Domain shown on every frame'],
    ['handle',        '@thebookx.in',                  'Instagram handle'],
    ['price_hook',    '₹1',                            'The hook price — books from ₹1'],
    ['discount_hook', 'up to 50% off',                 'Discount line for WhatsApp'],
    ['gemini_model',  'gemini-3.5-flash-lite',         'Swap to gemini-3.8-flash for higher quality'],
    ['gemini_temp',   '0.9',                           'Creativity 0-2; 0.9 = lively but on-voice'],
    ['drive_root',    'TheBookX Content',              'Drive folder that holds the dated day folders'],
    ['audience',      'Indian readers 18-35 on Bookstagram', 'Who we write for'],
    ['last_generated','',                              'Auto-set by generateToday()']
  ],

  // 10 hook formulas. {book} / {n} / {category} are filled at prompt time.
  // "times_used" + "last_used" drive least-recently-used rotation.
  HOOKS_SEED: [
    ['ID','Formula','Example','Times Used','Last Used'],
    ['H01','{n} signs you {pain}',                 '7 signs you overthink everything', 0, ''],
    ['H02','{n} things {book} taught me',          '7 things Atomic Habits taught me', 0, ''],
    ['H03','{n} lines that will {benefit}',        '7 lines that will fix your focus', 0, ''],
    ['H04','Read this before you {action}',        'Read this before you quit', 0, ''],
    ['H05','{n} hard truths about {topic}',        '7 hard truths about money', 0, ''],
    ['H06','What nobody tells you about {topic}',  'What nobody tells you about discipline', 0, ''],
    ['H07','{n} {category} rules I wish I knew at 20', '7 money rules I wish I knew at 20', 0, ''],
    ['H08','Why you {pain} (and the fix)',         'Why you never finish books (and the fix)', 0, ''],
    ['H09','{book} in {n} lines',                  'The Psychology of Money in 7 lines', 0, ''],
    ['H10','Steal these {n} ideas from {book}',    'Steal these 7 ideas from Deep Work', 0, '']
  ],

  // The 14 books. Covers + product links are the real on-site URLs
  // (verified against thebookx.in). "Active" = in rotation.
  // columns: id,title,author,category,price,coverUrl,link,active,lastUsed
  BOOKS_SEED: [
    ['ID','Title','Author','Category','Price','Cover URL','Product Link','Active','Last Used'],
    ['clarity','The Art of Clarity','Murthy Thevar','Self-Help','₹1','https://thebookx.in/books/the-art-of-clarity.jpeg','https://thebookx.in/books/the-art-of-clarity',true,''],
    ['pom','The Psychology of Money','Morgan Housel','Money','₹1','https://thebookx.in/books/psychology-of-money.jpeg','https://thebookx.in/books/the-psychology-of-money',true,''],
    ['atomic','Atomic Habits','James Clear','Habits','₹1','https://thebookx.in/books/atomic-habits.jpeg','https://thebookx.in/books/atomic-habits',true,''],
    ['courage','The Courage to Be Disliked','Kishimi & Koga','Psychology','₹1','https://thebookx.in/books/courage-to-be-disliked.jpeg','https://thebookx.in/books/the-courage-to-be-disliked',true,''],
    ['goggins','Can\'t Hurt Me','David Goggins','Discipline','₹1','https://thebookx.in/books/cant-hurt-me.png','https://thebookx.in/books/cant-hurt-me',true,''],
    ['onething','The One Thing','Gary Keller','Productivity','₹1','https://thebookx.in/books/the-one-thing.png','https://thebookx.in/books/the-one-thing',true,''],
    ['mountain','The Mountain Is You','Brianna Wiest','Self-Help','₹1','https://thebookx.in/books/The-Mountain-Is-You.jpg','https://thebookx.in/books/the-mountain-is-you',true,''],
    ['subtle','The Subtle Art of Not Giving a F*ck','Mark Manson','Mindset','₹1','https://thebookx.in/books/subtle-art-not-giving-fck.jpeg','https://thebookx.in/books/the-subtle-art-of-not-giving-a-f-ck',true,''],
    ['alchemist','The Alchemist','Paulo Coelho','Fiction','₹1','https://thebookx.in/books/alchemist.png','https://thebookx.in/books/the-alchemist',true,''],
    ['naval','The Almanack of Naval Ravikant','Eric Jorgenson','Wealth','₹1','https://thebookx.in/books/almanack-of-naval-ravikant.png','https://thebookx.in/books/the-almanack-of-naval-ravikant',true,''],
    ['zero','Zero to One','Peter Thiel','Startups','₹1','https://thebookx.in/books/zero-to-one.png','https://thebookx.in/books/zero-to-one',true,''],
    ['maketime','Make Time','Knapp & Zeratsky','Productivity','₹1','https://thebookx.in/books/make-time.png','https://thebookx.in/books/make-time',true,''],
    ['mindset','Mindset','Carol Dweck','Growth','₹1','https://thebookx.in/books/Mindset.jpg','https://thebookx.in/books/mindset-the-new-psychology-of-success',true,''],
    ['humannature','The Laws of Human Nature','Robert Greene','Psychology','₹1','https://thebookx.in/books/laws-of-human-nature.jpeg','https://thebookx.in/books/the-laws-of-human-nature',true,'']
  ],

  // Column headers for the four format tabs + the log.
  HEAD: {
    REEL:     ['Date','Book ID','Book','Hook ID','Hook','Insight 1','Insight 2','Insight 3','Insight 4','Insight 5','Insight 6','Insight 7','Insight 8 (follow)','Caption','Hashtags','JSON'],
    CAROUSEL: ['Date','Book ID','Book','Hook ID','Slide 1 (cover)','Slide 2','Slide 3','Slide 4','Slide 5','Slide 6','Slide 7','Slide 8','Slide 9 (₹1 CTA)','Script Words','Caption','Hashtags','JSON'],
    WHATSAPP: ['Date','Book ID','Book','Quote','Caption','Link','Hashtags','JSON'],
    READING:  ['Date','Topic','Line 1 (caps)','Line 2 (script)','Reason 1','Reason 2','Reason 3','Reason 4','Reason 5','Caption','Hashtags','JSON'],
    LOG:      ['Date','Format','Book','Posted?','Views','Likes','Saves','Shares','Follows','Notes']
  },

  // Reading Reels are book-culture, not tied to a book. Seeded topics,
  // also rotated LRU via the Reading Reels tab history.
  READING_TOPICS: [
    'why reading beats scrolling',
    'what reading does to your brain',
    'why leaders read daily',
    'how readers live more than one life',
    'the cheapest mentor you will ever find',
    'why 20 pages a day changes everything',
    'reading as a status reset',
    'how to actually finish a book'
  ]
};
