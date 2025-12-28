import Hero from "../components/Hero";
import CategoryGrid from "../components/CategoryGrid";
import FeaturedCollections from "../components/FeaturedCollections";
import WhatsNew from "../components/WhatsNew";
import Newsletter from "../components/Newsletter";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <CategoryGrid />
      <FeaturedCollections />
      <WhatsNew />
      
      {/* Additional Banners similar to design */}
      <section className="relative w-full aspect-[21/9] md:aspect-[21/7] overflow-hidden group">
         <Image 
            src="https://images.unsplash.com/photo-1550614000-4b9519e09d96?q=80&w=2000&auto=format&fit=crop"
            alt="Taaga Winter"
            fill
            className="object-cover"
         />
         <div className="absolute inset-0 bg-black/10"></div>
         <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">TAAGA</h2>
            <p className="text-xl md:text-2xl mb-8 drop-shadow-md">Winter 23/24</p>
            <button className="bg-white text-black px-10 py-3 text-sm uppercase tracking-widest font-bold hover:bg-gray-200 transition-colors">
                Shop Now
            </button>
         </div>
      </section>

      {/* Promo Section */}
      <section className="bg-[#f05a28] text-white">
        <div className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-2">
            <div className="p-12 flex flex-col justify-center items-center md:items-start text-center md:text-left bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                <h3 className="text-xl tracking-widest uppercase mb-2">Winter</h3>
                <h2 className="text-5xl md:text-7xl font-black uppercase mb-4 text-black">Special</h2>
                <div className="bg-black text-white px-6 py-2 text-xl font-bold uppercase mb-4">Dec 1 - 20</div>
                <p className="tracking-wider text-sm uppercase">At all Shilpalay outlets only</p>
            </div>
            <div className="bg-white text-[#f05a28] p-12 flex flex-col justify-center items-center text-center border-4 border-[#f05a28] m-4">
                <p className="text-xl uppercase tracking-widest mb-2 text-black">Get a</p>
                <h2 className="text-6xl md:text-8xl font-black mb-2">500<span className="text-4xl align-top">TK.</span></h2>
                <h3 className="text-2xl md:text-3xl font-bold uppercase mb-4 text-black">Discount Voucher*</h3>
                <p className="text-sm uppercase tracking-wider font-bold text-[#f05a28]">On purchases of Tk. 5000 and above*</p>
            </div>
        </div>
      </section>

      {/* Jewellery Highlight */}
      <section className="grid grid-cols-1 md:grid-cols-2">
         <div className="relative aspect-square md:aspect-[4/3] group overflow-hidden">
            <Image 
                src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1200&auto=format&fit=crop"
                alt="Gleam on"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
             <div className="absolute inset-0 bg-black/20"></div>
             <div className="absolute bottom-12 left-0 right-0 text-center text-white">
                <h3 className="text-3xl font-serif mb-2">Gleam on</h3>
                <p className="text-sm uppercase tracking-wider mb-6">Explore jewellery</p>
                <button className="bg-black text-white px-6 py-2 text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors">
                    Shop Now
                </button>
             </div>
         </div>
         <div className="relative aspect-square md:aspect-[4/3] group overflow-hidden">
            <Image 
                src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop"
                alt="Golden glam"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-12 left-0 right-0 text-center text-white">
                <h3 className="text-3xl font-serif mb-2">Golden glam</h3>
                <p className="text-sm uppercase tracking-wider mb-6">Explore accessories</p>
                <button className="bg-black text-white px-6 py-2 text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors">
                    Shop Now
                </button>
             </div>
         </div>
      </section>

      <Newsletter />
    </main>
  );
}
