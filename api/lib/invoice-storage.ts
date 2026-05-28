import { getSupabaseAdmin } from './supabase-admin.js';

const BUCKET = 'invoices';
const SIGNED_URL_TTL_SEC = 60 * 60 * 24 * 365;

export async function ensureInvoiceBucket() {
  const supabase = getSupabaseAdmin();
  const { data: bucket } = await supabase.storage.getBucket(BUCKET);
  if (bucket) return;

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ['application/pdf'],
  });

  if (error && !/already exists/i.test(error.message)) {
    throw error;
  }
}

export async function uploadInvoicePdf(storagePath: string, buffer: Buffer, mimeType: string) {
  const supabase = getSupabaseAdmin();
  await ensureInvoiceBucket();

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: mimeType,
    upsert: true,
  });
  if (error) throw error;

  return refreshSignedUrl(storagePath);
}

export async function refreshSignedUrl(storagePath: string) {
  const supabase = getSupabaseAdmin();
  const { data: signed, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, SIGNED_URL_TTL_SEC);
  if (error) throw error;
  return signed?.signedUrl ?? null;
}

export async function downloadInvoicePdfBuffer(storagePath: string): Promise<Buffer | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.from(BUCKET).download(storagePath);
  if (error || !data) return null;

  const bytes = Buffer.from(await data.arrayBuffer());
  if (bytes.length < 32) return null;
  return bytes;
}

export async function refreshInvoicePdfUrl(invoiceId: string) {
  const supabase = getSupabaseAdmin();
  const { data: invoice } = await supabase
    .from('invoices')
    .select('id, pdf_storage_path')
    .eq('id', invoiceId)
    .single();

  if (!invoice?.pdf_storage_path) return null;

  const pdfUrl = await refreshSignedUrl(invoice.pdf_storage_path);
  if (pdfUrl) {
    await supabase.from('invoices').update({ pdf_url: pdfUrl }).eq('id', invoiceId);
  }
  return pdfUrl;
}
