"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Plus } from 'lucide-react';

export default function AddressBook() {
  const { data: session } = useSession();

  const menuItems = [
    { name: "Account Information", href: "/my-account/account-info" },
    { name: "Address Book", href: "/my-account/address-book" },
    { name: "Order History", href: "#" },
    { name: "Rewards", href: "#" },
    { name: "Recommendations", href: "/my-account" },
    { name: "Wishlist", href: "#" },
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
                        item.name === "Address Book" ? "text-black font-semibold" : "text-gray-500 hover:text-black"
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

          {/* Main Content - Address List */}
          <div className="flex-1 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Address Book</h2>
                <button className="flex items-center gap-2 bg-black text-white px-6 py-2.5 text-sm uppercase tracking-widest font-medium hover:bg-gray-800 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add New Address
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Default Address Card */}
                <div className="border border-gray-200 p-6 relative group hover:border-black transition-colors">
                    <div className="absolute top-4 right-4 bg-gray-100 text-xs px-2 py-1 uppercase tracking-wider font-semibold">Default Billing</div>
                    <h3 className="font-bold text-lg mb-4">{session?.user?.name || 'User Name'}</h3>
                    <div className="space-y-1 text-sm text-gray-600 mb-6">
                        <p>123, Fashion Street</p>
                        <p>Gulshan 1, Dhaka 1212</p>
                        <p>Bangladesh</p>
                        <p className="mt-4">Mobile: +880 1712 345678</p>
                    </div>
                    <div className="flex gap-4 text-sm font-medium">
                        <button className="text-black hover:underline uppercase tracking-wider text-xs">Edit</button>
                        <button className="text-red-500 hover:underline uppercase tracking-wider text-xs">Delete</button>
                    </div>
                </div>

                {/* Additional Address Placeholder */}
                <div className="border border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-gray-400 min-h-[250px] hover:border-black hover:text-black transition-colors cursor-pointer">
                    <Plus className="w-8 h-8 mb-2" />
                    <span className="uppercase tracking-widest text-xs font-medium">Add New Address</span>
                </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
