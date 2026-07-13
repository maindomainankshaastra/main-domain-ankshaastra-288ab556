import JSZip from 'jszip';
import { getSupabaseAdmin } from '../lib/supabase-admin.js';
import { getUserFromAuthHeader, isAdminUser } from '../lib/auth-api.js';
import { downloadInvoicePdfBuffer } from '../lib/invoice-storage.js';

type Req = {
  method?: string;
  headers?: { authorization?: string; Authorization?: string };
  query?: { year?: string; month?: string };
};

type Res = {
  setHeader?: (name: string, value: string) => void;
  status: (n: number) => {
    json: (o: unknown) => void;
    end: () => void;
    send?: (body: Buffer | string) => void;
  };
};

function monthRange(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
  return { start, end };
}

function safePdfName(invoiceNumber: string) {
  return `${String(invoiceNumber).replace(/[^\w.-]+/g, '_')}.pdf`;
}

/** GET /api/invoices/bulk-download?year=2026&month=5 — admin-only monthly ZIP */
export default async function handler(req: Req, res: Res) {
  if (req.method !== 'GET') return res.status(405).end();

  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const user = await getUserFromAuthHeader(authHeader);
  if (!user || !(await isAdminUser(user.id))) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const year = Number(req.query?.year);
  const month = Number(req.query?.month);
  if (!year || !month || month < 1 || month > 12) {
    return res.status(400).json({ error: 'Valid year and month (1–12) are required' });
  }

  const { start, end } = monthRange(year, month);
  const zipLabel = `${year}-${String(month).padStart(2, '0')}`;

  try {
    const supabase = getSupabaseAdmin();
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, customer_name, customer_email, service_title, total_amount, invoice_date, pdf_storage_path')
      .gte('invoice_date', start)
      .lt('invoice_date', end)
      .not('pdf_storage_path', 'is', null)
      .order('invoice_date', { ascending: true });

    if (error) throw error;
    if (!invoices?.length) {
      return res.status(404).json({ error: `No invoice PDFs found for ${zipLabel}` });
    }

    const zip = new JSZip();
    const manifestLines = ['invoice_number,customer_name,customer_email,service_title,total_amount,invoice_date,filename'];
    const skipped: string[] = [];
    let added = 0;

    for (const inv of invoices) {
      const storagePath = inv.pdf_storage_path as string;
      const filename = safePdfName(inv.invoice_number);

      try {
        const pdf = await downloadInvoicePdfBuffer(storagePath);
        if (!pdf) {
          skipped.push(inv.invoice_number);
          continue;
        }
        zip.file(`pdfs/${filename}`, pdf);
        manifestLines.push(
          [
            inv.invoice_number,
            `"${String(inv.customer_name || '').replace(/"/g, '""')}"`,
            `"${String(inv.customer_email || '').replace(/"/g, '""')}"`,
            `"${String(inv.service_title || '').replace(/"/g, '""')}"`,
            Number(inv.total_amount).toFixed(2),
            inv.invoice_date,
            filename,
          ].join(','),
        );
        added++;
      } catch (e) {
        console.error('[bulk-download] PDF fetch failed:', inv.invoice_number, e);
        skipped.push(inv.invoice_number);
      }
    }

    if (added === 0) {
      return res.status(404).json({
        error: `Could not download any invoice PDFs for ${zipLabel}`,
        skipped,
      });
    }

    if (skipped.length) {
      zip.file(
        'skipped.txt',
        `The following invoices could not be included:\n${skipped.join('\n')}\n`,
      );
    }

    zip.file('manifest.csv', manifestLines.join('\n'));
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'STORE',
    });

    res.setHeader?.('Content-Type', 'application/zip');
    res.setHeader?.('Content-Disposition', `attachment; filename="invoices-${zipLabel}.zip"`);
    res.setHeader?.('Content-Length', String(zipBuffer.length));
    res.setHeader?.('X-Invoices-Included', String(added));
    res.setHeader?.('X-Invoices-Skipped', String(skipped.length));

    const send = res.status(200).send;
    if (send) {
      return send.call(res.status(200), zipBuffer);
    }

    return res.status(500).json({ error: 'Binary response not supported in this environment' });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Bulk download failed';
    console.error('[bulk-download]', msg, e);
    return res.status(500).json({ error: msg });
  }
}
