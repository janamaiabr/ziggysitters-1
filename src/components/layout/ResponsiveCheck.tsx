import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function ResponsiveCheck() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Ensure mobile and desktop show the same landing page
    // If user is on mobile and not authenticated, ensure they see the search functionality
    const isMobile = window.innerWidth < 768;
    
    if (location.pathname === '/' && !user && isMobile) {
      // Mobile users without auth should see the same landing page as desktop
      // This is already handled by the existing Index component
      // No redirect needed - the Index component handles responsive design
    }
  }, [user, location.pathname, navigate]);

  return null;
}