import { attachJsonBody } from "../server/lib/parse-body.js";
import createOrder from "../server/handlers/create-order.js";
import services from "../server/handlers/services.js";
import verifyPayment from "../server/handlers/verify-payment.js";
import syncPayment from "../server/handlers/sync-payment.js";
import invoicesGenerate from "../server/handlers/invoices-generate.js";
import invoicesCompleteOrder from "../server/handlers/invoices-complete-order.js";
import invoicesDownload from "../server/handlers/invoices-download.js";
import invoicesBulkDownload from "../server/handlers/invoices-bulk-download.js";
import invoicesBulkManifest from "../server/handlers/invoices-bulk-manifest.js";
import invoicesFile from "../server/handlers/invoices-file.js";
import invoicesGenerateAsync from "../server/handlers/invoices-generate-async.js";
import webhooksRazorpay from "../server/handlers/webhooks-razorpay.js";
import operationsProcessJobs from "../server/handlers/operations-process-jobs.js";
import operationsRetryJob from "../server/handlers/operations-retry-job.js";
import operationsOrderIngest from "../server/handlers/operations-order-ingest.js";
import operationsBackfillInvoices from "../server/handlers/operations-backfill-invoices.js";
import servicePages from "../server/handlers/service-pages.js";
import emailTest from "../server/handlers/email-test.js";
import adminGstConfig from "../server/handlers/admin-gst-config.js";
import adminGstrReports from "../server/handlers/admin-gstr-reports.js";
import adminGstMaintenance from "../server/handlers/admin-gst-maintenance.js";

/** Single serverless function for all /api/* routes (Vercel Hobby: max 12 functions). */
export const config = { api: { bodyParser: false } };

type ApiHandler = (req: unknown, res: unknown) => Promise<unknown> | unknown;

type IncomingReq = {
  query?: Record<string, string | string[] | undefined>;
  url?: string;
};

const routes: Record<string, ApiHandler> = {
  "create-order": createOrder,
  services,
  "verify-payment": verifyPayment,
  "sync-payment": syncPayment,
  "invoices/generate": invoicesGenerate,
  "invoices/generate-async": invoicesGenerateAsync,
  "invoices/complete-order": invoicesCompleteOrder,
  "invoices/download": invoicesDownload,
  "invoices/bulk-download": invoicesBulkDownload,
  "invoices/bulk-manifest": invoicesBulkManifest,
  "invoices/file": invoicesFile,
  "webhooks/razorpay": webhooksRazorpay,
  "operations/process-jobs": operationsProcessJobs,
  "operations/retry-job": operationsRetryJob,
  "operations/order-ingest": operationsOrderIngest,
  "operations/backfill-invoices": operationsBackfillInvoices,
  "service-pages": servicePages,
  "email/test": emailTest,
  "admin/gst-config": adminGstConfig,
  "admin/gstr-reports": adminGstrReports,
  "admin/gst-maintenance": adminGstMaintenance,
};

function resolveRoute(req: IncomingReq): string {
  const param = req.query?.route;
  if (param) {
    return Array.isArray(param) ? param.join("/") : String(param);
  }

  const rawUrl = req.url || "";
  const pathname = rawUrl.split("?")[0] || "";
  const match = pathname.match(/^\/api\/?(.*)$/);
  return match?.[1]?.replace(/^index\/?/, "") || "";
}

export default async function handler(req: Parameters<ApiHandler>[0], res: Parameters<ApiHandler>[1]) {
  const routeKey = resolveRoute(req as IncomingReq);
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
