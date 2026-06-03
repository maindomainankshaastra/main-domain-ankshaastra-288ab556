import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage } from "@/components/admin/AdminPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

async function loadGstConfig(token: string) {
  const res = await fetch("/api/admin/gst-config", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = (await res.json().catch(() => ({}))) as { config?: Record<string, unknown>; error?: string };
  if (!res.ok) throw new Error(body.error || "Could not load GST settings");
  return body.config || {};
}

async function saveGstConfig(token: string, form: Record<string, unknown>) {
  const res = await fetch("/api/admin/gst-config", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form),
  });
  const body = (await res.json().catch(() => ({}))) as { error?: string; used_optional_columns?: boolean };
  if (!res.ok) throw new Error(body.error || "Could not save GST settings");
  return body;
}

export default function SettingsModule() {
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) {
          toast.error("Not signed in");
          return;
        }
        setForm(await loadGstConfig(token));
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "Could not load GST settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    if (!form.id) return;
    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Not signed in");

      await saveGstConfig(token, form);
      setForm(await loadGstConfig(token));
      toast.success("GST settings saved");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not save GST settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPage title="GST & Billing Settings" description="Manage GST settings, invoice numbering, bank details, logo, and billing footer terms." loading={loading}>
      <div className="grid gap-4 max-w-lg">
        <div><Label>Business Name</Label><Input value={String(form.business_name || "")} onChange={(e) => setForm({ ...form, business_name: e.target.value })} /></div>
        <div><Label>Legal Name</Label><Input value={String(form.legal_name || "")} onChange={(e) => setForm({ ...form, legal_name: e.target.value })} placeholder="As printed on invoice" /></div>
        <div><Label>GSTIN</Label><Input value={String(form.gstin || "")} onChange={(e) => setForm({ ...form, gstin: e.target.value })} /></div>
        <div><Label>PAN</Label><Input value={String(form.pan || "")} onChange={(e) => setForm({ ...form, pan: e.target.value })} /></div>
        <div><Label>Address</Label><Textarea value={String(form.address || "")} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
        <div><Label>State Code</Label><Input value={String(form.state_code || "09")} onChange={(e) => setForm({ ...form, state_code: e.target.value })} placeholder="e.g. 09 for Uttar Pradesh" /></div>
        <div><Label>Business Phone</Label><Input value={String(form.business_phone || "")} onChange={(e) => setForm({ ...form, business_phone: e.target.value })} placeholder="+91 9667305577" /></div>
        <div><Label>Business Email</Label><Input value={String(form.business_email || "")} onChange={(e) => setForm({ ...form, business_email: e.target.value })} placeholder="social@ankshaastra.com" /></div>
        <div><Label>Website</Label><Input value={String(form.website_url || "")} onChange={(e) => setForm({ ...form, website_url: e.target.value })} placeholder="www.ankshaastra.com" /></div>
        <div><Label>Logo URL</Label><Input value={String(form.logo_url || "")} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://ankshaastra.com/logo.jpg" /></div>
        <div><Label>Default GST %</Label><Input type="number" value={String(form.default_gst_rate ?? 18)} onChange={(e) => setForm({ ...form, default_gst_rate: e.target.value })} /></div>
        <div><Label>Invoice Prefix</Label><Input value={String(form.invoice_prefix || "INV")} onChange={(e) => setForm({ ...form, invoice_prefix: e.target.value })} placeholder="e.g. EYN26-27K-7000" /><p className="text-xs text-muted-foreground mt-1">Invoice numbers are generated as prefix + sequence (e.g. EYN26-27K-70001, EYN26-27K-70002).</p></div>
        <div><Label>Bank Name</Label><Input value={String(form.bank_name || "")} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} /></div>
        <div><Label>Bank Account Number</Label><Input value={String(form.bank_account || "")} onChange={(e) => setForm({ ...form, bank_account: e.target.value })} /></div>
        <div><Label>Bank IFSC</Label><Input value={String(form.bank_ifsc || "")} onChange={(e) => setForm({ ...form, bank_ifsc: e.target.value })} /></div>
        <div><Label>Bank Branch</Label><Input value={String(form.bank_branch || "")} onChange={(e) => setForm({ ...form, bank_branch: e.target.value })} placeholder="ALIGARH" /></div>
        <div><Label>UPI ID</Label><Input value={String(form.upi_id || "")} onChange={(e) => setForm({ ...form, upi_id: e.target.value })} /></div>
        <div className="flex items-center gap-2"><Switch checked={!!form.is_gst_inclusive_default} onCheckedChange={(v) => setForm({ ...form, is_gst_inclusive_default: v })} /><Label>GST-inclusive pricing</Label></div>
        <div><Label>Invoice Footer</Label><Textarea value={String(form.terms_footer || "")} onChange={(e) => setForm({ ...form, terms_footer: e.target.value })} /></div>
        <Button onClick={save} disabled={saving}>Save Settings</Button>
      </div>
    </AdminPage>
  );
}
