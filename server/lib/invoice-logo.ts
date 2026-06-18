import { existsSync, readFileSync } from 'fs';
import path from 'path';

const LOGO_PUBLIC_PATH = '/invoice-logo.png';

const LOGO_FILE_CANDIDATES = [
  'public/invoice-logo.png',
  'src/assets/Invoice_logo.png',
];

export function getInvoiceLogoUrl(): string {
  const siteUrl = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://ankshaastra.com').replace(/\/$/, '');
  return `${siteUrl}${LOGO_PUBLIC_PATH}`;
}

/** Load bundled invoice logo bytes (filesystem first, then public URL). */
export async function loadInvoiceLogoBytes(): Promise<Uint8Array | null> {
  const cwd = process.cwd();
  for (const relativePath of LOGO_FILE_CANDIDATES) {
    const filePath = path.join(cwd, relativePath);
    if (existsSync(filePath)) {
      return new Uint8Array(readFileSync(filePath));
    }
  }

  try {
    const res = await fetch(getInvoiceLogoUrl());
    if (res.ok) return new Uint8Array(await res.arrayBuffer());
  } catch (err) {
    console.warn('[invoice-logo] Fetch failed:', err instanceof Error ? err.message : err);
  }

  return null;
}
