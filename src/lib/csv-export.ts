/**
 * Lightweight, dependency-free CSV export helper.
 * Reused by CRM and Orders & Bookings (and any future module) so every
 * export uses the same escaping rules and filename convention.
 */

export interface CsvColumn<T> {
  /** Column header shown in the CSV file */
  label: string;
  /** How to read this column's value out of a row */
  value: (row: T) => string | number | null | undefined;
}

// Escapes a single CSV field: wraps in quotes and doubles any inner quotes
// whenever the value contains a comma, quote, or newline.
function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Builds a CSV string (with header row) from an array of rows and a
 * column definition. Missing/null/undefined values become "—" so the
 * export never shows a blank/confusing cell.
 */
export function buildCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => escapeCsvField(c.label)).join(",");

  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const raw = c.value(row);
        const text = raw === null || raw === undefined || raw === "" ? "—" : String(raw);
        return escapeCsvField(text);
      })
      .join(",")
  );

  return [header, ...lines].join("\n");
}

// YYYY-MM-DD for today, used in export filenames.
function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Triggers a browser download of the given CSV content.
 * filenamePrefix example: "crm" -> "crm-export-2026-07-15.csv"
 */
export function downloadCsv(filenamePrefix: string, csvContent: string): void {
  const filename = `${filenamePrefix}-export-${todayStamp()}.csv`;
  // Prepend a UTF-8 BOM so Excel opens the file with correct encoding
  // instead of mangling special characters (e.g. ₹, é).
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convenience: build the CSV and immediately trigger the download.
 */
export function exportRowsAsCsv<T>(
  filenamePrefix: string,
  rows: T[],
  columns: CsvColumn<T>[]
): void {
  const csv = buildCsv(rows, columns);
  downloadCsv(filenamePrefix, csv);
}