// // // // // // // // // // import { NavLink, Outlet } from "react-router-dom";
// // // // // // // // // // import Layout from "@/components/layout/Layout";
// // // // // // // // // // import SEOHead from "@/components/SEOHead";
// // // // // // // // // // import { cn } from "@/lib/utils";
// // // // // // // // // // import {
// // // // // // // // // //   LayoutDashboard,
// // // // // // // // // //   Package,
// // // // // // // // // //   FileText,
// // // // // // // // // //   Mail,
// // // // // // // // // //   Users,
// // // // // // // // // //   GitBranch,
// // // // // // // // // //   Webhook,
// // // // // // // // // //   Sparkles,
// // // // // // // // // //   Briefcase,
// // // // // // // // // //   FileCode,
// // // // // // // // // //   Settings,
// // // // // // // // // //   Crown,
// // // // // // // // // //   FileSpreadsheet,
// // // // // // // // // //   Wrench,
// // // // // // // // // // } from "lucide-react";

// // // // // // // // // // const nav = [
// // // // // // // // // //   { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard },
// // // // // // // // // //   { to: "/admin/orders", label: "Orders & Bookings", icon: Package },
// // // // // // // // // //   { to: "/admin/invoices", label: "Invoice Manager", icon: FileText },
// // // // // // // // // //   { to: "/admin/email", label: "Email Center", icon: Mail },
// // // // // // // // // //   { to: "/admin/crm", label: "CRM", icon: Users },
// // // // // // // // // //   { to: "/admin/workflows", label: "Workflows", icon: GitBranch },
// // // // // // // // // //   { to: "/admin/webhooks", label: "Webhook Logs", icon: Webhook },
// // // // // // // // // //   { to: "/admin/ai-reports", label: "AI Reports", icon: Sparkles },
// // // // // // // // // //   { to: "/admin/services", label: "Services Management", icon: Briefcase },
// // // // // // // // // //   { to: "/admin/service-pages", label: "Pages & Packages", icon: Package },
// // // // // // // // // //   { to: "/admin/pricing", label: "Pricing Management", icon: FileCode },
// // // // // // // // // //   { to: "/admin/templates", label: "Templates", icon: FileCode },
// // // // // // // // // //   { to: "/admin/settings", label: "GST Configuration", icon: Settings },
// // // // // // // // // //   { to: "/admin/gst-reports", label: "GSTR Reports", icon: FileSpreadsheet },
// // // // // // // // // //   { to: "/admin/gst-maintenance", label: "GST Maintenance", icon: Wrench },
// // // // // // // // // // ];

// // // // // // // // // // const AdminLayout = () => (
// // // // // // // // // //   <Layout>
// // // // // // // // // //     <SEOHead title="Operations Console" description="Ankshaastra centralized operations admin." />
// // // // // // // // // //     <div className="min-h-screen bg-background">
// // // // // // // // // //       <div className="border-b border-border bg-gradient-to-r from-background via-card to-background">
// // // // // // // // // //         <div className="container mx-auto px-4 py-6 flex items-center gap-3">
// // // // // // // // // //           <Crown className="w-8 h-8 text-primary" />
// // // // // // // // // //           <div>
// // // // // // // // // //             <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Operations Console</h1>
// // // // // // // // // //             <p className="text-sm text-muted-foreground">Centralized communication, invoicing & automation</p>
// // // // // // // // // //           </div>
// // // // // // // // // //         </div>
// // // // // // // // // //       </div>
// // // // // // // // // //       <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 max-w-[1600px]">
// // // // // // // // // //         <aside className="lg:w-64 shrink-0">
// // // // // // // // // //           <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
// // // // // // // // // //             {nav.map(({ to, end, label, icon: Icon }) => (
// // // // // // // // // //               <NavLink
// // // // // // // // // //                 key={to}
// // // // // // // // // //                 to={to}
// // // // // // // // // //                 end={end}
// // // // // // // // // //                 className={({ isActive }) =>
// // // // // // // // // //                   cn(
// // // // // // // // // //                     "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors",
// // // // // // // // // //                     isActive
// // // // // // // // // //                       ? "bg-primary/15 text-primary border border-primary/30 font-medium"
// // // // // // // // // //                       : "text-muted-foreground hover:bg-muted hover:text-foreground"
// // // // // // // // // //                   )
// // // // // // // // // //                 }
// // // // // // // // // //               >
// // // // // // // // // //                 <Icon className="w-4 h-4 shrink-0" />
// // // // // // // // // //                 {label}
// // // // // // // // // //               </NavLink>
// // // // // // // // // //             ))}
// // // // // // // // // //           </nav>
// // // // // // // // // //         </aside>
// // // // // // // // // //         <main className="flex-1 min-w-0">
// // // // // // // // // //           <Outlet />
// // // // // // // // // //         </main>
// // // // // // // // // //       </div>
// // // // // // // // // //     </div>
// // // // // // // // // //   </Layout>
// // // // // // // // // // );

// // // // // // // // // // export default AdminLayout;

// // // // // // import { useState } from "react";
// // // // // // import { NavLink, Outlet, useNavigate } from "react-router-dom";
// // // // // // import Layout from "@/components/layout/Layout";
// // // // // // import SEOHead from "@/components/SEOHead";
// // // // // // import { cn } from "@/lib/utils";
// // // // // // import { useAuth } from "@/hooks/useAuth";
// // // // // // import { supabase } from "@/integrations/supabase/client";
// // // // // // import { Button } from "@/components/ui/button";
// // // // // // import { Input } from "@/components/ui/input";
// // // // // // import { Label } from "@/components/ui/label";
// // // // // // import {
// // // // // //   Dialog,
// // // // // //   DialogContent,
// // // // // //   DialogHeader,
// // // // // //   DialogTitle,
// // // // // //   DialogDescription,
// // // // // // } from "@/components/ui/dialog";
// // // // // // import { toast } from "sonner";
// // // // // // import {
// // // // // //   LayoutDashboard,
// // // // // //   Package,
// // // // // //   FileText,
// // // // // //   Mail,
// // // // // //   Users,
// // // // // //   GitBranch,
// // // // // //   Webhook,
// // // // // //   Sparkles,
// // // // // //   Briefcase,
// // // // // //   FileCode,
// // // // // //   Settings,
// // // // // //   Crown,
// // // // // //   FileSpreadsheet,
// // // // // //   Wrench,
// // // // // //   KeyRound,
// // // // // //   LogOut,
// // // // // //   Loader2,
// // // // // // } from "lucide-react";

// // // // // // const nav = [
// // // // // //   { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard },
// // // // // //   { to: "/admin/orders", label: "Orders & Bookings", icon: Package },
// // // // // //   { to: "/admin/invoices", label: "Invoice Manager", icon: FileText },
// // // // // //   { to: "/admin/email", label: "Email Center", icon: Mail },
// // // // // //   { to: "/admin/crm", label: "CRM", icon: Users },
// // // // // //   { to: "/admin/workflows", label: "Workflows", icon: GitBranch },
// // // // // //   { to: "/admin/webhooks", label: "Webhook Logs", icon: Webhook },
// // // // // //   { to: "/admin/ai-reports", label: "AI Reports", icon: Sparkles },
// // // // // //   { to: "/admin/services", label: "Services Management", icon: Briefcase },
// // // // // //   { to: "/admin/service-pages", label: "Pages & Packages", icon: Package },
// // // // // //   { to: "/admin/pricing", label: "Pricing Management", icon: FileCode },
// // // // // //   { to: "/admin/templates", label: "Templates", icon: FileCode },
// // // // // //   { to: "/admin/settings", label: "GST Configuration", icon: Settings },
// // // // // //   { to: "/admin/gst-reports", label: "GSTR Reports", icon: FileSpreadsheet },
// // // // // //   { to: "/admin/gst-maintenance", label: "GST Maintenance", icon: Wrench },
// // // // // // ];

// // // // // // const AdminLayout = () => {
// // // // // //   const { signOut } = useAuth();
// // // // // //   const navigate = useNavigate();

// // // // // //   const [showChangePw, setShowChangePw] = useState(false);
// // // // // //   const [newPassword, setNewPassword] = useState("");
// // // // // //   const [confirmPassword, setConfirmPassword] = useState("");
// // // // // //   const [changingPassword, setChangingPassword] = useState(false);

// // // // // //   const handleChangePassword = async (e: React.FormEvent) => {
// // // // // //     e.preventDefault();
// // // // // //     if (newPassword.length < 8) {
// // // // // //       toast.error("Password must be at least 8 characters");
// // // // // //       return;
// // // // // //     }
// // // // // //     if (newPassword !== confirmPassword) {
// // // // // //       toast.error("Passwords do not match");
// // // // // //       return;
// // // // // //     }
// // // // // //     setChangingPassword(true);
// // // // // //     const { error } = await supabase.auth.updateUser({ password: newPassword });
// // // // // //     setChangingPassword(false);

// // // // // //     if (error) {
// // // // // //       toast.error(error.message);
// // // // // //       return;
// // // // // //     }
// // // // // //     toast.success("Password changed successfully!");
// // // // // //     setNewPassword("");
// // // // // //     setConfirmPassword("");
// // // // // //     setShowChangePw(false);
// // // // // //   };

// // // // // //   const handleSignOut = async () => {
// // // // // //     await signOut();
// // // // // //     navigate("/auth", { replace: true });
// // // // // //   };

// // // // // //   return (
// // // // // //     <Layout>
// // // // // //       <SEOHead title="Operations Console" description="Ankshaastra centralized operations admin." />
// // // // // //       <div className="min-h-screen bg-background">
// // // // // //         <div className="border-b border-border bg-gradient-to-r from-background via-card to-background">
// // // // // //           <div className="container mx-auto px-4 py-6 flex items-center gap-3">
// // // // // //             <Crown className="w-8 h-8 text-primary" />
// // // // // //             <div>
// // // // // //               <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Operations Console</h1>
// // // // // //               <p className="text-sm text-muted-foreground">Centralized communication, invoicing & automation</p>
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //         <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 max-w-[1600px]">
// // // // // //           <aside className="lg:w-64 shrink-0 flex flex-col lg:sticky lg:top-24 lg:self-start">
// // // // // //             <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
// // // // // //               {nav.map(({ to, end, label, icon: Icon }) => (
// // // // // //                 <NavLink
// // // // // //                   key={to}
// // // // // //                   to={to}
// // // // // //                   end={end}
// // // // // //                   className={({ isActive }) =>
// // // // // //                     cn(
// // // // // //                       "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors",
// // // // // //                       isActive
// // // // // //                         ? "bg-primary/15 text-primary border border-primary/30 font-medium"
// // // // // //                         : "text-muted-foreground hover:bg-muted hover:text-foreground"
// // // // // //                     )
// // // // // //                   }
// // // // // //                 >
// // // // // //                   <Icon className="w-4 h-4 shrink-0" />
// // // // // //                   {label}
// // // // // //                 </NavLink>
// // // // // //               ))}
// // // // // //             </nav>

// // // // // //             {/* ---- Account actions: Change Password + Sign Out ---- */}
// // // // // //             <div className="hidden lg:flex flex-col gap-1 mt-2 pt-4 border-t border-border">
// // // // // //               <button
// // // // // //                 onClick={() => setShowChangePw(true)}
// // // // // //                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
// // // // // //               >
// // // // // //                 <KeyRound className="w-4 h-4 shrink-0" />
// // // // // //                 Change Password
// // // // // //               </button>
              
// // // // // //             </div>

// // // // // //             {/* Mobile: show as part of scrollable nav row */}
// // // // // //             <div className="flex lg:hidden gap-1 mt-2">
// // // // // //               <button
// // // // // //                 onClick={() => setShowChangePw(true)}
// // // // // //                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
// // // // // //               >
// // // // // //                 <KeyRound className="w-4 h-4 shrink-0" />
// // // // // //                 Change Password
// // // // // //               </button>
// // // // // //               <button
// // // // // //                 onClick={handleSignOut}
// // // // // //                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
// // // // // //               >
// // // // // //                 <LogOut className="w-4 h-4 shrink-0" />
// // // // // //                 Sign Out
// // // // // //               </button>
// // // // // //             </div>
// // // // // //           </aside>
// // // // // //           <main className="flex-1 min-w-0">
// // // // // //             <Outlet />
// // // // // //           </main>
// // // // // //         </div>
// // // // // //       </div>

// // // // // //       {/* ---- Change Password Modal ---- */}
// // // // // //       <Dialog open={showChangePw} onOpenChange={setShowChangePw}>
// // // // // //         <DialogContent className="sm:max-w-sm">
// // // // // //           <DialogHeader>
// // // // // //             <DialogTitle className="flex items-center gap-2">
// // // // // //               <KeyRound className="w-5 h-5 text-primary" />
// // // // // //               Change Password
// // // // // //             </DialogTitle>
// // // // // //             <DialogDescription>Update your admin account password.</DialogDescription>
// // // // // //           </DialogHeader>
// // // // // //           <form onSubmit={handleChangePassword} className="space-y-4">
// // // // // //             <div className="space-y-2">
// // // // // //               <Label htmlFor="admin-new-pw">New Password</Label>
// // // // // //               <Input
// // // // // //                 id="admin-new-pw"
// // // // // //                 type="password"
// // // // // //                 required
// // // // // //                 value={newPassword}
// // // // // //                 onChange={(e) => setNewPassword(e.target.value)}
// // // // // //               />
// // // // // //             </div>
// // // // // //             <div className="space-y-2">
// // // // // //               <Label htmlFor="admin-confirm-pw">Confirm New Password</Label>
// // // // // //               <Input
// // // // // //                 id="admin-confirm-pw"
// // // // // //                 type="password"
// // // // // //                 required
// // // // // //                 value={confirmPassword}
// // // // // //                 onChange={(e) => setConfirmPassword(e.target.value)}
// // // // // //               />
// // // // // //             </div>
// // // // // //             <Button type="submit" className="w-full" disabled={changingPassword}>
// // // // // //               {changingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
// // // // // //               Update Password
// // // // // //             </Button>
// // // // // //           </form>
// // // // // //         </DialogContent>
// // // // // //       </Dialog>
// // // // // //     </Layout>
// // // // // //   );
// // // // // // };

// // // // // // export default AdminLayout;

// // // // // // import { useState } from "react";
// // // // // // import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
// // // // // // import Layout from "@/components/layout/Layout";
// // // // // // import SEOHead from "@/components/SEOHead";
// // // // // // import { cn } from "@/lib/utils";
// // // // // // import { useAuth } from "@/hooks/useAuth";
// // // // // // import { supabase } from "@/integrations/supabase/client";
// // // // // // import { Button } from "@/components/ui/button";
// // // // // // import { Input } from "@/components/ui/input";
// // // // // // import { Label } from "@/components/ui/label";
// // // // // // import {
// // // // // //   Dialog,
// // // // // //   DialogContent,
// // // // // //   DialogHeader,
// // // // // //   DialogTitle,
// // // // // //   DialogDescription,
// // // // // // } from "@/components/ui/dialog";
// // // // // // import { toast } from "sonner";
// // // // // // import {
// // // // // //   LayoutDashboard,
// // // // // //   Package,
// // // // // //   FileText,
// // // // // //   Mail,
// // // // // //   Users,
// // // // // //   GitBranch,
// // // // // //   Webhook,
// // // // // //   Sparkles,
// // // // // //   Briefcase,
// // // // // //   FileCode,
// // // // // //   Settings,
// // // // // //   Crown,
// // // // // //   FileSpreadsheet,
// // // // // //   Wrench,
// // // // // //   KeyRound,
// // // // // //   LogOut,
// // // // // //   Loader2,
// // // // // //   UserCog,
// // // // // //   ShieldAlert,
// // // // // //   ScanSearch,

// // // // // // } from "lucide-react";

// // // // // // const nav = [
// // // // // //   { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
// // // // // //   { to: "/admin/orders", label: "Orders & Bookings", icon: Package, module: "orders" },
// // // // // //   { to: "/admin/invoices", label: "Invoice Manager", icon: FileText, module: "invoices" },
// // // // // //   { to: "/admin/email", label: "Email Center", icon: Mail, module: "email" },
// // // // // //   { to: "/admin/crm", label: "CRM", icon: Users, module: "crm" },
// // // // // //   { to: "/admin/workflows", label: "Workflows", icon: GitBranch, module: "workflows" },
// // // // // //   { to: "/admin/webhooks", label: "Webhook Logs", icon: Webhook, module: "webhooks" },
// // // // // //   { to: "/admin/ai-reports", label: "AI Reports", icon: Sparkles, module: "ai-reports" },
// // // // // //   { to: "/admin/services", label: "Services Management", icon: Briefcase, module: "services" },
// // // // // //   { to: "/admin/service-pages", label: "Pages & Packages", icon: Package, module: "service-pages" },
// // // // // //   { to: "/admin/pricing", label: "Pricing Management", icon: FileCode, module: "pricing" },
// // // // // //   { to: "/admin/templates", label: "Templates", icon: FileCode, module: "templates" },
// // // // // //   { to: "/admin/settings", label: "GST Configuration", icon: Settings, module: "settings" },
// // // // // //   { to: "/admin/gst-reports", label: "GSTR Reports", icon: FileSpreadsheet, module: "gst-reports" },
// // // // // //   { to: "/admin/gst-maintenance", label: "GST Maintenance", icon: Wrench, module: "gst-maintenance" },
// // // // // //   { to: "/admin/team", label: "Team Management", icon: UserCog, module: "team", adminOnly: true },
// // // // // //     { to: "/admin/name-check-reports", label: "Name Check Reports", icon: ScanSearch, module: "name-check-reports" },

// // // // // // ];

// // // // // // const AdminLayout = () => {
// // // // // //   const { signOut, role, canViewModule } = useAuth();
// // // // // //   const navigate = useNavigate();
// // // // // //   const location = useLocation();

// // // // // //   const [showChangePw, setShowChangePw] = useState(false);
// // // // // //   const [newPassword, setNewPassword] = useState("");
// // // // // //   const [confirmPassword, setConfirmPassword] = useState("");
// // // // // //   const [changingPassword, setChangingPassword] = useState(false);

// // // // // //   const handleChangePassword = async (e: React.FormEvent) => {
// // // // // //     e.preventDefault();
// // // // // //     if (newPassword.length < 8) {
// // // // // //       toast.error("Password must be at least 8 characters");
// // // // // //       return;
// // // // // //     }
// // // // // //     if (newPassword !== confirmPassword) {
// // // // // //       toast.error("Passwords do not match");
// // // // // //       return;
// // // // // //     }
// // // // // //     setChangingPassword(true);
// // // // // //     const { error } = await supabase.auth.updateUser({ password: newPassword });
// // // // // //     setChangingPassword(false);

// // // // // //     if (error) {
// // // // // //       toast.error(error.message);
// // // // // //       return;
// // // // // //     }
// // // // // //     toast.success("Password changed successfully!");
// // // // // //     setNewPassword("");
// // // // // //     setConfirmPassword("");
// // // // // //     setShowChangePw(false);
// // // // // //   };

// // // // // //   const handleSignOut = async () => {
// // // // // //     await signOut();
// // // // // //     navigate("/auth", { replace: true });
// // // // // //   };

// // // // // //   // Sidebar: staff ko sirf allowed modules dikhein; admin ko sab
// // // // // //   const visibleNav = nav.filter((item) => {
// // // // // //     if (item.adminOnly) return role === "admin";
// // // // // //     if (role === "admin") return true;
// // // // // //     if (item.module === "dashboard") return true; // sabko dashboard dikhega
// // // // // //     return canViewModule(item.module);
// // // // // //   });

// // // // // //   // Direct URL se bhi koi disallowed module na khol paye
// // // // // //   const currentNavItem = nav.find((item) =>
// // // // // //     item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
// // // // // //   );
// // // // // //   const hasAccessToCurrentPage =
// // // // // //     role === "admin" ||
// // // // // //     !currentNavItem ||
// // // // // //     currentNavItem.module === "dashboard" ||
// // // // // //     canViewModule(currentNavItem.module);

// // // // // //   return (
// // // // // //     <Layout>
// // // // // //       <SEOHead title="Operations Console" description="Ankshaastra centralized operations admin." />
// // // // // //       <div className="min-h-screen bg-background">
// // // // // //         <div className="border-b border-border bg-gradient-to-r from-background via-card to-background">
// // // // // //           <div className="container mx-auto px-4 py-6 flex items-center gap-3">
// // // // // //             <Crown className="w-8 h-8 text-primary" />
// // // // // //             <div>
// // // // // //               <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Operations Console</h1>
// // // // // //               <p className="text-sm text-muted-foreground">Centralized communication, invoicing & automation</p>
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //         <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 max-w-[1600px]">
// // // // // //           <aside className="lg:w-64 shrink-0 flex flex-col lg:sticky lg:top-24 lg:self-start">
// // // // // //             <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
// // // // // //               {visibleNav.map(({ to, end, label, icon: Icon }) => (
// // // // // //                 <NavLink
// // // // // //                   key={to}
// // // // // //                   to={to}
// // // // // //                   end={end}
// // // // // //                   className={({ isActive }) =>
// // // // // //                     cn(
// // // // // //                       "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors",
// // // // // //                       isActive
// // // // // //                         ? "bg-primary/15 text-primary border border-primary/30 font-medium"
// // // // // //                         : "text-muted-foreground hover:bg-muted hover:text-foreground"
// // // // // //                     )
// // // // // //                   }
// // // // // //                 >
// // // // // //                   <Icon className="w-4 h-4 shrink-0" />
// // // // // //                   {label}
// // // // // //                 </NavLink>
// // // // // //               ))}
// // // // // //             </nav>

// // // // // //             <div className="hidden lg:flex flex-col gap-1 mt-2 pt-4 border-t border-border">
// // // // // //               <button
// // // // // //                 onClick={() => setShowChangePw(true)}
// // // // // //                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
// // // // // //               >
// // // // // //                 <KeyRound className="w-4 h-4 shrink-0" />
// // // // // //                 Change Password
// // // // // //               </button>
// // // // // //               <button
// // // // // //                 onClick={handleSignOut}
// // // // // //                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
// // // // // //               >
// // // // // //                 <LogOut className="w-4 h-4 shrink-0" />
// // // // // //                 Sign Out
// // // // // //               </button>
// // // // // //             </div>

// // // // // //             <div className="flex lg:hidden gap-1 mt-2">
// // // // // //               <button
// // // // // //                 onClick={() => setShowChangePw(true)}
// // // // // //                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
// // // // // //               >
// // // // // //                 <KeyRound className="w-4 h-4 shrink-0" />
// // // // // //                 Change Password
// // // // // //               </button>
// // // // // //               <button
// // // // // //                 onClick={handleSignOut}
// // // // // //                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
// // // // // //               >
// // // // // //                 <LogOut className="w-4 h-4 shrink-0" />
// // // // // //                 Sign Out
// // // // // //               </button>
// // // // // //             </div>
// // // // // //           </aside>
// // // // // //           <main className="flex-1 min-w-0">
// // // // // //             {hasAccessToCurrentPage ? (
// // // // // //               <Outlet />
// // // // // //             ) : (
// // // // // //               <div className="flex flex-col items-center justify-center py-24 text-center">
// // // // // //                 <ShieldAlert className="w-12 h-12 text-destructive mb-4" />
// // // // // //                 <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
// // // // // //                 <p className="text-muted-foreground mt-2">You don't have permission to view this section.</p>
// // // // // //               </div>
// // // // // //             )}
// // // // // //           </main>
// // // // // //         </div>
// // // // // //       </div>

// // // // // //       <Dialog open={showChangePw} onOpenChange={setShowChangePw}>
// // // // // //         <DialogContent className="sm:max-w-sm">
// // // // // //           <DialogHeader>
// // // // // //             <DialogTitle className="flex items-center gap-2">
// // // // // //               <KeyRound className="w-5 h-5 text-primary" />
// // // // // //               Change Password
// // // // // //             </DialogTitle>
// // // // // //             <DialogDescription>Update your admin account password.</DialogDescription>
// // // // // //           </DialogHeader>
// // // // // //           <form onSubmit={handleChangePassword} className="space-y-4">
// // // // // //             <div className="space-y-2">
// // // // // //               <Label htmlFor="admin-new-pw">New Password</Label>
// // // // // //               <Input
// // // // // //                 id="admin-new-pw"
// // // // // //                 type="password"
// // // // // //                 required
// // // // // //                 value={newPassword}
// // // // // //                 onChange={(e) => setNewPassword(e.target.value)}
// // // // // //               />
// // // // // //             </div>
// // // // // //             <div className="space-y-2">
// // // // // //               <Label htmlFor="admin-confirm-pw">Confirm New Password</Label>
// // // // // //               <Input
// // // // // //                 id="admin-confirm-pw"
// // // // // //                 type="password"
// // // // // //                 required
// // // // // //                 value={confirmPassword}
// // // // // //                 onChange={(e) => setConfirmPassword(e.target.value)}
// // // // // //               />
// // // // // //             </div>
// // // // // //             <Button type="submit" className="w-full" disabled={changingPassword}>
// // // // // //               {changingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
// // // // // //               Update Password
// // // // // //             </Button>
// // // // // //           </form>
// // // // // //         </DialogContent>
// // // // // //       </Dialog>
// // // // // //     </Layout>
// // // // // //   );
// // // // // // };

// // // // // // export default AdminLayout;

// // // // // // import { useState } from "react";
// // // // // // import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
// // // // // // import SEOHead from "@/components/SEOHead";
// // // // // // import { cn } from "@/lib/utils";
// // // // // // import { useAuth } from "@/hooks/useAuth";
// // // // // // import { supabase } from "@/integrations/supabase/client";
// // // // // // import { Button } from "@/components/ui/button";
// // // // // // import { Input } from "@/components/ui/input";
// // // // // // import { Label } from "@/components/ui/label";
// // // // // // import {
// // // // // //   Dialog,
// // // // // //   DialogContent,
// // // // // //   DialogHeader,
// // // // // //   DialogTitle,
// // // // // //   DialogDescription,
// // // // // // } from "@/components/ui/dialog";
// // // // // // import { toast } from "sonner";
// // // // // // import {
// // // // // //   LayoutDashboard,
// // // // // //   Package,
// // // // // //   FileText,
// // // // // //   Mail,
// // // // // //   Users,
// // // // // //   GitBranch,
// // // // // //   Webhook,
// // // // // //   Sparkles,
// // // // // //   Briefcase,
// // // // // //   FileCode,
// // // // // //   Settings,
// // // // // //   Crown,
// // // // // //   FileSpreadsheet,
// // // // // //   Wrench,
// // // // // //   KeyRound,
// // // // // //   LogOut,
// // // // // //   Loader2,
// // // // // //   UserCog,
// // // // // //   ShieldAlert,
// // // // // //   ScanSearch,
// // // // // //   ChevronDown,
// // // // // // } from "lucide-react";

// // // // // // // Sidebar is grouped into sections instead of one flat 16-item list, so related
// // // // // // // screens (e.g. Orders/Invoices/CRM) sit together and similarly-named GST items
// // // // // // // don't have to be read one-by-one to tell apart.
// // // // // // type NavItem = {
// // // // // //   to: string;
// // // // // //   end?: boolean;
// // // // // //   label: string;
// // // // // //   icon: typeof LayoutDashboard;
// // // // // //   module: string;
// // // // // //   adminOnly?: boolean;
// // // // // // };

// // // // // // type NavSection = {
// // // // // //   label: string;
// // // // // //   items: NavItem[];
// // // // // // };

// // // // // // const navSections: NavSection[] = [
// // // // // //   {
// // // // // //     label: "Overview",
// // // // // //     items: [
// // // // // //       { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
// // // // // //     ],
// // // // // //   },
// // // // // //   {
// // // // // //     label: "Sales & Customers",
// // // // // //     items: [
// // // // // //       { to: "/admin/orders", label: "Orders & Bookings", icon: Package, module: "orders" },
// // // // // //       { to: "/admin/invoices", label: "Invoice Manager", icon: FileText, module: "invoices" },
// // // // // //       { to: "/admin/crm", label: "CRM", icon: Users, module: "crm" },
// // // // // //     ],
// // // // // //   },
// // // // // //   {
// // // // // //     label: "Automation",
// // // // // //     items: [
// // // // // //       { to: "/admin/workflows", label: "Workflows", icon: GitBranch, module: "workflows" },
// // // // // //       { to: "/admin/webhooks", label: "Webhook Logs", icon: Webhook, module: "webhooks" },
// // // // // //       { to: "/admin/email", label: "Email Center", icon: Mail, module: "email" },
// // // // // //     ],
// // // // // //   },
// // // // // //   {
// // // // // //     label: "Catalog",
// // // // // //     items: [
// // // // // //       { to: "/admin/services", label: "Services Management", icon: Briefcase, module: "services" },
// // // // // //       { to: "/admin/service-pages", label: "Pages & Packages", icon: Package, module: "service-pages" },
// // // // // //       { to: "/admin/pricing", label: "Pricing Management", icon: FileCode, module: "pricing" },
// // // // // //       { to: "/admin/templates", label: "Templates", icon: FileCode, module: "templates" },
// // // // // //     ],
// // // // // //   },
// // // // // //   {
// // // // // //     label: "Compliance",
// // // // // //     items: [
// // // // // //       { to: "/admin/settings", label: "GST Configuration", icon: Settings, module: "settings" },
// // // // // //       { to: "/admin/gst-reports", label: "GSTR Reports", icon: FileSpreadsheet, module: "gst-reports" },
// // // // // //       { to: "/admin/gst-maintenance", label: "GST Maintenance", icon: Wrench, module: "gst-maintenance" },
// // // // // //     ],
// // // // // //   },
// // // // // //   {
// // // // // //     label: "Admin",
// // // // // //     items: [
// // // // // //       { to: "/admin/ai-reports", label: "AI Reports", icon: Sparkles, module: "ai-reports" },
// // // // // //       { to: "/admin/name-check-reports", label: "Name Check Reports", icon: ScanSearch, module: "name-check-reports" },
// // // // // //       { to: "/admin/team", label: "Team Management", icon: UserCog, module: "team", adminOnly: true },
// // // // // //     ],
// // // // // //   },
// // // // // // ];

// // // // // // // Flat list kept for lookups (current-page access check) without duplicating data.
// // // // // // const nav: NavItem[] = navSections.flatMap((s) => s.items);

// // // // // // const AdminLayout = () => {
// // // // // //   const { signOut, role, canViewModule } = useAuth();
// // // // // //   const navigate = useNavigate();
// // // // // //   const location = useLocation();

// // // // // //   const [showChangePw, setShowChangePw] = useState(false);
// // // // // //   const [newPassword, setNewPassword] = useState("");
// // // // // //   const [confirmPassword, setConfirmPassword] = useState("");
// // // // // //   const [changingPassword, setChangingPassword] = useState(false);

// // // // // //   // All sections open by default; collapsed state is per-section so infrequently
// // // // // //   // used groups (e.g. Compliance) can be tucked away without hiding the rest.
// // // // // //   const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

// // // // // //   const toggleSection = (label: string) => {
// // // // // //     setCollapsedSections((prev) => ({ ...prev, [label]: !prev[label] }));
// // // // // //   };

// // // // // //   const handleChangePassword = async (e: React.FormEvent) => {
// // // // // //     e.preventDefault();
// // // // // //     if (newPassword.length < 8) {
// // // // // //       toast.error("Password must be at least 8 characters");
// // // // // //       return;
// // // // // //     }
// // // // // //     if (newPassword !== confirmPassword) {
// // // // // //       toast.error("Passwords do not match");
// // // // // //       return;
// // // // // //     }
// // // // // //     setChangingPassword(true);
// // // // // //     const { error } = await supabase.auth.updateUser({ password: newPassword });
// // // // // //     setChangingPassword(false);

// // // // // //     if (error) {
// // // // // //       toast.error(error.message);
// // // // // //       return;
// // // // // //     }
// // // // // //     toast.success("Password changed successfully!");
// // // // // //     setNewPassword("");
// // // // // //     setConfirmPassword("");
// // // // // //     setShowChangePw(false);
// // // // // //   };

// // // // // //   const handleSignOut = async () => {
// // // // // //     await signOut();
// // // // // //     navigate("/auth", { replace: true });
// // // // // //   };

// // // // // //   // Sidebar: staff ko sirf allowed modules dikhein; admin ko sab
// // // // // //   const visibleSections = navSections
// // // // // //     .map((section) => ({
// // // // // //       ...section,
// // // // // //       items: section.items.filter((item) => {
// // // // // //         if (item.adminOnly) return role === "admin";
// // // // // //         if (role === "admin") return true;
// // // // // //         if (item.module === "dashboard") return true; // sabko dashboard dikhega
// // // // // //         return canViewModule(item.module);
// // // // // //       }),
// // // // // //     }))
// // // // // //     .filter((section) => section.items.length > 0);

// // // // // //   // Direct URL se bhi koi disallowed module na khol paye
// // // // // //   const currentNavItem = nav.find((item) =>
// // // // // //     item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
// // // // // //   );
// // // // // //   const hasAccessToCurrentPage =
// // // // // //     role === "admin" ||
// // // // // //     !currentNavItem ||
// // // // // //     currentNavItem.module === "dashboard" ||
// // // // // //     canViewModule(currentNavItem.module);

// // // // // //   return (
// // // // // //     <>
// // // // // //       <SEOHead title="Operations Console" description="Ankshaastra centralized operations admin." />
// // // // // //       {/* Admin gets its own minimal shell — no public marketing nav (Home, Services,
// // // // // //           Reports, Podcasts, Shop, etc.) and no customer-support chat bubble. Those
// // // // // //           were built for site visitors, not ops staff, and the chat bubble was
// // // // // //           overlapping list content in the dashboard. */}
// // // // // //       <div className="min-h-screen bg-background">
// // // // // //         <div className="border-b border-border bg-gradient-to-r from-background via-card to-background">
// // // // // //           <div className="container mx-auto px-4 py-6 flex items-center justify-between gap-3">
// // // // // //             <div className="flex items-center gap-3">
// // // // // //               <Crown className="w-8 h-8 text-primary" />
// // // // // //               <div>
// // // // // //                 <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Operations Console</h1>
// // // // // //                 <p className="text-sm text-muted-foreground">Centralized communication, invoicing & automation</p>
// // // // // //               </div>
// // // // // //             </div>
// // // // // //             <button
// // // // // //               onClick={handleSignOut}
// // // // // //               className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
// // // // // //             >
// // // // // //               <LogOut className="w-4 h-4" />
// // // // // //               Sign Out
// // // // // //             </button>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //         <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 max-w-[1600px]">
// // // // // //           <aside className="lg:w-64 shrink-0 flex flex-col lg:sticky lg:top-8 lg:self-start">
// // // // // //             <nav className="flex flex-col gap-4">
// // // // // //               {visibleSections.map((section) => {
// // // // // //                 const isCollapsed = collapsedSections[section.label];
// // // // // //                 return (
// // // // // //                   <div key={section.label}>
// // // // // //                     <button
// // // // // //                       onClick={() => toggleSection(section.label)}
// // // // // //                       className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
// // // // // //                     >
// // // // // //                       {section.label}
// // // // // //                       <ChevronDown
// // // // // //                         className={cn(
// // // // // //                           "w-3.5 h-3.5 transition-transform",
// // // // // //                           isCollapsed && "-rotate-90"
// // // // // //                         )}
// // // // // //                       />
// // // // // //                     </button>
// // // // // //                     {!isCollapsed && (
// // // // // //                       <div className="flex flex-col gap-1 mt-1">
// // // // // //                         {section.items.map(({ to, end, label, icon: Icon }) => (
// // // // // //                           <NavLink
// // // // // //                             key={to}
// // // // // //                             to={to}
// // // // // //                             end={end}
// // // // // //                             className={({ isActive }) =>
// // // // // //                               cn(
// // // // // //                                 "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors",
// // // // // //                                 isActive
// // // // // //                                   ? "bg-primary/15 text-primary border border-primary/30 font-medium"
// // // // // //                                   : "text-muted-foreground hover:bg-muted hover:text-foreground"
// // // // // //                               )
// // // // // //                             }
// // // // // //                           >
// // // // // //                             <Icon className="w-4 h-4 shrink-0" />
// // // // // //                             {label}
// // // // // //                           </NavLink>
// // // // // //                         ))}
// // // // // //                       </div>
// // // // // //                     )}
// // // // // //                   </div>
// // // // // //                 );
// // // // // //               })}
// // // // // //             </nav>

// // // // // //             <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-border">
// // // // // //               <button
// // // // // //                 onClick={() => setShowChangePw(true)}
// // // // // //                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
// // // // // //               >
// // // // // //                 <KeyRound className="w-4 h-4 shrink-0" />
// // // // // //                 Change Password
// // // // // //               </button>
// // // // // //               <button
// // // // // //                 onClick={handleSignOut}
// // // // // //                 className="flex sm:hidden items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
// // // // // //               >
// // // // // //                 <LogOut className="w-4 h-4 shrink-0" />
// // // // // //                 Sign Out
// // // // // //               </button>
// // // // // //             </div>
// // // // // //           </aside>
// // // // // //           <main className="flex-1 min-w-0">
// // // // // //             {hasAccessToCurrentPage ? (
// // // // // //               <Outlet />
// // // // // //             ) : (
// // // // // //               <div className="flex flex-col items-center justify-center py-24 text-center">
// // // // // //                 <ShieldAlert className="w-12 h-12 text-destructive mb-4" />
// // // // // //                 <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
// // // // // //                 <p className="text-muted-foreground mt-2">You don't have permission to view this section.</p>
// // // // // //               </div>
// // // // // //             )}
// // // // // //           </main>
// // // // // //         </div>
// // // // // //       </div>

// // // // // //       <Dialog open={showChangePw} onOpenChange={setShowChangePw}>
// // // // // //         <DialogContent className="sm:max-w-sm">
// // // // // //           <DialogHeader>
// // // // // //             <DialogTitle className="flex items-center gap-2">
// // // // // //               <KeyRound className="w-5 h-5 text-primary" />
// // // // // //               Change Password
// // // // // //             </DialogTitle>
// // // // // //             <DialogDescription>Update your admin account password.</DialogDescription>
// // // // // //           </DialogHeader>
// // // // // //           <form onSubmit={handleChangePassword} className="space-y-4">
// // // // // //             <div className="space-y-2">
// // // // // //               <Label htmlFor="admin-new-pw">New Password</Label>
// // // // // //               <Input
// // // // // //                 id="admin-new-pw"
// // // // // //                 type="password"
// // // // // //                 required
// // // // // //                 value={newPassword}
// // // // // //                 onChange={(e) => setNewPassword(e.target.value)}
// // // // // //               />
// // // // // //             </div>
// // // // // //             <div className="space-y-2">
// // // // // //               <Label htmlFor="admin-confirm-pw">Confirm New Password</Label>
// // // // // //               <Input
// // // // // //                 id="admin-confirm-pw"
// // // // // //                 type="password"
// // // // // //                 required
// // // // // //                 value={confirmPassword}
// // // // // //                 onChange={(e) => setConfirmPassword(e.target.value)}
// // // // // //               />
// // // // // //             </div>
// // // // // //             <Button type="submit" className="w-full" disabled={changingPassword}>
// // // // // //               {changingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
// // // // // //               Update Password
// // // // // //             </Button>
// // // // // //           </form>
// // // // // //         </DialogContent>
// // // // // //       </Dialog>
// // // // // //     </>
// // // // // //   );
// // // // // // };

// // // // // // export default AdminLayout;

// // // // // import { useState } from "react";
// // // // // import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
// // // // // import Layout from "@/components/layout/Layout";
// // // // // import SEOHead from "@/components/SEOHead";
// // // // // import { cn } from "@/lib/utils";
// // // // // import { useAuth } from "@/hooks/useAuth";
// // // // // import { supabase } from "@/integrations/supabase/client";
// // // // // import { Button } from "@/components/ui/button";
// // // // // import { Input } from "@/components/ui/input";
// // // // // import { Label } from "@/components/ui/label";
// // // // // import {
// // // // //   Dialog,
// // // // //   DialogContent,
// // // // //   DialogHeader,
// // // // //   DialogTitle,
// // // // //   DialogDescription,
// // // // // } from "@/components/ui/dialog";
// // // // // import { toast } from "sonner";
// // // // // import {
// // // // //   LayoutDashboard,
// // // // //   Package,
// // // // //   FileText,
// // // // //   Mail,
// // // // //   Users,
// // // // //   GitBranch,
// // // // //   Webhook,
// // // // //   Sparkles,
// // // // //   Briefcase,
// // // // //   FileCode,
// // // // //   Settings,
// // // // //   Crown,
// // // // //   FileSpreadsheet,
// // // // //   Wrench,
// // // // //   KeyRound,
// // // // //   LogOut,
// // // // //   Loader2,
// // // // //   UserCog,
// // // // //   ShieldAlert,
// // // // //   ScanSearch,
// // // // //   ChevronDown,
// // // // // } from "lucide-react";

// // // // // type NavItem = {
// // // // //   to: string;
// // // // //   end?: boolean;
// // // // //   label: string;
// // // // //   icon: typeof LayoutDashboard;
// // // // //   module: string;
// // // // //   adminOnly?: boolean;
// // // // // };

// // // // // type NavSection = {
// // // // //   label: string;
// // // // //   items: NavItem[];
// // // // // };

// // // // // const navSections: NavSection[] = [
// // // // //   {
// // // // //     label: "Overview",
// // // // //     items: [
// // // // //       { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
// // // // //     ],
// // // // //   },
// // // // //   {
// // // // //     label: "Sales & Customers",
// // // // //     items: [
// // // // //       { to: "/admin/orders", label: "Orders & Bookings", icon: Package, module: "orders" },
// // // // //       { to: "/admin/invoices", label: "Invoice Manager", icon: FileText, module: "invoices" },
// // // // //       { to: "/admin/crm", label: "CRM", icon: Users, module: "crm" },
// // // // //     ],
// // // // //   },
// // // // //   {
// // // // //     label: "Automation",
// // // // //     items: [
// // // // //       { to: "/admin/workflows", label: "Workflows", icon: GitBranch, module: "workflows" },
// // // // //       { to: "/admin/webhooks", label: "Webhook Logs", icon: Webhook, module: "webhooks" },
// // // // //       { to: "/admin/email", label: "Email Center", icon: Mail, module: "email" },
// // // // //     ],
// // // // //   },
// // // // //   {
// // // // //     label: "Catalog",
// // // // //     items: [
// // // // //       { to: "/admin/services", label: "Services Management", icon: Briefcase, module: "services" },
// // // // //       { to: "/admin/service-pages", label: "Pages & Packages", icon: Package, module: "service-pages" },
// // // // //       { to: "/admin/pricing", label: "Pricing Management", icon: FileCode, module: "pricing" },
// // // // //       { to: "/admin/templates", label: "Templates", icon: FileCode, module: "templates" },
// // // // //     ],
// // // // //   },
// // // // //   {
// // // // //     label: "Compliance",
// // // // //     items: [
// // // // //       { to: "/admin/settings", label: "GST Configuration", icon: Settings, module: "settings" },
// // // // //       { to: "/admin/gst-reports", label: "GSTR Reports", icon: FileSpreadsheet, module: "gst-reports" },
// // // // //       { to: "/admin/gst-maintenance", label: "GST Maintenance", icon: Wrench, module: "gst-maintenance" },
// // // // //     ],
// // // // //   },
// // // // //   {
// // // // //     label: "Admin",
// // // // //     items: [
// // // // //       { to: "/admin/ai-reports", label: "AI Reports", icon: Sparkles, module: "ai-reports" },
// // // // //       { to: "/admin/name-check-reports", label: "Name Check Reports", icon: ScanSearch, module: "name-check-reports" },
// // // // //       { to: "/admin/team", label: "Team Management", icon: UserCog, module: "team", adminOnly: true },
// // // // //     ],
// // // // //   },
// // // // // ];

// // // // // const nav: NavItem[] = navSections.flatMap((s) => s.items);

// // // // // const AdminLayout = () => {
// // // // //   const { signOut, role, canViewModule } = useAuth();
// // // // //   const navigate = useNavigate();
// // // // //   const location = useLocation();

// // // // //   const [showChangePw, setShowChangePw] = useState(false);
// // // // //   const [newPassword, setNewPassword] = useState("");
// // // // //   const [confirmPassword, setConfirmPassword] = useState("");
// // // // //   const [changingPassword, setChangingPassword] = useState(false);

// // // // //   const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

// // // // //   const toggleSection = (label: string) => {
// // // // //     setCollapsedSections((prev) => ({ ...prev, [label]: !prev[label] }));
// // // // //   };

// // // // //   const handleChangePassword = async (e: React.FormEvent) => {
// // // // //     e.preventDefault();
// // // // //     if (newPassword.length < 8) {
// // // // //       toast.error("Password must be at least 8 characters");
// // // // //       return;
// // // // //     }
// // // // //     if (newPassword !== confirmPassword) {
// // // // //       toast.error("Passwords do not match");
// // // // //       return;
// // // // //     }
// // // // //     setChangingPassword(true);
// // // // //     const { error } = await supabase.auth.updateUser({ password: newPassword });
// // // // //     setChangingPassword(false);

// // // // //     if (error) {
// // // // //       toast.error(error.message);
// // // // //       return;
// // // // //     }
// // // // //     toast.success("Password changed successfully!");
// // // // //     setNewPassword("");
// // // // //     setConfirmPassword("");
// // // // //     setShowChangePw(false);
// // // // //   };

// // // // //   const handleSignOut = async () => {
// // // // //     await signOut();
// // // // //     navigate("/auth", { replace: true });
// // // // //   };

// // // // //   const visibleSections = navSections
// // // // //     .map((section) => ({
// // // // //       ...section,
// // // // //       items: section.items.filter((item) => {
// // // // //         if (item.adminOnly) return role === "admin";
// // // // //         if (role === "admin") return true;
// // // // //         if (item.module === "dashboard") return true;
// // // // //         return canViewModule(item.module);
// // // // //       }),
// // // // //     }))
// // // // //     .filter((section) => section.items.length > 0);

// // // // //   const currentNavItem = nav.find((item) =>
// // // // //     item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
// // // // //   );
// // // // //   const hasAccessToCurrentPage =
// // // // //     role === "admin" ||
// // // // //     !currentNavItem ||
// // // // //     currentNavItem.module === "dashboard" ||
// // // // //     canViewModule(currentNavItem.module);

// // // // //   return (
// // // // //     <Layout>
// // // // //       <SEOHead title="Operations Console" description="Ankshaastra centralized operations admin." />
// // // // //       <div className="min-h-screen bg-background">
// // // // //         <div className="border-b border-border bg-gradient-to-r from-background via-card to-background">
// // // // //           <div className="container mx-auto px-4 py-6 flex items-center gap-3">
// // // // //             <Crown className="w-8 h-8 text-primary" />
// // // // //             <div>
// // // // //               <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Operations Console</h1>
// // // // //               <p className="text-sm text-muted-foreground">Centralized communication, invoicing & automation</p>
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>
// // // // //         <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 max-w-[1600px]">
// // // // //           <aside className="lg:w-64 shrink-0 flex flex-col lg:sticky lg:top-24 lg:self-start">
// // // // //             <nav className="flex flex-col gap-4">
// // // // //               {visibleSections.map((section) => {
// // // // //                 const isCollapsed = collapsedSections[section.label];
// // // // //                 return (
// // // // //                   <div key={section.label}>
// // // // //                     <button
// // // // //                       onClick={() => toggleSection(section.label)}
// // // // //                       className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
// // // // //                     >
// // // // //                       {section.label}
// // // // //                       <ChevronDown
// // // // //                         className={cn(
// // // // //                           "w-3.5 h-3.5 transition-transform",
// // // // //                           isCollapsed && "-rotate-90"
// // // // //                         )}
// // // // //                       />
// // // // //                     </button>
// // // // //                     {!isCollapsed && (
// // // // //                       <div className="flex flex-col gap-1 mt-1">
// // // // //                         {section.items.map(({ to, end, label, icon: Icon }) => (
// // // // //                           <NavLink
// // // // //                             key={to}
// // // // //                             to={to}
// // // // //                             end={end}
// // // // //                             className={({ isActive }) =>
// // // // //                               cn(
// // // // //                                 "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors",
// // // // //                                 isActive
// // // // //                                   ? "bg-primary/15 text-primary border border-primary/30 font-medium"
// // // // //                                   : "text-muted-foreground hover:bg-muted hover:text-foreground"
// // // // //                               )
// // // // //                             }
// // // // //                           >
// // // // //                             <Icon className="w-4 h-4 shrink-0" />
// // // // //                             {label}
// // // // //                           </NavLink>
// // // // //                         ))}
// // // // //                       </div>
// // // // //                     )}
// // // // //                   </div>
// // // // //                 );
// // // // //               })}
// // // // //             </nav>

// // // // //             <div className="hidden lg:flex flex-col gap-1 mt-2 pt-4 border-t border-border">
// // // // //               <button
// // // // //                 onClick={() => setShowChangePw(true)}
// // // // //                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
// // // // //               >
// // // // //                 <KeyRound className="w-4 h-4 shrink-0" />
// // // // //                 Change Password
// // // // //               </button>
// // // // //               <button
// // // // //                 onClick={handleSignOut}
// // // // //                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
// // // // //               >
// // // // //                 <LogOut className="w-4 h-4 shrink-0" />
// // // // //                 Sign Out
// // // // //               </button>
// // // // //             </div>

// // // // //             <div className="flex lg:hidden gap-1 mt-2">
// // // // //               <button
// // // // //                 onClick={() => setShowChangePw(true)}
// // // // //                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
// // // // //               >
// // // // //                 <KeyRound className="w-4 h-4 shrink-0" />
// // // // //                 Change Password
// // // // //               </button>
// // // // //               <button
// // // // //                 onClick={handleSignOut}
// // // // //                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
// // // // //               >
// // // // //                 <LogOut className="w-4 h-4 shrink-0" />
// // // // //                 Sign Out
// // // // //               </button>
// // // // //             </div>
// // // // //           </aside>
// // // // //           <main className="flex-1 min-w-0">
// // // // //             {hasAccessToCurrentPage ? (
// // // // //               <Outlet />
// // // // //             ) : (
// // // // //               <div className="flex flex-col items-center justify-center py-24 text-center">
// // // // //                 <ShieldAlert className="w-12 h-12 text-destructive mb-4" />
// // // // //                 <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
// // // // //                 <p className="text-muted-foreground mt-2">You don't have permission to view this section.</p>
// // // // //               </div>
// // // // //             )}
// // // // //           </main>
// // // // //         </div>
// // // // //       </div>

// // // // //       <Dialog open={showChangePw} onOpenChange={setShowChangePw}>
// // // // //         <DialogContent className="sm:max-w-sm">
// // // // //           <DialogHeader>
// // // // //             <DialogTitle className="flex items-center gap-2">
// // // // //               <KeyRound className="w-5 h-5 text-primary" />
// // // // //               Change Password
// // // // //             </DialogTitle>
// // // // //             <DialogDescription>Update your admin account password.</DialogDescription>
// // // // //           </DialogHeader>
// // // // //           <form onSubmit={handleChangePassword} className="space-y-4">
// // // // //             <div className="space-y-2">
// // // // //               <Label htmlFor="admin-new-pw">New Password</Label>
// // // // //               <Input
// // // // //                 id="admin-new-pw"
// // // // //                 type="password"
// // // // //                 required
// // // // //                 value={newPassword}
// // // // //                 onChange={(e) => setNewPassword(e.target.value)}
// // // // //               />
// // // // //             </div>
// // // // //             <div className="space-y-2">
// // // // //               <Label htmlFor="admin-confirm-pw">Confirm New Password</Label>
// // // // //               <Input
// // // // //                 id="admin-confirm-pw"
// // // // //                 type="password"
// // // // //                 required
// // // // //                 value={confirmPassword}
// // // // //                 onChange={(e) => setConfirmPassword(e.target.value)}
// // // // //               />
// // // // //             </div>
// // // // //             <Button type="submit" className="w-full" disabled={changingPassword}>
// // // // //               {changingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
// // // // //               Update Password
// // // // //             </Button>
// // // // //           </form>
// // // // //         </DialogContent>
// // // // //       </Dialog>
// // // // //     </Layout>
// // // // //   );
// // // // // };

// // // // // export default AdminLayout;

// // // // // import { useState } from "react";
// // // // // import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
// // // // // import SEOHead from "@/components/SEOHead";
// // // // // import { cn } from "@/lib/utils";
// // // // // import { useAuth } from "@/hooks/useAuth";
// // // // // import { supabase } from "@/integrations/supabase/client";
// // // // // import { Button } from "@/components/ui/button";
// // // // // import { Input } from "@/components/ui/input";
// // // // // import { Label } from "@/components/ui/label";
// // // // // import {
// // // // //   Dialog,
// // // // //   DialogContent,
// // // // //   DialogHeader,
// // // // //   DialogTitle,
// // // // //   DialogDescription,
// // // // // } from "@/components/ui/dialog";
// // // // // import { toast } from "sonner";
// // // // // import {
// // // // //   LayoutDashboard,
// // // // //   Package,
// // // // //   FileText,
// // // // //   Mail,
// // // // //   Users,
// // // // //   GitBranch,
// // // // //   Webhook,
// // // // //   Sparkles,
// // // // //   Briefcase,
// // // // //   FileCode,
// // // // //   Settings,
// // // // //   Crown,
// // // // //   FileSpreadsheet,
// // // // //   Wrench,
// // // // //   KeyRound,
// // // // //   LogOut,
// // // // //   Loader2,
// // // // //   UserCog,
// // // // //   ShieldAlert,
// // // // //   ScanSearch,
// // // // //   ChevronDown,
// // // // // } from "lucide-react";

// // // // // // Sidebar is grouped into sections instead of one flat 16-item list, so related
// // // // // // screens (e.g. Orders/Invoices/CRM) sit together and similarly-named GST items
// // // // // // don't have to be read one-by-one to tell apart.
// // // // // type NavItem = {
// // // // //   to: string;
// // // // //   end?: boolean;
// // // // //   label: string;
// // // // //   icon: typeof LayoutDashboard;
// // // // //   module: string;
// // // // //   adminOnly?: boolean;
// // // // // };

// // // // // type NavSection = {
// // // // //   label: string;
// // // // //   items: NavItem[];
// // // // // };

// // // // // const navSections: NavSection[] = [
// // // // //   {
// // // // //     label: "Overview",
// // // // //     items: [
// // // // //       { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
// // // // //     ],
// // // // //   },
// // // // //   {
// // // // //     label: "Sales & Customers",
// // // // //     items: [
// // // // //       { to: "/admin/orders", label: "Orders & Bookings", icon: Package, module: "orders" },
// // // // //       { to: "/admin/invoices", label: "Invoice Manager", icon: FileText, module: "invoices" },
// // // // //       { to: "/admin/crm", label: "CRM", icon: Users, module: "crm" },
// // // // //     ],
// // // // //   },
// // // // //   {
// // // // //     label: "Automation",
// // // // //     items: [
// // // // //       { to: "/admin/workflows", label: "Workflows", icon: GitBranch, module: "workflows" },
// // // // //       { to: "/admin/webhooks", label: "Webhook Logs", icon: Webhook, module: "webhooks" },
// // // // //       { to: "/admin/email", label: "Email Center", icon: Mail, module: "email" },
// // // // //     ],
// // // // //   },
// // // // //   {
// // // // //     label: "Catalog",
// // // // //     items: [
// // // // //       { to: "/admin/services", label: "Services Management", icon: Briefcase, module: "services" },
// // // // //       { to: "/admin/service-pages", label: "Pages & Packages", icon: Package, module: "service-pages" },
// // // // //       { to: "/admin/pricing", label: "Pricing Management", icon: FileCode, module: "pricing" },
// // // // //       { to: "/admin/templates", label: "Templates", icon: FileCode, module: "templates" },
// // // // //     ],
// // // // //   },
// // // // //   {
// // // // //     label: "Compliance",
// // // // //     items: [
// // // // //       { to: "/admin/settings", label: "GST Configuration", icon: Settings, module: "settings" },
// // // // //       { to: "/admin/gst-reports", label: "GSTR Reports", icon: FileSpreadsheet, module: "gst-reports" },
// // // // //       { to: "/admin/gst-maintenance", label: "GST Maintenance", icon: Wrench, module: "gst-maintenance" },
// // // // //     ],
// // // // //   },
// // // // //   {
// // // // //     label: "Admin",
// // // // //     items: [
// // // // //       { to: "/admin/ai-reports", label: "AI Reports", icon: Sparkles, module: "ai-reports" },
// // // // //       { to: "/admin/name-check-reports", label: "Name Check Reports", icon: ScanSearch, module: "name-check-reports" },
// // // // //       { to: "/admin/team", label: "Team Management", icon: UserCog, module: "team", adminOnly: true },
// // // // //     ],
// // // // //   },
// // // // // ];

// // // // // // Flat list kept for lookups (current-page access check) without duplicating data.
// // // // // const nav: NavItem[] = navSections.flatMap((s) => s.items);

// // // // // const AdminLayout = () => {
// // // // //   const { signOut, role, canViewModule } = useAuth();
// // // // //   const navigate = useNavigate();
// // // // //   const location = useLocation();

// // // // //   const [showChangePw, setShowChangePw] = useState(false);
// // // // //   const [newPassword, setNewPassword] = useState("");
// // // // //   const [confirmPassword, setConfirmPassword] = useState("");
// // // // //   const [changingPassword, setChangingPassword] = useState(false);

// // // // //   // All sections open by default; collapsed state is per-section so infrequently
// // // // //   // used groups (e.g. Compliance) can be tucked away without hiding the rest.
// // // // //   const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

// // // // //   const toggleSection = (label: string) => {
// // // // //     setCollapsedSections((prev) => ({ ...prev, [label]: !prev[label] }));
// // // // //   };

// // // // //   const handleChangePassword = async (e: React.FormEvent) => {
// // // // //     e.preventDefault();
// // // // //     if (newPassword.length < 8) {
// // // // //       toast.error("Password must be at least 8 characters");
// // // // //       return;
// // // // //     }
// // // // //     if (newPassword !== confirmPassword) {
// // // // //       toast.error("Passwords do not match");
// // // // //       return;
// // // // //     }
// // // // //     setChangingPassword(true);
// // // // //     const { error } = await supabase.auth.updateUser({ password: newPassword });
// // // // //     setChangingPassword(false);

// // // // //     if (error) {
// // // // //       toast.error(error.message);
// // // // //       return;
// // // // //     }
// // // // //     toast.success("Password changed successfully!");
// // // // //     setNewPassword("");
// // // // //     setConfirmPassword("");
// // // // //     setShowChangePw(false);
// // // // //   };

// // // // //   const handleSignOut = async () => {
// // // // //     await signOut();
// // // // //     navigate("/auth", { replace: true });
// // // // //   };

// // // // //   // Sidebar: staff ko sirf allowed modules dikhein; admin ko sab
// // // // //   const visibleSections = navSections
// // // // //     .map((section) => ({
// // // // //       ...section,
// // // // //       items: section.items.filter((item) => {
// // // // //         if (item.adminOnly) return role === "admin";
// // // // //         if (role === "admin") return true;
// // // // //         if (item.module === "dashboard") return true; // sabko dashboard dikhega
// // // // //         return canViewModule(item.module);
// // // // //       }),
// // // // //     }))
// // // // //     .filter((section) => section.items.length > 0);

// // // // //   // Direct URL se bhi koi disallowed module na khol paye
// // // // //   const currentNavItem = nav.find((item) =>
// // // // //     item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
// // // // //   );
// // // // //   const hasAccessToCurrentPage =
// // // // //     role === "admin" ||
// // // // //     !currentNavItem ||
// // // // //     currentNavItem.module === "dashboard" ||
// // // // //     canViewModule(currentNavItem.module);

// // // // //   return (
// // // // //     <>
// // // // //       <SEOHead title="Operations Console" description="Ankshaastra centralized operations admin." />
// // // // //       {/* Admin gets its own minimal shell — no public marketing nav (Home, Services,
// // // // //           Reports, Podcasts, Shop, etc.) and no customer-support chat bubble. Those
// // // // //           were built for site visitors, not ops staff, and the chat bubble was
// // // // //           overlapping list content in the dashboard. */}
// // // // //       <div className="min-h-screen bg-background">
// // // // //         <div className="border-b border-border bg-gradient-to-r from-background via-card to-background">
// // // // //           <div className="container mx-auto px-4 py-6 flex items-center justify-between gap-3">
// // // // //             <div className="flex items-center gap-3">
// // // // //               <Crown className="w-8 h-8 text-primary" />
// // // // //               <div>
// // // // //                 <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Operations Console</h1>
// // // // //                 <p className="text-sm text-muted-foreground">Centralized communication, invoicing & automation</p>
// // // // //               </div>
// // // // //             </div>
// // // // //             <button
// // // // //               onClick={handleSignOut}
// // // // //               className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
// // // // //             >
// // // // //               <LogOut className="w-4 h-4" />
// // // // //               Sign Out
// // // // //             </button>
// // // // //           </div>
// // // // //         </div>
// // // // //         <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 max-w-[1600px]">
// // // // //           <aside className="lg:w-64 shrink-0 flex flex-col lg:sticky lg:top-8 lg:self-start">
// // // // //             <nav className="flex flex-col gap-4">
// // // // //               {visibleSections.map((section) => {
// // // // //                 const isCollapsed = collapsedSections[section.label];
// // // // //                 return (
// // // // //                   <div key={section.label}>
// // // // //                     <button
// // // // //                       onClick={() => toggleSection(section.label)}
// // // // //                       className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
// // // // //                     >
// // // // //                       {section.label}
// // // // //                       <ChevronDown
// // // // //                         className={cn(
// // // // //                           "w-3.5 h-3.5 transition-transform",
// // // // //                           isCollapsed && "-rotate-90"
// // // // //                         )}
// // // // //                       />
// // // // //                     </button>
// // // // //                     {!isCollapsed && (
// // // // //                       <div className="flex flex-col gap-1 mt-1">
// // // // //                         {section.items.map(({ to, end, label, icon: Icon }) => (
// // // // //                           <NavLink
// // // // //                             key={to}
// // // // //                             to={to}
// // // // //                             end={end}
// // // // //                             className={({ isActive }) =>
// // // // //                               cn(
// // // // //                                 "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors",
// // // // //                                 isActive
// // // // //                                   ? "bg-primary/15 text-primary border border-primary/30 font-medium"
// // // // //                                   : "text-muted-foreground hover:bg-muted hover:text-foreground"
// // // // //                               )
// // // // //                             }
// // // // //                           >
// // // // //                             <Icon className="w-4 h-4 shrink-0" />
// // // // //                             {label}
// // // // //                           </NavLink>
// // // // //                         ))}
// // // // //                       </div>
// // // // //                     )}
// // // // //                   </div>
// // // // //                 );
// // // // //               })}
// // // // //             </nav>

// // // // //             <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-border">
// // // // //               <button
// // // // //                 onClick={() => setShowChangePw(true)}
// // // // //                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
// // // // //               >
// // // // //                 <KeyRound className="w-4 h-4 shrink-0" />
// // // // //                 Change Password
// // // // //               </button>
// // // // //               <button
// // // // //                 onClick={handleSignOut}
// // // // //                 className="flex sm:hidden items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
// // // // //               >
// // // // //                 <LogOut className="w-4 h-4 shrink-0" />
// // // // //                 Sign Out
// // // // //               </button>
// // // // //             </div>
// // // // //           </aside>
// // // // //           <main className="flex-1 min-w-0">
// // // // //             {hasAccessToCurrentPage ? (
// // // // //               <Outlet />
// // // // //             ) : (
// // // // //               <div className="flex flex-col items-center justify-center py-24 text-center">
// // // // //                 <ShieldAlert className="w-12 h-12 text-destructive mb-4" />
// // // // //                 <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
// // // // //                 <p className="text-muted-foreground mt-2">You don't have permission to view this section.</p>
// // // // //               </div>
// // // // //             )}
// // // // //           </main>
// // // // //         </div>
// // // // //       </div>

// // // // //       <Dialog open={showChangePw} onOpenChange={setShowChangePw}>
// // // // //         <DialogContent className="sm:max-w-sm">
// // // // //           <DialogHeader>
// // // // //             <DialogTitle className="flex items-center gap-2">
// // // // //               <KeyRound className="w-5 h-5 text-primary" />
// // // // //               Change Password
// // // // //             </DialogTitle>
// // // // //             <DialogDescription>Update your admin account password.</DialogDescription>
// // // // //           </DialogHeader>
// // // // //           <form onSubmit={handleChangePassword} className="space-y-4">
// // // // //             <div className="space-y-2">
// // // // //               <Label htmlFor="admin-new-pw">New Password</Label>
// // // // //               <Input
// // // // //                 id="admin-new-pw"
// // // // //                 type="password"
// // // // //                 required
// // // // //                 value={newPassword}
// // // // //                 onChange={(e) => setNewPassword(e.target.value)}
// // // // //               />
// // // // //             </div>
// // // // //             <div className="space-y-2">
// // // // //               <Label htmlFor="admin-confirm-pw">Confirm New Password</Label>
// // // // //               <Input
// // // // //                 id="admin-confirm-pw"
// // // // //                 type="password"
// // // // //                 required
// // // // //                 value={confirmPassword}
// // // // //                 onChange={(e) => setConfirmPassword(e.target.value)}
// // // // //               />
// // // // //             </div>
// // // // //             <Button type="submit" className="w-full" disabled={changingPassword}>
// // // // //               {changingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
// // // // //               Update Password
// // // // //             </Button>
// // // // //           </form>
// // // // //         </DialogContent>
// // // // //       </Dialog>
// // // // //     </>
// // // // //   );
// // // // // };

// // // // // export default AdminLayout;

// // // import { useState } from "react";
// // // import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
// // // import SEOHead from "@/components/SEOHead";
// // // import { cn } from "@/lib/utils";
// // // import { useAuth } from "@/hooks/useAuth";
// // // import { supabase } from "@/integrations/supabase/client";
// // // import { Button } from "@/components/ui/button";
// // // import { Input } from "@/components/ui/input";
// // // import { Label } from "@/components/ui/label";
// // // import {
// // //   Dialog,
// // //   DialogContent,
// // //   DialogHeader,
// // //   DialogTitle,
// // //   DialogDescription,
// // // } from "@/components/ui/dialog";
// // // import { toast } from "sonner";
// // // import {
// // //   LayoutDashboard,
// // //   Package,
// // //   FileText,
// // //   Mail,
// // //   Users,
// // //   GitBranch,
// // //   Webhook,
// // //   Sparkles,
// // //   Briefcase,
// // //   FileCode,
// // //   Settings,
// // //   Crown,
// // //   FileSpreadsheet,
// // //   Wrench,
// // //   KeyRound,
// // //   LogOut,
// // //   Loader2,
// // //   UserCog,
// // //   ShieldAlert,
// // //   ScanSearch,
// // //   ChevronDown,
// // //   ArrowLeft,
// // // } from "lucide-react";

// // // // Sidebar is grouped into sections instead of one flat 16-item list, so related
// // // // screens (e.g. Orders/Invoices/CRM) sit together and similarly-named GST items
// // // // don't have to be read one-by-one to tell apart.
// // // type NavItem = {
// // //   to: string;
// // //   end?: boolean;
// // //   label: string;
// // //   icon: typeof LayoutDashboard;
// // //   module: string;
// // //   adminOnly?: boolean;
// // // };

// // // type NavSection = {
// // //   label: string;
// // //   items: NavItem[];
// // // };

// // // const navSections: NavSection[] = [
// // //   {
// // //     label: "Overview",
// // //     items: [
// // //       { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
// // //     ],
// // //   },
// // //   {
// // //     label: "Sales & Customers",
// // //     items: [
// // //       { to: "/admin/orders", label: "Orders & Bookings", icon: Package, module: "orders" },
// // //       { to: "/admin/invoices", label: "Invoice Manager", icon: FileText, module: "invoices" },
// // //       { to: "/admin/crm", label: "CRM", icon: Users, module: "crm" },
// // //     ],
// // //   },
// // //   {
// // //     label: "Automation",
// // //     items: [
// // //       { to: "/admin/workflows", label: "Workflows", icon: GitBranch, module: "workflows" },
// // //       { to: "/admin/webhooks", label: "Webhook Logs", icon: Webhook, module: "webhooks" },
// // //       { to: "/admin/email", label: "Email Center", icon: Mail, module: "email" },
// // //     ],
// // //   },
// // //   {
// // //     label: "Catalog",
// // //     items: [
// // //       { to: "/admin/services", label: "Services Management", icon: Briefcase, module: "services" },
// // //       { to: "/admin/service-pages", label: "Pages & Packages", icon: Package, module: "service-pages" },
// // //       { to: "/admin/pricing", label: "Pricing Management", icon: FileCode, module: "pricing" },
// // //       { to: "/admin/templates", label: "Templates", icon: FileCode, module: "templates" },
// // //     ],
// // //   },
// // //   {
// // //     label: "Compliance",
// // //     items: [
// // //       { to: "/admin/settings", label: "GST Configuration", icon: Settings, module: "settings" },
// // //       { to: "/admin/gst-reports", label: "GSTR Reports", icon: FileSpreadsheet, module: "gst-reports" },
// // //       { to: "/admin/gst-maintenance", label: "GST Maintenance", icon: Wrench, module: "gst-maintenance" },
// // //     ],
// // //   },
// // //   {
// // //     label: "Admin",
// // //     items: [
// // //       { to: "/admin/ai-reports", label: "AI Reports", icon: Sparkles, module: "ai-reports" },
// // //       { to: "/admin/name-check-reports", label: "Name Check Reports", icon: ScanSearch, module: "name-check-reports" },
// // //       { to: "/admin/team", label: "Team Management", icon: UserCog, module: "team", adminOnly: true },
// // //     ],
// // //   },
// // // ];

// // // // Flat list kept for lookups (current-page access check) without duplicating data.
// // // const nav: NavItem[] = navSections.flatMap((s) => s.items);

// // // const AdminLayout = () => {
// // //   const { signOut, role, canViewModule } = useAuth();
// // //   const navigate = useNavigate();
// // //   const location = useLocation();

// // //   const [showChangePw, setShowChangePw] = useState(false);
// // //   const [newPassword, setNewPassword] = useState("");
// // //   const [confirmPassword, setConfirmPassword] = useState("");
// // //   const [changingPassword, setChangingPassword] = useState(false);

// // //   // All sections open by default; collapsed state is per-section so infrequently
// // //   // used groups (e.g. Compliance) can be tucked away without hiding the rest.
// // //   const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

// // //   const toggleSection = (label: string) => {
// // //     setCollapsedSections((prev) => ({ ...prev, [label]: !prev[label] }));
// // //   };

// // //   const handleChangePassword = async (e: React.FormEvent) => {
// // //     e.preventDefault();
// // //     if (newPassword.length < 8) {
// // //       toast.error("Password must be at least 8 characters");
// // //       return;
// // //     }
// // //     if (newPassword !== confirmPassword) {
// // //       toast.error("Passwords do not match");
// // //       return;
// // //     }
// // //     setChangingPassword(true);
// // //     const { error } = await supabase.auth.updateUser({ password: newPassword });
// // //     setChangingPassword(false);

// // //     if (error) {
// // //       toast.error(error.message);
// // //       return;
// // //     }
// // //     toast.success("Password changed successfully!");
// // //     setNewPassword("");
// // //     setConfirmPassword("");
// // //     setShowChangePw(false);
// // //   };

// // //   const handleSignOut = async () => {
// // //     await signOut();
// // //     navigate("/auth", { replace: true });
// // //   };

// // //   // Goes back one step in admin history; falls back to the dashboard when
// // //   // there's no previous in-app entry (e.g. user landed here directly via a
// // //   // bookmark/refresh, so history.state.idx is 0).
// // //   const handleBack = () => {
// // //     const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
// // //     if (idx > 0) {
// // //       navigate(-1);
// // //     } else {
// // //       navigate("/admin", { replace: true });
// // //     }
// // //   };

// // //   // Sidebar: staff ko sirf allowed modules dikhein; admin ko sab
// // //   const visibleSections = navSections
// // //     .map((section) => ({
// // //       ...section,
// // //       items: section.items.filter((item) => {
// // //         if (item.adminOnly) return role === "admin";
// // //         if (role === "admin") return true;
// // //         if (item.module === "dashboard") return true; // sabko dashboard dikhega
// // //         return canViewModule(item.module);
// // //       }),
// // //     }))
// // //     .filter((section) => section.items.length > 0);

// // //   // Direct URL se bhi koi disallowed module na khol paye
// // //   const currentNavItem = nav.find((item) =>
// // //     item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
// // //   );
// // //   const hasAccessToCurrentPage =
// // //     role === "admin" ||
// // //     !currentNavItem ||
// // //     currentNavItem.module === "dashboard" ||
// // //     canViewModule(currentNavItem.module);

// // //   return (
// // //     <>
// // //       <SEOHead title="Operations Console" description="Ankshaastra centralized operations admin." />
// // //       {/* Admin gets its own minimal shell — no public marketing nav (Home, Services,
// // //           Reports, Podcasts, Shop, etc.) and no customer-support chat bubble. Those
// // //           were built for site visitors, not ops staff, and the chat bubble was
// // //           overlapping list content in the dashboard. */}
// // //       <div className="min-h-screen bg-background">
// // //         <div className="border-b border-border bg-gradient-to-r from-background via-card to-background">
// // //           <div className="container mx-auto px-4 py-6 flex items-center justify-between gap-3">
// // //             <div className="flex items-center gap-3">
// // //               <button
// // //                 onClick={handleBack}
// // //                 className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border shrink-0"
// // //               >
// // //                 <ArrowLeft className="w-4 h-4" />
// // //                 Back
// // //               </button>
// // //               <Crown className="w-8 h-8 text-primary" />
// // //               <div>
// // //                 <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Operations Console</h1>
// // //                 <p className="text-sm text-muted-foreground">Centralized communication, invoicing & automation</p>
// // //               </div>
// // //             </div>
// // //             <button
// // //               onClick={handleSignOut}
// // //               className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
// // //             >
// // //               <LogOut className="w-4 h-4" />
// // //               Sign Out
// // //             </button>
// // //           </div>
// // //         </div>
// // //         <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 max-w-[1600px]">
// // //           <aside className="lg:w-64 shrink-0 flex flex-col lg:sticky lg:top-8 lg:self-start">
// // //             <nav className="flex flex-col gap-4">
// // //               {visibleSections.map((section) => {
// // //                 const isCollapsed = collapsedSections[section.label];
// // //                 return (
// // //                   <div key={section.label}>
// // //                     <button
// // //                       onClick={() => toggleSection(section.label)}
// // //                       className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
// // //                     >
// // //                       {section.label}
// // //                       <ChevronDown
// // //                         className={cn(
// // //                           "w-3.5 h-3.5 transition-transform",
// // //                           isCollapsed && "-rotate-90"
// // //                         )}
// // //                       />
// // //                     </button>
// // //                     {!isCollapsed && (
// // //                       <div className="flex flex-col gap-1 mt-1">
// // //                         {section.items.map(({ to, end, label, icon: Icon }) => (
// // //                           <NavLink
// // //                             key={to}
// // //                             to={to}
// // //                             end={end}
// // //                             className={({ isActive }) =>
// // //                               cn(
// // //                                 "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors",
// // //                                 isActive
// // //                                   ? "bg-primary/15 text-primary border border-primary/30 font-medium"
// // //                                   : "text-muted-foreground hover:bg-muted hover:text-foreground"
// // //                               )
// // //                             }
// // //                           >
// // //                             <Icon className="w-4 h-4 shrink-0" />
// // //                             {label}
// // //                           </NavLink>
// // //                         ))}
// // //                       </div>
// // //                     )}
// // //                   </div>
// // //                 );
// // //               })}
// // //             </nav>

// // //             <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-border">
// // //               <button
// // //                 onClick={() => setShowChangePw(true)}
// // //                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
// // //               >
// // //                 <KeyRound className="w-4 h-4 shrink-0" />
// // //                 Change Password
// // //               </button>
// // //               <button
// // //                 onClick={handleSignOut}
// // //                 className="flex sm:hidden items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
// // //               >
// // //                 <LogOut className="w-4 h-4 shrink-0" />
// // //                 Sign Out
// // //               </button>
// // //             </div>
// // //           </aside>
// // //           <main className="flex-1 min-w-0">
// // //             {hasAccessToCurrentPage ? (
// // //               <Outlet />
// // //             ) : (
// // //               <div className="flex flex-col items-center justify-center py-24 text-center">
// // //                 <ShieldAlert className="w-12 h-12 text-destructive mb-4" />
// // //                 <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
// // //                 <p className="text-muted-foreground mt-2">You don't have permission to view this section.</p>
// // //               </div>
// // //             )}
// // //           </main>
// // //         </div>
// // //       </div>

// // //       <Dialog open={showChangePw} onOpenChange={setShowChangePw}>
// // //         <DialogContent className="sm:max-w-sm">
// // //           <DialogHeader>
// // //             <DialogTitle className="flex items-center gap-2">
// // //               <KeyRound className="w-5 h-5 text-primary" />
// // //               Change Password
// // //             </DialogTitle>
// // //             <DialogDescription>Update your admin account password.</DialogDescription>
// // //           </DialogHeader>
// // //           <form onSubmit={handleChangePassword} className="space-y-4">
// // //             <div className="space-y-2">
// // //               <Label htmlFor="admin-new-pw">New Password</Label>
// // //               <Input
// // //                 id="admin-new-pw"
// // //                 type="password"
// // //                 required
// // //                 value={newPassword}
// // //                 onChange={(e) => setNewPassword(e.target.value)}
// // //               />
// // //             </div>
// // //             <div className="space-y-2">
// // //               <Label htmlFor="admin-confirm-pw">Confirm New Password</Label>
// // //               <Input
// // //                 id="admin-confirm-pw"
// // //                 type="password"
// // //                 required
// // //                 value={confirmPassword}
// // //                 onChange={(e) => setConfirmPassword(e.target.value)}
// // //               />
// // //             </div>
// // //             <Button type="submit" className="w-full" disabled={changingPassword}>
// // //               {changingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
// // //               Update Password
// // //             </Button>
// // //           </form>
// // //         </DialogContent>
// // //       </Dialog>
// // //     </>
// // //   );
// // // };

// // // export default AdminLayout;


// // import { useState } from "react";
// // import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
// // import SEOHead from "@/components/SEOHead";
// // import { cn } from "@/lib/utils";
// // import { useAuth } from "@/hooks/useAuth";
// // import { supabase } from "@/integrations/supabase/client";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogHeader,
// //   DialogTitle,
// //   DialogDescription,
// // } from "@/components/ui/dialog";
// // import { toast } from "sonner";
// // import {
// //   LayoutDashboard,
// //   Package,
// //   FileText,
// //   Mail,
// //   Users,
// //   GitBranch,
// //   Webhook,
// //   Sparkles,
// //   Briefcase,
// //   FileCode,
// //   Settings,
// //   Crown,
// //   FileSpreadsheet,
// //   Wrench,
// //   KeyRound,
// //   LogOut,
// //   Loader2,
// //   UserCog,
// //   ShieldAlert,
// //   ScanSearch,
// //   ChevronDown,
// //   ArrowLeft,
// // } from "lucide-react";

// // // Sidebar is grouped into sections instead of one flat 16-item list, so related
// // // screens (e.g. Orders/Invoices/CRM) sit together and similarly-named GST items
// // // don't have to be read one-by-one to tell apart.
// // type NavItem = {
// //   to: string;
// //   end?: boolean;
// //   label: string;
// //   icon: typeof LayoutDashboard;
// //   module: string;
// //   adminOnly?: boolean;
// // };

// // type NavSection = {
// //   label: string;
// //   items: NavItem[];
// // };

// // const navSections: NavSection[] = [
// //   {
// //     label: "Overview",
// //     items: [
// //       { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
// //     ],
// //   },
// //   {
// //     label: "Sales & Customers",
// //     items: [
// //       { to: "/admin/orders", label: "Orders & Bookings", icon: Package, module: "orders" },
// //       { to: "/admin/invoices", label: "Invoice Manager", icon: FileText, module: "invoices" },
// //       { to: "/admin/crm", label: "CRM", icon: Users, module: "crm" },
// //     ],
// //   },
// //   {
// //     label: "Automation",
// //     items: [
// //       { to: "/admin/workflows", label: "Workflows", icon: GitBranch, module: "workflows" },
// //       { to: "/admin/webhooks", label: "Webhook Logs", icon: Webhook, module: "webhooks" },
// //       { to: "/admin/email", label: "Email Center", icon: Mail, module: "email" },
// //     ],
// //   },
// //   {
// //     label: "Catalog",
// //     items: [
// //       { to: "/admin/services", label: "Services Management", icon: Briefcase, module: "services" },
// //       { to: "/admin/service-pages", label: "Pages & Packages", icon: Package, module: "service-pages" },
// //       { to: "/admin/pricing", label: "Pricing Management", icon: FileCode, module: "pricing" },
// //       { to: "/admin/templates", label: "Templates", icon: FileCode, module: "templates" },
// //     ],
// //   },
// //   {
// //     label: "Compliance",
// //     items: [
// //       { to: "/admin/settings", label: "GST Configuration", icon: Settings, module: "settings" },
// //       { to: "/admin/gst-reports", label: "GSTR Reports", icon: FileSpreadsheet, module: "gst-reports" },
// //       { to: "/admin/gst-maintenance", label: "GST Maintenance", icon: Wrench, module: "gst-maintenance" },
// //     ],
// //   },
// //   {
// //     label: "Admin",
// //     items: [
// //       { to: "/admin/ai-reports", label: "AI Reports", icon: Sparkles, module: "ai-reports" },
// //       { to: "/admin/name-check-reports", label: "Name Check Reports", icon: ScanSearch, module: "name-check-reports" },
// //       { to: "/admin/team", label: "Team Management", icon: UserCog, module: "team", adminOnly: true },
// //     ],
// //   },
// // ];

// // // Flat list kept for lookups (current-page access check) without duplicating data.
// // const nav: NavItem[] = navSections.flatMap((s) => s.items);

// // const AdminLayout = () => {
// //   const { signOut, role, canViewModule } = useAuth();
// //   const navigate = useNavigate();
// //   const location = useLocation();

// //   const [showChangePw, setShowChangePw] = useState(false);
// //   const [newPassword, setNewPassword] = useState("");
// //   const [confirmPassword, setConfirmPassword] = useState("");
// //   const [changingPassword, setChangingPassword] = useState(false);

// //   // All sections open by default; collapsed state is per-section so infrequently
// //   // used groups (e.g. Compliance) can be tucked away without hiding the rest.
// //   const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

// //   const toggleSection = (label: string) => {
// //     setCollapsedSections((prev) => ({ ...prev, [label]: !prev[label] }));
// //   };

// //   const handleChangePassword = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (newPassword.length < 8) {
// //       toast.error("Password must be at least 8 characters");
// //       return;
// //     }
// //     if (newPassword !== confirmPassword) {
// //       toast.error("Passwords do not match");
// //       return;
// //     }
// //     setChangingPassword(true);
// //     const { error } = await supabase.auth.updateUser({ password: newPassword });
// //     setChangingPassword(false);

// //     if (error) {
// //       toast.error(error.message);
// //       return;
// //     }
// //     toast.success("Password changed successfully!");
// //     setNewPassword("");
// //     setConfirmPassword("");
// //     setShowChangePw(false);
// //   };

// //   const handleSignOut = async () => {
// //     await signOut();
// //     navigate("/auth", { replace: true });
// //   };

// //   // Goes back one step in admin history; falls back to the dashboard when
// //   // there's no previous in-app entry (e.g. user landed here directly via a
// //   // bookmark/refresh, so history.state.idx is 0).
// //   const handleBack = () => {
// //     const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
// //     if (idx > 0) {
// //       navigate(-1);
// //     } else {
// //       navigate("/admin", { replace: true });
// //     }
// //   };

// //   // Sidebar: staff ko sirf allowed modules dikhein; admin ko sab
// //   const visibleSections = navSections
// //     .map((section) => ({
// //       ...section,
// //       items: section.items.filter((item) => {
// //         if (item.adminOnly) return role === "admin";
// //         if (role === "admin") return true;
// //         if (item.module === "dashboard") return true; // sabko dashboard dikhega
// //         return canViewModule(item.module);
// //       }),
// //     }))
// //     .filter((section) => section.items.length > 0);

// //   // Direct URL se bhi koi disallowed module na khol paye
// //   const currentNavItem = nav.find((item) =>
// //     item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
// //   );
// //   const hasAccessToCurrentPage =
// //     role === "admin" ||
// //     !currentNavItem ||
// //     currentNavItem.module === "dashboard" ||
// //     canViewModule(currentNavItem.module);

// //   return (
// //     <>
// //       <SEOHead title="Operations Console" description="Ankshaastra centralized operations admin." />
// //       {/* Admin gets its own minimal shell — no public marketing nav (Home, Services,
// //           Reports, Podcasts, Shop, etc.) and no customer-support chat bubble. Those
// //           were built for site visitors, not ops staff, and the chat bubble was
// //           overlapping list content in the dashboard. */}
// //       <div className="min-h-screen bg-background">
// //         <div className="border-b border-border bg-gradient-to-r from-background via-card to-background">
// //           {/* Header row: Back button + logo + title share one flex container so they
// //               stay on the same horizontal line and share the container's left edge
// //               with the sidebar/content below. flex-wrap lets the Back button drop to
// //               its own line on narrow screens instead of overlapping the title. */}
// //           <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-wrap items-center justify-between gap-y-3 gap-x-3">
// //             <div className="flex flex-wrap items-center gap-y-3">
// //               {location.pathname !== "/admin" && (
// //                 <button
// //                   onClick={handleBack}
// //                   className="flex items-center gap-2 h-9 px-3 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border shrink-0 mr-6"
// //                 >
// //                   <ArrowLeft className="w-4 h-4" />
// //                   Back
// //                 </button>
// //               )}
// //               <div className="flex items-center gap-4">
// //                 <Crown className="w-8 h-8 text-primary shrink-0" />
// //                 <div>
// //                   <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Operations Console</h1>
// //                   <p className="text-sm text-muted-foreground">Centralized communication, invoicing & automation</p>
// //                 </div>
// //               </div>
// //             </div>
// //             <button
// //               onClick={handleSignOut}
// //               className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
// //             >
// //               <LogOut className="w-4 h-4" />
// //               Sign Out
// //             </button>
// //           </div>
// //         </div>
// //         <div className="container mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-8 max-w-[1600px]">
// //           <aside className="lg:w-64 shrink-0 flex flex-col lg:sticky lg:top-8 lg:self-start">
// //             <nav className="flex flex-col gap-4">
// //               {visibleSections.map((section) => {
// //                 const isCollapsed = collapsedSections[section.label];
// //                 return (
// //                   <div key={section.label}>
// //                     <button
// //                       onClick={() => toggleSection(section.label)}
// //                       className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
// //                     >
// //                       {section.label}
// //                       <ChevronDown
// //                         className={cn(
// //                           "w-3.5 h-3.5 transition-transform",
// //                           isCollapsed && "-rotate-90"
// //                         )}
// //                       />
// //                     </button>
// //                     {!isCollapsed && (
// //                       <div className="flex flex-col gap-1 mt-1">
// //                         {section.items.map(({ to, end, label, icon: Icon }) => (
// //                           <NavLink
// //                             key={to}
// //                             to={to}
// //                             end={end}
// //                             className={({ isActive }) =>
// //                               cn(
// //                                 "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors",
// //                                 isActive
// //                                   ? "bg-primary/15 text-primary border border-primary/30 font-medium"
// //                                   : "text-muted-foreground hover:bg-muted hover:text-foreground"
// //                               )
// //                             }
// //                           >
// //                             <Icon className="w-4 h-4 shrink-0" />
// //                             {label}
// //                           </NavLink>
// //                         ))}
// //                       </div>
// //                     )}
// //                   </div>
// //                 );
// //               })}
// //             </nav>

// //             <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-border">
// //               <button
// //                 onClick={() => setShowChangePw(true)}
// //                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
// //               >
// //                 <KeyRound className="w-4 h-4 shrink-0" />
// //                 Change Password
// //               </button>
// //               <button
// //                 onClick={handleSignOut}
// //                 className="flex sm:hidden items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
// //               >
// //                 <LogOut className="w-4 h-4 shrink-0" />
// //                 Sign Out
// //               </button>
// //             </div>
// //           </aside>
// //           <main className="flex-1 min-w-0">
// //             {hasAccessToCurrentPage ? (
// //               <Outlet />
// //             ) : (
// //               <div className="flex flex-col items-center justify-center py-24 text-center">
// //                 <ShieldAlert className="w-12 h-12 text-destructive mb-4" />
// //                 <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
// //                 <p className="text-muted-foreground mt-2">You don't have permission to view this section.</p>
// //               </div>
// //             )}
// //           </main>
// //         </div>
// //       </div>

// //       <Dialog open={showChangePw} onOpenChange={setShowChangePw}>
// //         <DialogContent className="sm:max-w-sm">
// //           <DialogHeader>
// //             <DialogTitle className="flex items-center gap-2">
// //               <KeyRound className="w-5 h-5 text-primary" />
// //               Change Password
// //             </DialogTitle>
// //             <DialogDescription>Update your admin account password.</DialogDescription>
// //           </DialogHeader>
// //           <form onSubmit={handleChangePassword} className="space-y-4">
// //             <div className="space-y-2">
// //               <Label htmlFor="admin-new-pw">New Password</Label>
// //               <Input
// //                 id="admin-new-pw"
// //                 type="password"
// //                 required
// //                 value={newPassword}
// //                 onChange={(e) => setNewPassword(e.target.value)}
// //               />
// //             </div>
// //             <div className="space-y-2">
// //               <Label htmlFor="admin-confirm-pw">Confirm New Password</Label>
// //               <Input
// //                 id="admin-confirm-pw"
// //                 type="password"
// //                 required
// //                 value={confirmPassword}
// //                 onChange={(e) => setConfirmPassword(e.target.value)}
// //               />
// //             </div>
// //             <Button type="submit" className="w-full" disabled={changingPassword}>
// //               {changingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
// //               Update Password
// //             </Button>
// //           </form>
// //         </DialogContent>
// //       </Dialog>
// //     </>
// //   );
// // };

// // export default AdminLayout;


// // import { useState } from "react";
// // import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
// // import SEOHead from "@/components/SEOHead";
// // import { cn } from "@/lib/utils";
// // import { useAuth } from "@/hooks/useAuth";
// // import { supabase } from "@/integrations/supabase/client";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogHeader,
// //   DialogTitle,
// //   DialogDescription,
// // } from "@/components/ui/dialog";
// // import {
// //   DropdownMenu,
// //   DropdownMenuContent,
// //   DropdownMenuItem,
// //   DropdownMenuSeparator,
// //   DropdownMenuTrigger,
// // } from "@/components/ui/dropdown-menu";
// // import { toast } from "sonner";
// // import {
// //   LayoutDashboard,
// //   Package,
// //   FileText,
// //   Mail,
// //   Users,
// //   GitBranch,
// //   Webhook,
// //   Sparkles,
// //   Briefcase,
// //   FileCode,
// //   Settings,
// //   Crown,
// //   FileSpreadsheet,
// //   Wrench,
// //   KeyRound,
// //   LogOut,
// //   Loader2,
// //   UserCog,
// //   ShieldAlert,
// //   ScanSearch,
// //   ChevronDown,
// //   ArrowLeft,
// // } from "lucide-react";

// // // Sidebar is grouped into sections instead of one flat 16-item list, so related
// // // screens (e.g. Orders/Invoices/CRM) sit together and similarly-named GST items
// // // don't have to be read one-by-one to tell apart.
// // type NavItem = {
// //   to: string;
// //   end?: boolean;
// //   label: string;
// //   icon: typeof LayoutDashboard;
// //   module: string;
// //   adminOnly?: boolean;
// // };

// // type NavSection = {
// //   label: string;
// //   items: NavItem[];
// // };

// // const navSections: NavSection[] = [
// //   {
// //     label: "Overview",
// //     items: [
// //       { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
// //     ],
// //   },
// //   {
// //     label: "Sales & Customers",
// //     items: [
// //       { to: "/admin/orders", label: "Orders & Bookings", icon: Package, module: "orders" },
// //       { to: "/admin/invoices", label: "Invoice Manager", icon: FileText, module: "invoices" },
// //       { to: "/admin/crm", label: "CRM", icon: Users, module: "crm" },
// //     ],
// //   },
// //   {
// //     label: "Automation",
// //     items: [
// //       { to: "/admin/workflows", label: "Workflows", icon: GitBranch, module: "workflows" },
// //       { to: "/admin/webhooks", label: "Webhook Logs", icon: Webhook, module: "webhooks" },
// //       { to: "/admin/email", label: "Email Center", icon: Mail, module: "email" },
// //     ],
// //   },
// //   {
// //     label: "Catalog",
// //     items: [
// //       { to: "/admin/services", label: "Services Management", icon: Briefcase, module: "services" },
// //       { to: "/admin/service-pages", label: "Pages & Packages", icon: Package, module: "service-pages" },
// //       // { to: "/admin/pricing", label: "Pricing Management", icon: FileCode, module: "pricing" },
// //       { to: "/admin/templates", label: "Templates", icon: FileCode, module: "templates" },
// //     ],
// //   },
// //   {
// //     label: "Compliance",
// //     items: [
// //       { to: "/admin/settings", label: "GST Configuration", icon: Settings, module: "settings" },
// //       { to: "/admin/gst-reports", label: "GSTR Reports", icon: FileSpreadsheet, module: "gst-reports" },
// //       { to: "/admin/gst-maintenance", label: "GST Maintenance", icon: Wrench, module: "gst-maintenance" },
// //     ],
// //   },
// //   {
// //     label: "Admin",
// //     items: [
// //       { to: "/admin/ai-reports", label: "AI Reports", icon: Sparkles, module: "ai-reports" },
// //       { to: "/admin/name-check-reports", label: "Name Check Reports", icon: ScanSearch, module: "name-check-reports" },
// //       { to: "/admin/team", label: "Team Management", icon: UserCog, module: "team", adminOnly: true },
// //     ],
// //   },
// // ];

// // // Flat list kept for lookups (current-page access check) without duplicating data.
// // const nav: NavItem[] = navSections.flatMap((s) => s.items);

// // const AdminLayout = () => {
// //   const { signOut, role, canViewModule } = useAuth();
// //   const navigate = useNavigate();
// //   const location = useLocation();

// //   const [showChangePw, setShowChangePw] = useState(false);
// //   const [newPassword, setNewPassword] = useState("");
// //   const [confirmPassword, setConfirmPassword] = useState("");
// //   const [changingPassword, setChangingPassword] = useState(false);

// //   // All sections open by default; collapsed state is per-section so infrequently
// //   // used groups (e.g. Compliance) can be tucked away without hiding the rest.
// //   const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

// //   const toggleSection = (label: string) => {
// //     setCollapsedSections((prev) => ({ ...prev, [label]: !prev[label] }));
// //   };

// //   const handleChangePassword = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (newPassword.length < 8) {
// //       toast.error("Password must be at least 8 characters");
// //       return;
// //     }
// //     if (newPassword !== confirmPassword) {
// //       toast.error("Passwords do not match");
// //       return;
// //     }
// //     setChangingPassword(true);
// //     const { error } = await supabase.auth.updateUser({ password: newPassword });
// //     setChangingPassword(false);

// //     if (error) {
// //       toast.error(error.message);
// //       return;
// //     }
// //     toast.success("Password changed successfully!");
// //     setNewPassword("");
// //     setConfirmPassword("");
// //     setShowChangePw(false);
// //   };

// //   const handleSignOut = async () => {
// //     await signOut();
// //     navigate("/auth", { replace: true });
// //   };

// //   // Goes back one step in admin history; falls back to the dashboard when
// //   // there's no previous in-app entry (e.g. user landed here directly via a
// //   // bookmark/refresh, so history.state.idx is 0).
// //   const handleBack = () => {
// //     const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
// //     if (idx > 0) {
// //       navigate(-1);
// //     } else {
// //       navigate("/admin", { replace: true });
// //     }
// //   };

// //   // Sidebar: staff ko sirf allowed modules dikhein; admin ko sab
// //   const visibleSections = navSections
// //     .map((section) => ({
// //       ...section,
// //       items: section.items.filter((item) => {
// //         if (item.adminOnly) return role === "admin";
// //         if (role === "admin") return true;
// //         if (item.module === "dashboard") return true; // sabko dashboard dikhega
// //         return canViewModule(item.module);
// //       }),
// //     }))
// //     .filter((section) => section.items.length > 0);

// //   // Direct URL se bhi koi disallowed module na khol paye
// //   const currentNavItem = nav.find((item) =>
// //     item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
// //   );
// //   const hasAccessToCurrentPage =
// //     role === "admin" ||
// //     !currentNavItem ||
// //     currentNavItem.module === "dashboard" ||
// //     canViewModule(currentNavItem.module);

// //   return (
// //     <>
// //       <SEOHead title="Operations Console" description="Ankshaastra centralized operations admin." />
// //       {/* Admin gets its own minimal shell — no public marketing nav (Home, Services,
// //           Reports, Podcasts, Shop, etc.) and no customer-support chat bubble. Those
// //           were built for site visitors, not ops staff, and the chat bubble was
// //           overlapping list content in the dashboard. */}
// //       <div className="min-h-screen bg-background">
// //         <div className="border-b border-border bg-gradient-to-r from-background via-card to-background">
// //           {/* Header row: Back button + logo + title share one flex container so they
// //               stay on the same horizontal line and share the container's left edge
// //               with the sidebar/content below. flex-wrap lets the Back button drop to
// //               its own line on narrow screens instead of overlapping the title. */}
// //           <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-wrap items-center justify-between gap-y-3 gap-x-3">
// //             <div className="flex flex-wrap items-center gap-y-3">
// //               {location.pathname !== "/admin" && (
// //                 <button
// //                   onClick={handleBack}
// //                   className="flex items-center gap-2 h-9 px-3 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border shrink-0 mr-6"
// //                 >
// //                   <ArrowLeft className="w-4 h-4" />
// //                   Back
// //                 </button>
// //               )}
// //               <div className="flex items-center gap-4">
// //                 <Crown className="w-8 h-8 text-primary shrink-0" />
// //                 <div>
// //                   <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Operations Console</h1>
// //                   <p className="text-sm text-muted-foreground">Centralized communication, invoicing & automation</p>
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Account menu — Change Password + Sign Out live here together,
// //                 on every screen size, instead of a bare "Sign Out" button plus
// //                 a separate "Change Password" link buried at the bottom of the
// //                 sidebar. */}
// //             <DropdownMenu>
// //               <DropdownMenuTrigger asChild>
// //                 <button className="flex items-center gap-2 h-9 px-3 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border shrink-0">
// //                   <UserCog className="w-4 h-4" />
// //                   <span className="hidden sm:inline">Account</span>
// //                   <ChevronDown className="w-3.5 h-3.5" />
// //                 </button>
// //               </DropdownMenuTrigger>
// //               <DropdownMenuContent align="end" className="w-52">
// //                 <DropdownMenuItem onClick={() => setShowChangePw(true)} className="cursor-pointer">
// //                   <KeyRound className="w-4 h-4 mr-2" />
// //                   Change Password
// //                 </DropdownMenuItem>
// //                 <DropdownMenuSeparator />
// //                 <DropdownMenuItem
// //                   onClick={handleSignOut}
// //                   className="cursor-pointer text-destructive focus:text-destructive"
// //                 >
// //                   <LogOut className="w-4 h-4 mr-2" />
// //                   Sign Out
// //                 </DropdownMenuItem>
// //               </DropdownMenuContent>
// //             </DropdownMenu>
// //           </div>
// //         </div>
// //         <div className="container mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-8 max-w-[1600px]">
// //           <aside className="lg:w-64 shrink-0 flex flex-col lg:sticky lg:top-8 lg:self-start">
// //             <nav className="flex flex-col gap-4">
// //               {visibleSections.map((section) => {
// //                 const isCollapsed = collapsedSections[section.label];
// //                 return (
// //                   <div key={section.label}>
// //                     <button
// //                       onClick={() => toggleSection(section.label)}
// //                       className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
// //                     >
// //                       {section.label}
// //                       <ChevronDown
// //                         className={cn(
// //                           "w-3.5 h-3.5 transition-transform",
// //                           isCollapsed && "-rotate-90"
// //                         )}
// //                       />
// //                     </button>
// //                     {!isCollapsed && (
// //                       <div className="flex flex-col gap-1 mt-1">
// //                         {section.items.map(({ to, end, label, icon: Icon }) => (
// //                           <NavLink
// //                             key={to}
// //                             to={to}
// //                             end={end}
// //                             className={({ isActive }) =>
// //                               cn(
// //                                 "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors",
// //                                 isActive
// //                                   ? "bg-primary/15 text-primary border border-primary/30 font-medium"
// //                                   : "text-muted-foreground hover:bg-muted hover:text-foreground"
// //                               )
// //                             }
// //                           >
// //                             <Icon className="w-4 h-4 shrink-0" />
// //                             {label}
// //                           </NavLink>
// //                         ))}
// //                       </div>
// //                     )}
// //                   </div>
// //                 );
// //               })}
// //             </nav>
// //           </aside>
// //           <main className="flex-1 min-w-0">
// //             {hasAccessToCurrentPage ? (
// //               <Outlet />
// //             ) : (
// //               <div className="flex flex-col items-center justify-center py-24 text-center">
// //                 <ShieldAlert className="w-12 h-12 text-destructive mb-4" />
// //                 <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
// //                 <p className="text-muted-foreground mt-2">You don't have permission to view this section.</p>
// //               </div>
// //             )}
// //           </main>
// //         </div>
// //       </div>

// //       <Dialog open={showChangePw} onOpenChange={setShowChangePw}>
// //         <DialogContent className="sm:max-w-sm">
// //           <DialogHeader>
// //             <DialogTitle className="flex items-center gap-2">
// //               <KeyRound className="w-5 h-5 text-primary" />
// //               Change Password
// //             </DialogTitle>
// //             <DialogDescription>Update your admin account password.</DialogDescription>
// //           </DialogHeader>
// //           <form onSubmit={handleChangePassword} className="space-y-4">
// //             <div className="space-y-2">
// //               <Label htmlFor="admin-new-pw">New Password</Label>
// //               <Input
// //                 id="admin-new-pw"
// //                 type="password"
// //                 required
// //                 value={newPassword}
// //                 onChange={(e) => setNewPassword(e.target.value)}
// //               />
// //             </div>
// //             <div className="space-y-2">
// //               <Label htmlFor="admin-confirm-pw">Confirm New Password</Label>
// //               <Input
// //                 id="admin-confirm-pw"
// //                 type="password"
// //                 required
// //                 value={confirmPassword}
// //                 onChange={(e) => setConfirmPassword(e.target.value)}
// //               />
// //             </div>
// //             <Button type="submit" className="w-full" disabled={changingPassword}>
// //               {changingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
// //               Update Password
// //             </Button>
// //           </form>
// //         </DialogContent>
// //       </Dialog>
// //     </>
// //   );
// // };

// // export default AdminLayout;

// import { useEffect, useMemo, useRef, useState } from "react";
// import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
// import SEOHead from "@/components/SEOHead";
// import { cn } from "@/lib/utils";
// import { useAuth } from "@/hooks/useAuth";
// import { supabase } from "@/integrations/supabase/client";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { toast } from "sonner";
// import {
//   LayoutDashboard,
//   Package,
//   FileText,
//   Mail,
//   Users,
//   User,
//   GitBranch,
//   Webhook,
//   Sparkles,
//   Briefcase,
//   FileCode,
//   Settings,
//   Crown,
//   FileSpreadsheet,
//   Wrench,
//   KeyRound,
//   LogOut,
//   Loader2,
//   UserCog,
//   ShieldAlert,
//   ScanSearch,
//   ChevronDown,
//   ArrowLeft,
//   Search,
// } from "lucide-react";

// // Sidebar is grouped into sections instead of one flat 16-item list, so related
// // screens (e.g. Orders/Invoices/CRM) sit together and similarly-named GST items
// // don't have to be read one-by-one to tell apart.
// type NavItem = {
//   to: string;
//   end?: boolean;
//   label: string;
//   icon: typeof LayoutDashboard;
//   module: string;
//   adminOnly?: boolean;
// };

// type NavSection = {
//   label: string;
//   items: NavItem[];
// };

// const navSections: NavSection[] = [
//   {
//     label: "Overview",
//     items: [
//       { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
//     ],
//   },
//   {
//     label: "Sales & Customers",
//     items: [
//       { to: "/admin/orders", label: "Orders & Bookings", icon: Package, module: "orders" },
//       { to: "/admin/invoices", label: "Invoice Manager", icon: FileText, module: "invoices" },
//       { to: "/admin/crm", label: "CRM", icon: Users, module: "crm" },
//     ],
//   },
//   {
//     label: "Automation",
//     items: [
//       { to: "/admin/workflows", label: "Workflows", icon: GitBranch, module: "workflows" },
//       { to: "/admin/webhooks", label: "Webhook Logs", icon: Webhook, module: "webhooks" },
//       { to: "/admin/email", label: "Email Center", icon: Mail, module: "email" },
//     ],
//   },
//   {
//     label: "Catalog",
//     items: [
//       { to: "/admin/services", label: "Services Management", icon: Briefcase, module: "services" },
//       { to: "/admin/service-pages", label: "Pages & Packages", icon: Package, module: "service-pages" },
//       // { to: "/admin/pricing", label: "Pricing Management", icon: FileCode, module: "pricing" },
//       { to: "/admin/templates", label: "Templates", icon: FileCode, module: "templates" },
//     ],
//   },
//   {
//     label: "Compliance",
//     items: [
//       { to: "/admin/settings", label: "GST Configuration", icon: Settings, module: "settings" },
//       { to: "/admin/gst-reports", label: "GSTR Reports", icon: FileSpreadsheet, module: "gst-reports" },
//       { to: "/admin/gst-maintenance", label: "GST Maintenance", icon: Wrench, module: "gst-maintenance" },
//     ],
//   },
//   {
//     label: "Admin",
//     items: [
//       { to: "/admin/ai-reports", label: "AI Reports", icon: Sparkles, module: "ai-reports" },
//       { to: "/admin/name-check-reports", label: "Name Check Reports", icon: ScanSearch, module: "name-check-reports" },
//       { to: "/admin/team", label: "Team Management", icon: UserCog, module: "team", adminOnly: true },
//     ],
//   },
// ];

// // Flat list kept for lookups (current-page access check) without duplicating data.
// const nav: NavItem[] = navSections.flatMap((s) => s.items);

// // ------------------------------------------------------------------
// // Global Search
// // ------------------------------------------------------------------
// // SEARCH_SOURCES is the single place that defines what gets searched.
// // Entries marked CONFIRMED were taken directly from existing modules in
// // this project (ServicesModule.tsx, TeamManagementModule.tsx). Entries
// // marked "TODO — verify" are best-guess table/column names — if a
// // module's results never show up, this is the block to fix; nothing
// // else in the search UI needs to change.
// // ------------------------------------------------------------------

// type SearchResult = {
//   id: string;
//   title: string;
//   subtitle: string;
//   module: string;
//   route: string;
//   createdAt: string | null;
// };

// type SearchSource = {
//   module: string;
//   icon: typeof LayoutDashboard;
//   route: string;
//   fetch: (query: string) => Promise<SearchResult[]>;
// };

// function makeSource(config: {
//   module: string;
//   icon: typeof LayoutDashboard;
//   route: string;
//   table: string;
//   searchColumns: string[];
//   titleField: string;
//   subtitleField?: string;
//   dateField?: string;
// }): SearchSource {
//   return {
//     module: config.module,
//     icon: config.icon,
//     route: config.route,
//     fetch: async (query: string) => {
//       try {
//         const orFilter = config.searchColumns.map((c) => `${c}.ilike.%${query}%`).join(",");
//         const { data, error } = await supabase
//           .from(config.table)
//           .select("*")
//           .or(orFilter)
//           .order(config.dateField || "created_at", { ascending: false })
//           .limit(5);
//         // Swallow errors (e.g. wrong table/column name) so one bad source
//         // never breaks the rest of the search results.
//         if (error || !data) return [];
//         return data.map((row: Record<string, unknown>) => ({
//           id: String(row.id ?? row.user_id ?? `${config.table}-${Math.random()}`),
//           title: String(row[config.titleField] ?? "Untitled"),
//           subtitle: config.subtitleField ? String(row[config.subtitleField] ?? "") : "",
//           module: config.module,
//           route: config.route,
//           createdAt: (config.dateField ? row[config.dateField] : row.created_at) as string | null ?? null,
//         }));
//       } catch {
//         return [];
//       }
//     },
//   };
// }

// // Team Members needs a small join (user_roles -> profiles), same pattern
// // already used in TeamManagementModule.tsx, so it gets a bespoke fetcher
// // instead of the generic makeSource().
// async function fetchTeamMembers(query: string): Promise<SearchResult[]> {
//   try {
//     const { data: staffRoles } = await supabase.from("user_roles").select("user_id").eq("role", "staff");
//     const ids = (staffRoles || []).map((r) => r.user_id);
//     if (ids.length === 0) return [];

//     const { data, error } = await supabase
//       .from("profiles")
//       .select("*")
//       .in("user_id", ids)
//       .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
//       .limit(5);
//     if (error || !data) return [];

//     return data.map((row: Record<string, unknown>) => ({
//       id: String(row.user_id),
//       title: (row.full_name as string) || (row.email as string) || "Team member",
//       subtitle: (row.email as string) || "",
//       module: "Team Members",
//       route: "/admin/team",
//       createdAt: (row.created_at as string | undefined) ?? null,
//     }));
//   } catch {
//     return [];
//   }
// }

// const SEARCH_SOURCES: SearchSource[] = [
//   makeSource({
//     module: "Orders",
//     icon: Package,
//     route: "/admin/orders",
//     table: "orders", // TODO — verify table name
//     searchColumns: ["order_number", "customer_name", "email"], // TODO — verify column names
//     titleField: "order_number",
//     subtitleField: "customer_name",
//   }),
//   makeSource({
//     module: "Invoices",
//     icon: FileText,
//     route: "/admin/invoices",
//     table: "invoices", // TODO — verify table name
//     searchColumns: ["invoice_number", "customer_name", "email"], // TODO — verify
//     titleField: "invoice_number",
//     subtitleField: "customer_name",
//   }),
//   makeSource({
//     module: "CRM",
//     icon: Users,
//     route: "/admin/crm",
//     table: "crm_leads", // TODO — verify table name
//     searchColumns: ["name", "email", "company"], // TODO — verify
//     titleField: "name",
//     subtitleField: "company",
//   }),
//   makeSource({
//     module: "Customers",
//     icon: User,
//     // No dedicated "Customers" route exists in the current nav — points at
//     // CRM for now. Change this if customers get their own page later.
//     route: "/admin/crm",
//     table: "customers", // TODO — verify table name (may not exist separately from CRM)
//     searchColumns: ["name", "email", "phone"], // TODO — verify
//     titleField: "name",
//     subtitleField: "email",
//   }),
//   makeSource({
//     module: "Reports",
//     icon: Sparkles,
//     route: "/admin/ai-reports",
//     table: "ai_reports", // TODO — verify table name
//     searchColumns: ["title", "summary"], // TODO — verify
//     titleField: "title",
//     subtitleField: "summary",
//   }),
//   makeSource({
//     module: "Emails",
//     icon: Mail,
//     route: "/admin/email",
//     table: "email_logs", // TODO — verify table name
//     searchColumns: ["subject", "recipient"], // TODO — verify
//     titleField: "subject",
//     subtitleField: "recipient",
//   }),
//   makeSource({
//     module: "Workflows",
//     icon: GitBranch,
//     route: "/admin/workflows",
//     table: "workflows", // TODO — verify table name
//     searchColumns: ["name", "description"], // TODO — verify
//     titleField: "name",
//     subtitleField: "description",
//   }),
//   {
//     module: "Team Members",
//     icon: UserCog,
//     route: "/admin/team",
//     fetch: fetchTeamMembers, // CONFIRMED — same query pattern as TeamManagementModule.tsx
//   },
//   makeSource({
//     module: "Services",
//     icon: Briefcase,
//     route: "/admin/services",
//     table: "services", // CONFIRMED
//     searchColumns: ["title", "category"], // CONFIRMED
//     titleField: "title",
//     subtitleField: "category",
//   }),
// ];

// function formatResultDate(value: string | null): string {
//   if (!value) return "—";
//   const d = new Date(value);
//   if (Number.isNaN(d.getTime())) return "—";
//   return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
// }

// const AdminLayout = () => {
//   const { signOut, role, canViewModule } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [showChangePw, setShowChangePw] = useState(false);
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [changingPassword, setChangingPassword] = useState(false);

//   // All sections open by default; collapsed state is per-section so infrequently
//   // used groups (e.g. Compliance) can be tucked away without hiding the rest.
//   const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

//   // --- Global search state ---
//   const [searchQuery, setSearchQuery] = useState("");
//   const [debouncedQuery, setDebouncedQuery] = useState("");
//   const [searchOpen, setSearchOpen] = useState(false);
//   const [searching, setSearching] = useState(false);
//   const [groupedResults, setGroupedResults] = useState<Record<string, SearchResult[]>>({});
//   const [activeIndex, setActiveIndex] = useState(-1);
//   const searchInputRef = useRef<HTMLInputElement>(null);
//   const searchContainerRef = useRef<HTMLDivElement>(null);

//   const toggleSection = (label: string) => {
//     setCollapsedSections((prev) => ({ ...prev, [label]: !prev[label] }));
//   };

//   // Debounce: wait 350ms after the user stops typing before actually querying.
//   useEffect(() => {
//     const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 350);
//     return () => clearTimeout(t);
//   }, [searchQuery]);

//   // Run the actual multi-table search once the debounced query is ready.
//   useEffect(() => {
//     if (debouncedQuery.length < 2) {
//       setGroupedResults({});
//       setSearching(false);
//       return;
//     }
//     let cancelled = false;
//     setSearching(true);

//     (async () => {
//       const settled = await Promise.allSettled(SEARCH_SOURCES.map((s) => s.fetch(debouncedQuery)));
//       if (cancelled) return;

//       const grouped: Record<string, SearchResult[]> = {};
//       settled.forEach((res, i) => {
//         const source = SEARCH_SOURCES[i];
//         const items = res.status === "fulfilled" ? res.value : [];
//         if (items.length > 0) grouped[source.module] = items;
//       });

//       setGroupedResults(grouped);
//       setSearching(false);
//       setActiveIndex(-1);
//     })();

//     return () => {
//       cancelled = true;
//     };
//   }, [debouncedQuery]);

//   // Ctrl+K / Cmd+K opens & focuses search from anywhere in the admin panel.
//   useEffect(() => {
//     const handler = (e: KeyboardEvent) => {
//       if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
//         e.preventDefault();
//         setSearchOpen(true);
//         searchInputRef.current?.focus();
//       }
//       if (e.key === "Escape") {
//         setSearchOpen(false);
//         searchInputRef.current?.blur();
//       }
//     };
//     window.addEventListener("keydown", handler);
//     return () => window.removeEventListener("keydown", handler);
//   }, []);

//   // Close the results panel when clicking outside of it.
//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
//         setSearchOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   // Flattened, ordered list (module order = SEARCH_SOURCES order) used for
//   // arrow-key navigation and to know which row is "active".
//   const flatResults = useMemo(() => {
//     const list: SearchResult[] = [];
//     SEARCH_SOURCES.forEach((s) => {
//       (groupedResults[s.module] || []).forEach((r) => list.push(r));
//     });
//     return list;
//   }, [groupedResults]);

//   const handleSelectResult = (result: SearchResult) => {
//     setSearchOpen(false);
//     setSearchQuery("");
//     setDebouncedQuery("");
//     setGroupedResults({});
//     navigate(result.route);
//   };

//   const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setActiveIndex((i) => Math.max(i - 1, 0));
//     } else if (e.key === "Enter") {
//       if (activeIndex >= 0 && flatResults[activeIndex]) {
//         handleSelectResult(flatResults[activeIndex]);
//       }
//     }
//   };

//   const handleChangePassword = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (newPassword.length < 8) {
//       toast.error("Password must be at least 8 characters");
//       return;
//     }
//     if (newPassword !== confirmPassword) {
//       toast.error("Passwords do not match");
//       return;
//     }
//     setChangingPassword(true);
//     const { error } = await supabase.auth.updateUser({ password: newPassword });
//     setChangingPassword(false);

//     if (error) {
//       toast.error(error.message);
//       return;
//     }
//     toast.success("Password changed successfully!");
//     setNewPassword("");
//     setConfirmPassword("");
//     setShowChangePw(false);
//   };

//   const handleSignOut = async () => {
//     await signOut();
//     navigate("/auth", { replace: true });
//   };

//   // Goes back one step in admin history; falls back to the dashboard when
//   // there's no previous in-app entry (e.g. user landed here directly via a
//   // bookmark/refresh, so history.state.idx is 0).
//   const handleBack = () => {
//     const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
//     if (idx > 0) {
//       navigate(-1);
//     } else {
//       navigate("/admin", { replace: true });
//     }
//   };

//   // Sidebar: staff ko sirf allowed modules dikhein; admin ko sab
//   const visibleSections = navSections
//     .map((section) => ({
//       ...section,
//       items: section.items.filter((item) => {
//         if (item.adminOnly) return role === "admin";
//         if (role === "admin") return true;
//         if (item.module === "dashboard") return true; // sabko dashboard dikhega
//         return canViewModule(item.module);
//       }),
//     }))
//     .filter((section) => section.items.length > 0);

//   // Direct URL se bhi koi disallowed module na khol paye
//   const currentNavItem = nav.find((item) =>
//     item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
//   );
//   const hasAccessToCurrentPage =
//     role === "admin" ||
//     !currentNavItem ||
//     currentNavItem.module === "dashboard" ||
//     canViewModule(currentNavItem.module);

//   return (
//     <>
//       <SEOHead title="Operations Console" description="Ankshaastra centralized operations admin." />
//       {/* Admin gets its own minimal shell — no public marketing nav (Home, Services,
//           Reports, Podcasts, Shop, etc.) and no customer-support chat bubble. Those
//           were built for site visitors, not ops staff, and the chat bubble was
//           overlapping list content in the dashboard. */}
//       <div className="min-h-screen bg-background">
//         <div className="border-b border-border bg-gradient-to-r from-background via-card to-background">
//           {/* Header row: Back button + logo + title share one flex container so they
//               stay on the same horizontal line and share the container's left edge
//               with the sidebar/content below. flex-wrap lets the Back button drop to
//               its own line on narrow screens instead of overlapping the title. */}
//           <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-wrap items-center justify-between gap-y-3 gap-x-3">
//             <div className="flex flex-wrap items-center gap-y-3">
//               {location.pathname !== "/admin" && (
//                 <button
//                   onClick={handleBack}
//                   className="flex items-center gap-2 h-9 px-3 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border shrink-0 mr-6"
//                 >
//                   <ArrowLeft className="w-4 h-4" />
//                   Back
//                 </button>
//               )}
//               <div className="flex items-center gap-4">
//                 <Crown className="w-8 h-8 text-primary shrink-0" />
//                 <div>
//                   <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Operations Console</h1>
//                   <p className="text-sm text-muted-foreground">Centralized communication, invoicing & automation</p>
//                 </div>
//               </div>
//             </div>

//             {/* Global Search — searches Orders, Invoices, CRM, Customers, Reports,
//                 Emails, Workflows, Team Members, and Services. Ctrl+K focuses it
//                 from anywhere in the admin panel. */}
//             <div
//               ref={searchContainerRef}
//               className="relative w-full sm:flex-1 sm:max-w-md order-3 sm:order-none"
//             >
//               <div className="relative">
//                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
//                 <Input
//                   ref={searchInputRef}
//                   value={searchQuery}
//                   onChange={(e) => {
//                     setSearchQuery(e.target.value);
//                     setSearchOpen(true);
//                   }}
//                   onFocus={() => setSearchOpen(true)}
//                   onKeyDown={onSearchKeyDown}
//                   placeholder="Search orders, invoices, CRM…"
//                   className="pl-9 pr-14"
//                 />
//                 <kbd className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
//                   Ctrl K
//                 </kbd>
//               </div>

//               {searchOpen && searchQuery.trim().length > 0 && (
//                 <div className="absolute left-0 right-0 mt-2 max-h-[70vh] overflow-y-auto rounded-lg border border-border bg-card shadow-lg z-50">
//                   {searching ? (
//                     <div className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
//                       <Loader2 className="w-4 h-4 animate-spin" />
//                       Searching…
//                     </div>
//                   ) : debouncedQuery.length < 2 ? (
//                     <p className="px-4 py-6 text-sm text-muted-foreground text-center">
//                       Keep typing to search…
//                     </p>
//                   ) : flatResults.length === 0 ? (
//                     <p className="px-4 py-6 text-sm text-muted-foreground text-center">
//                       No results for "{debouncedQuery}"
//                     </p>
//                   ) : (
//                     SEARCH_SOURCES.filter((s) => (groupedResults[s.module] || []).length > 0).map((source) => (
//                       <div key={source.module} className="border-b border-border last:border-b-0">
//                         <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
//                           {source.module}
//                         </p>
//                         <div className="pb-2">
//                           {(groupedResults[source.module] || []).map((result) => {
//                             const flatIdx = flatResults.indexOf(result);
//                             const Icon = source.icon;
//                             return (
//                               <button
//                                 key={`${result.module}-${result.id}`}
//                                 type="button"
//                                 onClick={() => handleSelectResult(result)}
//                                 onMouseEnter={() => setActiveIndex(flatIdx)}
//                                 className={cn(
//                                   "w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors",
//                                   activeIndex === flatIdx ? "bg-muted" : "hover:bg-muted/60"
//                                 )}
//                               >
//                                 <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
//                                 <span className="flex-1 min-w-0">
//                                   <span className="block font-medium truncate">{result.title}</span>
//                                   {result.subtitle && (
//                                     <span className="block text-xs text-muted-foreground truncate">
//                                       {result.subtitle}
//                                     </span>
//                                   )}
//                                 </span>
//                                 <span className="text-xs text-muted-foreground shrink-0">
//                                   {formatResultDate(result.createdAt)}
//                                 </span>
//                               </button>
//                             );
//                           })}
//                         </div>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* Account menu — Change Password + Sign Out live here together,
//                 on every screen size, instead of a bare "Sign Out" button plus
//                 a separate "Change Password" link buried at the bottom of the
//                 sidebar. */}
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <button className="flex items-center gap-2 h-9 px-3 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border shrink-0">
//                   <UserCog className="w-4 h-4" />
//                   <span className="hidden sm:inline">Account</span>
//                   <ChevronDown className="w-3.5 h-3.5" />
//                 </button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end" className="w-52">
//                 <DropdownMenuItem onClick={() => setShowChangePw(true)} className="cursor-pointer">
//                   <KeyRound className="w-4 h-4 mr-2" />
//                   Change Password
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem
//                   onClick={handleSignOut}
//                   className="cursor-pointer text-destructive focus:text-destructive"
//                 >
//                   <LogOut className="w-4 h-4 mr-2" />
//                   Sign Out
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>
//         <div className="container mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-8 max-w-[1600px]">
//           <aside className="lg:w-64 shrink-0 flex flex-col lg:sticky lg:top-8 lg:self-start">
//             <nav className="flex flex-col gap-4">
//               {visibleSections.map((section) => {
//                 const isCollapsed = collapsedSections[section.label];
//                 return (
//                   <div key={section.label}>
//                     <button
//                       onClick={() => toggleSection(section.label)}
//                       className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
//                     >
//                       {section.label}
//                       <ChevronDown
//                         className={cn(
//                           "w-3.5 h-3.5 transition-transform",
//                           isCollapsed && "-rotate-90"
//                         )}
//                       />
//                     </button>
//                     {!isCollapsed && (
//                       <div className="flex flex-col gap-1 mt-1">
//                         {section.items.map(({ to, end, label, icon: Icon }) => (
//                           <NavLink
//                             key={to}
//                             to={to}
//                             end={end}
//                             className={({ isActive }) =>
//                               cn(
//                                 "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors",
//                                 isActive
//                                   ? "bg-primary/15 text-primary border border-primary/30 font-medium"
//                                   : "text-muted-foreground hover:bg-muted hover:text-foreground"
//                               )
//                             }
//                           >
//                             <Icon className="w-4 h-4 shrink-0" />
//                             {label}
//                           </NavLink>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </nav>
//           </aside>
//           <main className="flex-1 min-w-0">
//             {hasAccessToCurrentPage ? (
//               <Outlet />
//             ) : (
//               <div className="flex flex-col items-center justify-center py-24 text-center">
//                 <ShieldAlert className="w-12 h-12 text-destructive mb-4" />
//                 <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
//                 <p className="text-muted-foreground mt-2">You don't have permission to view this section.</p>
//               </div>
//             )}
//           </main>
//         </div>
//       </div>

//       <Dialog open={showChangePw} onOpenChange={setShowChangePw}>
//         <DialogContent className="sm:max-w-sm">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2">
//               <KeyRound className="w-5 h-5 text-primary" />
//               Change Password
//             </DialogTitle>
//             <DialogDescription>Update your admin account password.</DialogDescription>
//           </DialogHeader>
//           <form onSubmit={handleChangePassword} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="admin-new-pw">New Password</Label>
//               <Input
//                 id="admin-new-pw"
//                 type="password"
//                 required
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="admin-confirm-pw">Confirm New Password</Label>
//               <Input
//                 id="admin-confirm-pw"
//                 type="password"
//                 required
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//               />
//             </div>
//             <Button type="submit" className="w-full" disabled={changingPassword}>
//               {changingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//               Update Password
//             </Button>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };

// export default AdminLayout;

import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Package,
  FileText,
  Mail,
  Users,
  User,
  GitBranch,
  Webhook,
  Sparkles,
  Briefcase,
  FileCode,
  Settings,
  Crown,
  FileSpreadsheet,
  Wrench,
  KeyRound,
  LogOut,
  Loader2,
  UserCog,
  ShieldAlert,
  ScanSearch,
  ChevronDown,
  ArrowLeft,
  Search,
} from "lucide-react";

// Sidebar is grouped into sections instead of one flat 16-item list, so related
// screens (e.g. Orders/Invoices/CRM) sit together and similarly-named GST items
// don't have to be read one-by-one to tell apart.
type NavItem = {
  to: string;
  end?: boolean;
  label: string;
  icon: typeof LayoutDashboard;
  module: string;
  adminOnly?: boolean;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
    ],
  },
  {
    label: "Sales & Customers",
    items: [
      { to: "/admin/orders", label: "Orders & Bookings", icon: Package, module: "orders" },
      { to: "/admin/invoices", label: "Invoice Manager", icon: FileText, module: "invoices" },
      { to: "/admin/crm", label: "CRM", icon: Users, module: "crm" },
    ],
  },
  {
    label: "Automation",
    items: [
      { to: "/admin/workflows", label: "Workflows", icon: GitBranch, module: "workflows" },
      { to: "/admin/webhooks", label: "Webhook Logs", icon: Webhook, module: "webhooks" },
      { to: "/admin/email", label: "Email Center", icon: Mail, module: "email" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { to: "/admin/services", label: "Services Management", icon: Briefcase, module: "services" },
      { to: "/admin/service-pages", label: "Pages & Packages", icon: Package, module: "service-pages" },
      // { to: "/admin/pricing", label: "Pricing Management", icon: FileCode, module: "pricing" },
      { to: "/admin/templates", label: "Templates", icon: FileCode, module: "templates" },
    ],
  },
  {
    label: "Compliance",
    items: [
      { to: "/admin/settings", label: "GST Configuration", icon: Settings, module: "settings" },
      { to: "/admin/gst-reports", label: "GSTR Reports", icon: FileSpreadsheet, module: "gst-reports" },
      { to: "/admin/gst-maintenance", label: "GST Maintenance", icon: Wrench, module: "gst-maintenance" },
    ],
  },
  {
    label: "Admin",
    items: [
      { to: "/admin/ai-reports", label: "AI Reports", icon: Sparkles, module: "ai-reports" },
      { to: "/admin/name-check-reports", label: "Name Check Reports", icon: ScanSearch, module: "name-check-reports" },
      { to: "/admin/team", label: "Team Management", icon: UserCog, module: "team", adminOnly: true },
    ],
  },
];

// Flat list kept for lookups (current-page access check) without duplicating data.
const nav: NavItem[] = navSections.flatMap((s) => s.items);

// ------------------------------------------------------------------
// Global Search
// ------------------------------------------------------------------
// SEARCH_SOURCES is the single place that defines what gets searched.
// Entries marked CONFIRMED were taken directly from existing modules in
// this project (ServicesModule.tsx, TeamManagementModule.tsx). Entries
// marked "TODO — verify" are best-guess table/column names — if a
// module's results never show up, this is the block to fix; nothing
// else in the search UI needs to change.
// ------------------------------------------------------------------

type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  module: string;
  route: string;
  createdAt: string | null;
};

type SearchSource = {
  module: string;
  icon: typeof LayoutDashboard;
  route: string;
  fetch: (query: string) => Promise<SearchResult[]>;
};

// Common field-name candidates used to auto-detect which column holds the
// title/subtitle/date for a given row, without needing to know the exact
// schema up front. First matching, non-empty field wins.
const TITLE_FIELD_CANDIDATES = [
  "title", "name", "full_name", "order_number", "invoice_number",
  "subject", "service_name", "company_name", "lead_name", "customer_name",
];
const SUBTITLE_FIELD_CANDIDATES = [
  "subtitle", "email", "customer_name", "company", "status", "description",
  "phone", "category", "recipient", "to_email",
];
const DATE_FIELD_CANDIDATES = [
  "created_at", "createdAt", "created", "date", "order_date", "invoice_date", "sent_at",
];

function pickField(row: Record<string, unknown>, candidates: string[]): string {
  for (const c of candidates) {
    const v = row[c];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v);
  }
  return "";
}

function pickDateField(row: Record<string, unknown>): string | null {
  for (const c of DATE_FIELD_CANDIDATES) {
    const v = row[c];
    if (v) return String(v);
  }
  return null;
}

// Substring match across every value on the row (case-insensitive) — avoids
// needing to know which specific column to filter on.
function rowMatchesQuery(row: Record<string, unknown>, query: string): boolean {
  const q = query.toLowerCase();
  return Object.values(row).some((v) => {
    if (v === null || v === undefined) return false;
    return String(v).toLowerCase().includes(q);
  });
}

// Caches which real table name matched for each module, so we only probe
// candidate table names once (first search), not on every keystroke.
const resolvedTableCache: Record<string, string | null> = {};

async function resolveTable(sourceKey: string, candidates: string[]): Promise<string | null> {
  if (sourceKey in resolvedTableCache) return resolvedTableCache[sourceKey];
  for (const table of candidates) {
    try {
      const { error } = await supabase.from(table).select("*").limit(1);
      if (!error) {
        resolvedTableCache[sourceKey] = table;
        return table;
      }
      console.warn(`[GlobalSearch] "${sourceKey}" — table "${table}" rejected:`, error.message);
    } catch (e) {
      console.warn(`[GlobalSearch] "${sourceKey}" — table "${table}" threw:`, e);
    }
  }
  console.warn(`[GlobalSearch] "${sourceKey}" — no candidate table worked out of`, candidates);
  resolvedTableCache[sourceKey] = null;
  return null;
}

function makeSource(config: {
  module: string;
  icon: typeof LayoutDashboard;
  route: string;
  tableCandidates: string[];
}): SearchSource {
  return {
    module: config.module,
    icon: config.icon,
    route: config.route,
    fetch: async (query: string) => {
      try {
        const table = await resolveTable(config.module, config.tableCandidates);
        if (!table) return [];

        // No known column names to filter on server-side, so fetch a
        // reasonably large recent batch and filter client-side instead.
        const { data, error } = await supabase.from(table).select("*").limit(200);
        if (error) {
          console.warn(`[GlobalSearch] "${config.module}" query on "${table}" failed:`, error.message);
          return [];
        }
        if (!data) return [];
        if (data.length === 0) {
          console.warn(
            `[GlobalSearch] "${config.module}" — table "${table}" returned 0 rows (RLS may be blocking read access for this table).`
          );
        }

        return data
          .filter((row: Record<string, unknown>) => rowMatchesQuery(row, query))
          .slice(0, 5)
          .map((row: Record<string, unknown>) => ({
            id: String(row.id ?? row.user_id ?? `${table}-${Math.random()}`),
            title: pickField(row, TITLE_FIELD_CANDIDATES) || "Untitled",
            subtitle: pickField(row, SUBTITLE_FIELD_CANDIDATES),
            module: config.module,
            route: config.route,
            createdAt: pickDateField(row),
          }));
      } catch (e) {
        console.warn(`[GlobalSearch] "${config.module}" fetch threw:`, e);
        return [];
      }
    },
  };
}

// Team Members needs a small join (user_roles -> profiles), same pattern
// already used in TeamManagementModule.tsx, so it gets a bespoke fetcher
// instead of the generic makeSource().
async function fetchTeamMembers(query: string): Promise<SearchResult[]> {
  try {
    const { data: staffRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "staff");
    if (rolesError) {
      console.warn(`[GlobalSearch] "Team Members" — user_roles query failed:`, rolesError.message);
      return [];
    }
    const ids = (staffRoles || []).map((r) => r.user_id);
    if (ids.length === 0) return [];

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", ids)
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(5);
    if (error) {
      console.warn(`[GlobalSearch] "Team Members" — profiles query failed:`, error.message);
      return [];
    }
    if (!data) return [];

    return data.map((row: Record<string, unknown>) => ({
      id: String(row.user_id),
      title: (row.full_name as string) || (row.email as string) || "Team member",
      subtitle: (row.email as string) || "",
      module: "Team Members",
      route: "/admin/team",
      createdAt: (row.created_at as string | undefined) ?? null,
    }));
  } catch (e) {
    console.warn(`[GlobalSearch] "Team Members" fetch threw:`, e);
    return [];
  }
}

const SEARCH_SOURCES: SearchSource[] = [
  makeSource({
    module: "Orders",
    icon: Package,
    route: "/admin/orders",
    tableCandidates: ["orders"], // CONFIRMED
  }),
  makeSource({
    module: "Invoices",
    icon: FileText,
    route: "/admin/invoices",
    tableCandidates: ["invoices"], // CONFIRMED
  }),
  makeSource({
    module: "CRM",
    icon: Users,
    route: "/admin/crm",
    // No dedicated CRM table exists in this schema — CRM and Customers both
    // read from "customers".
    tableCandidates: ["customers"], // CONFIRMED
  }),
  makeSource({
    module: "Customers",
    icon: User,
    // No dedicated "Customers" route exists in the current nav — points at
    // CRM for now. Change this if customers get their own page later.
    route: "/admin/crm",
    tableCandidates: ["customers"], // CONFIRMED
  }),
  makeSource({
    module: "Reports",
    icon: Sparkles,
    route: "/admin/ai-reports",
    tableCandidates: ["ai_reports"], // CONFIRMED
  }),
  makeSource({
    module: "Emails",
    icon: Mail,
    route: "/admin/email",
    tableCandidates: ["email_logs"], // CONFIRMED
  }),
  makeSource({
    module: "Workflows",
    icon: GitBranch,
    route: "/admin/workflows",
    // No table literally named "workflows" — workflow activity lives in
    // these two tables instead.
    tableCandidates: ["workflow_events", "automation_jobs"], // CONFIRMED
  }),
  {
    module: "Team Members",
    icon: UserCog,
    route: "/admin/team",
    fetch: fetchTeamMembers, // CONFIRMED — same query pattern as TeamManagementModule.tsx
  },
  makeSource({
    module: "Services",
    icon: Briefcase,
    route: "/admin/services",
    tableCandidates: ["services"], // CONFIRMED
  }),
];

function formatResultDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

const AdminLayout = () => {
  const { signOut, role, canViewModule } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showChangePw, setShowChangePw] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // All sections open by default; collapsed state is per-section so infrequently
  // used groups (e.g. Compliance) can be tucked away without hiding the rest.
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // --- Global search state ---
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [groupedResults, setGroupedResults] = useState<Record<string, SearchResult[]>>({});
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const toggleSection = (label: string) => {
    setCollapsedSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Debounce: wait 350ms after the user stops typing before actually querying.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Run the actual multi-table search once the debounced query is ready.
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setGroupedResults({});
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);

    (async () => {
      const settled = await Promise.allSettled(SEARCH_SOURCES.map((s) => s.fetch(debouncedQuery)));
      if (cancelled) return;

      const grouped: Record<string, SearchResult[]> = {};
      settled.forEach((res, i) => {
        const source = SEARCH_SOURCES[i];
        const items = res.status === "fulfilled" ? res.value : [];
        if (items.length > 0) grouped[source.module] = items;
      });

      setGroupedResults(grouped);
      setSearching(false);
      setActiveIndex(-1);
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Ctrl+K / Cmd+K opens & focuses search from anywhere in the admin panel.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Close the results panel when clicking outside of it.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Flattened, ordered list (module order = SEARCH_SOURCES order) used for
  // arrow-key navigation and to know which row is "active".
  const flatResults = useMemo(() => {
    const list: SearchResult[] = [];
    SEARCH_SOURCES.forEach((s) => {
      (groupedResults[s.module] || []).forEach((r) => list.push(r));
    });
    return list;
  }, [groupedResults]);

  const handleSelectResult = (result: SearchResult) => {
    setSearchOpen(false);
    setSearchQuery("");
    setDebouncedQuery("");
    setGroupedResults({});
    navigate(result.route);
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && flatResults[activeIndex]) {
        handleSelectResult(flatResults[activeIndex]);
      }
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password changed successfully!");
    setNewPassword("");
    setConfirmPassword("");
    setShowChangePw(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  // Goes back one step in admin history; falls back to the dashboard when
  // there's no previous in-app entry (e.g. user landed here directly via a
  // bookmark/refresh, so history.state.idx is 0).
  const handleBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) {
      navigate(-1);
    } else {
      navigate("/admin", { replace: true });
    }
  };

  // Sidebar: staff ko sirf allowed modules dikhein; admin ko sab
  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.adminOnly) return role === "admin";
        if (role === "admin") return true;
        if (item.module === "dashboard") return true; // sabko dashboard dikhega
        return canViewModule(item.module);
      }),
    }))
    .filter((section) => section.items.length > 0);

  // Direct URL se bhi koi disallowed module na khol paye
  const currentNavItem = nav.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );
  const hasAccessToCurrentPage =
    role === "admin" ||
    !currentNavItem ||
    currentNavItem.module === "dashboard" ||
    canViewModule(currentNavItem.module);

  return (
    <>
      <SEOHead title="Operations Console" description="Ankshaastra centralized operations admin." />
      {/* Admin gets its own minimal shell — no public marketing nav (Home, Services,
          Reports, Podcasts, Shop, etc.) and no customer-support chat bubble. Those
          were built for site visitors, not ops staff, and the chat bubble was
          overlapping list content in the dashboard. */}
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-gradient-to-r from-background via-card to-background">
          {/* Header row: Back button + logo + title share one flex container so they
              stay on the same horizontal line and share the container's left edge
              with the sidebar/content below. flex-wrap lets the Back button drop to
              its own line on narrow screens instead of overlapping the title. */}
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-wrap items-center justify-between gap-y-3 gap-x-3">
            <div className="flex flex-wrap items-center gap-y-3">
              {location.pathname !== "/admin" && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 h-9 px-3 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border shrink-0 mr-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <div className="flex items-center gap-4">
                <Crown className="w-8 h-8 text-primary shrink-0" />
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Operations Console</h1>
                  <p className="text-sm text-muted-foreground">Centralized communication, invoicing & automation</p>
                </div>
              </div>
            </div>

            {/* Global Search — searches Orders, Invoices, CRM, Customers, Reports,
                Emails, Workflows, Team Members, and Services. Ctrl+K focuses it
                from anywhere in the admin panel. */}
            <div
              ref={searchContainerRef}
              className="relative w-full sm:flex-1 sm:max-w-md order-3 sm:order-none"
            >
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={onSearchKeyDown}
                  placeholder="Search orders, invoices, CRM…"
                  className="pl-9"
                />
              </div>

              {searchOpen && searchQuery.trim().length > 0 && (
                <div className="absolute left-0 right-0 mt-2 max-h-[70vh] overflow-y-auto rounded-lg border border-border bg-card shadow-lg z-50">
                  {searching ? (
                    <div className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching…
                    </div>
                  ) : debouncedQuery.length < 2 ? (
                    <p className="px-4 py-6 text-sm text-muted-foreground text-center">
                      Keep typing to search…
                    </p>
                  ) : flatResults.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-muted-foreground text-center">
                      No results for "{debouncedQuery}"
                    </p>
                  ) : (
                    SEARCH_SOURCES.filter((s) => (groupedResults[s.module] || []).length > 0).map((source) => (
                      <div key={source.module} className="border-b border-border last:border-b-0">
                        <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {source.module}
                        </p>
                        <div className="pb-2">
                          {(groupedResults[source.module] || []).map((result) => {
                            const flatIdx = flatResults.indexOf(result);
                            const Icon = source.icon;
                            return (
                              <button
                                key={`${result.module}-${result.id}`}
                                type="button"
                                onClick={() => handleSelectResult(result)}
                                onMouseEnter={() => setActiveIndex(flatIdx)}
                                className={cn(
                                  "w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors",
                                  activeIndex === flatIdx ? "bg-muted" : "hover:bg-muted/60"
                                )}
                              >
                                <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                                <span className="flex-1 min-w-0">
                                  <span className="block font-medium truncate">{result.title}</span>
                                  {result.subtitle && (
                                    <span className="block text-xs text-muted-foreground truncate">
                                      {result.subtitle}
                                    </span>
                                  )}
                                </span>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {formatResultDate(result.createdAt)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Account menu — Change Password + Sign Out live here together,
                on every screen size, instead of a bare "Sign Out" button plus
                a separate "Change Password" link buried at the bottom of the
                sidebar. */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 h-9 px-3 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border shrink-0">
                  <UserCog className="w-4 h-4" />
                  <span className="hidden sm:inline">Account</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => setShowChangePw(true)} className="cursor-pointer">
                  <KeyRound className="w-4 h-4 mr-2" />
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
  onClick={handleSignOut}
  className="cursor-pointer"
>
  <LogOut className="w-4 h-4 mr-2" />
  Sign Out
</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-8 max-w-[1600px]">
          <aside className="lg:w-64 shrink-0 flex flex-col lg:sticky lg:top-8 lg:self-start">
            <nav className="flex flex-col gap-4">
              {visibleSections.map((section) => {
                const isCollapsed = collapsedSections[section.label];
                return (
                  <div key={section.label}>
                    <button
                      onClick={() => toggleSection(section.label)}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {section.label}
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 transition-transform",
                          isCollapsed && "-rotate-90"
                        )}
                      />
                    </button>
                    {!isCollapsed && (
                      <div className="flex flex-col gap-1 mt-1">
                        {section.items.map(({ to, end, label, icon: Icon }) => (
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
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>
          <main className="flex-1 min-w-0">
            {hasAccessToCurrentPage ? (
              <Outlet />
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <ShieldAlert className="w-12 h-12 text-destructive mb-4" />
                <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
                <p className="text-muted-foreground mt-2">You don't have permission to view this section.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      <Dialog open={showChangePw} onOpenChange={setShowChangePw}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              Change Password
            </DialogTitle>
            <DialogDescription>Update your admin account password.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-new-pw">New Password</Label>
              <Input
                id="admin-new-pw"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-confirm-pw">Confirm New Password</Label>
              <Input
                id="admin-confirm-pw"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={changingPassword}>
              {changingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Password
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminLayout;