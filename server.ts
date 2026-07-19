// // // // import express from "express";
// // // // import cors from "cors";

// // // // import createOrder from "./server/handlers/create-order.js";
// // // // import verifyPayment from "./server/handlers/verify-payment.js";
// // // // import services from "./server/handlers/services.js";
// // // // import createManualInvoice from "./server/handlers/invoices-create-manual.js";

// // // // const app = express();

// // // // app.use(cors());
// // // // app.use(express.json());

// // // // app.post("/api/create-order", (req, res) => createOrder(req as any, res as any));

// // // // app.post("/api/verify-payment", (req, res) => verifyPayment(req as any, res as any));

// // // // app.get("/api/services", (req, res) => services(req as any, res as any));

// // // // app.post("/api/invoices/create-manual", (req, res) =>
// // // //   createManualInvoice(req as any, res as any)
// // // // );

// // // // const PORT = 8081;

// // // // app.listen(PORT, () => {
// // // //   console.log(`✅ API running at http://localhost:${PORT}`);
// // // // });


// // // import dotenv from 'dotenv';
// // // dotenv.config();
// // // import express from "express";
// // // import cors from "cors";

// // // import createOrder from "./server/handlers/create-order.js";
// // // import verifyPayment from "./server/handlers/verify-payment.js";
// // // import services from "./server/handlers/services.js";
// // // import invoicesCreateManual from "./server/handlers/invoices-create-manual.js";

// // // const app = express();

// // // app.use(cors());
// // // app.use(express.json());

// // // app.post("/api/create-order", (req, res) => createOrder(req as any, res as any));

// // // app.post("/api/verify-payment", (req, res) => verifyPayment(req as any, res as any));

// // // app.get("/api/services", (req, res) => services(req as any, res as any));

// // // app.post(
// // //   "/api/invoices/create-manual",
// // //   (req, res) => invoicesCreateManual(req as any, res as any)
// // // );

// // // const PORT = 8081;

// // // app.listen(PORT, () => {
// // //   console.log(`✅ API running at http://localhost:${PORT}`);
// // // });

// // import dotenv from 'dotenv';
// // dotenv.config();
// // import express from "express";
// // import cors from "cors";

// // import createOrder from "./server/handlers/create-order.js";
// // import verifyPayment from "./server/handlers/verify-payment.js";
// // import services from "./server/handlers/services.js";
// // import invoicesCreateManual from "./server/handlers/invoices-create-manual.js";
// // import adminGstConfig from "./server/handlers/admin-gst-config.js";
// // import adminGstrReports from "./server/handlers/admin-gstr-reports.js";

// // const app = express();

// // app.use(cors());
// // app.use(express.json());

// // app.post("/api/create-order", (req, res) => createOrder(req as any, res as any));

// // app.post("/api/verify-payment", (req, res) => verifyPayment(req as any, res as any));

// // app.get("/api/services", (req, res) => services(req as any, res as any));

// // app.post(
// //   "/api/invoices/create-manual",
// //   (req, res) => invoicesCreateManual(req as any, res as any)
// // );

// // // GST Configuration — Settings page (GET to load, PUT to save).
// // // Handler internally branches on req.method, so both verbs point here.
// // app.get("/api/admin/gst-config", (req, res) => adminGstConfig(req as any, res as any));
// // app.put("/api/admin/gst-config", (req, res) => adminGstConfig(req as any, res as any));

// // // GST & GSTR-1 Reports page — GET validates a period (Validate Period
// // // button); POST handles export (GSTR-1/summary/sales/SAC Excel),
// // // mark-ready, and mark-filed, distinguished by an `action`/`type` field.
// // app.get("/api/admin/gstr-reports", (req, res) => adminGstrReports(req as any, res as any));
// // app.post("/api/admin/gstr-reports", (req, res) => adminGstrReports(req as any, res as any));

// // const PORT = 8081;

// // app.listen(PORT, () => {
// //   console.log(`✅ API running at http://localhost:${PORT}`);
// // });

// import dotenv from 'dotenv';
// dotenv.config();
// import express from "express";
// import cors from "cors";

// import createOrder from "./server/handlers/create-order.js";
// import verifyPayment from "./server/handlers/verify-payment.js";
// import services from "./server/handlers/services.js";
// import invoicesCreateManual from "./server/handlers/invoices-create-manual.js";
// import adminGstConfig from "./server/handlers/admin-gst-config.js";
// import adminGstrReports from "./server/handlers/admin-gstr-reports.js";
// import adminGstMaintenance from "./server/handlers/admin-gst-maintenance.js";

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.post("/api/create-order", (req, res) => createOrder(req as any, res as any));

// app.post("/api/verify-payment", (req, res) => verifyPayment(req as any, res as any));

// app.get("/api/services", (req, res) => services(req as any, res as any));

// app.post(
//   "/api/invoices/create-manual",
//   (req, res) => invoicesCreateManual(req as any, res as any)
// );

// // GST Configuration — Settings page (GET to load, PUT to save).
// // Handler internally branches on req.method, so both verbs point here.
// app.get("/api/admin/gst-config", (req, res) => adminGstConfig(req as any, res as any));
// app.put("/api/admin/gst-config", (req, res) => adminGstConfig(req as any, res as any));

// // GST & GSTR-1 Reports page — GET validates a period (Validate Period
// // button); POST handles export (GSTR-1/summary/sales/SAC Excel),
// // mark-ready, and mark-filed, distinguished by an `action`/`type` field.
// app.get("/api/admin/gstr-reports", (req, res) => adminGstrReports(req as any, res as any));
// app.post("/api/admin/gstr-reports", (req, res) => adminGstrReports(req as any, res as any));

// // GST Maintenance page — "Fix All GST Data" button (repairs historical
// // invoices missing GST rate/SAC/state, per fixed business rules).
// app.post("/api/admin/gst-maintenance", (req, res) => adminGstMaintenance(req as any, res as any));

// const PORT = 8081;

// app.listen(PORT, () => {
//   console.log(`✅ API running at http://localhost:${PORT}`);
// });

import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cors from "cors";

import createOrder from "./server/handlers/create-order.js";
import verifyPayment from "./server/handlers/verify-payment.js";
import services from "./server/handlers/services.js";
import invoicesCreateManual from "./server/handlers/invoices-create-manual.js";
import invoicesSendEmail from "./server/handlers/invoices-send-email.js";
import adminGstConfig from "./server/handlers/admin-gst-config.js";
import adminGstrReports from "./server/handlers/admin-gstr-reports.js";
import adminGstMaintenance from "./server/handlers/admin-gst-maintenance.js";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/create-order", (req, res) => createOrder(req as any, res as any));

app.post("/api/verify-payment", (req, res) => verifyPayment(req as any, res as any));

app.get("/api/services", (req, res) => services(req as any, res as any));

app.post(
  "/api/invoices/create-manual",
  (req, res) => invoicesCreateManual(req as any, res as any)
);

// Invoice Manager — "Send Invoice" modal (admin-only re-send/manual send
// of an invoice email). Handler already existed in server/handlers but was
// never wired up here, which is why the frontend got a 404.
app.post(
  "/api/invoices/send-email",
  (req, res) => invoicesSendEmail(req as any, res as any)
);

// GST Configuration — Settings page (GET to load, PUT to save).
// Handler internally branches on req.method, so both verbs point here.
app.get("/api/admin/gst-config", (req, res) => adminGstConfig(req as any, res as any));
app.put("/api/admin/gst-config", (req, res) => adminGstConfig(req as any, res as any));

// GST & GSTR-1 Reports page — GET validates a period (Validate Period
// button); POST handles export (GSTR-1/summary/sales/SAC Excel),
// mark-ready, and mark-filed, distinguished by an `action`/`type` field.
app.get("/api/admin/gstr-reports", (req, res) => adminGstrReports(req as any, res as any));
app.post("/api/admin/gstr-reports", (req, res) => adminGstrReports(req as any, res as any));

// GST Maintenance page — "Fix All GST Data" button (repairs historical
// invoices missing GST rate/SAC/state, per fixed business rules).
app.post("/api/admin/gst-maintenance", (req, res) => adminGstMaintenance(req as any, res as any));

const PORT = 8081;

app.listen(PORT, () => {
  console.log(`✅ API running at http://localhost:${PORT}`);
});