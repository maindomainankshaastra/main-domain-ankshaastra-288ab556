import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { CheckCircle2, MessageCircle, Mail, ArrowRight, Sparkles, FileText } from "lucide-react";
import { business, whatsappHref } from "@/config/business";
import { formatINR } from "@/config/pricing";

const ThankYou = () => {
  const [params] = useSearchParams();
  const service = params.get("service") || "Your Order";
  const amount = Number(params.get("amount") || 0);
  const paymentId = params.get("payment_id") || "";
  const orderId = params.get("order_id") || "";
  const invoice = params.get("invoice") || "";
  const name = params.get("name") || "";
  const email = params.get("email") || "";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const waMsg = `Hello Ankshaastra Team,%0A%0AI have just completed payment for *${service}*.%0AInvoice: ${invoice || "—"}%0APayment ID: ${paymentId || "—"}%0AName: ${name || "—"}%0A%0APlease confirm next steps.`;

  return (
    <Layout>
      <SEOHead
        title="Thank You — Payment Successful | Ankshaastra"
        description="Your payment was successful. Our team will reach out to you shortly with the next steps."
        canonical="/thank-you"
      />
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="section-container relative z-10 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/15 p-8 md:p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 border border-green-400/40 flex items-center justify-center"
              >
                <CheckCircle2 className="w-12 h-12 text-green-300" />
              </motion.div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-300/10 border border-amber-200/20 mb-4">
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span className="text-amber-100 text-sm font-medium">Payment Successful</span>
              </span>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">
                Thank you{name ? `, ${name.split(" ")[0]}` : ""}!
              </h1>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                We&apos;ve received your payment for <span className="text-amber-200 font-semibold">{service}</span>. Our team will personally connect with you on WhatsApp shortly to begin your consultation.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8 text-left">
                {invoice && (
                  <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                    <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Invoice</p>
                    <p className="text-white font-semibold break-all">{invoice}</p>
                  </div>
                )}
                {paymentId && (
                  <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                    <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Payment ID</p>
                    <p className="text-white font-semibold break-all">{paymentId}</p>
                  </div>
                )}
                {amount > 0 && (
                  <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                    <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Amount Paid</p>
                    <p className="text-white font-semibold">{formatINR(amount)}</p>
                  </div>
                )}
                {email && (
                  <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                    <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Confirmation Email</p>
                    <p className="text-white font-semibold break-all">{email}</p>
                  </div>
                )}
              </div>

              <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-8 text-left">
                <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-200" /> What happens next?
                </h2>
                <ul className="space-y-3 text-white/80 text-sm">
                  <li className="flex gap-3"><span className="text-amber-200 font-bold">1.</span> You&apos;ll receive an invoice and confirmation on your email{email ? ` (${email})` : ""}.</li>
                  <li className="flex gap-3"><span className="text-amber-200 font-bold">2.</span> Our team will reach out on WhatsApp to schedule or deliver your service.</li>
                  <li className="flex gap-3"><span className="text-amber-200 font-bold">3.</span> For premium reports, expect delivery within 3–7 working days.</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`https://wa.me/${business.leadWhatsappNumber}?text=${waMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4"
                >
                  <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
                </a>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white hover:bg-white/10 transition-all font-semibold"
                >
                  Back to Home <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <p className="mt-8 text-white/50 text-xs flex items-center justify-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                Need help? Email {business.supportEmail}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ThankYou;