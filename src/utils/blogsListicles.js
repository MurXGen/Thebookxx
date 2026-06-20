// utils/blogsListicles.js
//
// Listicle / round-up blog posts ("Read these 5…", "Top 10…"). These build
// topical authority and, crucially, add internal links from blog → book PDPs
// (and → category pages), which is strong on-site SEO. Authored by Murthy
// Thevar to stay consistent with the existing blog voice.
//
// Merged into blogsData by the helpers in blogs.js.

const AUTHOR = "Murthy Thevar";
const ASLUG = "murthy-thevar";

// Inline PDP link helper (brand-orange, semibold).
const L = (slug, text) =>
  `<a href="/books/${slug}" style="color:#fb8500;font-weight:600">${text}</a>`;
// Category link helper.
const C = (slug, text) =>
  `<a href="/category/${slug}" style="color:#fb8500;font-weight:600">${text}</a>`;

const IMG = {
  money:
    "/blogs/how-to-filter-the-right-information-10-strategies-to-stop-information-overload.jpeg",
  clarity:
    "/blogs/the-art-of-clarity-mastering-clear-communication-insights-by-murthy-thevar.jpeg",
  overthink:
    "/blogs/overcoming-overthinking-10-actionable-strategies-to-break-free-from-decision-paralysis.jpeg",
  morning: "/blogs/mastering-morning-routine-mental-clarity.jpeg",
  saying_no:
    "/blogs/the-power-of-saying-no-how-setting-boundaries-creates-mental-clarity.jpeg",
  speech:
    "/blogs/clarity-in-speech-master-your-articulation-with-10-powerful-tongue-twisters.jpeg",
};

// Builder ensures every post carries the required fields (keywords, images, faqs).
const mk = (o) => ({
  author: AUTHOR,
  authorSlug: ASLUG,
  lastModified: o.publishDate,
  faqs: [],
  images: [{ url: o.hero, alt: o.title, caption: o.title, category: "Reading List" }],
  ...o,
});

export const listicleBlogs = {
  // 1 ───────────────────────────────────────────────────────────────────────
  "best-money-books-to-read": mk({
    id: "blog-101",
    title: "Read These 5 Books to Finally Master Your Money",
    slug: "best-money-books-to-read",
    publishDate: "2026-06-18",
    hero: IMG.money,
    excerpt:
      "Five personal-finance books that change how you think about money — from behavioural investing to building lasting wealth. Curated by Murthy Thevar.",
    keywords: [
      "best money books",
      "personal finance books india",
      "books to read about money",
      "best investing books",
      "psychology of money",
    ],
    content: [
      {
        type: "paragraph",
        content:
          "Money problems are rarely about maths — they're about behaviour. These five books, all available on TheBookX, rewire how you think about earning, saving and investing. Read them in this order and you'll have a complete personal-finance education for less than the cost of one dinner out.",
      },
      {
        type: "heading",
        level: 2,
        content: `1. ${L("the-psychology-of-money", "The Psychology of Money")} — Morgan Housel`,
      },
      {
        type: "paragraph",
        content: `The best starting point. Through 19 short stories, Morgan Housel shows that doing well with money has little to do with intelligence and everything to do with behaviour. Start here, then read his follow-up, ${L("the-art-of-spending-money", "The Art of Spending Money")}. <strong>From ₹139.</strong>`,
      },
      {
        type: "heading",
        level: 2,
        content: `2. ${L("the-almanack-of-naval-ravikant", "The Almanack of Naval Ravikant")} — Eric Jorgenson`,
      },
      {
        type: "paragraph",
        content:
          "A curated collection of Naval Ravikant's wisdom on wealth and happiness. Short, dense and endlessly quotable — the chapter on 'specific knowledge' alone is worth it. <strong>From ₹159.</strong>",
      },
      {
        type: "heading",
        level: 2,
        content: `3. ${L("the-5-types-of-wealth", "The 5 Types of Wealth")} — Sahil Bloom`,
      },
      {
        type: "paragraph",
        content:
          "Redefines wealth beyond money to include time, relationships, health and purpose. A refreshing antidote if you've been optimising only your bank balance. <strong>From ₹199.</strong>",
      },
      {
        type: "heading",
        level: 2,
        content: `4. ${L("make-epic-money", "Make Epic Money")} — Ankur Warikoo`,
      },
      {
        type: "paragraph",
        content:
          "Practical, India-first money advice from one of the country's most followed creators. Perfect if you want concrete steps rather than abstract theory. <strong>From ₹159.</strong>",
      },
      {
        type: "heading",
        level: 2,
        content: `5. ${L("the-intelligent-investor", "The Intelligent Investor")} — Benjamin Graham`,
      },
      {
        type: "paragraph",
        content:
          "The classic Warren Buffett calls 'by far the best book on investing ever written.' Dense but foundational — read it once you've built the mindset from the first four. <strong>From ₹239.</strong>",
      },
      {
        type: "callout",
        style: "info",
        title: "Build your money shelf",
        content: `Browse the full ${C("finance", "Finance collection")} on TheBookX — free delivery, Cash on Delivery, and books starting at ₹1.`,
      },
    ],
    faqs: [
      {
        question: "Which money book should a complete beginner read first?",
        answer:
          "Start with The Psychology of Money — it's the most readable and fixes your money mindset before you touch any investing tactics.",
      },
      {
        question: "Are these finance books relevant for Indian readers?",
        answer:
          "Yes. The principles are universal, and Make Epic Money by Ankur Warikoo is written specifically for an Indian audience.",
      },
    ],
  }),

  // 2 ───────────────────────────────────────────────────────────────────────
  "top-10-self-help-books-2026": mk({
    id: "blog-102",
    title: "Top 10 Self-Help Books to Read in 2026",
    slug: "top-10-self-help-books-2026",
    publishDate: "2026-06-16",
    hero: IMG.clarity,
    excerpt:
      "The 10 most life-changing self-help books to read this year — habits, mindset, decision-making and clarity. Hand-picked by Murthy Thevar.",
    keywords: [
      "best self help books 2026",
      "top self help books",
      "self improvement books india",
      "books on habits and mindset",
      "atomic habits",
    ],
    content: [
      {
        type: "paragraph",
        content:
          "Self-help works best as a system, not a single book. This ranked list moves from building habits, to mastering your mindset, to understanding people. Every title is available on TheBookX with free delivery.",
      },
      {
        type: "list",
        style: "ordered",
        items: [
          `${L("atomic-habits", "Atomic Habits")} — James Clear · the definitive guide to tiny changes that compound. <strong>₹139</strong>`,
          `${L("the-subtle-art-of-not-giving-a-f-ck", "The Subtle Art of Not Giving a F*ck")} — Mark Manson · choose what to care about. <strong>₹129</strong>`,
          `${L("the-courage-to-be-disliked", "The Courage to Be Disliked")} — Kishimi & Koga · freedom through Adlerian psychology. <strong>₹159</strong>`,
          `${L("the-art-of-clarity", "The Art of Clarity")} — Murthy Thevar · think and communicate without confusion. <strong>₹159</strong>`,
          `${L("surrounded-by-idiots", "Surrounded by Idiots")} — Thomas Erikson · understand the 4 personality types. <strong>₹139</strong>`,
          `${L("don-t-sweat-the-small-stuff", "Don't Sweat the Small Stuff")} — Richard Carlson · stop stressing over little things. <strong>₹129</strong>`,
          `${L("the-laws-of-human-nature", "The Laws of Human Nature")} — Robert Greene · master human behaviour. <strong>₹329</strong>`,
          `${L("the-48-laws-of-power", "The 48 Laws of Power")} — Robert Greene · timeless strategy. <strong>₹319</strong>`,
          `${L("diary-of-a-ceo", "Diary of a CEO")} — Steven Bartlett · 33 laws for work and life. <strong>₹179</strong>`,
          `${L("the-art-of-spending-money", "The Art of Spending Money")} — Morgan Housel · spend intentionally. <strong>₹159</strong>`,
        ],
      },
      {
        type: "heading",
        level: 2,
        content: "Where to start",
      },
      {
        type: "paragraph",
        content: `If you only read one, make it ${L("atomic-habits", "Atomic Habits")} — it gives you the engine to act on everything else. Pair it with ${L("the-art-of-clarity", "The Art of Clarity")} to fix the thinking behind the habits.`,
      },
      {
        type: "callout",
        style: "info",
        title: "Explore more",
        content: `See the complete ${C("self-help", "Self-Help collection")} — 100+ titles starting at ₹1.`,
      },
    ],
    faqs: [
      {
        question: "What is the best self-help book of 2026?",
        answer:
          "Atomic Habits remains the most practical and widely recommended, but The Art of Clarity by Murthy Thevar is the best companion for fixing how you think.",
      },
      {
        question: "How many self-help books should I read at once?",
        answer:
          "One at a time, and actually apply it for 30 days before moving on. Reading ten without acting changes nothing.",
      },
    ],
  }),

  // 3 ───────────────────────────────────────────────────────────────────────
  "best-thriller-books-page-turners": mk({
    id: "blog-103",
    title: "5 Page-Turner Thrillers You Won't Be Able to Put Down",
    slug: "best-thriller-books-page-turners",
    publishDate: "2026-06-14",
    hero: IMG.overthink,
    excerpt:
      "Five gripping psychological thrillers with twists you won't see coming — perfect for a one-sitting read. Curated by Murthy Thevar.",
    keywords: [
      "best thriller books",
      "psychological thriller novels",
      "page turner books",
      "freida mcfadden books",
      "best mystery books india",
    ],
    content: [
      {
        type: "paragraph",
        content:
          "Looking for a book you'll finish in one weekend? These five thrillers are masterclasses in suspense — twisty, fast and impossible to put down. All in stock on TheBookX.",
      },
      {
        type: "heading",
        level: 2,
        content: `1. ${L("the-housemaid", "The Housemaid")} — Freida McFadden`,
      },
      {
        type: "paragraph",
        content: `The viral sensation. A maid, a marriage and a twist that breaks the internet. Loved it? Continue with ${L("the-housemaid-s-secret", "The Housemaid's Secret")} and ${L("the-housemaid-is-watching", "The Housemaid Is Watching")}. <strong>From ₹139.</strong>`,
      },
      {
        type: "heading",
        level: 2,
        content: `2. ${L("the-inmate", "The Inmate")} — Freida McFadden`,
      },
      {
        type: "paragraph",
        content:
          "A nurse takes a job at a prison housing the man who once tried to kill her. Tense, claustrophobic and razor-sharp. <strong>From ₹149.</strong>",
      },
      {
        type: "heading",
        level: 2,
        content: `3. ${L("never-lie", "Never Lie")} — Freida McFadden`,
      },
      {
        type: "paragraph",
        content:
          "A newlywed couple, a snowstorm and the abandoned mansion of a missing psychologist. The audio-tape reveals are perfectly timed. <strong>From ₹139.</strong>",
      },
      {
        type: "heading",
        level: 2,
        content: `4. ${L("dark-matter", "Dark Matter")} — Blake Crouch`,
      },
      {
        type: "paragraph",
        content:
          "A mind-bending sci-fi thriller about the lives you didn't live. Equal parts heart-pounding and thought-provoking. <strong>From ₹179.</strong>",
      },
      {
        type: "heading",
        level: 2,
        content: `5. ${L("the-locked-door", "The Locked Door")} — Freida McFadden`,
      },
      {
        type: "paragraph",
        content:
          "The daughter of a serial killer discovers the murders have started again. A breathless, single-sitting read. <strong>From ₹139.</strong>",
      },
      {
        type: "callout",
        style: "info",
        title: "More to thrill you",
        content: `Browse the full ${C("thriller", "Thriller collection")} on TheBookX.`,
      },
    ],
    faqs: [
      {
        question: "What is the best thriller book to start with?",
        answer:
          "The Housemaid by Freida McFadden — it's the most accessible, addictive and twist-packed entry point into modern psychological thrillers.",
      },
    ],
  }),

  // 4 ───────────────────────────────────────────────────────────────────────
  "best-indian-mythology-books": mk({
    id: "blog-104",
    title: "Top 7 Indian Mythology Books Every Reader Should Own",
    slug: "best-indian-mythology-books",
    publishDate: "2026-06-12",
    hero: IMG.morning,
    excerpt:
      "Seven brilliant retellings of Indian mythology — from the Mahabharata's Draupadi to Amish's Shiva Trilogy. Curated by Murthy Thevar.",
    keywords: [
      "best indian mythology books",
      "amish tripathi books",
      "indian mythology retellings",
      "the palace of illusions",
      "shiva trilogy",
    ],
    content: [
      {
        type: "paragraph",
        content:
          "Indian mythology has never been more readable. These seven modern retellings bring the epics to life with fresh perspectives and gripping storytelling. All available on TheBookX.",
      },
      {
        type: "list",
        style: "ordered",
        items: [
          `${L("the-palace-of-illusions", "The Palace of Illusions")} — Chitra Banerjee Divakaruni · the Mahabharata through Draupadi's eyes. <strong>₹159</strong>`,
          `${L("the-immortals-of-meluha", "The Immortals of Meluha")} — Amish Tripathi · book 1 of the legendary Shiva Trilogy. <strong>₹159</strong>`,
          `${L("sita-warrior-of-mithila", "Sita: Warrior of Mithila")} — Amish Tripathi · a fierce, reimagined Sita. <strong>₹189</strong>`,
          `${L("ram-scion-of-ikshvaku", "Ram: Scion of Ikshvaku")} — Amish Tripathi · the Ramayana, reborn. <strong>₹159</strong>`,
          `${L("mahagatha-100-tales-from-the-puranas", "Mahagatha: 100 Tales from the Puranas")} — Satyarth Nayak. <strong>₹189</strong>`,
          `${L("myth-mythya", "Myth = Mithya")} — Devdutt Pattanaik · decode Hindu mythology. <strong>₹149</strong>`,
          `${L("ram-sita-raavan", "Ram Sita Raavan")} — Devdutt Pattanaik · a beautiful illustrated edition. <strong>₹509</strong>`,
        ],
      },
      {
        type: "paragraph",
        content: `New to the genre? Begin with ${L("the-palace-of-illusions", "The Palace of Illusions")} for emotional depth, or ${L("the-immortals-of-meluha", "The Immortals of Meluha")} for page-turning adventure.`,
      },
      {
        type: "callout",
        style: "info",
        title: "Explore the epics",
        content: `See the complete ${C("mythology", "Mythology collection")} on TheBookX.`,
      },
    ],
    faqs: [
      {
        question: "What is the best Indian mythology book for beginners?",
        answer:
          "The Palace of Illusions or The Immortals of Meluha. Both are gripping, easy to read and require no prior knowledge of the epics.",
      },
    ],
  }),

  // 5 ───────────────────────────────────────────────────────────────────────
  "books-for-overthinkers": mk({
    id: "blog-105",
    title: "5 Books to Read If You Overthink Everything",
    slug: "books-for-overthinkers",
    publishDate: "2026-06-09",
    hero: IMG.saying_no,
    excerpt:
      "Five books that quiet a racing mind and help you stop overthinking — practical, calming and genuinely useful. By Murthy Thevar.",
    keywords: [
      "books for overthinkers",
      "how to stop overthinking",
      "books to calm anxiety",
      "the art of not overthinking",
      "books on decision making",
    ],
    content: [
      {
        type: "paragraph",
        content:
          "If your mind never switches off, you're not alone — and the right book can genuinely help. These five reads give you tools to quiet mental chatter and make decisions with confidence.",
      },
      {
        type: "heading",
        level: 2,
        content: `1. ${L("don-t-believe-everything-you-think", "Don't Believe Everything You Think")} — Joseph Nguyen`,
      },
      {
        type: "paragraph",
        content:
          "A short, powerful read on separating yourself from your thoughts. Many readers finish it in an afternoon and feel lighter immediately. <strong>From ₹109.</strong>",
      },
      {
        type: "heading",
        level: 2,
        content: `2. ${L("the-art-of-not-overthinking", "The Art of Not Overthinking")} — Nick Trenton`,
      },
      {
        type: "paragraph",
        content:
          "Concrete techniques to declutter your mind and stop spiralling. Practical and immediately applicable. <strong>From ₹109.</strong>",
      },
      {
        type: "heading",
        level: 2,
        content: `3. ${L("the-courage-to-be-disliked", "The Courage to Be Disliked")} — Kishimi & Koga`,
      },
      {
        type: "paragraph",
        content:
          "A dialogue-style book that frees you from worrying what others think — a major source of overthinking. <strong>From ₹159.</strong>",
      },
      {
        type: "heading",
        level: 2,
        content: `4. ${L("the-let-them-theory", "The Let Them Theory")} — Mel Robbins`,
      },
      {
        type: "paragraph",
        content:
          "A simple mindset shift for letting go of what you can't control. One of the most talked-about reads of the year. <strong>From ₹189.</strong>",
      },
      {
        type: "heading",
        level: 2,
        content: `5. ${L("the-art-of-clarity", "The Art of Clarity")} — Murthy Thevar`,
      },
      {
        type: "paragraph",
        content:
          "Overthinking is a clarity problem. This guide gives you a framework to structure your thoughts and decide with confidence. <strong>From ₹159.</strong>",
      },
      {
        type: "callout",
        style: "info",
        title: "Quiet the noise",
        content: `Explore more in the ${C("psychology", "Psychology collection")} on TheBookX.`,
      },
    ],
    faqs: [
      {
        question: "Can a book really help me stop overthinking?",
        answer:
          "A book won't flip a switch, but it gives you proven tools and language for your thoughts. Don't Believe Everything You Think is the best quick starting point.",
      },
    ],
  }),

  // 6 ───────────────────────────────────────────────────────────────────────
  "best-romance-novels-to-read": mk({
    id: "blog-106",
    title: "8 Romance Novels to Fall in Love With",
    slug: "best-romance-novels-to-read",
    publishDate: "2026-06-06",
    hero: IMG.speech,
    excerpt:
      "Eight swoon-worthy romance novels — from spicy Twisted series to heartfelt Indian love stories. Curated by Murthy Thevar.",
    keywords: [
      "best romance novels",
      "romance books to read",
      "ana huang twisted series",
      "indian romance books",
      "best love story books",
    ],
    content: [
      {
        type: "paragraph",
        content:
          "Whether you love slow-burn longing or spicy page-turners, this list has your next read. All eight are available on TheBookX with free delivery.",
      },
      {
        type: "list",
        style: "ordered",
        items: [
          `${L("twisted-love", "Twisted Love")} — Ana Huang · the viral grumpy-meets-sunshine series opener. <strong>₹159</strong>`,
          `${L("red-flags-and-rishtas", "Red Flags and Rishtas")} — Rashmi Sharma · a desi rom-com you'll devour. <strong>₹159</strong>`,
          `${L("we-are-there-for-each-other", "We Are There for Each Other")} — Anshul Sharma · a heartwarming Indian love story. <strong>₹149</strong>`,
          `${L("too-good-to-be-true", "Too Good to Be True")} — Carola Lovering · a twisty romance with secrets. <strong>₹159</strong>`,
          `${L("can-we-be-strangers-again", "Can We Be Strangers Again")} — Rithvik Singh · poetry for the heartbroken. <strong>₹139</strong>`,
          `${L("i-don-t-love-you-anymore", "I Don't Love You Anymore")} — Rithvik Singh · moving on, beautifully written. <strong>₹109</strong>`,
          `${L("all-he-ll-ever-be", "All He'll Ever Be")} — W. Winters · an intense, emotional read. <strong>₹239</strong>`,
          `${L("thank-you-for-leaving", "Thank You for Leaving")} — Rithvik Singh · healing after heartbreak. <strong>₹129</strong>`,
        ],
      },
      {
        type: "callout",
        style: "info",
        title: "More love stories",
        content: `Browse the full ${C("romance", "Romance collection")} on TheBookX.`,
      },
    ],
    faqs: [
      {
        question: "What is the best romance series to start with?",
        answer:
          "Ana Huang's Twisted series, beginning with Twisted Love, is the most popular modern romance series and a great entry point.",
      },
    ],
  }),

  // 7 ───────────────────────────────────────────────────────────────────────
  "timeless-classic-books-to-own": mk({
    id: "blog-107",
    title: "5 Timeless Classic Books Every Reader Should Own",
    slug: "timeless-classic-books-to-own",
    publishDate: "2026-06-03",
    hero: IMG.money,
    excerpt:
      "Five timeless classics that belong on every bookshelf — from The Alchemist to Crime and Punishment. Curated by Murthy Thevar.",
    keywords: [
      "best classic books",
      "timeless classic novels",
      "must read classics",
      "the alchemist",
      "crime and punishment",
    ],
    content: [
      {
        type: "paragraph",
        content:
          "Some books never go out of style. These five classics have shaped readers for generations — and each is available on TheBookX at an unbeatable price.",
      },
      {
        type: "heading",
        level: 2,
        content: `1. ${L("the-alchemist", "The Alchemist")} — Paulo Coelho`,
      },
      {
        type: "paragraph",
        content:
          "A fable about following your dreams that has sold tens of millions of copies. The perfect first classic. <strong>From ₹109.</strong>",
      },
      {
        type: "heading",
        level: 2,
        content: `2. ${L("crime-and-punishment", "Crime and Punishment")} — Fyodor Dostoevsky`,
      },
      {
        type: "paragraph",
        content: `A psychological masterpiece on guilt and redemption. If you love it, explore more Dostoevsky like ${L("notes-from-underground", "Notes from Underground")}. <strong>From ₹199.</strong>`,
      },
      {
        type: "heading",
        level: 2,
        content: `3. ${L("pride-and-prejudice", "Pride and Prejudice")} — Jane Austen`,
      },
      {
        type: "paragraph",
        content:
          "The original enemies-to-lovers romance, as witty and sharp today as in 1813. <strong>From ₹159.</strong>",
      },
      {
        type: "heading",
        level: 2,
        content: `4. ${L("the-metamorphosis", "The Metamorphosis")} — Franz Kafka`,
      },
      {
        type: "paragraph",
        content: `A surreal, unforgettable novella. Pair it with Kafka's ${L("letters-to-milena", "Letters to Milena")} for his tender, personal side. <strong>From ₹109.</strong>`,
      },
      {
        type: "heading",
        level: 2,
        content: `5. ${L("and-then-there-were-none", "And Then There Were None")} — Agatha Christie`,
      },
      {
        type: "paragraph",
        content:
          "The best-selling mystery of all time — ten strangers, one island, no escape. <strong>From ₹159.</strong>",
      },
      {
        type: "callout",
        style: "info",
        title: "Start a classics shelf",
        content: `Browse the full ${C("classic", "Classics collection")} on TheBookX.`,
      },
    ],
    faqs: [
      {
        question: "Which classic book should I read first?",
        answer:
          "The Alchemist — it's short, uplifting and accessible, making it the ideal gateway into reading classics.",
      },
    ],
  }),

  // 8 ───────────────────────────────────────────────────────────────────────
  "best-business-startup-books-founders": mk({
    id: "blog-108",
    title: "7 Best Business & Startup Books for Founders",
    slug: "best-business-startup-books-founders",
    publishDate: "2026-05-31",
    hero: IMG.clarity,
    excerpt:
      "Seven essential business and startup books for founders and aspiring entrepreneurs — strategy, building and leadership. By Murthy Thevar.",
    keywords: [
      "best business books",
      "startup books for founders",
      "entrepreneurship books india",
      "zero to one",
      "the lean startup",
    ],
    content: [
      {
        type: "paragraph",
        content:
          "Building something? These seven books cover the full founder journey — idea, build, scale and lead. Every one is available on TheBookX.",
      },
      {
        type: "list",
        style: "ordered",
        items: [
          `${L("zero-to-one", "Zero to One")} — Peter Thiel · how to build the future, not copy it. <strong>₹149</strong>`,
          `${L("the-lean-startup", "The Lean Startup")} — Eric Ries · build-measure-learn, the modern playbook. <strong>₹159</strong>`,
          `${L("the-100-startup", "The $100 Startup")} — Chris Guillebeau · launch lean, on a shoestring. <strong>₹149</strong>`,
          `${L("the-hard-thing-about-hard-things", "The Hard Thing About Hard Things")} — Ben Horowitz · the brutal truths of running a company. <strong>₹189</strong>`,
          `${L("blue-ocean-strategy", "Blue Ocean Strategy")} — Kim & Mauborgne · create uncontested market space. <strong>₹189</strong>`,
          `${L("the-first-90-days", "The First 90 Days")} — Michael Watkins · nail any new leadership role. <strong>₹189</strong>`,
          `${L("diary-of-a-ceo", "Diary of a CEO")} — Steven Bartlett · 33 laws for business and life. <strong>₹179</strong>`,
        ],
      },
      {
        type: "paragraph",
        content: `First-time founder? Start with ${L("zero-to-one", "Zero to One")} for vision and ${L("the-lean-startup", "The Lean Startup")} for execution.`,
      },
      {
        type: "callout",
        style: "info",
        title: "Build your founder library",
        content: `Browse the full ${C("business", "Business collection")} on TheBookX.`,
      },
    ],
    faqs: [
      {
        question: "What is the best business book for a first-time founder?",
        answer:
          "Zero to One by Peter Thiel for mindset and vision, paired with The Lean Startup by Eric Ries for a practical building methodology.",
      },
    ],
  }),
};
