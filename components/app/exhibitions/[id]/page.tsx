import { Metadata } from 'next';
import Image from 'next/image';
import { Calendar, MapPin, Users, Store, Globe, Clock, ChevronRight, Zap, Target } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

async function getEvent(id: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  try {
    const res = await fetch(`${API_URL}/api/events/`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.results?.find((e: any) => e.id.toString() === id) || null;
  } catch (error) {
    console.error('Error fetching event for metadata:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    return {
      title: 'Event Not Found | NFIS',
    };
  }

  const title = `${event.title} | National Franchise Investment Summit`;
  const description = event.description?.substring(0, 160) || `Join the ${event.title} at NFIS. Connect with leading franchise brands and investors.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://nationalfranchiseinvestmentsummit.com/exhibitions/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://nationalfranchiseinvestmentsummit.com/exhibitions/${id}`,
      type: 'article',
      images: event.image ? [{ url: event.image }] : [],
    },
  };
}

export default async function ExhibitionDetailsPage({ params }: Props) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    return notFound();
  }

  const formattedStartDate = event.start_date
    ? new Date(event.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'TBA';
  const formattedEndDate = event.end_date
    ? new Date(event.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'TBA';

  const defaultImage = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80';

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Dynamic Hero Section */}
      <section className="relative w-full h-[50vh] min-h-[400px] flex items-end overflow-hidden pt-16">
        <div className="absolute inset-0 z-0">
          <Image
            src={event.image || defaultImage}
            alt={event.title || 'Exhibition Image'}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent mix-blend-multiply"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pb-10">
          <div className="mb-4 flex items-center gap-2 text-red-200 text-sm font-semibold uppercase tracking-wider backdrop-blur-sm bg-black/20 inline-flex px-3 py-1 rounded-full border border-red-200/20">
            <Link href="/exhibitions" className="hover:text-white transition-colors">Events</Link>
            <ChevronRight size={14} />
            <span>Exhibition Details</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-gray-200 text-sm sm:text-base font-medium">
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-gray-100/10">
              <Calendar size={18} className="text-red-500" />
              <span>{formattedStartDate} - {formattedEndDate}</span>
            </div>
            {(event.location || event.venue) && (
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-gray-100/10">
                <MapPin size={18} className="text-red-500" />
                <span>{event.location} {event.venue && `— ${event.venue}`}</span>
              </div>
            )}
            {event.is_active && (
              <div className="flex items-center gap-2 bg-red-600/90 backdrop-blur-md px-4 py-2 rounded-full text-white shadow-xl shadow-red-900/50">
                <Zap size={16} className="fill-white" />
                <span>Trending Now</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                About The Exhibition
              </h2>
              <div className="prose max-w-none text-gray-600 leading-relaxed text-base md:text-lg whitespace-pre-wrap">
                {event.description || 'Detailed description for this exhibition is currently not available.'}
              </div>
            </div>

            {event.time_schedule && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 border border-blue-100/50">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-blue-600" />
                  Time Schedule
                </h2>
                <p className="text-gray-700 font-medium text-lg bg-white inline-block px-5 py-2.5 rounded-lg shadow-sm border border-gray-100">
                  {event.time_schedule}
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-4 mb-4">
                  Event Statistics
                </h3>
                
                <ul className="space-y-4">
                  {event.exhibitors_count && (
                    <li className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 text-gray-600 font-medium">
                        <Store size={18} className="text-red-500" /> Exhibiting Brands
                      </div>
                      <span className="font-bold text-gray-900">{event.exhibitors_count}</span>
                    </li>
                  )}
                  {event.buyers_count && (
                    <li className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 text-gray-600 font-medium">
                        <Users size={18} className="text-blue-500" /> Total Buyers
                      </div>
                      <span className="font-bold text-gray-900">{parseInt(event.buyers_count).toLocaleString()}</span>
                    </li>
                  )}
                  {event.countries_count && (
                    <li className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 text-gray-600 font-medium">
                        <Globe size={18} className="text-green-500" /> Participating Countries
                      </div>
                      <span className="font-bold text-gray-900">{event.countries_count}</span>
                    </li>
                  )}
                  {event.sectors_count && (
                    <li className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 text-gray-600 font-medium">
                        <Target size={18} className="text-purple-500" /> Verified Sectors
                      </div>
                      <span className="font-bold text-gray-900">{event.sectors_count}</span>
                    </li>
                  )}
                </ul>
              </div>

              {event.is_active ? (
                <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-6 shadow-lg shadow-red-900/20 text-white text-center">
                  <h3 className="text-2xl font-bold mb-2">Secure Your Spot</h3>
                  <p className="text-red-100 text-sm mb-6">
                    Connect with serious investors and top brands. Register today.
                  </p>
                  
                  <div className="space-y-3">
                    <Link href="/register" className="block w-full py-3 px-4 bg-white text-red-700 font-bold rounded-xl hover:bg-gray-50 transform transition-all active:scale-95 shadow-md">
                      Book Exhibition Booth
                    </Link>
                    <Link href="/register" className="block w-full py-3 px-4 bg-white/10 border border-red-200/30 text-white font-bold rounded-xl hover:bg-white/20 transform transition-all active:scale-95">
                      Register as Visitor
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-2xl p-6 shadow-md text-center text-white">
                  <h3 className="text-2xl font-bold mb-2">Event Concluded</h3>
                  <p className="text-gray-300 text-sm">
                    This exhibition has ended successfully. Stay tuned for dates on to upcoming editions!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
