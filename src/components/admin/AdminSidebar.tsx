import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Mail,
  Rocket,
  FileText,
  DollarSign,
  Settings,
  Eye,
  RefreshCw,
  ShieldCheck,
  ListChecks,
  Send,
  MailOpen,
  Wrench,
  AlertTriangle,
  UserCog
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
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/admin-dashboard',
        icon: LayoutDashboard,
        description: 'View all users, manage profiles, and monitor platform activity',
      },
    ],
  },
  {
    label: 'User Management',
    items: [
      {
        title: 'All Users',
        href: '/admin-dashboard',
        icon: Users,
        badge: 'Main',
        description: 'View and manage all users, verify sitters, and edit profiles',
      },
      {
        title: 'Document Review',
        href: '/admin/documents',
        icon: ShieldCheck,
        description: 'Review and approve ID verifications and gold badges',
      },
      {
        title: 'Invite Unverified Sitters',
        href: '/admin/invite-unverified-sitters',
        icon: Mail,
        description: 'Send invitations to unverified sitters to upload documents',
      },
      {
        title: 'Document Verification',
        href: '/admin/document-fix',
        icon: ShieldCheck,
        description: 'Manually verify documents for sitters with lost verification files',
      },
      {
        title: 'Stripe Accounts',
        href: '/admin/stripe-reset',
        icon: RefreshCw,
        description: 'Reset Stripe accounts and send re-onboarding notifications',
      },
    ],
  },
  {
    label: 'Communications',
    items: [
      {
        title: 'Email Management',
        href: '/admin/email-management',
        icon: Mail,
        description: 'Send campaigns, manage subscriptions, and view email templates',
      },
    ],
  },
  {
    label: 'Analytics',
    items: [
      {
        title: 'Search Analytics',
        href: '/admin/search-analytics',
        icon: Eye,
        description: 'View search behavior and retargeting data',
      },
    ],
  },
  {
    label: 'Financial',
    items: [
      {
        title: 'Payouts',
        href: '/admin-dashboard#payouts',
        icon: DollarSign,
        description: 'Monitor and process sitter payouts',
      },
      {
        title: 'Promo Codes',
        href: '/admin/promo-codes',
        icon: Send,
        description: 'Create and manage promotional discount codes',
      },
      {
        title: 'Payment Issues',
        href: '/admin/payment-fix',
        icon: AlertTriangle,
        description: 'Fix stuck payments and payment-related issues',
      },
      {
        title: 'Broken Bookings',
        href: '/admin/fix-broken-bookings',
        icon: Wrench,
        description: 'Repair bookings with payment or data issues',
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
            <h2 className="text-lg font-semibold">Admin Panel</h2>
          ) : (
            <UserCog className="h-6 w-6 mx-auto" />
          )}
        </div>

        {navSections.map((section) => (
          <SidebarGroup key={section.label}>
            {!isCollapsed && (
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive =
                    item.href === '/admin-dashboard'
                      ? location.pathname === '/admin-dashboard' && !location.hash
                      : location.pathname === item.href || location.pathname + location.hash === item.href;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={isCollapsed ? `${item.title}: ${item.description}` : undefined}
                      >
                        <Link to={item.href} className="flex flex-col items-start gap-0.5">
                          <div className="flex items-center gap-2 w-full">
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            {!isCollapsed && (
                              <>
                                <span>{item.title}</span>
                                {item.badge && (
                                  <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                    {item.badge}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                          {!isCollapsed && item.description && (
                            <span className="text-xs text-muted-foreground ml-6">
                              {item.description}
                            </span>
                          )}
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
