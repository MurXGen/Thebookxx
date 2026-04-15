import { Suspense } from "react";
import ViewBagClient from "./ViewBagClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// SEO Metadata for View Bag Page
export const metadata = {
  title: "Order Details | TheBookX - View My Book Order",
  description:
    "View my complete order details including books, delivery address, payment method, and order status. Track my order here.",
  keywords:
    "order details, view order, book order, TheBookX order, order tracking, book delivery status",
  robots: {
    index: false, // Don't index order pages in search engines
    follow: true,
  },
  openGraph: {
    title: "Order Details | TheBookX",
    description: "View your complete order details from TheBookX.",
    type: "website",
    siteName: "TheBookX",
  },
  twitter: {
    card: "summary",
    title: "Order Details | TheBookX",
    description: "View my complete order details.",
  },
  icons: {
    icon: "/view-bag.ico",
    apple: "/view-bag.ico",
  },
};

export default function ViewBagPage() {
  return (
    <>
      <link rel="icon" href="/view-bag.ico" sizes="any" />
      <link rel="apple-touch-icon" href="/view-bag.ico" />
      <meta name="theme-color" content="#000000" />

      <Suspense fallback={<div className="section-1200">Loading bag…</div>}>
        <ViewBagClient />
      </Suspense>
    </>
  );
}
