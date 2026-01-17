import { Poppins } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";

/* Load Poppins correctly */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

/* SEO Metadata */
export const metadata = {
  title: {
    default: "TheBookX | Buy Books Online at Best Prices",
    template: "%s | TheBookX",
  },
  description:
    "TheBookX is an online bookstore offering novels, self-help, business, investment, romance, thriller, children's stories, and classic books at the lowest and most reasonable prices.",
  keywords: [
    "buy books online",
    "online bookstore india",
    "novels",
    "self help books",
    "business books",
    "investment books",
    "romance books",
    "thriller books",
    "children story books",
    "classic novels",
    "cheap books online",
    "TheBookX",
  ],
  authors: [{ name: "TheBookX" }],
  creator: "TheBookX",
  publisher: "TheBookX",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "TheBookX | Affordable Online Bookstore",
    description:
      "Shop novels, self-help, business, investment, romance, thriller, children's stories and classic books at TheBookX — affordable prices, curated reads.",
    siteName: "TheBookX",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.variable}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
