import Home from './ClientHome';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'National Franchise Investment Summit',
  description:
    'Connect with India\'s best franchise opportunities. NFIS brings together 600+ leading brands, investors, and entrepreneurs on one powerful platform.',

  openGraph: {
    title: 'National Franchise Investment Summit',
    description:
      'Explore top franchise opportunities and connect with leading brands in India.',
    url: '/',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'National Franchise Investment Summit',
      },
    ],
  },
};


export default async function Page() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  let initialFranchises: any[] = [];
  let initialExhibitions: any[] = [];

  try {
    const NFIS_PLATFORMS = 'nfis,NFIS,nfis.in';
    const [franchisorRes, exhibitorRes] = await Promise.all([
      fetch(`${API_URL}/api/franchisor-registrations/?source_platform=${NFIS_PLATFORMS}`, {
        next: { revalidate: 30 }
      }),
      fetch(`${API_URL}/api/exhibitor-registrations/?source_platform=${NFIS_PLATFORMS}`, {
        next: { revalidate: 30 }
      })
    ]);

    let franchisors: any[] = [];
    let exhibitors: any[] = [];

    if (franchisorRes.ok) {
      const data = await franchisorRes.json();
      franchisors = data.results || data;
    }

    if (exhibitorRes.ok) {
      const data = await exhibitorRes.json();
      exhibitors = data.results || data;
    }

    const allItems = [
      ...franchisors.map(f => ({ ...f, _type: 'franchisor' })),
      ...exhibitors.map(e => ({ ...e, _type: 'exhibitor' }))
    ];

    initialFranchises = allItems
      .filter((item: any) => item.status === 'contacted' || item.status === 'paid' || item.status === 'verified')
      .slice(0, 6)
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
          verified: true,
          state: cities[0] || '',
        } as any;
      });

    if (initialFranchises.length === 0) {
      initialFranchises.push({
        id: 'mock-1',
        brandName: 'Gourmet Burger Co',
        category: 'Food',
        categories: ['Food'],
        description: 'A premium burger franchise opportunity with high ROI.',
        investmentRange: '₹10–15 Lakhs',
        investmentRangeValue: { min: 1000000, max: 1500000 },
        roiTime: '12-18 months',
        roi: '25%',
        totalOutlets: 10,
        unitsOperating: 10,
        verified: true,
        state: 'Maharashtra'
      } as any);
    }

    // Fetch Exhibitions
    const exhibitionRes = await fetch(`${API_URL}/api/events/`, {
      next: { revalidate: 30 }
    });

    if (exhibitionRes.ok) {
      const data = await exhibitionRes.json();
      if (data && data.results) {
        initialExhibitions = data.results.map((item: any) => ({
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
      }
    }
  } catch (error) {
    console.error('Error fetching home data on server:', error);
  }

  return <Home initialFranchises={initialFranchises} initialExhibitions={initialExhibitions} />;
}
