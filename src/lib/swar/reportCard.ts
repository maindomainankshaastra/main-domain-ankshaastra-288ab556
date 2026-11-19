/**
 * "Your report is Ready" card that goes with the Step 6 WhatsApp message.
 * The images are used exactly as designed (public/final-report-assets/), nothing is drawn on them.
 */
import type { PackageTier } from "@/lib/swar/nameFinderPackage";

const SRC: Record<PackageTier, string> = {
  blueprint: "/final-report-assets/blueprint-card.png",
  perfect: "/final-report-assets/perfect-card.png",
};

export async function reportCardBlob(tier: PackageTier, _name?: string): Promise<Blob> {
  const res = await fetch(SRC[tier] ?? SRC.perfect);
  if (!res.ok) throw new Error("Could not load the report image");
  return res.blob();
}
