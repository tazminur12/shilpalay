"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, User, Heart, ShoppingBag, MoreHorizontal, Menu, X, MapPin } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();
  const userMenuRef = useRef(null);

 

  // Categories fetch from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          // Filter only active categories and keep full objects with name and slug
          const activeCategories = data
            .filter(cat => cat.status === 'Active')
            .map(cat => ({ name: cat.name, slug: cat.slug }));
          setCategories(activeCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setIsUserMenuOpen(false);
    router.push('/');
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 font-sans">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-10">
        {/* Navbar Height কমিয়ে ৮০পিএক্স (মোবাইল) এবং ১০০পিএক্স (ডেস্কটপ) করা হয়েছে */}
        <div className="flex items-center h-[80px] lg:h-[100px]">
          
          {/* ১. লোগো সেকশন - উচ্চতা কমিয়ে ছোট করা হয়েছে */}
          <div className="flex-shrink-0 mr-8 lg:mr-10">
            <Link href="/">
              <div className="relative w-[60px] h-[50px] lg:w-[80px] lg:h-[90px]">
                <Image
                  src="/logo/logo.png"
                  alt="Shilpalay Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* ২. মেনু এরিয়া */}
          <div className="flex-grow flex flex-col justify-center h-full pt-1">
            
            {/* ওপরের সারি: Brands & Action Icons */}
            <div className="flex items-center justify-between pb-2 lg:pb-3">
              <div className="hidden lg:flex items-center space-x-8 font-normal">
              </div>

              {/* রাইট সাইড টুলস (Search, User, Cart) */}
              <div className="flex items-center space-x-3 lg:space-x-5">
                <div className="hidden md:flex items-center border-b border-gray-300 pb-0.5 mr-2">
                  <Search className="w-4 h-4 text-gray-500 mr-2" />
                  <input 
                    type="text" 
                    placeholder="Search product" 
                    className="outline-none text-[12px] w-28 lg:w-40 bg-transparent placeholder-gray-400 font-normal"
                  />
                </div>
                <div className="flex items-center space-x-3 lg:space-x-4 text-gray-700">
                  <div className="hidden sm:flex items-center text-[11px] font-normal space-x-1 cursor-pointer">
                  </div>
                  {/* User Menu with Dropdown */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="cursor-pointer"
                    >
                      <User className="w-4 lg:w-5 h-4 lg:h-5 stroke-[1.5]" />
                    </button>
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                        {session ? (
                          <>
                            <Link
                              href="/my-account"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              My Account
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              Log Out
                            </button>
                          </>
                        ) : (
                          <Link
                            href="/login"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            Log In
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                  <Heart className="w-4 lg:w-5 h-4 lg:h-5 stroke-[1.5] cursor-pointer" />
                  <button className="relative">
                    <ShoppingBag className="w-4 lg:w-5 h-4 lg:h-5 stroke-[1.5]" />
                    <span className="absolute -top-1 -right-1 bg-black text-white text-[7px] rounded-full w-3 h-3 lg:w-3.5 lg:h-3.5 flex items-center justify-center font-normal">0</span>
                  </button>
                  <MoreHorizontal className="w-4 lg:w-5 h-4 lg:h-5 stroke-[1.5] cursor-pointer" />
                </div>
              </div>
            </div>

            {/* নিচের সারি: মূল মেনু */}
            <div className="hidden lg:flex items-center space-x-6 mt-1">
              {loadingCategories ? (
                <div className="text-[15px] text-gray-400 font-normal">Loading...</div>
              ) : (
                categories.map((item) => (
                  <Link 
                    key={item.slug} 
                    href={`/category/${item.slug}`}
                    className="text-[16px] font-normal text-gray-800 hover:text-orange-600 transition-colors tracking-tight whitespace-nowrap"
                  >
                    {item.name}
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* মোবাইল মেনু বাটন */}
          <button className="lg:hidden ml-auto p-2" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6 text-gray-800" />
          </button>
        </div>
      </div>

      {/* মোবাইল সাইডবার মেনু */}
      <div className={`fixed inset-0 bg-black/40 z-[100] transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsMobileMenuOpen(false)}>
        <div className={`w-[260px] h-full bg-white p-6 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-8">
            <span className="font-bold text-[10px] tracking-widest text-gray-400 uppercase">Menu</span>
            <X className="w-5 h-5 cursor-pointer text-gray-600" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
          <div className="flex flex-col space-y-5">
            {loadingCategories ? (
              <div className="text-[13px] text-gray-400 font-normal">Loading...</div>
            ) : (
              categories.map(cat => (
                <Link key={cat.slug} href={`/category/${cat.slug}`} className="text-[13px] font-normal text-gray-800 uppercase tracking-wide border-b border-gray-50 pb-2">
                  {cat.name}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;