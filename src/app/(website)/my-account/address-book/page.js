"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Plus, Edit, Trash2, MapPin, Phone, Mail, Home, Building, X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function AddressBook() {
  const { data: session } = useSession();
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: session?.user?.email || '',
    streetAddress1: '',
    streetAddress2: '',
    country: 'Bangladesh',
    district: '',
    city: '',
    zipCode: '',
    isDefault: false,
    addressType: 'home',
    label: ''
  });

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

  useEffect(() => {
    if (session) {
      fetchAddresses();
    }
  }, [session]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(Array.isArray(data) ? data : []);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAddress(null);
    setFormData({
      firstName: session?.user?.name?.split(' ')[0] || '',
      lastName: session?.user?.name?.split(' ').slice(1).join(' ') || '',
      mobile: '',
      email: session?.user?.email || '',
      streetAddress1: '',
      streetAddress2: '',
      country: 'Bangladesh',
      district: '',
      city: '',
      zipCode: '',
      isDefault: addresses.length === 0,
      addressType: 'home',
      label: ''
    });
    setShowModal(true);
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      firstName: address.firstName,
      lastName: address.lastName,
      mobile: address.mobile,
      email: address.email || session?.user?.email || '',
      streetAddress1: address.streetAddress1,
      streetAddress2: address.streetAddress2 || '',
      country: address.country || 'Bangladesh',
      district: address.district,
      city: address.city,
      zipCode: address.zipCode,
      isDefault: address.isDefault || false,
      addressType: address.addressType || 'home',
      label: address.label || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.mobile) {
      Swal.fire('Required Fields', 'Please fill in all required fields', 'warning');
      return;
    }

    if (!formData.streetAddress1 || !formData.district || !formData.city || !formData.zipCode) {
      Swal.fire('Required Fields', 'Please complete your address', 'warning');
      return;
    }

    try {
      const url = editingAddress 
        ? `/api/addresses/${editingAddress._id}`
        : '/api/addresses';
      const method = editingAddress ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const result = await res.json();
        Swal.fire('Success', result.message || 'Address saved successfully', 'success');
        fetchAddresses();
        setShowModal(false);
      } else {
        const error = await res.json();
        Swal.fire('Error', error.message || 'Failed to save address', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to save address', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Address?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/addresses/${id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          Swal.fire('Deleted!', 'Address has been deleted.', 'success');
          fetchAddresses();
        } else {
          Swal.fire('Error', 'Failed to delete address', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to delete address', 'error');
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await fetch(`/api/addresses/${id}/default`, {
        method: 'PUT'
      });

      if (res.ok) {
        Swal.fire('Success', 'Default address updated', 'success');
        fetchAddresses();
      } else {
        Swal.fire('Error', 'Failed to set default address', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to set default address', 'error');
    }
  };

  const getAddressTypeIcon = (type) => {
    switch (type) {
      case 'office':
        return <Building className="w-4 h-4" />;
      case 'home':
      default:
        return <Home className="w-4 h-4" />;
    }
  };

  if (!session) {
    router.push('/login?redirect=/my-account/address-book');
    return null;
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
            WELCOME, {session?.user?.name || 'GUEST'}
          </h1>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-[1920px] mx-auto px-4 lg:px-12 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* Sidebar Menu */}
          <div className="w-full lg:w-64 shrink-0">
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
              <button 
                onClick={handleAdd}
                className="flex items-center gap-2 bg-black text-white px-6 py-2.5 text-sm uppercase tracking-widest font-medium hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New Address
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading addresses...</div>
            ) : addresses.length === 0 ? (
              <div className="border border-dashed border-gray-300 p-12 flex flex-col items-center justify-center text-gray-400 min-h-[300px]">
                <MapPin className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No addresses saved</p>
                <p className="text-sm mb-6">Add your first address to get started</p>
                <button 
                  onClick={handleAdd}
                  className="flex items-center gap-2 bg-black text-white px-6 py-2.5 text-sm uppercase tracking-widest font-medium hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((address) => (
                  <div 
                    key={address._id} 
                    className="border border-gray-200 p-6 relative group hover:border-black transition-colors"
                  >
                    {address.isDefault && (
                      <div className="absolute top-4 right-4 bg-gray-100 text-xs px-2 py-1 uppercase tracking-wider font-semibold">
                        Default
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mb-4">
                      {getAddressTypeIcon(address.addressType)}
                      <h3 className="font-bold text-lg">
                        {address.firstName} {address.lastName}
                      </h3>
                    </div>
                    
                    {address.label && (
                      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">{address.label}</p>
                    )}
                    
                    <div className="space-y-1 text-sm text-gray-600 mb-6">
                      <p>{address.streetAddress1}</p>
                      {address.streetAddress2 && <p>{address.streetAddress2}</p>}
                      <p>{address.city}, {address.district}</p>
                      <p>{address.zipCode}, {address.country}</p>
                      <div className="mt-4 space-y-1">
                        {address.mobile && (
                          <p className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5" />
                            {address.mobile}
                          </p>
                        )}
                        {address.email && (
                          <p className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" />
                            {address.email}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex gap-4 text-sm font-medium">
                        <button 
                          onClick={() => handleEdit(address)}
                          className="text-black hover:underline uppercase tracking-wider text-xs"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(address._id)}
                          className="text-red-500 hover:underline uppercase tracking-wider text-xs"
                        >
                          Delete
                        </button>
                      </div>
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefault(address._id)}
                          className="text-xs text-gray-500 hover:text-black uppercase tracking-wider"
                        >
                          Set as Default
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Add New Address Card */}
                <div 
                  onClick={handleAdd}
                  className="border border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-gray-400 min-h-[250px] hover:border-black hover:text-black transition-colors cursor-pointer"
                >
                  <Plus className="w-8 h-8 mb-2" />
                  <span className="uppercase tracking-widest text-xs font-medium">Add New Address</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Street Address 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.streetAddress1}
                  onChange={(e) => setFormData({ ...formData, streetAddress1: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Street Address 2
                </label>
                <input
                  type="text"
                  value={formData.streetAddress2}
                  onChange={(e) => setFormData({ ...formData, streetAddress2: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    ZIP Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Address Type
                  </label>
                  <select
                    value={formData.addressType}
                    onChange={(e) => setFormData({ ...formData, addressType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                  >
                    <option value="home">Home</option>
                    <option value="office">Office</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="e.g., My Home, Work"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 border-gray-300 rounded"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">
                  Set as default address
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
              >
                {editingAddress ? 'Update' : 'Save'} Address
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
