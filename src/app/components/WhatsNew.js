import Image from 'next/image';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const WhatsNew = () => {
  const products = [
    { id: 1, name: 'Yellow Ethnic Vest', image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?q=80&w=400&auto=format&fit=crop' },
    { id: 2, name: 'Blue Printed Shirt', image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?q=80&w=400&auto=format&fit=crop' }, // Reusing for placeholder
    { id: 3, name: 'Checkered Shirt', image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?q=80&w=400&auto=format&fit=crop' }, // Reusing
    { id: 4, name: 'Purple Shawl', image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?q=80&w=400&auto=format&fit=crop' }, // Reusing
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
        <h2 className="text-2xl font-bold text-center mb-10 uppercase tracking-wide">What's New</h2>
        
        <div className="relative px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((product) => (
                    <div key={product.id} className="group relative">
                        <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative">
                            {/* In a real app, different images would be used. Using gray placeholder with icon if image fails or generic */}
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                {/* Placeholder since I don't have distinct product images ready, using a generic pattern */}
                                <Image 
                                    src={`https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=400&auto=format&fit=crop&random=${product.id}`}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            
                            {/* Plus button overlay */}
                            <button className="absolute bottom-4 left-4 w-8 h-8 bg-gray-500/50 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

             {/* Navigation Arrows */}
            <button className="absolute left-0 top-1/2 -translate-y-1/2 p-1 hover:text-black text-gray-400 transition-colors">
                <ChevronLeft className="w-8 h-8 stroke-[1.5]" />
            </button>
            <button className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:text-black text-gray-400 transition-colors">
                <ChevronRight className="w-8 h-8 stroke-[1.5]" />
            </button>
        </div>

        <div className="flex justify-center mt-10">
            <button className="bg-black text-white px-8 py-3 text-xs tracking-widest uppercase font-medium hover:bg-gray-800 transition-colors">
                View More
            </button>
        </div>
      </div>
    </section>
  );
};

export default WhatsNew;
