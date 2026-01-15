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
  Grid,
  FileText,
  Image,
  X,
  Plus,
  Tag,
  Box,
  ShoppingCart,
  CreditCard,
  MapPin,
  Gift,
  Megaphone,
  Star,
  BarChart3,
  Store,
  UserCog,
  Mail,
  MessageSquare,
  Heart,
  Clock,
  Sparkles,
  FolderTree,
  Receipt,
  TrendingUp,
  CheckCircle,
  RefreshCw,
  Users2,
  Wallet,
  PackageCheck,
  BookOpen,
  Sliders,
  Percent,
  Zap,
  MessageCircle,
  Phone,
  ThumbsUp,
  Eye,
  Download,
  Warehouse,
  Globe,
  Palette,
  DollarSign,
  Shield
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

const Sidebar = ({ onClose = () => {} }) => {
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
      name: 'Products', 
      href: '/dashboard/products', 
      icon: Package,
      submenu: [
        { name: 'All Products', href: '/dashboard/products', icon: List },
        { name: 'Add Product', href: '/dashboard/products/add', icon: Plus }
      ]
    },
    { 
      name: 'Categories', 
      href: '/dashboard/categories', 
      icon: Layers,
      submenu: [
        { name: 'Category Management', href: '/dashboard/categories/category-list', icon: List },
        { name: 'Sub Category', href: '/dashboard/categories/sub-categories', icon: Grid },
        { name: 'Child Category', href: '/dashboard/categories/child-categories', icon: Layers }
      ]
    },
    // { name: 'Collections', href: '/dashboard/collections', icon: FolderTree },
    { name: 'Attributes', href: '/dashboard/attributes', icon: Tag },
    { name: 'Inventory', href: '/dashboard/inventory', icon: Box },
    { 
      name: 'Orders', 
      href: '/dashboard/orders', 
      icon: ShoppingBag,
      submenu: [
        { name: 'All Orders', href: '/dashboard/orders', icon: List },
        { name: 'Pending', href: '/dashboard/orders/pending', icon: Clock },
        { name: 'Processing', href: '/dashboard/orders/processing', icon: RefreshCw },
        { name: 'Delivered', href: '/dashboard/orders/delivered', icon: CheckCircle },
        { name: 'Returns / Exchanges', href: '/dashboard/orders/returns', icon: RefreshCw }
      ]
    },
    { 
      name: 'Customers', 
      href: '/dashboard/customers', 
      icon: Users,
      submenu: [
        { name: 'All Customers', href: '/dashboard/customers', icon: Users },
        { name: 'Customer Groups', href: '/dashboard/customers/groups', icon: Users2 }
      ]
    },
    { 
      name: 'Payments', 
      href: '/dashboard/payments', 
      icon: CreditCard,
      submenu: [
        { name: 'Transactions', href: '/dashboard/payments/transactions', icon: Receipt },
        { name: 'Refunds', href: '/dashboard/payments/refunds', icon: RefreshCw },
        { name: 'Payment Methods', href: '/dashboard/payments/methods', icon: Wallet }
      ]
    },
    // { 
    //   name: 'Shipping', 
    //   href: '/dashboard/shipping', 
    //   icon: Truck,
    //   submenu: [
    //     { name: 'Shipping Zones', href: '/dashboard/shipping/zones', icon: MapPin },
    //     { name: 'Delivery Charges', href: '/dashboard/shipping/charges', icon: DollarSign },
    //     { name: 'Courier Partners', href: '/dashboard/shipping/couriers', icon: Truck },
    //     { name: 'Pickup Options', href: '/dashboard/shipping/pickup', icon: PackageCheck }
    //   ]
    // },
    { 
      name: 'Offers & Campaigns', 
      href: '/dashboard/offers', 
      icon: Gift,
      submenu: [
        { name: 'Coupons', href: '/dashboard/offers/coupons', icon: Tag },
        { name: 'Discounts', href: '/dashboard/offers/discounts', icon: Percent },
        { name: 'Flash Sales', href: '/dashboard/offers/flash-sales', icon: Zap }
      ]
    },
    { 
      name: 'Content', 
      href: '/dashboard/content', 
      icon: FileText,
      submenu: [
        { name: 'Banners', href: '/dashboard/banners', icon: Image },
        { name: 'Promotional Sections', href: '/dashboard/content/promotions', icon: Megaphone },
        { name: 'Blogs / Stories', href: '/dashboard/content/blogs', icon: BookOpen },
        { name: 'Pages (About, Policies)', href: '/dashboard/static-pages', icon: FileText }
      ]
    },
    { 
      name: 'Reviews', 
      href: '/dashboard/reviews', 
      icon: Star,
      submenu: [
        { name: 'Product Reviews', href: '/dashboard/reviews/products', icon: Star },
        { name: 'Ratings', href: '/dashboard/reviews/ratings', icon: ThumbsUp },
        { name: 'Moderation', href: '/dashboard/reviews/moderation', icon: Eye }
      ]
    },
    // { 
    //   name: 'Reports', 
    //   href: '/dashboard/reports', 
    //   icon: BarChart3,
    //   submenu: [
    //     { name: 'Sales Report', href: '/dashboard/reports/sales', icon: TrendingUp },
    //     { name: 'Inventory Report', href: '/dashboard/reports/inventory', icon: Box },
    //     { name: 'Customer Report', href: '/dashboard/reports/customers', icon: Users },
    //     { name: 'Export', href: '/dashboard/reports/export', icon: Download }
    //   ]
    // },
    // { 
    //   name: 'Stores / Outlets', 
    //   href: '/dashboard/stores', 
    //   icon: Store,
    //   submenu: [
    //     { name: 'Store List', href: '/dashboard/stores', icon: List },
    //     { name: 'Stock Management', href: '/dashboard/stores/stock', icon: Warehouse }
    //   ]
    // },
    { 
      name: 'Admin & Roles', 
      href: '/dashboard/admin', 
      icon: UserCog,
      submenu: [
        // { name: 'Admin Users', href: '/dashboard/admin/users', icon: Users },
        { name: 'Roles & Permissions', href: '/dashboard/settings/roles', icon: ShieldCheck }
      ]
    },
    { 
      name: 'Settings', 
      href: '/dashboard/settings', 
      icon: Settings,
      submenu: [
        { name: 'Site Settings', href: '/dashboard/settings/site', icon: Globe },
        { name: 'Branding', href: '/dashboard/settings/branding', icon: Palette },
        { name: 'Tax & Currency', href: '/dashboard/settings/tax', icon: DollarSign },
        { name: 'Invoice Settings', href: '/dashboard/settings/invoice', icon: Receipt },
        { name: 'Security & Logs', href: '/dashboard/settings/security', icon: Shield }
      ]
    },
    { 
      name: 'Support / Communication', 
      href: '/dashboard/support', 
      icon: MessageSquare,
      submenu: [
        { name: 'Customer Messages', href: '/dashboard/support/messages', icon: MessageCircle },
        { name: 'Email Templates', href: '/dashboard/support/email-templates', icon: Mail },
        { name: 'SMS Templates', href: '/dashboard/support/sms-templates', icon: Phone }
      ]
    },
    { 
      name: 'Advanced', 
      href: '/dashboard/advanced', 
      icon: Sparkles,
      submenu: [
        { name: 'Wishlist', href: '/dashboard/advanced/wishlist', icon: Heart },
        { name: 'Abandoned Cart', href: '/dashboard/advanced/abandoned-cart', icon: ShoppingCart },
        { name: 'Recommendations', href: '/dashboard/advanced/recommendations', icon: Sparkles }
      ]
    }
  ];

  return (
    <div className="w-64 bg-white text-gray-900 h-screen lg:h-screen flex flex-col overflow-hidden border-r border-gray-200">
      {/* Logo & Close Button */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
        <Link href="/" className="flex items-center gap-2" onClick={onClose}>
            <span className="font-serif text-lg font-bold tracking-widest uppercase text-[#e5c100]">SHILPALAY</span>
        </Link>
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="lg:hidden text-gray-600 hover:text-gray-900 p-1"
        >
          <X className="w-5 h-5" />
        </button>
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
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
                        onClick={onClose}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                            isActive 
                            ? 'bg-[#e5c100] text-black' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        <Icon className="w-5 h-5" />
                        {item.name}
                    </Link>
                )}

                {/* Submenu */}
                {hasSubmenu && isSubmenuOpen && (
                    <div className="mt-1 ml-4 space-y-1 border-l border-gray-200 pl-4">
                        {item.submenu.map((subItem) => {
                             const SubIcon = subItem.icon;
                             const isSubActive = pathname === subItem.href;
                             return (
                                <Link
                                    key={subItem.name}
                                    href={subItem.href}
                                    onClick={onClose}
                                    className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        isSubActive 
                                        ? 'text-[#e5c100]' 
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
      <div className="p-4 border-t border-gray-200 shrink-0">
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 w-full rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
