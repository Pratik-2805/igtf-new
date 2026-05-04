import RegisterPage from './ClientRegister';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register | Join the National Franchise Investment Summit',
  description: 'Apply as a franchisee, franchisor, or investor. Start your franchise journey at India\'s premier summit.',
  keywords: ['Register', 'Franchise Application', 'Investor Registration', 'Franchisor Sign Up'],
};

export default function Page() {
  return <RegisterPage />;
}
