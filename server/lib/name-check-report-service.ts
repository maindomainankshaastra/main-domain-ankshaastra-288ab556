/**
 * Automatic Name Check report: order paid -> report row -> PDF -> email.
 *
 * Flow (all inline/awaited — this host has no background execution, see the
 * note in schedule-invoice.ts):
 *   1. Read the paid order + its form snapshot, work out the person(s).
 *   2. For every person create/claim a name_check_reports row
 *      (unique per order_id + person_index, so webhook + browser callbacks
 *      for the same payment can never produce a duplicate).
 *   3. Generate the PDF (same generator the admin panel uses), upload it to
 *      the "name-check-reports" bucket, store the CRM summary on the row.
 *   4. Email every PDF in ONE mail from no-reply@ankshaastra.in with a hidden
 *      BCC copy to the admin mailbox; stamp emailed_at / message id on the rows
 *      (the mail itself is also written to email_logs by sendEmail()).
 * If anything fails the row keeps auto_status = 'failed' + auto_error, and a
 * retry job is queued (daily cron) — admin can also retry from the panel.
 */
import { getSupabaseAdmin } from './supabase-admin.js';
import { sendEmail } from './email-engine.js';
import { wrapEmailLayout } from './templates/email-layout.js';
import { advanceWorkflow, enqueueJob } from './workflow-engine.js';
import {
  generateNameCheckReportPdf,
  computeNameCheckReportContent,
  type NameCheckReportContent,
  type PricingVariant,
} from './generated/name-check-generator.js';

const TABLE = 'name_check_reports';
const BUCKET = 'name-check-reports';
/** A 'processing' claim older than this is considered dead and may be taken over. */
const STALE_CLAIM_MS = 4 * 60 * 1000;

type Dict = Record<string, unknown>;

export type NameCheckSubject = {
  personIndex: number;
  firstName: string;
  middleName: string;
  lastName: string;
  isMiddleNameFatherHusband: boolean;
  dobIso: string;
  gender: string;
};

export type NameCheckAutomationResult =
  | { ok: true; status: 'sent' | 'already_sent' | 'in_progress' | 'not_applicable'; reports?: string[] }
  | { ok: false; error: string };

/* ------------------------------ helpers ------------------------------ */

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v).trim());

function generateReportId(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NCR-${stamp}-${rand}`;
}

function isoDate(y: number, m: number, d: number): string | null {
  const t = new Date(Date.UTC(y, m - 1, d));
  if (t.getUTCFullYear() !== y || t.getUTCMonth() !== m - 1 || t.getUTCDate() !== d) return null;
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Accepts dd/mm/yyyy (India), dd-mm-yyyy, yyyy-mm-dd and ISO timestamps. */
export function parseDobToIso(value: unknown): string | null {
  const s = str(value);
  if (!s) return null;
  let m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/.exec(s);
  if (m) return isoDate(Number(m[1]), Number(m[2]), Number(m[3]));
  m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/.exec(s);
  if (m) return isoDate(Number(m[3]), Number(m[2]), Number(m[1]));
  return null;
}

const isYes = (v: unknown) => /^(y|yes|true|1|father|husband)/i.test(str(v));

export function isNameCheckOrder(order: Dict): boolean {
  const meta = (order.metadata as Dict | undefined) || {};
  const snapshot = (meta.formSnapshot as Dict | undefined) || meta;
  if (/^namecheck-\d+$/i.test(str(snapshot.packageType))) return true;
  return /name\s*check/i.test(str(order.service_title));
}

/** Pulls the person(s) to analyse out of the order's form snapshot. */
export function extractNameCheckSubjects(order: Dict): NameCheckSubject[] {
  const meta = (order.metadata as Dict | undefined) || {};
  const snapshot = ((meta.formSnapshot as Dict | undefined) || meta) as Dict;
  const subjects: NameCheckSubject[] = [];

  for (let n = 1; n <= 3; n++) {
    const obj = (snapshot[`person${n}`] && typeof snapshot[`person${n}`] === 'object'
      ? (snapshot[`person${n}`] as Dict)
      : {}) as Dict;
    const solo = n === 1 ? snapshot : {};
    const first =
      str(snapshot[`person${n}FirstName`]) || str(obj.firstName) || str(solo.firstName);
    if (!first) continue;
    const middle = str(snapshot[`person${n}MiddleName`]) || str(obj.middleName) || str(solo.middleName);
    const last =
      str(snapshot[`person${n}SurName`]) ||
      str(snapshot[`person${n}LastName`]) ||
      str(obj.lastName) ||
      str(obj.surName) ||
      str(solo.lastName) ||
      str(solo.surName);
    const flag =
      snapshot[`person${n}MiddleNameType`] ??
      obj.middleNameType ??
      obj.isMiddleNameFatherHusband ??
      solo.middleNameType ??
      solo.isMiddleNameFatherHusband;
    const dobIso = parseDobToIso(snapshot[`person${n}Dob`] ?? obj.dob ?? solo.dob);
    if (!dobIso) {
      throw new Error(`Name Check person ${n} (${first}) has a missing or unreadable date of birth.`);
    }
    subjects.push({
      personIndex: n,
      firstName: first,
      middleName: middle,
      lastName: last,
      isMiddleNameFatherHusband: Boolean(middle) && isYes(flag),
      dobIso,
      gender: str(snapshot[`person${n}Gender`] ?? obj.gender ?? solo.gender),
    });
  }
  return subjects;
}

/** Client rule: empower orders keep the old page 12 (₹3,437), main domain gets the new one (₹5,957). */
export function pickPricingVariant(sourceWebsite: unknown): PricingVariant {
  return /empower\./i.test(str(sourceWebsite)) ? 'baby-name' : 'blueprint';
}

function fullDisplayName(s: NameCheckSubject): string {
  return [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ');
}

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'Report';
}

function escapeHtml(v: string): string {
  return v.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);
}

/** HR (highly recommended) and OA (advisable) = correction advised; NR = not required. */
export function isCorrectionAdvised(content: NameCheckReportContent): boolean {
  return content.verdict !== 'NR';
}

/* --------------------------- per-person report --------------------------- */

type RowInfo = { id: string; report_id: string; pdfBytes?: Uint8Array; pdfUrl?: string; name: string; email: string };

async function claimRow(
  orderId: string,
  subject: NameCheckSubject,
  base: Dict,
  /** Non-lead persons of a multi-person order: the lead claim already holds the order lock. */
  force = false,
): Promise<{ row: Dict; state: 'claimed' | 'sent' | 'busy' }> {
  const supabase = getSupabaseAdmin();
  const nowIso = new Date().toISOString();

  const { data: existing } = await supabase
    .from(TABLE)
    .select('*')
    .eq('order_id', orderId)
    .eq('person_index', subject.personIndex)
    .maybeSingle();

  if (existing) {
    if (existing.emailed_at) return { row: existing, state: 'sent' };
    if (force) {
      const { data: forced } = await supabase
        .from(TABLE)
        .update({ auto_status: 'processing', auto_started_at: nowIso, auto_error: null })
        .eq('id', existing.id)
        .select('*')
        .maybeSingle();
      return { row: forced ?? existing, state: 'claimed' };
    }
    const started = existing.auto_started_at ? new Date(String(existing.auto_started_at)).getTime() : 0;
    if (existing.auto_status === 'processing' && Date.now() - started < STALE_CLAIM_MS) {
      return { row: existing, state: 'busy' };
    }
    // Take over only if nobody else did it between our read and this write.
    let takeover = supabase
      .from(TABLE)
      .update({ auto_status: 'processing', auto_started_at: nowIso, auto_error: null })
      .eq('id', existing.id);
    takeover = existing.auto_status ? takeover.eq('auto_status', existing.auto_status) : takeover.is('auto_status', null);
    const { data: taken } = await takeover.select('*').maybeSingle();
    if (!taken) return { row: existing, state: 'busy' };
    return { row: taken, state: 'claimed' };
  }

  const { data: inserted, error } = await supabase
    .from(TABLE)
    .insert({
      ...base,
      report_id: generateReportId(),
      order_id: orderId,
      person_index: subject.personIndex,
      status: 'generating',
      auto_status: 'processing',
      auto_started_at: nowIso,
    })
    .select('*')
    .single();
  if (error) {
    if (error.code === '23505') {
      if (force) {
        const { data: again } = await supabase
          .from(TABLE).select('*').eq('order_id', orderId).eq('person_index', subject.personIndex).maybeSingle();
        if (again) return { row: again, state: 'claimed' };
      }
      return { row: {}, state: 'busy' }; // another request claimed it first
    }
    throw error;
  }
  return { row: inserted, state: 'claimed' };
}

async function buildAndStorePdf(row: Dict, subject: NameCheckSubject, pricingVariant: PricingVariant): Promise<RowInfo> {
  const supabase = getSupabaseAdmin();
  const customerName = fullDisplayName(subject);
  const input = {
    reportId: String(row.report_id),
    customerName,
    firstName: subject.firstName,
    middleName: subject.middleName || undefined,
    lastName: subject.lastName || undefined,
    isMiddleNameFatherHusband: subject.isMiddleNameFatherHusband,
    email: str(row.email),
    phone: str(row.phone),
    dob: subject.dobIso,
    gender: subject.gender,
    generatedDate: new Date().toISOString(),
    pricingVariant,
  };

  const content = computeNameCheckReportContent(input);
  const pdfBytes = await generateNameCheckReportPdf(input);

  const filePath = `${row.report_id}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, Buffer.from(pdfBytes), { contentType: 'application/pdf', upsert: true });
  if (uploadError) throw uploadError;
  const pdfUrl = supabase.storage.from(BUCKET).getPublicUrl(filePath).data?.publicUrl ?? null;

  const { error: updateError } = await supabase
    .from(TABLE)
    .update({
      pdf_url: pdfUrl,
      status: 'completed',
      // CRM summary (numbers only, as asked by the client)
      mulank: content.mulank,
      bhagyank: content.bhagyank,
      first_name_total: content.firstNameSum,
      full_name_total: content.fullNameSum,
      compound_number: content.fullNameCompound,
      compound_tier: content.compoundTier,
      verdict_code: content.verdict,
      matched_rule_id: content.matchedRuleId,
      correction_advised: isCorrectionAdvised(content),
      pricing_variant: pricingVariant,
      updated_at: new Date().toISOString(),
    })
    .eq('id', row.id);
  if (updateError) throw updateError;

  return {
    id: String(row.id),
    report_id: String(row.report_id),
    pdfBytes,
    pdfUrl: pdfUrl ?? undefined,
    name: customerName,
    email: str(row.email),
  };
}

/* ------------------------------ main entry ------------------------------ */

export async function processNameCheckOrder(orderId: string): Promise<NameCheckAutomationResult> {
  const supabase = getSupabaseAdmin();

  const { data: order, error } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();
  if (error) throw error;
  if (!order) return { ok: false, error: 'Order not found' };
  if (String(order.status || '').toLowerCase() !== 'paid') return { ok: true, status: 'not_applicable' };
  if (!isNameCheckOrder(order)) return { ok: true, status: 'not_applicable' };

  const meta = (order.metadata as Dict | undefined) || {};
  const snapshot = ((meta.formSnapshot as Dict | undefined) || meta) as Dict;
  const email = str(order.customer_email) || str(snapshot.email);
  if (!email) return { ok: false, error: 'Order has no customer email address' };
  const phone = str(order.customer_phone) || str(snapshot.mobile) || str(snapshot.whatsapp);

  const subjects = extractNameCheckSubjects(order as Dict);
  if (!subjects.length) return { ok: false, error: 'No person details found in this order' };

  const pricingVariant = pickPricingVariant(order.source_website);
  const infos: RowInfo[] = [];
  let anySent = false;
  let anyBusy = false;

  try {
    // The FIRST person's row is the order-level lock: only the call that
    // claims it generates and emails the whole order, so webhook + browser
    // callbacks for the same payment can never double-send.
    for (const [idx, subject] of subjects.entries()) {
      const base = {
        customer_name: fullDisplayName(subject),
        first_name: subject.firstName,
        middle_name: subject.middleName || null,
        last_name: subject.lastName || null,
        is_middle_name_father_husband: subject.isMiddleNameFatherHusband,
        email,
        phone,
        dob: subject.dobIso,
        gender: subject.gender,
        source_website: str(order.source_website) || null,
        pricing_variant: pricingVariant,
      };
      const { row, state } = await claimRow(orderId, subject, base, idx > 0);
      if (state === 'sent') { anySent = true; if (idx === 0) break; continue; }
      if (state === 'busy') { anyBusy = true; if (idx === 0) break; continue; }
      infos.push(await buildAndStorePdf(row, subject, pricingVariant));
    }

    if (!infos.length) {
      return { ok: true, status: anyBusy ? 'in_progress' : anySent ? 'already_sent' : 'not_applicable' };
    }

    // ---- one email, all PDFs attached ----
    const bcc = (process.env.NAME_CHECK_BCC || 'himansshu@ankshaastra.in').trim();
    const replyTo = process.env.NAME_CHECK_REPLY_TO?.trim() || undefined;
    const first = infos[0];
    const multi = infos.length > 1;
    const subjectLine = multi
      ? `Your Name Check Reports – ${infos.length} reports`
      : `Your Name Check Report – ${first.name}`;

    const nameList = infos.map((i) => `<li style="margin:0 0 6px;">${escapeHtml(i.name)} <span style="color:#777;">(Report ID: ${escapeHtml(i.report_id)})</span></li>`).join('');
    const bodyHtml = wrapEmailLayout(
      `<p style="margin:0 0 16px;">Namaskar ${escapeHtml(subjects[0].firstName)} Ji,</p>
<p style="margin:0 0 16px;">Thank you for choosing Ankshaastra. Your personalised Name Check ${multi ? 'Reports are' : 'Report is'} ready and attached to this email as ${multi ? 'PDF files' : 'a PDF'}.</p>
<ul style="margin:0 0 16px;padding-left:20px;">${nameList}</ul>
<p style="margin:0 0 16px;">If you cannot see this email in your inbox, please also check your Spam / Promotions folder.</p>
<p style="margin:0;">Warm regards,<br/>Team Ankshaastra<br/><a href="https://www.ankshaastra.com" style="color:#ae4642;">www.ankshaastra.com</a></p>`,
      subjectLine,
    );

    const attachments = infos.map((i) => ({
      filename: `Name_Check_Report_${safeFileName(i.name)}.pdf`,
      content: Buffer.from(i.pdfBytes as Uint8Array),
      contentType: 'application/pdf',
    }));

    const sent = await sendEmail({
      to: email,
      bcc: bcc || undefined,
      replyTo,
      subject: subjectLine,
      html: bodyHtml,
      attachments,
      templateSlug: 'name_check_report_auto',
      orderId,
      senderProfile: 'noreply',
    });

    const deliveredAt = new Date().toISOString();
    await supabase
      .from(TABLE)
      .update({
        auto_status: 'sent',
        auto_error: null,
        emailed_at: deliveredAt,
        emailed_to: email,
        email_message_id: sent.messageId ?? null,
        follow_up_status: 'pending',
        updated_at: deliveredAt,
      })
      .in('id', infos.map((i) => i.id));

    try {
      await advanceWorkflow(orderId, 'report_delivered', 'name_check_report_emailed', {
        reports: infos.map((i) => i.report_id),
      });
    } catch (e) {
      console.warn('[name-check-auto] workflow stage update failed:', e);
    }

    return { ok: true, status: 'sent', reports: infos.map((i) => i.report_id) };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Name Check automation failed';
    console.error('[name-check-auto] failed for order', orderId, e);
    // Mark every row we were working on as failed so the admin sees it.
    await supabase
      .from(TABLE)
      .update({ auto_status: 'failed', auto_error: msg.slice(0, 500), status: 'failed', updated_at: new Date().toISOString() })
      .eq('order_id', orderId)
      .is('emailed_at', null);
    return { ok: false, error: msg };
  }
}

/**
 * Called from scheduleInvoiceGeneration() after every paid order. Never
 * throws; if the Name Check run fails a retry job is queued.
 */
export async function runNameCheckAutomation(orderId: string): Promise<void> {
  try {
    const result = await processNameCheckOrder(orderId);
    if (!result.ok) {
      await enqueueJob('deliver_name_check_report', { orderId }, { idempotencyKey: `name-check-report:${orderId}`, priority: 2 }).catch(() => undefined);
    }
  } catch (e) {
    console.error('[name-check-auto] unexpected error', e);
    await enqueueJob('deliver_name_check_report', { orderId }, { idempotencyKey: `name-check-report:${orderId}`, priority: 2 }).catch(() => undefined);
  }
}
