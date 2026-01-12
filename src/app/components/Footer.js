import Link from 'next/link';
import { Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
  const footerSections = [
    {
      title: "WHO WE ARE",
      links: [
        "About Us", "Our People", "Our Artisans", "Careers",
        "News & Events", "Stories", "Photos & Videos", "Lookbook"
      ]
    },
    {
      title: "Categories",
      links: [
        "Women", "Men", "Kids", "Home Décor",
        "Jewellery", "Skin & Hair", "Gifts & Crafts", "Wedding"
      ]
    },
    {
      title: "Customer Service",
      links: [
        "Contact Us", "Return & Exchanges", "How To Order", "Fabric Care",
        "Billing & Payments", "My Shilpalay Rewards", "Shipping & Delivery",
        "Club Taaga", "Track Your Orders", "FAQ"
      ]
    },
    {
      title: "MORE",
      links: [
        "Terms & Conditions", "Digital Business Identity", "Privacy Policy",
        "Find a Store", "Customs Duty", "Become a Producer",
        "VAT Registration", "Site Map", "BSTI Licence"
      ]
    }
  ];

  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="flex flex-col space-y-4">
              <h3 className="font-bold text-sm tracking-wider mb-2 uppercase">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-gray-300 hover:text-white text-xs transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social Platform Column */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-bold text-sm tracking-wider mb-2 uppercase">Social Platform</h3>
            <div className="grid grid-cols-4 gap-4 w-fit">
              <Link href="#" className="hover:text-gray-300 transition-colors">
                <Facebook className="w-5 h-5 stroke-[1.5]" />
              </Link>
              <Link href="#" className="hover:text-gray-300 transition-colors">
                <Instagram className="w-5 h-5 stroke-[1.5]" />
              </Link>
              <Link href="#" className="hover:text-gray-300 transition-colors">
                <Twitter className="w-5 h-5 stroke-[1.5]" />
              </Link>
               <Link href="#" className="hover:text-gray-300 transition-colors">
                {/* Pinterest Icon Placeholder (Lucide might not have it) */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-pinterest"
                >
                    <line x1="12" x2="12" y1="5" y2="19" />
                    <line x1="5" x2="19" y1="12" y2="12" />
                    <circle cx="12" cy="12" r="10" />
                    {/* Simplified generic circular icon for now if pinterest missing, but let's try a closer path if possible, or just use this generic one */}
                </svg>
              </Link>
              <Link href="#" className="hover:text-gray-300 transition-colors">
                <Youtube className="w-5 h-5 stroke-[1.5]" />
              </Link>
              <Link href="#" className="hover:text-gray-300 transition-colors">
                <Linkedin className="w-5 h-5 stroke-[1.5]" />
              </Link>
               <Link href="#" className="hover:text-gray-300 transition-colors">
                {/* TikTok Icon Placeholder */}
                 <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-xs text-gray-400">
            Copyright © {new Date().getFullYear()} Shilpalay. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
