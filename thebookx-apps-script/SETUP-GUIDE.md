# TheBookX Content Engine — Setup

Six `.gs` files go into one Apps Script project bound to your Sheet. Paste each file's
contents into a matching script file, then run setup, add the key, deploy the Web App.

---

## 1. Install the code (in order)

1. Open the Sheet → **Extensions ▸ Apps Script**.
2. Delete the default `Code.gs`. Create six script files with the **+ ▸ Script** button and
   name them exactly (the `.gs` is added for you):

   `Config` · `Gemini` · `Setup` · `Generate` · `WebApp` · `Menu`

3. Paste each matching file's contents in. **Save** (⌘/Ctrl-S).
4. In the Apps Script editor open **Project Settings ▸ Show "appsscript.json"**, confirm the
   timezone is `Asia/Kolkata` (the code also sets it at runtime). Save.
5. Reload the Sheet tab. A **TheBookX** menu appears (from `onOpen`).

## 2. Get the Gemini API key

1. Go to **aistudio.google.com/apikey**, click **Create API key**, copy it.
2. In the Sheet: **TheBookX ▸ First-time setup**. This builds every tab, seeds Config + the
   10 hooks + your 14 books, then prompts for the key. Paste it — it is saved to **Script
   Properties** (`GEMINI_API_KEY`), never written into the sheet.
   - Manual alternative: Apps Script **Project Settings ▸ Script Properties ▸ Add property**,
     name `GEMINI_API_KEY`, paste value.
3. Model note: the code defaults to **`gemini-3.5-flash-lite`** (cheap, fast, structured
   output). To raise quality, change the `gemini_model` cell on the **Config** tab to
   `gemini-3.8-flash` — no code edit needed. (As of Oct 2026 the 2.5 models are restricted to
   prior users and 2.0 is retired, so `3.5-flash-lite` / `3.8-flash` are the right picks.)

## 3. First generation

- **TheBookX ▸ Generate today.** First run asks for authorization (Sheets + external fetch +
  Drive) — approve. It writes one row to each of the four format tabs, repaints **🎬 Today**,
  and creates a dated folder under Drive ▸ *TheBookX Content*.
- **Generate next 7 days** runs it seven times; rotation advances each run so no book or hook
  repeats until the full set has cycled.

## 4. Deploy the Web App (phone access + studio feed)

1. Apps Script editor → **Deploy ▸ New deployment**.
2. Gear ▸ **Web app**. Settings:
   - **Execute as:** Me
   - **Who has access:** Anyone  *(required so your phone and the local studio can read it
     without a Google login; the URL is unguessable. Use "Anyone with Google account" if you
     prefer and are signed in on your phone.)*
3. **Deploy**, authorize, copy the **Web app URL**. (Also under **TheBookX ▸ Open Web App URL**.)
   - Phone page: the URL as-is → today's content with a **Copy** button per field.
   - Studio feed: add **`?format=json`**.
4. Re-deploy note: after editing code, **Deploy ▸ Manage deployments ▸ Edit ▸ Version: New**
   to publish changes. The URL stays the same.

## 5. Automate (6am IST daily)

- **TheBookX ▸ Install daily trigger (6am IST).** One time-based trigger runs `generateToday`
  every morning in `Asia/Kolkata`. **Remove triggers** clears it.

---

## 6. Wire the HTML studio to the JSON endpoint

Replace the studio's hardcoded data with a live pull from the Web App. Drop this near the top
of the dashboard's script, set `TBX_FEED` to your deployed URL, and read `window.TBX_TODAY`
after `tbxLoadToday()` resolves.

```js
/* === TheBookX: fetch today's generated content from the Sheet Web App === */
const TBX_FEED = "PASTE_YOUR_WEBAPP_URL_HERE"; // ...exec URL, no ?format

async function tbxLoadToday() {
  const res = await fetch(TBX_FEED + "?format=json", { redirect: "follow" });
  if (!res.ok) throw new Error("Feed HTTP " + res.status);
  const t = await res.json();
  window.TBX_TODAY = t;

  // Map into the shapes the renderer already uses:
  // Daily Book Reel  -> t.reel.hook, t.reel.insights[0..7], t.reel.caption, t.reel.hashtags[]
  // Editorial Carousel -> t.carousel.slides[i].text + .script_word (slide 1 = cover, 9 = CTA)
  // WhatsApp         -> t.whatsapp.quote, .caption, .link, .hashtags[]
  // Reading Reel     -> t.reading.line1 (caps), .line2 (script), .reasons[0..4], .caption
  // Book art/link    -> t.book.cover, t.book.link, t.book.title, t.book.author
  return t;
}

// Example: build the reel scene list from the feed instead of hardcoded text
async function tbxInitReel() {
  const t = window.TBX_TODAY || await tbxLoadToday();
  if (!t.reel) return;
  const hook = t.reel.hook;
  const points = t.reel.insights.slice(0, 7); // lines 1-7 are the scenes
  const follow = t.reel.insights[7];          // line 8 is the follow prompt
  // ...feed hook/points/follow/t.book.cover into your existing scene builder...
}

document.addEventListener("DOMContentLoaded", () => {
  tbxLoadToday().catch(err => console.warn("TheBookX feed unavailable, using local data:", err));
});
```

Notes:
- The feed always returns the **latest generated day**. Keep a local fallback so the studio
  still works offline — wrap the call in `try/catch` (shown above).
- CORS: Apps Script Web Apps return permissive headers for `GET`, so a browser `fetch` works.
  If you ever see an opaque redirect, keep `redirect:"follow"` (the exec URL 302s once).
- Covers in the studio can stay local (keyed by `t.book.id`) — only the **copy** comes from
  the feed.

---

## 7. One-page design standard for the renderer

Hand this to whoever builds frames so every format looks like one brand.

**Type pairing**
- Display / headline: a heavy condensed sans — **Anton** (or Archivo Black / Bebas-style).
- One brush-script accent word per frame: **Kaushan Script**.
- Body / labels / credits: **Poppins** (600 for labels, 400–500 for body).
- Serced quote (WhatsApp quote line): **Lora** italic.

**Colour rule**
- Ink `#141414`, orange accent `#E8622A`, paper `#F7F1E7`, grid lines ~6% grey.
- **Orange appears at most twice per frame** — typically the script word + one mark (arrow or
  ₹1 pill). Never set body text in orange.

**Layout**
- **6% side margins** on every frame (65px at 1080 wide). Nothing important outside them.
- **IG safe zones:** keep text clear of the **top 14%** and **bottom 20%** (that's where the
  handle, caption and action buttons sit). Put the hook in the upper-middle, CTA above the
  bottom zone.
- Grid-paper background on all static frames; hand-drawn arrow points from headline toward the
  turn/benefit.
- `thebookx.in` wordmark top-left, `@thebookx.in` or the ₹1 hook bottom — on **every** frame.

**Per-format sizing**
- Reel / Reading Reel: **1080×1920**. Hook lands in first second. One idea on screen at a time.
- Carousel: **1080×1350** (4:5). Cover = slide 1.
- WhatsApp: **1080×1080**. Cover image left, quote right, buy reasons + ₹1 strip bottom.

**The thumbnail rule (non-negotiable)**
- **Carousel slide 1 and reel cover must stay legible at 150px wide** — that's the Explore
  grid size. Test it: shrink to 150px; if the hook isn't readable, it's too long or too small.
  Cover text 3–6 words, set BIG, high contrast, one orange word max.

**Why this shape**
- Explore ranks on saves / shares / watch-through. Dense, specific, re-readable frames get
  saved; a legible 150px cover wins the tap that starts watch-through.
```
