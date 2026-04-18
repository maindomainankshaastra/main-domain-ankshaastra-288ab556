import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Download, ShieldCheck, Package, FileText, User as UserIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface Order {
  id: string;
  service_title: string;
  total_amount: number;
  status: string;
  created_at: string;
}
interface Invoice {
  id: string;
  invoice_number: string;
  service_title: string;
  total_amount: number;
  invoice_date: string;
  pdf_url: string | null;
  status: string;
}

const Dashboard = () => {
  const { user, role, signOut } = useAuth();
  const [profile, setProfile] = useState({ full_name: "", phone: "", email: "" });
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: o }, { data: i }] = await Promise.all([
        supabase.from("profiles").select("full_name, phone, email").eq("user_id", user.id).maybeSingle(),
        supabase.from("orders").select("id, service_title, total_amount, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("invoices").select("id, invoice_number, service_title, total_amount, invoice_date, pdf_url, status").eq("user_id", user.id).order("invoice_date", { ascending: false }),
      ]);
      if (p) setProfile({ full_name: p.full_name || "", phone: p.phone || "", email: p.email || user.email || "" });
      else setProfile({ full_name: "", phone: "", email: user.email || "" });
      setOrders(o || []);
      setInvoices(i || []);
      setLoading(false);
    })();
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      user_id: user.id,
      full_name: profile.full_name,
      phone: profile.phone,
      email: profile.email,
    }, { onConflict: "user_id" });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  return (
    <Layout>
      <SEOHead title="My Dashboard | Ankshaastra" description="Manage your profile, orders and invoices." />
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground">My Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back{profile.full_name ? `, ${profile.full_name}` : ""}.</p>
          </div>
          <div className="flex gap-3">
            {role === "admin" && (
              <Button asChild variant="outline">
                <Link to="/admin"><ShieldCheck className="w-4 h-4 mr-2" />Admin Panel</Link>
              </Button>
            )}
            <Button variant="ghost" onClick={signOut}>Sign Out</Button>
          </div>
        </div>

        <Tabs defaultValue="orders">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="orders"><Package className="w-4 h-4 mr-2" />Orders</TabsTrigger>
            <TabsTrigger value="invoices"><FileText className="w-4 h-4 mr-2" />Invoices</TabsTrigger>
            <TabsTrigger value="profile"><UserIcon className="w-4 h-4 mr-2" />Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader><CardTitle>My Orders</CardTitle><CardDescription>All your service bookings & purchases.</CardDescription></CardHeader>
              <CardContent>
                {loading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> :
                  orders.length === 0 ? <p className="text-muted-foreground py-8 text-center">No orders yet. <Link to="/services" className="text-primary underline">Browse services</Link></p> :
                  <div className="space-y-3">
                    {orders.map(o => (
                      <div key={o.id} className="flex items-center justify-between border border-border rounded-lg p-4">
                        <div>
                          <p className="font-semibold text-foreground">{o.service_title}</p>
                          <p className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{Number(o.total_amount).toLocaleString()}</p>
                          <Badge variant={o.status === "paid" ? "default" : "secondary"}>{o.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                }
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="mt-6">
            <Card>
              <CardHeader><CardTitle>My Invoices</CardTitle><CardDescription>Download GST invoices for completed orders.</CardDescription></CardHeader>
              <CardContent>
                {loading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> :
                  invoices.length === 0 ? <p className="text-muted-foreground py-8 text-center">No invoices yet.</p> :
                  <div className="space-y-3">
                    {invoices.map(inv => (
                      <div key={inv.id} className="flex items-center justify-between border border-border rounded-lg p-4">
                        <div>
                          <p className="font-semibold text-foreground">{inv.invoice_number}</p>
                          <p className="text-sm text-muted-foreground">{inv.service_title} · {new Date(inv.invoice_date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">₹{Number(inv.total_amount).toLocaleString()}</span>
                          {inv.pdf_url ? (
                            <Button asChild size="sm" variant="outline">
                              <a href={inv.pdf_url} target="_blank" rel="noreferrer"><Download className="w-4 h-4 mr-1" />PDF</a>
                            </Button>
                          ) : <Badge variant="secondary">Pending</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                }
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Profile</CardTitle><CardDescription>Update your personal information.</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={saveProfile} className="space-y-4 max-w-md">
                  <div className="space-y-2"><Label>Full Name</Label>
                    <Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} maxLength={100} /></div>
                  <div className="space-y-2"><Label>Email</Label>
                    <Input type="email" value={profile.email} disabled /></div>
                  <div className="space-y-2"><Label>Phone</Label>
                    <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} maxLength={20} /></div>
                  <Button type="submit" disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save Changes</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
