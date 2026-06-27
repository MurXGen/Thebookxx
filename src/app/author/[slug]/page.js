// app/author/[slug]/page.js
import { getAuthorProfile, getAllAuthorSlugs } from "@/utils/author";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  BookOpen,
  Award,
  Instagram,
  Twitter,
  Linkedin,
  MapPin,
  Users,
  Camera,
} from "lucide-react";

function slugify(text) {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Static params for EVERY author in the catalogue (matches the sitemap).
export async function generateStaticParams() {
  return getAllAuthorSlugs().map((slug) => ({ slug }));
}

// SEO metadata — generic for every author, "Books Starting at ₹1" appended.
// (Root layout adds the "| TheBookX" suffix via its title template.)
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const author = getAuthorProfile(slug);

  if (!author) {
    return { title: "Author Not Found", robots: { index: false } };
  }

  const canonicalUrl = `https://thebookx.in/author/${slug}`;
  const firstBook = author.publishedBooks?.[0];
  const count = author.publishedBooks?.length || 0;

  const title = author.isRich
    ? `${author.name} — Author of “${firstBook?.name}”, Buy Online at Lowest Price | Books Starting at ₹1`
    : `${author.name} Books — Buy ${author.name} Online at Lowest Price | Books Starting at ₹1`;

  const description = author.isRich
    ? `Discover ${author.name}, bestselling author of “${firstBook?.name}”. Browse all books by ${author.name} at TheBookX — lowest prices in India, free shipping, Cash on Delivery, with books starting at just ₹1.`
    : `Browse all ${count} book${count === 1 ? "" : "s"} by ${author.name} at TheBookX. Buy ${author.name}'s titles online at the lowest prices in India — free delivery, Cash on Delivery, books starting at just ₹1.`;

  return {
    title,
    description,
    keywords: `${author.name}, ${author.name} books, buy ${author.name} books online, ${author.name} books lowest price, ${author.name} books online India, cheap books, books starting at ₹1, TheBookX`,
    alternates: { canonical: canonicalUrl },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "TheBookX",
      locale: "en_IN",
      type: "profile",
      images: [
        author.isRich && author.authorImages?.[0]?.url
          ? {
              url: author.authorImages[0].url,
              width: 1200,
              height: 630,
              alt: author.authorImages[0].alt || author.name,
            }
          : firstBook?.image
            ? {
                url: firstBook.image,
                width: 800,
                height: 800,
                alt: `${firstBook.name} by ${author.name}`,
              }
            : undefined,
      ].filter(Boolean),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        author.isRich ? author.authorImages?.[0]?.url : firstBook?.image,
      ].filter(Boolean),
    },
  };
}

// JSON-LD: Person + the author's full book list (ItemList).
function buildStructuredData(author) {
  const canonical = `https://thebookx.in/author/${author.slug}`;
  const person = {
    "@type": "Person",
    "@id": `${canonical}#person`,
    name: author.name,
    url: canonical,
    ...(author.isRich
      ? {
          alternateName: author.alternativeNames || [author.name],
          description: author.bio,
          sameAs: Object.values(author.socialLinks || {}).filter(
            (l) => l && l !== "#",
          ),
          jobTitle: "Author",
          award: author.achievements?.slice(0, 6),
          image: author.authorImages?.map((img) => img.url),
          knowsAbout: author.genres,
        }
      : {
          description: author.bio,
          knowsAbout: author.genres,
          image: author.publishedBooks?.[0]?.image,
        }),
  };

  const itemList = {
    "@type": "ItemList",
    name: `Books by ${author.name}`,
    numberOfItems: author.publishedBooks?.length || 0,
    itemListElement: (author.publishedBooks || []).map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://thebookx.in/books/${b.slug}`,
      name: b.name,
    })),
  };

  return { "@context": "https://schema.org", "@graph": [person, itemList] };
}

function BooksByAuthor({ author }) {
  if (!author.publishedBooks?.length) return null;
  return (
    <section className="apx-block">
      <div className="apx-h2-row">
        <h2 className="apx-h2">Books by {author.name}</h2>
        <span className="apx-count">{author.publishedBooks.length}</span>
      </div>
      <div className="apx-books">
        {author.publishedBooks.map((b) => (
          <article key={b.id} className="apx-book">
            <Link
              href={`/books/${b.slug}`}
              className="apx-book-cover"
              aria-label={b.name}
            >
              <Image
                src={b.image}
                alt={`${b.name} by ${author.name} book cover`}
                width={120}
                height={180}
              />
            </Link>
            <div className="apx-book-info">
              <h3 className="apx-book-title">
                <Link href={`/books/${b.slug}`}>{b.name}</Link>
              </h3>
              <span className="apx-book-rating">
                <Star size={12} fill="#FFB800" color="#FFB800" />
                {b.ratings?.thebookx || 4.6}
              </span>
              <div className="apx-book-foot">
                <span className="apx-book-price">₹{b.price}</span>
                <Link href={`/books/${b.slug}`} className="apx-buy">
                  Buy Now
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default async function AuthorPage({ params }) {
  const { slug } = await params;
  const author = getAuthorProfile(slug);
  if (!author) notFound();

  const structuredData = buildStructuredData(author);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="section-680 author-page flex flex-col gap-28" style={{ padding: "20px 16px 64px" }}>
        {/* Breadcrumbs */}
        <nav className="breadcrumbs" style={{ fontSize: "14px", color: "#666" }}>
          <Link href="/" style={{ color: "#fb8500" }}>
            Home
          </Link>
          <span> / </span>
          <Link href="/author" style={{ color: "#fb8500" }}>
            Authors
          </Link>
          <span> / </span>
          <span style={{ color: "#374151" }}>{author.name}</span>
        </nav>

        {author.isRich ? (
          <>
            {/* ===== Rich author header (Murthy Thevar) ===== */}
            <div className="author-header" style={{ borderRadius: "12px" }}>
              <div
                className="author-avatar"
                style={{
                  width: "100%",
                  maxWidth: "500px",
                  borderRadius: "12px",
                  background: "white",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <Image
                  src={author.authorImages[0]?.url || "/default-author.jpg"}
                  alt={author.authorImages[0]?.alt || author.name}
                  width={500}
                  height={600}
                  style={{ objectFit: "cover", width: "100%", height: "500px" }}
                  priority
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0) 100%)",
                  }}
                />
                <div
                  className="author-info flex flex-col gap-12"
                  style={{
                    position: "absolute",
                    bottom: "24px",
                    left: "24px",
                    color: "white",
                  }}
                >
                  <h1 className="font-32 weight-700">{author.name}</h1>
                  <p className="font-16">{author.occupation}</p>
                  <div className="flex flex-row gap-16 flex-wrap font-16">
                    <span className="flex items-center gap-4">
                      <MapPin size={16} /> {author.birthplace}
                    </span>
                    <span className="flex items-center gap-4">
                      <Users size={16} /> 50,000+ Readers
                    </span>
                  </div>
                  <div className="flex flex-row gap-12">
                    {author.socialLinks?.instagram && (
                      <a href={author.socialLinks.instagram} target="_blank" rel="noopener noreferrer" style={{ color: "white" }}>
                        <Instagram size={22} />
                      </a>
                    )}
                    {author.socialLinks?.twitter && (
                      <a href={author.socialLinks.twitter} target="_blank" rel="noopener noreferrer" style={{ color: "white" }}>
                        <Twitter size={22} />
                      </a>
                    )}
                    {author.socialLinks?.linkedin && (
                      <a href={author.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "white" }}>
                        <Linkedin size={22} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="author-bio">
              <h2 className="font-24 weight-600 margin-btm-16px">
                About {author.name}
              </h2>
              <p className="font-16 dark-50" style={{ lineHeight: "1.8" }}>
                {author.bio}
              </p>
            </div>

            {author.authorImages?.length > 0 && (
              <div className="author-gallery flex flex-col gap-24">
                <div className="flex items-center gap-8">
                  <Camera size={24} className="orange" />
                  <h2 className="font-24 weight-600">Gallery — {author.name}</h2>
                </div>
                <div
                  className="gallery-grid"
                  style={{ display: "flex", flexDirection: "row", overflow: "auto", borderRadius: "12px", gap: "12px" }}
                >
                  {author.authorImages.map((img, index) => (
                    <div key={index} className="gallery-item" style={{ position: "relative", flex: "0 0 auto" }}>
                      <Image
                        src={img.url}
                        alt={img.alt}
                        width={200}
                        height={250}
                        style={{ objectFit: "cover", borderRadius: "8px" }}
                        priority={index < 4}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* ===== Generic author hero ===== */}
            <header className="apx-hero">
              <div className="apx-hero-top">
                <span className="apx-avatar">{author.name?.[0] || "?"}</span>
                <div className="apx-hero-head">
                  <h1 className="apx-name">{author.name}</h1>
                  <span className="apx-hero-stat">
                    <BookOpen size={14} />
                    {author.bookCount} {author.bookCount === 1 ? "book" : "books"}{" "}
                    on TheBookX
                  </span>
                </div>
              </div>
              {author.genres?.length > 0 && (
                <div className="apx-chips">
                  {author.genres.slice(0, 5).map((g) => (
                    <Link
                      key={g}
                      href={`/category/${slugify(g)}`}
                      className="apx-chip"
                    >
                      {g.replace(/-/g, " ")}
                    </Link>
                  ))}
                </div>
              )}
            </header>

            <section className="apx-block">
              <h2 className="apx-h2">About {author.name}</h2>
              <p className="apx-bio">{author.bio}</p>
            </section>
          </>
        )}

        {/* Books — shared by both layouts (shows ALL the author's books) */}
        <BooksByAuthor author={author} />

        {/* Awards (rich only) */}
        {author.isRich && author.achievements?.length > 0 && (
          <div className="achievements flex flex-col gap-24">
            <h2 className="font-24 weight-600">Awards & Recognition</h2>
            <div
              className="flex flex-col gap-24"
              style={{ background: "white", border: "1px solid var(--dark-20)", padding: "12px", borderRadius: "12px" }}
            >
              {author.achievements.slice(0, 10).map((achievement, index) => (
                <div
                  key={index}
                  className="achievement-badge flex flex-row gap-4 items-center"
                  style={{ borderBottom: "1px solid var(--dark-20)", paddingBottom: "12px" }}
                >
                  <Award size={16} color="#fb8500" />
                  <span className="font-16 weight-500">{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        {author.publishedBooks?.[0] && (
          <div className="apx-cta">
            <h2 className="apx-cta-title">
              Explore books by {author.name} — starting at ₹1
            </h2>
            <p className="apx-cta-sub">
              Lowest prices in India · Free shipping · Cash on Delivery
            </p>
            <Link href="/books" className="apx-cta-btn">
              Browse all books
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
