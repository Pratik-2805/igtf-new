"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { toast } from "react-toastify";
import LoadingScreen from "@/components/loading-screen";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ─── CLEAR ALL STALE SESSION DATA ON MOUNT ───────────────────────────────
  // We never auto-login from saved cookies/localStorage.
  // Every visit to /login requires a fresh sign-in via email & password.
  useEffect(() => {
    // Clear localStorage tokens
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
    localStorage.removeItem("company_name");
    // Clear the access_token cookie read by the middleware
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    window.dispatchEvent(new Event("auth-change"));
  }, []);

  const redirectToDashboard = (role: string) => {
    let dest = "/dashboard";
    if (role === "franchisor") dest = "/dashboard/franchisor";
    else if (role === "investor") dest = "/dashboard/investor";
    else if (role === "executive") dest = "/executive/dashboard";
    
    // Hard navigation to ensure middleware sees the cookie immediately
    window.location.replace(dest);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      // Try /api/token/ first
      let response = await fetch(`${API_URL}/api/token/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, username: email, password }),
      });

      // If /api/token/ 404s, try /api/login/ as a fallback
      if (response.status === 404) {
        response = await fetch(`${API_URL}/api/login/`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email, username: email, password }),
        });
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        if (response.ok) {
          if (data.access) {
            localStorage.setItem("access_token", data.access);
            // Also store in cookie so Edge Middleware can read the JWT
            document.cookie = `access_token=${data.access}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
          }
          if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
          if (email) localStorage.setItem("user_email", email);

          const role = data.user?.role || data.role;
          if (role) {
            localStorage.setItem("user_role", role);
          }

          // More robust name detection
          const firstName = data.user?.first_name || data.first_name;
          const lastName = data.user?.last_name || data.last_name;
          const username = data.user?.username || data.username;

          let displayName = "User";
          if (firstName) {
            displayName = `${firstName} ${lastName || ""}`.trim();
          } else if (username) {
            displayName = username;
          } else if (email) {
            displayName = email.split("@")[0];
          }

          localStorage.setItem("user_name", displayName);

          if (data.user?.company_name || data.company_name) {
            localStorage.setItem(
              "company_name",
              data.user?.company_name || data.company_name,
            );
          }

          // Broadcast authentication change to other components
          window.dispatchEvent(new Event("auth-change"));

          redirectToDashboard(role);
        } else {
          toast.error(
            data.detail || "Login failed. Please check your credentials.",
          );
        }
      } else {
        // Not a JSON response, likely an HTML 404/500 page
        console.error("Non-JSON response received:", response.status);
        toast.error(
          `Server error (${response.status}). Please verify your backend API URL and login endpoint.`,
        );
      }
    } catch (error) {
      console.error("Login attempt error:", error);
      toast.error("Network error occurred while trying to log in.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex">
      {(isLoading) && <LoadingScreen />}
      {/* Left side: branding/marketing (hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-gray-900 to-black text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Abstract decorative background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600 rounded-full blur-3xl mix-blend-screen opacity-50"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600 rounded-full blur-3xl mix-blend-screen opacity-50"></div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            Unlocking Potential. Expanding Horizons.
          </h2>
          <p className="text-xl text-gray-400 mb-12 font-light leading-relaxed">
            The ultimate gateway to connect with premium franchise
            opportunities, proven business models, and high-quality investors.
          </p>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                <ShieldCheck className="text-red-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Trusted Network
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Access verified profiles of top-tier franchisors and serious
                  investors worldwide.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                <Zap className="text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Rapid Growth
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Accelerate your business expansion with our targeted
                  matchmaking ecosystem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-white">
        <div className="w-full max-w-md relative z-10">
          <div className="mb-10 block">
            <Link
              href="/"
              className="group inline-flex items-center gap-4 transition-all"
            >
              <div className="relative w-14 h-14 bg-white rounded-full p-2 shadow-lg border border-gray-100 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:shadow-red-500/10">
                <div className="relative w-full h-full">
                  <Image
                    src="/logo.png"
                    alt="NFIS Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <div>
                <p className="font-black text-xl text-gray-900 leading-none">
                  NFIS
                </p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                  National Franchise Investment Summit
                </p>
              </div>
            </Link>
          </div>

          <div className="mb-10 lg:mb-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-lg">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-5">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200"
                    placeholder="Enter your password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-500">Don't have an account? </span>
            <Link
              href="/register"
              className="font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
