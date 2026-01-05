"use client";

import { Bell, Search, User, Menu } from 'lucide-react';
import { useSession } from 'next-auth/react';

const Topbar = ({ onMenuClick = () => {} }) => {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10 min-w-0">
      {/* Mobile Menu Button & Search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Search */}
        <div className="flex items-center bg-gray-100 px-3 lg:px-4 py-2 rounded-lg flex-1 lg:max-w-md min-w-0">
          <Search className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none outline-none text-sm w-full text-gray-700 min-w-0"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0 ml-4">
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-gray-200">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-gray-800">{session?.user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 capitalize">{session?.user?.role?.replace('_', ' ') || 'Role'}</p>
          </div>
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
