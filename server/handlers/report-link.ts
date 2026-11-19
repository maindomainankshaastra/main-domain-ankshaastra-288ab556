import { getSupabaseAdmin } from "../lib/supabase-admin.js";

type Req = { method?: string; query?: Record<string, string | string[] | undefined> };
type Res = {
  setHeader?: (name: string, value: string) => void;
  status: (n: number) => { json: (o: unknown) => void; end: () => void; send?: (body: string) => void };
  redirect?: (status: number, url: string) => void;
};

const TABLES = ["perfect_baby_name_reports", "complete_baby_blueprint_reports", "name_correction_reports"] as const;

/**
 * GET /r/<report id>  (rewritten to /api/r?id=<report id> in vercel.json)
 * Short, public link for the customer's report PDF. It looks up the report and redirects to its current pdf_url, so
 * the WhatsApp message carries a short link instead of the long storage URL. A regenerated PDF is picked up
 * automatically because the redirect is read fresh each time.
 */
export default async function handler(req: Req, res: Res) {
  if (req.method !== "GET" && req.method !== "HEAD") return res.status(405).end();

  const raw = req.query?.id;
  const id = String(Array.isArray(raw) ? raw[0] : raw ?? "").trim();
  if (!/^[A-Za-z0-9-]{6,60}$/.test(id)) return res.status(400).json({ error: "Invalid report link" });

  try {
    const supabase = getSupabaseAdmin();
    for (const table of TABLES) {
      const { data } = await supabase.from(table).select("pdf_url").eq("report_id", id).maybeSingle();
      const url = (data as { pdf_url?: string | null } | null)?.pdf_url;
      if (url && /^https:\/\//i.test(url)) {
        res.setHeader?.("Cache-Control", "no-store");
        res.setHeader?.("Location", url);
        return res.status(302).end();
      }
    }
    return res.status(404).json({ error: "Report not found or not ready yet" });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? "Could not open the report" });
  }
}
