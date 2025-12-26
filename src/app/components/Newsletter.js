import { Mail } from 'lucide-react';

const Newsletter = () => {
  return (
    <section className="bg-[#f5f5f5] py-10 border-t border-gray-200">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 lg:gap-16">
            
            {/* Left Side: Title & Description */}
            <div className="flex flex-col gap-2 max-w-md">
                <div className="flex items-center gap-3 mb-1">
                    <Mail className="w-6 h-6 text-black stroke-[1.5]" />
                    <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wide text-black">Stay Tuned</h3>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                    Don't miss the opportunity to get daily updates on all that's new at Shilpalay.
                </p>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-auto flex-1 max-w-3xl">
                <div className="flex flex-col gap-4">
                    {/* Inputs & Button Row */}
                    <div className="flex flex-col sm:flex-row gap-0 w-full">
                        <input 
                            type="email" 
                            placeholder="Enter Email Address" 
                            className="bg-white/50 border border-gray-300 border-r-0 sm:border-r-0 py-3 px-4 text-sm outline-none focus:bg-white focus:border-gray-400 transition-all w-full sm:flex-1 placeholder:text-gray-400"
                        />
                        <input 
                            type="tel" 
                            placeholder="Enter Mobile Number" 
                            className="bg-white/50 border border-gray-300 py-3 px-4 text-sm outline-none focus:bg-white focus:border-gray-400 transition-all w-full sm:flex-1 placeholder:text-gray-400"
                        />
                        <button className="bg-black text-white px-8 py-3 text-sm uppercase tracking-wider font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap mt-4 sm:mt-0">
                            Subscribe
                        </button>
                    </div>

                    {/* Radio Buttons */}
                    <div className="flex flex-wrap items-center gap-6 mt-1">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                                <input type="radio" name="region" defaultChecked className="peer appearance-none w-4 h-4 border-2 border-black rounded-full checked:bg-black checked:border-black transition-all" />
                                <div className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                            </div>
                            <span className="text-xs font-medium text-gray-700 group-hover:text-black transition-colors">I live in Bangladesh</span>
                        </label>
                        
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                                <input type="radio" name="region" className="peer appearance-none w-4 h-4 border-2 border-gray-400 rounded-full checked:bg-black checked:border-black transition-all" />
                                <div className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                            </div>
                            <span className="text-xs font-medium text-gray-700 group-hover:text-black transition-colors">I live outside Bangladesh</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
