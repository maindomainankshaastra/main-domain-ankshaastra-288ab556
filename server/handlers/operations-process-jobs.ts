import { verifyApiKey } from "../lib/webhook-utils.js";
import { processPendingJobs } from "../lib/job-processor.js";

export default async function handler(req: any, res: any) {
  const cronSecret = process.env.CRON_SECRET;
  const apiKey = req.headers["x-api-key"] as string | undefined;
  const authHeader = req.headers?.authorization || req.headers?.Authorization;

  const authorized =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    verifyApiKey(apiKey) ||
    (process.env.VERCEL === "1" && req.headers?.["x-vercel-cron"] === "1" && cronSecret);

  if (!authorized) return res.status(401).json({ error: "Unauthorized" });

  const results = await processPendingJobs(20);
  return res.status(200).json({ processed: results.length, results });
}
