import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/ankshaastra-logo-color-text-transparent-cropped.png";
import SEOHead from "@/components/SEOHead";
import { CheckCircle2, Mail, ArrowRight } from "lucide-react";
import { business } from "@/config/business";
import { formatINR } from "@/config/pricing";
import { nameReportOffers } from "@/data/nameReportOffers";
import { reportConfirmationPolicy, reportMailboxInstruction } from "@/data/reportConfirmation";
import {
  clearPendingCheckout,
  consumePendingPaymentVerification,
  loadPendingCheckout,
  resolveMobilePaymentReturn,
  verifyPaymentAndInvoice,
} from "@/lib/payment-verification";

const ThankYou = () => {
  const [params] = useSearchParams();
  const [pendingVerification] = useState(() =>
    resolveMobilePaymentReturn(new URL(window.location.href), loadPendingCheckout()) || consumePendingPaymentVerification(),
  );
  const service = params.get("service") || pendingVerification?.service || "Your Order";
  const serviceLabel = nameReportOffers.find(offer => offer.serviceTitle === service)?.title || service;
  const amount = Number(params.get("amount") || pendingVerification?.amount || 0);
  const paymentId = params.get("payment_id") || pendingVerification?.razorpay_payment_id || "";
  const invoiceFromUrl = params.get("invoice") || "";
  const formData = pendingVerification?.formData;
  const name = params.get("name") || String(formData?.fullName || [formData?.firstName, formData?.lastName].filter(Boolean).join(" "));
  const email = params.get("email") || String(formData?.email || "");

  // Redirect flow (mobile) never runs goToThankYou, so clear saved checkout here.
  useEffect(() => {
    if (new URLSearchParams(window.location.hash.slice(1)).has("razorpay_signature")) {
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
    }
    clearPendingCheckout();
  }, []);
  const [invoice, setInvoice] = useState(invoiceFromUrl);
  const isNameReport = /name check|name correction|complete.*blueprint/i.test(service);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  useEffect(() => {
    if (!paymentId || !amount) return;
    if (typeof window.fbq !== "function") return;

    window.fbq(
      "track",
      "Purchase",
      {
        value: amount,
        currency: "INR",
      },
      {
        eventID: paymentId,
      },
    );
  }, [paymentId, amount]);

  useEffect(() => {
    if (!pendingVerification) return;

    let cancelled = false;

    void (async () => {
      try {
        const result = await verifyPaymentAndInvoice(pendingVerification);
        if (cancelled) return;
        if (result.invoice_number) {
          setInvoice(result.invoice_number);
        }
      } catch {
        // Payment was captured; invoice will arrive via email/webhook retry.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pendingVerification]);

  return (
    <div className="thank-you-page min-h-dvh">
      <SEOHead
        title="Thank You — Payment Successful | Ankshaastra"
        description="Payment received. Your invoice, confirmation and personalised report will be sent by email."
        canonical="/thank-you"
      />
      <header className="flex h-14 items-center justify-center bg-background px-4">
        <Link to="/" aria-label="Ankshaastra home">
          <img src={logo} alt="Ankshaastra" className="h-9 w-auto max-w-48 object-contain" />
        </Link>
      </header>
      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col justify-center gap-4 px-5 py-5 sm:gap-6 sm:py-10">
        <div className="text-center">
          <div className="thank-you-success mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full sm:h-16 sm:w-16">
            <CheckCircle2 className="h-7 w-7 sm:h-9 sm:w-9" aria-hidden="true" />
          </div>
          <p className="thank-you-accent text-xs font-semibold uppercase tracking-wide">Payment successful</p>
          <h1 className="my-2 font-display text-3xl sm:text-4xl break-words">
            Thank you{name ? `, ${name.split(" ")[0]}` : ""}!
          </h1>
          <p className="thank-you-muted text-sm leading-relaxed">
            Payment received for <span className="thank-you-accent font-semibold">{serviceLabel}</span>.
          </p>
        </div>

        <dl className="thank-you-receipt border-y py-3 text-sm space-y-2" aria-label="Payment receipt">
          {amount > 0 && <div className="flex justify-between gap-3"><dt className="thank-you-muted">Amount paid</dt><dd className="font-semibold">{formatINR(amount)}</dd></div>}
          {paymentId && <div className="flex justify-between gap-3"><dt className="thank-you-muted shrink-0">Payment ID</dt><dd className="min-w-0 break-all text-right text-xs">{paymentId}</dd></div>}
          <div className="flex justify-between gap-3"><dt className="thank-you-muted shrink-0">Invoice</dt><dd className="min-w-0 break-all text-right text-xs" aria-live="polite">{invoice || "Sent by email when ready"}</dd></div>
          {email && <div className="flex justify-between gap-3"><dt className="thank-you-muted shrink-0">Your email</dt><dd className="min-w-0 break-all text-right text-xs">{email}</dd></div>}
        </dl>

        <section className="text-sm leading-relaxed" aria-labelledby="delivery-heading">
          <h2 id="delivery-heading" className="mb-1 flex items-center gap-2 font-body text-base font-semibold"><Mail className="thank-you-accent h-4 w-4" /> Report delivery by email</h2>
          <p className="thank-you-muted">Your invoice and confirmation email are sent from <span className="thank-you-accent break-all">{reportConfirmationPolicy.sender}</span>. Your report will also be delivered by email.</p>
          <p className="thank-you-notice mt-3 rounded-lg border p-3">{reportMailboxInstruction}</p>
        </section>

        {!isNameReport && <Button asChild variant="outline" size="sm" className="thank-you-home self-center"><Link to="/">Back to Home <ArrowRight /></Link></Button>}
        <p className="thank-you-muted text-center text-xs">Need help? <a href={`mailto:${business.supportEmail}`} className="underline break-all">{business.supportEmail}</a></p>
      </main>
    </div>
  );
};

export default ThankYou;
