import Hero from "../../components/Hero";
import CategoryGrid from "../../components/CategoryGrid";
import FeaturedCollections from "../../components/FeaturedCollections";
import WhatsNewProducts from "../../components/WhatsNewProducts";
import Newsletter from "../../components/Newsletter";
import HomepageBanner from "../../components/HomepageBanner";
import OfferBanner from "../../components/OfferBanner";
import FeaturedBanners from "../../components/FeaturedBanners";

export default function Home() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <Hero />
      <div className="py-2 md:py-3">
        <CategoryGrid />
      </div>
      <div className="py-2 md:py-3">
        <FeaturedCollections />
      </div>
      <div className="py-2 md:py-3">
        <WhatsNewProducts />
      </div>
      
      <div className="py-2 md:py-3">
        <HomepageBanner />
      </div>
      
      <div className="py-2 md:py-3">
        <OfferBanner />
      </div>
      
      <FeaturedBanners />
      
      <div className="py-2 md:py-3">
        <Newsletter />
      </div>
    </main>
  );
}
