-- Private bucket for generated invoice documents.
-- Files are uploaded by server-side functions with the service role and exposed
-- to customers/admins through signed URLs stored on the invoice row.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoices',
  'invoices',
  false,
  10485760,
  ARRAY['application/pdf', 'text/html']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

UPDATE public.communication_templates
SET body_html = '<p>Dear {{customer_name}},</p><p>Your paid invoice {{invoice_number}} for {{service_title}} is attached.</p><p>You can also open it here: <a href="{{invoice_download_url}}">Download invoice</a>.</p>'
WHERE slug = 'invoice_email';
