import { Poppins } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { StoreProvider } from "@/context/StoreContext";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { ToastProvider } from "@/context/ToastContext";

/* Font */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

/* SEO Metadata */
export const metadata = {
  metadataBase: new URL("https://thebookx.in"), // 🔴 replace with your real domain

  title: {
    default: "TheBookX — Buy Books Online at Best Prices in India",
    template: "%s | TheBookX",
  },

  description:
    "TheBookX is an affordable online bookstore in India. Discover novels, self-help, business, finance, classics and trending books at the best prices.",

  keywords: [
    "buy books online",
    "online bookstore india",
    "cheap books online",
    "novels",
    "self help books",
    "business books",
    "finance books",
    "classic books",
    "trending books",
    "TheBookX",
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
    icon: "/favicon.png", // or "/favicon.png"
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },

  themeColor: "#ffb703",

  openGraph: {
    title: "TheBookX — Affordable Online Bookstore",
    description:
      "Buy novels, self-help, business, finance and classic books online at TheBookX. Curated reads, honest pricing, made for readers.",
    url: "https://thebookx.in",
    siteName: "TheBookX",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/favicon.png",
        width: 512,
        height: 512,
        alt: "TheBookX Logo",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "TheBookX — Buy Books Online",
    description:
      "Affordable online bookstore for novels, self-help, business & classic books.",
    images: ["/favicon.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
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
            <AnalyticsTracker />
            {children}
          </StoreProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
