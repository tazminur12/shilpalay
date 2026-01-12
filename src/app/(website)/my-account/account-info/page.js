"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function AccountInfo() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    firstName: session?.user?.name?.split(' ')[0] || '',
    lastName: session?.user?.name?.split(' ').slice(1).join(' ') || '',
    email: session?.user?.email || '',
    mobile: '',
    gender: '',
    dob: ''
  });

  const menuItems = [
    { name: "Account Information", href: "/my-account/account-info" },
    { name: "Address Book", href: "/my-account/address-book" },
    { name: "Order History", href: "#" },
    { name: "Rewards", href: "#" },
    { name: "Recommendations", href: "/my-account" },
    { name: "Wishlist", href: "/my-account/wishlist" },
    { name: "Credit Note", href: "#" },
    { name: "Returns", href: "#" },
    { name: "Remove Account", href: "#" }
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative w-full h-[250px] md:h-[300px] overflow-hidden">
        <Image
          src="/login/sari1.jpg"
          alt="Weaving background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-wider text-center px-4">
            WELCOME, {session?.user?.name || 'GUEST'}
          </h1>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-[1920px] mx-auto px-4 lg:px-12 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* Sidebar Menu */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="mb-10">
              <h2 className="text-sm font-bold uppercase tracking-wider mb-6 text-black">MY ACCOUNT</h2>
              <ul className="space-y-4">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link 
                      href={item.href}
                      className={`text-sm transition-colors block ${
                        item.name === "Account Information" ? "text-black font-semibold" : "text-gray-500 hover:text-black"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-6 text-black">NEED HELP?</h2>
              <ul className="space-y-4">
                <li>
                  <Link href="#" className="text-sm text-gray-500 hover:text-black transition-colors block">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-sm text-gray-500 hover:text-black transition-colors block text-left w-full"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content - Edit Profile Form */}
          <div className="flex-1 max-w-3xl">
            <h2 className="text-2xl font-bold mb-8 text-gray-800">Edit Profile Information</h2>
            
            <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input 
                            type="text" 
                            value={formData.firstName}
                            className="w-full border border-gray-300 px-4 py-2.5 outline-none focus:border-black transition-colors text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input 
                            type="text" 
                            value={formData.lastName}
                            className="w-full border border-gray-300 px-4 py-2.5 outline-none focus:border-black transition-colors text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input 
                            type="email" 
                            value={formData.email}
                            readOnly
                            className="w-full border border-gray-300 px-4 py-2.5 outline-none bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                        <input 
                            type="tel" 
                            placeholder="Enter mobile number"
                            className="w-full border border-gray-300 px-4 py-2.5 outline-none focus:border-black transition-colors text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <select className="w-full border border-gray-300 px-4 py-2.5 outline-none focus:border-black transition-colors text-sm bg-white">
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                        <input 
                            type="date" 
                            className="w-full border border-gray-300 px-4 py-2.5 outline-none focus:border-black transition-colors text-sm"
                        />
                    </div>
                </div>

                <div className="pt-6">
                    <button className="bg-black text-white px-8 py-3 text-sm uppercase tracking-widest font-medium hover:bg-gray-800 transition-colors">
                        Save Changes
                    </button>
                </div>
            </form>
          </div>

        </div>
      </div>
    </main>
  );
}
