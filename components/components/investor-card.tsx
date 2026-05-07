'use client';

import { Investor } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Briefcase, IndianRupee, ShieldCheck, User } from 'lucide-react';

interface InvestorCardProps {
  investor: Investor;
}

export function InvestorCard({ investor }: InvestorCardProps) {
  return (
    <Link href={`/investors/${investor.id}`}>
      <div className="relative bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
        {/* Verified Badge - Repositioned for visibility */}
        {investor.verified && (
          <div className="absolute right-0 top-0 bg-blue-600 text-white px-3 py-2 rounded-bl-2xl shadow-lg z-20 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-4 duration-500">
            <ShieldCheck size={14} className="shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Verified</span>
          </div>
        )}
      <div className="p-8 flex flex-col h-full">
        <div className="flex items-start gap-8">
          {/* Larger Logo Section */}
          <div className="relative w-32 h-32 rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 flex-shrink-0 bg-white flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
            {investor.image ? (
              <img 
                src={investor.image} 
                alt={investor.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full bg-blue-50/50">
                <User size={40} className="text-blue-600/30" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-blue-700 transition-colors tracking-tight line-clamp-2 leading-tight">
              {investor.firmName || investor.name}
            </h3>
            
            {investor.firmName && (
              <div className="mb-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Principal</p>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-tight truncate">{investor.name}</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-500 mb-4">
              <MapPin size={14} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">{investor.location}</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {investor.preferredIndustries.slice(0, 2).map((ind) => (
                <span key={ind} className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg border border-blue-100 uppercase tracking-widest shadow-sm">
                  {ind}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-gray-50 pt-6">
           <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <IndianRupee size={10} /> Capacity
              </p>
              <p className="text-sm font-black text-gray-900 tracking-tight">{investor.investmentCapacity}</p>
           </div>
           <div className="space-y-1 text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-end gap-1">
                <Briefcase size={10} /> Profile
              </p>
              <p className="text-sm font-bold text-gray-700 tracking-tight">{investor.experience?.replace(/\s*\d+\s*months?/, '').trim()}</p>
           </div>
        </div>

        {/* Description removed as requested - visible only in detail page */}

        <div className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-gray-900/10 hover:shadow-gray-900/30 hover:bg-black transition-all active:scale-[0.98] text-center">
           View Full Profile
        </div>
      </div>
      </div>
    </Link>
  );
}
