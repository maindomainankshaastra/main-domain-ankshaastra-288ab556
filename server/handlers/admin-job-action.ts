import { getUserFromAuthHeader, hasModuleAccess } from "../lib/auth-api.js";
import { getSupabaseAdmin } from "../lib/supabase-admin.js";
import { processPendingJobs } from "../lib/job-processor.js";

type Req = {
  method?: string;
  headers?: { authorization?: string; Authorization?: string };
  body?: { jobId?: string; action?: string };
};

type Res = {
  status: (n: number) => { json: (o: unknown) => void; end: () => void };
};

// Itne minute se kam purana "processing" job sach me chal raha ho sakta hai,
// use chhedna nahi hai.
const STUCK_AFTER_MINUTES = 10;

/**
 * POST /api/admin/job-action — admin-only.
 * body: { jobId: string, action: "retry" | "run" }
 *
 *  - retry: job ko wapas pending karta hai, attempts 0 karta hai, aur turant chalata hai
 *  - run:   job ko abhi chalata hai (attempts jaise the waise rehte hain)
 */
export default async function handler(req: Req, res: Res) {
  if (req.method !== "POST") return res.status(405).end();

  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const user = await getUserFromAuthHeader(authHeader);
  if (!user || !(await hasModuleAccess(user.id, "workflows"))) {
    return res.status(403).json({ error: "Admin access required" });
  }

  const jobId = String(req.body?.jobId || "").trim();
  const action = String(req.body?.action || "").trim();

  if (!jobId) return res.status(400).json({ error: "jobId is required" });
  if (action !== "retry" && action !== "run") {
    return res.status(400).json({ error: 'action must be "retry" or "run"' });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: job, error } = await supabase
      .from("automation_jobs")
      .select("id, status, attempts, max_attempts, started_at")
      .eq("id", jobId)
      .maybeSingle();

    if (error || !job) return res.status(404).json({ error: "Job not found" });

    if (job.status === "completed") {
      return res.status(400).json({ error: "Job is already completed" });
    }

    // Sach me chal raha job beech me na rok dein
    if (job.status === "processing" && job.started_at) {
      const ageMin = (Date.now() - new Date(job.started_at).getTime()) / 60000;
      if (ageMin < STUCK_AFTER_MINUTES) {
        return res.status(409).json({
          error: `Job abhi chal raha hai (${Math.round(ageMin)} min se). ${STUCK_AFTER_MINUTES} min baad try karein.`,
        });
      }
    }

    const maxAttempts = job.max_attempts || 5;
    if (action === "run" && (job.attempts || 0) >= maxAttempts) {
      return res.status(400).json({
        error: "Is job ke saare attempts khatam ho gaye hain. Retry use karein.",
      });
    }

    const update: Record<string, unknown> = {
      status: "pending",
      scheduled_at: new Date().toISOString(),
      last_error: null,
      completed_at: null,
    };
    if (action === "retry") update.attempts = 0;

    const { error: updateError } = await supabase
      .from("automation_jobs")
      .update(update)
      .eq("id", jobId);
    if (updateError) return res.status(500).json({ error: updateError.message });

    const results = await processPendingJobs(10);
    const mine = results.find((r) => r.id === jobId);

    if (!mine) {
      return res.status(202).json({
        ok: true,
        queued: true,
        message: "Job queue me daal diya gaya hai, thodi der me chalega.",
      });
    }

    if (!mine.ok) {
      return res.status(200).json({ ok: false, error: mine.error || "Job failed" });
    }

    return res.status(200).json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Job action failed";
    console.error("[admin-job-action]", msg, e);
    return res.status(500).json({ error: msg });
  }
}
