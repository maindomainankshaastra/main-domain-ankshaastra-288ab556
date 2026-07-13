import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminTable } from "@/hooks/useAdminData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Product = {
  id: string;
  sku: string | null;
  title: string;
  description: string | null;
  category: string | null;
  price: number;
  gst_rate: number;
  hsn_sac_code: string | null;
  is_active: boolean;
};

const blank: Omit<Product, "id"> = {
  sku: "",
  title: "",
  description: "",
  category: "",
  price: 0,
  gst_rate: 18,
  hsn_sac_code: "",
  is_active: true,
};

export default function PricingModule() {
  const { rows: products, loading, reload } = useAdminTable<Product>("product_catalog");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(blank);
  const [saving, setSaving] = useState(false);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      gst_rate: Number(form.gst_rate),
    };
    const { error } = editing
      ? await supabase.from("product_catalog").update(payload).eq("id", editing.id)
      : await supabase.from("product_catalog").insert(payload);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Saved");
      setOpen(false);
      reload();
    }
  };

  return (
    <AdminPage
      title="Pricing Management"
      description="Manage active product and pricing catalog entries centralized for the operations console."
      loading={loading}
      empty={!products.length}
      emptyMessage='No pricing entries yet. Click "New Item" to add.'
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setForm(blank); }}><Plus className="w-4 h-4 mr-2" />New Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Pricing Item</DialogTitle></DialogHeader>
            <form onSubmit={save} className="space-y-3">
              <div><Label>SKU</Label><Input value={form.sku || ""} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div><Label>Description</Label><Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Category</Label><Input value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
                <div><Label>HSN / SAC</Label><Input value={form.hsn_sac_code || ""} onChange={(e) => setForm({ ...form, hsn_sac_code: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Price</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required /></div>
                <div><Label>GST %</Label><Input type="number" value={form.gst_rate} onChange={(e) => setForm({ ...form, gst_rate: Number(e.target.value) })} required /></div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(value) => setForm({ ...form, is_active: value })} /><Label>Active</Label></div>
              <DialogFooter><Button type="submit" disabled={saving}>Save</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-2">
        {products.map((product) => (
          <div key={product.id} className="border border-border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <p className="font-semibold">
                {product.title} {product.sku && <span className="text-xs text-muted-foreground">({product.sku})</span>}
                {!product.is_active && <Badge variant="secondary" className="ml-2">Inactive</Badge>}
              </p>
              <p className="text-sm text-muted-foreground">{product.category || "Uncategorized"} · GST {Number(product.gst_rate).toFixed(2)}%</p>
              {product.description && <p className="text-sm text-muted-foreground mt-1">{product.description}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">₹{Number(product.price).toLocaleString()}</span>
              <Button size="icon" variant="outline" onClick={() => { setEditing(product); setForm({ sku: product.sku || "", title: product.title, description: product.description || "", category: product.category || "", price: product.price, gst_rate: product.gst_rate, hsn_sac_code: product.hsn_sac_code || "", is_active: product.is_active }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
              <Button size="icon" variant="outline" onClick={async () => { if (confirm("Delete this item?")) { await supabase.from("product_catalog").delete().eq("id", product.id); reload(); } }}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </AdminPage>
  );
}
