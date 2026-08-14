// app/manage-orders/layout.js
import AdminLock from "@/components/AdminLock";

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
