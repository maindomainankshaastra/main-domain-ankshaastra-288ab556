import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type OrderLineItem = {
  label: string;
  price: number;
  note?: string;
};

export type OrderSummaryProps = {
  serviceName: string;
  hubTitle?: string;
  basePrice: number;
  originalPrice?: number;
  addons?: OrderLineItem[];
  gst?: number;
  /** When true, basePrice is already GST-inclusive — show "Incl. GST" note */
  gstInclusive?: boolean;
  deliveryNote?: string;
  className?: string;
  /** sticky on desktop (lg+) */
  sticky?: boolean;
  compact?: boolean;
};

/**
 * Reusable checkout Order Summary card.
 * Displays service, optional add-ons, GST and total payable in a consistent
 * design across every service checkout page.
 */
export const OrderSummary = ({
  serviceName,
  hubTitle,
  basePrice,
  originalPrice,
  addons = [],
  gst,
  gstInclusive = true,
  deliveryNote = "Delivered within 12-24 Hrs.",
  className,
  sticky = false,
  compact = false,
}: OrderSummaryProps) => {
  const addonsTotal = addons.reduce((s, a) => s + a.price, 0);
  const subtotal = basePrice + addonsTotal;
  const total = subtotal + (gst ?? 0);

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-2xl",
        compact ? "p-5" : "p-6 md:p-8",
        sticky && "lg:sticky lg:top-24",
        className,
      )}
    >
      <h3 className="font-display text-xl font-bold text-foreground mb-4">
        Order Summary
      </h3>

      <div className="space-y-3">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <p className="text-foreground font-semibold">{serviceName}</p>
            {hubTitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{hubTitle}</p>
            )}
          </div>
          <div className="text-right whitespace-nowrap">
            {originalPrice && originalPrice > basePrice && (
              <div className="text-xs text-muted-foreground line-through">
                ₹{originalPrice.toLocaleString("en-IN")}
              </div>
            )}
            <div className="text-foreground font-semibold">
              ₹{basePrice.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {addons.length > 0 && (
          <div className="border-t border-border pt-3 space-y-2">
            {addons.map((a) => (
              <div key={a.label} className="flex justify-between text-sm gap-3">
                <span className="text-muted-foreground">{a.label}</span>
                <span className="text-foreground whitespace-nowrap">
                  ₹{a.price.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        )}

        {typeof gst === "number" && gst > 0 && (
          <div className="flex justify-between text-sm border-t border-border pt-3">
            <span className="text-muted-foreground">GST</span>
            <span className="text-foreground whitespace-nowrap">
              ₹{gst.toLocaleString("en-IN")}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border flex justify-between items-baseline">
        <div>
          <span className="text-foreground font-bold text-lg">Total</span>
          {gstInclusive && (!gst || gst === 0) && (
            <span className="block text-[11px] text-muted-foreground">
              Incl. GST
            </span>
          )}
        </div>
        <span className="text-gradient-amber font-bold text-lg whitespace-nowrap">
          ₹{total.toLocaleString("en-IN")}
        </span>
      </div>

      {deliveryNote && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-secondary flex-shrink-0" />
            <span>{deliveryNote}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;