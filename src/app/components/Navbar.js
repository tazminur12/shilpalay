"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown, ChevronRight, MoreVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [navigation, setNavigation] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const { data: session } = useSession();
  const router = useRouter();

  const userMenuRef = useRef(null);
  const moreMenuRef = useRef(null);
  const categoryMenuRef = useRef(null);

  // ১. সেশন চেক
  useEffect(() => {
    console.log("Current Session:", session);
  }, [session]);

  // ২. বাইরে ক্লিক করলে মেনু বন্ধ করা
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setIsMoreMenuOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
        setHoveredCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mobile search input ref
  const mobileSearchRef = useRef(null);
  
  // Mobile search open হলে input focus
  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchRef.current) {
      mobileSearchRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  // ৩. নেভিগেশন হ্যান্ডলার (সংশোধিত)
  const handleNavigation = (path) => {
    setIsUserMenuOpen(false);
    setIsMoreMenuOpen(false);
    setIsMobileMenuOpen(false);
    // নেভিগেশন নিশ্চিত করতে সামান্য ডিলে ব্যবহার করা ভালো
    setTimeout(() => {
      router.push(path);
    }, 10);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setIsUserMenuOpen(false);
    router.push('/');
  };

  // ক্যাটাগরি ফেচিং
  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const response = await fetch('/api/navigation');
        if (response.ok) {
          const data = await response.json();
          setNavigation(data);
        }
      } catch (error) {
        console.error('Error fetching navigation:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchNavigation();
  }, []);

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 font-sans">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-10">
        <div className="flex items-center h-[80px] lg:h-[100px]">
          
          {/* Logo */}
          <div className="flex-shrink-0 mr-8 lg:mr-10">
            <Link href="/">
              <div className="relative w-[60px] h-[50px] lg:w-[80px] lg:h-[90px]">
                <Image src="/logo/logo.png" alt="Logo" fill className="object-contain" priority />
              </div>
            </Link>
          </div>

          <div className="flex-grow flex flex-col justify-center h-full">
            <div className="flex items-center justify-between pb-2">
              <div className="hidden lg:block"></div>

              {/* Desktop: Search Bar and Icons */}
              <div className="hidden md:flex items-center space-x-4 lg:space-x-5 ml-auto">
                <div className="flex items-center border-b border-gray-300 pb-0.5 mr-2">
                  <Search className="w-4 h-4 text-gray-500 mr-2" />
                  <input type="text" placeholder="Search product" className="outline-none text-[12px] w-28 lg:w-40 bg-transparent" />
                </div>

                <div className="flex items-center space-x-4 text-gray-700">
                  {/* User Icon & Dropdown */}
                  <div className="relative" ref={userMenuRef}>
                    <button 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="p-1 focus:outline-none"
                    >
                      <User className="w-5 lg:w-6 h-5 lg:h-6 stroke-[1.5]" />
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-3 w-48 bg-white rounded-md shadow-xl border border-gray-100 py-2 z-[999]">
                        {session ? (
                          <>
                            {(session.user?.role === 'admin' || session.user?.role === 'super_admin') && (
                              <button
                                onClick={() => handleNavigation('/dashboard')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                              >
                                Dashboard
                              </button>
                            )}
                            <button
                              onClick={() => handleNavigation('/my-account')}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                            >
                              My Account
                            </button>
                            <button
                              onClick={handleLogout}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Log Out
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleNavigation('/login')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            Log In / Register
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <Heart className="w-5 lg:w-6 h-5 lg:h-6 cursor-pointer" />
                  <button className="relative">
                    <ShoppingBag className="w-5 lg:w-6 h-5 lg:h-6" />
                    <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">0</span>
                  </button>
                  
                  {/* 3 Dot Menu */}
                  <div className="relative" ref={moreMenuRef}>
                    <button onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} className="p-1 focus:outline-none">
                      <MoreVertical className="w-5 lg:w-6 h-5 lg:h-6 stroke-[1.5]" />
                    </button>
                    {isMoreMenuOpen && (
                      <div className="absolute right-0 mt-3 w-56 bg-white rounded-md shadow-xl border border-gray-100 py-2 z-[999]">
                        <button onClick={() => handleNavigation('/about-us')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">About Us</button>
                        <button onClick={() => handleNavigation('/careers')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">Careers</button>
                        <button onClick={() => handleNavigation('/find-a-store')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">Find a Store</button>
                        <button onClick={() => handleNavigation('/customer-service')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">Customer Service</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Area */}
              <div className="md:hidden flex items-center space-x-3 ml-auto">
                <button onClick={() => setIsMobileSearchOpen(true)} className="p-1">
                  <Search className="w-5 h-5 text-gray-700" />
                </button>
                
                <button onClick={() => handleNavigation('/wishlist')} className="p-1 relative">
                  <Heart className="w-5 h-5 text-gray-700" />
                </button>
                
                <button onClick={() => handleNavigation('/cart')} className="p-1 relative">
                  <ShoppingBag className="w-5 h-5 text-gray-700" />
                  <span className="absolute top-0 right-0 bg-black text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">0</span>
                </button>
                
                {/* Mobile User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="p-1"
                  >
                    <User className="w-5 h-5 text-gray-700" />
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl border border-gray-100 py-2 z-[999]">
                      {session ? (
                        <>
                          {(session.user?.role === 'admin' || session.user?.role === 'super_admin') && (
                            <button
                              onClick={() => handleNavigation('/dashboard')}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                            >
                              Dashboard
                            </button>
                          )}
                          <button
                            onClick={() => handleNavigation('/my-account')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            My Account
                          </button>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Log Out
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleNavigation('/login')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                          Log In / Register
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                <button className="p-2" onClick={() => setIsMobileMenuOpen(true)}>
                  <Menu className="w-6 h-6 text-gray-800" />
                </button>
              </div>
            </div>

            {/* Nav Links with Mega Menu */}
            <nav className="hidden lg:flex items-center space-x-6 mt-1 relative" ref={categoryMenuRef}>
              {loadingCategories ? (
                <div className="text-[15px] text-gray-400 font-normal">Loading...</div>
              ) : (
                navigation.map((category) => (
                  <div
                    key={category._id}
                    className="relative"
                    onMouseEnter={() => setHoveredCategory(category._id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <Link 
                      href={`/category/${category.slug}`}
                      className="text-[15px] hover:text-orange-600 transition-colors tracking-tight whitespace-nowrap"
                    >
                      {category.name}
                    </Link>
                    
                    {/* Mega Menu Dropdown */}
                    {hoveredCategory === category._id && category.sections && category.sections.length > 0 && (
                      <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-md py-4 z-50 min-w-[600px] max-w-[900px]">
                        <div className="grid grid-cols-4 gap-6 px-6">
                          {category.sections.map((section, idx) => (
                            <div key={idx} className="flex flex-col">
                              <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                                {section.title}
                              </h4>
                              <ul className="space-y-2">
                                {section.items && section.items.length > 0 ? (
                                  section.items.map((item, itemIdx) => (
                                    <li key={itemIdx}>
                                      <Link
                                        href={`/category/${category.slug}/${item.slug}`}
                                        className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
                                      >
                                        {item.label}
                                      </Link>
                                    </li>
                                  ))
                                ) : (
                                  <li className="text-sm text-gray-400">No items</li>
                                )}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Search Modal */}
      {isMobileSearchOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[9999] transition-opacity duration-300"
          onClick={() => setIsMobileSearchOpen(false)}
        >
          <div 
            className="bg-white p-4 mx-4 mt-20 rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center border-b border-gray-300 pb-2 mb-3">
              <Search className="w-5 h-5 text-gray-500 mr-3" />
              <input 
                ref={mobileSearchRef}
                type="text" 
                placeholder="Search product" 
                className="flex-1 outline-none text-sm bg-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // Handle search
                    setIsMobileSearchOpen(false);
                  }
                }}
              />
              <button 
                onClick={() => setIsMobileSearchOpen(false)}
                className="ml-2 p-1"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="text-xs text-gray-500 text-center py-2">
              Type and press Enter to search
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[9999] transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="w-[260px] h-full bg-white p-6 transform transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-[10px] tracking-widest text-gray-400 uppercase">Menu</span>
              <X className="w-5 h-5 cursor-pointer text-gray-600" onClick={() => setIsMobileMenuOpen(false)} />
            </div>
            <div className="flex flex-col space-y-2 max-h-[calc(100vh-100px)] overflow-y-auto">
              {loadingCategories ? (
                <div className="text-[13px] text-gray-400 font-normal">Loading...</div>
              ) : (
                navigation.map((category) => (
                  <div key={category._id} className="border-b border-gray-50 pb-2">
                    <div className="flex items-center justify-between">
                      <Link 
                        href={`/category/${category.slug}`} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-[13px] font-normal text-gray-800 uppercase tracking-wide flex-1"
                      >
                        {category.name}
                      </Link>
                      {category.sections && category.sections.length > 0 && (
                        <button
                          onClick={() => {
                            setExpandedCategories(prev => ({
                              ...prev,
                              [category._id]: !prev[category._id]
                            }));
                          }}
                          className="p-1"
                        >
                          {expandedCategories[category._id] ? (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      )}
                    </div>
                    {expandedCategories[category._id] && category.sections && category.sections.length > 0 && (
                      <div className="mt-2 ml-4 space-y-3">
                        {category.sections.map((section, sectionIdx) => (
                          <div key={sectionIdx} className="space-y-1">
                            <div className="text-[12px] font-semibold text-gray-700 uppercase tracking-wide">
                              {section.title}
                            </div>
                            {section.items && section.items.length > 0 && (
                              <ul className="space-y-1 ml-2">
                                {section.items.map((item, itemIdx) => (
                                  <li key={itemIdx}>
                                    <Link
                                      href={`/category/${category.slug}/${item.slug}`}
                                      onClick={() => setIsMobileMenuOpen(false)}
                                      className="text-[12px] text-gray-600 hover:text-orange-600 transition-colors"
                                    >
                                      {item.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;