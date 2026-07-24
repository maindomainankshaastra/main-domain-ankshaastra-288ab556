
// // // // //  import { useEffect, useState } from "react";
// // // // // import { Link } from "react-router-dom";
// // // // // import { supabase } from "@/integrations/supabase/client";
// // // // // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // // // // import { Button } from "@/components/ui/button";
// // // // // import { Badge } from "@/components/ui/badge";
// // // // // import { Package, FileText, Mail, Webhook, GitBranch, Download, Loader2 } from "lucide-react";
// // // // // import { fetchInvoiceDownloadUrl } from "@/lib/invoice-download";
// // // // // import { toast } from "sonner";
// // // // // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// // // // //   import {
// // // // //   PieChart,
// // // // //   Pie,
// // // // //   Cell,
// // // // //   Tooltip,
// // // // //   ResponsiveContainer,
// // // // //   Legend,
// // // // // } from "recharts";


// // // // //   type ServiceStat = {
// // // // //   name: string;
// // // // //   value: number;
// // // // //   revenue: number;
// // // // // };

// // // // // type DashboardStats = {
// // // // //   orders: number;
// // // // //   invoices: number;
// // // // //   revenue: number;
// // // // // };
// // // // //   type RecentInvoice = {
// // // // //   id: string;
// // // // //   invoice_number: string;
// // // // //   customer_name: string;
// // // // //   service_title: string;
// // // // //   total_amount: number;
// // // // //   status: string;
// // // // //   invoice_date: string;
// // // // //   pdf_url: string | null;
// // // // //   pdf_storage_path: string | null;
// // // // // };

// // // // // const AdminDashboard = () => {
// // // // //   const [stats, setStats] = useState({ orders: 0, invoices: 0, emails: 0, webhooks: 0, jobs: 0 });
// // // // //   const [viewType, setViewType] = useState<
// // // // //   "daily" | "weekly" | "monthly" | "yearly"
// // // // // >("monthly");

// // // // // const currentMonth = new Date().toISOString().slice(0, 7);

// // // // // const [selectedMonth, setSelectedMonth] = useState(currentMonth);

// // // // // const [dashboardStats, setDashboardStats] =
// // // // //   useState<DashboardStats>({
// // // // //     orders: 0,
// // // // //     invoices: 0,
// // // // //     revenue: 0,
// // // // //   });

// // // // // const [serviceStats, setServiceStats] =
// // // // //   useState<ServiceStat[]>([]);

// // // // // const COLORS = [
// // // // //   "#0088FE",
// // // // //   "#00C49F",
// // // // //   "#FFBB28",
// // // // //   "#FF8042",
// // // // //   "#A020F0",
// // // // //   "#F44336",
// // // // // ];

// // // // // const months = Array.from({ length: 24 }, (_, i) => {
// // // // //   const d = new Date();
// // // // //   d.setMonth(d.getMonth() - i);

// // // // //   return {
// // // // //     value: d.toISOString().slice(0, 7),
// // // // //     label: d.toLocaleDateString("en-IN", {
// // // // //       month: "short",
// // // // //       year: "numeric",
// // // // //     }),
// // // // //   };
// // // // // });
// // // // //   const [selectedMonth, setSelectedMonth] = useState(
    
// // // // //   new Date().toISOString().slice(0, 7)
// // // // // );
// // // // // const [viewType, setViewType] = useState("monthly");

// // // // // const [monthlyStats, setMonthlyStats] = useState({
// // // // //   const [serviceStats, setServiceStats] = useState<any[]>([]);
// // // // //   orders: 0,
// // // // //   invoices: 0,
// // // // //   revenue: 0,
// // // // // });
// // // // // const months = Array.from({ length: 24 }, (_, i) => {
// // // // //   const d = new Date();
// // // // //   d.setMonth(d.getMonth() - i);

// // // // //   return {
// // // // //     value: d.toISOString().slice(0, 7),
// // // // //     label: d.toLocaleDateString("en-IN", {
// // // // //       month: "short",
// // // // //       year: "numeric",
// // // // //     }),
// // // // //   };
// // // // // });
// // // // //   const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
// // // // //   const [downloadingId, setDownloadingId] = useState<string | null>(null);

// // // // //   useEffect(() => {
// // // // //     (async () => {
// // // // //       const start = `${selectedMonth}-01`;

// // // // // const endDate = new Date(start);
// // // // // endDate.setMonth(endDate.getMonth() + 1);

// // // // // const end = endDate.toISOString().slice(0, 10);

// // // // // const { data: monthlyOrders } = await supabase
// // // // //   .from("orders")
// // // // //   .select("total_amount, created_at")
// // // // //   .gte("created_at", start)
// // // // //   .lt("created_at", end);

// // // // // const { count: monthlyInvoices } = await supabase
// // // // //   .from("invoices")
// // // // //   .select("*", { count: "exact", head: true })
// // // // //   .gte("invoice_date", start)
// // // // //   .lt("invoice_date", end);

// // // // // setMonthlyStats({

// // // // //   const { data: services } = await supabase
// // // // //   .from("orders")
// // // // //   .select("service_title,total_amount,created_at");

// // // // // const grouped: any = {};

// // // // // services?.forEach((item) => {
// // // // //   if (!grouped[item.service_title]) {
// // // // //     grouped[item.service_title] = {
// // // // //       name: item.service_title,
// // // // //       value: 0,
// // // // //       revenue: 0,
// // // // //     };
// // // // //   }

// // // // //   grouped[item.service_title].value += 1;
// // // // //   grouped[item.service_title].revenue += Number(item.total_amount || 0);
// // // // // });

// // // // // setServiceStats(Object.values(grouped));
// // // // //   orders: monthlyOrders?.length || 0,
// // // // //   invoices: monthlyInvoices || 0,
// // // // //   revenue:
// // // // //     monthlyOrders?.reduce(
// // // // //       (sum, item) => sum + Number(item.total_amount || 0),
// // // // //       0
// // // // //     ) || 0,
// // // // // });
// // // // //       const tables = ["orders", "invoices", "email_logs", "webhooks_log", "automation_jobs"] as const;
// // // // //       const db = supabase as unknown as { from: (table: string) => ReturnType<typeof supabase.from> };
// // // // //       const results = await Promise.all(tables.map((t) => db.from(t).select("id", { count: "exact", head: true })));
// // // // //       setStats({
// // // // //         orders: results[0].count ?? 0,
// // // // //         invoices: results[1].count ?? 0,
// // // // //         emails: results[2].count ?? 0,
// // // // //         webhooks: results[3].count ?? 0,
// // // // //         jobs: results[4].count ?? 0,
// // // // //       });

// // // // //       const { data } = await supabase
// // // // //         .from("invoices")
// // // // //         .select("id, invoice_number, customer_name, service_title, total_amount, status, invoice_date, pdf_url, pdf_storage_path")
// // // // //         .order("invoice_date", { ascending: false })
// // // // //         .limit(5);
// // // // //       setRecentInvoices((data as RecentInvoice[]) || []);
// // // // //     })();
// // // // //   }, [selectedMonth]);

// // // // //   const downloadInvoice = async (inv: RecentInvoice) => {
// // // // //     setDownloadingId(inv.id);
// // // // //     try {
// // // // //       const url = (await fetchInvoiceDownloadUrl(inv.id)) || inv.pdf_url;
// // // // //       if (!url) {
// // // // //         toast.error("Invoice PDF is not available yet.");
// // // // //         return;
// // // // //       }
// // // // //       window.open(url, "_blank", "noopener,noreferrer");
// // // // //     } catch {
// // // // //       toast.error("Could not download invoice");
// // // // //     } finally {
// // // // //       setDownloadingId(null);
// // // // //     }
// // // // //   };
// // // // //   const COLORS = [
// // // // //   "#0088FE",
// // // // //   "#00C49F",
// // // // //   "#FFBB28",
// // // // //   "#FF8042",
// // // // //   "#A020F0",
// // // // //   "#F44336",
// // // // // ];

// // // // //   const cards = [
// // // // //     { label: "Orders", value: stats.orders, icon: Package, color: "text-amber-500" },
// // // // //     { label: "Invoices", value: stats.invoices, icon: FileText, color: "text-primary" },
// // // // //     { label: "Emails", value: stats.emails, icon: Mail, color: "text-blue-400" },
// // // // //     { label: "Webhooks", value: stats.webhooks, icon: Webhook, color: "text-purple-400" },
// // // // //     { label: "Automation Jobs", value: stats.jobs, icon: GitBranch, color: "text-rose-400" },
// // // // //   ];

// // // // //   return (
// // // // //     <div className="space-y-6">
// // // // //       <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-card to-background p-6">
// // // // //         <h2 className="font-display text-xl font-semibold text-foreground">Ankshaastra Operations Platform</h2>
// // // // //         <p className="text-muted-foreground mt-2 text-sm max-w-2xl">
// // // // //           Central hub for empower.ankshaastra.com, miraclebaby.ankshaastra.com, ankshaastra.com, and ankshaastra.in —
// // // // //           orders, GST invoices, email notifications, and workflow orchestration.
// // // // //         </p>
// // // // //         </div>
// // // // //       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
// // // // //   {cards.map(({ label, value, icon: Icon, color }) => (
// // // // //     <Card key={label}>
// // // // //       <CardHeader className="pb-2">
// // // // //         <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
// // // // //           <Icon className={`w-4 h-4 ${color}`} />
// // // // //           {label}
// // // // //         </CardTitle>
// // // // //       </CardHeader>

// // // // //       <CardContent>
// // // // //         <p className="text-3xl font-bold font-display">
// // // // //           {value}
// // // // //         </p>
// // // // //       </CardContent>
// // // // //     </Card>
// // // // //   ))}
// // // // // </div>
      

// // // // //     <Card>
// // // // //       <CardHeader>
// // // // //         <CardTitle>Monthly Dashboard</CardTitle>
// // // // //       </CardHeader>

// // // // //       <CardContent>

// // // // //         <div className="mb-5 w-60">
// // // // //           <Select
// // // // //             value={selectedMonth}
// // // // //             onValueChange={setSelectedMonth}
// // // // //           >
// // // // //             <SelectTrigger>
// // // // //               <SelectValue />
// // // // //             </SelectTrigger>
// // // // //             <SelectContent>
// // // // //   {months.map((month) => (
// // // // //     <SelectItem
// // // // //       key={month.value}
// // // // //       value={month.value}
// // // // //     >
// // // // //       {month.label}
// // // // //     </SelectItem>
// // // // //   ))}
// // // // // </SelectContent>

            
// // // // //           </Select>
// // // // //         </div>

// // // // //         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

// // // // //           <Card>
// // // // //             <CardContent className="pt-6">
// // // // //               <div className="text-sm">Orders</div>
// // // // //               <div className="text-3xl font-bold">{monthlyStats.orders}</div>
// // // // //             </CardContent>
// // // // //           </Card>

// // // // //           <Card>
// // // // //             <CardContent className="pt-6">
// // // // //               <div className="text-sm">Invoices</div>
// // // // //               <div className="text-3xl font-bold">{monthlyStats.invoices}</div>
// // // // //             </CardContent>
// // // // //           </Card>

// // // // //           <Card>
// // // // //             <CardContent className="pt-6">
// // // // //               <div className="text-sm">Revenue</div>
// // // // //               <div className="text-3xl font-bold">
// // // // //                 ₹{monthlyStats.revenue.toLocaleString()}
// // // // //               </div>
// // // // //             </CardContent>
// // // // //           </Card>

// // // // //         </div>

// // // // //       </CardContent>
// // // // //     </Card>


// // // // //       <Card>
// // // // //         <CardHeader className="flex flex-row items-center justify-between pb-2">
// // // // //           <CardTitle className="text-base font-medium">Recent Invoices</CardTitle>
// // // // //           <Button asChild variant="outline" size="sm">
// // // // //             <Link to="/admin/invoices">View all</Link>
// // // // //           </Button>
// // // // //         </CardHeader>
// // // // //         <CardContent>
// // // // //           {recentInvoices.length === 0 ? (
// // // // //             <p className="text-sm text-muted-foreground py-4 text-center">No invoices generated yet.</p>
// // // // //           ) : (
// // // // //             <div className="space-y-2">
// // // // //               {recentInvoices.map((inv) => (
// // // // //                 <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 border border-border rounded-lg p-3">
// // // // //                   <div>
// // // // //                     <p className="font-semibold text-sm text-primary">{inv.invoice_number}</p>
// // // // //                     <p className="text-xs text-muted-foreground">{inv.customer_name} · {inv.service_title}</p>
// // // // //                   </div>
// // // // //                   <div className="flex items-center gap-2">
// // // // //                     <span className="text-sm font-semibold">₹{Number(inv.total_amount).toLocaleString()}</span>
// // // // //                     <Badge variant="secondary" className="text-xs">{inv.status}</Badge>
// // // // //                     {(inv.pdf_storage_path || inv.pdf_url) && (
// // // // //                       <Button
// // // // //                         size="sm"
// // // // //                         variant="outline"
// // // // //                         disabled={downloadingId === inv.id}
// // // // //                         onClick={() => downloadInvoice(inv)}
// // // // //                       >
// // // // //                         {downloadingId === inv.id ? (
// // // // //                           <Loader2 className="w-4 h-4 animate-spin" />
// // // // //                         ) : (
// // // // //                           <Download className="w-4 h-4" />
// // // // //                         )}
// // // // //                       </Button>
// // // // //                     )}
// // // // //                   </div>
// // // // //                 </div>
// // // // //               ))}
// // // // //             </div>
// // // // //           )}
// // // // //         </CardContent>
// // // // //       </Card>
// // // // //       <Card>
// // // // //   <CardHeader>
// // // // //     <CardTitle>Service Wise Analytics</CardTitle>
// // // // //   </CardHeader>

// // // // //   <CardContent>

// // // // //     <div className="grid md:grid-cols-2 gap-6">

// // // // //       <ResponsiveContainer width="100%" height={300}>
// // // // //         <PieChart>
// // // // //           <Pie
// // // // //             data={serviceStats}
// // // // //             dataKey="value"
// // // // //             nameKey="name"
// // // // //             outerRadius={100}
// // // // //             label
// // // // //           >
// // // // //             {serviceStats.map((entry, index) => (
// // // // //               <Cell
// // // // //                 key={index}
// // // // //                 fill={COLORS[index % COLORS.length]}
// // // // //               />
// // // // //             ))}
// // // // //           </Pie>

// // // // //           <Tooltip />
// // // // //           <Legend />
// // // // //         </PieChart>
// // // // //       </ResponsiveContainer>

// // // // //       <div className="space-y-3">

// // // // //         {serviceStats.map((item) => (

// // // // //           <div
// // // // //             key={item.name}
// // // // //             className="border rounded-lg p-3 flex justify-between"
// // // // //           >
// // // // //             <div>
// // // // //               <div className="font-semibold">
// // // // //                 {item.name}
// // // // //               </div>

// // // // //               <div className="text-sm text-gray-500">
// // // // //                 Orders : {item.value}
// // // // //               </div>
// // // // //             </div>

// // // // //             <div className="font-bold">
// // // // //               ₹{item.revenue.toLocaleString()}
// // // // //             </div>
// // // // //           </div>

// // // // //         ))}

// // // // //       </div>

// // // // //     </div>

// // // // //   </CardContent>
// // // // // </Card>
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default AdminDashboard;


// // // // import { useEffect, useState } from "react";
// // // // import { Link } from "react-router-dom";
// // // // import { supabase } from "@/integrations/supabase/client";
// // // // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // // // import { Button } from "@/components/ui/button";
// // // // import { Badge } from "@/components/ui/badge";
// // // // import { Package, FileText, Mail, Webhook, GitBranch, Download, Loader2 } from "lucide-react";
// // // // import { fetchInvoiceDownloadUrl } from "@/lib/invoice-download";
// // // // import { toast } from "sonner";
// // // // import { Input } from "@/components/ui/input";
// // // // import { Label } from "@/components/ui/label";
// // // // import { KeyRound } from "lucide-react";
// // // // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// // // // import {
// // // //   PieChart,
// // // //   Pie,
// // // //   Cell,
// // // //   Tooltip,
// // // //   ResponsiveContainer,
// // // //   Legend,
// // // // } from "recharts";

// // // // type ViewType = "daily" | "weekly" | "monthly" | "yearly";

// // // // type ServiceStat = {
// // // //   name: string;
// // // //   value: number;
// // // //   revenue: number;
// // // // };

// // // // type DashboardStats = {
// // // //   orders: number;
// // // //   invoices: number;
// // // //   revenue: number;
// // // // };

// // // // type RecentInvoice = {
// // // //   id: string;
// // // //   invoice_number: string;
// // // //   customer_name: string;
// // // //   service_title: string;
// // // //   total_amount: number;
// // // //   status: string;
// // // //   invoice_date: string;
// // // //   pdf_url: string | null;
// // // //   pdf_storage_path: string | null;
// // // // };

// // // // const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0", "#F44336"];

// // // // // ---- Helper: viewType + selectedMonth se start/end date range nikalta hai ----
// // // // function getDateRange(viewType: ViewType, selectedMonth: string) {
// // // //   const [yearStr, monthStr] = selectedMonth.split("-");
// // // //   const year = Number(yearStr);
// // // //   const month = Number(monthStr) - 1; // JS months 0-indexed

// // // //   let start: Date;
// // // //   let end: Date;

// // // //   switch (viewType) {
// // // //     case "daily": {
// // // //       // "Daily" view = poora selected month, day-by-day breakdown ke liye base range
// // // //       start = new Date(year, month, 1);
// // // //       end = new Date(year, month + 1, 1);
// // // //       break;
// // // //     }
// // // //     case "weekly": {
// // // //       // Selected month ka range, weekly grouping ke liye
// // // //       start = new Date(year, month, 1);
// // // //       end = new Date(year, month + 1, 1);
// // // //       break;
// // // //     }
// // // //     case "monthly": {
// // // //       start = new Date(year, month, 1);
// // // //       end = new Date(year, month + 1, 1);
// // // //       break;
// // // //     }
// // // //     case "yearly": {
// // // //       start = new Date(year, 0, 1);
// // // //       end = new Date(year + 1, 0, 1);
// // // //       break;
// // // //     }
// // // //   }

// // // //   return {
// // // //     startISO: start.toISOString().slice(0, 10),
// // // //     endISO: end.toISOString().slice(0, 10),
// // // //   };
// // // // }

// // // // const AdminDashboard = () => {
// // // //   // ---- Top summary cards (all-time totals) ----
// // // //   const [stats, setStats] = useState({ orders: 0, invoices: 0, emails: 0, webhooks: 0, jobs: 0 });

// // // //   // ---- Filter controls ----
// // // //   const [viewType, setViewType] = useState<ViewType>("monthly");
// // // //   const currentMonth = new Date().toISOString().slice(0, 7);
// // // //   const [selectedMonth, setSelectedMonth] = useState(currentMonth);

// // // //   // ---- Period-filtered stats ----
// // // //   const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
// // // //     orders: 0,
// // // //     invoices: 0,
// // // //     revenue: 0,
// // // //   });
// // // //   const [serviceStats, setServiceStats] = useState<ServiceStat[]>([]);

// // // //   // ---- Recent invoices table ----
// // // //   const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
// // // //   const [downloadingId, setDownloadingId] = useState<string | null>(null);

// // // //   const months = Array.from({ length: 24 }, (_, i) => {
// // // //     const d = new Date();
// // // //     d.setMonth(d.getMonth() - i);
// // // //     return {
// // // //       value: d.toISOString().slice(0, 7),
// // // //       label: d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
// // // //     };
// // // //   });

// // // //   // ---- Fetch top summary cards (all-time, runs once) ----
// // // //   useEffect(() => {
// // // //     (async () => {
// // // //       const tables = ["orders", "invoices", "email_logs", "webhooks_log", "automation_jobs"] as const;
// // // //       const db = supabase as unknown as { from: (table: string) => ReturnType<typeof supabase.from> };
// // // //       const results = await Promise.all(tables.map((t) => db.from(t).select("id", { count: "exact", head: true })));
// // // //       setStats({
// // // //         orders: results[0].count ?? 0,
// // // //         invoices: results[1].count ?? 0,
// // // //         emails: results[2].count ?? 0,
// // // //         webhooks: results[3].count ?? 0,
// // // //         jobs: results[4].count ?? 0,
// // // //       });

// // // //       const { data } = await supabase
// // // //         .from("invoices")
// // // //         .select("id, invoice_number, customer_name, service_title, total_amount, status, invoice_date, pdf_url, pdf_storage_path")
// // // //         .order("invoice_date", { ascending: false })
// // // //         .limit(5);
// // // //       setRecentInvoices((data as RecentInvoice[]) || []);
// // // //     })();
// // // //   }, []);

// // // //   // ---- Fetch period-filtered stats + service-wise breakdown ----
// // // //   useEffect(() => {
// // // //     (async () => {
// // // //       const { startISO, endISO } = getDateRange(viewType, selectedMonth);

// // // //       const { data: periodOrders } = await supabase
// // // //         .from("orders")
// // // //         .select("service_title, total_amount, created_at")
// // // //         .gte("created_at", startISO)
// // // //         .lt("created_at", endISO);

// // // //       const { count: periodInvoices } = await supabase
// // // //         .from("invoices")
// // // //         .select("*", { count: "exact", head: true })
// // // //         .gte("invoice_date", startISO)
// // // //         .lt("invoice_date", endISO);

// // // //       setDashboardStats({
// // // //         orders: periodOrders?.length || 0,
// // // //         invoices: periodInvoices || 0,
// // // //         revenue: periodOrders?.reduce((sum, item) => sum + Number(item.total_amount || 0), 0) || 0,
// // // //       });

// // // //       // Service-wise bifurcation, filtered to the same date range
// // // //       const grouped: Record<string, ServiceStat> = {};
// // // //       periodOrders?.forEach((item) => {
// // // //         const key = item.service_title || "Other";
// // // //         if (!grouped[key]) {
// // // //           grouped[key] = { name: key, value: 0, revenue: 0 };
// // // //         }
// // // //         grouped[key].value += 1;
// // // //         grouped[key].revenue += Number(item.total_amount || 0);
// // // //       });
// // // //       setServiceStats(Object.values(grouped));
// // // //     })();
// // // //   }, [viewType, selectedMonth]);

// // // //   const downloadInvoice = async (inv: RecentInvoice) => {
// // // //     setDownloadingId(inv.id);
// // // //     try {
// // // //       const url = (await fetchInvoiceDownloadUrl(inv.id)) || inv.pdf_url;
// // // //       if (!url) {
// // // //         toast.error("Invoice PDF is not available yet.");
// // // //         return;
// // // //       }
// // // //       window.open(url, "_blank", "noopener,noreferrer");
// // // //     } catch {
// // // //       toast.error("Could not download invoice");
// // // //     } finally {
// // // //       setDownloadingId(null);
// // // //     }
// // // //   };

// // // //   const cards = [
// // // //     { label: "Orders", value: stats.orders, icon: Package, color: "text-amber-500" },
// // // //     { label: "Invoices", value: stats.invoices, icon: FileText, color: "text-primary" },
// // // //     { label: "Emails", value: stats.emails, icon: Mail, color: "text-blue-400" },
// // // //     { label: "Webhooks", value: stats.webhooks, icon: Webhook, color: "text-purple-400" },
// // // //     { label: "Automation Jobs", value: stats.jobs, icon: GitBranch, color: "text-rose-400" },
// // // //   ];

// // // //   return (
// // // //     <div className="space-y-6">
// // // //       <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-card to-background p-6">
// // // //         <h2 className="font-display text-xl font-semibold text-foreground">Ankshaastra Operations Platform</h2>
// // // //         <p className="text-muted-foreground mt-2 text-sm max-w-2xl">
// // // //           Central hub for empower.ankshaastra.com, miraclebaby.ankshaastra.com, ankshaastra.com, and ankshaastra.in —
// // // //           orders, GST invoices, email notifications, and workflow orchestration.
// // // //         </p>
// // // //       </div>

// // // //       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
// // // //         {cards.map(({ label, value, icon: Icon, color }) => (
// // // //           <Card key={label}>
// // // //             <CardHeader className="pb-2">
// // // //               <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
// // // //                 <Icon className={`w-4 h-4 ${color}`} />
// // // //                 {label}
// // // //               </CardTitle>
// // // //             </CardHeader>
// // // //             <CardContent>
// // // //               <p className="text-3xl font-bold font-display">{value}</p>
// // // //             </CardContent>
// // // //           </Card>
// // // //         ))}
// // // //       </div>

// // // //       <Card>
// // // //         <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
// // // //           <CardTitle>Period Dashboard</CardTitle>
// // // //           <div className="flex items-center gap-3 flex-wrap">
// // // //             <Select value={viewType} onValueChange={(v) => setViewType(v as ViewType)}>
// // // //               <SelectTrigger className="w-36">
// // // //                 <SelectValue />
// // // //               </SelectTrigger>
// // // //               <SelectContent>
// // // //                 <SelectItem value="daily">Daily</SelectItem>
// // // //                 <SelectItem value="weekly">Weekly</SelectItem>
// // // //                 <SelectItem value="monthly">Monthly</SelectItem>
// // // //                 <SelectItem value="yearly">Yearly</SelectItem>
// // // //               </SelectContent>
// // // //             </Select>

// // // //             <Select value={selectedMonth} onValueChange={setSelectedMonth}>
// // // //               <SelectTrigger className="w-40">
// // // //                 <SelectValue />
// // // //               </SelectTrigger>
// // // //               <SelectContent>
// // // //                 {months.map((month) => (
// // // //                   <SelectItem key={month.value} value={month.value}>
// // // //                     {month.label}
// // // //                   </SelectItem>
// // // //                 ))}
// // // //               </SelectContent>
// // // //             </Select>
// // // //           </div>
// // // //         </CardHeader>

// // // //         <CardContent>
// // // //           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// // // //             <Card>
// // // //               <CardContent className="pt-6">
// // // //                 <div className="text-sm">Orders</div>
// // // //                 <div className="text-3xl font-bold">{dashboardStats.orders}</div>
// // // //               </CardContent>
// // // //             </Card>

// // // //             <Card>
// // // //               <CardContent className="pt-6">
// // // //                 <div className="text-sm">Invoices</div>
// // // //                 <div className="text-3xl font-bold">{dashboardStats.invoices}</div>
// // // //               </CardContent>
// // // //             </Card>

// // // //             <Card>
// // // //               <CardContent className="pt-6">
// // // //                 <div className="text-sm">Revenue</div>
// // // //                 <div className="text-3xl font-bold">₹{dashboardStats.revenue.toLocaleString()}</div>
// // // //               </CardContent>
// // // //             </Card>
// // // //           </div>
// // // //         </CardContent>
// // // //       </Card>

// // // //       <Card>
// // // //         <CardHeader className="flex flex-row items-center justify-between pb-2">
// // // //           <CardTitle className="text-base font-medium">Recent Invoices</CardTitle>
// // // //           <Button asChild variant="outline" size="sm">
// // // //             <Link to="/admin/invoices">View all</Link>
// // // //           </Button>
// // // //         </CardHeader>
// // // //         <CardContent>
// // // //           {recentInvoices.length === 0 ? (
// // // //             <p className="text-sm text-muted-foreground py-4 text-center">No invoices generated yet.</p>
// // // //           ) : (
// // // //             <div className="space-y-2">
// // // //               {recentInvoices.map((inv) => (
// // // //                 <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 border border-border rounded-lg p-3">
// // // //                   <div>
// // // //                     <p className="font-semibold text-sm text-primary">{inv.invoice_number}</p>
// // // //                     <p className="text-xs text-muted-foreground">{inv.customer_name} · {inv.service_title}</p>
// // // //                   </div>
// // // //                   <div className="flex items-center gap-2">
// // // //                     <span className="text-sm font-semibold">₹{Number(inv.total_amount).toLocaleString()}</span>
// // // //                     <Badge variant="secondary" className="text-xs">{inv.status}</Badge>
// // // //                     {(inv.pdf_storage_path || inv.pdf_url) && (
// // // //                       <Button
// // // //                         size="sm"
// // // //                         variant="outline"
// // // //                         disabled={downloadingId === inv.id}
// // // //                         onClick={() => downloadInvoice(inv)}
// // // //                       >
// // // //                         {downloadingId === inv.id ? (
// // // //                           <Loader2 className="w-4 h-4 animate-spin" />
// // // //                         ) : (
// // // //                           <Download className="w-4 h-4" />
// // // //                         )}
// // // //                       </Button>
// // // //                     )}
// // // //                   </div>
// // // //                 </div>
// // // //               ))}
// // // //             </div>
// // // //           )}
// // // //         </CardContent>
// // // //       </Card>

// // // //       <Card>
// // // //         <CardHeader>
// // // //           <CardTitle>Service Wise Analytics</CardTitle>
// // // //         </CardHeader>
// // // //         <CardContent>
// // // //           {serviceStats.length === 0 ? (
// // // //             <p className="text-sm text-muted-foreground py-4 text-center">No data for this period.</p>
// // // //           ) : (
// // // //             <div className="grid md:grid-cols-2 gap-6">
// // // //               <ResponsiveContainer width="100%" height={300}>
// // // //                 <PieChart>
// // // //                   <Pie data={serviceStats} dataKey="value" nameKey="name" outerRadius={100} label>
// // // //                     {serviceStats.map((entry, index) => (
// // // //                       <Cell key={index} fill={COLORS[index % COLORS.length]} />
// // // //                     ))}
// // // //                   </Pie>
// // // //                   <Tooltip />
// // // //                   <Legend />
// // // //                 </PieChart>
// // // //               </ResponsiveContainer>

// // // //               <div className="space-y-3">
// // // //                 {serviceStats.map((item) => (
// // // //                   <div key={item.name} className="border rounded-lg p-3 flex justify-between">
// // // //                     <div>
// // // //                       <div className="font-semibold">{item.name}</div>
// // // //                       <div className="text-sm text-gray-500">Orders : {item.value}</div>
// // // //                     </div>
// // // //                     <div className="font-bold">₹{item.revenue.toLocaleString()}</div>
// // // //                   </div>
// // // //                 ))}
// // // //               </div>
// // // //             </div>
// // // //           )}
// // // //         </CardContent>
// // // //       </Card>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default AdminDashboard;


// // import { useEffect, useState } from "react";
// // import { Link } from "react-router-dom";
// // import { supabase } from "@/integrations/supabase/client";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { Badge } from "@/components/ui/badge";
// // import { Package, FileText, Mail, Webhook, GitBranch, Download, Loader2, KeyRound } from "lucide-react";
// // import { fetchInvoiceDownloadUrl } from "@/lib/invoice-download";
// // import { toast } from "sonner";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// // import {
// //   BarChart,
// //   Bar,
// //   XAxis,
// //   YAxis,
// //   Cell,
// //   Tooltip,
// //   ResponsiveContainer,
// // } from "recharts";

// // type ViewType = "daily" | "weekly" | "monthly" | "yearly";

// // type ServiceStat = {
// //   name: string;
// //   value: number;
// //   revenue: number;
// // };

// // type DashboardStats = {
// //   orders: number;
// //   invoices: number;
// //   revenue: number;
// // };

// // type RecentInvoice = {
// //   id: string;
// //   invoice_number: string;
// //   customer_name: string;
// //   service_title: string;
// //   total_amount: number;
// //   status: string;
// //   invoice_date: string;
// //   pdf_url: string | null;
// //   pdf_storage_path: string | null;
// // };

// // const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0", "#F44336"];

// // function getDateRange(viewType: ViewType, selectedMonth: string) {
// //   const [yearStr, monthStr] = selectedMonth.split("-");
// //   const year = Number(yearStr);
// //   const month = Number(monthStr) - 1;

// //   let start: Date;
// //   let end: Date;

// //   switch (viewType) {
// //     case "daily": {
// //       start = new Date(year, month, 1);
// //       end = new Date(year, month + 1, 1);
// //       break;
// //     }
// //     case "weekly": {
// //       start = new Date(year, month, 1);
// //       end = new Date(year, month + 1, 1);
// //       break;
// //     }
// //     case "monthly": {
// //       start = new Date(year, month, 1);
// //       end = new Date(year, month + 1, 1);
// //       break;
// //     }
// //     case "yearly": {
// //       start = new Date(year, 0, 1);
// //       end = new Date(year + 1, 0, 1);
// //       break;
// //     }
// //   }

// //   return {
// //     startISO: start.toISOString().slice(0, 10),
// //     endISO: end.toISOString().slice(0, 10),
// //   };
// // }

// // const AdminDashboard = () => {
// //   const [stats, setStats] = useState({ orders: 0, invoices: 0, emails: 0, webhooks: 0, jobs: 0 });

// //   const [viewType, setViewType] = useState<ViewType>("monthly");
// //   const currentMonth = new Date().toISOString().slice(0, 7);
// //   const [selectedMonth, setSelectedMonth] = useState(currentMonth);

// //   const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
// //     orders: 0,
// //     invoices: 0,
// //     revenue: 0,
// //   });
// //   const [serviceStats, setServiceStats] = useState<ServiceStat[]>([]);

// //   const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
// //   const [downloadingId, setDownloadingId] = useState<string | null>(null);

// //   const months = Array.from({ length: 24 }, (_, i) => {
// //     const d = new Date();
// //     d.setMonth(d.getMonth() - i);
// //     return {
// //       value: d.toISOString().slice(0, 7),
// //       label: d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
// //     };
// //   });

// //   useEffect(() => {
// //     (async () => {
// //       const tables = ["orders", "invoices", "email_logs", "webhooks_log", "automation_jobs"] as const;
// //       const db = supabase as unknown as { from: (table: string) => ReturnType<typeof supabase.from> };
// //       const results = await Promise.all(tables.map((t) => db.from(t).select("id", { count: "exact", head: true })));
// //       setStats({
// //         orders: results[0].count ?? 0,
// //         invoices: results[1].count ?? 0,
// //         emails: results[2].count ?? 0,
// //         webhooks: results[3].count ?? 0,
// //         jobs: results[4].count ?? 0,
// //       });

// //       const { data } = await supabase
// //         .from("invoices")
// //         .select("id, invoice_number, customer_name, service_title, total_amount, status, invoice_date, pdf_url, pdf_storage_path")
// //         .order("invoice_date", { ascending: false })
// //         .limit(5);
// //       setRecentInvoices((data as RecentInvoice[]) || []);
// //     })();
// //   }, []);

// //   useEffect(() => {
// //     (async () => {
// //       const { startISO, endISO } = getDateRange(viewType, selectedMonth);

// //       const { data: periodOrders } = await supabase
// //         .from("orders")
// //         .select("service_title, total_amount, created_at")
// //         .gte("created_at", startISO)
// //         .lt("created_at", endISO);

// //       const { count: periodInvoices } = await supabase
// //         .from("invoices")
// //         .select("*", { count: "exact", head: true })
// //         .gte("invoice_date", startISO)
// //         .lt("invoice_date", endISO);

// //       setDashboardStats({
// //         orders: periodOrders?.length || 0,
// //         invoices: periodInvoices || 0,
// //         revenue: periodOrders?.reduce((sum, item) => sum + Number(item.total_amount || 0), 0) || 0,
// //       });

// //       const grouped: Record<string, ServiceStat> = {};
// //       periodOrders?.forEach((item) => {
// //         const key = item.service_title || "Other";
// //         if (!grouped[key]) {
// //           grouped[key] = { name: key, value: 0, revenue: 0 };
// //         }
// //         grouped[key].value += 1;
// //         grouped[key].revenue += Number(item.total_amount || 0);
// //       });
// //       setServiceStats(Object.values(grouped));
// //     })();
// //   }, [viewType, selectedMonth]);

// //   const downloadInvoice = async (inv: RecentInvoice) => {
// //     setDownloadingId(inv.id);
// //     try {
// //       const url = (await fetchInvoiceDownloadUrl(inv.id)) || inv.pdf_url;
// //       if (!url) {
// //         toast.error("Invoice PDF is not available yet.");
// //         return;
// //       }
// //       window.open(url, "_blank", "noopener,noreferrer");
// //     } catch {
// //       toast.error("Could not download invoice");
// //     } finally {
// //       setDownloadingId(null);
// //     }
// //   };

// //   const cards = [
// //     { label: "Orders", value: stats.orders, icon: Package, color: "text-amber-500" },
// //     { label: "Invoices", value: stats.invoices, icon: FileText, color: "text-primary" },
// //     { label: "Emails", value: stats.emails, icon: Mail, color: "text-blue-400" },
// //     { label: "Webhooks", value: stats.webhooks, icon: Webhook, color: "text-purple-400" },
// //     { label: "Automation Jobs", value: stats.jobs, icon: GitBranch, color: "text-rose-400" },
// //   ];

// //   const avgOrderValue =
// //     dashboardStats.orders > 0 ? Math.round(dashboardStats.revenue / dashboardStats.orders) : 0;

// //   const sortedServiceStats = [...serviceStats].sort((a, b) => b.revenue - a.revenue);

// //   return (
// //     <div className="space-y-6">
// //       <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-card to-background p-6">
// //         <h2 className="font-display text-xl font-semibold text-foreground">Ankshaastra Operations Platform</h2>
// //         <p className="text-muted-foreground mt-2 text-sm max-w-2xl">
// //           Central hub for empower.ankshaastra.com, miraclebaby.ankshaastra.com, ankshaastra.com, and ankshaastra.in —
// //           orders, GST invoices, email notifications, and workflow orchestration.
// //         </p>
// //       </div>

// //       {/* All-time overview — intentionally labeled and visually separated from the
// //           period-filtered section below, since these are all-time counts, not
// //           scoped to the Monthly/Yearly + month selector further down. */}
// //       <div className="space-y-3">
// //         <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
// //           Overview (All-Time)
// //         </h3>
// //         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
// //           {cards.map(({ label, value, icon: Icon, color }) => (
// //             <Card key={label}>
// //               <CardHeader className="pb-2">
// //                 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
// //                   <Icon className={`w-4 h-4 ${color}`} />
// //                   {label}
// //                 </CardTitle>
// //               </CardHeader>
// //               <CardContent>
// //                 <p className="text-3xl font-bold font-display">{value}</p>
// //               </CardContent>
// //             </Card>
// //           ))}
// //         </div>
// //       </div>

// //       <Card>
// //         <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
// //           <CardTitle className="flex items-center gap-2">
// //             Period Dashboard
// //             <span className="text-xs font-normal text-muted-foreground">
// //               (filtered by selection below)
// //             </span>
// //           </CardTitle>
// //           <div className="flex items-center gap-3 flex-wrap">
// //             <Select value={viewType} onValueChange={(v) => setViewType(v as ViewType)}>
// //               <SelectTrigger className="w-36">
// //                 <SelectValue />
// //               </SelectTrigger>
// //               <SelectContent>
// //                 <SelectItem value="daily">Daily</SelectItem>
// //                 <SelectItem value="weekly">Weekly</SelectItem>
// //                 <SelectItem value="monthly">Monthly</SelectItem>
// //                 <SelectItem value="yearly">Yearly</SelectItem>
// //               </SelectContent>
// //             </Select>

// //             <Select value={selectedMonth} onValueChange={setSelectedMonth}>
// //               <SelectTrigger className="w-40">
// //                 <SelectValue />
// //               </SelectTrigger>
// //               <SelectContent>
// //                 {months.map((month) => (
// //                   <SelectItem key={month.value} value={month.value}>
// //                     {month.label}
// //                   </SelectItem>
// //                 ))}
// //               </SelectContent>
// //             </Select>
// //           </div>
// //         </CardHeader>

// //         <CardContent>
// //           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
// //             <Card>
// //               <CardContent className="pt-6">
// //                 <div className="text-sm">Orders</div>
// //                 <div className="text-3xl font-bold">{dashboardStats.orders}</div>
// //               </CardContent>
// //             </Card>

// //             <Card>
// //               <CardContent className="pt-6">
// //                 <div className="text-sm">Invoices</div>
// //                 <div className="text-3xl font-bold">{dashboardStats.invoices}</div>
// //               </CardContent>
// //             </Card>

// //             <Card>
// //               <CardContent className="pt-6">
// //                 <div className="text-sm">Revenue</div>
// //                 <div className="text-3xl font-bold">₹{dashboardStats.revenue.toLocaleString()}</div>
// //               </CardContent>
// //             </Card>

// //             <Card>
// //               <CardContent className="pt-6">
// //                 <div className="text-sm">Avg Order Value</div>
// //                 <div className="text-3xl font-bold">₹{avgOrderValue.toLocaleString()}</div>
// //               </CardContent>
// //             </Card>
// //           </div>
// //         </CardContent>
// //       </Card>

// //       <Card>
// //         <CardHeader className="flex flex-row items-center justify-between pb-2">
// //           <CardTitle className="text-base font-medium">Recent Invoices</CardTitle>
// //           <Button asChild variant="outline" size="sm">
// //             <Link to="/admin/invoices">View all</Link>
// //           </Button>
// //         </CardHeader>
// //         <CardContent>
// //           {recentInvoices.length === 0 ? (
// //             <p className="text-sm text-muted-foreground py-4 text-center">No invoices generated yet.</p>
// //           ) : (
// //             <div className="space-y-2">
// //               {recentInvoices.map((inv) => (
// //                 <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 border border-border rounded-lg p-3">
// //                   <div>
// //                     <p className="font-semibold text-sm text-primary">{inv.invoice_number}</p>
// //                     <p className="text-xs text-muted-foreground">{inv.customer_name} · {inv.service_title}</p>
// //                   </div>
// //                   <div className="flex items-center gap-2">
// //                     <span className="text-sm font-semibold">₹{Number(inv.total_amount).toLocaleString()}</span>
// //                     <Badge variant="secondary" className="text-xs">{inv.status}</Badge>
// //                     {(inv.pdf_storage_path || inv.pdf_url) && (
// //                       <Button
// //                         size="sm"
// //                         variant="outline"
// //                         disabled={downloadingId === inv.id}
// //                         onClick={() => downloadInvoice(inv)}
// //                       >
// //                         {downloadingId === inv.id ? (
// //                           <Loader2 className="w-4 h-4 animate-spin" />
// //                         ) : (
// //                           <Download className="w-4 h-4" />
// //                         )}
// //                       </Button>
// //                     )}
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           )}
// //         </CardContent>
// //       </Card>

// //       <Card>
// //         <CardHeader>
// //           <CardTitle>Service Wise Analytics</CardTitle>
// //         </CardHeader>
// //         <CardContent>
// //           {serviceStats.length === 0 ? (
// //             <p className="text-sm text-muted-foreground py-4 text-center">No data for this period.</p>
// //           ) : (
// //             <div className="grid md:grid-cols-2 gap-6">
// //               {/* Horizontal bar chart, sorted by revenue — replaces the pie chart,
// //                   which had overlapping labels and required decoding a 6-color legend. */}
// //               <ResponsiveContainer width="100%" height={Math.max(300, sortedServiceStats.length * 45)}>
// //                 <BarChart
// //                   data={sortedServiceStats}
// //                   layout="vertical"
// //                   margin={{ top: 5, right: 30, bottom: 5, left: 20 }}
// //                 >
// //                   <XAxis type="number" hide />
// //                   <YAxis
// //                     type="category"
// //                     dataKey="name"
// //                     width={150}
// //                     tick={{ fontSize: 12 }}
// //                   />
// //                   <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
// //                   <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
// //                     {sortedServiceStats.map((entry, index) => (
// //                       <Cell key={index} fill={COLORS[index % COLORS.length]} />
// //                     ))}
// //                   </Bar>
// //                 </BarChart>
// //               </ResponsiveContainer>

// //               <div className="space-y-3">
// //                 {sortedServiceStats.map((item) => (
// //                   <div key={item.name} className="border rounded-lg p-3 flex justify-between">
// //                     <div>
// //                       <div className="font-semibold">{item.name}</div>
// //                       <div className="text-sm text-gray-500">Orders : {item.value}</div>
// //                     </div>
// //                     <div className="font-bold">₹{item.revenue.toLocaleString()}</div>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           )}
// //         </CardContent>
// //       </Card>
// //     </div>
// //   );
// // };

// // export default AdminDashboard;

// // import { useEffect, useState } from "react";
// // import { Link } from "react-router-dom";
// // import { supabase } from "@/integrations/supabase/client";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { Badge } from "@/components/ui/badge";
// // import { Package, FileText, Mail, Webhook, GitBranch, Download, Loader2, KeyRound } from "lucide-react";
// // import { fetchInvoiceDownloadUrl } from "@/lib/invoice-download";
// // import { toast } from "sonner";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// // import {
// //   BarChart,
// //   Bar,
// //   XAxis,
// //   YAxis,
// //   Cell,
// //   Tooltip,
// //   ResponsiveContainer,
// // } from "recharts";

// // type ViewType = "daily" | "weekly" | "monthly" | "yearly";

// // type ServiceStat = {
// //   name: string;
// //   value: number;
// //   revenue: number;
// // };

// // type DashboardStats = {
// //   orders: number;
// //   invoices: number;
// //   revenue: number;
// // };

// // type RecentInvoice = {
// //   id: string;
// //   invoice_number: string;
// //   customer_name: string;
// //   service_title: string;
// //   total_amount: number;
// //   status: string;
// //   invoice_date: string;
// //   pdf_url: string | null;
// //   pdf_storage_path: string | null;
// // };

// // const COLORS = ["#60A5FA", "#34D399", "#FBBF24", "#FB923C", "#A78BFA", "#F87171"];

// // // Monday of the week containing the given date (weeks run Mon–Sun).
// // function getMonday(date: Date) {
// //   const d = new Date(date);
// //   const day = d.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
// //   const diff = day === 0 ? -6 : 1 - day;
// //   d.setDate(d.getDate() + diff);
// //   d.setHours(0, 0, 0, 0);
// //   return d;
// // }

// // // Convert an ISO week string ("2026-W28") to that week's Monday.
// // function getDateFromISOWeek(isoWeek: string) {
// //   const [yearStr, weekStr] = isoWeek.split("-W");
// //   const year = Number(yearStr);
// //   const week = Number(weekStr);
// //   const jan4 = new Date(year, 0, 4); // Jan 4 is always in week 1 per ISO 8601
// //   const week1Monday = getMonday(jan4);
// //   const monday = new Date(week1Monday);
// //   monday.setDate(monday.getDate() + (week - 1) * 7);
// //   return monday;
// // }

// // // Current date's ISO week, as "YYYY-Www", used as the default value for the
// // // weekly picker.
// // function getCurrentISOWeek() {
// //   const now = new Date();
// //   const monday = getMonday(now);
// //   const jan4 = new Date(monday.getFullYear(), 0, 4);
// //   const week1Monday = getMonday(jan4);
// //   const week = Math.round((monday.getTime() - week1Monday.getTime()) / (7 * 86400000)) + 1;
// //   return `${monday.getFullYear()}-W${String(week).padStart(2, "0")}`;
// // }

// // function getDateRange(
// //   viewType: ViewType,
// //   selectedMonth: string, // "YYYY-MM" — used by monthly/yearly
// //   selectedDate: string, // "YYYY-MM-DD" — used by daily
// //   selectedWeek: string // "YYYY-Www" — used by weekly
// // ) {
// //   let start: Date;
// //   let end: Date;

// //   switch (viewType) {
// //     case "daily": {
// //       const picked = new Date(`${selectedDate}T00:00:00`);
// //       start = picked;
// //       end = new Date(picked);
// //       end.setDate(end.getDate() + 1);
// //       break;
// //     }
// //     case "weekly": {
// //       start = getDateFromISOWeek(selectedWeek);
// //       end = new Date(start);
// //       end.setDate(end.getDate() + 7);
// //       break;
// //     }
// //     case "monthly": {
// //       const [yearStr, monthStr] = selectedMonth.split("-");
// //       const year = Number(yearStr);
// //       const month = Number(monthStr) - 1;
// //       start = new Date(year, month, 1);
// //       end = new Date(year, month + 1, 1);
// //       break;
// //     }
// //     case "yearly": {
// //       const year = Number(selectedMonth.split("-")[0]);
// //       start = new Date(year, 0, 1);
// //       end = new Date(year + 1, 0, 1);
// //       break;
// //     }
// //   }

// //   return {
// //     startISO: start.toISOString().slice(0, 10),
// //     endISO: end.toISOString().slice(0, 10),
// //   };
// // }

// // const AdminDashboard = () => {
// //   const [stats, setStats] = useState({ orders: 0, invoices: 0, emails: 0, webhooks: 0, jobs: 0 });

// //   const [viewType, setViewType] = useState<ViewType>("monthly");
// //   const currentMonth = new Date().toISOString().slice(0, 7);
// //   const [selectedMonth, setSelectedMonth] = useState(currentMonth);
// //   // Used only by Daily/Weekly, since those need an actual date, not just a month.
// //   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
// //   const [selectedWeek, setSelectedWeek] = useState(getCurrentISOWeek());

// //   const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
// //     orders: 0,
// //     invoices: 0,
// //     revenue: 0,
// //   });
// //   const [serviceStats, setServiceStats] = useState<ServiceStat[]>([]);

// //   const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
// //   const [downloadingId, setDownloadingId] = useState<string | null>(null);

// //   const months = Array.from({ length: 24 }, (_, i) => {
// //     const d = new Date();
// //     d.setMonth(d.getMonth() - i);
// //     return {
// //       value: d.toISOString().slice(0, 7),
// //       label: d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
// //     };
// //   });

// //   // When viewType is "yearly", the second selector should list years, not months —
// //   // showing "Jul 2026", "Jun 2026"... next to a "Yearly" filter was misleading,
// //   // since picking any of those months still scoped the query to the whole year.
// //   const years = Array.from({ length: 6 }, (_, i) => {
// //     const year = new Date().getFullYear() - i;
// //     return {
// //       value: `${year}-01`,
// //       label: `${year}`,
// //     };
// //   });

// //   const periodOptions = viewType === "yearly" ? years : months;

// //   // Keep selectedMonth's value aligned with whichever option list is active, so the
// //   // selector always shows a real match instead of going blank after switching.
// //   useEffect(() => {
// //     if (viewType === "yearly") {
// //       const year = selectedMonth.slice(0, 4);
// //       const normalized = `${year}-01`;
// //       if (selectedMonth !== normalized) setSelectedMonth(normalized);
// //     }
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [viewType]);

// //   useEffect(() => {
// //     (async () => {
// //       const tables = ["orders", "invoices", "email_logs", "webhooks_log", "automation_jobs"] as const;
// //       const db = supabase as unknown as { from: (table: string) => ReturnType<typeof supabase.from> };
// //       const results = await Promise.all(tables.map((t) => db.from(t).select("id", { count: "exact", head: true })));
// //       setStats({
// //         orders: results[0].count ?? 0,
// //         invoices: results[1].count ?? 0,
// //         emails: results[2].count ?? 0,
// //         webhooks: results[3].count ?? 0,
// //         jobs: results[4].count ?? 0,
// //       });

// //       const { data } = await supabase
// //         .from("invoices")
// //         .select("id, invoice_number, customer_name, service_title, total_amount, status, invoice_date, pdf_url, pdf_storage_path")
// //         .order("invoice_date", { ascending: false })
// //         .limit(5);
// //       setRecentInvoices((data as RecentInvoice[]) || []);
// //     })();
// //   }, []);

// //   useEffect(() => {
// //     (async () => {
// //       const { startISO, endISO } = getDateRange(viewType, selectedMonth, selectedDate, selectedWeek);

// //       const { data: periodOrders } = await supabase
// //         .from("orders")
// //         .select("service_title, total_amount, created_at")
// //         .gte("created_at", startISO)
// //         .lt("created_at", endISO);

// //       const { count: periodInvoices } = await supabase
// //         .from("invoices")
// //         .select("*", { count: "exact", head: true })
// //         .gte("invoice_date", startISO)
// //         .lt("invoice_date", endISO);

// //       setDashboardStats({
// //         orders: periodOrders?.length || 0,
// //         invoices: periodInvoices || 0,
// //         revenue: periodOrders?.reduce((sum, item) => sum + Number(item.total_amount || 0), 0) || 0,
// //       });

// //       const grouped: Record<string, ServiceStat> = {};
// //       periodOrders?.forEach((item) => {
// //         const key = item.service_title || "Other";
// //         if (!grouped[key]) {
// //           grouped[key] = { name: key, value: 0, revenue: 0 };
// //         }
// //         grouped[key].value += 1;
// //         grouped[key].revenue += Number(item.total_amount || 0);
// //       });
// //       setServiceStats(Object.values(grouped));
// //     })();
// //   }, [viewType, selectedMonth, selectedDate, selectedWeek]);

// //   const downloadInvoice = async (inv: RecentInvoice) => {
// //     setDownloadingId(inv.id);
// //     try {
// //       const url = (await fetchInvoiceDownloadUrl(inv.id)) || inv.pdf_url;
// //       if (!url) {
// //         toast.error("Invoice PDF is not available yet.");
// //         return;
// //       }
// //       window.open(url, "_blank", "noopener,noreferrer");
// //     } catch {
// //       toast.error("Could not download invoice");
// //     } finally {
// //       setDownloadingId(null);
// //     }
// //   };

// //   const cards = [
// //     { label: "Orders", value: stats.orders, icon: Package, color: "text-amber-500" },
// //     { label: "Invoices", value: stats.invoices, icon: FileText, color: "text-primary" },
// //     { label: "Emails", value: stats.emails, icon: Mail, color: "text-blue-400" },
// //     { label: "Webhooks", value: stats.webhooks, icon: Webhook, color: "text-purple-400" },
// //     { label: "Automation Jobs", value: stats.jobs, icon: GitBranch, color: "text-rose-400" },
// //   ];

// //   const avgOrderValue =
// //     dashboardStats.orders > 0 ? Math.round(dashboardStats.revenue / dashboardStats.orders) : 0;

// //   const sortedServiceStats = [...serviceStats].sort((a, b) => b.revenue - a.revenue);

// //   return (
// //     <div className="space-y-6">
// //       <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-card to-background p-6">
// //         <h2 className="font-display text-xl font-semibold text-foreground">Ankshaastra Operations Platform</h2>
// //         <p className="text-muted-foreground mt-2 text-sm max-w-2xl">
// //           Central hub for empower.ankshaastra.com, miraclebaby.ankshaastra.com, ankshaastra.com, and ankshaastra.in —
// //           orders, GST invoices, email notifications, and workflow orchestration.
// //         </p>
// //       </div>

// //       {/* All-time overview — intentionally labeled and visually separated from the
// //           period-filtered section below, since these are all-time counts, not
// //           scoped to the Monthly/Yearly + month selector further down. */}
// //       <div className="space-y-3">
// //         <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
// //           Overview (All-Time)
// //         </h3>
// //         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
// //           {cards.map(({ label, value, icon: Icon, color }) => (
// //             <Card key={label}>
// //               <CardHeader className="pb-2">
// //                 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
// //                   <Icon className={`w-4 h-4 ${color}`} />
// //                   {label}
// //                 </CardTitle>
// //               </CardHeader>
// //               <CardContent>
// //                 <p className="text-3xl font-bold font-display">{value}</p>
// //               </CardContent>
// //             </Card>
// //           ))}
// //         </div>
// //       </div>

// //       <Card>
// //         <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
// //           <CardTitle className="flex items-center gap-2">
// //             Period Dashboard
// //             <span className="text-xs font-normal text-muted-foreground">
// //               (filtered by selection below)
// //             </span>
// //           </CardTitle>
// //           <div className="flex items-center gap-3 flex-wrap">
// //             <Select value={viewType} onValueChange={(v) => setViewType(v as ViewType)}>
// //               <SelectTrigger className="w-36">
// //                 <SelectValue />
// //               </SelectTrigger>
// //               <SelectContent>
// //                 <SelectItem value="daily">Daily</SelectItem>
// //                 <SelectItem value="weekly">Weekly</SelectItem>
// //                 <SelectItem value="monthly">Monthly</SelectItem>
// //                 <SelectItem value="yearly">Yearly</SelectItem>
// //               </SelectContent>
// //             </Select>

// //             {viewType === "daily" && (
// //               <Input
// //                 type="date"
// //                 className="w-40"
// //                 value={selectedDate}
// //                 onChange={(e) => setSelectedDate(e.target.value)}
// //                 max={new Date().toISOString().slice(0, 10)}
// //               />
// //             )}

// //             {viewType === "weekly" && (
// //               <Input
// //                 type="week"
// //                 className="w-40"
// //                 value={selectedWeek}
// //                 onChange={(e) => setSelectedWeek(e.target.value)}
// //                 max={getCurrentISOWeek()}
// //               />
// //             )}

// //             {(viewType === "monthly" || viewType === "yearly") && (
// //               <Select value={selectedMonth} onValueChange={setSelectedMonth}>
// //                 <SelectTrigger className="w-40">
// //                   <SelectValue />
// //                 </SelectTrigger>
// //                 <SelectContent>
// //                   {periodOptions.map((option) => (
// //                     <SelectItem key={option.value} value={option.value}>
// //                       {option.label}
// //                     </SelectItem>
// //                   ))}
// //                 </SelectContent>
// //               </Select>
// //             )}
// //           </div>
// //         </CardHeader>
// //         {viewType === "weekly" && (
// //           <p className="text-xs text-muted-foreground px-6 -mt-3 pb-2">
// //             Showing {getDateFromISOWeek(selectedWeek).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – {(() => {
// //               const sunday = new Date(getDateFromISOWeek(selectedWeek));
// //               sunday.setDate(sunday.getDate() + 6);
// //               return sunday.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
// //             })()}.
// //           </p>
// //         )}

// //         <CardContent>
// //           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
// //             <Card>
// //               <CardContent className="pt-6">
// //                 <div className="text-sm">Orders</div>
// //                 <div className="text-3xl font-bold">{dashboardStats.orders}</div>
// //               </CardContent>
// //             </Card>

// //             <Card>
// //               <CardContent className="pt-6">
// //                 <div className="text-sm">Invoices</div>
// //                 <div className="text-3xl font-bold">{dashboardStats.invoices}</div>
// //               </CardContent>
// //             </Card>

// //             <Card>
// //               <CardContent className="pt-6">
// //                 <div className="text-sm">Revenue</div>
// //                 <div className="text-3xl font-bold">₹{dashboardStats.revenue.toLocaleString()}</div>
// //               </CardContent>
// //             </Card>

// //             <Card>
// //               <CardContent className="pt-6">
// //                 <div className="text-sm">Avg Order Value</div>
// //                 <div className="text-3xl font-bold">₹{avgOrderValue.toLocaleString()}</div>
// //               </CardContent>
// //             </Card>
// //           </div>
// //         </CardContent>
// //       </Card>

// //       <Card>
// //         <CardHeader className="flex flex-row items-center justify-between pb-2">
// //           <CardTitle className="text-base font-medium">Recent Invoices</CardTitle>
// //           <Button asChild variant="outline" size="sm">
// //             <Link to="/admin/invoices">View all</Link>
// //           </Button>
// //         </CardHeader>
// //         <CardContent>
// //           {recentInvoices.length === 0 ? (
// //             <p className="text-sm text-muted-foreground py-4 text-center">No invoices generated yet.</p>
// //           ) : (
// //             <div className="space-y-2">
// //               {recentInvoices.map((inv) => (
// //                 <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 border border-border rounded-lg p-3">
// //                   <div>
// //                     <p className="font-semibold text-sm text-primary">{inv.invoice_number}</p>
// //                     <p className="text-xs text-muted-foreground">{inv.customer_name} · {inv.service_title}</p>
// //                   </div>
// //                   <div className="flex items-center gap-2">
// //                     <span className="text-sm font-semibold">₹{Number(inv.total_amount).toLocaleString()}</span>
// //                     <Badge variant="secondary" className="text-xs">{inv.status}</Badge>
// //                     {(inv.pdf_storage_path || inv.pdf_url) && (
// //                       <Button
// //                         size="sm"
// //                         variant="outline"
// //                         disabled={downloadingId === inv.id}
// //                         onClick={() => downloadInvoice(inv)}
// //                       >
// //                         {downloadingId === inv.id ? (
// //                           <Loader2 className="w-4 h-4 animate-spin" />
// //                         ) : (
// //                           <Download className="w-4 h-4" />
// //                         )}
// //                       </Button>
// //                     )}
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           )}
// //         </CardContent>
// //       </Card>

// //       <Card>
// //         <CardHeader>
// //           <CardTitle>Service Wise Analytics</CardTitle>
// //         </CardHeader>
// //         <CardContent>
// //           {serviceStats.length === 0 ? (
// //             <p className="text-sm text-muted-foreground py-4 text-center">No data for this period.</p>
// //           ) : (
// //             <div className="grid md:grid-cols-2 gap-6">
// //               {/* Horizontal bar chart, sorted by revenue — replaces the pie chart,
// //                   which had overlapping labels and required decoding a 6-color legend. */}
// //               <ResponsiveContainer width="100%" height={Math.max(300, sortedServiceStats.length * 45)}>
// //                 <BarChart
// //                   data={sortedServiceStats}
// //                   layout="vertical"
// //                   margin={{ top: 5, right: 30, bottom: 5, left: 20 }}
// //                 >
// //                   <XAxis type="number" hide />
// //                   <YAxis
// //                     type="category"
// //                     dataKey="name"
// //                     width={150}
// //                     tick={{ fontSize: 12 }}
// //                   />
// //                   <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
// //                   <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
// //                     {sortedServiceStats.map((entry, index) => (
// //                       <Cell key={index} fill={COLORS[index % COLORS.length]} />
// //                     ))}
// //                   </Bar>
// //                 </BarChart>
// //               </ResponsiveContainer>

// //               <div className="space-y-3">
// //                 {sortedServiceStats.map((item) => (
// //                   <div key={item.name} className="border rounded-lg p-3 flex justify-between">
// //                     <div>
// //                       <div className="font-semibold">{item.name}</div>
// //                       <div className="text-sm text-gray-500">Orders : {item.value}</div>
// //                     </div>
// //                     <div className="font-bold">₹{item.revenue.toLocaleString()}</div>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           )}
// //         </CardContent>
// //       </Card>
// //     </div>
// //   );
// // };

// // export default AdminDashboard;

// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Package,
//   FileText,
//   Mail,
//   Webhook,
//   GitBranch,
//   Download,
//   Loader2,
//   KeyRound,
//   Wallet,
//   TrendingUp,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { fetchInvoiceDownloadUrl } from "@/lib/invoice-download";
// import { toast } from "sonner";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Cell,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// type ViewType = "daily" | "weekly" | "monthly" | "yearly";

// type ServiceStat = {
//   name: string;
//   value: number;
//   revenue: number;
// };

// type DashboardStats = {
//   orders: number;
//   invoices: number;
//   revenue: number;
// };

// type RecentInvoice = {
//   id: string;
//   invoice_number: string;
//   customer_name: string;
//   service_title: string;
//   total_amount: number;
//   status: string;
//   invoice_date: string;
//   pdf_url: string | null;
//   pdf_storage_path: string | null;
// };

// const COLORS = ["#60A5FA", "#34D399", "#FBBF24", "#FB923C", "#A78BFA", "#F87171"];

// // Fixed color mapping for invoice status — one meaning everywhere, instead
// // of a generic "secondary" pill that carries no semantic signal.
// // green = paid, amber = pending, red = failed/cancelled, gray = anything else.
// const INVOICE_STATUS_STYLES: Record<string, string> = {
//   paid: "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
//   pending: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
//   failed: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
//   cancelled: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
//   refunded: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
//   draft: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
// };

// function getInvoiceStatusClass(status?: string) {
//   const key = (status || "").toLowerCase();
//   return INVOICE_STATUS_STYLES[key] || INVOICE_STATUS_STYLES.draft;
// }

// // Monday of the week containing the given date (weeks run Mon–Sun).
// function getMonday(date: Date) {
//   const d = new Date(date);
//   const day = d.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
//   const diff = day === 0 ? -6 : 1 - day;
//   d.setDate(d.getDate() + diff);
//   d.setHours(0, 0, 0, 0);
//   return d;
// }

// // Convert an ISO week string ("2026-W28") to that week's Monday.
// function getDateFromISOWeek(isoWeek: string) {
//   const [yearStr, weekStr] = isoWeek.split("-W");
//   const year = Number(yearStr);
//   const week = Number(weekStr);
//   const jan4 = new Date(year, 0, 4); // Jan 4 is always in week 1 per ISO 8601
//   const week1Monday = getMonday(jan4);
//   const monday = new Date(week1Monday);
//   monday.setDate(monday.getDate() + (week - 1) * 7);
//   return monday;
// }

// // Current date's ISO week, as "YYYY-Www", used as the default value for the
// // weekly picker.
// function getCurrentISOWeek() {
//   const now = new Date();
//   const monday = getMonday(now);
//   const jan4 = new Date(monday.getFullYear(), 0, 4);
//   const week1Monday = getMonday(jan4);
//   const week = Math.round((monday.getTime() - week1Monday.getTime()) / (7 * 86400000)) + 1;
//   return `${monday.getFullYear()}-W${String(week).padStart(2, "0")}`;
// }

// function getDateRange(
//   viewType: ViewType,
//   selectedMonth: string, // "YYYY-MM" — used by monthly/yearly
//   selectedDate: string, // "YYYY-MM-DD" — used by daily
//   selectedWeek: string // "YYYY-Www" — used by weekly
// ) {
//   let start: Date;
//   let end: Date;

//   switch (viewType) {
//     case "daily": {
//       const picked = new Date(`${selectedDate}T00:00:00`);
//       start = picked;
//       end = new Date(picked);
//       end.setDate(end.getDate() + 1);
//       break;
//     }
//     case "weekly": {
//       start = getDateFromISOWeek(selectedWeek);
//       end = new Date(start);
//       end.setDate(end.getDate() + 7);
//       break;
//     }
//     case "monthly": {
//       const [yearStr, monthStr] = selectedMonth.split("-");
//       const year = Number(yearStr);
//       const month = Number(monthStr) - 1;
//       start = new Date(year, month, 1);
//       end = new Date(year, month + 1, 1);
//       break;
//     }
//     case "yearly": {
//       const year = Number(selectedMonth.split("-")[0]);
//       start = new Date(year, 0, 1);
//       end = new Date(year + 1, 0, 1);
//       break;
//     }
//   }

//   return {
//     startISO: start.toISOString().slice(0, 10),
//     endISO: end.toISOString().slice(0, 10),
//   };
// }

// // Compact period-metric card: icon + label on one line, a smaller, tinted
// // number below it, with a thin left accent border for quick color-scanning.
// // Replaces the old bare "text-3xl font-bold" numbers, which had no visual
// // weight hierarchy against each other or the rest of the page.
// type MetricTone = "blue" | "purple" | "green" | "orange";

// const METRIC_TONE_STYLES: Record<MetricTone, { accent: string; icon: string; value: string }> = {
//   blue: {
//     accent: "border-l-blue-500",
//     icon: "text-blue-600 dark:text-blue-400",
//     value: "text-blue-600 dark:text-blue-400",
//   },
//   purple: {
//     accent: "border-l-purple-500",
//     icon: "text-purple-600 dark:text-purple-400",
//     value: "text-purple-600 dark:text-purple-400",
//   },
//   green: {
//     accent: "border-l-green-500",
//     icon: "text-green-600 dark:text-green-400",
//     value: "text-green-600 dark:text-green-400",
//   },
//   orange: {
//     accent: "border-l-orange-500",
//     icon: "text-orange-600 dark:text-orange-400",
//     value: "text-orange-600 dark:text-orange-400",
//   },
// };

// function PeriodMetricCard({
//   label,
//   value,
//   icon: Icon,
//   tone,
// }: {
//   label: string;
//   value: string | number;
//   icon: typeof Package;
//   tone: MetricTone;
// }) {
//   const t = METRIC_TONE_STYLES[tone];
//   return (
//     <Card className={cn("border-l-4", t.accent)}>
//       <CardContent className="pt-4 pb-4">
//         <div className="flex items-center gap-2 text-sm text-muted-foreground">
//           <Icon className={cn("w-4 h-4", t.icon)} />
//           {label}
//         </div>
//         <p className={cn("text-xl font-semibold tabular-nums mt-1.5", t.value)}>{value}</p>
//       </CardContent>
//     </Card>
//   );
// }

// const AdminDashboard = () => {
//   const [stats, setStats] = useState({ orders: 0, invoices: 0, emails: 0, webhooks: 0, jobs: 0 });

//   const [viewType, setViewType] = useState<ViewType>("monthly");
//   const currentMonth = new Date().toISOString().slice(0, 7);
//   const [selectedMonth, setSelectedMonth] = useState(currentMonth);
//   // Used only by Daily/Weekly, since those need an actual date, not just a month.
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
//   const [selectedWeek, setSelectedWeek] = useState(getCurrentISOWeek());

//   const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
//     orders: 0,
//     invoices: 0,
//     revenue: 0,
//   });
//   const [serviceStats, setServiceStats] = useState<ServiceStat[]>([]);

//   const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
//   const [downloadingId, setDownloadingId] = useState<string | null>(null);

//   const months = Array.from({ length: 24 }, (_, i) => {
//     const d = new Date();
//     d.setMonth(d.getMonth() - i);
//     return {
//       value: d.toISOString().slice(0, 7),
//       label: d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
//     };
//   });

//   // When viewType is "yearly", the second selector should list years, not months —
//   // showing "Jul 2026", "Jun 2026"... next to a "Yearly" filter was misleading,
//   // since picking any of those months still scoped the query to the whole year.
//   const years = Array.from({ length: 6 }, (_, i) => {
//     const year = new Date().getFullYear() - i;
//     return {
//       value: `${year}-01`,
//       label: `${year}`,
//     };
//   });

//   const periodOptions = viewType === "yearly" ? years : months;

//   // Keep selectedMonth's value aligned with whichever option list is active, so the
//   // selector always shows a real match instead of going blank after switching.
//   useEffect(() => {
//     if (viewType === "yearly") {
//       const year = selectedMonth.slice(0, 4);
//       const normalized = `${year}-01`;
//       if (selectedMonth !== normalized) setSelectedMonth(normalized);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [viewType]);

//   useEffect(() => {
//     (async () => {
//       const tables = ["orders", "invoices", "email_logs", "webhooks_log", "automation_jobs"] as const;
//       const db = supabase as unknown as { from: (table: string) => ReturnType<typeof supabase.from> };
//       const results = await Promise.all(tables.map((t) => db.from(t).select("id", { count: "exact", head: true })));
//       setStats({
//         orders: results[0].count ?? 0,
//         invoices: results[1].count ?? 0,
//         emails: results[2].count ?? 0,
//         webhooks: results[3].count ?? 0,
//         jobs: results[4].count ?? 0,
//       });

//       const { data } = await supabase
//         .from("invoices")
//         .select("id, invoice_number, customer_name, service_title, total_amount, status, invoice_date, pdf_url, pdf_storage_path")
//         .order("invoice_date", { ascending: false })
//         .limit(5);
//       setRecentInvoices((data as RecentInvoice[]) || []);
//     })();
//   }, []);

//   useEffect(() => {
//     (async () => {
//       const { startISO, endISO } = getDateRange(viewType, selectedMonth, selectedDate, selectedWeek);

//       const { data: periodOrders } = await supabase
//         .from("orders")
//         .select("service_title, total_amount, created_at")
//         .gte("created_at", startISO)
//         .lt("created_at", endISO);

//       const { count: periodInvoices } = await supabase
//         .from("invoices")
//         .select("*", { count: "exact", head: true })
//         .gte("invoice_date", startISO)
//         .lt("invoice_date", endISO);

//       setDashboardStats({
//         orders: periodOrders?.length || 0,
//         invoices: periodInvoices || 0,
//         revenue: periodOrders?.reduce((sum, item) => sum + Number(item.total_amount || 0), 0) || 0,
//       });

//       const grouped: Record<string, ServiceStat> = {};
//       periodOrders?.forEach((item) => {
//         const key = item.service_title || "Other";
//         if (!grouped[key]) {
//           grouped[key] = { name: key, value: 0, revenue: 0 };
//         }
//         grouped[key].value += 1;
//         grouped[key].revenue += Number(item.total_amount || 0);
//       });
//       setServiceStats(Object.values(grouped));
//     })();
//   }, [viewType, selectedMonth, selectedDate, selectedWeek]);

//   const downloadInvoice = async (inv: RecentInvoice) => {
//     setDownloadingId(inv.id);
//     try {
//       const url = (await fetchInvoiceDownloadUrl(inv.id)) || inv.pdf_url;
//       if (!url) {
//         toast.error("Invoice PDF is not available yet.");
//         return;
//       }
//       window.open(url, "_blank", "noopener,noreferrer");
//     } catch {
//       toast.error("Could not download invoice");
//     } finally {
//       setDownloadingId(null);
//     }
//   };

//   const cards = [
//     { label: "Orders", value: stats.orders, icon: Package, color: "text-amber-500" },
//     { label: "Invoices", value: stats.invoices, icon: FileText, color: "text-primary" },
//     { label: "Emails", value: stats.emails, icon: Mail, color: "text-blue-400" },
//     { label: "Webhooks", value: stats.webhooks, icon: Webhook, color: "text-purple-400" },
//     { label: "Automation Jobs", value: stats.jobs, icon: GitBranch, color: "text-rose-400" },
//   ];

//   const avgOrderValue =
//     dashboardStats.orders > 0 ? Math.round(dashboardStats.revenue / dashboardStats.orders) : 0;

//   const sortedServiceStats = [...serviceStats].sort((a, b) => b.revenue - a.revenue);

//   // Compact metric cards for the Period Dashboard section (Orders/Invoices/
//   // Revenue/Avg Order Value) — replaces the four bare oversized numbers.
//   const periodCards: { label: string; value: string | number; icon: typeof Package; tone: MetricTone }[] = [
//     { label: "Orders", value: dashboardStats.orders, icon: Package, tone: "blue" },
//     { label: "Invoices", value: dashboardStats.invoices, icon: FileText, tone: "purple" },
//     { label: "Revenue", value: `₹${dashboardStats.revenue.toLocaleString()}`, icon: Wallet, tone: "green" },
//     { label: "Avg Order Value", value: `₹${avgOrderValue.toLocaleString()}`, icon: TrendingUp, tone: "orange" },
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-card to-background p-6">
//         <h2 className="font-display text-xl font-semibold text-foreground">Ankshaastra Operations Platform</h2>
//         <p className="text-muted-foreground mt-2 text-sm max-w-2xl">
//           Central hub for empower.ankshaastra.com, miraclebaby.ankshaastra.com, ankshaastra.com, and ankshaastra.in —
//           orders, GST invoices, email notifications, and workflow orchestration.
//         </p>
//       </div>

//       {/* All-time overview — intentionally labeled and visually separated from the
//           period-filtered section below, since these are all-time counts, not
//           scoped to the Monthly/Yearly + month selector further down. */}
//       <div className="space-y-3">
//         <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
//           Overview (All-Time)
//         </h3>
//         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//           {cards.map(({ label, value, icon: Icon, color }) => (
//             <Card key={label}>
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
//                   <Icon className={`w-4 h-4 ${color}`} />
//                   {label}
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-3xl font-bold font-display">{value}</p>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>

//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
//           <CardTitle className="flex items-center gap-2">
//             Period Dashboard
//             <span className="text-xs font-normal text-muted-foreground">
//               (filtered by selection below)
//             </span>
//           </CardTitle>
//           <div className="flex items-center gap-3 flex-wrap">
//             <Select value={viewType} onValueChange={(v) => setViewType(v as ViewType)}>
//               <SelectTrigger className="w-36">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="daily">Daily</SelectItem>
//                 <SelectItem value="weekly">Weekly</SelectItem>
//                 <SelectItem value="monthly">Monthly</SelectItem>
//                 <SelectItem value="yearly">Yearly</SelectItem>
//               </SelectContent>
//             </Select>

//             {viewType === "daily" && (
//               <Input
//                 type="date"
//                 className="w-40"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//                 max={new Date().toISOString().slice(0, 10)}
//               />
//             )}

//             {viewType === "weekly" && (
//               <Input
//                 type="week"
//                 className="w-40"
//                 value={selectedWeek}
//                 onChange={(e) => setSelectedWeek(e.target.value)}
//                 max={getCurrentISOWeek()}
//               />
//             )}

//             {(viewType === "monthly" || viewType === "yearly") && (
//               <Select value={selectedMonth} onValueChange={setSelectedMonth}>
//                 <SelectTrigger className="w-40">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {periodOptions.map((option) => (
//                     <SelectItem key={option.value} value={option.value}>
//                       {option.label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             )}
//           </div>
//         </CardHeader>
//         {viewType === "weekly" && (
//           <p className="text-xs text-muted-foreground px-6 -mt-3 pb-2">
//             Showing {getDateFromISOWeek(selectedWeek).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – {(() => {
//               const sunday = new Date(getDateFromISOWeek(selectedWeek));
//               sunday.setDate(sunday.getDate() + 6);
//               return sunday.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
//             })()}.
//           </p>
//         )}

//         <CardContent>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
//             {periodCards.map((c) => (
//               <PeriodMetricCard key={c.label} label={c.label} value={c.value} icon={c.icon} tone={c.tone} />
//             ))}
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between pb-2">
//           <CardTitle className="text-base font-medium">Recent Invoices</CardTitle>
//           <Button asChild variant="outline" size="sm">
//             <Link to="/admin/invoices">View all</Link>
//           </Button>
//         </CardHeader>
//         <CardContent>
//           {recentInvoices.length === 0 ? (
//             <p className="text-sm text-muted-foreground py-4 text-center">No invoices generated yet.</p>
//           ) : (
//             <div className="space-y-2">
//               {recentInvoices.map((inv) => (
//                 <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 border border-border rounded-lg p-3">
//                   <div>
//                     <p className="font-semibold text-sm text-primary">{inv.invoice_number}</p>
//                     <p className="text-xs text-muted-foreground">{inv.customer_name} · {inv.service_title}</p>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-sm font-semibold">₹{Number(inv.total_amount).toLocaleString()}</span>
//                     <Badge
//                       variant="outline"
//                       className={cn("text-xs font-medium capitalize", getInvoiceStatusClass(inv.status))}
//                     >
//                       {inv.status}
//                     </Badge>
//                     {(inv.pdf_storage_path || inv.pdf_url) && (
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         disabled={downloadingId === inv.id}
//                         onClick={() => downloadInvoice(inv)}
//                       >
//                         {downloadingId === inv.id ? (
//                           <Loader2 className="w-4 h-4 animate-spin" />
//                         ) : (
//                           <Download className="w-4 h-4" />
//                         )}
//                       </Button>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Service Wise Analytics</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {serviceStats.length === 0 ? (
//             <p className="text-sm text-muted-foreground py-4 text-center">No data for this period.</p>
//           ) : (
//             <div className="grid md:grid-cols-2 gap-6">
//               {/* Horizontal bar chart, sorted by revenue — replaces the pie chart,
//                   which had overlapping labels and required decoding a 6-color legend. */}
//               <ResponsiveContainer width="100%" height={Math.max(300, sortedServiceStats.length * 45)}>
//                 <BarChart
//                   data={sortedServiceStats}
//                   layout="vertical"
//                   margin={{ top: 5, right: 30, bottom: 5, left: 20 }}
//                 >
//                   <XAxis type="number" hide />
//                   <YAxis
//                     type="category"
//                     dataKey="name"
//                     width={150}
//                     tick={{ fontSize: 12 }}
//                   />
//                   <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
//                   <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
//                     {sortedServiceStats.map((entry, index) => (
//                       <Cell key={index} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>

//               <div className="space-y-3">
//                 {sortedServiceStats.map((item) => (
//                   <div key={item.name} className="border rounded-lg p-3 flex justify-between">
//                     <div>
//                       <div className="font-semibold">{item.name}</div>
//                       <div className="text-sm text-gray-500">Orders : {item.value}</div>
//                     </div>
//                     <div className="font-bold">₹{item.revenue.toLocaleString()}</div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default AdminDashboard;


import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  FileText,
  Mail,
  Webhook,
  GitBranch,
  Download,
  Loader2,
  KeyRound,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchInvoiceDownloadUrl } from "@/lib/invoice-download";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ViewType = "daily" | "weekly" | "monthly" | "yearly";

type ServiceStat = {
  name: string;
  value: number;
  revenue: number;
};

type DashboardStats = {
  orders: number;
  invoices: number;
  revenue: number;
};

type RecentInvoice = {
  id: string;
  invoice_number: string;
  customer_name: string;
  service_title: string;
  total_amount: number;
  status: string;
  invoice_date: string;
  pdf_url: string | null;
  pdf_storage_path: string | null;
};

const COLORS = ["#60A5FA", "#34D399", "#FBBF24", "#FB923C", "#A78BFA", "#F87171"];

// Fixed color mapping for invoice status — one meaning everywhere, instead
// of a generic "secondary" pill that carries no semantic signal.
// green = paid, amber = pending, red = failed/cancelled, gray = anything else.
const INVOICE_STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  pending: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  failed: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  cancelled: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  refunded: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  draft: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
};

function getInvoiceStatusClass(status?: string) {
  const key = (status || "").toLowerCase();
  return INVOICE_STATUS_STYLES[key] || INVOICE_STATUS_STYLES.draft;
}

// Monday of the week containing the given date (weeks run Mon–Sun).
function getMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Convert an ISO week string ("2026-W28") to that week's Monday.
function getDateFromISOWeek(isoWeek: string) {
  const [yearStr, weekStr] = isoWeek.split("-W");
  const year = Number(yearStr);
  const week = Number(weekStr);
  const jan4 = new Date(year, 0, 4); // Jan 4 is always in week 1 per ISO 8601
  const week1Monday = getMonday(jan4);
  const monday = new Date(week1Monday);
  monday.setDate(monday.getDate() + (week - 1) * 7);
  return monday;
}

// Current date's ISO week, as "YYYY-Www", used as the default value for the
// weekly picker.
function getCurrentISOWeek() {
  const now = new Date();
  const monday = getMonday(now);
  const jan4 = new Date(monday.getFullYear(), 0, 4);
  const week1Monday = getMonday(jan4);
  const week = Math.round((monday.getTime() - week1Monday.getTime()) / (7 * 86400000)) + 1;
  return `${monday.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Financial Year (India) helpers — FY runs 1 Apr → 31 Mar.
// A Financial Year is identified everywhere by its *start* calendar year,
// e.g. fyStartYear = 2024 means FY 2024-25 = 1 Apr 2024 → 31 Mar 2025.
// Centralizing this here means the Yearly view (and anything else that needs
// FY math in the future) never has to re-derive "1 Apr" / "31 Mar" logic.
// ---------------------------------------------------------------------------

// Given any date, return the start year of the Financial Year it falls in.
// Jan/Feb/Mar belong to the FY that started the previous calendar year.
function getFYStartYear(date: Date) {
  return date.getMonth() < 3 ? date.getFullYear() - 1 : date.getFullYear();
}

// The Financial Year we're currently in, e.g. 2026 for "today".
function getCurrentFYStartYear() {
  return getFYStartYear(new Date());
}

// "FY 2024-25" style label for a given FY start year.
function getFYLabel(fyStartYear: number) {
  const endYearShort = String((fyStartYear + 1) % 100).padStart(2, "0");
  return `FY ${fyStartYear}-${endYearShort}`;
}

// [start, end) date range for a given FY start year: 1 Apr → 1 Apr next year.
function getFYDateRange(fyStartYear: number) {
  const start = new Date(fyStartYear, 3, 1); // month index 3 = April
  const end = new Date(fyStartYear + 1, 3, 1);
  return { start, end };
}

function getDateRange(
  viewType: ViewType,
  selectedMonth: string, // "YYYY-MM" for monthly; FY start year (e.g. "2024") for yearly
  selectedDate: string, // "YYYY-MM-DD" — used by daily
  selectedWeek: string // "YYYY-Www" — used by weekly
) {
  let start: Date;
  let end: Date;

  switch (viewType) {
    case "daily": {
      const picked = new Date(`${selectedDate}T00:00:00`);
      start = picked;
      end = new Date(picked);
      end.setDate(end.getDate() + 1);
      break;
    }
    case "weekly": {
      start = getDateFromISOWeek(selectedWeek);
      end = new Date(start);
      end.setDate(end.getDate() + 7);
      break;
    }
    case "monthly": {
      const [yearStr, monthStr] = selectedMonth.split("-");
      const year = Number(yearStr);
      const month = Number(monthStr) - 1;
      start = new Date(year, month, 1);
      end = new Date(year, month + 1, 1);
      break;
    }
    case "yearly": {
      // selectedMonth holds the Financial Year's start year, e.g. "2024" for FY 2024-25.
      const fyStartYear = Number(selectedMonth);
      const range = getFYDateRange(fyStartYear);
      start = range.start;
      end = range.end;
      break;
    }
  }

  return {
    startISO: start.toISOString().slice(0, 10),
    endISO: end.toISOString().slice(0, 10),
  };
}

// Compact period-metric card: icon + label on one line, a smaller, tinted
// number below it, with a thin left accent border for quick color-scanning.
// Replaces the old bare "text-3xl font-bold" numbers, which had no visual
// weight hierarchy against each other or the rest of the page.
type MetricTone = "blue" | "purple" | "green" | "orange";

const METRIC_TONE_STYLES: Record<MetricTone, { accent: string; icon: string; value: string }> = {
  blue: {
    accent: "border-l-blue-500",
    icon: "text-blue-600 dark:text-blue-400",
    value: "text-blue-600 dark:text-blue-400",
  },
  purple: {
    accent: "border-l-purple-500",
    icon: "text-purple-600 dark:text-purple-400",
    value: "text-purple-600 dark:text-purple-400",
  },
  green: {
    accent: "border-l-green-500",
    icon: "text-green-600 dark:text-green-400",
    value: "text-green-600 dark:text-green-400",
  },
  orange: {
    accent: "border-l-orange-500",
    icon: "text-orange-600 dark:text-orange-400",
    value: "text-orange-600 dark:text-orange-400",
  },
};

function PeriodMetricCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: typeof Package;
  tone: MetricTone;
}) {
  const t = METRIC_TONE_STYLES[tone];
  return (
    <Card className={cn("border-l-4", t.accent)}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className={cn("w-4 h-4", t.icon)} />
          {label}
        </div>
        <p className={cn("text-xl font-semibold tabular-nums mt-1.5", t.value)}>{value}</p>
      </CardContent>
    </Card>
  );
}

const AdminDashboard = () => {
  const [stats, setStats] = useState({ orders: 0, invoices: 0, emails: 0, webhooks: 0, jobs: 0 });

  const [viewType, setViewType] = useState<ViewType>("monthly");
  const currentMonth = new Date().toISOString().slice(0, 7);
  // Dual-purpose: "YYYY-MM" when viewType is "monthly", or an FY start year
  // (e.g. "2024") when viewType is "yearly". See the normalization effect below.
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  // Used only by Daily/Weekly, since those need an actual date, not just a month.
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedWeek, setSelectedWeek] = useState(getCurrentISOWeek());

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    orders: 0,
    invoices: 0,
    revenue: 0,
  });
  const [serviceStats, setServiceStats] = useState<ServiceStat[]>([]);

  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const months = Array.from({ length: 24 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      value: d.toISOString().slice(0, 7),
      label: d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
    };
  });

  // When viewType is "yearly", the second selector lists Financial Years
  // (FY 2026-27, FY 2027-28, ... FY 2033-34) instead of calendar years. The
  // dropdown `value` is the FY's start year as a string (e.g. "2026"), which
  // getDateRange's "yearly" branch turns into 1 Apr 2026 → 31 Mar 2027.
  const FY_RANGE_START_YEAR = 2026;
  const FY_RANGE_END_YEAR = 2033; // inclusive — last option is FY 2033-34
  const financialYears = Array.from(
    { length: FY_RANGE_END_YEAR - FY_RANGE_START_YEAR + 1 },
    (_, i) => {
      const fyStartYear = FY_RANGE_START_YEAR + i;
      return {
        value: String(fyStartYear),
        label: getFYLabel(fyStartYear),
      };
    }
  );

  const periodOptions = viewType === "yearly" ? financialYears : months;

  // Keep selectedMonth's value aligned with whichever option list is active, so the
  // selector always shows a real match instead of going blank after switching.
  useEffect(() => {
    if (viewType === "yearly") {
      // selectedMonth may currently be a "YYYY-MM" value carried over from
      // Monthly view, or already an FY start year from a prior Yearly selection.
      const [yearPart, monthPart] = selectedMonth.split("-");
      const fyStartYear = monthPart
        ? getFYStartYear(new Date(Number(yearPart), Number(monthPart) - 1, 1))
        : Number(yearPart);
      const normalized = String(fyStartYear);
      if (selectedMonth !== normalized) setSelectedMonth(normalized);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewType]);

  useEffect(() => {
    (async () => {
      const tables = ["orders", "invoices", "email_logs", "webhooks_log", "automation_jobs"] as const;
      const db = supabase as unknown as { from: (table: string) => ReturnType<typeof supabase.from> };
      const results = await Promise.all(tables.map((t) => db.from(t).select("id", { count: "exact", head: true })));
      setStats({
        orders: results[0].count ?? 0,
        invoices: results[1].count ?? 0,
        emails: results[2].count ?? 0,
        webhooks: results[3].count ?? 0,
        jobs: results[4].count ?? 0,
      });
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { startISO, endISO } = getDateRange(viewType, selectedMonth, selectedDate, selectedWeek);

      const { data: periodOrders } = await supabase
        .from("orders")
        .select("service_title, total_amount, created_at")
        .gte("created_at", startISO)
        .lt("created_at", endISO);

      const { count: periodInvoices } = await supabase
        .from("invoices")
        .select("*", { count: "exact", head: true })
        .gte("invoice_date", startISO)
        .lt("invoice_date", endISO);

      setDashboardStats({
        orders: periodOrders?.length || 0,
        invoices: periodInvoices || 0,
        revenue: periodOrders?.reduce((sum, item) => sum + Number(item.total_amount || 0), 0) || 0,
      });

      const grouped: Record<string, ServiceStat> = {};
      periodOrders?.forEach((item) => {
        const key = item.service_title || "Other";
        if (!grouped[key]) {
          grouped[key] = { name: key, value: 0, revenue: 0 };
        }
        grouped[key].value += 1;
        grouped[key].revenue += Number(item.total_amount || 0);
      });
      setServiceStats(Object.values(grouped));

      // Recent Invoices is scoped to the same selected period (Daily/Weekly/
      // Monthly/Financial Year) as the metric cards above, so switching the
      // Financial Year filter updates this list too.
      const { data: periodInvoiceRows } = await supabase
        .from("invoices")
        .select("id, invoice_number, customer_name, service_title, total_amount, status, invoice_date, pdf_url, pdf_storage_path")
        .gte("invoice_date", startISO)
        .lt("invoice_date", endISO)
        .order("invoice_date", { ascending: false })
        .limit(5);
      setRecentInvoices((periodInvoiceRows as RecentInvoice[]) || []);
    })();
  }, [viewType, selectedMonth, selectedDate, selectedWeek]);

  const downloadInvoice = async (inv: RecentInvoice) => {
    setDownloadingId(inv.id);
    try {
      const url = (await fetchInvoiceDownloadUrl(inv.id)) || inv.pdf_url;
      if (!url) {
        toast.error("Invoice PDF is not available yet.");
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Could not download invoice");
    } finally {
      setDownloadingId(null);
    }
  };

  const cards = [
    { label: "Orders", value: stats.orders, icon: Package, color: "text-amber-500" },
    { label: "Invoices", value: stats.invoices, icon: FileText, color: "text-primary" },
    { label: "Emails", value: stats.emails, icon: Mail, color: "text-blue-400" },
    { label: "Webhooks", value: stats.webhooks, icon: Webhook, color: "text-purple-400" },
    { label: "Automation Jobs", value: stats.jobs, icon: GitBranch, color: "text-rose-400" },
  ];

  const avgOrderValue =
    dashboardStats.orders > 0 ? Math.round(dashboardStats.revenue / dashboardStats.orders) : 0;

  const sortedServiceStats = [...serviceStats].sort((a, b) => b.revenue - a.revenue);

  // Compact metric cards for the Period Dashboard section (Orders/Invoices/
  // Revenue/Avg Order Value) — replaces the four bare oversized numbers.
  const periodCards: { label: string; value: string | number; icon: typeof Package; tone: MetricTone }[] = [
    { label: "Orders", value: dashboardStats.orders, icon: Package, tone: "blue" },
    { label: "Invoices", value: dashboardStats.invoices, icon: FileText, tone: "purple" },
    { label: "Revenue", value: `₹${dashboardStats.revenue.toLocaleString()}`, icon: Wallet, tone: "green" },
    { label: "Avg Order Value", value: `₹${avgOrderValue.toLocaleString()}`, icon: TrendingUp, tone: "orange" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-card to-background p-6">
        <h2 className="font-display text-xl font-semibold text-foreground">Ankshaastra Operations Platform</h2>
        <p className="text-muted-foreground mt-2 text-sm max-w-2xl">
          Central hub for empower.ankshaastra.com, miraclebaby.ankshaastra.com, ankshaastra.com, and ankshaastra.in —
          orders, GST invoices, email notifications, and workflow orchestration.
        </p>
      </div>

      {/* All-time overview — intentionally labeled and visually separated from the
          period-filtered section below, since these are all-time counts, not
          scoped to the Monthly/Financial Year + selector further down. */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Overview (All-Time)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold font-display">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2">
            Period Dashboard
            <span className="text-xs font-normal text-muted-foreground">
              (filtered by selection below)
            </span>
          </CardTitle>
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={viewType} onValueChange={(v) => setViewType(v as ViewType)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Financial Year</SelectItem>
              </SelectContent>
            </Select>

            {viewType === "daily" && (
              <Input
                type="date"
                className="w-40"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
              />
            )}

            {viewType === "weekly" && (
              <Input
                type="week"
                className="w-40"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                max={getCurrentISOWeek()}
              />
            )}

            {(viewType === "monthly" || viewType === "yearly") && (
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        {viewType === "weekly" && (
          <p className="text-xs text-muted-foreground px-6 -mt-3 pb-2">
            Showing {getDateFromISOWeek(selectedWeek).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – {(() => {
              const sunday = new Date(getDateFromISOWeek(selectedWeek));
              sunday.setDate(sunday.getDate() + 6);
              return sunday.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
            })()}.
          </p>
        )}
        {viewType === "yearly" && (
          <p className="text-xs text-muted-foreground px-6 -mt-3 pb-2">
            Showing 1 Apr {selectedMonth} – 31 Mar {Number(selectedMonth) + 1}.
          </p>
        )}

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {periodCards.map((c) => (
              <PeriodMetricCard key={c.label} label={c.label} value={c.value} icon={c.icon} tone={c.tone} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">Recent Invoices</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/invoices">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentInvoices.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No invoices generated yet.</p>
          ) : (
            <div className="space-y-2">
              {recentInvoices.map((inv) => (
                <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 border border-border rounded-lg p-3">
                  <div>
                    <p className="font-semibold text-sm text-primary">{inv.invoice_number}</p>
                    <p className="text-xs text-muted-foreground">{inv.customer_name} · {inv.service_title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">₹{Number(inv.total_amount).toLocaleString()}</span>
                    <Badge
                      variant="outline"
                      className={cn("text-xs font-medium capitalize", getInvoiceStatusClass(inv.status))}
                    >
                      {inv.status}
                    </Badge>
                    {(inv.pdf_storage_path || inv.pdf_url) && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={downloadingId === inv.id}
                        onClick={() => downloadInvoice(inv)}
                      >
                        {downloadingId === inv.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Wise Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          {serviceStats.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No data for this period.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Horizontal bar chart, sorted by revenue — replaces the pie chart,
                  which had overlapping labels and required decoding a 6-color legend. */}
              <ResponsiveContainer width="100%" height={Math.max(300, sortedServiceStats.length * 45)}>
                <BarChart
                  data={sortedServiceStats}
                  layout="vertical"
                  margin={{ top: 5, right: 30, bottom: 5, left: 20 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                    {sortedServiceStats.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="space-y-3">
                {sortedServiceStats.map((item) => (
                  <div key={item.name} className="border rounded-lg p-3 flex justify-between">
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-gray-500">Orders : {item.value}</div>
                    </div>
                    <div className="font-bold">₹{item.revenue.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;

