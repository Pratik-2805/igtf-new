import ContactPage from './ClientContact';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | National Franchise Investment Summit | Get in Touch',
  description: 'Have questions about NFIS? Contact our team for exhibition bookings, partnership inquiries, or general support in India.',
  alternates: {
    canonical: 'https://nationalfranchiseinvestmentsummit.com/contact',
  },
  openGraph: {
    title: 'Contact Us | National Franchise Investment Summit',
    description: 'Get in touch with NFIS for support, bookings, and partnerships in the Indian franchise ecosystem.',
    url: 'https://nationalfranchiseinvestmentsummit.com/contact',
    type: 'website',
  },
  keywords: ['Contact NFIS', 'Franchise Support India', 'Exhibition Stalls', 'Investment Hub Contact'],
};

export default function Page() {
  return <ContactPage />;
}
