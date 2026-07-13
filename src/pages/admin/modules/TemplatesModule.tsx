// import { AdminPage } from "@/components/admin/AdminPage";
// import { useAdminTable } from "@/hooks/useAdminData";
// import { Badge } from "@/components/ui/badge";

// export default function TemplatesModule() {
//   const { rows, loading } = useAdminTable<Record<string, unknown>>("communication_templates");
//   return (
//     <AdminPage title="Template Manager" description="Email notification templates." loading={loading} empty={!rows.length}>
//       <div className="space-y-2">
//         {rows.map((t) => (
//           <div key={String(t.id)} className="border border-border rounded-lg p-4 flex justify-between">
//             <div>
//               <p className="font-semibold">{String(t.name)}</p>
//               <p className="text-xs text-muted-foreground font-mono">{String(t.slug)}</p>
//             </div>
//             <Badge variant="outline">{String(t.channel)}</Badge>
//           </div>
//         ))}
//       </div>
//     </AdminPage>
//   );
// }


import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminTable } from "@/hooks/useAdminData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type CommunicationTemplate = {
  id: string;
  slug: string;
  channel: string;
  name: string;
  subject: string | null;
  body_html: string | null;
  body_text: string | null;
  whatsapp_template_name: string | null;
  variables: unknown;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type EditForm = {
  name: string;
  subject: string;
  body_html: string;
  body_text: string;
  whatsapp_template_name: string;
  variablesText: string;
  is_active: boolean;
};

function toEditForm(t: CommunicationTemplate): EditForm {
  return {
    name: t.name || "",
    subject: t.subject || "",
    body_html: t.body_html || "",
    body_text: t.body_text || "",
    whatsapp_template_name: t.whatsapp_template_name || "",
    variablesText: JSON.stringify(t.variables ?? {}, null, 2),
    is_active: !!t.is_active,
  };
}

export default function TemplatesModule() {
  const { rows, loading, reload } = useAdminTable<CommunicationTemplate>("communication_templates");

  const [selected, setSelected] = useState<CommunicationTemplate | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);

  const openTemplate = (t: CommunicationTemplate) => {
    setSelected(t);
    setForm(toEditForm(t));
    setOpen(true);
  };

  const closeDialog = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      // Cancel / close discards any unsaved edits.
      setSelected(null);
      setForm(null);
    }
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected || !form) return;

    let variables: unknown;
    try {
      variables = form.variablesText.trim() ? JSON.parse(form.variablesText) : {};
    } catch {
      toast.error("Variables must be valid JSON");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("communication_templates")
      .update({
        name: form.name,
        subject: form.subject || null,
        body_html: form.body_html || null,
        body_text: form.body_text || null,
        whatsapp_template_name: form.whatsapp_template_name || null,
        variables,
        is_active: form.is_active,
      })
      .eq("id", selected.id);

    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Template updated");
      closeDialog(false);
      reload();
    }
  };

  return (
    <AdminPage title="Template Manager" description="Email notification templates." loading={loading} empty={!rows.length}>
      <div className="space-y-2">
        {rows.map((t) => (
          <div
            key={String(t.id)}
            className="border border-border rounded-lg p-4 flex justify-between cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => openTemplate(t)}
          >
            <div>
              <p className="font-semibold">{String(t.name)}</p>
              <p className="text-xs text-muted-foreground font-mono">{String(t.slug)}</p>
            </div>
            <Badge variant="outline">{String(t.channel)}</Badge>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={closeDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.name || "Template"}</DialogTitle>
          </DialogHeader>

          {selected && form && (
            <form onSubmit={save} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Slug</Label>
                  <Input value={selected.slug} disabled readOnly />
                </div>
                <div>
                  <Label>Channel</Label>
                  <Input value={selected.channel} disabled readOnly />
                </div>
              </div>

              <div>
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Subject</Label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>

              <div>
                <Label>HTML Body</Label>
                <Textarea
                  value={form.body_html}
                  onChange={(e) => setForm({ ...form, body_html: e.target.value })}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label>Plain Text Body</Label>
                <Textarea
                  value={form.body_text}
                  onChange={(e) => setForm({ ...form, body_text: e.target.value })}
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label>WhatsApp Template Name</Label>
                <Input
                  value={form.whatsapp_template_name}
                  onChange={(e) => setForm({ ...form, whatsapp_template_name: e.target.value })}
                />
              </div>

              <div>
                <Label>Variables (JSON)</Label>
                <Textarea
                  value={form.variablesText}
                  onChange={(e) => setForm({ ...form, variablesText: e.target.value })}
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                />
                <Label>Active</Label>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground pt-1">
                <div>Created: {new Date(selected.created_at).toLocaleString()}</div>
                <div>Updated: {new Date(selected.updated_at).toLocaleString()}</div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => closeDialog(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}