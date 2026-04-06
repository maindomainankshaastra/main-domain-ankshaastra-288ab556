
import Razorpay from "razorpay";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
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
