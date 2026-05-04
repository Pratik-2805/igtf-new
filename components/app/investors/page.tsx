import InvestorsPage from './ClientInvestors';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Capital Network | Vetted Private Equity & Strategic Investors',
  description: 'Connect with high-net-worth individuals and venture capitalists actively seeking franchise deployment opportunities.',
  openGraph: {
    title: 'Capital Network | Exclusive Investor Access',
    description: 'Explore our vetted network of strategic capital partners for your franchise growth.',
    url: '/investors',
  },
  keywords: ['Private Equity', 'Venture Capital', 'Strategic Investors', 'Franchise Funding'],
};

export default function Page() {
  return <InvestorsPage />;
}
