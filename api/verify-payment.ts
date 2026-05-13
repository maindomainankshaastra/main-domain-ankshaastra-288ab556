
import crypto from "crypto";

export default function handler(req: any, res: any) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return res.status(500).json({ success: false, error: "Razorpay credentials missing (RAZORPAY_KEY_SECRET)." });
  }

  const generated_signature = crypto
    .createHmac("sha256", keySecret)

    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature === razorpay_signature) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(400).json({ success: false });
  }
}
