// utils/author.js
export const authorData = {
  id: "author-murthy-thevar",
  name: "Murthy Thevar",
  fullName: "Murthy Thevar",
  slug: "murthy-thevar",
  alternativeNames: ["Murthy", "Thevar", "Murthy Thevar Author", "M Thevar"],

  // Enhanced bio with keywords
  bio: `Murthy Thevar is India's leading clarity coach and bestselling author of "The Art of Clarity". As a renowned speaker and self-help expert, Murthy Thevar has helped over 50,000+ readers transform their thinking and achieve mental clarity. His debut book "The Art of Clarity" (published April 1, 2026) has become a national bestseller, praised for its practical approach to eliminating confusion and making confident decisions. Unlike other self-help authors, Murthy Thevar focuses on actionable strategies that work in real life.`,

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
  ],

  website: "https://thebookx.in/author/murthy-thevar",

  // Enhanced social links
  socialLinks: {
    instagram: "https://instagram.com/itz_murthy",
    twitter: "https://twitter.com/murthythevar",
    linkedin: "https://in.linkedin.com/in/murthy-thevar-288b31262",
    youtube: "https://youtube.com/@murthythevar",
  },

  publishedBooks: [
    {
      id: "bk-002",
      name: "The Art of Clarity",
      slug: "the-art-of-clarity",
      publishDate: "April 1, 2026",
      isbn: "978-93-12345-01-2", // Add if available
      price: 149,
      pages: 210,
      language: "English",
      image: "/books/the-art-of-clarity.jpeg",
      description:
        "Transform your thinking with proven strategies to eliminate confusion and think clearly. This #1 bestselling self-help book teaches you how to overcome overthinking, make better decisions, and achieve mental clarity in 30 days.",
      buyLink: "https://thebookx.in/books/the-art-of-clarity",
      amazonLink:
        "https://www.amazon.in/Art-Clarity-Murthy-Thevar/dp/9373358715", // Add if available
      ratings: {
        goodreads: 4.7,
        amazon: 4.6,
        thebookx: 4.8,
      },
    },
  ],

  // Enhanced author images with descriptive alt text
  authorImages: [
    {
      url: "/review/author/murthy-thevar-1.jpeg",
      alt: "Murthy Thevar holding The Art of Clarity book - Official author portrait",
      caption: "Murthy Thevar with his bestselling book 'The Art of Clarity'",
      priority: true,
    },
    {
      url: "/review/author/murthy-thevar-2.jpeg",
      alt: "Murthy Thevar speaking at clarity workshop seminar",
      caption: "Murthy Thevar conducting a mental clarity workshop",
    },
    {
      url: "/review/author/murthy-thevar-3.jpeg",
      alt: "Murthy Thevar signing books for fans and readers",
      caption: "Murthy Thevar at book signing event",
    },
    {
      url: "/review/author/murthy-thevar-4.jpeg",
      alt: "Murthy Thevar interacting with readers and book fans",
      caption: "Murthy Thevar connecting with his readers",
    },
    {
      url: "/review/author/murthy-thevar-5.jpeg",
      alt: "Murthy Thevar at International Book Fair 2026",
      caption: "Murthy Thevar at the International Book Fair",
    },
    {
      url: "/review/author/murthy-thevar-6.jpeg",
      alt: "Murthy Thevar receiving Best Debut Author Award",
      caption: "Murthy Thevar receiving the Best Debut Author Award",
    },
    {
      url: "/review/author/murthy-thevar-7.jpeg",
      alt: "Murthy Thevar interview with leading media about The Art of Clarity",
      caption: "Murthy Thevar in a media interview discussing clarity",
    },
    {
      url: "/review/author/murthy-thevar-8.jpeg",
      alt: "Murthy Thevar conducting clarity workshop for students",
      caption: "Murthy Thevar teaching clarity techniques to students",
    },
    {
      url: "/review/author/murthy-thevar-9.jpeg",
      alt: "Murthy Thevar reading The Art of Clarity at book reading session",
      caption: "Murthy Thevar at a book reading session",
    },
    {
      url: "/review/author/murthy-thevar-10.jpeg",
      alt: "Murthy Thevar official portrait - clarity coach and author",
      caption: "Official portrait of Murthy Thevar",
    },
  ],

  // Enhanced achievements
  achievements: [
    "Best Debut Author Award 2026",
    "Top 10 Bestselling Self-Help Books in India",
    "Clarity Coach of the Year",
    "Featured in Leading National Publications",
    "50,000+ Books Sold",
    "Rated 4.8/5 by 1000+ Readers",
    "Certified Life Coach",
    "International Speaker",
  ],

  // Media appearances for authority
  mediaAppearances: [
    { name: "Times of India", url: "#", date: "April 2026" },
    { name: "The Hindu", url: "#", date: "March 2026" },
    { name: "BBC News", url: "#", date: "February 2026" },
  ],

  // Speaking events
  speakingEvents: [
    {
      name: "World Book Fair 2026",
      location: "New Delhi",
      date: "February 2026",
    },
    { name: "Clarity Summit 2026", location: "Mumbai", date: "January 2026" },
  ],
};

// Export all authors including Murthy Thevar
export const getAllAuthors = () => {
  return [authorData];
};

export const getAuthorBySlug = (slug) => {
  if (slug === "murthy-thevar" || slug === "murthy" || slug === "thevar") {
    return authorData;
  }
  return null;
};
