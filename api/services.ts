import { getSupabaseAdmin } from "./lib/supabase-admin.js";

export default async function handler(req: { method?: string; query?: Record<string, string | string[]> }, res: { status: (n: number) => { json: (o: unknown) => void; end: () => void } }) {
  if (req.method !== "GET") return res.status(405).end();

  const title = typeof req.query?.title === "string" ? req.query.title : undefined;
  try {
    const supabase = getSupabaseAdmin();
    let query = supabase.from("services").select("id,title,description,category,price,gst_rate,is_active").eq("is_active", true);

    if (title) {
      query = query.ilike("title", title);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Failed to fetch services:", error);
      return res.status(500).json({ error: error.message });
    }

    if (title) {
      return res.status(200).json({ service: (data as unknown[])[0] ?? null });
    }

    return res.status(200).json({ services: data });
  } catch (error) {
    console.error("Services API error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
