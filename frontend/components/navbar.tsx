"use client";

import type React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, LogOut, ChevronDown, User } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout: authLogout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [pressProgress, setPressProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const handleLogoMouseDown = () => {
    const startTime = Date.now();
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / 3000) * 100, 100);
      setPressProgress(progress);
    }, 50);

    const timer = setTimeout(() => {
      router.push("/login");
      setPressProgress(0);
      if (progressInterval.current) clearInterval(progressInterval.current);
    }, 3000);

    setPressTimer(timer);
  };

  const handleLogoMouseUp = () => {
    const wasShortPress = pressProgress < 100;
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    setPressProgress(0);
    if (wasShortPress && pressProgress > 0) router.push("/");
  };

  const handleLogoClick = () => {
    if (pressProgress === 0) router.push("/");
  };

  const handleLogoTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleLogoMouseDown();
  };

  const handleLogoTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleLogoMouseUp();
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/exhibition", label: "Exhibition" },
    { href: "/categories", label: "Categories" },
    { href: "/visitors", label: "Visitors" },
    { href: "/book-your-slot", label: "Book Stalls" },
    { href: "/gallery", label: "Gallery" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-70 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="relative">
              <button
                className="relative focus:outline-none cursor-pointer"
                onMouseDown={handleLogoMouseDown}
                onMouseUp={handleLogoMouseUp}
                onMouseLeave={handleLogoMouseUp}
                onClick={handleLogoClick}
                onTouchStart={handleLogoTouchStart}
                onTouchEnd={handleLogoTouchEnd}
                onTouchCancel={handleLogoMouseUp}
                aria-label="IGTF Logo - Press and hold for 3 seconds to access admin"
              >
                <Image
                  src="/logo.webp"
                  alt="IGTF Logo"
                  width={150}
                  height={56}
                  className="h-14 select-none pointer-events-none"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />

                {/* Progress bar */}
                {pressProgress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-100"
                      style={{ width: `${pressProgress}%` }}
                    />
                  </div>
                )}
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`transition-colors duration-500 ${
                    pathname === link.href
                      ? "text-primary font-medium"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* CTA Button or User Profile Dropdown */}
            <div className="hidden md:block relative">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-3 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-all cursor-pointer border border-neutral-200 dark:border-neutral-700"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                      {user.username.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-foreground max-w-[120px] truncate">
                      {user.username}
                    </span>
                    <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-300 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setUserDropdownOpen(false)} />
                      <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-2xl p-2 z-40 animate-in fade-in slide-in-from-top-4 duration-300 text-left">
                        <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 mb-1">
                          <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">Logged In As</p>
                          <p className="text-sm font-black text-foreground truncate">{user.email}</p>
                          <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-primary/10 text-primary">
                            {user.role || 'Member'}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            if (user.role === 'admin') router.push('/admin');
                            else if (user.role === 'manager') router.push('/manager');
                            else if (user.role === 'sales') router.push('/sales');
                            else if (user.role === 'investor') router.push('/dashboard/investor');
                            else if (user.role === 'franchisor') router.push('/dashboard/franchisor');
                            else router.push('/');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-xl transition-all cursor-pointer"
                        >
                          <LayoutDashboard size={18} />
                          Go to Console
                        </button>

                        <button
                          onClick={async () => {
                            setUserDropdownOpen(false);
                            await authLogout();
                            router.push('/');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                        >
                          <LogOut size={18} />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  className="
      relative 
      px-6 py-2 
      rounded-md 
      font-medium 
      text-background 
      transition-all 
      duration-500 
      overflow-hidden
      bg-gradient-to-r 
      from-[oklch(0.35_0.07_250)] 
      via-[oklch(0.75_0.12_75)] 
      to-[oklch(0.35_0.07_250)]
      bg-[length:200%_200%]
      animate-gradient-move
    "
                  onClick={() => setModalOpen(true)}
                  onMouseEnter={() => setModalOpen(true)}
                >
                  Register Now
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`transition-colors duration-500 ${
                      pathname === link.href
                        ? "text-primary font-medium"
                        : "text-foreground hover:text-primary"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                {isAuthenticated && user ? (
                  <>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (user.role === 'admin') router.push('/admin');
                        else if (user.role === 'manager') router.push('/manager');
                        else if (user.role === 'sales') router.push('/sales');
                        else if (user.role === 'investor') router.push('/dashboard/investor');
                        else if (user.role === 'franchisor') router.push('/dashboard/franchisor');
                        else router.push('/');
                      }}
                      className="w-full flex items-center justify-center gap-3 bg-neutral-100 dark:bg-neutral-800 text-foreground px-6 py-3 rounded-md font-medium cursor-pointer"
                    >
                      <LayoutDashboard size={18} />
                      Go to Console
                    </button>
                    <button
                      onClick={async () => {
                        setMobileMenuOpen(false);
                        await authLogout();
                        router.push('/');
                      }}
                      className="w-full flex items-center justify-center gap-3 bg-red-500/10 text-red-500 px-6 py-3 rounded-md font-medium cursor-pointer"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    className="w-full bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-all duration-500 font-medium"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setModalOpen(true);
                    }}
                  >
                    Register Now
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Modal (Tailwind Only) */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl p-6 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
            onMouseLeave={() => setModalOpen(false)} // closes on hover out
          >
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Register As
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Choose how you’d like to register for the event
            </p>
            <div className="flex flex-col gap-3">
              <button
                className="w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-all duration-300"
                onClick={() => {
                  setModalOpen(false);
                  router.push("/exhibition#registration-form");
                }}
              >
                Exhibitor
              </button>
              <button
                className="w-full border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                onClick={() => {
                  setModalOpen(false);
                  router.push("/visitors#visitor-registration");
                }}
              >
                Visitor
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
