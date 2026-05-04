'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, IndianRupee, MapPin, ChevronDown, LayoutGrid, Check } from 'lucide-react';

const CATEGORIES = [
  { label: 'All Categories',       value: '' },
  { label: 'QSR',                  value: 'QSR' },
  { label: 'Health & Wellness',    value: 'Health & Wellness' },
  { label: 'Education & Training', value: 'Education & Training' },
  { label: 'Retail & Lifestyle',   value: 'Retail & Lifestyle' },
  { label: 'Hospitality & Stay',   value: 'Hospitality & Stay' },
  { label: 'Kids & Entertainment', value: 'Kids & Entertainment' },
  { label: 'Global Pavilion',      value: 'Global Pavilion' },
  { label: 'Automobile & EV',      value: 'Automobile & EV' },
  { label: 'Business Services',    value: 'Business Services' },
  { label: 'Home Services',        value: 'Home Services' },
  { label: 'Finance & Banking',    value: 'Finance & Banking' },
  { label: 'Ecosystem & Support',  value: 'Ecosystem & Support' },
];

const INVESTMENT_RANGES = [
  { label: 'Any Investment', value: '' },
  { label: 'Under ₹5 Lakhs', value: 'under-5l' },
  { label: '₹5L – ₹10L',    value: '5l-10l' },
  { label: '₹10L – ₹25L',   value: '10l-25l' },
  { label: '₹25L – ₹50L',   value: '25l-50l' },
  { label: '₹50L – ₹1 Cr',  value: '50l-1cr' },
  { label: '₹1 Cr – ₹5 Cr', value: '1cr-5cr' },
  { label: 'Above ₹5 Cr',   value: 'above-5cr' },
];

const INDIAN_STATES = [
  'All States',
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh',
  'Puducherry', 'Andaman & Nicobar', 'Lakshadweep',
];

const QUICK_TAGS = ['QSR', 'Education & Training', 'Health & Wellness', 'Retail & Lifestyle', 'Finance & Banking'];

type DropdownName = 'category' | 'investment' | 'state';

interface DropdownRect { top: number; left: number; width: number; }

export function HomepageSearchBar() {
  const router = useRouter();
  const [keyword, setKeyword]       = useState('');
  const [category, setCategory]     = useState(CATEGORIES[0]);
  const [investment, setInvestment] = useState(INVESTMENT_RANGES[0]);
  const [state, setState]           = useState('All States');
  const [openDropdown, setOpenDropdown] = useState<DropdownName | null>(null);
  const [dropdownRect, setDropdownRect] = useState<DropdownRect | null>(null);

  const containerRef  = useRef<HTMLDivElement>(null);
  const categoryRef   = useRef<HTMLButtonElement>(null);
  const investmentRef = useRef<HTMLButtonElement>(null);
  const stateRef      = useRef<HTMLButtonElement>(null);

  const btnRefs: Record<DropdownName, React.RefObject<HTMLButtonElement | null>> = {
    category:   categoryRef,
    investment: investmentRef,
    state:      stateRef,
  };

  // Close on outside click OR on any scroll (fixed panel detaches from its trigger on scroll)
  useEffect(() => {
    if (!openDropdown) return;

    function onOutside(e: MouseEvent) {
      const target = e.target as Node;
      // Don't close if clicking inside a dropdown panel
      const panels = document.querySelectorAll('[data-nfis-panel]');
      for (const p of panels) { if (p.contains(target)) return; }
      if (containerRef.current && !containerRef.current.contains(target))
        setOpenDropdown(null);
    }

    function onScroll() {
      setOpenDropdown(null);
    }

    document.addEventListener('mousedown', onOutside);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onOutside);
      window.removeEventListener('scroll', onScroll);
    };
  }, [openDropdown]);

  const toggle = (name: DropdownName) => {
    if (openDropdown === name) {
      setOpenDropdown(null);
      return;
    }
    const btn = btnRefs[name].current;
    if (btn) {
      const r = btn.getBoundingClientRect();
      setDropdownRect({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 220) });
    }
    setOpenDropdown(name);
  };

  // Clamp left so panel doesn't overflow viewport right edge
  function clampedLeft(width: number) {
    if (!dropdownRect) return 0;
    return Math.max(8, Math.min(dropdownRect.left, window.innerWidth - width - 8));
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim())         params.append('keyword', keyword.trim());
    if (category.value)         params.append('category', category.value);
    if (investment.value)       params.append('investment', investment.value);
    if (state !== 'All States') params.append('state', state);
    router.push(`/franchises?${params.toString()}`);
  };

  // Shared panel wrapper styles
  const panelStyle = (width: number): React.CSSProperties => ({
    position:     'fixed',
    zIndex:       9999,
    top:          dropdownRect?.top ?? 0,
    left:         clampedLeft(width),
    width,
    background:   '#ffffff',
    borderRadius: 12,
    border:       '1px solid #e5e7eb',
    boxShadow:    '0 10px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
    overflow:     'hidden',
  });

  return (
    <div ref={containerRef} className="relative w-full max-w-5xl mx-auto">

      {/* ══ Solid white card ══════════════════════════════════════════ */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.3)' }}
      >
        {/* Red accent bar */}
        <div className="h-[5px] bg-gradient-to-r from-red-800 via-red-500 to-red-800" />

        <form onSubmit={handleSearch} className="bg-white flex flex-col sm:flex-row items-stretch divide-x divide-gray-100">

          {/* ── Keyword ── */}
          <div className="relative flex-1 flex items-center min-w-0">
            <Search size={16} className="absolute left-4 text-gray-400 pointer-events-none shrink-0" />
            <input
              id="hero-search-keyword"
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="Search franchise brands…"
              className="w-full text-gray-800 placeholder-gray-400 text-sm font-medium pl-11 pr-4 py-[18px] focus:outline-none bg-transparent"
            />
          </div>

          {/* ── Category ── */}
          <button
            ref={categoryRef}
            id="hero-category-dropdown"
            type="button"
            onClick={() => toggle('category')}
            className="sm:w-44 flex items-center gap-2 px-4 py-[18px] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
          >
            <LayoutGrid size={15} className={`shrink-0 ${category.value ? 'text-red-600' : 'text-gray-400'}`} />
            <span className={`flex-1 text-left truncate ${category.value ? 'text-red-600 font-semibold' : ''}`}>
              {category.label}
            </span>
            <ChevronDown size={13} className={`shrink-0 text-gray-400 transition-transform duration-200 ${openDropdown === 'category' ? 'rotate-180' : ''}`} />
          </button>

          {/* ── Investment ── */}
          <button
            ref={investmentRef}
            id="hero-investment-dropdown"
            type="button"
            onClick={() => toggle('investment')}
            className="sm:w-44 flex items-center gap-2 px-4 py-[18px] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
          >
            <IndianRupee size={15} className={`shrink-0 ${investment.value ? 'text-red-600' : 'text-gray-400'}`} />
            <span className={`flex-1 text-left truncate ${investment.value ? 'text-red-600 font-semibold' : ''}`}>
              {investment.label}
            </span>
            <ChevronDown size={13} className={`shrink-0 text-gray-400 transition-transform duration-200 ${openDropdown === 'investment' ? 'rotate-180' : ''}`} />
          </button>

          {/* ── State ── */}
          <button
            ref={stateRef}
            id="hero-state-dropdown"
            type="button"
            onClick={() => toggle('state')}
            className="sm:w-40 flex items-center gap-2 px-4 py-[18px] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
          >
            <MapPin size={15} className={`shrink-0 ${state !== 'All States' ? 'text-red-600' : 'text-gray-400'}`} />
            <span className={`flex-1 text-left truncate ${state !== 'All States' ? 'text-red-600 font-semibold' : ''}`}>
              {state}
            </span>
            <ChevronDown size={13} className={`shrink-0 text-gray-400 transition-transform duration-200 ${openDropdown === 'state' ? 'rotate-180' : ''}`} />
          </button>

          {/* ── Search button ── */}
          <button
            id="hero-search-button"
            type="submit"
            className="relative flex items-center justify-center gap-2 px-7 py-[18px] font-bold text-sm text-white shrink-0 overflow-hidden group transition-all duration-200 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            <Search size={16} strokeWidth={2.5} className="relative z-10" />
            <span className="relative z-10 whitespace-nowrap tracking-wide">Search Now</span>
          </button>
        </form>
      </div>

      {/* ══ Dropdown panels (position:fixed — above entire page) ══════ */}

      {/* Category */}
      {openDropdown === 'category' && dropdownRect && (
        <div data-nfis-panel style={panelStyle(Math.max(dropdownRect.width, 220))}>
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <LayoutGrid size={10} /> Industry / Category
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto nfis-dd-scroll py-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => { setCategory(cat); setOpenDropdown(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  category.value === cat.value
                    ? 'bg-red-50 text-red-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {category.value === cat.value
                  ? <Check size={14} className="text-red-600 shrink-0" />
                  : <span className="w-3.5 shrink-0" />
                }
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Investment */}
      {openDropdown === 'investment' && dropdownRect && (
        <div data-nfis-panel style={panelStyle(Math.max(dropdownRect.width, 220))}>
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <IndianRupee size={10} /> Investment Range
            </p>
          </div>
          <div className="py-1">
            {INVESTMENT_RANGES.map(range => (
              <button
                key={range.value}
                type="button"
                onClick={() => { setInvestment(range); setOpenDropdown(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  investment.value === range.value
                    ? 'bg-red-50 text-red-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {investment.value === range.value
                  ? <Check size={14} className="text-red-600 shrink-0" />
                  : <span className="w-3.5 shrink-0" />
                }
                {range.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* State */}
      {openDropdown === 'state' && dropdownRect && (
        <div data-nfis-panel style={panelStyle(Math.max(dropdownRect.width, 200))}>
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin size={10} /> Select State
            </p>
          </div>
          <div className="max-h-60 overflow-y-auto nfis-dd-scroll py-1">
            {INDIAN_STATES.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => { setState(s); setOpenDropdown(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  state === s
                    ? 'bg-red-50 text-red-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {state === s
                  ? <Check size={14} className="text-red-600 shrink-0" />
                  : <span className="w-3.5 shrink-0" />
                }
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ Quick tags ════════════════════════════════════════════════ */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
        <span className="text-white text-xs font-semibold uppercase tracking-widest"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>Popular:</span>
        {QUICK_TAGS.map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => router.push(`/franchises?category=${encodeURIComponent(tag)}`)}
            className="px-3.5 py-1 rounded-full text-xs font-semibold bg-white text-gray-800 hover:bg-red-600 hover:text-white transition-all duration-200 shadow-md"
          >
            {tag}
          </button>
        ))}
      </div>

      <style>{`
        .nfis-dd-scroll::-webkit-scrollbar { width: 3px; }
        .nfis-dd-scroll::-webkit-scrollbar-track { background: #f9fafb; }
        .nfis-dd-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        .nfis-dd-scroll::-webkit-scrollbar-thumb:hover { background: #dc2626; }
      `}</style>
    </div>
  );
}
