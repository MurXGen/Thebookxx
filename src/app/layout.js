import { Poppins } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { StoreProvider } from "@/context/StoreContext";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { ToastProvider } from "@/context/ToastContext";
import RegisterSW from "@/components/RegisterSW";

/* Font */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

/* SEO Metadata - Enhanced for Maximum Visibility */
export const metadata = {
  metadataBase: new URL("https://thebookx.in"),

  title: {
    default:
      "TheBookX — Buy Books Online at Best Prices in India | ₹1 Book Sale - Price Drop",
    template: "%s | TheBookX — India's Most Trusted Online Bookstore",
    absolute:
      "TheBookX — India's Largest Online Bookstore | Best Prices Guaranteed",
  },

  description:
    "TheBookX is India's most trusted online bookstore offering 300+ books at unbeatable prices. Shop novels, self-help, business, finance, classics, and trending books with FREE shipping across India. Limited time offer — books starting at just ₹1! Delivered securely via Delhivery & Indian Post.",

  keywords: [
    "buy books online",
    "online bookstore india",
    "cheap books online india",
    "best online bookstore",
    "TheBookX",
    "books at ₹1",
    "affordable books",
    "novels online",
    "self help books india",
    "business books",
    "finance books",
    "classic books",
    "trending books",
    "fiction books",
    "romance novels",
    "thriller books",
    "mythology books",
    "manga books",
    "hindi books",
    "book store near me",
    "buy books with free shipping",
    "best book deals india",
    "discounted books online",
    "new release books",
    "bestseller books india",
    "academic books",
    "competitive exam books",
    "children books",
    "gift books",
    "TheBookX reviews",
    "trusted online bookstore",
  ],

  authors: [{ name: "TheBookX", url: "https://thebookx.in/terms" }],
  creator: "TheBookX",
  publisher: "TheBookX",
  manifest: "/manifest.json",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/",
      "hi-IN": "/hi",
    },
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.ico", type: "image/png", sizes: "192x192" },
      { url: "/favicon.ico", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/favicon.ico", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#ffb703",
      },
    ],
  },

  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffb703" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],

  colorScheme: "light dark",

  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: true,
  },

  openGraph: {
    title:
      "TheBookX — India's Largest Online Bookstore | Books Starting at Just ₹1",
    description:
      "Shop 300+ books at unbeatable prices! Free shipping across India. Buy novels, self-help, business, finance, classics & more. Trusted by 50,000+ readers. Limited time ₹1 book sale!",
    url: "https://thebookx.in",
    siteName: "TheBookX",
    locale: "en_IN",
    alternateLocale: ["hi_IN", "ta_IN", "te_IN"],
    type: "website",
    images: [
      {
        url: "/favicon.ico",
        width: 1200,
        height: 630,
        alt: "TheBookX — India's Most Trusted Online Bookstore",
        type: "image/jpeg",
      },
      {
        url: "/favicon.ico",
        width: 1200,
        height: 630,
        alt: "TheBookX — Books Starting at ₹1",
      },
    ],
    emails: ["murthyofficial3@gmail.com"],
    phoneNumbers: ["+91-7977960242"],
    countryName: "India",
  },

  twitter: {
    card: "summary_large_image",
    site: "@TheBookX",
    siteId: "1234567890", // Replace with your Twitter site ID
    creator: "@TheBookX",
    creatorId: "1234567890", // Replace with your Twitter creator ID
    title: "TheBookX — Buy Books Online at Best Prices in India | ₹1 Book Sale",
    description:
      "India's most trusted online bookstore. 5000+ books, FREE shipping, books starting at ₹1. Shop novels, self-help, business & more!",
    images: [
      {
        url: "/twitter-image.jpg",
        alt: "TheBookX — Best Online Bookstore India",
        width: 1200,
        height: 600,
      },
    ],
  },

  // Additional verification tags
  verification: {
    google: "u4Bz9-pLiBEDSAFF2DOuto-U0EuFlseOPGTp5fQPT3w", // 🔴 Replace with your Google Search Console code
  },

  // Apple specific
  appleWebApp: {
    title: "TheBookX",
    statusBarStyle: "black-translucent",
    capable: true,
  },

  // App links for mobile apps (if you have mobile apps)
  appLinks: {
    web: {
      url: "https://thebookx.in",
      should_fallback: true,
    },
  },

  // Archive and other metadata
  archives: ["https://thebookx.in/"],
  assets: ["https://thebookx.in/"],

  // Category for the website
  category: "E-commerce",

  // Other important metadata
  other: {
    "geo.region": "IN",
    "geo.placename": "Mumbai",
    "geo.position": "19.0760;72.8777",
    ICBM: "19.0760, 72.8777",
    distribution: "Global",
    rating: "General",
    "revisit-after": "1 day",
    copyright: `© ${new Date().getFullYear()} TheBookX. All rights reserved.`,
    "document-classification": "Online Bookstore",
    owner: "TheBookX",
    organization: "TheBookX",
    contact: "+91-7977960242",
    target_country: "IN",
    language: "EN",
  },
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="TheBookX" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TheBookX" />
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-VZX7GSTR9Z`}
        />
        <Script strategy="afterInteractive" id="ga-init">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-VZX7GSTR9Z', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>
      <body className={poppins.variable}>
        <ToastProvider>
          <StoreProvider>
            <RegisterSW />
            <AnalyticsTracker />
            {children}
          </StoreProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
