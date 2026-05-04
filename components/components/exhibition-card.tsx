'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Exhibition } from '@/lib/types';
import { Calendar, MapPin, Users, Store, Building2 } from 'lucide-react';

interface ExhibitionCardProps {
  exhibition: Exhibition;
}

export function ExhibitionCard({ exhibition }: ExhibitionCardProps) {
  const formattedDate = new Date(exhibition.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const internalUrl = `/exhibitions/${exhibition.id}`;

  return (
    <Link href={internalUrl}>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-red-300 transition-all duration-300 h-full flex flex-col">
        {/* Image Section */}
        <div className={`relative w-full h-48 overflow-hidden bg-gray-100 ${!exhibition.featured ? 'grayscale-[0.5] opacity-90' : ''}`}>
          {exhibition.image ? (
            <Image
              src={exhibition.image}
              alt={exhibition.name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-200 border-b border-gray-100">
              <Building2 size={40} className="text-red-600/20 mb-2" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600/40 text-center px-8">National Franchise Investment Summit</p>
            </div>
          )}
          {exhibition.featured ? (
            <div className="absolute top-3 left-3">
              <span className="inline-block bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                Featured
              </span>
            </div>
          ) : (
            <div className="absolute top-3 left-3">
              <span className="inline-block bg-gray-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                Completed
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Title */}
          <h3 className="font-bold text-lg mb-3 text-gray-900">{exhibition.name}</h3>

          {/* Date and Location */}
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-red-600 flex-shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-red-600 flex-shrink-0" />
              <span className="line-clamp-1">{exhibition.location}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
            {exhibition.description}
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-t border-gray-100">
            {exhibition.attendees && (
              <div className="flex items-center gap-2 text-sm">
                <Users size={14} className="text-red-600" />
                <span className="font-semibold text-gray-900">{exhibition.attendees.toLocaleString()}</span>
              </div>
            )}
            {exhibition.booths && (
              <div className="flex items-center gap-2 text-sm">
                <Store size={14} className="text-red-600" />
                <span className="font-semibold text-gray-900">{exhibition.booths} Booths</span>
              </div>
            )}
          </div>

          {/* Learn More Button */}
          <div className={`w-full px-4 py-2 ${exhibition.featured ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-800 hover:bg-gray-900'} text-white font-semibold rounded-lg transition-all duration-200 text-center`}>
            {exhibition.featured ? 'Learn More' : 'Event Concluded'}
          </div>
        </div>
      </div>
    </Link>
  );
}
