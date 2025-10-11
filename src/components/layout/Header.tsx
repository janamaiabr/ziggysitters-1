import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, User, Settings, LogOut, Shield, X } from 'lucide-react';
import logoSvg from '@/assets/logo.svg';
import { useState, useEffect } from 'react';

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminStatusAndProfile();
    }
  }, [user]);

  const checkAdminStatusAndProfile = async () => {
    if (!user) {
      setIsAdmin(false);
      setProfile(null);
      return;
    }
    
    try {
      // Fetch profile info
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role, avatar_url, first_name, last_name')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // Check admin status using secure user_roles table
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      setIsAdmin(!!roleData);
      setProfile(profileData);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setProfile(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleMobileNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={logoSvg} alt="ZiggySitters" className="h-6 md:h-8 w-auto" />
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
        </nav>

        <div className="flex items-center gap-2">
          {/* Desktop Navigation */}
          {user ? (
            <div className="hidden md:flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={profile?.avatar_url || user.user_metadata?.avatar_url} 
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {profile?.first_name?.[0] || user.user_metadata?.first_name?.[0] || user.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/bookings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    My Bookings
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin-dashboard')}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex gap-2">
              <Button variant="ghost" onClick={() => navigate('/auth?tab=signin')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth?tab=signup')}>
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile Navigation */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4 mt-6">
                {user ? (
                  <>
                    <div className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={profile?.avatar_url || user.user_metadata?.avatar_url} 
                          className="object-cover"
                        />
                        <AvatarFallback>
                          {profile?.first_name?.[0] || user.user_metadata?.first_name?.[0] || user.email?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {profile?.first_name || user.user_metadata?.first_name || 'User'}
                        </p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button variant="ghost" className="w-full justify-start" onClick={() => handleMobileNavigation('/find-sitters')}>
                        Find Sitters
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => handleMobileNavigation('/become-sitter')}>
                        Become a Sitter
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => handleMobileNavigation('/how-it-works')}>
                        How it Works
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => handleMobileNavigation('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => handleMobileNavigation('/bookings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        My Bookings
                      </Button>
                      {isAdmin && (
                        <Button variant="ghost" className="w-full justify-start" onClick={() => handleMobileNavigation('/admin-dashboard')}>
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Button>
                      )}
                      <Button variant="ghost" className="w-full justify-start text-red-600" onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Button variant="ghost" className="w-full justify-start" onClick={() => handleMobileNavigation('/find-sitters')}>
                        Find Sitters
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => handleMobileNavigation('/become-sitter')}>
                        Become a Sitter
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => handleMobileNavigation('/how-it-works')}>
                        How it Works
                      </Button>
                    </div>
                    <div className="space-y-3 pt-4 border-t">
                      <Button className="w-full" onClick={() => handleMobileNavigation('/auth?tab=signup')}>
                        Get Started
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => handleMobileNavigation('/auth?tab=signin')}>
                        Sign In
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}