import AllBooks from "@/components/AllBooks";
import CartBar from "@/components/CartBar";
import CatalogueSection from "@/components/CatalogueSection";
import Navbar from "@/components/Navbar";
import OffersGift from "@/components/OffersGift";
import Offers from "@/components/OffersGift";
import TrendingBooks from "@/components/TrendingBooks";
import LabelDivider from "@/components/UI/LineDivider";
import UrgencyOffer from "@/components/UrgencyOffer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <OffersGift />
      <CatalogueSection />
      <TrendingBooks />

      <UrgencyOffer />
      <AllBooks />
      <CartBar />
    </>
  );
}
