import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook } from 'lucide-react';
import logoSvg from '@/assets/logo.svg';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8">
          {/* Company Info */}
          <div className="space-y-3 md:space-y-4 col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center">
              <img src={logoSvg} alt="ZiggySitters" className="h-6 md:h-8 w-auto filter brightness-0 invert" />
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              Connecting pet owners with trusted, verified pet sitters in Auckland, Hamilton and beyond.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <MapPin className="w-4 h-4" />
              <span>Auckland & Hamilton, New Zealand</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3 md:mb-4 text-base">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/find-sitters" className="text-gray-300 hover:text-white transition-colors">
                  Find Sitters
                </Link>
              </li>
              <li>
                <Link to="/become-sitter" className="text-gray-300 hover:text-white transition-colors">
                  Become a Sitter
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-300 hover:text-white transition-colors">
                  How it Works
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-gray-300 hover:text-white transition-colors">
                  Safety & Trust
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-3 md:mb-4 text-base">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Areas */}
          <div>
            <h3 className="font-semibold mb-3 md:mb-4 text-base">Popular Areas</h3>
            <ul className="space-y-2 text-sm">
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
                <Link to="/find-sitters/mt-eden" className="text-gray-300 hover:text-white transition-colors">
                  Mt Eden
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
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="md:col-span-1">
            <h3 className="font-semibold mb-3 md:mb-4 text-base">Get in Touch</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span className="break-all">hello@ziggysitters.com</span>
              </div>
            </div>
            
            <div className="mt-4 md:mt-6">
              <h4 className="font-medium mb-2 md:mb-3">Follow Us</h4>
              <div className="flex space-x-3">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 space-y-3 md:space-y-0">
          <p className="text-center md:text-left">&copy; 2024 ZiggySitters. All rights reserved.</p>
          <div className="flex space-x-4 md:space-x-6">
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="/cookies" className="hover:text-white transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}