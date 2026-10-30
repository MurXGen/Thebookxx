// app/manage-orders/layout.js
import AdminLock from "@/components/AdminLock";
// Monochrome design layer. Scoped to `.my-orders-page.mo-glass`, so it only
// ever applies inside this route — the storefront is untouched. The generated
// mono sheet remaps globals.css literals; the hand-written UI sheet loads last.
import "./manage-orders-mono.css";
import "./manage-orders-ui.css";

export const metadata = {
  title: "Manage Orders",
  // This is the primary noindex signal, Next.js will emit
  // <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "none",
      "max-snippet": -1,
    },
  },
};

export default function ManageOrdersLayout({ children }) {
  return <AdminLock pageName="Manage Orders">{children}</AdminLock>;
}
