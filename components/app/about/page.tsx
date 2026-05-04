import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Users, MapPin, Handshake, Star, TrendingUp, CheckCircle, Zap } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | India\'s Premier Franchise Hub | NFIS',
  description: 'Learn about NFIS, India\'s premier platform connecting world-class franchisors with strategic capital partners and ambitious entrepreneurs.',
  alternates: {
    canonical: 'https://nationalfranchiseinvestmentsummit.com/about',
  },
  openGraph: {
    title: 'About NFIS | National Franchise Investment Summit',
    description: 'Discover the mission and impact of India\'s largest franchise investment hub.',
    url: 'https://nationalfranchiseinvestmentsummit.com/about',
    type: 'website',
  },
  keywords: ['About NFIS', 'Franchise History', 'Investment Platform India', 'Business Networking Hub'],
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-red-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-balance uppercase tracking-tight">National Franchise Investment Summit</h1>
            <p className="text-xl md:text-2xl opacity-90 mb-2 text-balance font-medium">India's Premier Capital & Franchise Networking Platform</p>
            <p className="text-lg opacity-80 max-w-3xl mx-auto text-balance">The National Franchise Investment Summit (NFIS) connects world-class franchisors with strategic capital partners and ambitious entrepreneurs.</p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                At the National Franchise Investment Summit (NFIS), we believe in the power of face-to-face connections to create transformative business opportunities. Our mission is to serve as the bridge connecting ambitious entrepreneurs with established franchise brands and high-net-worth investor networks.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Through premium franchise exhibitions across India, we facilitate meaningful conversations, accelerate deal-making, and empower the next generation of franchise business owners.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-red-50 rounded-2xl p-8 border border-blue-100">
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Direct Brand Access</h4>
                    <p className="text-gray-600 text-sm">Meet franchise CEOs and decision-makers face-to-face</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Verified Networks</h4>
                    <p className="text-gray-600 text-sm">Access pre-qualified investors and entrepreneurs</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Deal Facilitation</h4>
                    <p className="text-gray-600 text-sm">Professional support throughout the franchise journey</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Management Section */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 rounded-[3rem] p-8 lg:p-16 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 lg:gap-16">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/20 border border-red-600/30 text-red-400 text-xs font-black uppercase tracking-widest mb-6">
                  <Star size={14} className="fill-red-600" /> Strategic Partnership
                </div>
                <h2 className="text-3xl lg:text-4xl font-black mb-6 tracking-tight leading-tight">Powered by Indo Global Trade Fair</h2>
                <p className="text-lg text-blue-100/80 mb-8 leading-relaxed">
                  The National Franchise Investment Summit (NFIS) is proudly powered and maintained by <span className="text-white font-bold">Indo Global Trade Fair (IGTF)</span>.
                  By leveraging decades of expertise in international trade events and exhibition management, IGTF ensures that NFIS remains India's most strategic and trusted franchise ecosystem.
                </p>
                <a
                  href="https://indoglobaltradefair.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 font-black uppercase text-sm rounded-2xl transition-all hover:scale-105 shadow-xl hover:bg-gray-50 group tracking-widest"
                >
                  Explore IGTF
                  <Zap size={18} className="text-red-600 group-hover:animate-pulse" />
                </a>
              </div>
              <div className="w-full md:w-auto flex justify-center">
                <div className="relative w-48 h-48 lg:w-64 lg:h-64 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-white/10 rounded-[2.5rem] rotate-6 backdrop-blur-sm border border-white/5"></div>
                  <div className="absolute inset-0 bg-white/5 rounded-[2.5rem] -rotate-3 backdrop-blur-sm border border-white/5"></div>
                  <div className="relative w-full h-full bg-white rounded-[2rem] p-6 shadow-2xl flex items-center justify-center">
                    <div className="relative w-full h-full">
                      <Image
                        src="/igtf-logo.png"
                        alt="Indo Global Trade Fair Official Logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What We Do</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">We organize premier franchise exhibitions that bring together all stakeholders in the franchise ecosystem</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Calendar,
                title: 'Organize Exhibitions',
                description: 'Premium franchise exhibitions across major Indian cities with 1000+ attendees per event',
              },
              {
                icon: TrendingUp,
                title: 'Enable Brand Expansion',
                description: 'Connect franchisors with qualified franchisees ready to invest and expand their brand',
              },
              {
                icon: Users,
                title: 'Connect Investors',
                description: 'Facilitate meetings between franchise brands and serious investment partners',
              },
              {
                icon: Handshake,
                title: 'Facilitate Deal-Making',
                description: 'Professional support and infrastructure to convert conversations into successful partnerships',
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-red-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why NFIS Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose NFIS?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">The premier platform for franchise ecosystem participants</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Face-to-Face Networking',
                description: 'Move beyond digital interactions - build relationships that matter with authentic in-person connections',
              },
              {
                title: 'Verified Audience',
                description: 'Every participant is pre-vetted to ensure quality conversations and serious business intent',
              },
              {
                title: 'Pan-India Presence',
                description: 'Events across Tier-1 and emerging markets, reaching entrepreneurs and investors nationwide',
              },
              {
                title: 'High ROI for Exhibitors',
                description: 'Proven track record with franchisors signing franchisees and closing deals at our events',
              },
              {
                title: 'Professional Infrastructure',
                description: 'Premium venues, dedicated networking zones, and professional event management',
              },
              {
                title: 'Industry Expertise',
                description: 'Our team brings decades of franchise industry experience and deep market knowledge',
              },
            ].map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-700 to-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Impact</h2>
            <p className="text-xl opacity-90">Connecting the franchise ecosystem across India</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: '50K+', label: 'Attendees' },
              { number: '500+', label: 'Franchise Brands' },
              { number: '15+', label: 'Major Cities' },
              { number: '2000+', label: 'Deals Facilitated' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <p className="text-blue-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">The principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: CheckCircle,
                title: 'Integrity',
                description: 'Transparent, honest dealings with all stakeholders in the franchise ecosystem',
              },
              {
                icon: Users,
                title: 'Connection',
                description: 'Creating meaningful relationships that drive business growth and mutual success',
              },
              {
                icon: Zap,
                title: 'Impact',
                description: 'Driving real results - deals closed, businesses launched, wealth created',
              },
              {
                icon: TrendingUp,
                title: 'Growth',
                description: 'Empowering entrepreneurs to build successful businesses and achieve financial freedom',
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-blue-700" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-700 via-blue-600 to-red-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Ready to Be Part of the Franchise Revolution?</h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto text-balance">
              Whether you're a franchisor looking to expand, an investor seeking opportunities, or an entrepreneur ready to own a business, NFIS is your platform.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="/register"
                className="px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
              >
                Book Exhibition Stall
              </a>
              <a
                href="/register"
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                Register as Visitor
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
