import AllBooks from "@/components/AllBooks";
import BestsellerStage from "@/components/BestsellerStage";
import CartBar from "@/components/CartBar";
import CatalogueSection from "@/components/CatalogueSection";
import InstallPWA from "@/components/InstallPWA";
import Navbar from "@/components/Navbar";
import OffersGift from "@/components/OffersGift";
import Offers from "@/components/OffersGift";
import OneRupeeDeals from "@/components/OneRupeeDeals";
import TrendingBooks from "@/components/TrendingBooks";
import LabelDivider from "@/components/UI/LineDivider";
import UrgencyOffer from "@/components/UrgencyOffer";
import { Download } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <BestsellerStage />
      <OffersGift />
      <CatalogueSection />
      <OneRupeeDeals />
      <TrendingBooks />
      {/* <UrgencyOffer /> */}
      <AllBooks />
      <CartBar />
    </>
  );
}
