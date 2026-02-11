import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, User, Settings, LogOut, Shield, X, Calendar as CalendarIcon, MessageCircle, MapPin, ChevronDown } from 'lucide-react';
import logoSvg from '@/assets/logo.svg';
import { useState, useEffect } from 'react';
import NotificationBell from '@/components/notifications/NotificationBell';
import { Badge } from '@/components/ui/badge';

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  useEffect(() => {
    if (user) {
      checkAdminStatusAndProfile();
      fetchUnreadMessages();
      
      // Subscribe to real-time message updates
      const channel = supabase
        .channel('header-messages')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages'
          },
          () => {
            fetchUnreadMessages();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchUnreadMessages = async () => {
    if (!user) return;
    
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!profileData) return;

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', profileData.id)
        .eq('is_read', false);
      
      setUnreadMessageCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };

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
    <header className="bg-background/98 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4 h-16 md:h-18 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={logoSvg} alt="ZiggySitters" className="h-7 md:h-9 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/find-sitters" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-200 font-body tracking-wide">
            Find Sitters
          </Link>
          <Link to="/become-sitter" data-tour="become-sitter" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-200 font-body tracking-wide">
            Become a Sitter
          </Link>
          <Link to="/how-it-works" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-200 font-body tracking-wide">
            How it Works
          </Link>
          <Link to="/blog" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-200 font-body tracking-wide">
            Blog
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-200 font-body tracking-wide flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                Cities
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/pet-sitting-auckland')}>
                🏙️ Auckland
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/pet-sitting-wellington')}>
                🏛️ Wellington
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/pet-sitting-christchurch')}>
                🌿 Christchurch
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/pet-sitting-hamilton')}>
                🌊 Hamilton
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/pet-sitting-tauranga')}>
                ☀️ Tauranga
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/pet-sitting-dunedin')}>
                🏔️ Dunedin
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/young-walkers" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-200 font-body tracking-wide flex items-center gap-1">
            🐕 Young Walkers
          </Link>
          {user && profile?.role === 'pet_sitter' && (
            <Link to="/calendar" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-200 font-body tracking-wide flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {/* Notification Bell - only for logged in users */}
          {user && (
            <div className="hidden md:block">
              <NotificationBell />
            </div>
          )}
          
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
                    {unreadMessageCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground">
                        {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem onClick={() => navigate('/messages')} className="flex items-center justify-between">
                    <span className="flex items-center">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Messages
                    </span>
                    {unreadMessageCount > 0 && (
                      <Badge variant="destructive" className="ml-2 h-5 min-w-5 flex items-center justify-center text-xs">
                        {unreadMessageCount}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/admin-dashboard')}>
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/admin/search-analytics')}>
                        <Shield className="mr-2 h-4 w-4" />
                        Search Analytics
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex gap-3">
              <Button variant="ghost" onClick={() => navigate('/auth?tab=signin')} className="font-body font-medium">
                Sign In
              </Button>
              <Button onClick={() => navigate('/find-sitters')} className="font-body font-semibold bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                Find a Sitter 🔍
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
                      <Button variant="ghost" className="w-full justify-start" onClick={() => handleMobileNavigation('/blog')}>
                        Blog
                      </Button>
                      <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cities</div>
                      <Button variant="ghost" className="w-full justify-start text-sm pl-6" onClick={() => handleMobileNavigation('/pet-sitting-auckland')}>
                        🏙️ Auckland
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-sm pl-6" onClick={() => handleMobileNavigation('/pet-sitting-wellington')}>
                        🏛️ Wellington
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-sm pl-6" onClick={() => handleMobileNavigation('/pet-sitting-christchurch')}>
                        🌿 Christchurch
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => handleMobileNavigation('/young-walkers')}>
                        🐕 Young Walkers
                      </Button>
                      <Button variant="ghost" className="w-full justify-between" onClick={() => handleMobileNavigation('/messages')}>
                        <span className="flex items-center">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Messages
                        </span>
                        {unreadMessageCount > 0 && (
                          <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center text-xs">
                            {unreadMessageCount}
                          </Badge>
                        )}
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => handleMobileNavigation('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                      {profile?.role === 'pet_sitter' && (
                        <Button variant="ghost" className="w-full justify-start" onClick={() => handleMobileNavigation('/calendar')}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          My Calendar
                        </Button>
                      )}
                      {!isAdmin && (
                        <Button variant="ghost" className="w-full justify-start" onClick={() => handleMobileNavigation('/bookings')}>
                          <Settings className="mr-2 h-4 w-4" />
                          My Bookings
                        </Button>
                      )}
                      {isAdmin && (
                        <>
                          <Button variant="ghost" className="w-full justify-start" onClick={() => handleMobileNavigation('/admin-dashboard')}>
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </Button>
                          <Button variant="ghost" className="w-full justify-start" onClick={() => handleMobileNavigation('/admin/search-analytics')}>
                            <Shield className="mr-2 h-4 w-4" />
                            Search Analytics
                          </Button>
                        </>
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
                      <Button variant="ghost" className="w-full justify-start" onClick={() => handleMobileNavigation('/blog')}>
                        Blog
                      </Button>
                      <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cities</div>
                      <Button variant="ghost" className="w-full justify-start text-sm pl-6" onClick={() => handleMobileNavigation('/pet-sitting-auckland')}>
                        🏙️ Auckland
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-sm pl-6" onClick={() => handleMobileNavigation('/pet-sitting-wellington')}>
                        🏛️ Wellington
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-sm pl-6" onClick={() => handleMobileNavigation('/pet-sitting-christchurch')}>
                        🌿 Christchurch
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => handleMobileNavigation('/young-walkers')}>
                        🐕 Young Walkers
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