import AllBooks from "@/components/AllBooks";
import BestsellerStage from "@/components/BestsellerStage";
import CartBar from "@/components/CartBar";
import CatalogueSection from "@/components/CatalogueSection";
import InstallPWA from "@/components/InstallPWA";
import Navbar from "@/components/Navbar";
import OffersGift from "@/components/OffersGift";
import Offers from "@/components/OffersGift";
import OneRupeeDeals from "@/components/OneRupeeDeals";
import RecentlyViewed from "@/components/RecentlyViewed";
import RecommendationModal from "@/components/RecommendationModal";
import TrendingBooks from "@/components/TrendingBooks";
import LabelDivider from "@/components/UI/LineDivider";
import UrgencyOffer from "@/components/UrgencyOffer";
import PincodeModal from "@/components/UI/PincodeModal";
import { Download } from "lucide-react";
import NewlyAddedBooks from "@/components/NewlyAddedBooks";
import IntroVideo from "@/components/IntroVideo";

export default function HomePage() {
  return (
    <>
      <IntroVideo />
      <Navbar />
      <PincodeModal /> {/* Add this component */}
      <BestsellerStage />
      <RecommendationModal />
      {/* <OffersGift /> */}
      <CatalogueSection />
      <OneRupeeDeals />
      <RecentlyViewed />
      <NewlyAddedBooks />
      <TrendingBooks />
      {/* <UrgencyOffer /> */}
      <AllBooks />
      <CartBar />
    </>
  );
}
