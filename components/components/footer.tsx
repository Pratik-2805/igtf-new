"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-20 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-4 mb-6 group">
              <div className="relative w-14 h-14 bg-white rounded-full p-1.5 shadow-lg border border-gray-700/50 flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-white/10">
                <div className="relative w-full h-full">
                  <Image
                    src="/logo.png"
                    alt="NFIS Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div>
                <p className="font-black text-lg leading-none">NFIS</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                  National Franchise Investment Summit
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              India's premier franchise exhibition platform connecting
              franchisors, investors, and entrepreneurs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/franchises"
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  Franchises
                </Link>
              </li>
              <li>
                <Link
                  href="/exhibitions"
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  Exhibitions
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <Mail size={16} className="flex-shrink-0 mt-0.5 text-red-400" />
                <span className="text-gray-400 break-all">
                  info@nationalfranchiseinvestmentsummit.com
                </span>
              </div>
              <div className="flex gap-2">
                <Phone
                  size={16}
                  className="flex-shrink-0 mt-0.5 text-red-400"
                />
                <span className="text-gray-400">+91 98205 31096</span>
              </div>
              <div className="flex gap-2">
                <MapPin
                  size={16}
                  className="flex-shrink-0 mt-0.5 text-red-400"
                />
                <span className="text-gray-400">
                  Mumbai, Maharashtra, India
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links and Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <p className="text-sm text-gray-400 font-medium tracking-tight">
              &copy; {new Date().getFullYear()} NFIS - National Franchise
              Investment Summit. All rights reserved.
            </p>
            <div className="text-[11px] text-gray-500 font-black uppercase tracking-widest flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span>Powered and maintained by</span>
              <a
                href="https://indoglobaltradefair.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-500 transition-all underline underline-offset-4 decoration-red-500/30 flex items-center gap-1.5"
              >
                <span className="bg-white p-0.5 rounded-sm shadow-sm flex items-center justify-center relative w-4.5 h-4.5">
                  <Image
                    src="/igtf-logo.png"
                    alt="IGTF Icon"
                    fill
                    className="object-contain"
                  />
                </span>
                Indo Global Trade Fair (IGTF)
              </a>
            </div>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a
              href="#"
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <Twitter size={20} />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <Facebook size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
