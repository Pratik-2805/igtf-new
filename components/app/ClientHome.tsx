'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { FranchiseCard } from '@/components/franchise-card';
import { ExhibitionCard } from '@/components/exhibition-card';
import { HomepageSearchBar } from '@/components/homepage-search-bar';
import { TrendingUp, Award, Users, Target, RefreshCw } from 'lucide-react';
import LoadingScreen from '@/components/loading-screen';
import { Franchise } from '@/lib/types';

export default function Home({
  initialFranchises = [],
  initialExhibitions = []
}: {
  initialFranchises?: Franchise[],
  initialExhibitions?: any[]
}) {
  const [featuredFranchises, setFeaturedFranchises] = useState<Franchise[]>(initialFranchises);
  const [loadingFranchises, setLoadingFranchises] = useState(false);
  const [apiExhibitions, setApiExhibitions] = useState<any[]>(initialExhibitions);
  const [loadingExhibitions, setLoadingExhibitions] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem('access_token');
      setIsLoggedIn(!!token);
    };
    checkLogin();
    window.addEventListener('auth-change', checkLogin);
    window.addEventListener('storage', checkLogin);
    return () => {
      window.removeEventListener('auth-change', checkLogin);
      window.removeEventListener('storage', checkLogin);
    };
  }, []);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    async function fetchFranchises() {
      setLoadingFranchises(true);
      const NFIS_PLATFORMS = 'nfis,NFIS,nfis.in,manual,MANUAL';
      try {
        const franchisorRes = await fetch(`${API_URL}/api/franchisor-registrations/?source_platform=${NFIS_PLATFORMS}`);

        let franchisors: any[] = [];

        if (franchisorRes.ok) {
          const data = await franchisorRes.json();
          franchisors = data.results || data;
        }

        const allItems = [
          ...franchisors.map(f => ({ ...f, _type: 'franchisor' }))
        ];

        const mapped: Franchise[] = allItems
          .filter((item: any) => item.status === 'contacted' || item.status === 'paid')
          .map((item: any) => {
            const investmentStr = item.investment_required || '';
            const minMatch = investmentStr.split('-')[0]?.match(/([\d.]+)\s*(K|Lakh|Lakhs|Crore|Crores)/i);
            const maxMatch = investmentStr.split('-')[1]?.match(/([\d.]+)\s*(K|Lakh|Lakhs|Crore|Crores)/i);

            const parseVal = (match: any) => {
              if (!match) return 0;
              let val = parseFloat(match[1]);
              const unit = (match[2] || '').toLowerCase();
              if (unit === 'k') val *= 1000;
              else if (unit === 'lakh' || unit === 'lakhs') val *= 100000;
              else if (unit === 'crore' || unit === 'crores') val *= 10000000;
              return val;
            };

            const minInvest = parseVal(minMatch);
            const maxInvest = parseVal(maxMatch) || minInvest * 1.5;

            let cities: string[] = [];
            if (item.cities) {
              cities = item.cities.split(',').map((c: string) => c.trim()).filter(Boolean);
            } else if (item.event_location) {
              cities = [item.event_location];
            }

            return {
              id: `${item._type}-${item.id}`,
              brandName: item.company_name || 'Upcoming Franchise',
              name: item.company_name || 'Upcoming Franchise',
              logo: item.logo || null,
              category: (item.industry || item.product_category || 'General').split(/[;,]/)[0].trim(),
              productCategory: item.product_category || '',
              categories: (item.industry || item.product_category || 'General').split(/[;,]/).map((s: string) => s.trim()).filter(Boolean),
              description: item.about || item.product_category || '',
              shortDescription: item.product_category || item.about || '',
              investmentRange: item.investment_required || (minInvest ? `\u20B9${minInvest}` : 'TBD'),
              investmentRangeValue: { min: minInvest, max: maxInvest || minInvest * 1.5 },
              roiTime: item.roi || '12–18 months',
              roi: item.roi || '',
              totalOutlets: Number(item.units_operating) || 0,
              unitsOperating: Number(item.units_operating) || 0,
              verified: item.status === 'paid',
              state: cities[0] || '',
            } as any;
          });

        setFeaturedFranchises(mapped.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch franchises:', err);
      } finally {
        setLoadingFranchises(false);
      }
    }

    async function fetchEvents() {
      // Check removed to allow periodic refreshes
      setLoadingExhibitions(true);
      try {
        const response = await axios.get('/api/events-proxy');
        const data = response.data;

        if (data && data.results) {
          const events = data.results.map((item: any) => ({
            id: item.id.toString(),
            name: item.title,
            location: item.location || item.venue || 'TBA',
            date: item.start_date,
            description: item.description || 'No description available',
            image: item.image || '',
            featured: item.is_active,
            attendees: parseInt(item.buyers_count) || undefined,
            booths: parseInt(item.exhibitors_count) || undefined,
          }));
          setApiExhibitions(events);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoadingExhibitions(false);
      }
    }

    const refreshAll = () => {
      fetchFranchises();
      fetchEvents();
    };

    // Initial fetch on mount
    refreshAll();

    // Enable periodic refreshes every 5 minutes
    const pollInterval = setInterval(refreshAll, 300000);

    return () => clearInterval(pollInterval);
  }, [API_URL]);

  const featuredExhibitions = apiExhibitions.length > 0
    ? apiExhibitions.filter((e) => e.featured).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 2)
    : []; // Show empty or handle mock logic if desired

  return (
    <div className="min-h-screen">
      {(loadingFranchises || loadingExhibitions) && <LoadingScreen />}
      {/* Hero Section */}
      <section className="relative text-white py-20 md:py-36 overflow-hidden min-h-[90vh] flex items-center">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted // Sound disabled for background atmosphere
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          >
            <source src="/video.mp4" type="video/mp4" />
          </video>
          {/* Vignette layer 1 — dark edges, clear centre so video stays visible */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.72) 100%)' }} />
          {/* Vignette layer 2 — heavy top & bottom so logo/text/search bar are legible */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.08) 38%, rgba(0,0,0,0.08) 62%, rgba(0,0,0,0.75) 100%)' }} />
          {/* Vignette layer 3 — subtle brand warmth */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(5,10,40,0.18) 0%, transparent 50%, rgba(40,5,5,0.14) 100%)' }} />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center mb-10">
            <div className="relative w-32 h-32 mx-auto mb-10 group select-none transition-all duration-700">
              {/* Refined Glowing Orbs in Background */}
              <div className="absolute -inset-8 bg-white/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <div className="absolute -inset-4 bg-gradient-to-tr from-red-500/20 to-blue-500/20 rounded-full blur-2xl animate-pulse group-hover:scale-150 transition-all duration-1000"></div>

              {/* White Circular Hero Logo Backdrop */}
              <div className="relative w-full h-full bg-white rounded-full p-2 shadow-2xl flex items-center justify-center border-4 border-white/20 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110 group-hover:shadow-[0_0_80px_rgba(255,255,255,0.3)]">
                <div className="relative w-full h-full transform transition-transform duration-1000 group-hover:scale-110">
                  <Image
                    src="/logo.png"
                    alt="National Franchise India Summit (NFIS) - India's Premier Business Growth Platform"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              {/* Elegant Accent Rings */}
              <div className="absolute -inset-2 border border-white/10 rounded-full transition-all duration-1000 group-hover:scale-125 group-hover:opacity-0"></div>
              <div className="absolute -inset-4 border border-white/5 rounded-full transition-all duration-1000 group-hover:scale-150 group-hover:opacity-0 delay-75"></div>
            </div>
            <p className="text-sm md:text-base font-semibold text-red-200 mb-3 uppercase tracking-[0.3em]">India's Premier Franchise Ecosystem</p>
            <h1 className="text-4xl md:text-7xl font-bold mb-4 leading-tight text-balance">
              National Franchise <br className="hidden md:block" /> Investment Summit
            </h1>
          </div>

          {/* Search Bar */}
          <div className="relative z-20 w-full mt-2">
            <HomepageSearchBar />
          </div>
        </div>
      </section>

      {/* Featured Franchises */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">
              Explore Franchise Brands Exhibiting
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Top franchise brands across diverse industries will be showcasing their opportunities at our summits.
            </p>
          </div>

          <div className={`grid gap-8 mb-8 min-h-[400px] ${
            featuredFranchises.length === 1
              ? "max-w-md mx-auto grid-cols-1"
              : featuredFranchises.length === 2
                ? "max-w-4xl mx-auto md:grid-cols-2"
                : "grid-cols-1 md:grid-cols-3"
          }`}>
            {loadingFranchises ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <RefreshCw className="animate-spin text-red-600 mb-4" size={40} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Accessing Franchise Network...</p>
              </div>
            ) : featuredFranchises.length > 0 ? (
              featuredFranchises.map((franchise) => (
                <FranchiseCard key={franchise.id} franchise={franchise} />
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-500">Currently Onboarding. Please visit after sometime.</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <a
              href="/franchises"
              className="inline-block px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Explore All Brands
            </a>
          </div>
        </div>
      </section>

      {/* Featured Exhibitions */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Upcoming Exhibitions & Events
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Connect with franchisors and industry experts at premier franchise exhibitions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {featuredExhibitions.map((exhibition) => (
              <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
            ))}
          </div>

          <div className="text-center">
            <a
              href="/exhibitions"
              className="inline-block px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              View All Events
            </a>
          </div>
        </div>
      </section>

      {/* Industry Focus Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 mb-6">
                <TrendingUp size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Market Intelligence</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-tight tracking-tighter">
                Tap Into High-Growth <br /> Franchise Sectors
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-10 font-medium max-w-xl text-balance">
                The Indian franchise ecosystem is evolving rapidly. Explore vetted opportunities across our 12 major industry verticals, each curated for scalability and high return on investment.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {[
                  "QSR", "Health & Wellness", "Education & Training", "Global Pavilion",
                  "Retail & Lifestyle", "Hospitality & Stay", "Kids & Entertainment", "Ecosystem & Support",
                  "Automobile & EV", "Business Services", "Home Services", "Finance & Banking"
                ].map((sector) => (
                  <Link
                    key={sector}
                    href={`/franchises?category=${encodeURIComponent(sector)}`}
                    className="flex flex-col gap-2 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-600 group-hover:scale-150 transition-all duration-300"></div>
                      <span className="text-xs font-black text-gray-800 group-hover:text-red-600 transition-colors uppercase tracking-tight">{sector}</span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-12">
                <Link
                  href="/franchises"
                  className="inline-flex items-center gap-2 text-sm font-black text-gray-900 hover:text-red-600 transition-colors uppercase tracking-widest border-b-2 border-gray-900 hover:border-red-600 pb-1"
                >
                  Explore All Franchisors
                </Link>
              </div>
            </div>
            <div className="flex-1 relative order-first lg:order-last">
              <div className="relative aspect-square max-w-md mx-auto">
                {/* Decorative Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-blue-600 rounded-[4rem] rotate-6 opacity-5 blur-2xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-gray-100 rounded-full animate-pulse-slow"></div>

                <div className="relative z-10 w-full h-full bg-gray-50 rounded-[3rem] border border-gray-100 shadow-2xl p-12 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-400 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
                  </div>
                  <Image
                    src="/logo.png"
                    alt="Franchise Industry Growth India - 12 Major Categories"
                    width={400}
                    height={400}
                    className="relative z-10 w-full h-full object-contain scale-90 animate-up-down"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-red-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center text-balance">
            Why Attend National Franchise India Summit?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'For Franchisees',
                description: 'Meet 500+ brands in one place. Compare business models, discuss terms, and find your perfect franchise match.',
              },
              {
                title: 'For Franchisors',
                description: 'Connect with qualified franchisees, expand your network, showcase your opportunity, and accelerate growth.',
              },
              {
                title: 'For Investors',
                description: 'Discover high-potential franchise brands, meet franchisors directly, and identify investment opportunities.',
              },
              {
                title: 'Expert Consultations',
                description: 'Access franchise consultants, legal experts, and industry professionals for personalized guidance.',
              },
              {
                title: 'Networking Events',
                description: 'Participate in seminars, workshops, and networking sessions with industry leaders.',
              },
              {
                title: 'Premium Experience',
                description: 'Enjoy world-class venues, professional management, and curated networking opportunities.',
              },
            ].map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b border-gray-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Award className="text-blue-700" size={24} />
              </div>
              <p className="text-3xl font-bold text-gray-900">15+</p>
              <p className="text-sm text-gray-600">Summit Locations</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="text-red-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-gray-900">500+</p>
              <p className="text-sm text-gray-600">Brand Exhibitors</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="text-blue-700" size={24} />
              </div>
              <p className="text-3xl font-bold text-gray-900">50K+</p>
              <p className="text-sm text-gray-600">Annual Attendees</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="text-red-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-gray-900">2000+</p>
              <p className="text-sm text-gray-600">Deals Facilitated</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="py-20 bg-gradient-to-br from-blue-700 via-blue-600 to-red-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Ready to Transform Your Franchise Journey?
            </h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto text-balance">
              Join thousands of entrepreneurs, franchisors, and investors at the National Franchise India Summit.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/register?type=franchisor"
                className="px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                Register as Franchisor
              </Link>
              <Link
                href="/register?type=visitor"
                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                Register as Visitor
              </Link>
              <Link
                href="/register?type=investor"
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                Register as Investor
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
