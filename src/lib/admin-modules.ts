export const ADMIN_MODULES = [
  { key: "orders", label: "Orders & Bookings" },
  { key: "invoices", label: "Invoice Manager" },
  { key: "email", label: "Email Center" },
  { key: "crm", label: "CRM" },
  { key: "workflows", label: "Workflows" },
  { key: "webhooks", label: "Webhook Logs" },
 
  { key: "name-check-reports", label: "Reports" },
  { key: "services", label: "Services Management" },
  { key: "service-pages", label: "Pages & Packages" },
  // { key: "pricing", label: "Pricing Management" },
 
  { key: "settings", label: "GST Configuration" },
  { key: "gst-reports", label: "GSTR Reports" },
  { key: "gst-maintenance", label: "GST Maintenance" },
];


// ------------------------------------------------------------------
// Reports — per-report-type access
// ------------------------------------------------------------------
// "name-check-reports" stays the parent "Reports" module (sidebar link,
// Swar & Names, C-Section Dates). Each report type below gets its own key so
// Team Management can grant e.g. only "Name Check" to a staff member.
//
// Backward compatible: a staff member who has the parent key but NO
// sub-keys (granted before this change) keeps access to every report type.
export const REPORTS_PARENT_KEY = "name-check-reports";

export const REPORT_SUB_MODULES = [
  { key: "reports-name-check", label: "Name Check", path: "/admin/reports/name-check" },
  { key: "reports-name-correction", label: "Name Correction Report", path: "/admin/reports/name-correction" },
  { key: "reports-perfect-baby-name", label: "Perfect Baby Name Report", path: "/admin/reports/perfect-baby-name" },
  { key: "reports-complete-baby-blueprint", label: "Complete Baby Blueprint", path: "/admin/reports/complete-baby-blueprint" },
] as const;

const REPORT_SUB_KEYS: string[] = REPORT_SUB_MODULES.map((m) => m.key);

/** Which report types a permission list effectively grants. */
export function effectiveReportSubs(modules: string[]): string[] {
  const explicit = REPORT_SUB_KEYS.filter((k) => modules.includes(k));
  if (explicit.length > 0) return explicit;
  return modules.includes(REPORTS_PARENT_KEY) ? [...REPORT_SUB_KEYS] : [];
}

/** Returns `modules` with its report permissions replaced by `subs`. */
export function withReportSubs(modules: string[], subs: string[]): string[] {
  const rest = modules.filter((m) => m !== REPORTS_PARENT_KEY && !REPORT_SUB_KEYS.includes(m));
  return subs.length > 0 ? [...rest, REPORTS_PARENT_KEY, ...subs] : rest;
}

/** Can this user open the given report type? `canView` = useAuth().canViewModule */
export function canViewReportType(canView: (m: string) => boolean, subKey: string): boolean {
  if (canView(subKey)) return true;
  const hasAnySub = REPORT_SUB_KEYS.some((k) => canView(k));
  return canView(REPORTS_PARENT_KEY) && !hasAnySub;
}
