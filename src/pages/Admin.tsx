import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, ShieldCheck, Package, Users, FileText, Briefcase } from "lucide-react";

interface Order { id: string; service_title: string; total_amount: number; status: string; created_at: string; user_id: string; razorpay_payment_id: string | null; }
interface Profile { user_id: string; full_name: string | null; email: string | null; phone: string | null; created_at: string; }
interface UserRole { user_id: string; role: "admin" | "moderator" | "user"; }
interface Invoice { id: string; invoice_number: string; customer_name: string; service_title: string; total_amount: number; invoice_date: string; status: string; }
interface Service { id: string; title: string; description: string | null; category: string | null; price: number; gst_rate: number; hsn_sac_code: string | null; is_active: boolean; }

const Admin = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    const [{ data: o }, { data: p }, { data: r }, { data: i }, { data: s }] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("invoices").select("*").order("invoice_date", { ascending: false }),
      supabase.from("services").select("*").order("created_at", { ascending: false }),
    ]);
    setOrders(o || []); setProfiles(p || []); setRoles((r as UserRole[]) || []);
    setInvoices(i || []); setServices(s || []); setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Order updated"); loadAll(); }
  };

  const setUserRole = async (userId: string, newRole: "admin" | "moderator" | "user") => {
    // Delete existing roles for user, then insert new one
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
    if (error) toast.error(error.message); else { toast.success("Role updated"); loadAll(); }
  };

  const roleFor = (uid: string) => roles.find(r => r.user_id === uid)?.role || "user";

  return (
    <Layout>
      <SEOHead title="Admin Dashboard" description="Internal admin dashboard for Ankshaastra to manage customer orders, user accounts, invoices, services, and content updates across the platform." />
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Full control over orders, users, invoices and services.</p>
          </div>
        </div>

        {loading ? <Loader2 className="w-8 h-8 animate-spin text-primary" /> : (
        <Tabs defaultValue="orders">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="orders"><Package className="w-4 h-4 mr-2" />Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />Users ({profiles.length})</TabsTrigger>
            <TabsTrigger value="invoices"><FileText className="w-4 h-4 mr-2" />Invoices ({invoices.length})</TabsTrigger>
            <TabsTrigger value="services"><Briefcase className="w-4 h-4 mr-2" />Services ({services.length})</TabsTrigger>
          </TabsList>

          {/* ORDERS */}
          <TabsContent value="orders" className="mt-6">
            <Card><CardHeader><CardTitle>All Orders</CardTitle></CardHeader><CardContent>
              {orders.length === 0 ? <p className="text-muted-foreground py-8 text-center">No orders yet.</p> :
                <div className="space-y-2">
                  {orders.map(o => (
                    <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 border border-border rounded-lg p-4">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{o.service_title}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">User: {o.user_id.slice(0, 8)}… · {new Date(o.created_at).toLocaleString()}</p>
                        {o.razorpay_payment_id && <p className="text-xs text-muted-foreground font-mono">Pay: {o.razorpay_payment_id}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">₹{Number(o.total_amount).toLocaleString()}</span>
                        <Select value={o.status} onValueChange={(v) => updateOrderStatus(o.id, v)}>
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["pending", "paid", "failed", "refunded", "cancelled"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>}
            </CardContent></Card>
          </TabsContent>

          {/* USERS */}
          <TabsContent value="users" className="mt-6">
            <Card><CardHeader><CardTitle>All Users</CardTitle><CardDescription>Promote users to admin or moderator.</CardDescription></CardHeader><CardContent>
              {profiles.length === 0 ? <p className="text-muted-foreground py-8 text-center">No users yet.</p> :
                <div className="space-y-2">
                  {profiles.map(p => (
                    <div key={p.user_id} className="flex flex-wrap items-center justify-between gap-3 border border-border rounded-lg p-4">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{p.full_name || "—"}</p>
                        <p className="text-sm text-muted-foreground truncate">{p.email} · {p.phone || "no phone"}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={roleFor(p.user_id) === "admin" ? "default" : "secondary"}>{roleFor(p.user_id)}</Badge>
                        <Select value={roleFor(p.user_id)} onValueChange={(v) => setUserRole(p.user_id, v as any)} disabled={p.user_id === user?.id}>
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>}
            </CardContent></Card>
          </TabsContent>

          {/* INVOICES */}
          <TabsContent value="invoices" className="mt-6">
            <Card><CardHeader><CardTitle>All Invoices</CardTitle></CardHeader><CardContent>
              {invoices.length === 0 ? <p className="text-muted-foreground py-8 text-center">No invoices yet.</p> :
                <div className="space-y-2">
                  {invoices.map(i => (
                    <div key={i.id} className="flex flex-wrap items-center justify-between gap-3 border border-border rounded-lg p-4">
                      <div className="min-w-0">
                        <p className="font-semibold">{i.invoice_number}</p>
                        <p className="text-sm text-muted-foreground truncate">{i.customer_name} · {i.service_title}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{new Date(i.invoice_date).toLocaleDateString()}</span>
                        <span className="font-semibold">₹{Number(i.total_amount).toLocaleString()}</span>
                        <Badge>{i.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>}
            </CardContent></Card>
          </TabsContent>

          {/* SERVICES */}
          <TabsContent value="services" className="mt-6">
            <ServicesAdmin services={services} reload={loadAll} />
          </TabsContent>
        </Tabs>
        )}
      </div>
    </Layout>
  );
};

const blankService = { title: "", description: "", category: "", price: 0, gst_rate: 18, hsn_sac_code: "", is_active: true };

const ServicesAdmin = ({ services, reload }: { services: Service[]; reload: () => void }) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<any>(blankService);
  const [saving, setSaving] = useState(false);

  const openNew = () => { setEditing(null); setForm(blankService); setOpen(true); };
  const openEdit = (s: Service) => { setEditing(s); setForm({ ...s, description: s.description || "", category: s.category || "", hsn_sac_code: s.hsn_sac_code || "" }); setOpen(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || form.price < 0) { toast.error("Title & valid price required"); return; }
    setSaving(true);
    const payload = { ...form, price: Number(form.price), gst_rate: Number(form.gst_rate) };
    const { error } = editing
      ? await supabase.from("services").update(payload).eq("id", editing.id)
      : await supabase.from("services").insert(payload);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success(editing ? "Service updated" : "Service created"); setOpen(false); reload(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); reload(); }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle>Services</CardTitle><CardDescription>Add, edit or disable services on the website.</CardDescription></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openNew}><Plus className="w-4 h-4 mr-2" />New Service</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "Edit Service" : "New Service"}</DialogTitle></DialogHeader>
            <form onSubmit={save} className="space-y-4">
              <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={200} required /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={1000} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} maxLength={100} /></div>
                <div className="space-y-2"><Label>HSN/SAC Code</Label><Input value={form.hsn_sac_code} onChange={(e) => setForm({ ...form, hsn_sac_code: e.target.value })} maxLength={20} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Price (₹) *</Label><Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
                <div className="space-y-2"><Label>GST %</Label><Input type="number" min="0" max="100" step="0.01" value={form.gst_rate} onChange={(e) => setForm({ ...form, gst_rate: e.target.value })} /></div>
              </div>
              <div className="flex items-center gap-3"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>Active</Label></div>
              <DialogFooter><Button type="submit" disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? <p className="text-muted-foreground py-8 text-center">No services yet. Click "New Service" to add one.</p> :
          <div className="space-y-2">
            {services.map(s => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 border border-border rounded-lg p-4">
                <div className="min-w-0">
                  <p className="font-semibold flex items-center gap-2">{s.title} {!s.is_active && <Badge variant="secondary">Inactive</Badge>}</p>
                  <p className="text-sm text-muted-foreground truncate">{s.category || "—"} · GST {s.gst_rate}%</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">₹{Number(s.price).toLocaleString()}</span>
                  <Button size="icon" variant="outline" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="outline" onClick={() => remove(s.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>}
      </CardContent>
    </Card>
  );
};

export default Admin;
