import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type LegacyTable = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: [];
};

type LegacyDatabase = {
  public: {
    Tables: Record<string, LegacyTable>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

// Legacy admin modules address tables not present in the generated schema.
// Reuse the managed client and its session; missing tables still fail normally.
// This adapter changes only compile-time query shapes, never access policies.
export const legacyDatabase = supabase as unknown as SupabaseClient<LegacyDatabase>;