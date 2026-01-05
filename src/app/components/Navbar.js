"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, User, Heart, ShoppingBag, Menu, X, MapPin, ChevronDown, ChevronRight, MoreVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Swal from 'sweetalert2';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [navigation, setNavigation] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();
  const userMenuRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const moreMenuRef = useRef(null);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Navigation fetch from backend (includes categories, sub-categories, and child categories)
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
        setHoveredCategory(null);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setIsMoreMenuOpen(false);
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

              {/* Search Bar and Icons in same line */}
              <div className="hidden md:flex items-center space-x-4 lg:space-x-5">
                {/* Search Bar */}
                <div className="flex items-center border-b border-gray-300 pb-0.5 mr-2">
                  <Search className="w-4 h-4 text-gray-500 mr-2" />
                  <input 
                    type="text" 
                    placeholder="Search product" 
                    className="outline-none text-[12px] w-28 lg:w-40 bg-transparent placeholder-gray-400 font-normal"
                  />
                </div>

                {/* User, Heart, ShoppingBag Icons */}
                <div className="flex items-center space-x-4 lg:space-x-5 text-gray-700">
                  {/* User Menu with Dropdown */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="cursor-pointer"
                    >
                      <User className="w-5 lg:w-6 h-5 lg:h-6 stroke-[1.5]" />
                    </button>
                    {isUserMenuOpen && (
                      <div 
                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        {session ? (
                          <>
                            {(session.user?.role === 'admin' || session.user?.role === 'super_admin') && (
                              <Link
                                href="/dashboard"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  console.log('Desktop Dashboard mousedown');
                                }}
                                onClick={(e) => {
                                  console.log('Desktop Dashboard clicked');
                                  setIsUserMenuOpen(false);
                                }}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                Dashboard
                              </Link>
                            )}
                            <Link
                              href="/my-account"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                console.log('Desktop My Account mousedown');
                              }}
                              onClick={(e) => {
                                console.log('Desktop My Account clicked');
                                setIsUserMenuOpen(false);
                              }}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              My Account
                            </Link>
                            <button
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.preventDefault();
                                handleLogout();
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              Log Out
                            </button>
                          </>
                        ) : (
                          <Link
                            href="/login"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              console.log('Desktop Login mousedown');
                            }}
                            onClick={(e) => {
                              console.log('Desktop Login clicked');
                              setIsUserMenuOpen(false);
                            }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            Log In
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                  <Heart className="w-5 lg:w-6 h-5 lg:h-6 stroke-[1.5] cursor-pointer" />
                  <button className="relative">
                    <ShoppingBag className="w-5 lg:w-6 h-5 lg:h-6 stroke-[1.5]" />
                    <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] rounded-full w-4 h-4 lg:w-4 lg:h-4 flex items-center justify-center font-normal">0</span>
                  </button>
                  {/* 3 Dot Icon for Desktop with Dropdown */}
                  <div className="relative" ref={moreMenuRef}>
                    <button
                      onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                      className="cursor-pointer"
                    >
                      <MoreVertical className="w-5 lg:w-6 h-5 lg:h-6 stroke-[1.5]" />
                    </button>
                    {isMoreMenuOpen && (
                      <div 
                        className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          href="/about-us"
                          onClick={() => setIsMoreMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          About Us
                        </Link>
                        <Link
                          href="/careers"
                          onClick={() => setIsMoreMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Careers
                        </Link>
                        <Link
                          href="/find-a-store"
                          onClick={() => setIsMoreMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Find a Store
                        </Link>
                        <Link
                          href="/customer-service"
                          onClick={() => setIsMoreMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Customer Service
                        </Link>
                        <Link
                          href="/my-shilpalay-rewards"
                          onClick={() => setIsMoreMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          My Shilpalay Rewards
                        </Link>
                        <Link
                          href="/lookbook"
                          onClick={() => setIsMoreMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Lookbook
                        </Link>
                        <Link
                          href="/photos-videos"
                          onClick={() => setIsMoreMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Photos & Videos
                        </Link>
                        <Link
                          href="/latest-offers"
                          onClick={() => setIsMoreMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Latest Offers
                        </Link>
                        <Link
                          href="/news-events"
                          onClick={() => setIsMoreMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          News & Events
                        </Link>
                        <Link
                          href="/stories"
                          onClick={() => setIsMoreMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Stories
                        </Link>
                        <Link
                          href="/terms-conditions"
                          onClick={() => setIsMoreMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Terms & Conditions
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* নিচের সারি: মূল মেনু */}
            <div className="hidden lg:flex items-center space-x-6 mt-1 relative" ref={categoryMenuRef}>
              {loadingCategories ? (
                <div className="text-[15px] text-gray-400 font-normal">Loading...</div>
              ) : (
                navigation.map((category) => (
                  <div
                    key={category.slug}
                    className="relative"
                    onMouseEnter={() => setHoveredCategory(category._id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <Link 
                      href={`/category/${category.slug}`}
                      className="text-[16px] font-normal text-gray-800 hover:text-orange-600 transition-colors tracking-tight whitespace-nowrap"
                    >
                      {category.name}
                    </Link>
                    
                    {/* Hover Dropdown Menu */}
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
                                        href={`/category/${item.slug}`}
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
            </div>
          </div>

          {/* Mobile Search Bar, Icons and Menu Button */}
          <div className="flex items-center space-x-3 ml-auto">
            {/* Mobile Search Bar */}
            <div className="md:hidden flex items-center border-b border-gray-300 pb-0.5">
              <Search className="w-4 h-4 text-gray-500 mr-2" />
              <input 
                type="text" 
                placeholder="Search product" 
                className="outline-none text-[12px] w-24 bg-transparent placeholder-gray-400 font-normal"
              />
            </div>
            
            {/* Mobile Icons - User, Heart, ShoppingBag */}
            <div className="md:hidden flex items-center space-x-3 text-gray-700">
              {/* User Menu with Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="cursor-pointer"
                >
                  <User className="w-5 h-5 stroke-[1.5]" />
                </button>
                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {session ? (
                      <>
                        {(session.user?.role === 'admin' || session.user?.role === 'super_admin') && (
                          <Link
                            href="/dashboard"
                            onClick={() => {
                              console.log('Mobile Dashboard clicked');
                              setIsUserMenuOpen(false);
                            }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            Dashboard
                          </Link>
                        )}
                        <Link
                          href="/my-account"
                          onClick={() => {
                            console.log('Mobile My Account clicked');
                            setIsUserMenuOpen(false);
                          }}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          My Account
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleLogout();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Log Out
                        </button>
                      </>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => {
                          console.log('Mobile Login clicked');
                          setIsUserMenuOpen(false);
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Log In
                      </Link>
                    )}
                  </div>
                )}
              </div>
              <Heart className="w-5 h-5 stroke-[1.5] cursor-pointer" />
              <button className="relative">
                <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center font-normal">0</span>
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6 text-gray-800" />
            </button>
          </div>
        </div>
      </div>

      {/* মোবাইল সাইডবার মেনু */}
      <div className={`fixed inset-0 bg-black/40 z-[100] transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsMobileMenuOpen(false)}>
        <div className={`w-[260px] h-full bg-white p-6 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-8">
            <span className="font-bold text-[10px] tracking-widest text-gray-400 uppercase">Menu</span>
            <X className="w-5 h-5 cursor-pointer text-gray-600" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
          <div className="flex flex-col space-y-2 max-h-[calc(100vh-100px)] overflow-y-auto">
            {loadingCategories ? (
              <div className="text-[13px] text-gray-400 font-normal">Loading...</div>
            ) : (
              navigation.map(cat => (
                <div key={cat.slug} className="border-b border-gray-50 pb-2">
                  <div className="flex items-center justify-between">
                    <Link 
                      href={`/category/${cat.slug}`} 
                      className="text-[13px] font-normal text-gray-800 uppercase tracking-wide flex-1"
                    >
                      {cat.name}
                    </Link>
                    {cat.sections && cat.sections.length > 0 && (
                      <button
                        onClick={() => toggleCategory(cat._id)}
                        className="p-1"
                      >
                        {expandedCategories[cat._id] ? (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    )}
                  </div>
                  {expandedCategories[cat._id] && cat.sections && cat.sections.length > 0 && (
                    <div className="mt-2 ml-4 space-y-3">
                      {cat.sections.map((section, sectionIdx) => (
                        <div key={sectionIdx} className="space-y-1">
                          <div className="text-[12px] font-semibold text-gray-700 uppercase tracking-wide">
                            {section.title}
                          </div>
                          {section.items && section.items.length > 0 && (
                            <ul className="space-y-1 ml-2">
                              {section.items.map((item, itemIdx) => (
                                <li key={itemIdx}>
                                  <Link
                                    href={`/category/${item.slug}`}
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
    </nav>
  );
};

export default Navbar;