import { supabase } from "@/integrations/supabase/client";

export async function sendTestEmail(to: string) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("Not signed in");

  const res = await fetch("/api/email/test", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to }),
  });

  const body = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
    messageId?: string;
    smtp?: Record<string, boolean>;
  };

  if (!res.ok) {
    throw new Error(body.error || "Test email failed");
  }

  return body;
}
