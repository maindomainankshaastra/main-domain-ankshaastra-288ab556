/**
 * WhatsApp button for the report pages (Name Correction, Perfect Baby Name, Complete Baby Blueprint).
 * Copies the "Report is Ready" image, then opens the customer's WhatsApp chat with the message + short link typed in.
 * The operator presses Ctrl+V (image) and Send. Same flow as Step 6 of the Swar tool.
 */
import { reportCardBlob, type ReportCardKind } from "@/lib/swar/reportCard";
import { reportMessage, shortReportLink } from "@/lib/swar/finalReport";
import { openWhatsApp } from "@/lib/swar/swarMessage";

type ToastFn = (o: { title: string; description?: string; variant?: "default" | "destructive" }) => unknown;

export async function sendReportOnWhatsApp(
  kind: ReportCardKind,
  report: { report_id: string; phone?: string | null; pdf_url?: string | null },
  toast: ToastFn,
): Promise<void> {
  if (!report.pdf_url) { toast({ title: "Generate the PDF first", variant: "destructive" }); return; }
  if (!report.phone) { toast({ title: "No WhatsApp number on this report", variant: "destructive" }); return; }
  try {
    const blob = await reportCardBlob(kind);
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    toast({ title: "Image copied, WhatsApp is opening", description: "Click the message box, press Ctrl+V, then Send." });
  } catch {
    toast({ title: "Could not copy the image", description: "Open the report image and attach it manually.", variant: "destructive" });
  }
  const text = reportMessage("perfect", "", shortReportLink(report.report_id));
  const r = openWhatsApp(report.phone, text);
  if (r === "blocked") toast({ title: "WhatsApp did not open", description: "Allow pop-ups for this site.", variant: "destructive" });
}
