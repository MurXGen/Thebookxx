import AllBooks from "@/components/AllBooks";
import BestsellerStage from "@/components/BestsellerStage";
import CartBar from "@/components/CartBar";
import CatalogueSection from "@/components/CatalogueSection";
import Navbar from "@/components/Navbar";
import OffersGift from "@/components/OffersGift";
import Offers from "@/components/OffersGift";
import OneRupeeDeals from "@/components/OneRupeeDeals";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import TrendingBooks from "@/components/TrendingBooks";
import LabelDivider from "@/components/UI/LineDivider";
import UrgencyOffer from "@/components/UrgencyOffer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <BestsellerStage />
      <OffersGift />
      <CatalogueSection />
      <OneRupeeDeals />
      <TrendingBooks />
      <PWAInstallBanner />
      {/* <UrgencyOffer /> */}
      <AllBooks />
      <CartBar />
    </>
  );
}
