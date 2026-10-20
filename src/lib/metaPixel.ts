/**
 * Meta Pixel helpers (Pixel is installed in index.html)
 */
const PURCHASE_KEY = "meta_purchase_sent_";

export function trackPurchase(opts: {
  value: number;
  paymentId: string;
  service?: string;
  currency?: string;
}): void {
  const { value, paymentId, service, currency = "INR" } = opts;
  if (typeof window === "undefined" || !paymentId || !(value > 0)) return;

  const key = PURCHASE_KEY + paymentId;
  const alreadySent = () => {
    try { return !!localStorage.getItem(key); } catch { return false; }
  };
  if (alreadySent()) return;

  const send = (): boolean => {
    if (alreadySent()) return true;
    if (typeof window.fbq !== "function") return false;
    window.fbq(
      "track",
      "Purchase",
      {
        value,
        currency,
        content_type: "product",
        content_ids: [paymentId],
        ...(service ? { content_name: service } : {}),
      },
      { eventID: paymentId },
    );
    try { localStorage.setItem(key, "1"); } catch { /* storage blocked */ }
    return true;
  };

  const run = () => {
    if (send()) return;
    // fbq abhi load nahi hua: 10 second tak retry
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (send() || tries >= 20) window.clearInterval(timer);
    }, 500);
  };

  if (document.visibilityState === "visible") {
    run();
  } else {
    // Background tab: jab user wapas aaye tab fire karo
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        document.removeEventListener("visibilitychange", onVisible);
        run();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
  }
}
