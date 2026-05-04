import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, TrendingUp, Store, MapPin, IndianRupee, PieChart, Users, Clock } from 'lucide-react';
import { notFound } from 'next/navigation';
import RequestInfoButton from '@/components/RequestInfoButton';

interface FranchiseDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: FranchiseDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  let endpoint = 'franchisor-registrations';
  let actualId = id;

  if (id.includes('-')) {
    const parts = id.split('-');
    const type = parts[0];
    actualId = parts[1];
    endpoint = type === 'exhibitor' ? 'exhibitor-registrations' : 'franchisor-registrations';
  }

  try {
    const res = await fetch(`${API_URL}/api/${endpoint}/${actualId}/`);
    if (res.ok) {
      const item = await res.json();
      return {
        title: `${item.company_name || 'Franchise'} | Opportunities`,
        description: item.about || item.product_category || 'Explore this franchise opportunity.',
      };
    }
  } catch (e) {}

  return { title: 'Franchise Detail | Opportunities' };
}

export default async function FranchiseDetailPage({ params }: FranchiseDetailPageProps) {
  const { id } = await params;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  let franchise = null;
  
  let endpoint = 'franchisor-registrations';
  let actualId = id;

  if (id.includes('-')) {
    const parts = id.split('-');
    const type = parts[0];
    actualId = parts[1];
    endpoint = type === 'exhibitor' ? 'exhibitor-registrations' : 'franchisor-registrations';
  }

  try {
    const res = await fetch(`${API_URL}/api/${endpoint}/${actualId}/`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      franchise = {
        id: data.id,
        logo: data.logo,
        brandName: data.company_name,
        category: data.industry || (data.product_category ? data.product_category.split(/[;,]/)[0].trim() : 'General'),
        description: data.about || data.product_category || 'A premier franchise opportunity ready for expansion.',
        investmentRange: data.investment_required || 'TBD',
        franchiseFee: data.franchise_fee || 'TBD',
        royalty: data.royalty || 'TBD',
        requiredArea: data.space_requirement || 'TBD',
        locationType: data.location_type || 'TBD',
        roiTime: data.roi || 'TBD',
        breakEven: data.break_even || 'TBD',
        totalOutlets: data.units_operating || 0,
        cities: data.cities ? data.cities.split(',').map((c: string) => c.trim()) : (data.event_location ? [data.event_location] : []),
        training: data.training_support || false,
        setupSupport: data.setup_support || false,
        marketingSupport: data.marketing_support || false
      };
    }
  } catch (err) {
    console.error("Failed to fetch franchise detail", err);
  }

  if (!franchise) {
    return notFound();
  }

  const supports = [];
  if (franchise.training) supports.push("Training");
  if (franchise.setupSupport) supports.push("Setup Support");
  if (franchise.marketingSupport) supports.push("Marketing Support");

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Top Section */}
        <div className="mb-6">
          <Link href="/franchises" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to Listings
          </Link>
          
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 w-64 h-64 bg-gradient-to-br from-red-50 to-orange-50 rounded-bl-[100%] -z-0 opacity-50 blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                {franchise.logo ? (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white border border-gray-100 shadow-sm p-2 shrink-0 flex items-center justify-center overflow-hidden">
                    <img src={franchise.logo} alt={`${franchise.brandName} Logo`} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                    <Store size={40} className="text-gray-300" />
                  </div>
                )}
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest mb-4 mt-2 sm:mt-0">
                    {franchise.category}
                  </span>
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
                    {franchise.brandName}
                  </h1>
                  <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
                    {franchise.description}
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white text-center md:min-w-[240px] shadow-2xl flex flex-col justify-center transform md:rotate-1 hover:rotate-0 transition-transform mt-4 md:mt-0">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Investment Range</p>
                <div className="text-3xl font-black text-white mb-6">
                  {franchise.investmentRange}
                </div>
                <RequestInfoButton 
                  franchiseName={franchise.brandName}
                  buttonText="Apply for Franchise"
                  className="w-full py-4 bg-red-600 hover:bg-red-500 text-white text-sm font-black uppercase tracking-widest rounded-xl transition-colors shadow-2xl flex items-center justify-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section (Key Info Grid) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Snapshots */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <IndianRupee size={20} />
              </div>
              <h3 className="font-black text-gray-900 tracking-tight">Financials</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <span className="text-gray-500 text-sm font-medium">Franchise Fee</span>
                <span className="text-gray-900 font-bold">{franchise.franchiseFee || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <span className="text-gray-500 text-sm font-medium">Royalty</span>
                <span className="text-gray-900 font-bold">{franchise.royalty || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Store size={20} />
              </div>
              <h3 className="font-black text-gray-900 tracking-tight">Requirements</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <span className="text-gray-500 text-sm font-medium">Required Area</span>
                <span className="text-gray-900 font-bold">{franchise.requiredArea || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <span className="text-gray-500 text-sm font-medium">Location</span>
                <span className="text-gray-900 font-bold">{franchise.locationType || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <Clock size={20} />
              </div>
              <h3 className="font-black text-gray-900 tracking-tight">Returns</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <span className="text-gray-500 text-sm font-medium">ROI Time</span>
                <span className="text-gray-900 font-bold">{franchise.roiTime || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <span className="text-gray-500 text-sm font-medium">Break-even</span>
                <span className="text-gray-900 font-bold">{franchise.breakEven || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          {/* Outlet Presence */}
          <div className="md:col-span-2 lg:col-span-3 bg-white rounded-3xl p-6 border border-gray-100 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <MapPin size={20} />
              </div>
              <h3 className="font-black text-gray-900 tracking-tight">Presence & Reach</h3>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="text-center md:text-left min-w-[150px]">
                <p className="text-4xl font-black text-gray-900">{franchise.totalOutlets}</p>
                <p className="text-sm font-medium text-gray-500">Total Outlets</p>
              </div>
              <div className="flex-1 w-full flex flex-wrap gap-2">
                {franchise.cities && franchise.cities.length > 0 ? (
                  franchise.cities.map((city: string, idx: number) => (
                    <span key={idx} className="px-4 py-2 rounded-xl bg-gray-50 text-gray-700 text-sm font-bold border border-gray-100">
                      {city}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 font-medium">Not specified</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        {supports.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
             
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-md">
                <h3 className="text-2xl font-black mb-4">Dedicated Support Setup</h3>
                <p className="text-gray-400 md:text-lg">We provide extensive resources to ensure your launch and continuous operations run smoothly.</p>
              </div>
              <div className="flex flex-col space-y-4 min-w-[250px]">
                {supports.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/5">
                    <CheckCircle className="text-green-400 shrink-0" size={24} />
                    <span className="font-bold text-lg">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Section */}
        <div className="flex justify-center mt-12">
           <RequestInfoButton 
             franchiseName={franchise.brandName}
             buttonText="Contact Franchisor"
             className="px-12 py-5 bg-gray-900 hover:bg-black text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl hover:shadow-2xl translate-y-0 hover:-translate-y-1 flex items-center justify-center"
           />
        </div>

      </div>
    </div>
  );
}