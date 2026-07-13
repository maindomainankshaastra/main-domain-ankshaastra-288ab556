import { getSupabaseAdmin } from "../lib/supabase-admin.js";

export default async function handler(
  req: { method?: string; query?: Record<string, string | string[]> },
  res: { status: (n: number) => { json: (o: unknown) => void; end: () => void } },
) {
  if (req.method !== "GET") return res.status(405).end();

  const slug = typeof req.query?.slug === "string" ? req.query.slug : undefined;

  try {
    const supabase = getSupabaseAdmin();

    if (slug) {
      const { data: page, error } = await supabase
        .from("service_pages")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error) {
        if (error.code === "42P01" || error.message?.includes("service_pages")) {
          return res.status(404).json({ error: "Page not found" });
        }
        return res.status(500).json({ error: error.message });
      }
      if (!page) return res.status(404).json({ error: "Page not found" });

      const { data: packages } = await supabase
        .from("service_packages")
        .select("*")
        .eq("page_id", page.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      return res.status(200).json({ page, packages: packages || [] });
    }

    const { data, error } = await supabase
      .from("service_pages")
      .select("id, slug, route, page_type, title, subtitle, description, category, status, sort_order, published_at")
      .eq("status", "published")
      .order("sort_order", { ascending: true });

    if (error) {
      // Table may not exist until migration is applied — treat as empty catalog.
      if (error.code === "42P01" || error.message?.includes("service_pages")) {
        return res.status(200).json({ pages: [] });
      }
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ pages: data || [] });
  } catch (error) {
    console.error("Service pages API error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
