// app/colist/layout.js
import AdminLock from "@/components/AdminLock";

export const metadata = {
  title: "COList",
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

export default function COListLayout({ children }) {
  return <AdminLock pageName="COList">{children}</AdminLock>;
}
