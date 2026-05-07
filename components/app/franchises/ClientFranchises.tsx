'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { FranchiseCard } from '@/components/franchise-card';
import { Franchise } from '@/lib/types';
import {
  Search, Filter, Briefcase, ChevronDown, Check, X,
  ShieldCheck, ArrowUpDown, TrendingUp, Users, RefreshCw, Zap, MapPin, IndianRupee, LayoutGrid,
} from 'lucide-react';
import LoadingScreen from '@/components/loading-screen';

type SortOption = 'relevance' | 'investment-asc' | 'investment-desc' | 'roi-desc' | 'units-desc';

const INVESTMENT_BUCKETS = [
  { label: 'Any Investment', value: '',          min: 0,        max: Infinity },
  { label: 'Under ₹5 Lakhs', value: 'under-5l', min: 0,        max: 500000 },
  { label: '₹5L – ₹10L',     value: '5l-10l',   min: 500000,   max: 1000000 },
  { label: '₹10L – ₹25L',    value: '10l-25l',  min: 1000000,  max: 2500000 },
  { label: '₹25L – ₹50L',    value: '25l-50l',  min: 2500000,  max: 5000000 },
  { label: '₹50L – ₹1 Cr',   value: '50l-1cr',  min: 5000000,  max: 10000000 },
  { label: '₹1 Cr – ₹5 Cr',  value: '1cr-5cr',  min: 10000000, max: 50000000 },
  { label: 'Above ₹5 Cr',    value: 'above-5cr', min: 50000000, max: Infinity },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance', Icon: ArrowUpDown },
  { value: 'investment-asc', label: 'Investment: Low → High', Icon: TrendingUp },
  { value: 'investment-desc', label: 'Investment: High → Low', Icon: TrendingUp },
  { value: 'roi-desc', label: 'Highest ROI', Icon: Zap },
  { value: 'units-desc', label: 'Most Units', Icon: Users },
];

const FALLBACK_STATES = [
  'All States',
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
];

type DDName = 'investment' | 'category' | 'state' | 'sort' | null;

export default function FranchisesPage({ initialFranchises = [] }: { initialFranchises?: Franchise[] }) {
  const searchParams = useSearchParams();

  const [franchises, setFranchises] = useState<Franchise[]>(initialFranchises);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBucket, setActiveBucket] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Dropdown state
  const [openDD, setOpenDD] = useState<DDName>(null);
  const [ddRect, setDdRect] = useState<{ top: number; left: number; width: number } | null>(null);

  const investmentBtnRef = useRef<HTMLButtonElement>(null);
  const categoryBtnRef = useRef<HTMLButtonElement>(null);
  const stateBtnRef = useRef<HTMLButtonElement>(null);
  const sortBtnRef = useRef<HTMLButtonElement>(null);

  const btnRefs: Record<Exclude<DDName, null>, React.RefObject<HTMLButtonElement | null>> = {
    investment: investmentBtnRef,
    category: categoryBtnRef,
    state: stateBtnRef,
    sort: sortBtnRef,
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Close dropdown on outside click or scroll
  useEffect(() => {
    if (!openDD) return;
    function onClose() { setOpenDD(null); setDdRect(null); }
    function onOutside(e: MouseEvent) {
      const panel = document.querySelector('[data-dd-panel]');
      if (panel && panel.contains(e.target as Node)) return;
      const btn = openDD ? btnRefs[openDD].current : null;
      if (btn && btn.contains(e.target as Node)) return;
      onClose();
    }
    window.addEventListener('scroll', onClose, { passive: true });
    document.addEventListener('mousedown', onOutside);
    return () => {
      window.removeEventListener('scroll', onClose);
      document.removeEventListener('mousedown', onOutside);
    };
  }, [openDD]);

  const toggleDD = (name: Exclude<DDName, null>) => {
    if (openDD === name) { setOpenDD(null); setDdRect(null); return; }
    const btn = btnRefs[name].current;
    if (btn) {
      const r = btn.getBoundingClientRect();
      setDdRect({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 220) });
    }
    setOpenDD(name);
  };

  const ddStyle = (): React.CSSProperties => ({
    position: 'fixed',
    zIndex: 9999,
    top: ddRect?.top ?? 0,
    left: Math.max(8, Math.min(ddRect?.left ?? 0, window.innerWidth - (ddRect?.width ?? 220) - 8)),
    width: ddRect?.width ?? 220,
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #e5e7eb',
    boxShadow: '0 12px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.07)',
    overflow: 'hidden',
  });

  // Read URL params from hero search bar
  useEffect(() => {
    const keyword = searchParams.get('keyword') || '';
    const category = searchParams.get('category') || '';
    const investment = searchParams.get('investment') || '';
    const state = searchParams.get('state') || '';
    if (keyword) setSearchQuery(keyword);
    if (category) setSelectedCategories([category]);
    if (state) setSelectedState(state);
    if (investment) setActiveBucket(investment);
  }, [searchParams]);

  // Data fetch
  useEffect(() => {
    const fetchFranchises = async () => {
      setLoading(true);
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
            let maxInvest = parseVal(maxMatch);
            if (minInvest > 0 && maxInvest === 0) maxInvest = minInvest;

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
              investmentRange: item.investment_required || 'TBD',
              investmentRangeValue: { min: minInvest, max: maxInvest || minInvest * 1.5 },
              franchiseFee: item.franchise_fee || '',
              royalty: item.royalty || '',
              spaceRequirement: item.space_requirement || '',
              locationType: item.location_type || '',
              roiTime: item.roi || '12–18 months',
              roi: item.roi || '',
              breakEven: item.break_even || '',
              totalOutlets: Number(item.units_operating) || 0,
              unitsOperating: Number(item.units_operating) || 0,
              cities,
              trainingSupport: item.training_support || false,
              setupSupport: item.setup_support || false,
              marketingSupport: item.marketing_support || false,
              verified: item.status === 'paid',
              state: cities[0] || '',
            } as any;
          });
        setFranchises(mapped);
      } catch (err) {
        console.error('Failed to fetch franchises:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFranchises();
    const poll = setInterval(fetchFranchises, 300000); // Poll every 5 minutes
    return () => clearInterval(poll);
  }, [API_URL]);

  // Derived data
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    franchises.forEach(f => f.categories.forEach(cat => { counts[cat] = (counts[cat] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [franchises]);

  const availableStates = useMemo(() => {
    const set = new Set<string>();
    franchises.forEach((f: any) => { if (f.state) set.add(f.state); });
    return Array.from(set).sort();
  }, [franchises]);

  const stateList = availableStates.length > 0 ? availableStates : FALLBACK_STATES.slice(1);

  const toggleCategory = (cat: string) =>
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  // Filtering & sorting
  const filteredAndSorted = useMemo(() => {
    const bucket = INVESTMENT_BUCKETS.find(b => b.value === activeBucket);
    const result = franchises.filter((brand: any) => {
      const matchesSearch = (brand.brandName || brand.name).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || brand.categories.some((c: string) => selectedCategories.includes(c));
      const matchesInvestment = !bucket || bucket.value === ''
        ? true
        : brand.investmentRangeValue.min >= bucket.min && brand.investmentRangeValue.min <= bucket.max;
      const matchesVerified = !verifiedOnly || brand.verified;
      const matchesState = !selectedState || (brand.state && brand.state.toLowerCase().includes(selectedState.toLowerCase()));
      return matchesSearch && matchesCategory && matchesInvestment && matchesVerified && matchesState;
    });

    switch (sortBy) {
      case 'investment-asc': result.sort((a, b) => a.investmentRangeValue.min - b.investmentRangeValue.min); break;
      case 'investment-desc': result.sort((a, b) => b.investmentRangeValue.min - a.investmentRangeValue.min); break;
      case 'roi-desc': result.sort((a, b) => {
        const roi = (r: string | number) => { const m = String(r).match(/(\d+)/); return m ? parseInt(m[0]) : 0; };
        return roi(b.roi) - roi(a.roi);
      }); break;
      case 'units-desc': result.sort((a, b) => b.unitsOperating - a.unitsOperating); break;
    }
    return result;
  }, [franchises, searchQuery, selectedCategories, activeBucket, sortBy, verifiedOnly, selectedState]);

  const resetFilters = () => {
    setSearchQuery(''); setSelectedCategories([]); setActiveBucket('');
    setSelectedState(''); setSortBy('relevance'); setVerifiedOnly(false);
  };

  const hasActiveFilters = searchQuery || selectedCategories.length > 0 || activeBucket || selectedState || verifiedOnly || sortBy !== 'relevance';

  const activeBucketLabel = INVESTMENT_BUCKETS.find(b => b.value === activeBucket)?.label || 'Any Investment';
  const activeSortLabel = SORT_OPTIONS.find(s => s.value === sortBy)?.label || 'Relevance';

  /** Shared dropdown trigger class */
  const triggerCls = (active: boolean) =>
    `w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl border-2 text-sm font-bold transition-all ${active ? 'bg-red-50 border-red-300 text-red-700' : 'bg-gray-50/70 border-transparent text-gray-600 hover:bg-gray-100/80'
    }`;

  /** Shared dropdown item class */
  const itemCls = (selected: boolean) =>
    `w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold transition-colors ${selected ? 'bg-red-50 text-red-700' : 'text-gray-700 hover:bg-gray-50'
    }`;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h1 className="text-6xl font-black text-gray-900 tracking-tighter mb-4">Franchise Hub</h1>
            <p className="text-xl text-gray-500 font-medium leading-relaxed">
              Discover {franchises.length} premium brands ready to scale with your investment.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xl">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><Briefcase size={28} /></div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Network</p>
              <p className="text-sm font-black text-gray-900 uppercase">{franchises.length} ACTIVE BRANDS</p>
            </div>
          </div>
        </div>

        {loading && <LoadingScreen />}

        {franchises.length === 0 && !loading ? (
          <div className="bg-white rounded-[3rem] border border-gray-100 p-24 text-center shadow-xl max-w-3xl mx-auto mt-12 mb-24">
            <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Currently Onboarding.</h3>
            <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed text-lg">Please come back after sometime.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-12">

            {/* ══ Sidebar ════════════════════════════════════════════════ */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-7 shadow-2xl sticky top-24">

                {/* Header */}
                <div className="flex items-center justify-between mb-7">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Filter size={17} className="text-red-500" /> Filter Hub
                  </h3>
                  {hasActiveFilters && (
                    <button onClick={resetFilters} className="text-[10px] font-black uppercase text-red-600 hover:underline flex items-center gap-1">
                      <RefreshCw size={10} /> Reset
                    </button>
                  )}
                </div>

                <div className="space-y-5">

                  {/* ── Search ── */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400">Search Brand</label>
                    <div className="relative group">
                      <Search className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-red-500 transition-colors" size={16} />
                      <input
                        placeholder="e.g. Cafe, Retail..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-9 py-3 bg-gray-50/70 border-2 border-transparent rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-400 transition-all font-semibold text-sm"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ── Sort By ── */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400">Sort By</label>
                    <button ref={sortBtnRef} type="button" onClick={() => toggleDD('sort')} className={triggerCls(sortBy !== 'relevance')}>
                      <span className="truncate">{activeSortLabel}</span>
                      <ChevronDown size={14} className={`shrink-0 text-gray-400 transition-transform ${openDD === 'sort' ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* ── Verified Toggle ── */}
                  <div
                    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border transition-colors ${verifiedOnly ? 'bg-blue-50/80 border-blue-200' : 'bg-gray-50/50 border-gray-100 hover:bg-blue-50/30'
                      }`}
                    onClick={() => setVerifiedOnly(!verifiedOnly)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${verifiedOnly ? 'bg-blue-600 text-white' : 'bg-white text-blue-500'}`}>
                        <ShieldCheck size={16} />
                      </div>
                      <span className="text-sm font-bold text-blue-900">Verified Hub</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${verifiedOnly ? 'bg-blue-600' : 'bg-gray-200'}`}>
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${verifiedOnly ? 'left-6' : 'left-1'}`} />
                    </div>
                  </div>

                  {/* ── Investment Range ── */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400 flex items-center gap-1">
                      <IndianRupee size={10} /> Investment Range
                    </label>
                    <button ref={investmentBtnRef} type="button" onClick={() => toggleDD('investment')} className={triggerCls(!!activeBucket)}>
                      <span className="truncate">{activeBucketLabel}</span>
                      <ChevronDown size={14} className={`shrink-0 text-gray-400 transition-transform ${openDD === 'investment' ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* ── Category ── */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400 flex items-center gap-1">
                      <LayoutGrid size={10} /> Category
                    </label>
                    <button ref={categoryBtnRef} type="button" onClick={() => toggleDD('category')} className={triggerCls(selectedCategories.length > 0)}>
                      <span className="truncate">
                        {selectedCategories.length === 0
                          ? 'All Categories'
                          : selectedCategories.length === 1
                            ? selectedCategories[0]
                            : `${selectedCategories.length} selected`}
                      </span>
                      <ChevronDown size={14} className={`shrink-0 text-gray-400 transition-transform ${openDD === 'category' ? 'rotate-180' : ''}`} />
                    </button>
                    {selectedCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedCategories.map(cat => (
                          <span key={cat} className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-50 text-red-700 text-[10px] font-black">
                            {cat} <button type="button" onClick={() => toggleCategory(cat)}><X size={9} /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── State ── */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-2 block text-gray-400 flex items-center gap-1">
                      <MapPin size={10} /> State
                    </label>
                    <button ref={stateBtnRef} type="button" onClick={() => toggleDD('state')} className={triggerCls(!!selectedState)}>
                      <span className="truncate">{selectedState || 'All States'}</span>
                      <ChevronDown size={14} className={`shrink-0 text-gray-400 transition-transform ${openDD === 'state' ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                </div>
              </div>
            </div>

            {/* ══ Main Content ═══════════════════════════════════════════ */}
            <div className="lg:col-span-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Results Found</p>
                  <h2 className="text-2xl font-black text-gray-900 italic">
                    {filteredAndSorted.length} <span className="text-red-600">Premium</span> Brands
                  </h2>
                </div>
                {/* Active filter chips */}
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-[10px] font-black uppercase border border-gray-200">
                      <Search size={10} />"{searchQuery}" <X size={11} className="cursor-pointer hover:text-red-600" onClick={() => setSearchQuery('')} />
                    </span>
                  )}
                  {activeBucket && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 text-[10px] font-black uppercase border border-orange-200">
                      <IndianRupee size={10} />{activeBucketLabel} <X size={11} className="cursor-pointer hover:text-red-600" onClick={() => setActiveBucket('')} />
                    </span>
                  )}
                  {selectedCategories.length > 0 && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase border border-red-100">
                      <LayoutGrid size={10} />{selectedCategories.length} Cats <X size={11} className="cursor-pointer" onClick={() => setSelectedCategories([])} />
                    </span>
                  )}
                  {selectedState && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-[10px] font-black uppercase border border-purple-200">
                      <MapPin size={10} />{selectedState} <X size={11} className="cursor-pointer hover:text-red-600" onClick={() => setSelectedState('')} />
                    </span>
                  )}
                  {verifiedOnly && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase border border-blue-100">
                      <ShieldCheck size={10} />Verified <X size={11} className="cursor-pointer" onClick={() => setVerifiedOnly(false)} />
                    </span>
                  )}
                </div>
              </div>

              {filteredAndSorted.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
                  {filteredAndSorted.map(franchise => (
                    <FranchiseCard key={franchise.id} franchise={franchise} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[3rem] border border-gray-100 p-24 text-center shadow-xl">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100">
                    <Search size={40} className="text-gray-300" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">No Franchises Found</h3>
                  <p className="text-gray-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed text-lg">
                    Try broadening your budget or exploring other categories.
                  </p>
                  <button onClick={resetFilters} className="inline-flex items-center gap-3 px-10 py-5 bg-gray-900 text-white font-black rounded-[2rem] uppercase tracking-widest text-xs hover:bg-black transition-all shadow-2xl">
                    Reset All Filters <RefreshCw className="group-hover:rotate-180 transition-transform duration-500" size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ══ Fixed dropdown panels ═══════════════════════════════════════════ */}

      {/* Sort dropdown */}
      {openDD === 'sort' && ddRect && (
        <div data-dd-panel onWheel={e => e.stopPropagation()} style={ddStyle()}>
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sort By</p>
          </div>
          <div className="py-1">
            {SORT_OPTIONS.map(opt => (
              <button key={opt.value} type="button"
                onClick={() => { setSortBy(opt.value as SortOption); setOpenDD(null); setDdRect(null); }}
                className={itemCls(sortBy === opt.value)}
              >
                {sortBy === opt.value ? <Check size={14} className="text-red-600 shrink-0" /> : <span className="w-3.5 shrink-0" />}
                <opt.Icon size={13} className="shrink-0 text-gray-400" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Investment dropdown */}
      {openDD === 'investment' && ddRect && (
        <div data-dd-panel onWheel={e => e.stopPropagation()} style={ddStyle()}>
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Investment Range</p>
          </div>
          <div className="py-1">
            {INVESTMENT_BUCKETS.map(b => (
              <button key={b.value} type="button"
                onClick={() => { setActiveBucket(b.value); setOpenDD(null); setDdRect(null); }}
                className={itemCls(activeBucket === b.value)}
              >
                {activeBucket === b.value ? <Check size={14} className="text-red-600 shrink-0" /> : <span className="w-3.5 shrink-0" />}
                {b.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category dropdown */}
      {openDD === 'category' && ddRect && (
        <div data-dd-panel onWheel={e => e.stopPropagation()} style={ddStyle()}>
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</p>
            {selectedCategories.length > 0 && (
              <button type="button" onClick={() => setSelectedCategories([])} className="text-[10px] font-black text-red-500 hover:underline">Clear</button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto custom-scrollbar py-1">
            <button type="button" onClick={() => { setSelectedCategories([]); setOpenDD(null); setDdRect(null); }}
              className={itemCls(selectedCategories.length === 0)}>
              {selectedCategories.length === 0 ? <Check size={14} className="text-red-600 shrink-0" /> : <span className="w-3.5 shrink-0" />}
              All Categories
            </button>
            {categories.map(([cat, count]) => (
              <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                className={`${itemCls(selectedCategories.includes(cat))} justify-between`}>
                <span className="flex items-center gap-2.5">
                  {selectedCategories.includes(cat) ? <Check size={14} className="text-red-600 shrink-0" /> : <span className="w-3.5 shrink-0" />}
                  {cat}
                </span>
                <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* State dropdown */}
      {openDD === 'state' && ddRect && (
        <div data-dd-panel onWheel={e => e.stopPropagation()} style={ddStyle()}>
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select State</p>
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar py-1">
            <button type="button" onClick={() => { setSelectedState(''); setOpenDD(null); setDdRect(null); }}
              className={itemCls(!selectedState)}>
              {!selectedState ? <Check size={14} className="text-red-600 shrink-0" /> : <span className="w-3.5 shrink-0" />}
              All States
            </button>
            {stateList.map(s => (
              <button key={s} type="button" onClick={() => { setSelectedState(s); setOpenDD(null); setDdRect(null); }}
                className={itemCls(selectedState === s)}>
                {selectedState === s ? <Check size={14} className="text-red-600 shrink-0" /> : <span className="w-3.5 shrink-0" />}
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #dc2626; }
      `}</style>
    </div>
  );
}
