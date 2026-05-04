import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Toaster } from 'sonner'
import { ToastContainer } from 'react-toastify'
import Script from 'next/script'
import 'react-toastify/dist/ReactToastify.css'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const SITE_URL = 'https://nationalfranchiseinvestmentsummit.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: 'National Franchise Investment Summit',
    template: '%s',
  },

  description:
    'National Franchise Investment Summit (NFIS) is India\'s premier platform for franchise discovery. Explore top franchise opportunities, connect with 600+ leading brands, and secure high-ROI investments.',

  keywords: [
    'Franchise India',
    'Best Franchise Opportunities India',
    'Franchise Investment Summit',
    'Business Opportunities India',
    'Franchise Expo',
    'NFIS India',
    'Top Franchise Brands',
    'Low Investment Franchise India',
    'High Profit Franchise Business'
  ],

  authors: [{ name: 'NFIS Team' }],
  creator: 'National Franchise Investment Summit',
  publisher: 'National Franchise Investment Summit',

  alternates: {
    canonical: SITE_URL,
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  openGraph: {
    title: 'National Franchise Investment Summit',
    description:
      'India\'s premier franchise platform connecting brands, investors, and entrepreneurs.',
    url: SITE_URL,
    siteName: 'National Franchise Investment Summit',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: 'NFIS Logo',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'National Franchise Investment Summit',
    description:
      'Discover top franchise opportunities and connect with leading brands in India.',
    creator: '@NFIS_India',
    images: ['/logo.png'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: [
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/favicon.ico',
        rel: 'icon',
      },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'manifest',
        url: '/site.webmanifest',
      },
    ],
  },

  category: 'Business & Investment',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Structured Data for AI Engines (Gemini/Google)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'National Franchise Investment Summit',
    'url': SITE_URL,
    'logo': `${SITE_URL}/logo.png`,
    'sameAs': [
      'https://twitter.com/NFIS_India',
      'https://www.linkedin.com/company/nfis-india'
    ],
    'description': 'India\'s premier franchise exhibition platform connecting franchisors, investors, and entrepreneurs.',
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': 'Mumbai',
      'addressRegion': 'Maharashtra',
      'addressCountry': 'India'
    },
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+91-98205-31096',
      'contactType': 'customer service',
      'email': 'info@nationalfranchiseinvestmentsummit.com'
    }
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'National Franchise Investment Summit',
    'url': SITE_URL,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${SITE_URL}/franchises?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          id="website-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground overflow-x-hidden">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Analytics />
        <Toaster position="top-right" expand={false} richColors />
        <ToastContainer position="top-right" autoClose={3000} />
      </body>
    </html>
  )
}
