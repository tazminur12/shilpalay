import Image from 'next/image';

const FeaturedCollections = () => {
  return (
    <section className="py-8 bg-white">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
          {/* Collection 1 */}
          <div className="relative aspect-[16/9] group overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop"
              alt="Terracotta muse"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-md">Terracotta muse</h3>
              <p className="text-sm uppercase tracking-wider mb-6 drop-shadow-md">Explore living</p>
              <button className="bg-transparent border border-white text-white px-6 py-2 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
                Shop Now
              </button>
            </div>
          </div>

          {/* Collection 2 */}
          <div className="relative aspect-[16/9] group overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1574672280602-95cb1228718c?q=80&w=1200&auto=format&fit=crop"
              alt="Tales in taupe"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-md">Tales in taupe</h3>
              <p className="text-sm uppercase tracking-wider mb-6 drop-shadow-md">Explore dining</p>
              <button className="bg-transparent border border-white text-white px-6 py-2 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
