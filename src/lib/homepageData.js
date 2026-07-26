import connectDB from '@/lib/db';
import Banner from '@/models/Banner';
import Category from '@/models/Category';
import Product from '@/models/Product';

function serialize(docs) {
  return JSON.parse(JSON.stringify(docs));
}

/**
 * Fetch all homepage media/data on the server so images can start
 * loading with the HTML instead of waiting for client waterfalls.
 */
export async function getHomepageData() {
  try {
    await connectDB();

    const [banners, categories, whatsNewProducts] = await Promise.all([
      Banner.find({ status: 'Active' })
        .select('title image link status sortOrder position')
        .sort({ sortOrder: 1, createdAt: -1 })
        .lean(),
      Category.find({
        status: 'Active',
        sortOrder: { $gte: 1, $lte: 8 },
      })
        .select('name slug image sortOrder status')
        .sort({ sortOrder: 1 })
        .lean(),
      Product.find({
        status: 'published',
        'flags.whatsNew': true,
      })
        .select('name slug price images inventory flags')
        .sort({ createdAt: -1 })
        .limit(16)
        .lean(),
    ]);

    return {
      banners: serialize(banners),
      categories: serialize(categories),
      whatsNewProducts: serialize(whatsNewProducts),
    };
  } catch (error) {
    console.error('Failed to load homepage data:', error);
    return {
      banners: [],
      categories: [],
      whatsNewProducts: [],
    };
  }
}

export function filterBannersByPosition(banners, position, limit) {
  const filtered = (banners || [])
    .filter((b) => b.status === 'Active' && b.position === position)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return typeof limit === 'number' ? filtered.slice(0, limit) : filtered;
}
