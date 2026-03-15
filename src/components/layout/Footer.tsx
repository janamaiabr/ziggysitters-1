import { Link } from 'react-router-dom';
import { MapPin, Mail } from 'lucide-react';
import logoSvg from '@/assets/logo.svg';

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground pb-20 md:pb-0">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
          {/* Company Info */}
          <div className="space-y-3 md:space-y-4 col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center">
              <img src={logoSvg} alt="ZiggySitters" className="h-6 md:h-8 w-auto filter brightness-0 invert" />
            </Link>
            <p className="text-secondary-foreground/60 text-xs md:text-sm leading-relaxed font-body">
              Trusted, verified pet sitters across NZ &amp; Australia.
            </p>
            <div className="flex items-center space-x-2 text-xs md:text-sm text-secondary-foreground/60 font-body">
              <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>NZ &amp; Sunshine Coast, QLD</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-2.5 md:mb-4 text-sm md:text-base font-body">Quick Links</h3>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm font-body">
              <li><Link to="/find-sitters" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors min-h-[44px] inline-flex items-center">Find Sitters</Link></li>
              <li><Link to="/become-sitter" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors min-h-[44px] inline-flex items-center">Become a Sitter</Link></li>
              <li><Link to="/how-it-works" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors min-h-[44px] inline-flex items-center">How it Works</Link></li>
              
              <li className="hidden md:block"><Link to="/about" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">About Us</Link></li>
              <li className="hidden md:block"><Link to="/security" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">Safety & Trust</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-2.5 md:mb-4 text-sm md:text-base font-body">Support</h3>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm font-body">
              <li><Link to="/contact" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors min-h-[44px] inline-flex items-center">Contact Us</Link></li>
              <li><Link to="/faq" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors min-h-[44px] inline-flex items-center">FAQ</Link></li>
              <li><Link to="/sitter-faq" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors min-h-[44px] inline-flex items-center">Sitter FAQ</Link></li>
              <li><Link to="/terms" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors min-h-[44px] inline-flex items-center">Terms</Link></li>
              <li><Link to="/privacy" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors min-h-[44px] inline-flex items-center">Privacy</Link></li>
            </ul>
          </div>

          {/* Popular Areas */}
          <div className="hidden md:block">
            <h3 className="font-semibold mb-3 md:mb-4 text-base font-body">Popular Areas</h3>
            <ul className="space-y-2 text-sm font-body">
              <li><Link to="/pet-sitting-auckland" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors font-medium">Auckland</Link></li>
              <li><Link to="/find-sitters/ponsonby" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">Ponsonby</Link></li>
              <li><Link to="/find-sitters/grey-lynn" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">Grey Lynn</Link></li>
              <li><Link to="/find-sitters/remuera" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">Remuera</Link></li>
              <li><Link to="/find-sitters/hamilton" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">Hamilton</Link></li>
              <li><Link to="/pet-sitting-sunshine-coast" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">Sunshine Coast</Link></li>
              <li><Link to="/areas" className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors font-medium">View All Areas →</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="hidden md:block md:col-span-1">
            <h3 className="font-semibold mb-3 md:mb-4 text-base font-body">Get in Touch</h3>
            <div className="space-y-3 text-sm font-body">
              <div className="flex items-center space-x-2 text-secondary-foreground/60">
                <Mail className="w-4 h-4" />
                <span className="break-all">hello@ziggysitters.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-foreground/10 mt-6 md:mt-8 pt-4 md:pt-8 flex flex-col md:flex-row justify-between items-center text-xs md:text-sm text-secondary-foreground/40 space-y-2 md:space-y-0 font-body">
          <p className="text-center md:text-left">&copy; 2025 ZiggySitters. All rights reserved.</p>
          <div className="flex space-x-4 md:space-x-6">
            <Link to="/terms" className="hover:text-secondary-foreground transition-colors min-h-[44px] inline-flex items-center">Terms</Link>
            <Link to="/privacy" className="hover:text-secondary-foreground transition-colors min-h-[44px] inline-flex items-center">Privacy</Link>
            <Link to="/cookies" className="hover:text-secondary-foreground transition-colors min-h-[44px] inline-flex items-center">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
