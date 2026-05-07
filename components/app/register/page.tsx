import { Suspense } from 'react';
import RegisterPage from './ClientRegister';
import { Metadata } from 'next';
import LoadingScreen from '@/components/loading-screen';

export const metadata: Metadata = {
  title: 'Register | Join the National Franchise Investment Summit',
  description: 'Apply as a franchisee, franchisor, or investor. Start your franchise journey at India\'s premier summit.',
  keywords: ['Register', 'Franchise Application', 'Investor Registration', 'Franchisor Sign Up'],
};

export default function Page() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <RegisterPage />
    </Suspense>
  );
}

