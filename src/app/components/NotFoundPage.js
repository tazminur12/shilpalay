"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Hide navbar and footer completely
    document.body.style.overflow = 'hidden';
    
    // Hide navbar - try multiple selectors
    const navbar = document.querySelector('nav');
    const navByClass = document.querySelector('.sticky');
    const allNavs = document.querySelectorAll('nav');
    
    // Hide footer
    const footer = document.querySelector('footer');
    const allFooters = document.querySelectorAll('footer');
    
    // Hide all nav elements
    allNavs.forEach(nav => {
      if (nav) {
        nav.style.display = 'none';
        nav.style.visibility = 'hidden';
        nav.style.opacity = '0';
        nav.style.height = '0';
        nav.style.overflow = 'hidden';
      }
    });
    
    // Hide sticky nav elements
    if (navByClass) {
      navByClass.style.display = 'none';
      navByClass.style.visibility = 'hidden';
    }
    
    // Hide all footer elements
    allFooters.forEach(foot => {
      if (foot) {
        foot.style.display = 'none';
        foot.style.visibility = 'hidden';
        foot.style.opacity = '0';
        foot.style.height = '0';
        foot.style.overflow = 'hidden';
      }
    });
    
    // Add global style to ensure they stay hidden
    const style = document.createElement('style');
    style.id = 'not-found-page-styles';
    style.textContent = `
      nav, footer {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.body.style.overflow = '';
      
      // Restore navbar
      allNavs.forEach(nav => {
        if (nav) {
          nav.style.display = '';
          nav.style.visibility = '';
          nav.style.opacity = '';
          nav.style.height = '';
          nav.style.overflow = '';
        }
      });
      
      if (navByClass) {
        navByClass.style.display = '';
        navByClass.style.visibility = '';
      }
      
      // Restore footer
      allFooters.forEach(foot => {
        if (foot) {
          foot.style.display = '';
          foot.style.visibility = '';
          foot.style.opacity = '';
          foot.style.height = '';
          foot.style.overflow = '';
        }
      });
      
      // Remove global style
      const styleElement = document.getElementById('not-found-page-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center relative overflow-hidden z-[9999]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* 404 Number with Animation */}
        <div className={`mb-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-[120px] sm:text-[150px] md:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 animate-float">
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className={`mb-6 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Oops! The page you're looking for seems to have wandered off. 
            Let's get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mt-10 transition-all duration-1000 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Link
            href="/"
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Home className="w-5 h-5" />
              Go to Homepage
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="group px-8 py-4 bg-white text-gray-700 font-semibold rounded-full border-2 border-gray-300 hover:border-purple-500 hover:text-purple-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Decorative Elements */}
        <div className={`mt-16 transition-all duration-1000 delay-600 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
