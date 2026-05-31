import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminTable } from "@/hooks/useAdminData";
import { existingServicePages } from "@/data/servicePages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

type Service = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  price: number;
  gst_rate: number;
  hsn_sac_code: string | null;
  is_active: boolean;
};

const blank = { title: "", description: "", category: "", price: 0, gst_rate: 18, hsn_sac_code: "", is_active: true };

export default function ServicesModule() {
  const { rows: services, loading, reload } = useAdminTable<Service>("services");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const missingPageServices = existingServicePages.filter(
    (page) => !services.some((service) => service.title === page.title)
  );

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, price: Number(form.price), gst_rate: Number(form.gst_rate) };
    const { error } = editing
      ? await supabase.from("services").update(payload).eq("id", editing.id)
      : await supabase.from("services").insert(payload);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Saved"); setOpen(false); reload(); }
  };

  const addPageService = async (page: typeof existingServicePages[number]) => {
    const payload = {
      title: page.title,
      description: page.description,
      category: page.category,
      price: page.price,
      gst_rate: page.gst_rate,
      hsn_sac_code: null,
      is_active: true,
    };

    const { error } = await supabase.from("services").insert(payload);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Added ${page.title}`);
      reload();
    }
  };

  return (
    <AdminPage
      title="Service Catalog"
      description="Manage the live site services currently available to customers. For landing pages, packages, and publish workflow, use Pages & Packages."
      loading={loading}
      empty={!services.length && !missingPageServices.length}
      emptyMessage='No services. Click "New Service" to add.'
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setForm(blank); }}><Plus className="w-4 h-4 mr-2" />New</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Service</DialogTitle></DialogHeader>
            <form onSubmit={save} className="space-y-3">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Price</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
                <div><Label>GST %</Label><Input type="number" value={form.gst_rate} onChange={(e) => setForm({ ...form, gst_rate: Number(e.target.value) })} /></div>
              </div>
              <DialogFooter><Button type="submit" disabled={saving}>Save</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      {missingPageServices.length > 0 && (
        <div className="border border-border rounded-2xl p-4 mb-4 bg-muted/70">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">Detected existing service pages</p>
              <p className="text-sm text-muted-foreground">These pages already exist in the app but are not yet in the live service catalog.</p>
            </div>
          </div>
          <div className="grid gap-3">
            {missingPageServices.map((page) => (
              <div key={page.route} className="rounded-xl border border-border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="font-semibold">{page.title}</p>
                  <p className="text-sm text-muted-foreground">{page.category} · ₹{page.price.toLocaleString()} · {page.gst_rate}% GST</p>
                </div>
                <Button size="sm" onClick={() => addPageService(page)}>Add to Catalog</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {services.map((s) => (
          <div key={s.id} className="border border-border rounded-lg p-4 flex justify-between gap-3">
            <div>
              <p className="font-semibold">{s.title} {!s.is_active && <Badge variant="secondary">Off</Badge>}</p>
              <p className="text-sm text-muted-foreground">{s.category} · GST {s.gst_rate}%</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">₹{Number(s.price).toLocaleString()}</span>
              <Button size="icon" variant="outline" onClick={() => { setEditing(s); setForm({ ...s, description: s.description || "", category: s.category || "", hsn_sac_code: s.hsn_sac_code || "" }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
              <Button size="icon" variant="outline" onClick={async () => { if (confirm("Delete?")) { await supabase.from("services").delete().eq("id", s.id); reload(); } }}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </AdminPage>
  );
}
