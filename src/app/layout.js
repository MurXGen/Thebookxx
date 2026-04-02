import { Poppins } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { StoreProvider } from "@/context/StoreContext";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { ToastProvider } from "@/context/ToastContext";
import RegisterSW from "@/components/RegisterSW";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

// Simplified metadata - only what's needed for the site
export const metadata = {
  metadataBase: new URL("https://thebookx.in"),
  title: {
    default: "TheBookX — Buy Books Online at Best Prices in India",
    template: "%s",
  },
  description:
    "India's most trusted online bookstore. Shop novels, self-help, business, finance, classics with FREE shipping. Books starting at just ₹1!",
  keywords: [
    "buy books online",
    "online bookstore india",
    "TheBookX",
    "books at ₹1",
    "free shipping",
  ],
  authors: [{ name: "TheBookX" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "TheBookX — Online Bookstore India",
    description: "Books starting at just ₹1. Free shipping across India.",
    url: "https://thebookx.in",
    siteName: "TheBookX",
    locale: "en_IN",
    type: "website",
    images: ["/favicon.ico"],
  },
  twitter: {
    card: "summary_large_image",
    title: "TheBookX — Online Bookstore",
    description: "Books starting at just ₹1. Free shipping.",
    images: ["/favicon.ico"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TheBookX" />

        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-VZX7GSTR9Z"
        />
        <Script strategy="afterInteractive" id="ga-init">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-VZX7GSTR9Z');
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
