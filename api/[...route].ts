import { attachJsonBody } from "./lib/parse-body.js";
import createOrder from "../server/handlers/create-order.js";
import services from "../server/handlers/services.js";
import verifyPayment from "../server/handlers/verify-payment.js";
import syncPayment from "../server/handlers/sync-payment.js";
import invoicesGenerate from "../server/handlers/invoices-generate.js";
import invoicesCompleteOrder from "../server/handlers/invoices-complete-order.js";
import invoicesDownload from "../server/handlers/invoices-download.js";
import webhooksRazorpay from "../server/handlers/webhooks-razorpay.js";
import operationsProcessJobs from "../server/handlers/operations-process-jobs.js";
import operationsRetryJob from "../server/handlers/operations-retry-job.js";
import operationsOrderIngest from "../server/handlers/operations-order-ingest.js";
import operationsBackfillInvoices from "../server/handlers/operations-backfill-invoices.js";
import emailTest from "../server/handlers/email-test.js";

/** Single serverless function for all /api/* routes (Vercel Hobby: max 12 functions). */
export const config = { api: { bodyParser: false } };

type ApiHandler = (req: unknown, res: unknown) => Promise<unknown> | unknown;

const routes: Record<string, ApiHandler> = {
  "create-order": createOrder,
  services,
  "verify-payment": verifyPayment,
  "sync-payment": syncPayment,
  "invoices/generate": invoicesGenerate,
  "invoices/complete-order": invoicesCompleteOrder,
  "invoices/download": invoicesDownload,
  "webhooks/razorpay": webhooksRazorpay,
  "operations/process-jobs": operationsProcessJobs,
  "operations/retry-job": operationsRetryJob,
  "operations/order-ingest": operationsOrderIngest,
  "operations/backfill-invoices": operationsBackfillInvoices,
  "email/test": emailTest,
};

function resolveRoute(req: { query?: Record<string, string | string[] | undefined> }): string {
  const param = req.query?.route;
  if (Array.isArray(param)) return param.join("/");
  return param ? String(param) : "";
}

export default async function handler(req: Parameters<ApiHandler>[0], res: Parameters<ApiHandler>[1]) {
  const routeKey = resolveRoute(req as { query?: Record<string, string | string[] | undefined> });
  const routeHandler = routes[routeKey];

  if (!routeHandler) {
    return (res as { status: (n: number) => { json: (o: unknown) => void } })
      .status(404)
      .json({ error: "Not found", path: routeKey || "(empty)" });
  }

  if (routeKey !== "webhooks/razorpay") {
    await attachJsonBody(req as Parameters<typeof attachJsonBody>[0]);
  }

  return routeHandler(req, res);
}
