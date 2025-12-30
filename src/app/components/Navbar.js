"use client";

import Link from 'next/link';
import { Search, User, Heart, ShoppingBag, MoreHorizontal, ChevronDown } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [navData, setNavData] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const dropdownRef = useRef(null);

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

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="w-full bg-white border-b border-gray-100 relative z-50">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-[88px]">
            {/* Logo Section */}
            <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="bg-black text-[#e5c100] flex flex-col items-center justify-center w-[88px] h-[88px] p-2">
                    <div className="mb-1">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-[#e5c100]">
                            <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z" />
                        </svg>
                    </div>
                    <span className="font-serif text-[10px] font-bold tracking-widest uppercase leading-tight">SHILPALAY</span>
                    <span className="font-serif text-[10px] leading-tight">শিল্পালয়</span>
                </Link>
            </div>

            {/* Navigation Links with Mega Menu */}
            <div className="hidden xl:flex items-center justify-center flex-1 px-8 h-full">
                <div className="flex h-full">
                    {navData.map((category) => (
                        <div 
                            key={category._id} 
                            className="relative group h-full flex items-center"
                            onMouseEnter={() => setHoveredCategory(category.name)}
                            onMouseLeave={() => setHoveredCategory(null)}
                        >
                            <Link 
                                href={`/category/${category.slug}`}
                                className={`text-gray-800 hover:text-[#e5c100] px-4 2xl:px-5 text-[13px] font-medium tracking-wide whitespace-nowrap uppercase h-full flex items-center border-b-2 border-transparent hover:border-[#e5c100] transition-colors ${hoveredCategory === category.name ? 'text-[#e5c100] border-[#e5c100]' : ''}`}
                            >
                                {category.name}
                            </Link>

                            {/* Mega Menu */}
                            {category.sections && category.sections.length > 0 && (
                                <div className="absolute top-[88px] left-0 w-[80vw] max-w-[1200px] bg-white shadow-xl border-t border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 -translate-x-[20%]">
                                    <div className="p-8 grid grid-cols-4 gap-8">
                                        {category.sections.map((section, idx) => (
                                            <div key={`${category._id}-section-${idx}`} className="space-y-4">
                                                <h3 className="font-bold text-sm uppercase tracking-wider text-black border-b border-gray-100 pb-2">
                                                    {section.title}
                                                </h3>
                                                <ul className="space-y-2">
                                                    {section.items.map((item, i) => (
                                                        <li key={`${category._id}-item-${i}`}>
                                                            <Link 
                                                                href={`/category/${category.slug}/${item.slug}`}
                                                                className="text-gray-500 hover:text-[#e5c100] text-sm transition-colors block"
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
                    ))}
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center justify-end space-x-6 ml-4">
                {/* Search Bar */}
                <div className="hidden lg:flex items-center border-b border-gray-400 pb-1 mr-2">
                    <Search className="w-5 h-5 text-black mr-2 stroke-[1.5]" />
                    <input 
                        type="text" 
                        placeholder="Search products" 
                        className="outline-none text-sm text-gray-700 placeholder-gray-500 w-32 bg-transparent"
                    />
                </div>

                {/* Icons */}
                <div className="flex items-center space-x-4 sm:space-x-5 text-gray-800">
                    {session ? (
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={toggleDropdown}
                                className="hover:text-black transition-colors focus:outline-none flex items-center"
                            >
                                <User className="w-5 h-5 stroke-[1.5]" />
                            </button>
                            
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 z-50">
                                    <Link 
                                        href="/my-account" 
                                        className="block px-4 py-2 text-sm text-[#f05a28] hover:bg-gray-50"
                                    >
                                        My Account
                                    </Link>
                                    <Link 
                                        href="/dashboard" 
                                        className="block px-4 py-2 text-sm text-[#f05a28] hover:bg-gray-50"
                                    >
                                        Dashboard
                                    </Link>
                                    <button 
                                        onClick={() => signOut()}
                                        className="block w-full text-left px-4 py-2 text-sm text-[#f05a28] hover:bg-gray-50"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="hover:text-black transition-colors"><User className="w-5 h-5 stroke-[1.5]" /></Link>
                    )}
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
