-- Ankshaastra Centralized Operations Platform
-- Multi-website CRM, invoicing, communications, webhooks, automation

-- Enums
CREATE TYPE public.website_source AS ENUM (
  'ankshaastra.com',
  'empower.ankshaastra.com',
  'miraclebaby.ankshaastra.com'
);

CREATE TYPE public.order_type AS ENUM ('service', 'product', 'consultation', 'report');
CREATE TYPE public.workflow_stage AS ENUM (
  'order_created',
  'payment_pending',
  'payment_received',
  'invoice_generated',
  'email_sent',
  'whatsapp_sent',
  'ai_report_pending',
  'ai_report_generated',
  'report_delivered',
  'follow_up_scheduled',
  'completed',
  'cancelled'
);

CREATE TYPE public.communication_status AS ENUM (
  'queued', 'sent', 'delivered', 'failed', 'bounced', 'read'
);

CREATE TYPE public.automation_job_status AS ENUM (
  'pending', 'processing', 'completed', 'failed', 'dead_letter'
);

-- Connected websites (multi-tenant registry)
CREATE TABLE public.websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  domain public.website_source NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  api_key_hash TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.websites (slug, domain, display_name) VALUES
  ('main', 'ankshaastra.com', 'Ankshaastra Main'),
  ('empower', 'empower.ankshaastra.com', 'Empower'),
  ('miraclebaby', 'miraclebaby.ankshaastra.com', 'Miracle Baby');

-- CRM customers (guest + registered)
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  gstin TEXT,
  billing_address TEXT,
  state_code TEXT,
  source_website public.website_source DEFAULT 'ankshaastra.com',
  metadata JSONB NOT NULL DEFAULT '{}',
  lifecycle_stage TEXT DEFAULT 'lead',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_customers_user_id ON public.customers(user_id);

-- GST configuration
CREATE TABLE public.gst_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL DEFAULT 'Ankshaastra',
  legal_name TEXT,
  gstin TEXT,
  pan TEXT,
  address TEXT,
  state_code TEXT DEFAULT '27',
  default_gst_rate NUMERIC(5,2) NOT NULL DEFAULT 18.00,
  invoice_prefix TEXT NOT NULL DEFAULT 'INV',
  invoice_sequence INT NOT NULL DEFAULT 1,
  is_gst_inclusive_default BOOLEAN NOT NULL DEFAULT true,
  bank_name TEXT,
  bank_account TEXT,
  bank_ifsc TEXT,
  upi_id TEXT,
  logo_url TEXT,
  terms_footer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.gst_config (business_name, invoice_prefix) VALUES ('Ankshaastra', 'INV');

-- Product catalog
CREATE TABLE public.product_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  gst_rate NUMERIC(5,2) NOT NULL DEFAULT 18.00,
  hsn_sac_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  source_websites public.website_source[] DEFAULT ARRAY['ankshaastra.com']::public.website_source[],
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Extend orders for multi-website operations
ALTER TABLE public.orders
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id),
  ADD COLUMN IF NOT EXISTS source_website public.website_source DEFAULT 'ankshaastra.com',
  ADD COLUMN IF NOT EXISTS order_type public.order_type DEFAULT 'service',
  ADD COLUMN IF NOT EXISTS workflow_stage public.workflow_stage DEFAULT 'order_created',
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.product_catalog(id),
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT,
  ADD COLUMN IF NOT EXISTS customer_name TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_source_website ON public.orders(source_website);
CREATE INDEX IF NOT EXISTS idx_orders_workflow_stage ON public.orders(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);

-- Invoice items (line items)
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  hsn_sac_code TEXT,
  gst_rate NUMERIC(5,2) NOT NULL DEFAULT 18.00,
  taxable_amount NUMERIC(10,2) NOT NULL,
  cgst_amount NUMERIC(10,2) DEFAULT 0,
  sgst_amount NUMERIC(10,2) DEFAULT 0,
  igst_amount NUMERIC(10,2) DEFAULT 0,
  line_total NUMERIC(10,2) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);

-- Extend invoices
ALTER TABLE public.invoices
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id),
  ADD COLUMN IF NOT EXISTS source_website public.website_source DEFAULT 'ankshaastra.com',
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS qr_code_data TEXT,
  ADD COLUMN IF NOT EXISTS pdf_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS gst_inclusive BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS gst_total NUMERIC(10,2);

-- Payments ledger
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'captured',
  provider TEXT NOT NULL DEFAULT 'razorpay',
  provider_payment_id TEXT,
  provider_order_id TEXT,
  payment_method TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_payments_provider_payment_id ON public.payments(provider_payment_id);

-- Communication templates
CREATE TABLE public.communication_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'sms')),
  name TEXT NOT NULL,
  subject TEXT,
  body_html TEXT,
  body_text TEXT,
  whatsapp_template_name TEXT,
  variables JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.communication_templates (slug, channel, name, subject, body_html) VALUES
  ('invoice_email', 'email', 'Invoice Delivery', 'Your Ankshaastra Invoice {{invoice_number}}',
   '<p>Dear {{customer_name}},</p><p>Please find your invoice {{invoice_number}} for {{service_title}}.</p>'),
  ('order_confirmation_email', 'email', 'Order Confirmation', 'Order Confirmed — {{service_title}}',
   '<p>Thank you {{customer_name}}. Your order is confirmed.</p>'),
  ('invoice_whatsapp', 'whatsapp', 'Invoice WhatsApp', NULL,
   'Hello {{customer_name}}, your invoice {{invoice_number}} for ₹{{total_amount}} is ready.');

-- Email logs
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id),
  order_id UUID REFERENCES public.orders(id),
  invoice_id UUID REFERENCES public.invoices(id),
  template_slug TEXT,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'smtp',
  status public.communication_status NOT NULL DEFAULT 'queued',
  provider_message_id TEXT,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_logs_status ON public.email_logs(status);
CREATE INDEX idx_email_logs_customer_id ON public.email_logs(customer_id);

-- WhatsApp logs
CREATE TABLE public.whatsapp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id),
  order_id UUID REFERENCES public.orders(id),
  invoice_id UUID REFERENCES public.invoices(id),
  template_slug TEXT,
  to_phone TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'cloud_api',
  status public.communication_status NOT NULL DEFAULT 'queued',
  provider_message_id TEXT,
  media_url TEXT,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_whatsapp_logs_status ON public.whatsapp_logs(status);

-- Extend webhooks_log
ALTER TABLE public.webhooks_log
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS retry_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS signature_valid BOOLEAN;

CREATE UNIQUE INDEX IF NOT EXISTS idx_webhooks_idempotency
  ON public.webhooks_log(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- Workflow events (audit trail)
CREATE TABLE public.workflow_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id),
  event_type TEXT NOT NULL,
  from_stage public.workflow_stage,
  to_stage public.workflow_stage,
  payload JSONB NOT NULL DEFAULT '{}',
  triggered_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workflow_events_order_id ON public.workflow_events(order_id);

-- Automation job queue (replaces Celery for serverless)
CREATE TABLE public.automation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  status public.automation_job_status NOT NULL DEFAULT 'pending',
  priority INT NOT NULL DEFAULT 5,
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_error TEXT,
  idempotency_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_automation_jobs_idempotency
  ON public.automation_jobs(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX idx_automation_jobs_pending ON public.automation_jobs(status, scheduled_at)
  WHERE status IN ('pending', 'failed');

-- AI reports tracking
CREATE TABLE public.ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id),
  report_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  input_data JSONB NOT NULL DEFAULT '{}',
  output_url TEXT,
  pdf_url TEXT,
  delivered_via TEXT[],
  error_message TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS policies for new tables
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gst_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage websites" ON public.websites FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage customers" ON public.customers FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage gst_config" ON public.gst_config FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage product_catalog" ON public.product_catalog FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage invoice_items" ON public.invoice_items FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage payments" ON public.payments FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage communication_templates" ON public.communication_templates FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage email_logs" ON public.email_logs FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage whatsapp_logs" ON public.whatsapp_logs FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage workflow_events" ON public.workflow_events FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage automation_jobs" ON public.automation_jobs FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage ai_reports" ON public.ai_reports FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Triggers
CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON public.websites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gst_config_updated_at BEFORE UPDATE ON public.gst_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_catalog_updated_at BEFORE UPDATE ON public.product_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_communication_templates_updated_at BEFORE UPDATE ON public.communication_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ai_reports_updated_at BEFORE UPDATE ON public.ai_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for invoice PDFs (run via Supabase dashboard if bucket API unavailable)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('invoices', 'invoices', false);
