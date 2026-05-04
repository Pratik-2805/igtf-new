'use client';

import { ExhibitionCard } from '@/components/exhibition-card';

import { Search, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import LoadingScreen from '@/components/loading-screen';

export default function ExhibitionsPage({ initialExhibitions = [] }: { initialExhibitions?: any[] }) {
  const [exhibitions, setExhibitions] = useState<any[]>(initialExhibitions);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  useEffect(() => {
    const fetchExhibitions = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/events-proxy');
        if (response.ok) {
          const data = await response.json();
          if (data && data.results) {
            const mapped = data.results.map((item: any) => ({
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
            setExhibitions(mapped);
          }
        }
      } catch (error) {
        console.error('Failed to fetch exhibitions:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchExhibitions();

    // Enable periodic polling every 30 seconds
    const pollInterval = setInterval(fetchExhibitions, 30000);

    return () => clearInterval(pollInterval);
  }, []);

  const filtered = exhibitions.filter((exhibition) => {
    const matchesSearch =
      exhibition.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exhibition.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exhibition.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFeatured = !featuredOnly || exhibition.featured;

    return matchesSearch && matchesFeatured;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading && <LoadingScreen />}
        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Franchise Exhibitions & Events
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Connect with franchisors and industry leaders at our premier franchise exhibitions across India.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24 shadow-sm">
              <h3 className="text-lg font-bold mb-6 text-gray-900 flex items-center gap-2">
                <Search size={20} className="text-red-600" /> Filters
              </h3>

              {/* Search */}
              <div className="mb-8">
                <label htmlFor="search" className="text-sm font-semibold mb-3 block text-gray-700">
                  Search Events
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    id="search"
                    placeholder="Search exhibitions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 transition-all"
                  />
                </div>
              </div>

              {/* Featured Filter */}
              <div className="mb-8">
                <div className="flex items-center p-3 rounded-lg bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setFeaturedOnly(!featuredOnly)}>
                  <input
                    type="checkbox"
                    id="featured"
                    checked={featuredOnly}
                    onChange={(e) => setFeaturedOnly(e.target.checked)}
                    className="h-5 w-5 shrink-0 rounded-md border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                  <label htmlFor="featured" className="ml-3 text-sm cursor-pointer font-medium text-gray-900">
                    Featured Events Only
                  </label>
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFeaturedOnly(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-white border-2 border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200 transition-all"
              >
                Reset All Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Count */}
            <div className="mb-8 flex items-center justify-between">
              <p className="text-gray-600 font-medium">
                Showing <span className="text-red-600 font-bold">{filtered.length}</span> exhibitions
              </p>
            </div>

            {filtered.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-8">
                {filtered.map((exhibition) => (
                  <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="text-red-500" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No exhibitions found</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                  We couldn't find any exhibitions matching your current filters. Try adjusting your search criteria.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFeaturedOnly(false);
                  }}
                  className="inline-flex items-center justify-center px-8 py-3 rounded-xl text-base font-bold bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

  );
}
