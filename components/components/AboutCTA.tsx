"use client";

import { useState, useEffect } from "react";

export function AboutCTA() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("access_token");
      setIsLoggedIn(!!token);
    };
    checkLogin();
    window.addEventListener("auth-change", checkLogin);
    window.addEventListener("storage", checkLogin);
    return () => {
      window.removeEventListener("auth-change", checkLogin);
      window.removeEventListener("storage", checkLogin);
    };
  }, []);

  if (isLoggedIn) return null;

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-700 via-blue-600 to-red-600 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-64 h-64 bg-white rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            Ready to Be Part of the Franchise Revolution?
          </h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto text-balance">
            Whether you're a franchisor looking to expand, an investor seeking opportunities, or an entrepreneur ready to own a business, NFIS is your platform.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/register?type=franchisor"
              className="px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
            >
              Book Exhibition Stall
            </a>
            <a
              href="/register?type=visitor"
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              Register as Visitor
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
