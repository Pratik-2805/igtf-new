"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Plus, Users, Building, ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

export default function ExecutiveDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Executive");

  useEffect(() => {
    // Check role, ensure it's executive
    const role = localStorage.getItem("user_role");
    if (!role || role !== "executive") {
      router.push("/login");
      return;
    }
    const name = localStorage.getItem("user_name");
    if (name) setUserName(name);
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    toast.info("Logged out successfully");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
              NX
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">NFIS Executive</h1>
              <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider">Internal Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-gray-600 hidden sm:block">
              Welcome, <span className="font-bold text-gray-900">{userName}</span>
            </span>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 py-16">
          <div className="absolute inset-0 opacity-10 bg-[url('/noise.png')] mix-blend-overlay"></div>
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-white/20">
              <ShieldCheck size={14} className="text-indigo-300" />
              Secure Access
            </div>
            <h2 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight leading-tight">
              Executive Dashboard
            </h2>
            <p className="text-indigo-200 text-lg sm:text-xl font-medium max-w-xl leading-relaxed">
              Manage internal data, onboard premium franchisors, and list highly qualified investors directly into the platform pipeline.
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Add Franchisor */}
          <Link href="/executive/franchise/add" className="group block bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
             
             <div className="relative z-10 flex flex-col h-full">
               <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                 <Building size={28} />
               </div>
               <h3 className="text-2xl font-black text-gray-900 mb-3">Onboard Franchisor</h3>
               <p className="text-gray-500 font-medium mb-8 flex-1">
                 Add a new verified franchise profile to the system. Fill out investment specifics, space requirements, and support details.
               </p>
               
               <div className="flex items-center gap-2 text-indigo-600 font-bold group-hover:gap-4 transition-all uppercase tracking-wide text-sm">
                 <Plus size={18} />
                 Begin Onboarding
                 <ChevronRight size={18} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
               </div>
             </div>
          </Link>

          {/* Add Investor */}
          <Link href="/executive/investors/add" className="group block bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:emerald-100 transition-all duration-300 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
             
             <div className="relative z-10 flex flex-col h-full">
               <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                 <Users size={28} />
               </div>
               <h3 className="text-2xl font-black text-gray-900 mb-3">Add Investor Lead</h3>
               <p className="text-gray-500 font-medium mb-8 flex-1">
                 Register a high-network individual or firm into the database. Specify their budget, operating sectors, and timeline.
               </p>
               
               <div className="flex items-center gap-2 text-emerald-600 font-bold group-hover:gap-4 transition-all uppercase tracking-wide text-sm">
                 <Plus size={18} />
                 Register Lead
                 <ChevronRight size={18} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
               </div>
             </div>
          </Link>

        </div>
      </main>
    </div>
  );
}
