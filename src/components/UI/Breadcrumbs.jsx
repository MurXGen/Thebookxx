import Link from "next/link";

/**
 * Reusable breadcrumb trail, styled to match the blog page:
 * left-aligned plain text, "/" separators, orange links, dark current page.
 *
 * props:
 *  - items: [{ label, href }], the trail AFTER Home. Last item = current page.
 *  - jsonLd: also emit a BreadcrumbList structured-data block when true.
 *    (Leave false on pages that already emit their own BreadcrumbList.)
 */
export default function Breadcrumbs({ items = [], jsonLd = false }) {
  const trail = [{ label: "Home", href: "/" }, ...items];

  const ld = jsonLd
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: trail.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.label,
          ...(c.href
            ? { item: `https://www.thebookx.in${c.href === "/" ? "" : c.href}` }
            : {}),
        })),
      }
    : null;

  return (
    <nav className="breadcrumbs-pro" aria-label="Breadcrumb">
      {ld && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      )}
      {trail.map((crumb, i) => {
        const isLast = i === trail.length - 1;
        return (
          <span className="bc-item" key={`${crumb.label}-${i}`}>
            {!isLast && crumb.href ? (
              <Link href={crumb.href} className="bc-link">
                {crumb.label}
              </Link>
            ) : (
              <span className="bc-current" aria-current="page">
                {crumb.label}
              </span>
            )}
            {!isLast && <span className="bc-sep"> / </span>}
          </span>
        );
      })}
    </nav>
  );
}
