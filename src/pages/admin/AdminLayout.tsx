import { NavLink, Outlet } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  FileText,
  Mail,
  Users,
  GitBranch,
  Webhook,
  Sparkles,
  Briefcase,
  FileCode,
  Settings,
  Crown,
  FileSpreadsheet,
  Wrench,
} from "lucide-react";

const nav = [
  { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/orders", label: "Orders & Bookings", icon: Package },
  { to: "/admin/invoices", label: "Invoice Manager", icon: FileText },
  { to: "/admin/email", label: "Email Center", icon: Mail },
  { to: "/admin/crm", label: "CRM", icon: Users },
  { to: "/admin/workflows", label: "Workflows", icon: GitBranch },
  { to: "/admin/webhooks", label: "Webhook Logs", icon: Webhook },
  { to: "/admin/ai-reports", label: "AI Reports", icon: Sparkles },
  { to: "/admin/services", label: "Services Management", icon: Briefcase },
  { to: "/admin/service-pages", label: "Pages & Packages", icon: Package },
  { to: "/admin/pricing", label: "Pricing Management", icon: FileCode },
  { to: "/admin/templates", label: "Templates", icon: FileCode },
  { to: "/admin/settings", label: "GST Configuration", icon: Settings },
  { to: "/admin/gst-reports", label: "GSTR Reports", icon: FileSpreadsheet },
  { to: "/admin/gst-maintenance", label: "GST Maintenance", icon: Wrench },
];

const AdminLayout = () => (
  <Layout>
    <SEOHead title="Operations Console" description="Ankshaastra centralized operations admin." />
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-gradient-to-r from-background via-card to-background">
        <div className="container mx-auto px-4 py-6 flex items-center gap-3">
          <Crown className="w-8 h-8 text-primary" />
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Operations Console</h1>
            <p className="text-sm text-muted-foreground">Centralized communication, invoicing & automation</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 max-w-[1600px]">
        <aside className="lg:w-64 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {nav.map(({ to, end, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-primary/15 text-primary border border-primary/30 font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  </Layout>
);

export default AdminLayout;
