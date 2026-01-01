"use client";

import Link from 'next/link';
import { Search, User, Heart, ShoppingBag, MoreHorizontal, Menu, X, MapPin, ChevronRight } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navData, setNavData] = useState([]);
  const dropdownRef = useRef(null);

  // ডাটা ফেচ করা
  const fetchNavigation = async () => {
    try {
      const res = await fetch('/api/navigation');
      const data = await res.json();
      setNavData(data);
    } catch (error) {
      console.error('Error fetching navigation:', error);
    }
  };

  useEffect(() => {
    fetchNavigation();
  }, []);

  // ড্রপডাউনের বাইরে ক্লিক করলে বন্ধ হওয়া
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  return (
    <nav className="w-full bg-white border-b border-gray-50 sticky top-0 z-50">
      {/* --- TOP ROW: Logo & Actions --- */}
      <div className="max-w-[1920px] mx-auto px-4 lg:px-10">
        <div className="flex items-center justify-between">
          
          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2 -ml-2" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo Section */}
          <Link href="/" className="flex-shrink-0">
            <div className="bg-black text-[#e5c100] p-2 w-[55px] h-[55px] lg:w-[75px] lg:h-[75px] flex flex-col items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="lg:w-8 lg:h-8 mb-0.5">
                <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z" />
              </svg>
              <span className="text-[7px] lg:text-[9px] font-bold tracking-tighter uppercase leading-none">SHILPALAY</span>
              <span className="text-[7px] lg:text-[9px] leading-none">শিল্পালয়</span>
            </div>
          </Link>

          {/* Right Side Tools */}
          <div className="flex items-center space-x-2 sm:space-x-6">
            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex items-center border-b border-black pb-1 px-1 mr-4">
              <Search className="w-5 h-5 text-black mr-2 stroke-[1.5]" />
              <input 
                type="text" 
                placeholder="Search products" 
                className="outline-none text-[13px] text-gray-700 placeholder-gray-500 w-32 lg:w-48 bg-transparent"
              />
            </div>

            {/* Actions Icons */}
            <div className="flex items-center space-x-3 lg:space-x-5 text-gray-800">
              
              {/* User Account / Login Logic */}
              <div className="relative" ref={dropdownRef}>
                {session ? (
                  <>
                    <button 
                      onClick={toggleDropdown}
                      className="hover:text-black transition-colors focus:outline-none flex items-center"
                    >
                      <User className="w-5 h-5 stroke-[1.2]" />
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-48 bg-white rounded-md shadow-xl py-2 border border-gray-100 z-50">
                        <Link href="/my-account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Account</Link>
                        <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Dashboard</Link>
                        <hr className="my-1 border-gray-100" />
                        <button 
                          onClick={() => signOut()}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link href="/login" className="hover:text-black transition-colors">
                    <User className="w-5 h-5 stroke-[1.2]" />
                  </Link>
                )}
              </div>

              <button className="hidden sm:block"><Heart className="w-5 h-5 stroke-[1.2]" /></button>
              <button className="relative">
                <ShoppingBag className="w-5 h-5 stroke-[1.2]" />
                <span className="absolute -top-1.5 -right-1.5 bg-[#f05a28] text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">0</span>
              </button>
              <button className="hidden sm:block"><MoreHorizontal className="w-5 h-5 stroke-[1.2]" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM ROW: Category Menu (Desktop) --- */}
      <div className="hidden lg:block bg-white max-w-[1920px] mx-auto px-10">
        <div className="flex items-center justify-start space-x-10 h-[40px] pl-[95px]">
          {navData.map((category) => (
            <div key={category._id} className="relative group h-full flex items-center">
              <Link 
                href={`/category/${category.slug}`}
                className="text-[12px] text-gray-900 uppercase tracking-[0.15em] hover:text-[#f05a28] transition-colors border-b-2 border-transparent hover:border-black h-full flex items-center"
              >
                {category.name}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* --- MOBILE SIDEBAR --- */}
      <div 
        className={`fixed inset-0 bg-black/40 z-[100] lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
        onClick={() => setIsMobileMenuOpen(false)} 
      />
      
      <div className={`fixed top-0 left-0 w-[80%] max-w-[300px] h-full bg-white z-[101] shadow-2xl lg:hidden transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-5 border-b">
          <span className="font-bold text-xs tracking-[0.2em]">MENU</span>
          <button onClick={() => setIsMobileMenuOpen(false)}><X className="w-6 h-6" /></button>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-70px)]">
          {navData.map((category) => (
            <Link 
              key={category._id}
              href={`/category/${category.slug}`}
              className="flex items-center justify-between p-4 text-sm font-bold border-b border-gray-50 text-gray-800 uppercase tracking-widest"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {category.name}
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          ))}
          {/* Mobile Extra Links */}
          <div className="p-4 bg-gray-50 space-y-4">
            <Link href="/track-order" className="block text-xs font-medium text-gray-600 uppercase">Track Order</Link>
            <Link href="/stores" className="block text-xs font-medium text-gray-600 uppercase">Our Stores</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;