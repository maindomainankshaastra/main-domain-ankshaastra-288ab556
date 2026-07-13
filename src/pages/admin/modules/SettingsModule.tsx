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
    <AdminPage title="GST Configuration" description="Legal entity, SAC codes, invoice numbering, bank details, and GSTR filing settings." loading={loading}>
      <div className="grid gap-4 max-w-lg">
        <div><Label>Legal Business Name</Label><Input value={String(form.legal_name || "")} onChange={(e) => setForm({ ...form, legal_name: e.target.value })} placeholder="As on GST registration" /></div>
        <div><Label>Trade Name</Label><Input value={String(form.trade_name || form.business_name || "")} onChange={(e) => setForm({ ...form, trade_name: e.target.value, business_name: e.target.value })} placeholder="Brand name on invoices" /></div>
        <div><Label>GSTIN</Label><Input value={String(form.gstin || "")} onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })} /></div>
        <div><Label>PAN</Label><Input value={String(form.pan || "")} onChange={(e) => setForm({ ...form, pan: e.target.value })} /></div>
        <div><Label>Registered State</Label><Input value={String(form.registered_state || "Uttar Pradesh")} onChange={(e) => setForm({ ...form, registered_state: e.target.value })} /></div>
        <div><Label>State Code</Label><Input value={String(form.state_code || "09")} onChange={(e) => setForm({ ...form, state_code: e.target.value })} placeholder="09 for Uttar Pradesh" /></div>
        <div><Label>Default SAC Code</Label><Input value={String(form.default_sac_code || "999799")} onChange={(e) => setForm({ ...form, default_sac_code: e.target.value })} placeholder="999799" /><p className="text-xs text-muted-foreground mt-1">Online services SAC (not HSN). All invoices inherit this code.</p></div>
        <div><Label>Default GST Rate %</Label><Input type="number" value={String(form.default_gst_rate ?? 18)} onChange={(e) => setForm({ ...form, default_gst_rate: e.target.value })} /></div>
        <div><Label>Invoice Prefix</Label><Input value={String(form.invoice_prefix || "INV")} onChange={(e) => setForm({ ...form, invoice_prefix: e.target.value })} placeholder="e.g. EYN26-27K-7000" /><p className="text-xs text-muted-foreground mt-1">Invoice numbers are generated as prefix + sequence.</p></div>
        <div><Label>Financial Year</Label><Input value={String(form.financial_year || "")} onChange={(e) => setForm({ ...form, financial_year: e.target.value })} placeholder="e.g. 2025-26" /></div>
        <div><Label>GST Filing Frequency</Label><Input value={String(form.gst_filing_frequency || "monthly")} onChange={(e) => setForm({ ...form, gst_filing_frequency: e.target.value })} placeholder="monthly or quarterly" /></div>
        <div><Label>Address</Label><Textarea value={String(form.address || "")} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
        <div><Label>Business Phone</Label><Input value={String(form.business_phone || "")} onChange={(e) => setForm({ ...form, business_phone: e.target.value })} placeholder="+91 9667305577" /></div>
        <div><Label>Business Email</Label><Input value={String(form.business_email || "")} onChange={(e) => setForm({ ...form, business_email: e.target.value })} placeholder="social@ankshaastra.com" /></div>
        <div><Label>Website</Label><Input value={String(form.website_url || "")} onChange={(e) => setForm({ ...form, website_url: e.target.value })} placeholder="www.ankshaastra.com" /></div>
        <div><Label>Bank Name</Label><Input value={String(form.bank_name || "")} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} /></div>
        <div><Label>Bank Account Number</Label><Input value={String(form.bank_account || "")} onChange={(e) => setForm({ ...form, bank_account: e.target.value })} /></div>
        <div><Label>Bank IFSC</Label><Input value={String(form.bank_ifsc || "")} onChange={(e) => setForm({ ...form, bank_ifsc: e.target.value })} /></div>
        <div><Label>Bank Branch</Label><Input value={String(form.bank_branch || "")} onChange={(e) => setForm({ ...form, bank_branch: e.target.value })} placeholder="ALIGARH" /></div>
        <div><Label>UPI ID</Label><Input value={String(form.upi_id || "")} onChange={(e) => setForm({ ...form, upi_id: e.target.value })} /></div>
        <div className="flex items-center gap-2"><Switch checked={!!form.is_gst_inclusive_default} onCheckedChange={(v) => setForm({ ...form, is_gst_inclusive_default: v })} /><Label>GST-inclusive pricing</Label></div>
        <div>
          <Label>Thank You Message (Email &amp; Invoice)</Label>
          <Textarea
            value={String(form.thank_you_message || "")}
            onChange={(e) => setForm({ ...form, thank_you_message: e.target.value })}
            placeholder="Shown on payment confirmation emails and tax invoices after payment."
            rows={4}
          />
        </div>
        <div>
          <Label>Invoice Footer</Label>
          <Textarea
            value={String(form.invoice_footer || "")}
            onChange={(e) => setForm({ ...form, invoice_footer: e.target.value })}
            placeholder="Footer note printed on the invoice (e.g. thank you or support contact)."
            rows={4}
          />
        </div>
        <div>
          <Label>Terms &amp; Conditions (Professional Version)</Label>
          <Textarea
            value={String(form.terms_conditions || "")}
            onChange={(e) => setForm({ ...form, terms_conditions: e.target.value })}
            placeholder="Professional terms and conditions displayed at the bottom of the invoice."
            rows={6}
          />
        </div>
        <Button onClick={save} disabled={saving}>Save Settings</Button>
      </div>
    </AdminPage>
  );
}
