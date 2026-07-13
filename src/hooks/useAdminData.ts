import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAdminTable<T extends Record<string, unknown>>(
  table: string,
  orderBy = "created_at",
  ascending = false
) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as { from: (t: string) => ReturnType<typeof supabase.from> })
      .from(table)
      .select("*")
      .order(orderBy, { ascending });
    if (!error) setRows((data as T[]) || []);
    setLoading(false);
  }, [table, orderBy, ascending]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { rows, loading, reload };
}
