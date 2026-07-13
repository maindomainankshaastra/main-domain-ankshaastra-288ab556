import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";

async function getAuthToken(): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("Please sign in again");
  return token;
}

function safePdfName(invoiceNumber: string) {
  return `${String(invoiceNumber).replace(/[^\w.-]+/g, "_")}.pdf`;
}

async function runPool<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let index = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (index < items.length) {
      const current = index++;
      await worker(items[current], current);
    }
  });
  await Promise.all(runners);
}

type BulkManifestInvoice = {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email?: string | null;
  service_title: string;
  total_amount: number;
  invoice_date: string;
};

export type BulkDownloadProgress = {
  phase: "listing" | "downloading" | "packaging";
  done: number;
  total: number;
};

/** Returns a fresh signed URL for an invoice PDF (private Supabase storage). */
export async function fetchInvoiceDownloadUrl(invoiceId: string): Promise<string | null> {
  const token = await getAuthToken().catch(() => null);
  if (!token) return null;

  const res = await fetch(`/api/invoices/download?invoiceId=${encodeURIComponent(invoiceId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;
  const body = (await res.json()) as { url?: string };
  return body.url || null;
}

/** Download all invoice PDFs for a month as a ZIP bundle (built in browser to avoid server timeout). */
export async function downloadMonthlyInvoiceZip(
  year: number,
  month: number,
  onProgress?: (progress: BulkDownloadProgress) => void,
): Promise<{ included: number; skipped: number; skippedNumbers: string[] }> {
  const token = await getAuthToken();

  onProgress?.({ phase: "listing", done: 0, total: 0 });

  const manifestRes = await fetch(
    `/api/invoices/bulk-manifest?year=${year}&month=${month}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!manifestRes.ok) {
    const body = (await manifestRes.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || "Could not load invoices for this month");
  }

  const manifest = (await manifestRes.json()) as {
    label: string;
    invoices: BulkManifestInvoice[];
  };

  const invoices = manifest.invoices || [];
  if (!invoices.length) {
    throw new Error(`No invoice PDFs found for ${manifest.label}`);
  }

  const zip = new JSZip();
  const manifestLines = ["invoice_number,customer_name,customer_email,service_title,total_amount,invoice_date,filename"];
  const skippedNumbers: string[] = [];
  let included = 0;

  onProgress?.({ phase: "downloading", done: 0, total: invoices.length });

  await runPool(invoices, 6, async (inv, index) => {
    const filename = safePdfName(inv.invoice_number);
    try {
      const fileRes = await fetch(`/api/invoices/file?invoiceId=${encodeURIComponent(inv.id)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!fileRes.ok) {
        skippedNumbers.push(inv.invoice_number);
      } else {
        const pdfBytes = await fileRes.arrayBuffer();
        zip.file(`pdfs/${filename}`, pdfBytes);
        manifestLines.push(
          [
            inv.invoice_number,
            `"${String(inv.customer_name || "").replace(/"/g, '""')}"`,
            `"${String(inv.customer_email || "").replace(/"/g, '""')}"`,
            `"${String(inv.service_title || "").replace(/"/g, '""')}"`,
            Number(inv.total_amount).toFixed(2),
            inv.invoice_date,
            filename,
          ].join(","),
        );
        included++;
      }
    } catch {
      skippedNumbers.push(inv.invoice_number);
    }

    onProgress?.({ phase: "downloading", done: index + 1, total: invoices.length });
  });

  if (included === 0) {
    throw new Error("Could not download any invoice PDFs for this month");
  }

  if (skippedNumbers.length) {
    zip.file(
      "skipped.txt",
      `The following invoices could not be included:\n${skippedNumbers.join("\n")}\n`,
    );
  }

  zip.file("manifest.csv", manifestLines.join("\n"));

  onProgress?.({ phase: "packaging", done: included, total: invoices.length });

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "STORE",
  });

  const label = manifest.label || `${year}-${String(month).padStart(2, "0")}`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `invoices-${label}.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);

  return { included, skipped: skippedNumbers.length, skippedNumbers };
}
