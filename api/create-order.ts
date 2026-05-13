
import Razorpay from "razorpay";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return res.status(500).json({ error: "Razorpay credentials missing (RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET)." });
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  try {
    const order = await razorpay.orders.create({
      amount: req.body.amount * 100,
      currency: "INR",
    });

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: "Order creation failed" });
  }
}
