"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function AccountInfo() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    gender: '',
    dateOfBirth: ''
  });

  const menuItems = [
    { name: "Account Information", href: "/my-account/account-info" },
    { name: "Address Book", href: "/my-account/address-book" },
    { name: "Order History", href: "/my-account/order-history" },
    { name: "Rewards", href: "#" },
    { name: "Recommendations", href: "/my-account" },
    { name: "Wishlist", href: "/my-account/wishlist" },
    { name: "Credit Note", href: "#" },
    { name: "Returns", href: "/my-account/returns" },
    { name: "Remove Account", href: "#" }
  ];

  useEffect(() => {
    if (session) {
      fetchProfile();
    } else {
      router.push('/login?redirect=/my-account/account-info');
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const user = await res.json();
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          mobile: user.mobile || '',
          gender: user.gender || '',
          dateOfBirth: user.dateOfBirth 
            ? new Date(user.dateOfBirth).toISOString().split('T')[0]
            : ''
        });
      } else {
        // Fallback: use session data
        setFormData({
          firstName: session?.user?.name?.split(' ')[0] || '',
          lastName: session?.user?.name?.split(' ').slice(1).join(' ') || '',
          email: session?.user?.email || '',
          mobile: '',
          gender: '',
          dateOfBirth: ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback: use session data
      setFormData({
        firstName: session?.user?.name?.split(' ')[0] || '',
        lastName: session?.user?.name?.split(' ').slice(1).join(' ') || '',
        email: session?.user?.email || '',
        mobile: '',
        gender: '',
        dateOfBirth: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName) {
      Swal.fire('Error', 'First name and last name are required', 'error');
      return;
    }

    if (!formData.mobile) {
      Swal.fire('Error', 'Mobile number is required', 'error');
      return;
    }

    setSubmitting(true);
    
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          mobile: formData.mobile,
          gender: formData.gender || undefined,
          dateOfBirth: formData.dateOfBirth || undefined
        })
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          title: 'Success!',
          text: 'Your profile has been updated successfully',
          icon: 'success',
          confirmButtonColor: '#000',
          timer: 2000,
          showConfirmButton: true
        });
        
        // Refresh session to update name
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      } else {
        Swal.fire('Error', data.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire('Error', 'Failed to update profile', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-12 py-12 md:py-16">
          <div className="text-center py-20 text-gray-500">Loading profile...</div>
        </div>
      </main>
    );
  }

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
            ACCOUNT INFORMATION
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
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            required
                            className="w-full border border-gray-300 px-4 py-2.5 outline-none focus:border-black transition-colors text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            required
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
                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="tel" 
                            placeholder="Enter mobile number"
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            required
                            className="w-full border border-gray-300 px-4 py-2.5 outline-none focus:border-black transition-colors text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <select 
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full border border-gray-300 px-4 py-2.5 outline-none focus:border-black transition-colors text-sm bg-white"
                        >
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
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full border border-gray-300 px-4 py-2.5 outline-none focus:border-black transition-colors text-sm"
                        />
                    </div>
                </div>

                <div className="pt-6">
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="bg-black text-white px-8 py-3 text-sm uppercase tracking-widest font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
          </div>

        </div>
      </div>
    </main>
  );
}
