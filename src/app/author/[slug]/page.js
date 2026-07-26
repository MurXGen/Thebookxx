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
  Camera,
  Globe,
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
    ? `${author.name}, Author of “${firstBook?.name}” | Buy Online at Lowest Price | Books Starting at ₹1`
    : `${author.name} Books | Buy ${author.name} Online at Lowest Price | Books Starting at ₹1`;

  const description = author.isRich
    ? `Discover ${author.name}, bestselling author of “${firstBook?.name}”. Browse all books by ${author.name} at TheBookX at the lowest prices in India, with free shipping, Cash on Delivery and books starting at just ₹1.`
    : `Browse all ${count} book${count === 1 ? "" : "s"} by ${author.name} at TheBookX. Buy ${author.name}'s titles online at the lowest prices in India, with free delivery, Cash on Delivery and books starting at just ₹1.`;

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
          jobTitle: ["Product Designer", "Author"],
          award: author.achievements?.slice(0, 8),
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

  const graph = [person, itemList];

  if (author.isRich && author.faqs?.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${canonical}#faq`,
      mainEntity: author.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  // ImageGallery of author + book photos — helps the images rank in Google
  // Images for "The Art of Clarity" and "Murthy Thevar".
  const allImages = [
    ...(author.authorImages || []),
    ...(author.bookImages || []),
  ];
  if (author.isRich && allImages.length > 0) {
    graph.push({
      "@type": "ImageGallery",
      "@id": `${canonical}#gallery`,
      name: `Murthy Thevar and "The Art of Clarity" book gallery`,
      associatedMedia: allImages.map((img) => ({
        "@type": "ImageObject",
        contentUrl: `https://thebookx.in${img.url}`,
        caption: img.alt,
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
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
                    {author.portfolio && (
                      <a
                        href={author.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4"
                        style={{ color: "white" }}
                      >
                        <Globe size={16} /> Portfolio
                      </a>
                    )}
                  </div>
                  <div className="flex flex-row gap-12">
                    {author.socialLinks?.instagram && (
                      <a href={author.socialLinks.instagram} target="_blank" rel="noopener noreferrer" style={{ color: "white" }} aria-label="Instagram">
                        <Instagram size={22} />
                      </a>
                    )}
                    {author.socialLinks?.twitter && (
                      <a href={author.socialLinks.twitter} target="_blank" rel="noopener noreferrer" style={{ color: "white" }} aria-label="Twitter">
                        <Twitter size={22} />
                      </a>
                    )}
                    {author.socialLinks?.linkedin && (
                      <a href={author.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "white" }} aria-label="LinkedIn">
                        <Linkedin size={22} />
                      </a>
                    )}
                    {author.socialLinks?.portfolio && (
                      <a href={author.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" style={{ color: "white" }} aria-label="Portfolio website">
                        <Globe size={22} />
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
              {author.story?.length > 0 ? (
                <div className="flex flex-col gap-16">
                  {author.story.map((para, i) => (
                    <p
                      key={i}
                      className="font-16 dark-50"
                      style={{ lineHeight: "1.8" }}
                    >
                      {para}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="font-16 dark-50" style={{ lineHeight: "1.8" }}>
                  {author.bio}
                </p>
              )}
            </div>

            {/* Topics / categories — chips link to category pages (SEO) */}
            {author.categories?.length > 0 && (
              <div className="flex flex-col gap-12">
                <h2 className="font-24 weight-600">
                  Topics {author.name} writes about
                </h2>
                <div className="apx-chips">
                  {author.categories.map((c) => (
                    <Link
                      key={c}
                      href={`/category/${slugify(c)}`}
                      className="apx-chip"
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {author.authorImages?.length > 0 && (
              <div className="author-gallery flex flex-col gap-24">
                <div className="flex items-center gap-8">
                  <Camera size={24} className="orange" />
                  <h2 className="font-24 weight-600">Gallery of {author.name}</h2>
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

            {/* ===== "The Art of Clarity" book gallery (aggressive image SEO) ===== */}
            {author.bookImages?.length > 0 && (
              <div className="author-gallery flex flex-col gap-16">
                <div className="flex items-center gap-8">
                  <Camera size={24} className="orange" />
                  <h2 className="font-24 weight-600">
                    “{author.publishedBooks?.[0]?.name || "The Art of Clarity"}”
                    by {author.name}: Book Gallery
                  </h2>
                </div>
                <p className="font-14 dark-50" style={{ lineHeight: 1.7 }}>
                  Photos of “
                  {author.publishedBooks?.[0]?.name || "The Art of Clarity"}”,
                  the bestselling self-help book by {author.name} on clarity,
                  decision making and personal growth, in readers&apos; hands
                  and everyday settings.
                </p>
                <div
                  className="gallery-grid"
                  style={{ display: "flex", flexDirection: "row", overflow: "auto", borderRadius: "12px", gap: "12px" }}
                >
                  {author.bookImages.map((img, index) => (
                    <figure
                      key={index}
                      className="gallery-item"
                      style={{ position: "relative", flex: "0 0 auto", margin: 0 }}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt}
                        title={img.alt}
                        width={200}
                        height={260}
                        style={{ objectFit: "cover", borderRadius: "8px" }}
                        priority={index < 3}
                      />
                      {img.caption && (
                        <figcaption
                          style={{
                            position: "absolute",
                            width: "1px",
                            height: "1px",
                            overflow: "hidden",
                            clip: "rect(0 0 0 0)",
                          }}
                        >
                          {img.caption}
                        </figcaption>
                      )}
                    </figure>
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

        {/* FAQ (rich only) — People-Also-Ask visibility */}
        {author.isRich && author.faqs?.length > 0 && (
          <div className="flex flex-col gap-16">
            <h2 className="font-24 weight-600">Frequently asked questions</h2>
            <div className="author-faq">
              {author.faqs.map((f, i) => (
                <div key={i} className="author-faq-item">
                  <h3 className="author-faq-q">{f.q}</h3>
                  <p className="author-faq-a">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        {author.publishedBooks?.[0] && (
          <div className="apx-cta">
            <h2 className="apx-cta-title">
              Explore books by {author.name}, starting at ₹1
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
