// Types for the pre-bundled server build of src/components/NameCheckReportGenerator.tsx
// (see name-check-generator-entry.ts for how this file is produced).
export type PricingVariant = "baby-name" | "blueprint";

export interface NameCheckReportInput {
  reportId: string;
  customerName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  generatedDate?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  isMiddleNameFatherHusband?: boolean;
  pricingVariant?: PricingVariant;
  [key: string]: unknown;
}

export interface NameCheckReportContent {
  mulank: number;
  bhagyank: number;
  firstNameNumber: number;
  firstNameSum: number;
  fullNameNumber: number;
  fullNameSum: number;
  fullNameCompound: number;
  compoundTier: string;
  verdict: "HR" | "OA" | "NR";
  matchedRuleId: string;
  [key: string]: unknown;
}

export function generateNameCheckReportPdf(input: NameCheckReportInput): Promise<Uint8Array>;
export function computeNameCheckReportContent(
  input: Pick<NameCheckReportInput, "customerName" | "dob" | "firstName" | "middleName" | "lastName" | "isMiddleNameFatherHusband">,
): NameCheckReportContent;
