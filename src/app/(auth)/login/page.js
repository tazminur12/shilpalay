"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
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
      const res = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (res.error) {
        setError('Invalid credentials');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError('Something went wrong');
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
            
            {/* Title */}
            <h2 className="text-3xl text-white text-center font-normal mb-8 tracking-wide">
                Login
            </h2>

            {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}

            {/* Form Fields */}
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <input 
                        type="text" 
                        name="email"
                        placeholder="Email or Mobile Number*" 
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

                {/* Submit Button */}
                <button 
                  disabled={loading}
                  className="w-full bg-black text-white py-3 text-sm uppercase tracking-widest font-medium hover:bg-gray-900 transition-colors mt-6 disabled:opacity-50"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            {/* Signup Link */}
            <div className="text-center mt-6">
                <p className="text-white text-xs">
                    Don't have an account? <Link href="/signup" className="text-[#f05a28] hover:text-[#ff7f50] transition-colors font-medium">Create Account</Link>
                </p>
            </div>
             <div className="text-center mt-2">
                <Link href="#" className="text-white/80 text-xs hover:text-white underline transition-colors">
                    Forgot Password?
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
