import { Poppins } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { StoreProvider } from "@/context/StoreContext";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { ToastProvider } from "@/context/ToastContext";
import RegisterSW from "@/components/RegisterSW";
import GlobalHaptics from "@/components/UI/GlobalHaptics";
import { PLProvider } from "@/context/PLContext";

/* Font */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Only load weights you actually use
  variable: "--font-poppins",
  display: "swap", // Critical - prevents FOIT
  preload: true, // Preload font for faster rendering
  fallback: ["system-ui", "Arial", "sans-serif"],
});

// Paths that are admin-only, analytics, pixels, and indexing all disabled here
const ADMIN_PATHS = ["/manage-orders", "/colist"];

/* SEO Metadata - Essential Only */
export const metadata = {
  // Served host is www.thebookx.in (the apex 301-redirects to www), so the
  // canonical/OG host must match it to avoid canonicals pointing at a redirect.
  metadataBase: new URL("https://www.thebookx.in"),

  title: {
    default:
      "TheBookX | Buy Books Online in India at the Lowest Prices | Books Starting at ₹1",
    template: "%s | TheBookX",
  },

  description:
    "TheBookX is India's most trusted online bookstore offering 300+ books at the lowest prices. Shop novels, self-help, business, finance, classics with FREE shipping across India. Limited time offer, books starting at just ₹1! Delivered securely via Delhivery & Indian Post.",

  keywords: [
    "buy books online",
    "online bookstore india",
    "cheap books online",
    "TheBookX",
    "books at ₹1",
    "novels online",
    "self help books",
    "best online bookstore",
  ],

  authors: [{ name: "TheBookX" }],
  creator: "TheBookX",
  publisher: "TheBookX",

  // Default to indexable, the page-level layouts for /manage-orders and /colist
  // override this with their own robots: { index: false } metadata.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },

  alternates: {
    canonical: "/",
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },

  openGraph: {
    title: "TheBookX | Books Starting at Just ₹1 | Free Shipping",
    description:
      "Shop 300+ books at the lowest prices, starting at just ₹1. Free shipping across India. Trusted by 50,000+ readers. Limited time ₹1 book sale!",
    url: "https://www.thebookx.in",
    siteName: "TheBookX",
    locale: "en_IN",
    type: "website",
    // Share image is provided by the dynamic app/opengraph-image.js route
    // (a real branded 1200×630 card), replacing the old favicon-as-OG bug.
  },

  twitter: {
    card: "summary_large_image",
    title: "TheBookX | Buy Books Online in India at the Lowest Prices",
    description: "Books starting at just ₹1. Free shipping across India.",
    // Twitter image provided by app/twitter-image.js
  },

  verification: {
    google: "u4Bz9-pLiBEDSAFF2DOuto-U0EuFlseOPGTp5fQPT3w",
  },
};

export default function RootLayout({ children }) {
  // Inline guard string, evaluated at the top of each analytics script
  // so admin paths skip tracking entirely. Kept as a small string so it
  // can be reused in every <Script> block without duplication.
  const ADMIN_GUARD = `
    (function() {
      var p = window.location.pathname || "";
      var admin = ${JSON.stringify(ADMIN_PATHS)};
      for (var i = 0; i < admin.length; i++) {
        if (p === admin[i] || p.indexOf(admin[i] + "/") === 0) return true;
      }
      return false;
    })()
  `;

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="TheBookX" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TheBookX" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preload" as="image" href="/favicon.ico" />

        {/* Organization + WebSite structured data (brand entity for SEO) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://www.thebookx.in/#organization",
                  name: "TheBookX",
                  alternateName: "TheBookX — Online Bookstore India",
                  url: "https://www.thebookx.in",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://www.thebookx.in/intro-image.jpeg",
                  },
                  description:
                    "TheBookX is India's trusted online bookstore offering bestselling books at the lowest prices, starting at ₹1, with free shipping and Cash on Delivery.",
                  contactPoint: {
                    "@type": "ContactPoint",
                    contactType: "customer support",
                    telephone: "+91-7710892108",
                    areaServed: "IN",
                    availableLanguage: ["English", "Hindi"],
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": "https://www.thebookx.in/#website",
                  url: "https://www.thebookx.in",
                  name: "TheBookX",
                  publisher: { "@id": "https://www.thebookx.in/#organization" },
                  inLanguage: "en-IN",
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate:
                        "https://www.thebookx.in/books?q={search_term_string}",
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />

        {/* Google Analytics, skipped on admin paths.
            gtag stub is defined synchronously so events fired before the
            library finishes loading are queued into dataLayer (not dropped). */}
        <Script id="ga-init" strategy="afterInteractive">
          {`
            var GA_PROD_HOSTS = ["thebookx.in", "www.thebookx.in"];
            var GA_IS_PROD = GA_PROD_HOSTS.indexOf(window.location.hostname) !== -1;
            if (!${ADMIN_GUARD} && GA_IS_PROD) {
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', 'G-VZX7GSTR9Z', {
                page_path: window.location.pathname,
                send_page_view: false
              });
              var s = document.createElement('script');
              s.async = true;
              s.src = 'https://www.googletagmanager.com/gtag/js?id=G-VZX7GSTR9Z';
              document.head.appendChild(s);
            }
          `}
        </Script>

        {/* ✅ Meta Pixel Code, skipped on admin paths */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            if (!${ADMIN_GUARD}) {
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1050460933362185');
              fbq('track', 'PageView');
            }
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1050460933362185&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body className={poppins.variable} style={{ width: "100%", margin: "0 auto" }}>
        <ToastProvider>
          <StoreProvider>
            <PLProvider>
              <RegisterSW />
              <GlobalHaptics />
              <AnalyticsTracker />
              <div className="app-shell">{children}</div>
            </PLProvider>
          </StoreProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
