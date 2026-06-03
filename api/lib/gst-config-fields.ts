/** Encode/decode extra gst_config fields when DB columns are not migrated yet. */

export type GstConfigExtras = {
  bank_branch?: string;
  business_phone?: string;
  business_email?: string;
  website_url?: string;
};

const PREFIX = {
  phone: 'Phone: ',
  email: 'Email: ',
  website: 'Website: ',
  branch: 'Branch: ',
} as const;

export function stripEncodedGstLines(value: string): string {
  return value
    .split('\n')
    .filter(
      (line) =>
        !line.startsWith(PREFIX.phone) &&
        !line.startsWith(PREFIX.email) &&
        !line.startsWith(PREFIX.website) &&
        !line.startsWith(PREFIX.branch),
    )
    .join('\n')
    .trim();
}

export function encodeGstConfigAddress(baseAddress: string, extras: GstConfigExtras): string {
  const lines = [stripEncodedGstLines(baseAddress)];
  if (extras.business_phone?.trim()) lines.push(`${PREFIX.phone}${extras.business_phone.trim()}`);
  if (extras.business_email?.trim()) lines.push(`${PREFIX.email}${extras.business_email.trim()}`);
  if (extras.website_url?.trim()) lines.push(`${PREFIX.website}${extras.website_url.trim()}`);
  if (extras.bank_branch?.trim()) lines.push(`${PREFIX.branch}${extras.bank_branch.trim()}`);
  return lines.filter(Boolean).join('\n');
}

export function decodeGstConfigAddress(combined?: string | null): { address: string } & GstConfigExtras {
  const addressLines: string[] = [];
  const extras: GstConfigExtras = {};

  for (const line of String(combined || '').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith(PREFIX.phone)) extras.business_phone = trimmed.slice(PREFIX.phone.length);
    else if (trimmed.startsWith(PREFIX.email)) extras.business_email = trimmed.slice(PREFIX.email.length);
    else if (trimmed.startsWith(PREFIX.website)) extras.website_url = trimmed.slice(PREFIX.website.length);
    else if (trimmed.startsWith(PREFIX.branch)) extras.bank_branch = trimmed.slice(PREFIX.branch.length);
    else addressLines.push(line);
  }

  return {
    address: addressLines.join('\n').trim(),
    ...extras,
  };
}

export function resolveGstConfigExtras(
  row: Record<string, unknown> | null | undefined,
): GstConfigExtras & { address: string } {
  const decoded = decodeGstConfigAddress(String(row?.address || ''));

  return {
    address: decoded.address,
    business_phone: String(row?.business_phone || decoded.business_phone || '').trim() || undefined,
    business_email: String(row?.business_email || decoded.business_email || '').trim() || undefined,
    website_url: String(row?.website_url || decoded.website_url || '').trim() || undefined,
    bank_branch: String(row?.bank_branch || decoded.bank_branch || '').trim() || undefined,
  };
}

/** Columns added in migration 20260603150000 — safe to omit when not present yet. */
export const GST_CONFIG_OPTIONAL_COLUMNS = [
  'bank_branch',
  'business_phone',
  'business_email',
  'website_url',
] as const;

export function isMissingOptionalColumnError(message: string): boolean {
  return GST_CONFIG_OPTIONAL_COLUMNS.some((column) => message.includes(column));
}
