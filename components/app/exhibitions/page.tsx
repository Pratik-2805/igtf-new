import ExhibitionsPage from './ClientExhibitions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Franchise Exhibitions & Events | Connecting Leaders across India',
  description: 'Join premier franchise exhibitions and summits in 15+ locations. Experience India\'s most strategic business events.',
  alternates: {
    canonical: 'https://nationalfranchiseinvestmentsummit.com/exhibitions',
  },
  openGraph: {
    title: 'Exhibitions Hub | Premier Business Networking',
    description: 'Explore upcoming franchise events and maximize your networking opportunities.',
    url: 'https://nationalfranchiseinvestmentsummit.com/exhibitions', // Use full URL
    type: 'website',
  },
  keywords: ['Franchise Expo', 'Business Summits', 'Networking Events', 'Exhibitions India'],
};

export default async function Page() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  let initialExhibitions: any[] = [];

  try {
    const res = await fetch(`${API_URL}/api/events/`, {
      next: { revalidate: 30 } // Cache for 30 seconds
    });
    
    if (res.ok) {
      const data = await res.json();
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
    console.error('Error fetching exhibitions on server:', error);
  }

  return <ExhibitionsPage initialExhibitions={initialExhibitions} />;
}
