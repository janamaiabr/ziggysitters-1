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
      },
      {
        title: 'Document Verification',
        href: '/admin/document-fix',
        icon: ShieldCheck,
      },
      {
        title: 'Stripe Accounts',
        href: '/admin/stripe-reset',
        icon: RefreshCw,
      },
    ],
  },
  {
    label: 'Communications',
    items: [
      {
        title: 'Email Campaigns',
        href: '/admin/bulk-emails',
        icon: Send,
      },
      {
        title: 'Email Templates',
        href: '/admin/email-preview',
        icon: Eye,
      },
      {
        title: 'Email Subscriptions',
        href: '/admin/email-subscriptions',
        icon: MailOpen,
      },
      {
        title: 'Resend Reports',
        href: '/admin/resend-report-emails',
        icon: Mail,
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
      },
      {
        title: 'Payment Issues',
        href: '/admin/payment-fix',
        icon: AlertTriangle,
      },
      {
        title: 'Broken Bookings',
        href: '/admin/fix-broken-bookings',
        icon: Wrench,
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        title: 'Go Live Checklist',
        href: '/admin/go-live',
        icon: Rocket,
      },
      {
        title: 'Launch Announcement',
        href: '/admin/launch-announcement',
        icon: FileText,
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
                        tooltip={isCollapsed ? item.title : undefined}
                      >
                        <Link to={item.href} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
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
