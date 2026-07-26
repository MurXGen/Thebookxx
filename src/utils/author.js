// utils/author.js
import { books } from "./book";

function slugifyAuthor(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function slugifyTitle(text) {
  return slugifyAuthor(text);
}

// Every distinct author slug derived from the catalogue (for static params
// + making sure every author in the sitemap has a real, rendering page).
export const getAllAuthorSlugs = () => {
  const set = new Set();
  books.forEach((b) => {
    if (b.author) set.add(slugifyAuthor(b.author));
  });
  return Array.from(set);
};

// Returns a full author profile for any author in the catalogue.
// Murthy Thevar gets the rich, hand-authored profile; everyone else gets a
// generated profile that lists ALL of their books.
export const getAuthorProfile = (slug) => {
  const rich = getAuthorBySlug(slug);
  if (rich) return { ...rich, isRich: true };

  const authored = books.filter(
    (b) => b.author && slugifyAuthor(b.author) === slug,
  );
  if (authored.length === 0) return null;

  const name = authored[0].author;
  const genres = Array.from(
    new Set(
      authored.flatMap((b) =>
        (b.catalogue || []).filter(
          (c) => !["bestseller", "trending", "set"].includes(c),
        ),
      ),
    ),
  );
  return {
    isRich: false,
    name,
    slug,
    bookCount: authored.length,
    genres,
    bio: `${name} is the author of ${authored.length} ${
      authored.length === 1 ? "title" : "titles"
    } available at TheBookX${
      genres.length ? `, spanning ${genres.slice(0, 4).join(", ")}` : ""
    }. Browse and buy ${name}'s books online at the lowest prices in India, with books starting at just ₹1, free shipping and Cash on Delivery.`,
    publishedBooks: authored.map((b) => ({
      id: b.id,
      name: b.name,
      slug: slugifyTitle(b.name),
      image: b.image,
      description: b.description || "",
      price: b.discountedPrice,
      ratings: { thebookx: b.rating || 4.6 },
    })),
  };
};

export const authorData = {
  id: "author-murthy-thevar",
  name: "Murthy Thevar",
  fullName: "Murthy Thevar",
  slug: "murthy-thevar",
  alternativeNames: [
    "Murthy",
    "Thevar",
    "Author Murthy Thevar",
    "Murthy Thevar portfolio",
    "Murthy Thevar designer",
    "Murthy Thevar developer",
  ],

  // Bio — product designer & author of the bestselling "The Art of Clarity".
  bio: `Murthy Thevar is a product designer and the author of "The Art of Clarity", one of the bestselling books of the year. A debut that readers have rated too good to be a first book, "The Art of Clarity" has struck a chord with a generation that feels busier, more distracted and more overwhelmed than ever. Murthy's mission is simple: help people think clearly and make better decisions.`,

  birthplace: "Mumbai, India",
  nationality: "Indian",
  occupation: "Product Designer & Author of 'The Art of Clarity'",
  genres: [
    "Self-Help",
    "Personal Development",
    "Decision Making",
    "Productivity",
    "Clarity",
  ],

  // Book topics / categories Murthy is known for (chips + SEO).
  categories: ["Self-Help", "Trending", "Motivation", "Decision Making", "Growth"],

  // Longer story, rendered as paragraphs in the About section.
  story: [
    `Murthy Thevar is a product designer by craft and an author by calling. His debut book, "The Art of Clarity", released this year and quickly became one of the bestselling titles of the year, praised by readers as "too good for a first book" and celebrated as a clarity guide this generation didn't know it needed.`,
    `The book didn't come from theory. Over the years, Murthy read deeply across self-help and personal development, hundreds of books, from timeless classics to the latest bestsellers, and kept noticing the same gap. Almost every book tried to help people remember more, hustle harder, or fix their habits. But the real struggle of this generation isn't a short memory or forgetting things. It is decision-making. We are drowning in options, notifications and noise, and the one skill nobody teaches is how to decide with clarity.`,
    `So Murthy did what a designer does: he stripped away the clutter. He distilled everything he had read, tested and lived into a simple, practical framework for taking smart action and making better decisions with less stress. No jargon, no filler, just clarity you can actually use. That became "The Art of Clarity".`,
    `As a product designer, Murthy believes clarity isn't only a mindset, it is a design principle. The same instinct that makes an interface effortless to use is the one that makes a life easier to live: remove the noise, and the right choice becomes obvious. That philosophy runs through every page of the book and everything he creates.`,
    `Today, thousands of readers turn to "The Art of Clarity" to cut through overthinking, quiet the mental clutter and move forward with confidence. If you're searching for Murthy Thevar or "The Art of Clarity", you've found a book and an author built entirely around one idea: a clearer mind makes better decisions.`,
  ],

  // FAQ (People-Also-Ask visibility + FAQPage schema).
  faqs: [
    {
      q: "Who is Murthy Thevar?",
      a: `Murthy Thevar is a product designer and the author of "The Art of Clarity", one of the bestselling self-help books of the year. His work focuses on clarity, better decision-making and personal growth.`,
    },
    {
      q: `What is "The Art of Clarity" about?`,
      a: `It is a practical self-help guide to thinking clearly and making better decisions with less stress, distilled from hundreds of self-help and personal-development books into one simple, usable framework.`,
    },
    {
      q: `What category is "The Art of Clarity"?`,
      a: `It sits across Self-Help, Motivation, Decision Making and personal Growth, and is one of the trending reads of the year.`,
    },
    {
      q: `Is "The Art of Clarity" good for beginners?`,
      a: `Yes. It is written in plain language with no jargon, so it works whether you are new to self-help or have already read widely across the genre.`,
    },
    {
      q: "Where can I buy Murthy Thevar's book?",
      a: `You can buy "The Art of Clarity" on TheBookX, Amazon and Flipkart.`,
    },
  ],

  portfolio: "https://themurx.vercel.app",
  website: "https://thebookx.in/author/murthy-thevar",

  // Verified links only.
  socialLinks: {
    linkedin: "https://in.linkedin.com/in/murthy-thevar-288b31262",
    portfolio: "https://themurx.vercel.app",
  },

  publishedBooks: [
    {
      id: "bk-002",
      name: "The Art of Clarity",
      slug: "the-art-of-clarity",
      isbn: "978-93-73358-71-0",
      price: 149,
      pages: 210,
      language: "English",
      image: "/books/the-art-of-clarity.jpeg",
      description: `"The Art of Clarity" by Murthy Thevar is a practical self-help guide to taking smart action and making better decisions with less stress. Written by a designer, it turns clarity into a repeatable way of thinking, designing and living. Available on TheBookX, Amazon and Flipkart.`,
      buyLink: "https://thebookx.in/books/the-art-of-clarity",
      amazonLink:
        "https://www.amazon.in/Art-Clarity-Murthy-Thevar/dp/9373358715",
      flipkartLink:
        "https://www.flipkart.com/the-art-of-clarity/p/itmbf0dda9ace8d1?pid=9789373358710",
      ratings: {
        thebookx: 4.8,
      },
    },
  ],

  // Author portraits (Gallery of Murthy).
  authorImages: [
    {
      url: "/review/author/murthy-thevar.jpeg",
      alt: "Murthy Thevar, Mumbai-based product designer and author of The Art of Clarity",
      caption:
        "Murthy Thevar, product designer and author of 'The Art of Clarity'",
      priority: true,
    },
    {
      url: "/review/author/murthy-thevar-author-portrait.jpeg",
      alt: "Murthy Thevar author portrait, author of the bestselling book The Art of Clarity",
      caption: "Murthy Thevar, author of 'The Art of Clarity'",
      priority: true,
    },
  ],

  // Dedicated "The Art of Clarity" book gallery — aggressive per-image SEO so
  // these rank for image searches of the book.
  bookImages: [
    {
      url: "/review/author/the-art-of-clarity-front-cover-portrait.jpeg",
      alt: "The Art of Clarity front cover, the bestselling self-help book by Murthy Thevar",
      caption: "'The Art of Clarity' by Murthy Thevar, front cover",
    },
    {
      url: "/review/author/the-art-clarity-book-by-murthy-thevar-2.jpeg",
      alt: "The Art of Clarity book by Murthy Thevar, a self-help guide to making better decisions",
      caption: "'The Art of Clarity' by Murthy Thevar",
    },
    {
      url: "/review/author/the-art-clarity-book-by-murthy-thevar-3.jpeg",
      alt: "The Art of Clarity by Murthy Thevar, one of the bestselling self-help books of the year",
      caption: "'The Art of Clarity' by Murthy Thevar",
    },
    {
      url: "/review/author/the-art-clarity-book-by-murthy-thevar-on-readers-table.jpeg",
      alt: "The Art of Clarity by Murthy Thevar on a reader's table",
      caption: "'The Art of Clarity' by Murthy Thevar on a reader's table",
    },
    {
      url: "/review/reviewers/the-art-of-clarity-natural.jpeg",
      alt: "The Art of Clarity by Murthy Thevar, bestselling clarity and decision-making book in a natural reading setting",
      caption: "'The Art of Clarity' by Murthy Thevar",
    },
    {
      url: "/review/reviewers/the-art-of-clarity-natural-1.jpeg",
      alt: "The Art of Clarity book by Murthy Thevar resting in soft natural light",
      caption: "'The Art of Clarity' by Murthy Thevar",
    },
    {
      url: "/review/reviewers/the-art-of-clarity-natural-2.jpeg",
      alt: "The Art of Clarity by Murthy Thevar, self-help book on clarity and better decisions, held in hand",
      caption: "'The Art of Clarity' by Murthy Thevar",
    },
    {
      url: "/review/reviewers/the-art-of-clarity-natural-3.jpeg",
      alt: "The Art of Clarity book by Murthy Thevar in a cosy reading corner",
      caption: "'The Art of Clarity' by Murthy Thevar",
    },
    {
      url: "/review/reviewers/the-art-of-clarity-natural-4.jpeg",
      alt: "The Art of Clarity by Murthy Thevar, bestselling self-help book photographed outdoors in nature",
      caption: "'The Art of Clarity' by Murthy Thevar",
    },
    {
      url: "/review/reviewers/the-art-of-clarity-natural-5.jpeg",
      alt: "A reader holding The Art of Clarity by Murthy Thevar",
      caption: "A reader with 'The Art of Clarity' by Murthy Thevar",
    },
    {
      url: "/review/reviewers/the-art-of-clarity-natural-6.jpeg",
      alt: "The Art of Clarity by Murthy Thevar, lifestyle photo of the bestselling self-help book",
      caption: "'The Art of Clarity' by Murthy Thevar",
    },
    {
      url: "/review/reviewers/the-art-of-clarity-book-scene.jpeg",
      alt: "The Art of Clarity by Murthy Thevar, book scene on a wooden desk",
      caption: "'The Art of Clarity' by Murthy Thevar",
    },
    {
      url: "/review/reviewers/the-art-of-clarity-book-scene-3.jpeg",
      alt: "The Art of Clarity by Murthy Thevar, the bestselling self-help book of the year on display",
      caption: "'The Art of Clarity' by Murthy Thevar",
    },
    {
      url: "/review/reviewers/the-art-of-clarity-scene-1.jpeg",
      alt: "The Art of Clarity by Murthy Thevar, self-help book for clearer thinking and better decisions",
      caption: "'The Art of Clarity' by Murthy Thevar",
    },
  ],

  // Trust-building recognition for the book.
  achievements: [
    'One of the Bestselling Books of the Year: "The Art of Clarity"',
    'Clarity Book of the Year: "The Art of Clarity" by Murthy Thevar',
    'Rated "too good for a debut" by readers, a standout first book',
    "4.8/5 average reader rating across the community",
    "Loved by thousands of readers across India",
    "Widely recommended as this generation's go-to guide for better decisions",
    "A breakout debut author to watch",
  ],

  mediaAppearances: [],
  speakingEvents: [],
};

// Export all authors including Murthy Thevar
export const getAllAuthors = () => {
  return [authorData];
};

export const getAuthorBySlug = (slug) => {
  if (
    slug === "murthy-thevar" ||
    slug === "murthy" ||
    slug === "thevar" ||
    slug === "author-murthy-thevar"
  ) {
    return authorData;
  }
  return null;
};
