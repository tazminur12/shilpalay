import Link from 'next/link';
import { Search, MapPin, User, Heart, ShoppingBag, MoreHorizontal } from 'lucide-react';

const Navbar = () => {
  const navLinks = [
    "WOMEN", "MEN", "KIDS", "HOME DÉCOR", "JEWELLERY", 
    "SKIN & HAIR", "GIFTS & CRAFTS", "BRANDS", "WEDDING", "WINTER 25-26"
  ];

  return (
    <nav className="w-full bg-white border-b border-gray-100">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-[88px]">
            {/* Logo Section - Trying to match the black square style */}
            <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="bg-black text-[#e5c100] flex flex-col items-center justify-center w-[88px] h-[88px] p-2">
                    {/* Abstract icon to represent the logo pattern */}
                    <div className="mb-1">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-[#e5c100]">
                            <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z" />
                        </svg>
                    </div>
                    <span className="font-serif text-[10px] font-bold tracking-widest uppercase leading-tight">SHILPALAY</span>
                    <span className="font-serif text-[10px] leading-tight">শিল্পালয়</span>
                </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden xl:flex items-center justify-center flex-1 px-8">
                <div className="flex space-x-6 2xl:space-x-8">
                    {navLinks.map((link) => (
                        <Link 
                            key={link} 
                            href="#" 
                            className="text-gray-800 hover:text-black text-[13px] font-medium tracking-wide whitespace-nowrap uppercase"
                        >
                            {link}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center justify-end space-x-6 ml-4">
                {/* Search Bar */}
                <div className="hidden lg:flex items-center border-b border-gray-400 pb-1 mr-2">
                    <Search className="w-4 h-4 text-gray-600 mr-2" />
                    <input 
                        type="text" 
                        placeholder="Search product" 
                        className="outline-none text-sm text-gray-700 placeholder-gray-500 w-32 focus:w-48 transition-all bg-transparent"
                    />
                </div>

                {/* Currency/Region */}
                <span className="text-sm font-medium text-gray-800 hidden sm:block">BGD</span>

                {/* Icons */}
                <div className="flex items-center space-x-4 sm:space-x-5 text-gray-800">
                    <button className="hover:text-black transition-colors"><MapPin className="w-5 h-5 stroke-[1.5]" /></button>
                    <button className="hover:text-black transition-colors"><User className="w-5 h-5 stroke-[1.5]" /></button>
                    <button className="hover:text-black transition-colors"><Heart className="w-5 h-5 stroke-[1.5]" /></button>
                    <button className="hover:text-black transition-colors"><ShoppingBag className="w-5 h-5 stroke-[1.5]" /></button>
                    <button className="hover:text-black transition-colors"><MoreHorizontal className="w-5 h-5 stroke-[1.5]" /></button>
                </div>
            </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
