import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Mail, 
  Rocket, 
  FileText,
  DollarSign,
  Settings,
  Eye,
  RefreshCw
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin-dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Bulk Email Campaigns",
    href: "/admin/bulk-emails",
    icon: Mail,
  },
  {
    title: "Email Templates",
    href: "/admin/email-preview",
    icon: Eye,
  },
  {
    title: "Go Live Checklist",
    href: "/admin/go-live",
    icon: Rocket,
  },
  {
    title: "Payment Fix",
    href: "/admin/payment-fix",
    icon: DollarSign,
  },
  {
    title: "Stripe Migration",
    href: "/admin/stripe-reset",
    icon: RefreshCw,
  },
  {
    title: "Document Fix Tool",
    href: "/admin/document-fix",
    icon: FileText,
  },
  {
    title: "Resend Reports",
    href: "/admin/resend-report-emails",
    icon: FileText,
  },
];

export function AdminNav() {
  const location = useLocation();

  return (
    <nav className="flex items-center space-x-1 border-b bg-background px-4 overflow-x-auto">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:text-primary border-b-2 border-transparent whitespace-nowrap",
              isActive
                ? "text-primary border-primary"
                : "text-muted-foreground hover:border-muted"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
