export type GstBreakdown = {
  subtotal: number;
  gstTotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
  isIntraState: boolean;
};

export type GstInput = {
  amount: number;
  gstRate?: number;
  isGstInclusive?: boolean;
  customerStateCode?: string;
  businessStateCode?: string;
};

export function calculateGst(input: GstInput): GstBreakdown {
  const rate = input.gstRate ?? 18;
  const isInclusive = input.isGstInclusive ?? true;
  const businessState = input.businessStateCode ?? "09";
  const customerState = input.customerStateCode ?? businessState;
  const isIntraState = businessState === customerState;

  let subtotal: number;
  let gstTotal: number;

  if (isInclusive) {
    const grand = round2(input.amount);
    subtotal = round2(grand / (1 + rate / 100));
    gstTotal = round2(grand - subtotal);
  } else {
    subtotal = round2(input.amount);
    gstTotal = round2(subtotal * (rate / 100));
  }

  const grandTotal = round2(subtotal + gstTotal);
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isIntraState) {
    cgst = round2(gstTotal / 2);
    sgst = round2(gstTotal / 2);
  } else {
    igst = gstTotal;
  }

  return { subtotal, gstTotal, cgst, sgst, igst, grandTotal, isIntraState };
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Normalize admin prefix and append the sequence counter only (no date or extra padding). */
export function formatInvoiceNumber(rawPrefix: string, sequence: number): string {
  const prefix = rawPrefix.trim().replace(/[/\\]+$/g, "").replace(/[/\\]/g, "-") || "INV";
  return `${prefix}${sequence}`;
}

export async function nextInvoiceNumber(
  supabase: ReturnType<typeof import("./supabase-admin").getSupabaseAdmin>
): Promise<string> {
  const { data, error } = await supabase.rpc("next_invoice_number");
  if (!error && data) return String(data);

  const { data: config } = await supabase.from("gst_config").select("*").limit(1).single();
  const seq = (config?.invoice_sequence ?? 1) as number;
  const invoiceNumber = formatInvoiceNumber(String(config?.invoice_prefix ?? "INV"), seq);

  if (config?.id) {
    await supabase.from("gst_config").update({ invoice_sequence: seq + 1 }).eq("id", config.id);
  }

  return invoiceNumber;
}
