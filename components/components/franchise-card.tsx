'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Store, Clock, ShieldCheck } from 'lucide-react';

interface FranchiseCardProps {
  franchise: any;
}

export function FranchiseCard({ franchise }: FranchiseCardProps) {
  // Use the exact fields from our new schema
  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-gray-200 transition-all duration-500 h-full flex flex-col group translate-y-0 hover:-translate-y-2 relative">
      {/* Verified Badge */}
      {franchise.verified && (
        <div className="absolute right-0 top-0 bg-blue-600 text-white px-3 py-2 rounded-bl-2xl shadow-lg z-20 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-4 duration-500">
          <ShieldCheck size={14} className="shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">Verified</span>
        </div>
      )}

      {/* Visual Header Section - Full width image */}
      <div className="relative w-full h-48 bg-gray-50 border-b border-gray-50 overflow-hidden">
         {franchise.logo ? (
           <img 
             src={franchise.logo} 
             alt={`${franchise.brandName} Logo`} 
             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
           />
         ) : (
           <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50/50 to-orange-50/50">
             <Store size={48} className="text-gray-200" />
           </div>
         )}
      </div>

      {/* Content Section */}
      <div className="p-8 flex flex-col flex-grow relative bg-white">
        
        {/* Brand Name and Category - Now side by side */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <h3 className="font-black text-3xl text-gray-900 group-hover:text-red-600 transition-colors leading-tight tracking-tighter">
            {franchise.brandName || "Brand Name"}
          </h3>
          <span className="shrink-0 inline-block bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-red-100 shadow-sm">
            {franchise.category || 'General'}
          </span>
        </div>

        {/* Short Description */}
        <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-2 font-medium">
          {franchise.description || "A premier franchise opportunity ready for expansion."}
        </p>

        {/* Highlighted Investment Box */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-16 h-16 bg-red-600/5 rounded-bl-full -z-0"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Investment Range</p>
          <p className="text-xl font-black text-gray-900 relative z-10">
            {franchise.investmentRange || 'N/A'}
          </p>
        </div>

        {/* ROI Time */}
        <div className="flex items-center gap-3 mb-8">
           <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
             <Clock size={18} />
           </div>
           <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Est. ROI Time</p>
             <p className="text-sm font-bold text-gray-900">{franchise.roiTime || 'N/A'}</p>
           </div>
        </div>

        <div className="mt-auto">
          {/* CTA Button */}
          <Link href={`/franchises/${franchise.id}`} className="block w-full text-center px-6 py-4 bg-gray-900 group-hover:bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-colors shadow-md group-hover:shadow-red-600/30">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
