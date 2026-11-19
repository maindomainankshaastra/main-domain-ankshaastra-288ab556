/**
 * "Your report is Ready" card that goes with the WhatsApp message.
 * The images are used exactly as designed (public/final-report-assets/), nothing is drawn on them.
 */
import type { PackageTier } from "@/lib/swar/nameFinderPackage";

export type ReportCardKind = PackageTier | "name-correction";

const SRC: Record<ReportCardKind, string> = {
  blueprint: "/final-report-assets/blueprint-card.png",
  perfect: "/final-report-assets/perfect-card.png",
  "name-correction": "/final-report-assets/name-correction-card.png",
};

export async function reportCardBlob(kind: ReportCardKind, _name?: string): Promise<Blob> {
  const res = await fetch(SRC[kind] ?? SRC.perfect);
  if (!res.ok) throw new Error("Could not load the report image");
  return res.blob();
}
