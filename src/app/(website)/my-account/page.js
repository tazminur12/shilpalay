"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ThumbsUp } from 'lucide-react';

export default function MyAccount() {
  const { data: session } = useSession();

  const menuItems = [
    { name: "Account Information", href: "/my-account/account-info" },
    { name: "Address Book", href: "/my-account/address-book" },
    { name: "Order History", href: "/my-account/order-history" },
    { name: "Recommendations", href: "/my-account" },
    { name: "Wishlist", href: "/my-account/wishlist" },
    { name: "Credit Note", href: "#" },
    { name: "Returns", href: "/my-account/returns" },
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
                      className="text-sm text-gray-500 hover:text-black transition-colors block"
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

          {/* Main Cards */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              
              {/* Recommendations Card */}
              <div className="bg-white p-0 group cursor-pointer">
                <div className="aspect-[3/4] relative bg-gray-100 mb-6 overflow-hidden">
                   <Image
                    src="https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=800&auto=format&fit=crop"
                    alt="Recommendations"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                     <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <ThumbsUp className="w-8 h-8 text-black stroke-[1.5]" />
                     </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-lg mb-2">Recommendations</h3>
                  <p className="text-gray-500 text-sm">Selected items just for you</p>
                </div>
              </div>

              {/* Wishlist Card */}
              <Link href="/my-account/wishlist" className="bg-white p-0 group cursor-pointer block">
                <div className="aspect-[3/4] relative bg-gray-50 mb-6 flex items-center justify-center overflow-hidden">
                   {/* Placeholder Graphic for Wishlist */}
                   <div className="opacity-10 text-9xl font-serif">M</div> 
                   
                   <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                     <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <ThumbsUp className="w-8 h-8 text-black stroke-[1.5]" />
                     </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-lg mb-2">Wishlist</h3>
                  <p className="text-gray-500 text-sm">All your saved items in one place</p>
                </div>
              </Link>

              {/* Rewards Card */}
              <div className="bg-white p-0 group cursor-pointer">
                <div className="aspect-[3/4] relative bg-gray-50 mb-6 flex flex-col items-center justify-center overflow-hidden">
                   {/* Placeholder Graphic for Rewards */}
                   <div className="text-center mb-4">
                      <h4 className="text-2xl font-bold text-orange-500 mb-2">my<br/>Aarong<br/>rewards</h4>
                      <div className="w-20 h-20 bg-[#004d40] rounded-full flex items-center justify-center text-white text-xs text-center p-2 mx-auto">
                        CLUB<br/>TAAGA
                      </div>
                   </div>

                   <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                     <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <ThumbsUp className="w-8 h-8 text-black stroke-[1.5]" />
                     </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-lg mb-2">Rewards</h3>
                  <p className="text-gray-500 text-sm">Earn points and unlock special offers</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
