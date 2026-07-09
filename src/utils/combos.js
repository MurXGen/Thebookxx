// utils/combos.js
// Auto-generated curated combo bundles. Each combo references real book ids
// from book.js. Pricing = sum of the books' discounted prices, rounded to the
// nearest value ending in 9. MRP compare-at = sum of the books' original
// (strikethrough) prices. Helpers recompute pricing at runtime so combos stay
// in sync if a book's price ever changes.
import { books } from "./book";

const bookById = Object.fromEntries(books.map((b) => [b.id, b]));
const originalOf = (p) => Math.round((p * 1.5) / 10) * 10;
// Round to the nearest value ending in 9 (e.g. 487 -> 489, 483 -> 479).
const roundTo9 = (n) => {
  const r = Math.round((n + 1) / 10) * 10 - 1;
  return r < 9 ? 9 : r;
};

export const combos = [
  {
    "id": "combo-001",
    "slug": "bestseller-power-pack",
    "title": "Bestseller Power Pack",
    "tagline": "The books everyone is talking about — bundled to save.",
    "category": "Bestsellers",
    "bookIds": [
      "bk-002",
      "bk-005",
      "bk-006",
      "bk-007"
    ],
    "seoTitle": "Bestseller Power Pack — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Bestseller Power Pack combo (The Art of Clarity, Atomic Habits, The Psychology of Money, Surrounded by Idiots) online at the lowest price on TheBookX. 4 handpicked books for just ₹579 (MRP ₹870) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-002",
    "slug": "must-read-bestsellers",
    "title": "Must-Read Bestsellers",
    "tagline": "The books everyone is talking about — bundled to save.",
    "category": "Bestsellers",
    "bookIds": [
      "bk-010",
      "bk-012",
      "bk-013",
      "bk-014"
    ],
    "seoTitle": "Must-Read Bestsellers — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Must-Read Bestsellers combo (The Subtle Art of Not Giving a F*ck, The Laws of Human Nature, The 48 Laws of Power, Diary of a CEO) online at the lowest price on TheBookX. 4 handpicked books for just ₹959 (MRP ₹1430) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-003",
    "slug": "bestsellers-of-the-year",
    "title": "Bestsellers of the Year",
    "tagline": "The books everyone is talking about — bundled to save.",
    "category": "Bestsellers",
    "bookIds": [
      "bk-016",
      "bk-017",
      "bk-018"
    ],
    "seoTitle": "Bestsellers of the Year — 3 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Bestsellers of the Year combo (The Inmate, The Housemaid, The Housemaid's Secret) online at the lowest price on TheBookX. 3 handpicked books for just ₹429 (MRP ₹640) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-004",
    "slug": "reader-favourite-bestsellers",
    "title": "Reader-Favourite Bestsellers",
    "tagline": "The books everyone is talking about — bundled to save.",
    "category": "Bestsellers",
    "bookIds": [
      "bk-019",
      "bk-021",
      "bk-022",
      "bk-024"
    ],
    "seoTitle": "Reader-Favourite Bestsellers — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Reader-Favourite Bestsellers combo (The Housemaid Is Watching, Never Lie, Days at the Morisaki Bookshop, All He'll Ever Be) online at the lowest price on TheBookX. 4 handpicked books for just ₹659 (MRP ₹990) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-005",
    "slug": "the-big-bestseller-box",
    "title": "The Big Bestseller Box",
    "tagline": "The books everyone is talking about — bundled to save.",
    "category": "Bestsellers",
    "bookIds": [
      "bk-036",
      "bk-037",
      "bk-038",
      "bk-041"
    ],
    "seoTitle": "The Big Bestseller Box — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the The Big Bestseller Box combo (The 5 Types of Wealth, The Let Them Theory, The First 90 Days, The Kite Runner) online at the lowest price on TheBookX. 4 handpicked books for just ₹749 (MRP ₹1110) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-006",
    "slug": "trending-bestseller-bundle",
    "title": "Trending Bestseller Bundle",
    "tagline": "The books everyone is talking about — bundled to save.",
    "category": "Bestsellers",
    "bookIds": [
      "bk-042",
      "bk-043",
      "bk-045"
    ],
    "seoTitle": "Trending Bestseller Bundle — 3 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Trending Bestseller Bundle combo (A Thousand Splendid Suns, And the Mountains Echoed, Before the Coffee Gets Cold) online at the lowest price on TheBookX. 3 handpicked books for just ₹469 (MRP ₹700) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-007",
    "slug": "romance-lovers-box",
    "title": "Romance Lovers Box",
    "tagline": "All the feels, one irresistible bundle.",
    "category": "Romance",
    "bookIds": [
      "bk-015",
      "bk-025",
      "bk-026",
      "bk-027"
    ],
    "seoTitle": "Romance Lovers Box — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Romance Lovers Box combo (Red Flags and Rishtas, Was I Ever Enough, We Are There for Each Other, Can We Be Strangers Again) online at the lowest price on TheBookX. 4 handpicked books for just ₹589 (MRP ₹880) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-008",
    "slug": "swoon-worthy-romance-set",
    "title": "Swoon-Worthy Romance Set",
    "tagline": "All the feels, one irresistible bundle.",
    "category": "Romance",
    "bookIds": [
      "bk-028",
      "bk-029",
      "bk-030",
      "bk-050"
    ],
    "seoTitle": "Swoon-Worthy Romance Set — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Swoon-Worthy Romance Set combo (Thank You for Leaving, Too Good to Be True, I Don't Love You Anymore, Twisted Love) online at the lowest price on TheBookX. 4 handpicked books for just ₹559 (MRP ₹830) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-009",
    "slug": "heartbreak-and-healing-reads",
    "title": "Heartbreak & Healing Reads",
    "tagline": "All the feels, one irresistible bundle.",
    "category": "Romance",
    "bookIds": [
      "bk-051",
      "bk-052",
      "bk-053"
    ],
    "seoTitle": "Heartbreak & Healing Reads — 3 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Heartbreak & Healing Reads combo (Twisted Games, Twisted Hate, Twisted Lies) online at the lowest price on TheBookX. 3 handpicked books for just ₹539 (MRP ₹810) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-010",
    "slug": "spicy-romance-bundle",
    "title": "Spicy Romance Bundle",
    "tagline": "All the feels, one irresistible bundle.",
    "category": "Romance",
    "bookIds": [
      "bk-054",
      "bk-055",
      "bk-056",
      "bk-057"
    ],
    "seoTitle": "Spicy Romance Bundle — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Spicy Romance Bundle combo (King of Wrath, King of Pride, King of Greed, King of Sloth) online at the lowest price on TheBookX. 4 handpicked books for just ₹699 (MRP ₹1040) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-011",
    "slug": "modern-love-stories-pack",
    "title": "Modern Love Stories Pack",
    "tagline": "All the feels, one irresistible bundle.",
    "category": "Romance",
    "bookIds": [
      "bk-061",
      "bk-090",
      "bk-092",
      "bk-093"
    ],
    "seoTitle": "Modern Love Stories Pack — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Modern Love Stories Pack combo (Ugly Love, White Nights, Haunting Adeline, Hunting Adeline) online at the lowest price on TheBookX. 4 handpicked books for just ₹689 (MRP ₹1020) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-012",
    "slug": "slow-burn-romance-set",
    "title": "Slow-Burn Romance Set",
    "tagline": "All the feels, one irresistible bundle.",
    "category": "Romance",
    "bookIds": [
      "bk-094",
      "bk-099",
      "bk-101"
    ],
    "seoTitle": "Slow-Burn Romance Set — 3 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Slow-Burn Romance Set combo (Pride and Prejudice, Red, White & Royal Blue, The Love Hypothesis) online at the lowest price on TheBookX. 3 handpicked books for just ₹509 (MRP ₹760) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-013",
    "slug": "edge-of-your-seat-thrillers",
    "title": "Edge-of-Your-Seat Thrillers",
    "tagline": "Twists, tension and pages you can’t put down.",
    "category": "Thrillers",
    "bookIds": [
      "bk-011",
      "bk-020",
      "bk-063",
      "bk-064"
    ],
    "seoTitle": "Edge-of-Your-Seat Thrillers — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Edge-of-Your-Seat Thrillers combo (Talking with Psychopaths, The Locked Door, Dark Matter, Verity) online at the lowest price on TheBookX. 4 handpicked books for just ₹659 (MRP ₹980) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-014",
    "slug": "midnight-thriller-pack",
    "title": "Midnight Thriller Pack",
    "tagline": "Twists, tension and pages you can’t put down.",
    "category": "Thrillers",
    "bookIds": [
      "bk-083",
      "bk-106",
      "bk-110",
      "bk-111"
    ],
    "seoTitle": "Midnight Thriller Pack — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Midnight Thriller Pack combo (The Hidden Hindu, Family of Liars, Agatha Christie Classic Collection Set, Dark Verse Series Set) online at the lowest price on TheBookX. 4 handpicked books for just ₹1959 (MRP ₹2930) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-015",
    "slug": "crime-and-mystery-bundle",
    "title": "Crime & Mystery Bundle",
    "tagline": "Twists, tension and pages you can’t put down.",
    "category": "Thrillers",
    "bookIds": [
      "bk-112",
      "bk-116",
      "bk-119"
    ],
    "seoTitle": "Crime & Mystery Bundle — 3 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Crime & Mystery Bundle combo (A Good Girl's Guide to Murder Series Set, Chainsaw Man Set (Volumes 1-11+), The Hunger Games Trilogy Set) online at the lowest price on TheBookX. 3 handpicked books for just ₹3659 (MRP ₹5480) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-016",
    "slug": "psychological-thriller-set",
    "title": "Psychological Thriller Set",
    "tagline": "Twists, tension and pages you can’t put down.",
    "category": "Thrillers",
    "bookIds": [
      "bk-120",
      "bk-121",
      "bk-122",
      "bk-124"
    ],
    "seoTitle": "Psychological Thriller Set — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Psychological Thriller Set combo (A Good Girl's Guide to Murder, Good Girl, Bad Blood, As Good As Dead, And Then There Were None) online at the lowest price on TheBookX. 4 handpicked books for just ₹719 (MRP ₹1070) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-017",
    "slug": "unputdownable-thrillers",
    "title": "Unputdownable Thrillers",
    "tagline": "Twists, tension and pages you can’t put down.",
    "category": "Thrillers",
    "bookIds": [
      "bk-125",
      "bk-126",
      "bk-127",
      "bk-128"
    ],
    "seoTitle": "Unputdownable Thrillers — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Unputdownable Thrillers combo (The Murder of Roger Ackroyd, Murder on the Orient Express, Death on the Nile, The A.B.C. Murders) online at the lowest price on TheBookX. 4 handpicked books for just ₹639 (MRP ₹960) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-018",
    "slug": "self-help-starter-pack",
    "title": "Self-Help Starter Pack",
    "tagline": "Small steps, big change — start today.",
    "category": "Self-Help",
    "bookIds": [
      "bk-001",
      "bk-003",
      "bk-009"
    ],
    "seoTitle": "Self-Help Starter Pack — 3 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Self-Help Starter Pack combo (The Art of Spending Money, Don't sweat the small stuff, The Courage to Be Disliked) online at the lowest price on TheBookX. 3 handpicked books for just ₹449 (MRP ₹670) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-019",
    "slug": "mindset-and-growth-bundle",
    "title": "Mindset & Growth Bundle",
    "tagline": "Small steps, big change — start today.",
    "category": "Self-Help",
    "bookIds": [
      "bk-031",
      "bk-032",
      "bk-033",
      "bk-034"
    ],
    "seoTitle": "Mindset & Growth Bundle — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Mindset & Growth Bundle combo (Don't Believe Everything You Think, The Art of Not Overthinking, The Art of Laziness, The Art of Being Alone) online at the lowest price on TheBookX. 4 handpicked books for just ₹509 (MRP ₹750) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-020",
    "slug": "habits-and-discipline-set",
    "title": "Habits & Discipline Set",
    "tagline": "Small steps, big change — start today.",
    "category": "Self-Help",
    "bookIds": [
      "bk-035",
      "bk-039",
      "bk-040",
      "bk-044"
    ],
    "seoTitle": "Habits & Discipline Set — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Habits & Discipline Set combo (The Art of Reading People's Mind, Life's Amazing Secret, Energize Your Mind, The Mountain Is You) online at the lowest price on TheBookX. 4 handpicked books for just ₹569 (MRP ₹850) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-021",
    "slug": "confidence-booster-pack",
    "title": "Confidence Booster Pack",
    "tagline": "Small steps, big change — start today.",
    "category": "Self-Help",
    "bookIds": [
      "bk-095",
      "bk-096",
      "bk-097"
    ],
    "seoTitle": "Confidence Booster Pack — 3 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Confidence Booster Pack combo (Make Epic Money, Do Epic Shit, Get Epic Shit Done) online at the lowest price on TheBookX. 3 handpicked books for just ₹539 (MRP ₹800) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-022",
    "slug": "level-up-your-life-box",
    "title": "Level-Up Your Life Box",
    "tagline": "Small steps, big change — start today.",
    "category": "Self-Help",
    "bookIds": [
      "bk-098",
      "bk-130",
      "bk-131",
      "bk-132"
    ],
    "seoTitle": "Level-Up Your Life Box — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Level-Up Your Life Box combo (Dark Psychology, The Almanack of Naval Ravikant, Crucial Conversations: Tools for Talking When Stakes Are High, Breaking the Habit of Being Yourself) online at the lowest price on TheBookX. 4 handpicked books for just ₹669 (MRP ₹1000) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-023",
    "slug": "business-mastery-pack",
    "title": "Business Mastery Pack",
    "tagline": "Think sharper, lead better, build more.",
    "category": "Business",
    "bookIds": [
      "bk-065",
      "bk-066",
      "bk-067",
      "bk-068"
    ],
    "seoTitle": "Business Mastery Pack — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Business Mastery Pack combo (Zero to One, The $100 Startup, The Lean Startup, The Hard Thing About Hard Things) online at the lowest price on TheBookX. 4 handpicked books for just ₹649 (MRP ₹960) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-024",
    "slug": "startup-and-hustle-bundle",
    "title": "Startup & Hustle Bundle",
    "tagline": "Think sharper, lead better, build more.",
    "category": "Business",
    "bookIds": [
      "bk-069",
      "bk-144",
      "bk-162"
    ],
    "seoTitle": "Startup & Hustle Bundle — 3 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Startup & Hustle Bundle combo (Blue Ocean Strategy, Influence: The Psychology of Persuasion, Elon Musk: Tesla, SpaceX, and the Quest for a Fantastic Future) online at the lowest price on TheBookX. 3 handpicked books for just ₹589 (MRP ₹870) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-025",
    "slug": "leadership-reads-set",
    "title": "Leadership Reads Set",
    "tagline": "Think sharper, lead better, build more.",
    "category": "Business",
    "bookIds": [
      "bk-163",
      "bk-217",
      "bk-253",
      "bk-254"
    ],
    "seoTitle": "Leadership Reads Set — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Leadership Reads Set combo (Lean In: Women, Work, and the Will to Lead, Shoe Dog, Build, Don't Talk, Execution) online at the lowest price on TheBookX. 4 handpicked books for just ₹689 (MRP ₹1030) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-026",
    "slug": "money-and-business-box",
    "title": "Money & Business Box",
    "tagline": "Think sharper, lead better, build more.",
    "category": "Business",
    "bookIds": [
      "bk-274",
      "bk-275",
      "bk-299",
      "bk-308"
    ],
    "seoTitle": "Money & Business Box — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Money & Business Box combo (The Art of War, The Intelligent Investor, Deep Work, The 7 Habits of Highly Effective People: Powerful Lessons in Personal Change) online at the lowest price on TheBookX. 4 handpicked books for just ₹759 (MRP ₹1140) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-027",
    "slug": "understand-people-pack",
    "title": "Understand People Pack",
    "tagline": "Understand yourself and everyone around you.",
    "category": "Psychology",
    "bookIds": [
      "bk-134",
      "bk-135",
      "bk-517"
    ],
    "seoTitle": "Understand People Pack — 3 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Understand People Pack combo (Becoming Supernatural, You Are the Placebo, Thinking, Fast and Slow) online at the lowest price on TheBookX. 3 handpicked books for just ₹609 (MRP ₹900) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-028",
    "slug": "psychology-reads-bundle",
    "title": "Psychology Reads Bundle",
    "tagline": "Understand yourself and everyone around you.",
    "category": "Psychology",
    "bookIds": [
      "bk-147",
      "bk-150",
      "bk-151",
      "bk-164"
    ],
    "seoTitle": "Psychology Reads Bundle — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Psychology Reads Bundle combo (Master Your Emotions, The Courage to Be Happy, Mindset: The New Psychology of Success, The Design of Everyday Things) online at the lowest price on TheBookX. 4 handpicked books for just ₹659 (MRP ₹980) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-029",
    "slug": "human-behaviour-box",
    "title": "Human Behaviour Box",
    "tagline": "Understand yourself and everyone around you.",
    "category": "Psychology",
    "bookIds": [
      "bk-165",
      "bk-168",
      "bk-171",
      "bk-175"
    ],
    "seoTitle": "Human Behaviour Box — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Human Behaviour Box combo (Men Are from Mars, Women Are from Venus, Why We Sleep, The Subtle Art of Not Giving a F*ck (Price Drop), Don't Believe Everything You Think (Price Drop)) online at the lowest price on TheBookX. 4 handpicked books for just ₹389 (MRP ₹580) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-030",
    "slug": "money-and-wealth-pack",
    "title": "Money & Wealth Pack",
    "tagline": "Master your money, one page at a time.",
    "category": "Finance",
    "bookIds": [
      "bk-170",
      "bk-315",
      "bk-316"
    ],
    "seoTitle": "Money & Wealth Pack — 3 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Money & Wealth Pack combo (The Psychology of Money (Price Drop), Advice & Dissent, Against the Gods) online at the lowest price on TheBookX. 3 handpicked books for just ₹419 (MRP ₹620) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-031",
    "slug": "financial-freedom-bundle",
    "title": "Financial Freedom Bundle",
    "tagline": "Master your money, one page at a time.",
    "category": "Finance",
    "bookIds": [
      "bk-338",
      "bk-339",
      "bk-341",
      "bk-346"
    ],
    "seoTitle": "Financial Freedom Bundle — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Financial Freedom Bundle combo (Bulls, Bears and Other Beasts, Capital Ideas, Chaos and Order in the Capital Markets, Coffee Can Investing) online at the lowest price on TheBookX. 4 handpicked books for just ₹1079 (MRP ₹1610) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-032",
    "slug": "get-rich-reads-box",
    "title": "Get Rich Reads Box",
    "tagline": "Master your money, one page at a time.",
    "category": "Finance",
    "bookIds": [
      "bk-369",
      "bk-378",
      "bk-379",
      "bk-389"
    ],
    "seoTitle": "Get Rich Reads Box — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Get Rich Reads Box combo (Fault Lines, Global Tilt, Globalization and Its Discontents, HDFC Bank 2.0) online at the lowest price on TheBookX. 4 handpicked books for just ₹839 (MRP ₹1240) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-033",
    "slug": "fantasy-and-sci-fi-box",
    "title": "Fantasy & Sci-Fi Box",
    "tagline": "Escape into worlds far beyond our own.",
    "category": "Fantasy & Sci-Fi",
    "bookIds": [
      "bk-059",
      "bk-079",
      "bk-108"
    ],
    "seoTitle": "Fantasy & Sci-Fi Box — 3 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Fantasy & Sci-Fi Box combo (Forest of Enhancement, The Naga Warrior, Jujutsu Kaisen Set (Volumes 1-21)) online at the lowest price on TheBookX. 3 handpicked books for just ₹2599 (MRP ₹3890) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-034",
    "slug": "epic-fantasy-bundle",
    "title": "Epic Fantasy Bundle",
    "tagline": "Escape into worlds far beyond our own.",
    "category": "Fantasy & Sci-Fi",
    "bookIds": [
      "bk-109",
      "bk-118",
      "bk-234",
      "bk-235"
    ],
    "seoTitle": "Epic Fantasy Bundle — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Epic Fantasy Bundle combo (Harry Potter Series Set (Books 1-7), The Lord of the Rings Trilogy Set, Fourth Wing, Iron Flame) online at the lowest price on TheBookX. 4 handpicked books for just ₹2339 (MRP ₹3500) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-035",
    "slug": "worlds-beyond-pack",
    "title": "Worlds Beyond Pack",
    "tagline": "Escape into worlds far beyond our own.",
    "category": "Fantasy & Sci-Fi",
    "bookIds": [
      "bk-236",
      "bk-258",
      "bk-261",
      "bk-267"
    ],
    "seoTitle": "Worlds Beyond Pack — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Worlds Beyond Pack combo (Onyx Storm, Circe, Once Upon a Broken Heart, Project Hail Mary) online at the lowest price on TheBookX. 4 handpicked books for just ₹779 (MRP ₹1160) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-036",
    "slug": "spiritual-growth-pack",
    "title": "Spiritual Growth Pack",
    "tagline": "Slow down, breathe, and reconnect.",
    "category": "Spirituality",
    "bookIds": [
      "bk-008",
      "bk-070",
      "bk-071"
    ],
    "seoTitle": "Spiritual Growth Pack — 3 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Spiritual Growth Pack combo (The Palace of Illusions, Ram Sita Raavan, Ram: Scion of Ikshvaku) online at the lowest price on TheBookX. 3 handpicked books for just ₹829 (MRP ₹1240) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-037",
    "slug": "inner-peace-bundle",
    "title": "Inner Peace Bundle",
    "tagline": "Slow down, breathe, and reconnect.",
    "category": "Spirituality",
    "bookIds": [
      "bk-072",
      "bk-073",
      "bk-074",
      "bk-075"
    ],
    "seoTitle": "Inner Peace Bundle — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Inner Peace Bundle combo (Sita: Warrior of Mithila, Raavan: Enemy of Aryavarta, The Shiva Trilogy: Meluha, Nagas & Vayaputra, The Immortals of Meluha) online at the lowest price on TheBookX. 4 handpicked books for just ₹1049 (MRP ₹1560) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-038",
    "slug": "mindful-living-box",
    "title": "Mindful Living Box",
    "tagline": "Slow down, breathe, and reconnect.",
    "category": "Spirituality",
    "bookIds": [
      "bk-076",
      "bk-077",
      "bk-078",
      "bk-080"
    ],
    "seoTitle": "Mindful Living Box — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Mindful Living Box combo (The Secret of the Nagas, The Oath of the Vayaputras, Mahagatha: 100 Tales from the Puranas, The Gita: For Children) online at the lowest price on TheBookX. 4 handpicked books for just ₹739 (MRP ₹1100) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-039",
    "slug": "kids-favourites-pack",
    "title": "Kids Favourites Pack",
    "tagline": "Big adventures for little readers.",
    "category": "Children's",
    "bookIds": [
      "bk-117",
      "bk-198",
      "bk-199"
    ],
    "seoTitle": "Kids Favourites Pack — 3 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Kids Favourites Pack combo (Diary of a Wimpy Kid Series Set, Grandma's Bag of Stories, Grandparents' Bag of Stories) online at the lowest price on TheBookX. 3 handpicked books for just ₹2089 (MRP ₹3130) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-040",
    "slug": "little-readers-bundle",
    "title": "Little Readers Bundle",
    "tagline": "Big adventures for little readers.",
    "category": "Children's",
    "bookIds": [
      "bk-200",
      "bk-201",
      "bk-202",
      "bk-203"
    ],
    "seoTitle": "Little Readers Bundle — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Little Readers Bundle combo (The Magic of the Lost Temple, The Gopi Diaries (Series), How I Taught My Grandmother to Read, The Bird with Golden Wings) online at the lowest price on TheBookX. 4 handpicked books for just ₹559 (MRP ₹840) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-041",
    "slug": "bedtime-stories-box",
    "title": "Bedtime Stories Box",
    "tagline": "Big adventures for little readers.",
    "category": "Children's",
    "bookIds": [
      "bk-204",
      "bk-205",
      "bk-206",
      "bk-207"
    ],
    "seoTitle": "Bedtime Stories Box — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Bedtime Stories Box combo (The Magic Drum, How the Earth Got Its Beauty, How the Sea Became Salty, How the Onion Got Its Layers) online at the lowest price on TheBookX. 4 handpicked books for just ₹559 (MRP ₹840) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-042",
    "slug": "fiction-lovers-box",
    "title": "Fiction Lovers Box",
    "tagline": "Unforgettable stories, beautifully told.",
    "category": "Fiction",
    "bookIds": [
      "bk-023",
      "bk-046",
      "bk-047"
    ],
    "seoTitle": "Fiction Lovers Box — 3 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Fiction Lovers Box combo (More Days at the Morisaki Bookshop, Tales from the Cafe, Before Your Memory Fades) online at the lowest price on TheBookX. 3 handpicked books for just ₹419 (MRP ₹630) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-043",
    "slug": "timeless-fiction-set",
    "title": "Timeless Fiction Set",
    "tagline": "Unforgettable stories, beautifully told.",
    "category": "Fiction",
    "bookIds": [
      "bk-048",
      "bk-049",
      "bk-058",
      "bk-060"
    ],
    "seoTitle": "Timeless Fiction Set — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Timeless Fiction Set combo (Before We Say Goodbye, Before We Forget Kindness, The God of Small Things, The Last Queen) online at the lowest price on TheBookX. 4 handpicked books for just ₹629 (MRP ₹940) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-044",
    "slug": "contemporary-fiction-pack",
    "title": "Contemporary Fiction Pack",
    "tagline": "Unforgettable stories, beautifully told.",
    "category": "Fiction",
    "bookIds": [
      "bk-062",
      "bk-081",
      "bk-084",
      "bk-085"
    ],
    "seoTitle": "Contemporary Fiction Pack — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Contemporary Fiction Pack combo (A Little Life, Myth = Mythya, Mahabharat Unraveled, Ramayan Unraveled) online at the lowest price on TheBookX. 4 handpicked books for just ₹809 (MRP ₹1210) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-045",
    "slug": "storyteller-bundle",
    "title": "Storyteller Bundle",
    "tagline": "Unforgettable stories, beautifully told.",
    "category": "Fiction",
    "bookIds": [
      "bk-086",
      "bk-087",
      "bk-088"
    ],
    "seoTitle": "Storyteller Bundle — 3 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Storyteller Bundle combo (The Metamorphosis, The Trial, Notes from Underground) online at the lowest price on TheBookX. 3 handpicked books for just ₹349 (MRP ₹510) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-046",
    "slug": "laugh-out-loud-pack",
    "title": "Laugh-Out-Loud Pack",
    "tagline": "Guaranteed to make you laugh out loud.",
    "category": "Humor",
    "bookIds": [
      "bk-157",
      "bk-276",
      "bk-277",
      "bk-278"
    ],
    "seoTitle": "Laugh-Out-Loud Pack — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Laugh-Out-Loud Pack combo (Anxious People, Diary of a Wimpy Kid, Rodrick Rules, The Last Straw) online at the lowest price on TheBookX. 4 handpicked books for just ₹599 (MRP ₹900) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-047",
    "slug": "inspiring-lives-pack",
    "title": "Inspiring Lives Pack",
    "tagline": "Real lives that inspire and move you.",
    "category": "Biography",
    "bookIds": [
      "bk-004",
      "bk-133",
      "bk-146",
      "bk-161"
    ],
    "seoTitle": "Inspiring Lives Pack — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Inspiring Lives Pack combo (Letters to Milena, Everything I Know About Love, Can't Hurt Me, Ignited Minds: Unleashing the Power Within India) online at the lowest price on TheBookX. 4 handpicked books for just ₹649 (MRP ₹970) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-048",
    "slug": "memoirs-and-biographies-box",
    "title": "Memoirs & Biographies Box",
    "tagline": "Real lives that inspire and move you.",
    "category": "Biography",
    "bookIds": [
      "bk-191",
      "bk-213",
      "bk-214"
    ],
    "seoTitle": "Memoirs & Biographies Box — 3 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Memoirs & Biographies Box combo (Here, There and Everywhere, Wings of Fire, The Diary of a Young Girl) online at the lowest price on TheBookX. 3 handpicked books for just ₹439 (MRP ₹650) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-049",
    "slug": "history-buff-bundle",
    "title": "History Buff Bundle",
    "tagline": "The past, brought vividly to life.",
    "category": "History",
    "bookIds": [
      "bk-158",
      "bk-159",
      "bk-304",
      "bk-309"
    ],
    "seoTitle": "History Buff Bundle — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the History Buff Bundle combo (Mossad: The Greatest Missions of the Israeli Secret Service, Commando, As Long as the Lemon Trees Grow, Sapiens: A Brief History of Humankind) online at the lowest price on TheBookX. 4 handpicked books for just ₹829 (MRP ₹1230) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-050",
    "slug": "ya-favourites-pack",
    "title": "YA Favourites Pack",
    "tagline": "Bold, heartfelt stories for every young reader.",
    "category": "Young Adult",
    "bookIds": [
      "bk-160",
      "bk-265",
      "bk-326",
      "bk-372"
    ],
    "seoTitle": "YA Favourites Pack — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the YA Favourites Pack combo (You've Reached Sam, I Fell in Love with Hope, As Good as Dead, Flawed) online at the lowest price on TheBookX. 4 handpicked books for just ₹799 (MRP ₹1190) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-051",
    "slug": "coming-of-age-bundle",
    "title": "Coming-of-Age Bundle",
    "tagline": "Bold, heartfelt stories for every young reader.",
    "category": "Young Adult",
    "bookIds": [
      "bk-376",
      "bk-392",
      "bk-442"
    ],
    "seoTitle": "Coming-of-Age Bundle — 3 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Coming-of-Age Bundle combo (Girl in Pieces, Insurgent, Shatter Me Series) online at the lowest price on TheBookX. 3 handpicked books for just ₹1639 (MRP ₹2450) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-052",
    "slug": "curious-minds-non-fiction-pack",
    "title": "Curious Minds Non-Fiction Pack",
    "tagline": "Learn something new with every chapter.",
    "category": "Non-Fiction",
    "bookIds": [
      "bk-082",
      "bk-186",
      "bk-187",
      "bk-188"
    ],
    "seoTitle": "Curious Minds Non-Fiction Pack — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Curious Minds Non-Fiction Pack combo (The Bhagavad Gita, Wise and Otherwise: A Salute to Life, Three Thousand Stitches, The Day I Stopped Drinking Milk) online at the lowest price on TheBookX. 4 handpicked books for just ₹709 (MRP ₹1060) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-053",
    "slug": "big-ideas-non-fiction-box",
    "title": "Big Ideas Non-Fiction Box",
    "tagline": "Learn something new with every chapter.",
    "category": "Non-Fiction",
    "bookIds": [
      "bk-189",
      "bk-190",
      "bk-192",
      "bk-215"
    ],
    "seoTitle": "Big Ideas Non-Fiction Box — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Big Ideas Non-Fiction Box combo (The Old Man and His God, Something Happened on the Way to Heaven, Common Yet Uncommon, Autobiography of a Yogi) online at the lowest price on TheBookX. 4 handpicked books for just ₹629 (MRP ₹940) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-054",
    "slug": "sudha-murthy-collection",
    "title": "Sudha Murthy Collection",
    "tagline": "Own the Sudha Murthy shelf — 4 books, one bundle.",
    "category": "Author Packs",
    "bookIds": [
      "bk-186",
      "bk-187",
      "bk-188",
      "bk-189"
    ],
    "seoTitle": "Sudha Murthy Collection — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Sudha Murthy Collection combo (Wise and Otherwise: A Salute to Life, Three Thousand Stitches, The Day I Stopped Drinking Milk, The Old Man and His God) online at the lowest price on TheBookX. 4 handpicked books for just ₹559 (MRP ₹840) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-055",
    "slug": "jeff-kinney-collection",
    "title": "Jeff Kinney Collection",
    "tagline": "Own the Jeff Kinney shelf — 4 books, one bundle.",
    "category": "Author Packs",
    "bookIds": [
      "bk-117",
      "bk-276",
      "bk-277",
      "bk-278"
    ],
    "seoTitle": "Jeff Kinney Collection — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Jeff Kinney Collection combo (Diary of a Wimpy Kid Series Set, Diary of a Wimpy Kid, Rodrick Rules, The Last Straw) online at the lowest price on TheBookX. 4 handpicked books for just ₹2229 (MRP ₹3340) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-056",
    "slug": "freida-mcfadden-collection",
    "title": "Freida McFadden Collection",
    "tagline": "Own the Freida McFadden shelf — 4 books, one bundle.",
    "category": "Author Packs",
    "bookIds": [
      "bk-016",
      "bk-017",
      "bk-018",
      "bk-019"
    ],
    "seoTitle": "Freida McFadden Collection — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Freida McFadden Collection combo (The Inmate, The Housemaid, The Housemaid's Secret, The Housemaid Is Watching) online at the lowest price on TheBookX. 4 handpicked books for just ₹569 (MRP ₹850) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-057",
    "slug": "ana-huang-collection",
    "title": "Ana Huang Collection",
    "tagline": "Own the Ana Huang shelf — 4 books, one bundle.",
    "category": "Author Packs",
    "bookIds": [
      "bk-050",
      "bk-051",
      "bk-052",
      "bk-053"
    ],
    "seoTitle": "Ana Huang Collection — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Ana Huang Collection combo (Twisted Love, Twisted Games, Twisted Hate, Twisted Lies) online at the lowest price on TheBookX. 4 handpicked books for just ₹699 (MRP ₹1050) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-058",
    "slug": "colleen-hoover-collection",
    "title": "Colleen Hoover Collection",
    "tagline": "Own the Colleen Hoover shelf — 4 books, one bundle.",
    "category": "Author Packs",
    "bookIds": [
      "bk-061",
      "bk-064",
      "bk-386",
      "bk-396"
    ],
    "seoTitle": "Colleen Hoover Collection — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Colleen Hoover Collection combo (Ugly Love, Verity, Heart Bones, It Starts with Us) online at the lowest price on TheBookX. 4 handpicked books for just ₹679 (MRP ₹1010) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-059",
    "slug": "amish-tripathi-collection",
    "title": "Amish Tripathi Collection",
    "tagline": "Own the Amish Tripathi shelf — 4 books, one bundle.",
    "category": "Author Packs",
    "bookIds": [
      "bk-071",
      "bk-072",
      "bk-073",
      "bk-074"
    ],
    "seoTitle": "Amish Tripathi Collection — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Amish Tripathi Collection combo (Ram: Scion of Ikshvaku, Sita: Warrior of Mithila, Raavan: Enemy of Aryavarta, The Shiva Trilogy: Meluha, Nagas & Vayaputra) online at the lowest price on TheBookX. 4 handpicked books for just ₹1049 (MRP ₹1560) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-060",
    "slug": "agatha-christie-collection",
    "title": "Agatha Christie Collection",
    "tagline": "Own the Agatha Christie shelf — 4 books, one bundle.",
    "category": "Author Packs",
    "bookIds": [
      "bk-110",
      "bk-124",
      "bk-125",
      "bk-126"
    ],
    "seoTitle": "Agatha Christie Collection — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Agatha Christie Collection combo (Agatha Christie Classic Collection Set, And Then There Were None, The Murder of Roger Ackroyd, Murder on the Orient Express) online at the lowest price on TheBookX. 4 handpicked books for just ₹1189 (MRP ₹1780) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-061",
    "slug": "ali-hazelwood-collection",
    "title": "Ali Hazelwood Collection",
    "tagline": "Own the Ali Hazelwood shelf — 4 books, one bundle.",
    "category": "Author Packs",
    "bookIds": [
      "bk-101",
      "bk-103",
      "bk-273",
      "bk-554"
    ],
    "seoTitle": "Ali Hazelwood Collection — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Ali Hazelwood Collection combo (The Love Hypothesis, Love, Theoretically, Two Can Play, Not in Love) online at the lowest price on TheBookX. 4 handpicked books for just ₹699 (MRP ₹1040) with free delivery, Cash on Delivery and easy returns across India."
  },
  {
    "id": "combo-062",
    "slug": "franz-kafka-collection",
    "title": "Franz Kafka Collection",
    "tagline": "Own the Franz Kafka shelf — 4 books, one bundle.",
    "category": "Author Packs",
    "bookIds": [
      "bk-004",
      "bk-086",
      "bk-087",
      "bk-177"
    ],
    "seoTitle": "Franz Kafka Collection — 4 Books Combo from ₹1 | TheBookX",
    "seoDescription": "Buy the Franz Kafka Collection combo (Letters to Milena, The Metamorphosis, The Trial, The Metamorphosis (Price Drop)) online at the lowest price on TheBookX. 4 handpicked books for just ₹379 (MRP ₹560) with free delivery, Cash on Delivery and easy returns across India."
  }
];

export const getComboBooks = (combo) =>
  (combo?.bookIds || []).map((id) => bookById[id]).filter(Boolean);

export const getComboPricing = (combo) => {
  const items = getComboBooks(combo);
  const sum = items.reduce((s, b) => s + (b.discountedPrice || 0), 0);
  const price = roundTo9(sum);
  const mrp = items.reduce(
    (s, b) => s + (b.originalPrice || originalOf(b.discountedPrice || 0)),
    0,
  );
  return { price, mrp, savings: Math.max(0, mrp - price), count: items.length };
};

export const getComboBySlug = (slug) =>
  combos.find((c) => c.slug === slug) || null;

export const COMBO_CATEGORIES = [...new Set(combos.map((c) => c.category))];
