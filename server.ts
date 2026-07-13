import express from "express";
import cors from "cors";

import createOrder from "./server/handlers/create-order.js";
import verifyPayment from "./server/handlers/verify-payment.js";
import services from "./server/handlers/services.js";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/create-order", (req, res) => createOrder(req as any, res as any));

app.post("/api/verify-payment", (req, res) => verifyPayment(req as any, res as any));

app.get("/api/services", (req, res) => services(req as any, res as any));

const PORT = 8081;

app.listen(PORT, () => {
  console.log(`✅ API running at http://localhost:${PORT}`);
});