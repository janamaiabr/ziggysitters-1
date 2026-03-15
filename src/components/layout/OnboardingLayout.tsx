import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import ziggyLogo from '@/assets/ziggy-logo.png';

interface OnboardingLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
}

export default function OnboardingLayout({ children, showNavigation = true }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {showNavigation && (
        <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b border-border">
          <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <img src={ziggyLogo} alt="ZiggySitters" className="h-8 md:h-10 w-auto" />
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/find-sitters" className="text-sm font-medium hover:text-primary transition-colors">
                Find Sitters
              </Link>
              <Link to="/become-sitter" className="text-sm font-medium hover:text-primary transition-colors">
                Become a Sitter
              </Link>
              <Link to="/how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
                How it Works
              </Link>
              <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-sm font-medium hover:text-primary transition-colors">
                Contact
              </Link>
            </nav>
          </div>
        </header>
      )}
      
      <main className="flex-1">
        {children}
      </main>
      
      {showNavigation && (
        <footer className="bg-gray-900 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center">
                <img src={logoSvg} alt="ZiggySitters" className="h-6 w-auto filter brightness-0 invert mr-3" />
                <span className="text-sm text-gray-300">&copy; 2024 ZiggySitters. All rights reserved.</span>
              </div>
              <div className="flex space-x-6 text-sm">
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms
                </Link>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy
                </Link>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}