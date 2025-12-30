"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Settings, 
  Package, 
  Truck,
  LogOut,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Layers,
  List,
  Grid
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

const Sidebar = () => {
  const pathname = usePathname();
  const [openSubmenus, setOpenSubmenus] = useState({
    Settings: true // Open settings by default
  });

  const toggleSubmenu = (name) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { 
      name: 'Category', 
      href: '/dashboard/categories', 
      icon: Layers,
      submenu: [
        { name: 'Category Management', href: '/dashboard/categories/category-list', icon: List },
        { name: 'Sub Category', href: '/dashboard/categories/sub-categories', icon: Grid }
      ]
    },
    { name: 'Products', href: '/dashboard/products', icon: Package },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Customers', href: '/dashboard/customers', icon: Users },
    { name: 'Logistics', href: '/dashboard/logistics', icon: Truck },
    { 
      name: 'Settings', 
      href: '/dashboard/settings', 
      icon: Settings,
      submenu: [
        { name: 'Role Management', href: '/dashboard/settings/roles', icon: ShieldCheck }
      ]
    },
  ];

  return (
    <div className="w-64 bg-black text-white h-screen flex flex-col fixed left-0 top-0 overflow-hidden">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-800 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold tracking-widest uppercase text-[#e5c100]">SHILPALAY</span>
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.submenu && pathname.startsWith(item.href));
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isSubmenuOpen = openSubmenus[item.name];

          return (
            <div key={item.name}>
                {hasSubmenu ? (
                    <button
                        onClick={() => toggleSubmenu(item.name)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                            isActive 
                            ? 'text-[#e5c100]' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-900'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5" />
                            {item.name}
                        </div>
                        {isSubmenuOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                ) : (
                    <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                            isActive 
                            ? 'bg-[#e5c100] text-black' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-900'
                        }`}
                    >
                        <Icon className="w-5 h-5" />
                        {item.name}
                    </Link>
                )}

                {/* Submenu */}
                {hasSubmenu && isSubmenuOpen && (
                    <div className="mt-1 ml-4 space-y-1 border-l border-gray-800 pl-4">
                        {item.submenu.map((subItem) => {
                             const SubIcon = subItem.icon;
                             const isSubActive = pathname === subItem.href;
                             return (
                                <Link
                                    key={subItem.name}
                                    href={subItem.href}
                                    className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        isSubActive 
                                        ? 'text-[#e5c100]' 
                                        : 'text-gray-400 hover:text-white hover:bg-gray-900'
                                    }`}
                                >
                                    {SubIcon && <SubIcon className="w-4 h-4" />}
                                    {subItem.name}
                                </Link>
                             )
                        })}
                    </div>
                )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800 flex-shrink-0">
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-900 w-full rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
