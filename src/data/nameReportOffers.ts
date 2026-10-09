import nameCheckCover from "@/assets/name-check-package.webp";
import correctionCover from "@/assets/name-correction-package.webp";
import blueprintCover from "@/assets/complete-name-package.webp";

export const nameReportOffers = [
  { serviceTitle: "Name Check", title: "Name Check", tab: "Name Check", badge: "Quick Check", cover: nameCheckCover, rating: "4.9", sold: "18k sold", description: "Check whether one chosen name aligns with the person's birth date and numerological profile.", delivery: "12–24 Hours", inclusions: ["Quick Name Compatibility Check", "Mulank & Bhagyank Overview", "Clear Yes/No Recommendation", "Expert Analysis Summary"] },
  { serviceTitle: "Name Correction", title: "Name Correction", tab: "Correction", badge: "Best Value", cover: correctionCover, rating: "5.0", sold: "14k copies sold", description: "A personalised name analysis with 2 corrected name spelling options and clear numerological guidance.", delivery: "24–48 Hours", inclusions: ["Everything in Name Check", "2 Corrected Name Spelling Options", "Rajyog and Loshu Grid Analysis", "First Name and Full Name Analysis", "Compound Number Analysis", "Call Consultation Included"] },
  { serviceTitle: "Name Correction + Complete Blueprint", title: "Complete Name Blueprint", tab: "Blueprint", badge: "Full Blueprint", cover: blueprintCover, description: "Complete name blueprint with deeper numerological guidance for your career and Feng Shui.", delivery: "24–28 Hours", inclusions: ["Everything in Name Correction", "Ideal Career Advice", "Lucky Colour and Lucky Number", "Lucky Direction", "Mulank and Bhagyank Analysis"] },
];

export function nameReportConfirmation(service: string) {
  return /name check/i.test(service)
    ? "Check your email / spam box after 6 hours for your report."
    : "Your report will be delivered to you on WhatsApp within 24–28 hours.";
}