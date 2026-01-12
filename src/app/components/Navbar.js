"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown, ChevronRight, MoreVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { getCartCount } from '@/lib/cart';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [navigation, setNavigation] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  
  const { data: session } = useSession();
  const router = useRouter();

  const desktopUserMenuRef = useRef(null);
  const mobileUserMenuRef = useRef(null);
  const moreMenuRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const mobileSearchRef = useRef(null);

  // ১. বাইরে ক্লিক করলে মেনু বন্ধ করা
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideDesktop = desktopUserMenuRef.current?.contains(event.target);
      const isClickInsideMobile = mobileUserMenuRef.current?.contains(event.target);
      
      if (!isClickInsideDesktop && !isClickInsideMobile) {
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

  // মোবাইল সার্চ ইনপুট ফোকাস
  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchRef.current) {
      mobileSearchRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  // ২. নেভিগেশন হ্যান্ডলার (ফিক্সড: e.stopPropagation সরানো হয়েছে)
  const closeAllMenus = () => {
    setIsUserMenuOpen(false);
    setIsMoreMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  };

  const handleLogout = async () => {
    closeAllMenus();
    await signOut({ redirect: false });
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

  // Cart count management
  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCartCount());
    };

    // Initial load
    updateCartCount();

    // Listen for cart updates
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
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
                  <div className="relative" ref={desktopUserMenuRef}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsUserMenuOpen(!isUserMenuOpen);
                      }}
                      className="p-1 focus:outline-none"
                    >
                      <User className="w-5 lg:w-6 h-5 lg:h-6 stroke-[1.5]" />
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-3 w-48 bg-white rounded-md shadow-xl border border-gray-100 py-2 z-[999]">
                        {session ? (
                          <>
                            {(session.user?.role === 'admin' || session.user?.role === 'super_admin') && (
                              <Link
                                href="/dashboard"
                                onClick={closeAllMenus}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                              >
                                Dashboard
                              </Link>
                            )}
                            <Link
                              href="/my-account"
                              onClick={closeAllMenus}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                            >
                              My Account
                            </Link>
                            <button
                              type="button"
                              onClick={handleLogout}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Log Out
                            </button>
                          </>
                        ) : (
                          <Link
                            href="/login"
                            onClick={closeAllMenus}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            Log In / Register
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  <Link href="/my-account/wishlist">
                    <Heart className="w-5 lg:w-6 h-5 lg:h-6 cursor-pointer" />
                  </Link>
                  <Link href="/cart" className="relative">
                    <ShoppingBag className="w-5 lg:w-6 h-5 lg:h-6" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </Link>
                  
                  {/* 3 Dot Menu */}
                  <div className="relative" ref={moreMenuRef}>
                    <button onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} className="p-1 focus:outline-none">
                      <MoreVertical className="w-5 lg:w-6 h-5 lg:h-6 stroke-[1.5]" />
                    </button>
                    {isMoreMenuOpen && (
                      <div className="absolute right-0 mt-3 w-56 bg-white rounded-md shadow-xl border border-gray-100 py-2 z-[999]">
                        <Link href="/about-us" onClick={closeAllMenus} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">About Us</Link>
                        <Link href="/careers" onClick={closeAllMenus} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">Careers</Link>
                        <Link href="/find-a-store" onClick={closeAllMenus} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">Find a Store</Link>
                        <Link href="/customer-service" onClick={closeAllMenus} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">Customer Service</Link>
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
                
                <Link href="/my-account/wishlist" className="p-1 relative">
                  <Heart className="w-5 h-5 text-gray-700" />
                </Link>
                
                <Link href="/cart" className="p-1 relative">
                  <ShoppingBag className="w-5 h-5 text-gray-700" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-black text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
                
                <div className="relative" ref={mobileUserMenuRef}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUserMenuOpen(!isUserMenuOpen);
                    }} 
                    className="p-1"
                  >
                    <User className="w-5 h-5 text-gray-700" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl border border-gray-100 py-2 z-[999]">
                      {session ? (
                        <>
                          {(session.user?.role === 'admin' || session.user?.role === 'super_admin') && (
                            <Link href="/dashboard" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-700">Dashboard</Link>
                          )}
                          <Link href="/my-account" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-700">My Account</Link>
                          <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600">Log Out</button>
                        </>
                      ) : (
                        <Link href="/login" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-700">Log In / Register</Link>
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
                    
                    {hoveredCategory === category._id && category.sections && category.sections.length > 0 && (
                      <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-md py-4 z-50 min-w-[600px] max-w-[900px]">
                        <div className="grid grid-cols-4 gap-6 px-6">
                          {category.sections.map((section, idx) => (
                            <div key={idx} className="flex flex-col">
                              <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                                {section.title}
                              </h4>
                              <ul className="space-y-2">
                                {section.items?.map((item, itemIdx) => (
                                  <li key={itemIdx}>
                                    <Link
                                      href={`/category/${category.slug}/${item.slug}`}
                                      className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
                                    >
                                      {item.label}
                                    </Link>
                                  </li>
                                ))}
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
        <div className="fixed inset-0 bg-black/40 z-[9999]" onClick={closeAllMenus}>
          <div className="bg-white p-4 mx-4 mt-20 rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center border-b border-gray-300 pb-2 mb-3">
              <Search className="w-5 h-5 text-gray-500 mr-3" />
              <input ref={mobileSearchRef} type="text" placeholder="Search product" className="flex-1 outline-none text-sm bg-transparent" />
              <button onClick={closeAllMenus} className="ml-2 p-1"><X className="w-5 h-5 text-gray-600" /></button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 z-[9999]" onClick={closeAllMenus}>
          <div className="w-[260px] h-full bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-[10px] tracking-widest text-gray-400 uppercase">Menu</span>
              <X className="w-5 h-5 cursor-pointer text-gray-600" onClick={closeAllMenus} />
            </div>
            <div className="flex flex-col space-y-2 max-h-[calc(100vh-100px)] overflow-y-auto">
              {navigation.map((category) => (
                <div key={category._id} className="border-b border-gray-50 pb-2">
                  <div className="flex items-center justify-between">
                    <Link href={`/category/${category.slug}`} onClick={closeAllMenus} className="text-[13px] font-normal text-gray-800 uppercase tracking-wide flex-1">
                      {category.name}
                    </Link>
                    {category.sections?.length > 0 && (
                      <button onClick={() => setExpandedCategories(p => ({ ...p, [category._id]: !p[category._id] }))} className="p-1">
                        {expandedCategories[category._id] ? <ChevronDown className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />}
                      </button>
                    )}
                  </div>
                  {expandedCategories[category._id] && category.sections?.map((section, sIdx) => (
                    <div key={sIdx} className="mt-2 ml-4 space-y-1">
                      <div className="text-[12px] font-semibold text-gray-700 uppercase">{section.title}</div>
                      {section.items?.map((item, iIdx) => (
                        <Link key={iIdx} href={`/category/${category.slug}/${item.slug}`} onClick={closeAllMenus} className="block text-[12px] text-gray-600 py-1">
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;