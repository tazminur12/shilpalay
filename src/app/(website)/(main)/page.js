import Hero from "../../components/Hero";
import CategoryGrid from "../../components/CategoryGrid";
import FeaturedCollections from "../../components/FeaturedCollections";
import WhatsNewProducts from "../../components/WhatsNewProducts";
import Newsletter from "../../components/Newsletter";
import HomepageBanner from "../../components/HomepageBanner";
import OfferBanner from "../../components/OfferBanner";
import FeaturedBanners from "../../components/FeaturedBanners";
import { getHomepageData, filterBannersByPosition } from "@/lib/homepageData";

// CMS-driven page: always fetch fresh Mongo data on Vercel (local next dev already does).
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const { banners, categories, whatsNewProducts } = await getHomepageData();

  const heroBanners = filterBannersByPosition(banners, 'Homepage Hero');
  const featuredCollections = filterBannersByPosition(banners, 'Featured Collection', 2);
  const homepageBanners = filterBannersByPosition(banners, 'Homepage Banner');
  const offerBanners = filterBannersByPosition(banners, 'Offer Banner');
  const featuredBanners = filterBannersByPosition(banners, 'Featured Banner');

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <Hero banners={heroBanners} />
      <CategoryGrid categories={categories} />
      <FeaturedCollections banners={featuredCollections} />
      <WhatsNewProducts products={whatsNewProducts} />
      <HomepageBanner banners={homepageBanners} />
      <div className="py-2 sm:py-3">
        <OfferBanner banners={offerBanners} />
      </div>

      <FeaturedBanners banners={featuredBanners} />

      <Newsletter />
    </main>
  );
}
