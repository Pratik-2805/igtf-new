import { Suspense } from 'react';
import FranchisesPage from './ClientFranchises';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Top Franchise Opportunities in India | Browse 600+ Brands',
  description: 'Explore the best franchise business opportunities in India. From food and retail to education and services, discover vetted and scalable business models with high ROI at National Franchise Investment Summit (NFIS).',
  alternates: {
    canonical: 'https://nationalfranchiseinvestmentsummit.com/franchises',
  },
  openGraph: {
    title: 'Top Franchise Opportunities India | National Franchise Hub',
    description: 'Find your perfect franchise match. Explore 600+ vetted brands ready for nationwide expansion.',
    url: 'https://nationalfranchiseinvestmentsummit.com/franchises',
    type: 'website',
  },
  keywords: [
    'Best Franchise Opportunities India',
    'Low Investment Franchise',
    'Food Franchise India',
    'Master Franchise Opportunities India',
    'Business for sale India',
    'Franchise brand expansion',
    'NFIS Franchise Hub',
    'Verified Franchisors India'
  ],
};

export default async function Page() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const NFIS_PLATFORMS = 'nfis,NFIS,nfis.in,manual,MANUAL';
  let initialFranchises: any[] = [];

  try {
    const franchisorRes = await fetch(`${API_URL}/api/franchisor-registrations/?source_platform=${NFIS_PLATFORMS}`, {
      next: { revalidate: 3600 }
    });

    let franchisors: any[] = [];

    if (franchisorRes.ok) {
      const data = await franchisorRes.json();
      franchisors = data.results || data;
    }

    const allItems = [
      ...franchisors.map(f => ({ ...f, _type: 'franchisor' }))
    ];

    initialFranchises = allItems.map((item: any) => {
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

      // Cities stored as comma-separated string or just a city name
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
        verified: item.status === 'contacted' || item.status === 'paid',
        state: cities[0] || '',
      };
    });

    // Only show verified (contacted or paid) franchisors/exhibitors on the public listing
    initialFranchises = initialFranchises.filter(
      (f: any) => f.verified
    );

  } catch (err) {
    console.error('Error fetching franchises on server:', err);
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <FranchisesPage initialFranchises={initialFranchises} />
    </Suspense>
  );
}
