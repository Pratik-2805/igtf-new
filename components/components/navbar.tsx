"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    company: "",
    role: "",
  });

  useEffect(() => {
    const loadUserData = async () => {
      const token = localStorage.getItem("access_token");
      const name = localStorage.getItem("user_name");
      const company = localStorage.getItem("company_name");
      const role = localStorage.getItem("user_role");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      if (token) {
        setIsLoggedIn(true);
        setUserData({
          name: name || "User",
          company: company || "",
          role: role || "",
        });

        // Background verification: ensure user still exists in DB
        try {
          const res = await fetch(`${API_URL}/api/me/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) {
            // User deleted or token invalid -> clear session
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user_role");
            localStorage.removeItem("user_name");
            localStorage.removeItem("company_name");
            document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            setIsLoggedIn(false);
            window.dispatchEvent(new Event("auth-change"));
          }
        } catch (e) {
          console.error("Navbar background auth check failed", e);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    // Initial load
    loadUserData();

    // Listen for custom login/logout events on the same tab
    window.addEventListener("auth-change", loadUserData);

    // Listen for changes from other tabs (optional but good)
    window.addEventListener("storage", loadUserData);

    return () => {
      window.removeEventListener("auth-change", loadUserData);
      window.removeEventListener("storage", loadUserData);
    };
  }, []);

  const handleLogout = async () => {
    // 1. Clear all authentication data from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_role");
    localStorage.removeItem("company_name");

    // 2. Clear the client-side access_token cookie
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";

    // 3. Call backend logout to clear the HttpOnly refresh cookie
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${API_URL}/api/logout/`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error("Backend logout failed:", err);
    }

    // 4. Update local state and broadcast change
    setIsLoggedIn(false);
    setIsUserMenuOpen(false);
    window.dispatchEvent(new Event("auth-change"));

    // 5. Force redirect to login and refresh page state
    router.push("/login");
    router.refresh();
  };

  const getDashboardLink = () => {
    if (userData.role === "franchisor") return "/dashboard/franchisor";
    if (userData.role === "investor") return "/dashboard/investor";
    return "/executive/dashboard";
  };

  const links = [
    { href: "/", label: "Home" },
    { href: "/franchises", label: "Franchises" },
    { href: "/investors", label: "Investors" },
    { href: "/exhibitions", label: "Exhibitions" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 flex-shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="NFIS Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <p className="font-black text-gray-900 text-sm leading-none tracking-tight">
                NFIS
              </p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 opacity-70">
                National Franchise Investment Summit
              </p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden xl:flex gap-8">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-all text-sm font-bold h-16 flex items-center border-b-2 ${
                    isActive
                      ? "text-blue-700 border-blue-700"
                      : "text-gray-600 border-transparent hover:text-blue-700 hover:border-blue-700/30"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden xl:flex items-center gap-4">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  onBlur={() => setTimeout(() => setIsUserMenuOpen(false), 200)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-700 to-red-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <User size={16} />
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-[11px] font-bold text-gray-900 leading-none truncate max-w-[120px]">
                      {userData.name}
                    </p>
                    {userData.company && (
                      <p className="text-[9px] text-gray-500 font-medium truncate max-w-[120px] uppercase tracking-tighter mt-0.5">
                        {userData.company}
                      </p>
                    )}
                  </div>
                  <ChevronDown
                    className={`text-gray-400 group-hover:text-blue-700 transition-transform duration-300 ${isUserMenuOpen ? "rotate-180" : ""}`}
                    size={16}
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-[1.5rem] shadow-2xl p-2 animate-in fade-in zoom-in slide-in-from-top-2 duration-300 z-[60]">
                    <div className="px-4 py-3 mb-1 border-b border-gray-50">
                      <p className="text-xs font-black text-gray-400 tracking-[0.2em] uppercase">
                        User Session
                      </p>
                      <p className="text-sm font-bold text-gray-900 mt-1 truncate">
                        {userData.name}
                      </p>
                      {userData.company && (
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                          {userData.company}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Link
                        href={getDashboardLink()}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-blue-50/50 hover:text-blue-700 rounded-xl transition-all group"
                      >
                        <LayoutDashboard
                          size={18}
                          className="text-gray-400 group-hover:text-blue-600"
                        />
                        Go to Dashboard
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50/50 rounded-xl transition-all group"
                      >
                        <LogOut
                          size={18}
                          className="text-red-400 group-hover:text-red-600"
                        />
                        Logout Session
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
                >
                  Sign In
                </a>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium text-sm rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  Register Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="xl:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="xl:hidden fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Side Drawer */}
          <div className="xl:hidden fixed top-0 right-0 h-screen w-[85vw] sm:w-[60vw] md:w-[40vw] max-w-sm bg-white shadow-2xl z-[101] flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex flex-col border-b border-gray-100 relative bg-gray-50/50 pt-8 pb-4">
              {/* Logo Area */}
              <div className="flex justify-center items-center w-full mb-4">
                <div className="relative w-16 h-16">
                  <Image
                    src="/logo.png"
                    alt="NFIS Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600 rounded-lg transition-colors absolute top-4 right-4 bg-white border border-gray-200 shadow-sm z-10"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>

              <div className="px-6 text-center">
                <span className="font-black text-red-600 tracking-tight uppercase tracking-widest text-[10px]">
                  Menu Options
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="px-4 py-6 space-y-2 flex-grow overflow-y-auto">
              {links.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-3 rounded-xl transition-all font-black uppercase tracking-widest text-[10px] border ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border-blue-100"
                        : "text-gray-500 hover:bg-gray-50 hover:text-red-700 border-transparent hover:border-gray-100"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Bottom Actions */}
            {isLoggedIn ? (
              <div className="p-6 border-t border-gray-100 bg-gray-50/80 mt-auto">
                <div className="mb-4">
                  <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1">
                    My Profile
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {userData.name}
                  </p>
                  {userData.company && (
                    <p className="text-xs text-gray-500 font-medium">
                      {userData.company}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <Link
                    href={getDashboardLink()}
                    className="w-full text-center px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold text-sm rounded-xl transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center px-4 py-3 bg-red-100 hover:bg-red-200 text-red-600 font-bold text-sm rounded-xl transition-colors"
                  >
                    Logout Session
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 border-t border-gray-100 bg-gray-50/80 mt-auto flex flex-col gap-3">
                <a
                  href="/login"
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors text-center shadow-sm"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </a>
                <Link
                  href="/register"
                  className="w-full px-4 py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-sm rounded-xl transition-all text-center shadow-md"
                  onClick={() => setIsOpen(false)}
                >
                  Register Now
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
}
