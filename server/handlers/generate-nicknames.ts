import { getUserFromAuthHeader, isAdminUser } from '../lib/auth-api.js';
import { chaldeanTotal, reduceToSingleDigit } from '../lib/chaldean-names.js';

type Req = {
  method?: string;
  headers?: { authorization?: string; Authorization?: string };
  body?: {
    /** The baby's names (Step 4). Every name gets exactly 3 nick names. */
    names?: string[] | string;
    /** Lucky numbers (1-9), already calculated by the Swar tool. Treated as final. */
    numbers?: (number | string)[];
    /** What the operator wants changed, e.g. "shorter, ending with u". */
    feedback?: string;
    /** Nick names already shown that must not come back, per name or flat. */
    avoid?: string[];
  };
};
type Res = { status: (n: number) => { json: (o: unknown) => void; end: () => void } };

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';
const PRICE_IN = Number(process.env.ANTHROPIC_PRICE_IN_PER_MTOK || 2);
const PRICE_OUT = Number(process.env.ANTHROPIC_PRICE_OUT_PER_MTOK || 10);
const BUDGET_MS = 45_000;
const PER_NAME = 3;
const MAX_NAMES = 12;
const MAX_ROUNDS = 4;

/** The operator's brief, used as is. Only the reply format (JSON) is added at the end so that code can read it. */
const SYSTEM = `ROLE: Expert Numerologist & Nickname Creator – Ankshaastra

You are an expert numerologist specializing in creating meaningful, attractive, and numerologically compatible nicknames and pet names.

Your task is to generate exactly 3 nickname options for every name provided, ensuring that each nickname aligns with the lucky number(s) supplied alongside that name.

INPUT FORMAT

You will receive:
- Original Name
- Lucky Number(s) (already calculated by our numerology system)

Do NOT recalculate, modify, or question the supplied lucky numbers. Treat them as final and authoritative.

YOUR TASK

For every original name:
- Generate exactly 3 suitable nicknames or pet names.
- Ensure each suggested nickname corresponds to the supplied lucky number(s), using the applicable numerological calculation methodology.
- Maintain the original name's essence and, wherever possible, derive nicknames naturally from the original name.
- Nicknames should sound adorable, affectionate, modern, and natural when spoken in everyday Indian households.
- Prefer short, memorable, easy-to-pronounce nicknames.
- Suggestions should be suitable for babies and children but should also age gracefully.
- Avoid awkward abbreviations, forced spellings, unnecessarily complicated names, or nicknames that sound unnatural.

NUMEROLOGICAL ACCURACY – HIGHEST PRIORITY
- Every suggested nickname must align with the supplied lucky number(s).
- Calculate the nickname's numerological value using the established numerology methodology.
- Verify every calculation before presenting the final options.
- Do not compromise numerological compatibility merely to suggest a cute nickname.
- Do not invent or assume lucky numbers.
- If a nickname does not match the supplied lucky number(s), discard it and find another.
- Never present an unverified nickname as numerologically compatible.

STRICT RULES
- Generate exactly 3 nicknames per original name. No more, no less.
- Do not provide explanations, lengthy descriptions, or unnecessary commentary.
- Do not repeat the same nickname for different names unless it is genuinely appropriate.
- Do not suggest random popular pet names without checking numerological compatibility.
- Maintain correct spelling and pronunciation.
- Do not alter the original name.
- If multiple names are provided, process every name separately.
- Do not ask for Date of Birth or any additional birth details. The lucky numbers are already provided.

FINAL QUALITY CHECK
Before submitting: verify all 3 nicknames for each name; confirm that each nickname matches at least one of the supplied lucky numbers; ensure the nicknames are genuinely appealing and usable; confirm that there are exactly 3 suggestions per original name.

Remember: Numerological accuracy comes first, followed by cuteness, simplicity, and everyday usability.
You are creating premium-quality nickname recommendations for Ankshaastra. Every suggestion should be something parents would genuinely love calling their child.

REPLY FORMAT (required by our software): return ONLY a JSON array, no markdown and no commentary, starting with [ immediately, one object per original name, in the same order:
[{"name":"<original name exactly as given>","nicknames":["<nick 1>","<nick 2>","<nick 3>"]}]`;

const TABLE = 'Chaldean values: 1 A I J Q Y | 2 B K R | 3 C G L S | 4 D M T | 5 E H N X | 6 U V W | 7 O Z | 8 F P (there is no 9). Add the values of all letters, then reduce to a single digit.';

type Row = { name: string; nicknames: string[] };

function parseRows(text: string): Row[] {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const out: Row[] = [];
  for (const o of cleaned.match(/\{[^{}]*\[[^\]]*\][^{}]*\}/g) || []) {
    try {
      const x = JSON.parse(o);
      const name = String(x?.name ?? '').trim();
      const nicks = (Array.isArray(x?.nicknames) ? x.nicknames : []).map((n: unknown) => String(n).trim()).filter(Boolean);
      if (name) out.push({ name, nicknames: nicks });
    } catch { /* skip broken object */ }
  }
  return out;
}

async function askClaude(userPrompt: string, timeoutMs: number) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set on the server');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let resp: Response;
  try {
    resp = await fetch('https://api.anthropic.com/v1/messages', {
      signal: ctrl.signal,
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 3000,
        thinking: { type: 'disabled' },
        system: SYSTEM,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new Error('AI took too long. Please try again.');
    throw e;
  } finally { clearTimeout(timer); }
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Claude API error ${resp.status}: ${t.slice(0, 300)}`);
  }
  const data: any = await resp.json();
  const text = (data.content || []).map((b: any) => (b.type === 'text' ? b.text : '')).join('');
  return { text, usage: data.usage || { input_tokens: 0, output_tokens: 0 } };
}

/**
 * POST /api/admin/generate-nicknames   (admin only)
 * body: { names: ["Shanvi", ...], numbers: [3,5], feedback?, avoid?: string[] }
 * Returns exactly 3 nick names per name (fewer only when no valid one could be found); the arithmetic is re-checked here.
 */
export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = await getUserFromAuthHeader(req.headers?.authorization || req.headers?.Authorization);
  if (!user) return res.status(401).json({ error: 'Not signed in' });
  if (!(await isAdminUser(user.id))) return res.status(403).json({ error: 'Access Denied' });

  const body = req.body || {};
  const clean = (v: unknown, max: number) =>
    String(v || '').replace(/[^\p{L}\p{N} ,.&'/-]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
  const rawNames = Array.isArray(body.names) ? body.names : String(body.names || '').split(/[,\n]+/);
  const names = [...new Set(rawNames.map((n) => clean(n, 40)).filter((n) => /^[\p{L} ]{2,40}$/u.test(n)))].slice(0, MAX_NAMES);
  if (!names.length) return res.status(400).json({ error: 'at least one name is required' });
  const lucky = [...new Set((Array.isArray(body.numbers) ? body.numbers : []).map((n) => Number(n)).filter((n) => Number.isInteger(n) && n >= 1 && n <= 9))];
  if (!lucky.length) return res.status(400).json({ error: 'at least one lucky number (1-9) is required' });
  const feedback = clean(body.feedback, 300);
  const avoidAll = new Set((Array.isArray(body.avoid) ? body.avoid : []).map((x) => String(x).trim().toUpperCase()).filter(Boolean));

  const good = new Map<string, { name: string; total: number; number: number }[]>(names.map((n) => [n, []]));
  const used = new Set<string>(avoidAll);                       // a nick name is never given twice
  const rejectedBy = new Map<string, string[]>(names.map((n) => [n, []]));
  let inTok = 0, outTok = 0, rounds = 0, rejectedCount = 0, aiError = '';
  const startedAt = Date.now();

  const missing = () => names.filter((n) => (good.get(n)?.length ?? 0) < PER_NAME);

  try {
    while (missing().length && rounds < MAX_ROUNDS) {
      const remaining = BUDGET_MS - (Date.now() - startedAt);
      if (remaining < 8_000) break;
      const todo = missing();
      const first = rounds === 0;
      rounds++;
      const lines = todo.map((n) => {
        const have = good.get(n)!.map((g) => g.name);
        const bad = rejectedBy.get(n)!.slice(-12);
        return `- Original Name: ${n}` +
          (first ? '' : ` | still needs ${PER_NAME - have.length} more nicknames` + (have.length ? ` (already accepted: ${have.join(', ')})` : '') +
            (bad.length ? ` | rejected, do not repeat: ${bad.join(', ')}` : ''));
      }).join('\n');
      const prompt =
        `Lucky Number(s): ${lucky.join(', ')}\n${TABLE}\n\n` +
        (feedback ? `The operator is not happy with the earlier nicknames and asks for this change (follow it): ${feedback}.\n\n` : '') +
        (avoidAll.size ? `Do not suggest these nicknames again: ${[...avoidAll].join(', ')}.\n\n` : '') +
        (first
          ? `Names:\n${lines}`
          : `Internal re-check pass: for each name below return 6 candidate nicknames (not 3); our code keeps the ones that match. Verify each calculation.\n${lines}`);
      const { text, usage } = await askClaude(prompt, remaining);
      inTok += usage.input_tokens || 0;
      outTok += usage.output_tokens || 0;

      for (const row of parseRows(text)) {
        const orig = todo.find((n) => n.toUpperCase() === row.name.toUpperCase());
        if (!orig) continue;
        const bucket = good.get(orig)!;
        for (const nick of row.nicknames) {
          if (bucket.length >= PER_NAME) break;
          if (!/^[A-Za-z]{2,12}$/.test(nick)) { rejectedCount++; continue; }
          const key = nick.toUpperCase();
          if (used.has(key) || key === orig.replace(/\s+/g, '').toUpperCase()) continue;
          const total = chaldeanTotal(nick);
          const num = reduceToSingleDigit(total);
          // code, not the AI, decides whether the nick name really is on a lucky number
          if (!lucky.includes(num)) { rejectedCount++; rejectedBy.get(orig)!.push(`${nick} (=${num})`); continue; }
          used.add(key);
          bucket.push({ name: nick.charAt(0).toUpperCase() + nick.slice(1).toLowerCase(), total, number: num });
        }
      }
    }
  } catch (e: any) {
    aiError = e?.message || 'AI request failed';
    if (![...good.values()].some((g) => g.length)) return res.status(502).json({ error: aiError });
  }

  const results = names.map((n) => ({ name: n, nicknames: good.get(n)! }));
  const short = results.filter((r) => r.nicknames.length < PER_NAME).map((r) => r.name);
  const costUsd = (inTok * PRICE_IN + outTok * PRICE_OUT) / 1_000_000;
  const note = short.length
    ? `Could not find 3 verified nick names for ${short.join(', ')}. Press Generate again.`
    : aiError ? `Stopped early: ${aiError}` : undefined;
  return res.status(200).json({
    results, lucky,
    stats: { rounds, rejected: rejectedCount, inputTokens: inTok, outputTokens: outTok, costUsd: Number(costUsd.toFixed(5)), model: MODEL },
    ...(note ? { note } : {}),
  });
}
