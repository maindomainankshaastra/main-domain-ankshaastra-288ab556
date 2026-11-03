import { getUserFromAuthHeader, isAdminUser } from '../lib/auth-api.js';
import {
  filterCandidates, chaldeanTotal, reduceToSingleDigit,
  type Candidate, type Rules,
} from '../lib/chaldean-names.js';

type Req = {
  method?: string;
  headers?: { authorization?: string; Authorization?: string };
  body?: { gender?: string; number?: number | string; starts?: string[] | string; count?: number };
};
type Res = { status: (n: number) => { json: (o: unknown) => void; end: () => void } };

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';
// $ per million tokens. Override via env (ANTHROPIC_PRICE_*) if you change the model.
const PRICE_IN = Number(process.env.ANTHROPIC_PRICE_IN_PER_MTOK || 2);
const PRICE_OUT = Number(process.env.ANTHROPIC_PRICE_OUT_PER_MTOK || 10);
const MAX_ROUNDS = 3;
// Vercel function limit is 60s; stop well before it so we always return JSON.
const BUDGET_MS = 45_000;
const WANT = 12;

const SYSTEM = `You are India's premium Chaldean Numerology Naming Expert working for "Ankshaastra".
Generate premium, modern, trendy, short, easy-to-pronounce Hindu baby names (WhatsApp-friendly, influencer/celebrity style). Never outdated names.

SPELLING RULE (very important): you may only REPEAT letters that already exist inside the original name. Never add new letters.
Examples: PRANAV -> PRAANAV, PRANNAV, PRANAVV are fine. PRANAVO, PRANAVIK, PRANAVESH are NOT.
Use at most ONE extra repeated letter, never three in a row, keep pronunciation natural, no robotic spellings.

For every name return: "base" (the real name, normal spelling), "spelling" (the numerology spelling you propose; may equal base), "meaning" (3-6 words, elegant), "score" (1-10 for how premium/trendy it feels).
Return ONLY a JSON array, no markdown, no commentary, no reasoning or calculations. Start your reply with [ immediately.`;

function toCandidate(x: any): Candidate | null {
  if (!x || typeof x.base !== 'string' || typeof x.spelling !== 'string') return null;
  return {
    base: String(x.base), spelling: String(x.spelling),
    meaning: String(x.meaning || ''), score: Number(x.score) || 5,
  };
}

// Tolerant parser: works even if the reply has extra text or was cut off mid-array
// (we simply keep every complete {...} object we can find).
function parseJson(text: string): Candidate[] {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const out: Candidate[] = [];
  const objs = cleaned.match(/\{[^{}]*\}/g) || [];
  for (const o of objs) {
    try { const c = toCandidate(JSON.parse(o)); if (c) out.push(c); } catch { /* skip broken object */ }
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
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 3000,
      system: SYSTEM,
      messages: [{ role: 'user', content: userPrompt }],
    }),
    });
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new Error('AI took too long. Try again, or add more starting alphabets.');
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
 * POST /api/generate-names   (admin only)
 * body: { gender: "boy"|"girl", number: 1..9, starts: ["Ni","Nee","N"] }
 */
export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = await getUserFromAuthHeader(req.headers?.authorization || req.headers?.Authorization);
  if (!user) return res.status(401).json({ error: 'Not signed in' });
  if (!(await isAdminUser(user.id))) return res.status(403).json({ error: 'Access Denied' });

  const body = req.body || {};
  const gender = body.gender === 'girl' ? 'girl' : 'boy';
  const target = Number(body.number);
  const starts = (Array.isArray(body.starts) ? body.starts : String(body.starts || '').split(/[ ,]+/))
    .map((s) => String(s).trim()).filter((s) => /^[A-Za-z]{1,5}$/.test(s));
  if (!Number.isInteger(target) || target < 1 || target > 9) {
    return res.status(400).json({ error: 'number must be 1-9' });
  }
  if (!starts.length) return res.status(400).json({ error: 'at least one starting alphabet is required' });

  const rules: Rules = { target, prefixes: starts };
  const kept: Candidate[] = [];
  const seen = new Set<string>();
  let inTok = 0, outTok = 0, rounds = 0, rejectedCount = 0;
  const startedAt = Date.now();
  let aiError = '';

  try {
    while (kept.length < WANT && rounds < MAX_ROUNDS) {
      const remaining = BUDGET_MS - (Date.now() - startedAt);
      if (remaining < 8_000) break;
      rounds++;
      const avoid = [...seen].slice(0, 40).join(', ');
      const basePrompt =
        `Give 20 ${gender} names whose numerology spelling starts with one of: ${starts.join(', ')}.\n` +
        `Target Chaldean total (reduced to a single digit): ${target}.\n` +
        `Chaldean values: 1 A I J Q Y | 2 B K R | 3 C G L S | 4 D M T | 5 E H N X | 6 U V W | 7 O Z | 8 F P (no 9).\n` +
        `Aim for the spelling's letters to add up to ${target} after reducing; we will re-check every name by code.\n` +
        (avoid ? `Do not repeat these: ${avoid}.\n` : '');
      // two calls in parallel with different flavours -> same wall-clock time, 2x the candidates
      const prompts = [
        basePrompt + 'Mix of modern and classic names.',
        basePrompt + 'Prefer unique, rare, modern names.',
      ];
      const results = await Promise.all(prompts.map((pr) => askClaude(pr, remaining)));
      for (const { text, usage } of results) {
        inTok += usage.input_tokens || 0;
        outTok += usage.output_tokens || 0;
        const parsed = parseJson(text);
        if (!parsed.length) console.error('generate-names: no parsable names. Reply started with:', text.slice(0, 300));
        const { valid, rejected } = filterCandidates(parsed, rules, seen);
        rejectedCount += rejected.length;
        for (const v of valid) { kept.push(v); seen.add(v.spelling.toUpperCase()); }
      }
    }
  } catch (e: any) {
    aiError = e?.message || 'AI request failed';
    // keep any names already found; only fail if we have nothing
    if (!kept.length) return res.status(502).json({ error: aiError });
  }
  if (!kept.length) {
    return res.status(200).json({
      names: [],
      stats: { rounds, rejected: rejectedCount, inputTokens: inTok, outputTokens: outTok, costUsd: 0, model: MODEL },
      note: 'No valid names found for this combination. Try more starting alphabets or a different number.',
    });
  }

  kept.sort((a, b) => (b.score || 0) - (a.score || 0));
  const names = kept.slice(0, 15).map((c) => ({
    name: c.spelling, base: c.base, meaning: c.meaning,
    total: chaldeanTotal(c.spelling), number: reduceToSingleDigit(chaldeanTotal(c.spelling)),
  }));
  const costUsd = (inTok * PRICE_IN + outTok * PRICE_OUT) / 1_000_000;
  return res.status(200).json({
    names,
    stats: { rounds, rejected: rejectedCount, inputTokens: inTok, outputTokens: outTok, costUsd: Number(costUsd.toFixed(5)), model: MODEL },
  });
}
