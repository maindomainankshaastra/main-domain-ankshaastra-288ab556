import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage } from "@/components/admin/AdminPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function SettingsModule() {
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as { from: (t: string) => ReturnType<typeof supabase.from> })
        .from("gst_config")
        .select("*")
        .limit(1)
        .single();
      if (data) setForm(data as Record<string, unknown>);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    if (!form.id) return;
    setSaving(true);
    const { error } = await (supabase as { from: (t: string) => ReturnType<typeof supabase.from> })
      .from("gst_config")
      .update({
        business_name: form.business_name,
        gstin: form.gstin,
        address: form.address,
        default_gst_rate: Number(form.default_gst_rate),
        invoice_prefix: form.invoice_prefix,
        is_gst_inclusive_default: form.is_gst_inclusive_default,
        upi_id: form.upi_id,
        terms_footer: form.terms_footer,
      })
      .eq("id", form.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("GST settings saved");
  };

  return (
    <AdminPage title="GST & Billing Settings" description="Manage GST settings, invoice numbering, UPI, and billing footer terms." loading={loading}>
      <div className="grid gap-4 max-w-lg">
        <div><Label>Business Name</Label><Input value={String(form.business_name || "")} onChange={(e) => setForm({ ...form, business_name: e.target.value })} /></div>
        <div><Label>GSTIN</Label><Input value={String(form.gstin || "")} onChange={(e) => setForm({ ...form, gstin: e.target.value })} /></div>
        <div><Label>Address</Label><Textarea value={String(form.address || "")} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
        <div><Label>Default GST %</Label><Input type="number" value={String(form.default_gst_rate ?? 18)} onChange={(e) => setForm({ ...form, default_gst_rate: e.target.value })} /></div>
        <div><Label>Invoice Prefix</Label><Input value={String(form.invoice_prefix || "INV")} onChange={(e) => setForm({ ...form, invoice_prefix: e.target.value })} /></div>
        <div><Label>UPI ID</Label><Input value={String(form.upi_id || "")} onChange={(e) => setForm({ ...form, upi_id: e.target.value })} /></div>
        <div className="flex items-center gap-2"><Switch checked={!!form.is_gst_inclusive_default} onCheckedChange={(v) => setForm({ ...form, is_gst_inclusive_default: v })} /><Label>GST-inclusive pricing</Label></div>
        <div><Label>Invoice Footer</Label><Textarea value={String(form.terms_footer || "")} onChange={(e) => setForm({ ...form, terms_footer: e.target.value })} /></div>
        <Button onClick={save} disabled={saving}>Save Settings</Button>
      </div>
    </AdminPage>
  );
}
