import { Poppins } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { StoreProvider } from "@/context/StoreContext";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { ToastProvider } from "@/context/ToastContext";
import RegisterSW from "@/components/RegisterSW";
import GlobalHaptics from "@/components/UI/GlobalHaptics";

/* Font */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Only load weights you actually use
  variable: "--font-poppins",
  display: "swap", // Critical - prevents FOIT
  preload: true, // Preload font for faster rendering
  fallback: ["system-ui", "Arial", "sans-serif"],
});

/* SEO Metadata - Essential Only */
export const metadata = {
  metadataBase: new URL("https://thebookx.in"),

  title: {
    default:
      "TheBookX — Buy Books Online at Best Prices in India | ₹1 Book Sale",
    template: "%s | TheBookX",
  },

  description:
    "TheBookX is India's most trusted online bookstore offering 300+ books at unbeatable prices. Shop novels, self-help, business, finance, classics with FREE shipping across India. Limited time offer — books starting at just ₹1! Delivered securely via Delhivery & Indian Post.",

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
    title: "TheBookX — Books Starting at Just ₹1 | Free Shipping",
    description:
      "Shop 300+ books at unbeatable prices. Free shipping across India. Trusted by 50,000+ readers. Limited time ₹1 book sale!",
    url: "https://thebookx.in",
    siteName: "TheBookX",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/favicon.ico",
        width: 1200,
        height: 630,
        alt: "TheBookX — Online Bookstore India",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "TheBookX — Buy Books Online at Best Prices",
    description: "Books starting at just ₹1. Free shipping across India.",
    images: ["/favicon.ico"],
  },

  verification: {
    google: "u4Bz9-pLiBEDSAFF2DOuto-U0EuFlseOPGTp5fQPT3w",
  },
};

export default function RootLayout({ children }) {
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
        <Script
          strategy="lazyOnload" // Changed from afterInteractive to lazyOnload
          src={`https://www.googletagmanager.com/gtag/js?id=G-VZX7GSTR9Z`}
        />
        <Script
          id="ga-init"
          strategy="lazyOnload" // Changed from afterInteractive to lazyOnload
        >
          {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-VZX7GSTR9Z', {
      page_path: window.location.pathname,
      send_page_view: false // Defer page view until page is interactive
    });
  `}
        </Script>
      </head>
      <body className={poppins.variable}>
        <ToastProvider>
          <StoreProvider>
            <RegisterSW />
            <GlobalHaptics />
            <AnalyticsTracker />
            {children}
          </StoreProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
