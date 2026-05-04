"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { InvestorCard } from "@/components/investor-card";
import { Investor } from "@/lib/types";
import {
  Search,
  Filter,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Check,
  ChevronDown,
  X,
} from "lucide-react";
import LoadingScreen from "@/components/loading-screen";

const ALL_INDUSTRIES = [
  "QSR",
  "Health & Wellness",
  "Education & Training",
  "Retail & Lifestyle",
  "Hospitality & Stay",
  "Kids & Entertainment",
  "Global Pavilion",
  "Automobile & EV",
  "Business Services",
  "Home Services",
  "Finance & Banking",
  "Ecosystem & Support",
];

export default function InvestorsPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);

  // Industry dropdown
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [industryDropdownPos, setIndustryDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const industryBtnRef = useRef<HTMLButtonElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Close dropdown on scroll / outside click
  useEffect(() => {
    if (!showIndustryDropdown) return;
    function onClose() {
      setShowIndustryDropdown(false);
      setIndustryDropdownPos(null);
    }
    function onOutside(e: MouseEvent) {
      const panel = document.querySelector("[data-industry-panel]");
      if (panel && panel.contains(e.target as Node)) return;
      if (
        industryBtnRef.current &&
        industryBtnRef.current.contains(e.target as Node)
      )
        return;
      onClose();
    }
    window.addEventListener("scroll", onClose, { passive: true });
    document.addEventListener("mousedown", onOutside);
    return () => {
      window.removeEventListener("scroll", onClose);
      document.removeEventListener("mousedown", onOutside);
    };
  }, [showIndustryDropdown]);

  const openIndustryDropdown = () => {
    if (showIndustryDropdown) {
      setShowIndustryDropdown(false);
      setIndustryDropdownPos(null);
      return;
    }
    if (industryBtnRef.current) {
      const r = industryBtnRef.current.getBoundingClientRect();
      setIndustryDropdownPos({
        top: r.bottom + 6,
        left: r.left,
        width: Math.max(r.width, 240),
      });
      setShowIndustryDropdown(true);
    }
  };

  const fetchInvestors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/investor-registrations-proxy");
      if (res.ok) {
        const data = await res.json();
        const results = data.results || (Array.isArray(data) ? data : []);
        const mapped: Investor[] = results.map((item: any) => ({
          id: item.id?.toString() || Math.random().toString(),
          name: item.full_name || item.firm_name || "Strategic Investor",
          location: item.preferred_location || "Pan India",
          investmentCapacity: item.investment_budget || "Confidential",
          preferredIndustries: (item.interested_sector || "")
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean),
          experience: item.business_experience || "Industry Professional",
          description: item.about || "",
          image: item.logo || "",
          verified: item.status === "converted" || item.status === "paid",
          firmName: item.firm_name,
          email: item.email,
          phone_number: item.phone_number,
        }));
        setInvestors(mapped);
      } else {
        setError(`Access Restriction: ${res.status}`);
      }
    } catch (err) {
      setError("Connection to capital network lost.");
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchInvestors();
  }, [fetchInvestors]);

  const allIndustries = Array.from(
    new Set(investors.flatMap((i) => i.preferredIndustries)),
  );

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry],
    );
  };

  const filtered = investors.filter((investor) => {
    const matchesSearch =
      investor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (investor.description &&
        investor.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (investor.firmName &&
        investor.firmName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesIndustry =
      selectedIndustries.length === 0 ||
      investor.preferredIndustries.some((ind) =>
        selectedIndustries.includes(ind),
      );
    const matchesVerified = !isVerifiedOnly || investor.verified;
    return matchesSearch && matchesIndustry && matchesVerified;
  });

  const hasFilters =
    searchQuery || selectedIndustries.length > 0 || isVerifiedOnly;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h1 className="text-6xl font-black text-gray-900 tracking-tighter mb-4">
              Capital Network
            </h1>
            <p className="text-xl text-gray-500 font-medium leading-relaxed">
              Vetted high-net-worth investors and venture capitalists actively
              seeking franchise opportunities.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xl">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <ShieldCheck size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Global Network
              </p>
              <p className="text-sm font-black text-gray-900 uppercase">
                ACTIVE INVESTORS
              </p>
            </div>
          </div>
        </div>

        {loading && <LoadingScreen />}

        {error ? (
          <div className="bg-white rounded-[3rem] border border-red-100 p-20 text-center shadow-2xl">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-3 uppercase tracking-tight">
              Sync Error
            </h3>
            <p className="text-gray-500 font-medium mb-10 max-w-sm mx-auto">
              {error}
            </p>
            <button
              onClick={fetchInvestors}
              className="px-12 py-5 bg-gray-900 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-black transition-all"
            >
              <RefreshCw size={14} className="inline mr-2" />
              Retry
            </button>
          </div>
        ) : investors.length === 0 && !loading ? (
          <div className="bg-white rounded-[3rem] border border-gray-100 p-24 text-center shadow-xl max-w-3xl mx-auto mt-12">
            <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
              Currently Onboarding.
            </h3>
            <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed text-lg">
              Please come back after sometime.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-12">
            {/* ─── Sidebar ──────────────────────────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-2xl sticky top-24">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Filter size={18} className="text-blue-500" /> Filter Hub
                  </h3>
                  {hasFilters && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedIndustries([]);
                        setIsVerifiedOnly(false);
                      }}
                      className="text-[10px] font-black uppercase text-red-600 hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="space-y-8">
                  {/* Search */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-3 block text-gray-400">
                      Search Profile
                    </label>
                    <div className="relative group">
                      <Search
                        className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-600 transition-colors"
                        size={17}
                      />
                      <input
                        placeholder="Name or Category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-10 py-3 bg-gray-50/70 border-2 border-transparent rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-sm"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Industry / Category dropdown */}
                  {allIndustries.length > 0 && (
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest mb-3 block text-gray-400">
                        Target Categories
                      </label>
                      <button
                        ref={industryBtnRef}
                        type="button"
                        onClick={openIndustryDropdown}
                        className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl border-2 text-sm font-bold transition-all ${
                          selectedIndustries.length > 0
                            ? "bg-blue-50 border-blue-400 text-blue-700"
                            : "bg-gray-50/70 border-transparent text-gray-600 hover:bg-gray-100/80"
                        }`}
                      >
                        <span className="truncate">
                          {selectedIndustries.length === 0
                            ? "All Industries"
                            : selectedIndustries.length === 1
                              ? selectedIndustries[0]
                              : `${selectedIndustries.length} selected`}
                        </span>
                        <ChevronDown
                          size={15}
                          className={`shrink-0 text-gray-400 transition-transform duration-200 ${showIndustryDropdown ? "rotate-180" : ""}`}
                        />
                      </button>
                      {selectedIndustries.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedIndustries.map((ind) => (
                            <span
                              key={ind}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-black"
                            >
                              {ind}
                              <button
                                type="button"
                                onClick={() => toggleIndustry(ind)}
                                className="hover:text-red-600"
                              >
                                <X size={9} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Verified toggle */}
                  <div
                    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-colors border ${
                      isVerifiedOnly
                        ? "bg-blue-50/80 border-blue-200"
                        : "bg-gray-50/50 border-gray-100 hover:bg-blue-50/30"
                    }`}
                    onClick={() => setIsVerifiedOnly(!isVerifiedOnly)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${isVerifiedOnly ? "bg-blue-600 text-white" : "bg-white text-blue-600"}`}
                      >
                        <ShieldCheck size={16} />
                      </div>
                      <span className="text-sm font-bold text-blue-900">
                        Verified Only
                      </span>
                    </div>
                    <div
                      className={`w-10 h-5 rounded-full relative transition-colors ${isVerifiedOnly ? "bg-blue-600" : "bg-gray-200"}`}
                    >
                      <div
                        className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isVerifiedOnly ? "left-6" : "left-1"}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Results ─────────────────────────────────────────────── */}
            <div className="lg:col-span-3">
              <div className="mb-10 flex items-center justify-between">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  Displaying{" "}
                  <span className="text-gray-900">
                    {filtered.length} Active Investors
                  </span>
                </p>
              </div>

              {filtered.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-8">
                  {filtered.map((investor) => (
                    <InvestorCard key={investor.id} investor={investor} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[3rem] border border-gray-100 p-24 text-center shadow-xl">
                  <Search size={64} className="mx-auto text-gray-200 mb-6" />
                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    Network Quiet
                  </h3>
                  <p className="text-gray-500 font-medium mb-8 max-w-xs mx-auto">
                    No investors match your current filter. Try broadening your
                    criteria.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Industry dropdown — fixed, above all page content ── */}
      {showIndustryDropdown && industryDropdownPos && (
        <div
          data-industry-panel
          onWheel={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            zIndex: 9999,
            top: industryDropdownPos.top,
            left: Math.max(
              8,
              Math.min(
                industryDropdownPos.left,
                window.innerWidth - industryDropdownPos.width - 8,
              ),
            ),
            width: industryDropdownPos.width,
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #f0f0f0",
            boxShadow:
              "0 12px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.07)",
            overflow: "hidden",
          }}
        >
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Target Categories
            </p>
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {/* All option */}
            <button
              type="button"
              onClick={() => {
                setSelectedIndustries([]);
                setShowIndustryDropdown(false);
                setIndustryDropdownPos(null);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-bold transition-colors ${
                selectedIndustries.length === 0
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {selectedIndustries.length === 0 ? (
                <Check size={14} className="text-blue-600 shrink-0" />
              ) : (
                <span className="w-3.5 shrink-0" />
              )}
              All Industries
            </button>
            {ALL_INDUSTRIES.map((ind) => (
              <button
                key={ind}
                type="button"
                onClick={() => toggleIndustry(ind)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-bold transition-colors ${
                  selectedIndustries.includes(ind)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {selectedIndustries.includes(ind) ? (
                  <Check size={14} className="text-blue-600 shrink-0" />
                ) : (
                  <span className="w-3.5 shrink-0" />
                )}
                {ind}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
