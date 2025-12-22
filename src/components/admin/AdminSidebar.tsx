import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Mail,
  FileText,
  DollarSign,
  Eye,
  RefreshCw,
  ShieldCheck,
  Target,
  TrendingUp,
  CalendarCheck,
  UserCheck,
  Ticket,
  Wrench,
  Activity,
  MapPinned
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const navSections = [
  {
    label: 'Quick Access',
    items: [
      {
        title: 'Overview',
        href: '/admin-dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Bookings',
        href: '/admin/bookings',
        icon: CalendarCheck,
      },
    ],
  },
  {
    label: 'Marketing & Insights',
    highlight: true,
    items: [
      {
        title: 'Conversion Funnel',
        href: '/admin/conversion-funnel',
        icon: TrendingUp,
      },
      {
        title: 'User Behavior',
        href: '/admin/user-behavior',
        icon: Activity,
      },
      {
        title: 'Marketing Dashboard',
        href: '/admin/marketing-insights',
        icon: Target,
      },
      {
        title: 'Search Analytics',
        href: '/admin/search-analytics',
        icon: Eye,
      },
      {
        title: 'Sitter Recruitment',
        href: '/admin/sitter-recruitment',
        icon: Target,
      },
      {
        title: 'Demand Gap',
        href: '/admin/demand-gap',
        icon: MapPinned,
        highlight: true,
      },
      {
        title: 'Sitter Leads',
        href: '/admin/sitter-leads',
        icon: Users,
      },
    ],
  },
  {
    label: 'User Management',
    items: [
      {
        title: 'All Users',
        href: '/admin/users',
        icon: Users,
      },
      {
        title: 'Document Review',
        href: '/admin/documents',
        icon: ShieldCheck,
      },
      {
        title: 'Invite Sitters',
        href: '/admin/invite-unverified-sitters',
        icon: Mail,
      },
    ],
  },
  {
    label: 'Payments',
    items: [
      {
        title: 'Payouts',
        href: '/admin/payouts',
        icon: DollarSign,
      },
      {
        title: 'Promo Codes',
        href: '/admin/promo-codes',
        icon: Ticket,
      },
    ],
  },
  {
    label: 'Tools',
    items: [
      {
        title: 'Email Management',
        href: '/admin/email-management',
        icon: Mail,
      },
      {
        title: 'Stripe Accounts',
        href: '/admin/stripe-reset',
        icon: RefreshCw,
      },
      {
        title: 'Fix Issues',
        href: '/admin/fix-broken-bookings',
        icon: Wrench,
      },
    ],
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        {/* Logo/Title */}
        <div className="px-4 py-4 border-b">
          {!isCollapsed ? (
            <h2 className="text-lg font-semibold">Admin</h2>
          ) : (
            <LayoutDashboard className="h-5 w-5 mx-auto" />
          )}
        </div>

        {navSections.map((section) => (
          <SidebarGroup key={section.label}>
            {!isCollapsed && (
              <SidebarGroupLabel className={section.highlight ? 'text-primary font-semibold' : ''}>
                {section.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = location.pathname === item.href;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={isCollapsed ? item.title : undefined}
                      >
                        <Link to={item.href} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
