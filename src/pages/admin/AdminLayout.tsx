// // // // // // import { NavLink, Outlet } from "react-router-dom";
// // // // // // import Layout from "@/components/layout/Layout";
// // // // // // import SEOHead from "@/components/SEOHead";
// // // // // // import { cn } from "@/lib/utils";
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

// // // // // // const AdminLayout = () => (
// // // // // //   <Layout>
// // // // // //     <SEOHead title="Operations Console" description="Ankshaastra centralized operations admin." />
// // // // // //     <div className="min-h-screen bg-background">
// // // // // //       <div className="border-b border-border bg-gradient-to-r from-background via-card to-background">
// // // // // //         <div className="container mx-auto px-4 py-6 flex items-center gap-3">
// // // // // //           <Crown className="w-8 h-8 text-primary" />
// // // // // //           <div>
// // // // // //             <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Operations Console</h1>
// // // // // //             <p className="text-sm text-muted-foreground">Centralized communication, invoicing & automation</p>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       </div>
// // // // // //       <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 max-w-[1600px]">
// // // // // //         <aside className="lg:w-64 shrink-0">
// // // // // //           <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
// // // // // //             {nav.map(({ to, end, label, icon: Icon }) => (
// // // // // //               <NavLink
// // // // // //                 key={to}
// // // // // //                 to={to}
// // // // // //                 end={end}
// // // // // //                 className={({ isActive }) =>
// // // // // //                   cn(
// // // // // //                     "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors",
// // // // // //                     isActive
// // // // // //                       ? "bg-primary/15 text-primary border border-primary/30 font-medium"
// // // // // //                       : "text-muted-foreground hover:bg-muted hover:text-foreground"
// // // // // //                   )
// // // // // //                 }
// // // // // //               >
// // // // // //                 <Icon className="w-4 h-4 shrink-0" />
// // // // // //                 {label}
// // // // // //               </NavLink>
// // // // // //             ))}
// // // // // //           </nav>
// // // // // //         </aside>
// // // // // //         <main className="flex-1 min-w-0">
// // // // // //           <Outlet />
// // // // // //         </main>
// // // // // //       </div>
// // // // // //     </div>
// // // // // //   </Layout>
// // // // // // );

// // // // // // export default AdminLayout;

// // import { useState } from "react";
// // import { NavLink, Outlet, useNavigate } from "react-router-dom";
// // import Layout from "@/components/layout/Layout";
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
// // } from "lucide-react";

// // const nav = [
// //   { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard },
// //   { to: "/admin/orders", label: "Orders & Bookings", icon: Package },
// //   { to: "/admin/invoices", label: "Invoice Manager", icon: FileText },
// //   { to: "/admin/email", label: "Email Center", icon: Mail },
// //   { to: "/admin/crm", label: "CRM", icon: Users },
// //   { to: "/admin/workflows", label: "Workflows", icon: GitBranch },
// //   { to: "/admin/webhooks", label: "Webhook Logs", icon: Webhook },
// //   { to: "/admin/ai-reports", label: "AI Reports", icon: Sparkles },
// //   { to: "/admin/services", label: "Services Management", icon: Briefcase },
// //   { to: "/admin/service-pages", label: "Pages & Packages", icon: Package },
// //   { to: "/admin/pricing", label: "Pricing Management", icon: FileCode },
// //   { to: "/admin/templates", label: "Templates", icon: FileCode },
// //   { to: "/admin/settings", label: "GST Configuration", icon: Settings },
// //   { to: "/admin/gst-reports", label: "GSTR Reports", icon: FileSpreadsheet },
// //   { to: "/admin/gst-maintenance", label: "GST Maintenance", icon: Wrench },
// // ];

// // const AdminLayout = () => {
// //   const { signOut } = useAuth();
// //   const navigate = useNavigate();

// //   const [showChangePw, setShowChangePw] = useState(false);
// //   const [newPassword, setNewPassword] = useState("");
// //   const [confirmPassword, setConfirmPassword] = useState("");
// //   const [changingPassword, setChangingPassword] = useState(false);

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

// //   return (
// //     <Layout>
// //       <SEOHead title="Operations Console" description="Ankshaastra centralized operations admin." />
// //       <div className="min-h-screen bg-background">
// //         <div className="border-b border-border bg-gradient-to-r from-background via-card to-background">
// //           <div className="container mx-auto px-4 py-6 flex items-center gap-3">
// //             <Crown className="w-8 h-8 text-primary" />
// //             <div>
// //               <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Operations Console</h1>
// //               <p className="text-sm text-muted-foreground">Centralized communication, invoicing & automation</p>
// //             </div>
// //           </div>
// //         </div>
// //         <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 max-w-[1600px]">
// //           <aside className="lg:w-64 shrink-0 flex flex-col lg:sticky lg:top-24 lg:self-start">
// //             <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
// //               {nav.map(({ to, end, label, icon: Icon }) => (
// //                 <NavLink
// //                   key={to}
// //                   to={to}
// //                   end={end}
// //                   className={({ isActive }) =>
// //                     cn(
// //                       "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors",
// //                       isActive
// //                         ? "bg-primary/15 text-primary border border-primary/30 font-medium"
// //                         : "text-muted-foreground hover:bg-muted hover:text-foreground"
// //                     )
// //                   }
// //                 >
// //                   <Icon className="w-4 h-4 shrink-0" />
// //                   {label}
// //                 </NavLink>
// //               ))}
// //             </nav>

// //             {/* ---- Account actions: Change Password + Sign Out ---- */}
// //             <div className="hidden lg:flex flex-col gap-1 mt-2 pt-4 border-t border-border">
// //               <button
// //                 onClick={() => setShowChangePw(true)}
// //                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
// //               >
// //                 <KeyRound className="w-4 h-4 shrink-0" />
// //                 Change Password
// //               </button>
              
// //             </div>

// //             {/* Mobile: show as part of scrollable nav row */}
// //             <div className="flex lg:hidden gap-1 mt-2">
// //               <button
// //                 onClick={() => setShowChangePw(true)}
// //                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
// //               >
// //                 <KeyRound className="w-4 h-4 shrink-0" />
// //                 Change Password
// //               </button>
// //               <button
// //                 onClick={handleSignOut}
// //                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
// //               >
// //                 <LogOut className="w-4 h-4 shrink-0" />
// //                 Sign Out
// //               </button>
// //             </div>
// //           </aside>
// //           <main className="flex-1 min-w-0">
// //             <Outlet />
// //           </main>
// //         </div>
// //       </div>

// //       {/* ---- Change Password Modal ---- */}
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
// //     </Layout>
// //   );
// // };

// // export default AdminLayout;

// // import { useState } from "react";
// // import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
// // import Layout from "@/components/layout/Layout";
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

// // } from "lucide-react";

// // const nav = [
// //   { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
// //   { to: "/admin/orders", label: "Orders & Bookings", icon: Package, module: "orders" },
// //   { to: "/admin/invoices", label: "Invoice Manager", icon: FileText, module: "invoices" },
// //   { to: "/admin/email", label: "Email Center", icon: Mail, module: "email" },
// //   { to: "/admin/crm", label: "CRM", icon: Users, module: "crm" },
// //   { to: "/admin/workflows", label: "Workflows", icon: GitBranch, module: "workflows" },
// //   { to: "/admin/webhooks", label: "Webhook Logs", icon: Webhook, module: "webhooks" },
// //   { to: "/admin/ai-reports", label: "AI Reports", icon: Sparkles, module: "ai-reports" },
// //   { to: "/admin/services", label: "Services Management", icon: Briefcase, module: "services" },
// //   { to: "/admin/service-pages", label: "Pages & Packages", icon: Package, module: "service-pages" },
// //   { to: "/admin/pricing", label: "Pricing Management", icon: FileCode, module: "pricing" },
// //   { to: "/admin/templates", label: "Templates", icon: FileCode, module: "templates" },
// //   { to: "/admin/settings", label: "GST Configuration", icon: Settings, module: "settings" },
// //   { to: "/admin/gst-reports", label: "GSTR Reports", icon: FileSpreadsheet, module: "gst-reports" },
// //   { to: "/admin/gst-maintenance", label: "GST Maintenance", icon: Wrench, module: "gst-maintenance" },
// //   { to: "/admin/team", label: "Team Management", icon: UserCog, module: "team", adminOnly: true },
// //     { to: "/admin/name-check-reports", label: "Name Check Reports", icon: ScanSearch, module: "name-check-reports" },

// // ];

// // const AdminLayout = () => {
// //   const { signOut, role, canViewModule } = useAuth();
// //   const navigate = useNavigate();
// //   const location = useLocation();

// //   const [showChangePw, setShowChangePw] = useState(false);
// //   const [newPassword, setNewPassword] = useState("");
// //   const [confirmPassword, setConfirmPassword] = useState("");
// //   const [changingPassword, setChangingPassword] = useState(false);

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

// //   // Sidebar: staff ko sirf allowed modules dikhein; admin ko sab
// //   const visibleNav = nav.filter((item) => {
// //     if (item.adminOnly) return role === "admin";
// //     if (role === "admin") return true;
// //     if (item.module === "dashboard") return true; // sabko dashboard dikhega
// //     return canViewModule(item.module);
// //   });

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
// //     <Layout>
// //       <SEOHead title="Operations Console" description="Ankshaastra centralized operations admin." />
// //       <div className="min-h-screen bg-background">
// //         <div className="border-b border-border bg-gradient-to-r from-background via-card to-background">
// //           <div className="container mx-auto px-4 py-6 flex items-center gap-3">
// //             <Crown className="w-8 h-8 text-primary" />
// //             <div>
// //               <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Operations Console</h1>
// //               <p className="text-sm text-muted-foreground">Centralized communication, invoicing & automation</p>
// //             </div>
// //           </div>
// //         </div>
// //         <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 max-w-[1600px]">
// //           <aside className="lg:w-64 shrink-0 flex flex-col lg:sticky lg:top-24 lg:self-start">
// //             <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
// //               {visibleNav.map(({ to, end, label, icon: Icon }) => (
// //                 <NavLink
// //                   key={to}
// //                   to={to}
// //                   end={end}
// //                   className={({ isActive }) =>
// //                     cn(
// //                       "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors",
// //                       isActive
// //                         ? "bg-primary/15 text-primary border border-primary/30 font-medium"
// //                         : "text-muted-foreground hover:bg-muted hover:text-foreground"
// //                     )
// //                   }
// //                 >
// //                   <Icon className="w-4 h-4 shrink-0" />
// //                   {label}
// //                 </NavLink>
// //               ))}
// //             </nav>

// //             <div className="hidden lg:flex flex-col gap-1 mt-2 pt-4 border-t border-border">
// //               <button
// //                 onClick={() => setShowChangePw(true)}
// //                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
// //               >
// //                 <KeyRound className="w-4 h-4 shrink-0" />
// //                 Change Password
// //               </button>
// //               <button
// //                 onClick={handleSignOut}
// //                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
// //               >
// //                 <LogOut className="w-4 h-4 shrink-0" />
// //                 Sign Out
// //               </button>
// //             </div>

// //             <div className="flex lg:hidden gap-1 mt-2">
// //               <button
// //                 onClick={() => setShowChangePw(true)}
// //                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
// //               >
// //                 <KeyRound className="w-4 h-4 shrink-0" />
// //                 Change Password
// //               </button>
// //               <button
// //                 onClick={handleSignOut}
// //                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
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
// //     </Layout>
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
// //           <div className="container mx-auto px-4 py-6 flex items-center justify-between gap-3">
// //             <div className="flex items-center gap-3">
// //               <Crown className="w-8 h-8 text-primary" />
// //               <div>
// //                 <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Operations Console</h1>
// //                 <p className="text-sm text-muted-foreground">Centralized communication, invoicing & automation</p>
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
// //         <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 max-w-[1600px]">
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

// import { useState } from "react";
// import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
// import Layout from "@/components/layout/Layout";
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
// import { toast } from "sonner";
// import {
//   LayoutDashboard,
//   Package,
//   FileText,
//   Mail,
//   Users,
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
// } from "lucide-react";

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
//       { to: "/admin/pricing", label: "Pricing Management", icon: FileCode, module: "pricing" },
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

// const nav: NavItem[] = navSections.flatMap((s) => s.items);

// const AdminLayout = () => {
//   const { signOut, role, canViewModule } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [showChangePw, setShowChangePw] = useState(false);
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [changingPassword, setChangingPassword] = useState(false);

//   const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

//   const toggleSection = (label: string) => {
//     setCollapsedSections((prev) => ({ ...prev, [label]: !prev[label] }));
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

//   const visibleSections = navSections
//     .map((section) => ({
//       ...section,
//       items: section.items.filter((item) => {
//         if (item.adminOnly) return role === "admin";
//         if (role === "admin") return true;
//         if (item.module === "dashboard") return true;
//         return canViewModule(item.module);
//       }),
//     }))
//     .filter((section) => section.items.length > 0);

//   const currentNavItem = nav.find((item) =>
//     item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
//   );
//   const hasAccessToCurrentPage =
//     role === "admin" ||
//     !currentNavItem ||
//     currentNavItem.module === "dashboard" ||
//     canViewModule(currentNavItem.module);

//   return (
//     <Layout>
//       <SEOHead title="Operations Console" description="Ankshaastra centralized operations admin." />
//       <div className="min-h-screen bg-background">
//         <div className="border-b border-border bg-gradient-to-r from-background via-card to-background">
//           <div className="container mx-auto px-4 py-6 flex items-center gap-3">
//             <Crown className="w-8 h-8 text-primary" />
//             <div>
//               <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Operations Console</h1>
//               <p className="text-sm text-muted-foreground">Centralized communication, invoicing & automation</p>
//             </div>
//           </div>
//         </div>
//         <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 max-w-[1600px]">
//           <aside className="lg:w-64 shrink-0 flex flex-col lg:sticky lg:top-24 lg:self-start">
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

//             <div className="hidden lg:flex flex-col gap-1 mt-2 pt-4 border-t border-border">
//               <button
//                 onClick={() => setShowChangePw(true)}
//                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
//               >
//                 <KeyRound className="w-4 h-4 shrink-0" />
//                 Change Password
//               </button>
//               <button
//                 onClick={handleSignOut}
//                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
//               >
//                 <LogOut className="w-4 h-4 shrink-0" />
//                 Sign Out
//               </button>
//             </div>

//             <div className="flex lg:hidden gap-1 mt-2">
//               <button
//                 onClick={() => setShowChangePw(true)}
//                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
//               >
//                 <KeyRound className="w-4 h-4 shrink-0" />
//                 Change Password
//               </button>
//               <button
//                 onClick={handleSignOut}
//                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
//               >
//                 <LogOut className="w-4 h-4 shrink-0" />
//                 Sign Out
//               </button>
//             </div>
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
//     </Layout>
//   );
// };

// export default AdminLayout;

// import { useState } from "react";
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
// import { toast } from "sonner";
// import {
//   LayoutDashboard,
//   Package,
//   FileText,
//   Mail,
//   Users,
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
//       { to: "/admin/pricing", label: "Pricing Management", icon: FileCode, module: "pricing" },
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

//   const toggleSection = (label: string) => {
//     setCollapsedSections((prev) => ({ ...prev, [label]: !prev[label] }));
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
//           <div className="container mx-auto px-4 py-6 flex items-center justify-between gap-3">
//             <div className="flex items-center gap-3">
//               <Crown className="w-8 h-8 text-primary" />
//               <div>
//                 <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Operations Console</h1>
//                 <p className="text-sm text-muted-foreground">Centralized communication, invoicing & automation</p>
//               </div>
//             </div>
//             <button
//               onClick={handleSignOut}
//               className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
//             >
//               <LogOut className="w-4 h-4" />
//               Sign Out
//             </button>
//           </div>
//         </div>
//         <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 max-w-[1600px]">
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

//             <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-border">
//               <button
//                 onClick={() => setShowChangePw(true)}
//                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
//               >
//                 <KeyRound className="w-4 h-4 shrink-0" />
//                 Change Password
//               </button>
//               <button
//                 onClick={handleSignOut}
//                 className="flex sm:hidden items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
//               >
//                 <LogOut className="w-4 h-4 shrink-0" />
//                 Sign Out
//               </button>
//             </div>
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

import { useState } from "react";
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
import { toast } from "sonner";
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
  KeyRound,
  LogOut,
  Loader2,
  UserCog,
  ShieldAlert,
  ScanSearch,
  ChevronDown,
  ArrowLeft,
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
      { to: "/admin/pricing", label: "Pricing Management", icon: FileCode, module: "pricing" },
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

  const toggleSection = (label: string) => {
    setCollapsedSections((prev) => ({ ...prev, [label]: !prev[label] }));
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
          <div className="container mx-auto px-4 py-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <Crown className="w-8 h-8 text-primary" />
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Operations Console</h1>
                <p className="text-sm text-muted-foreground">Centralized communication, invoicing & automation</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 max-w-[1600px]">
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

            <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-border">
              <button
                onClick={() => setShowChangePw(true)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <KeyRound className="w-4 h-4 shrink-0" />
                Change Password
              </button>
              <button
                onClick={handleSignOut}
                className="flex sm:hidden items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Sign Out
              </button>
            </div>
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