"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, User, Settings, LogOut, Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
    } else {
      // In a real app we'd decode the JWT to check expiration/role.
      // We rely on the layout or page to know the role.
      // If we saved it to local storage on login we could read it:
      const storedRole = pathname.includes("/franchisor")
        ? "franchisor"
        : pathname.includes("/investor")
          ? "investor"
          : null;
      setRole(storedRole);
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
  };

  if (!isClient) return null; // Avoid hydration mismatch

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col h-auto md:h-screen sticky top-0 shadow-sm z-10 transition-all duration-300">
        <div className="p-6 md:p-8 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-red-500/20 shadow-lg">
              <span className="text-white font-black text-sm tracking-wider">
                NFIS
              </span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg leading-tight tracking-tight">
                Portal Hub
              </h1>
              <p className="text-xs font-semibold text-red-500 uppercase tracking-widest">
                {role || "Dashboard"}
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            <Link
              href={`/dashboard/${role}`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 text-red-700 font-medium transition-colors"
            >
              <User size={18} className="text-red-600" />
              <span>My Profile</span>
            </Link>
            {/* Add more links later */}
          </nav>

          <div className="mt-auto pt-8 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 font-medium transition-colors"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden p-6 md:p-10 lg:p-12 lg:max-w-6xl mx-auto w-full flex flex-col">
        {children}
      </main>
    </div>
  );
}
