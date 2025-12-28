"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    gender: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      router.push('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/login/sari1.jpg"
          alt="Weaving background"
          fill
          className="object-cover"
          priority
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Centered Form Card */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="w-full max-w-md p-8 sm:p-12">
            
            {/* Step Indicator */}
            <div className="text-center mb-6">
                <span className="text-white/80 text-sm tracking-widest">1/2</span>
            </div>

            {/* Title */}
            <h2 className="text-3xl text-white text-center font-normal mb-8 tracking-wide">
                Create An Account
            </h2>

            {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}

            {/* Form Fields */}
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <input 
                        type="text" 
                        name="firstName"
                        placeholder="First Name*" 
                        required
                        className="w-full bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <input 
                        type="text" 
                        name="lastName"
                        placeholder="Last Name*" 
                        required
                        className="w-full bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <input 
                        type="email" 
                        name="email"
                        placeholder="Email*" 
                        required
                        className="w-full bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <input 
                        type="password" 
                        name="password"
                        placeholder="Password*" 
                        required
                        className="w-full bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <input 
                        type="tel" 
                        name="mobile"
                        placeholder="Mobile Number*" 
                        required
                        className="w-full bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        onChange={handleChange}
                    />
                </div>
                <div className="relative">
                    <select 
                        name="gender"
                        className="w-full bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-white/50 transition-all appearance-none cursor-pointer"
                        defaultValue=""
                        required
                        onChange={handleChange}
                    >
                        <option value="" disabled hidden>Gender*</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>

                {/* Submit Button */}
                <button 
                  disabled={loading}
                  className="w-full bg-black text-white py-3 text-sm uppercase tracking-widest font-medium hover:bg-gray-900 transition-colors mt-6 disabled:opacity-50"
                >
                    {loading ? 'Creating Account...' : 'Continue'}
                </button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-6">
                <p className="text-white text-xs">
                    Already have an account? <Link href="/login" className="text-[#f05a28] hover:text-[#ff7f50] transition-colors font-medium">Login Now</Link>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
