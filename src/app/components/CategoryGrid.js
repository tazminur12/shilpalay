import Image from 'next/image';
import Link from 'next/link';

const CategoryGrid = () => {
  const categories = [
    { name: 'WOMEN', image: 'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?q=80&w=600&auto=format&fit=crop' },
    { name: 'MEN', image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=600&auto=format&fit=crop' },
    { name: 'KIDS', image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop' },
    { name: 'HOME DECOR', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop' },
    { name: 'JEWELLERY', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop' },
    { name: 'SKIN & HAIR', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop' },
    { name: 'GIFTS & CRAFTS', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop' }, // Reusing home decor image for now
    { name: 'WEDDING', image: 'https://images.unsplash.com/photo-1511285560982-1351cdeb9821?q=80&w=600&auto=format&fit=crop' },
  ];

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link key={cat.name} href="#" className="group block">
              <div className="relative aspect-[3/4] overflow-hidden mb-3">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="text-center text-xs md:text-sm font-medium uppercase tracking-wide text-gray-800 group-hover:text-black">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
