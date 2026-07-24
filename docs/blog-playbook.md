# TheBookX Daily Blog Playbook

Every post must do three jobs at once: **rank in search** (SEO → traffic), **sell books** (internal links + CTAs), and **build authority** (genuinely useful, original writing). This playbook is the repeatable recipe so each daily post hits all three.

## The daily workflow

1. **You give the topic** (based on the day's trend).
2. **I verify the angle** — quick check of what people are actually searching around that topic, and which *real* TheBookX books (from the 600-book catalogue) genuinely fit. Every book I link is confirmed to exist so links never 404.
3. **I pick the post type**:
   - **In-depth guide** (`blogs.js`) — "how to / why / what is" explainer with a story or framework. Best for authority + long-tail SEO.
   - **Listicle / roundup** (`blogsListicles.js`) — "Read these 5…", "Best books for…", "Books like X". Best for fast internal links → book pages and "best books" search queries.
4. **I write** the post in the exact existing schema, append it to the right file, and **validate it parses**.
5. **I present** the post; you review. Cover image is optional (see below).
6. **Publish date** = that day; the post auto-appears on `/blogs`, gets its own `/blogs/<slug>` page, sitemap entry, and JSON-LD.

## Every post follows this template

| Field | Rule |
|---|---|
| `title` | Front-load the primary keyword; compelling, ≤ 60 chars where possible. |
| `slug` | kebab-case, keyword-rich, unique. |
| `excerpt` | ~150–160 chars — doubles as the meta description & OG/Twitter text. |
| `content[]` | Blocks: `paragraph`, `heading` (level 2/3), `list` (ordered/unordered, items support inline HTML links), `callout` (info/success + title), `blockquote`. |
| `keywords[]` | Primary + 5–8 variations/long-tail. Feeds `<meta keywords>`. |
| `categories[]` | 2–3 topical tags. |
| `faqs[]` | 3 Q&As → renders as **FAQPage** rich-result schema (extra SERP real estate). |
| `coverImage` / `images[]` | `/blogs/<slug>.jpeg`. Falls back to the branded site OG card if absent. |
| `author` | "TheBookX Editorial" or "Murthy Thevar"; `authorSlug: murthy-thevar`. |
| `publishDate` / `lastModified` | The day it goes live. |

## Content structure (the SEO skeleton)

1. **Hook intro** — states the search intent plainly, includes the keyword naturally.
2. **3–6 H2 sections** — real, useful substance (tips, framework, a story/example). This is the authority layer; no filler.
3. **The book section** — 4–8 hand-picked catalogue titles as inline PDP links (`/books/<slug>`), each with a one-line reason to read it. This is the sales layer.
4. **A callout CTA** — link to the relevant `/category/<slug>` page and reinforce the offer: books from ₹1, free delivery, Cash on Delivery across India.
5. **Closing paragraph** — a warm, on-brand wrap that nudges the reader to start reading.
6. **FAQs** — 3 real questions people ask, answered concisely, one weaving in a book link.

## SEO checklist (applied to every post)

- Primary keyword in title, first paragraph, one H2, and the slug.
- Internal links: 4–8 to book PDPs + 1 to a category page (strong on-site SEO).
- FAQ schema populated (never left empty).
- Excerpt reads as a clean meta description.
- No duplicate slugs; catalogue links verified real.
- Genuinely original copy — no thin/spun content (protects authority + ranking).

## Book-selling rules

- Only link books actually in the catalogue; link text = book title, optionally "by Author".
- Prefer titles that match the topic *and* that you want to move (bestsellers, new additions, ₹1 deals).
- Always include the offer line (₹1 / free delivery / COD) in at least one callout.

## Cover images (now on every post)

Each post ships with a real image. For every post I'll give you:

- **The exact filename** to save the image as — `public/blogs/<slug>.jpeg` (matches the post slug so it's wired in automatically).
- **The alt text** — a descriptive, keyword-aware line set on `coverImage`/`images[].alt` for SEO + accessibility. I'll also supply the `caption`.

You create/assign the image at that path; I set `coverImage`, `images[]` (url + alt + caption), and it renders on the post and as its OG/social preview. Recommended size ~`1200×630`.

## View counts

- Stored in **Upstash Redis** via `GET/POST /api/views/<slug>` (atomic, accurate).
- Shown on each post next to the author/date as "👁 N views".
- Counted **once per visitor per day** (localStorage-guarded); repeat visits only read.
- **One-time setup you do:** create a free Upstash DB and add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to your hosting env vars. Until then the counter stays hidden and nothing breaks.

## What I need from you each day

Just the **topic** (and optionally: any specific book(s) to feature, and guide vs. listicle). I'll return the finished post **plus the image filename + alt text** for you to drop in.
