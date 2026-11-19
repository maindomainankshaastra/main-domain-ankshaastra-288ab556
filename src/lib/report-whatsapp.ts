// /**
//  * WhatsApp button for the report pages (Name Correction, Perfect Baby Name, Complete Baby Blueprint).
//  * Copies the "Report is Ready" image, then opens the customer's WhatsApp chat with the message + short link typed in.
//  * The operator presses Ctrl+V (image) and Send. Same flow as Step 6 of the Swar tool.
//  */
// import { reportCardBlob, type ReportCardKind } from "@/lib/swar/reportCard";
// import { reportMessage, shortReportLink } from "@/lib/swar/finalReport";
// import { openWhatsApp } from "@/lib/swar/swarMessage";

// type ToastFn = (o: { title: string; description?: string; variant?: "default" | "destructive" }) => unknown;

// export async function sendReportOnWhatsApp(
//   kind: ReportCardKind,
//   report: { report_id: string; phone?: string | null; pdf_url?: string | null },
//   toast: ToastFn,
// ): Promise<void> {
//   if (!report.pdf_url) { toast({ title: "Generate the PDF first", variant: "destructive" }); return; }
//   if (!report.phone) { toast({ title: "No WhatsApp number on this report", variant: "destructive" }); return; }
//   try {
//     const blob = await reportCardBlob(kind);
//     await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
//     toast({ title: "Image copied, WhatsApp is opening", description: "Click the message box, press Ctrl+V, then Send." });
//   } catch {
//     toast({ title: "Could not copy the image", description: "Open the report image and attach it manually.", variant: "destructive" });
//   }
//   const text = reportMessage("perfect", "", shortReportLink(report.report_id));
//   const r = openWhatsApp(report.phone, text);
//   if (r === "blocked") toast({ title: "WhatsApp did not open", description: "Allow pop-ups for this site.", variant: "destructive" });
// }


/**
 * WhatsApp buttons for the report pages (Name Correction, Perfect Baby Name, Complete Baby Blueprint).
 *  - sendReportOnWhatsApp: copies the "Report is Ready" image, then opens the customer's WhatsApp chat with the
 *    message + short link typed in. The operator presses Ctrl+V (image) and Send.
 *  - copyReportImage: only copies the image (to paste again, or if the first copy was missed).
 * WhatsApp links cannot attach a picture by themselves, so the image always goes through the clipboard.
 */
import { reportCardBlob, type ReportCardKind } from "@/lib/swar/reportCard";
import { reportMessage, shortReportLink } from "@/lib/swar/finalReport";
import { openWhatsApp } from "@/lib/swar/swarMessage";

type ToastFn = (o: { title: string; description?: string; variant?: "default" | "destructive" }) => unknown;

/** Copies the image. The clipboard call is made first and synchronously (the image is passed as a promise), so the browser still counts it as part of the click. */
async function copyImage(kind: ReportCardKind): Promise<boolean> {
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": reportCardBlob(kind) })]);
    return true;
  } catch {
    return false;
  }
}

export async function copyReportImage(kind: ReportCardKind, toast: ToastFn): Promise<void> {
  const ok = await copyImage(kind);
  if (ok) toast({ title: "Image copied", description: "Open the WhatsApp chat, click the message box and press Ctrl+V." });
  else toast({ title: "Could not copy the image", description: "Allow clipboard access for this site (lock icon in the address bar), then try again.", variant: "destructive" });
}

export async function sendReportOnWhatsApp(
  kind: ReportCardKind,
  report: { report_id: string; phone?: string | null; pdf_url?: string | null },
  toast: ToastFn,
): Promise<void> {
  if (!report.pdf_url) { toast({ title: "Generate the PDF first", variant: "destructive" }); return; }
  if (!report.phone) { toast({ title: "No WhatsApp number on this report", variant: "destructive" }); return; }
  const ok = await copyImage(kind);
  if (ok) toast({ title: "Image copied, WhatsApp is opening", description: "In WhatsApp click the message box, press Ctrl+V (image), then Send." });
  else toast({ title: "Image was NOT copied", description: "Use the Copy image button next to the WhatsApp button, then paste it in the chat.", variant: "destructive" });
  const text = reportMessage("perfect", "", shortReportLink(report.report_id));
  const r = openWhatsApp(report.phone, text);
  if (r === "blocked") toast({ title: "WhatsApp did not open", description: "Allow pop-ups for this site.", variant: "destructive" });
}
