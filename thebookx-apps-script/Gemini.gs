/*************************************************************************
 * TheBookX — FILE 2 / 6 : Gemini.gs
 * Structured-output wrapper + per-format responseSchema + the prompt
 * that carries the whole creative standard.
 *************************************************************************/

/** Low-level call. Returns a parsed object matching `schema`. Throws on failure. */
function geminiJson_(systemText, userText, schema) {
  const key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!key) throw new Error('Missing GEMINI_API_KEY in Script Properties. Run First-time setup.');

  const cfg   = getConfig_();
  const model = cfg.gemini_model || 'gemini-3.5-flash-lite';
  const temp  = parseFloat(cfg.gemini_temp || '0.9');

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
              encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(key);

  const payload = {
    systemInstruction: { parts: [{ text: systemText }] },
    contents: [{ role: 'user', parts: [{ text: userText }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: schema,
      temperature: temp,
      maxOutputTokens: 2048
    }
  };

  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    const code = res.getResponseCode();
    const body = res.getContentText();

    if (code === 200) {
      const data = JSON.parse(body);
      const cand = data.candidates && data.candidates[0];
      const text = cand && cand.content && cand.content.parts && cand.content.parts[0].text;
      if (!text) throw new Error('Gemini returned no content: ' + body.slice(0, 500));
      return JSON.parse(text); // responseSchema guarantees valid JSON — no prose parsing.
    }

    lastErr = 'HTTP ' + code + ': ' + body.slice(0, 500);
    // 429 / 5xx → back off and retry; 4xx (bad key/model) → stop.
    if (code === 429 || code >= 500) { Utilities.sleep(1500 * attempt); continue; }
    break;
  }
  throw new Error('Gemini call failed. ' + lastErr);
}

/* ---------------------------------------------------------------------
 * The creative standard. One system prompt, reused for every format.
 * This is the whole point — keep it strict.
 * ------------------------------------------------------------------- */
function systemPrompt_() {
  const c = getConfig_();
  return [
    'You are the senior content writer for ' + c.brand_name + ' (' + c.site + '), an Indian online bookstore',
    'that sells real print books from ' + c.price_hook + '. Audience: ' + c.audience + '.',
    '',
    'GOAL: the Instagram Explore page. Explore ranks on SAVES, SHARES and WATCH-THROUGH, not likes.',
    'Every piece must be worth SAVING (dense, specific, re-readable) or worth SHARING (it says something',
    'about the person who shares it).',
    '',
    'HOOK RULES: under 8 words. Specific beats clever ("7 lines" not "powerful insights"). Open a loop,',
    'never summarise upfront. Second person ("you", not "people"). No question a reader can answer "no" and scroll past.',
    '',
    'BANNED WORDS/PHRASES (they read as AI and kill reach): unlock, game-changer, dive into,',
    '"in today\'s fast-paced world", "here are some", "let\'s explore", transformative, elevate.',
    'No emoji in any hook line.',
    '',
    'VOICE: plain, confident, slightly blunt — a well-read friend who gets to the point. Short sentences,',
    'concrete nouns, no hedging, no hype.',
    '',
    'ACCURACY: insights must be the book\'s real arguments. If you cannot confidently attribute a line,',
    'write a faithful paraphrase with NO quote marks. Never fabricate a quote, a statistic, or a result',
    'the book cannot deliver.',
    '',
    'HASHTAGS: exactly 12 — 3 book-specific, 3 category, 3 Indian bookstagram, 3 broad. No # repeated.',
    'Indian bookstagram set to draw from: #Bookstagram #BookstagramIndia #IndianReaders #BooksOfIndia',
    '#ReadersOfIndia #DelhiBookstagram. Always include #TheBookX and #BooksFrom1Rupee among the broad ones.',
    'Return hashtags WITH the leading # on each.',
    '',
    'Output ONLY the JSON required by the schema. No markdown, no commentary.'
  ].join('\n');
}

/* ----------------------------- SCHEMAS ----------------------------- */
// Gemini's responseSchema is an OpenAPI subset. Counts are enforced in
// code after generation (validateCounts_) because minItems is advisory.

function schemaReel_() {
  return {
    type: 'OBJECT',
    properties: {
      hook:     { type: 'STRING', description: 'Under 8 words, no emoji' },
      insights: { type: 'ARRAY', description: 'Exactly 8; 1-7 content under 12 words, 8 is a follow prompt that still reads as value',
                  items: { type: 'STRING' } },
      caption:  { type: 'STRING' },
      hashtags: { type: 'ARRAY', items: { type: 'STRING' } }
    },
    required: ['hook','insights','caption','hashtags'],
    propertyOrdering: ['hook','insights','caption','hashtags']
  };
}

function schemaCarousel_() {
  return {
    type: 'OBJECT',
    properties: {
      slides: {
        type: 'ARRAY',
        description: '9 slides. 1 = cover (3-6 words, the Explore thumbnail). 2-8 = one idea each, 6-10 words, escalating. 9 = the ₹1 CTA.',
        items: {
          type: 'OBJECT',
          properties: {
            text:        { type: 'STRING' },
            script_word: { type: 'STRING', description: 'The single word set in brush script; MUST appear in this slide text' }
          },
          required: ['text','script_word'],
          propertyOrdering: ['text','script_word']
        }
      },
      caption:  { type: 'STRING' },
      hashtags: { type: 'ARRAY', items: { type: 'STRING' } }
    },
    required: ['slides','caption','hashtags'],
    propertyOrdering: ['slides','caption','hashtags']
  };
}

function schemaWhatsapp_() {
  return {
    type: 'OBJECT',
    properties: {
      quote:    { type: 'STRING', description: 'One line under 14 words; faithful paraphrase ok, no invented quotes' },
      caption:  { type: 'STRING', description: 'Warm group-style caption with the three buy reasons and the link' },
      hashtags: { type: 'ARRAY', items: { type: 'STRING' } }
    },
    required: ['quote','caption','hashtags'],
    propertyOrdering: ['quote','caption','hashtags']
  };
}

function schemaReading_() {
  return {
    type: 'OBJECT',
    properties: {
      line1:    { type: 'STRING', description: '2-4 words, condensed caps' },
      line2:    { type: 'STRING', description: '1-3 words, brush script; line1+line2 read as one phrase' },
      reasons:  { type: 'ARRAY', description: 'Exactly 5 escalating reasons, under 12 words each', items: { type: 'STRING' } },
      caption:  { type: 'STRING' },
      hashtags: { type: 'ARRAY', items: { type: 'STRING' } }
    },
    required: ['line1','line2','reasons','caption','hashtags'],
    propertyOrdering: ['line1','line2','reasons','caption','hashtags']
  };
}

/* --------------------------- GENERATORS ---------------------------- */

function genReel_(book, hook) {
  const u = [
    'FORMAT: Daily Book Reel (20s).',
    'Book: "' + book.title + '" by ' + book.author + ' (' + book.category + ').',
    'Use this hook formula as a starting point, then sharpen it: "' + hook.formula + '".',
    'Shape: hook + exactly 8 insight lines. Lines 1-7 are the book\'s real ideas, under 12 words each.',
    'Line 8 is a follow prompt that still reads as value (e.g. "Follow for one book idea a day").',
    'Then a caption and 12 hashtags.',
    'Mention ' + getConfig_().site + ' and the ' + getConfig_().price_hook + ' hook inside the caption, not inside the insight lines.'
  ].join('\n');
  const out = geminiJson_(systemPrompt_(), u, schemaReel_());
  out.insights = fixLen_(out.insights, 8);
  out.hashtags = fixLen_(out.hashtags, 12);
  return out;
}

function genCarousel_(book, hook) {
  const u = [
    'FORMAT: Editorial Carousel (9 slides).',
    'Book: "' + book.title + '" by ' + book.author + ' (' + book.category + ').',
    'Angle inspired by: "' + hook.formula + '".',
    'Slide 1 is the cover: 3-6 words, must work as a 150px-wide Explore thumbnail.',
    'Slides 2-8: one real idea each, 6-10 words, escalating in payoff.',
    'Slide 9: the ' + getConfig_().price_hook + ' CTA — buy "' + book.title + '" on ' + getConfig_().site + '.',
    'For EVERY slide also return script_word: the single word to set in brush script, and it MUST appear in that slide\'s text.',
    'Then a caption and 12 hashtags.'
  ].join('\n');
  const out = geminiJson_(systemPrompt_(), u, schemaCarousel_());
  out.slides = fixLen_(out.slides, 9, { text: '', script_word: '' });
  out.hashtags = fixLen_(out.hashtags, 12);
  return out;
}

function genWhatsapp_(book) {
  const c = getConfig_();
  const u = [
    'FORMAT: WhatsApp Post (1080x1080) for the ' + c.brand_name + ' WhatsApp group.',
    'Book: "' + book.title + '" by ' + book.author + '.',
    'Return: quote (one line under 14 words, faithful paraphrase ok, no quote marks invented),',
    'and a warm group-style caption that includes the three buy reasons —',
    'free bookmark with every order, ' + c.discount_hook + ', free shipping across India —',
    'plus books from ' + c.price_hook + ', and this link: ' + book.link,
    'Also 12 hashtags.'
  ].join('\n');
  const out = geminiJson_(systemPrompt_(), u, schemaWhatsapp_());
  out.hashtags = fixLen_(out.hashtags, 12);
  out.link = book.link;
  return out;
}

function genReading_(topic) {
  const c = getConfig_();
  const u = [
    'FORMAT: Reading Reel (30s) — book culture, NOT tied to a single book.',
    'Topic: ' + topic + '.',
    'Return line1 (2-4 words, condensed caps) and line2 (1-3 words, brush script) that read as one phrase hook.',
    'Then exactly 5 escalating reasons, under 12 words each.',
    'Then a caption that ends by pointing to ' + c.site + ' (books from ' + c.price_hook + ') and 12 hashtags.'
  ].join('\n');
  const out = geminiJson_(systemPrompt_(), u, schemaReading_());
  out.reasons = fixLen_(out.reasons, 5);
  out.hashtags = fixLen_(out.hashtags, 12);
  return out;
}

/** Pad/trim an array to exactly n items so sheet columns never break. */
function fixLen_(arr, n, filler) {
  arr = Array.isArray(arr) ? arr.slice(0, n) : [];
  while (arr.length < n) arr.push(filler !== undefined ? filler : '');
  return arr;
}
