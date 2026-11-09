// Shared shell for the policy & company pages (/about-us, /contact-us,
// /privacy, /terms, /refund, /shipping). The "(legal)" route group does not
// change any URL; it only gives these pages the site navbar.
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function LegalLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <MobileBottomNav />
    </>
  );
}
