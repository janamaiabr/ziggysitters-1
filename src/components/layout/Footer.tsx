import { Link } from 'react-router-dom';
import { MapPin, Mail } from 'lucide-react';
import logoSvg from '@/assets/logo.svg';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pb-20 md:pb-0">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Mobile: compact 2-col layout. Desktop: full 5-col */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
          {/* Company Info - full width on mobile */}
          <div className="space-y-3 md:space-y-4 col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center">
              <img src={logoSvg} alt="ZiggySitters" className="h-6 md:h-8 w-auto filter brightness-0 invert" />
            </Link>
            <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
              Trusted, verified pet sitters in Auckland, Hamilton and beyond.
            </p>
            <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-300">
              <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>Auckland & Hamilton, NZ</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-2.5 md:mb-4 text-sm md:text-base">Quick Links</h3>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
              <li>
                <Link to="/find-sitters" className="text-gray-300 hover:text-white transition-colors min-h-[44px] inline-flex items-center">
                  Find Sitters
                </Link>
              </li>
              <li>
                <Link to="/become-sitter" className="text-gray-300 hover:text-white transition-colors min-h-[44px] inline-flex items-center">
                  Become a Sitter
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-300 hover:text-white transition-colors min-h-[44px] inline-flex items-center">
                  How it Works
                </Link>
              </li>
              <li className="hidden md:block">
                <Link to="/young-walkers" className="text-gray-300 hover:text-white transition-colors">
                  Young Dog Walkers
                </Link>
              </li>
              <li className="hidden md:block">
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li className="hidden md:block">
                <Link to="/security" className="text-gray-300 hover:text-white transition-colors">
                  Safety & Trust
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-2.5 md:mb-4 text-sm md:text-base">Support</h3>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors min-h-[44px] inline-flex items-center">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white transition-colors min-h-[44px] inline-flex items-center">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/sitter-faq" className="text-gray-300 hover:text-white transition-colors min-h-[44px] inline-flex items-center">
                  Sitter FAQ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors min-h-[44px] inline-flex items-center">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors min-h-[44px] inline-flex items-center">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Areas - hidden on mobile */}
          <div className="hidden md:block">
            <h3 className="font-semibold mb-3 md:mb-4 text-base">Popular Areas</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/pet-sitters-auckland" className="text-gray-300 hover:text-white transition-colors font-medium">
                  Auckland
                </Link>
              </li>
              <li>
                <Link to="/find-sitters/ponsonby" className="text-gray-300 hover:text-white transition-colors">
                  Ponsonby
                </Link>
              </li>
              <li>
                <Link to="/find-sitters/grey-lynn" className="text-gray-300 hover:text-white transition-colors">
                  Grey Lynn
                </Link>
              </li>
              <li>
                <Link to="/find-sitters/remuera" className="text-gray-300 hover:text-white transition-colors">
                  Remuera
                </Link>
              </li>
              <li>
                <Link to="/find-sitters/hamilton" className="text-gray-300 hover:text-white transition-colors">
                  Hamilton
                </Link>
              </li>
              <li>
                <Link to="/areas" className="text-gray-300 hover:text-white transition-colors font-medium">
                  View All Areas →
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact - hidden on mobile (email in support) */}
          <div className="hidden md:block md:col-span-1">
            <h3 className="font-semibold mb-3 md:mb-4 text-base">Get in Touch</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span className="break-all">hello@ziggysitters.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-6 md:mt-8 pt-4 md:pt-8 flex flex-col md:flex-row justify-between items-center text-xs md:text-sm text-gray-400 space-y-2 md:space-y-0">
          <p className="text-center md:text-left">&copy; 2025 ZiggySitters. All rights reserved.</p>
          <div className="flex space-x-4 md:space-x-6">
            <Link to="/terms" className="hover:text-white transition-colors min-h-[44px] inline-flex items-center">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-white transition-colors min-h-[44px] inline-flex items-center">
              Privacy
            </Link>
            <Link to="/cookies" className="hover:text-white transition-colors min-h-[44px] inline-flex items-center">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}