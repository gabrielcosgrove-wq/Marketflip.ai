import { Hero } from "@/components/home/hero";
import { TrendingDeals } from "@/components/home/trending-deals";
import { Categories } from "@/components/home/categories";
import { HowItWorks } from "@/components/home/how-it-works";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrendingDeals />
      <Categories />
      <HowItWorks />
    </>
  );
}
