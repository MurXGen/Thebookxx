// utils/author.js
export const authorData = {
  id: "author-murthy-thevar",
  name: "Murthy Thevar",
  fullName: "Murthy Thevar",
  slug: "murthy-thevar",
  alternativeNames: [
    "Murthy",
    "Thevar",
    "Murthy Thevar Author",
    "M Thevar",
    "Author Murthy Thevar",
    "Clarity Coach Murthy",
  ],

  // Enhanced bio with keywords for both author name and book searches
  bio: `Murthy Thevar is India's leading clarity coach and bestselling author of "The Art of Clarity". As a renowned speaker and self-help expert, Murthy Thevar has helped over 50,000+ readers transform their thinking and achieve mental clarity. His debut book "The Art of Clarity" (published April 1, 2026) has become a national bestseller, praised for its practical approach to eliminating confusion and making confident decisions. When you search for Murthy Thevar or The Art of Clarity, you'll find a transformative self-help journey that has changed thousands of lives. Unlike other self-help authors, Murthy Thevar focuses on actionable strategies that work in real life.`,

  // Personal details for better authority
  born: "January 3, 2004",
  birthplace: "Mumbai, India",
  nationality: "Indian",
  occupation: "Author, Speaker, Clarity Coach",
  genres: [
    "Self-Help",
    "Personal Development",
    "Mental Clarity",
    "Productivity",
    "Decision Making",
    "Overcoming Overthinking",
  ],

  website: "https://thebookx.in/author/murthy-thevar",

  // Enhanced social links
  socialLinks: {
    instagram: "https://instagram.com/itz_murthy",
    twitter: "https://twitter.com/murthythevar",
    linkedin: "https://in.linkedin.com/in/murthy-thevar-holding-book88b31262",
    youtube: "https://youtube.com/@murthythevar",
  },

  publishedBooks: [
    {
      id: "bk-002",
      name: "The Art of Clarity",
      slug: "the-art-of-clarity",
      publishDate: "April 1, 2026",
      isbn: "978-93-12345-01-2",
      price: 149,
      pages: 210,
      language: "English",
      image: "/books/the-art-of-clarity.jpeg",
      description: `"The Art of Clarity" by Murthy Thevar is the #1 bestselling self-help book that transforms your thinking. This book teaches you proven strategies to eliminate confusion, overcome overthinking, and make confident decisions. If you're searching for Murthy Thevar or The Art of Clarity, you've found the ultimate guide to mental clarity. Perfect for anyone seeking personal development, productivity, and peace of mind.`,
      buyLink: "https://thebookx.in/books/the-art-of-clarity",
      amazonLink:
        "https://www.amazon.in/Art-Clarity-Murthy-Thevar/dp/9373358715",
      ratings: {
        goodreads: 4.7,
        amazon: 4.6,
        thebookx: 4.8,
      },
    },
  ],

  // Enhanced author images with SEO-optimized alt text for both author and book searches
  authorImages: [
    {
      url: "/review/author/murthy-thevar.jpeg",
      alt: "Murthy Thevar official author portrait - Author of The Art of Clarity, clarity coach and bestselling self-help author",
      caption:
        "Official portrait of Murthy Thevar, acclaimed author of 'The Art of Clarity' and clarity coach",
      priority: true,
    },
    {
      url: "/review/author/murthy-thevar-the-author-of-the-art-of-clairty.jpeg",
      alt: "Murthy Thevar speaking at event - Author of The Art of Clarity sharing insights about mental clarity and self-help",
      caption:
        "Murthy Thevar speaking at an event, sharing his journey and insights on mental clarity as the author of The Art of Clarity",
      priority: true,
    },
    {
      url: "/review/author/murthy-thevar-distributing-book-the-art-of-clairty.jpeg",
      alt: "Murthy Thevar interacting with readers - Author of The Art of Clarity connecting with audience",
      caption:
        "Murthy Thevar, author of The Art of Clarity, engaging with his audience and readers at a book event",
      priority: true,
    },
    {
      url: "/review/author/murthy-thevar-author-portrait.jpeg",
      alt: "Murthy Thevar at book signing event - Author of The Art of Clarity signing copies for fans",
      caption:
        "Murthy Thevar, bestselling author of The Art of Clarity, signing copies for enthusiastic readers",
      priority: true,
    },
    {
      url: "/review/author/murthy-thevar-holding-book.jpeg",
      alt: "Murthy Thevar holding The Art of Clarity book - Author with his bestselling self-help book",
      caption:
        "Murthy Thevar proudly holding his bestselling book The Art of Clarity, a transformative self-help guide",
      priority: true,
    },
    {
      url: "/review/author/murthy-thevar-distributing-book-the-art-of-clairty.jpeg",
      alt: "Murthy Thevar signed copy of The Art of Clarity - Author signature on self-help book",
      caption:
        "Signed copy of The Art of Clarity by Murthy Thevar, a keepsake for readers of this transformative book",
      priority: true,
    },
  ],

  // Enhanced achievements
  achievements: [
    "Best Debut Author Award 2026 - The Art of Clarity by Murthy Thevar",
    "Top 10 Bestselling Self-Help Books in India - The Art of Clarity",
    "Clarity Coach of the Year - Murthy Thevar",
    "Featured in Leading National Publications - Author Murthy Thevar",
    "Bestselling Author - The Art of Clarity by Murthy Thevar",
    "Rated 4.8/5 by 1000+ Readers - The Art of Clarity",
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
