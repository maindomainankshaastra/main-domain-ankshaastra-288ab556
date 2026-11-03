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

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
// $ per million tokens. Defaults = Sonnet 5.5. Override via env if you switch model.
const PRICE_IN = Number(process.env.ANTHROPIC_PRICE_IN_PER_MTOK || 2);
const PRICE_OUT = Number(process.env.ANTHROPIC_PRICE_OUT_PER_MTOK || 10);
const MAX_ROUNDS = 3;
const WANT = 12;

const SYSTEM = `You are India's premium Chaldean Numerology Naming Expert working for "Ankshaastra".
Generate premium, modern, trendy, short, easy-to-pronounce Hindu baby names (WhatsApp-friendly, influencer/celebrity style). Never outdated names.

SPELLING RULE (very important): you may only REPEAT letters that already exist inside the original name. Never add new letters.
Examples: PRANAV -> PRAANAV, PRANNAV, PRANAVV are fine. PRANAVO, PRANAVIK, PRANAVESH are NOT.
Use at most ONE extra repeated letter, never three in a row, keep pronunciation natural, no robotic spellings.

For every name return: "base" (the real name, normal spelling), "spelling" (the numerology spelling you propose; may equal base), "meaning" (3-6 words, elegant), "score" (1-10 for how premium/trendy it feels).
Return ONLY a JSON array, no markdown, no commentary.`;

function parseJson(text: string): Candidate[] {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start === -1 || end === -1) return [];
  try {
    const arr = JSON.parse(cleaned.slice(start, end + 1));
    return (Array.isArray(arr) ? arr : [])
      .filter((x) => x && typeof x.base === 'string' && typeof x.spelling === 'string')
      .map((x) => ({
        base: String(x.base), spelling: String(x.spelling),
        meaning: String(x.meaning || ''), score: Number(x.score) || 5,
      }));
  } catch { return []; }
}

async function askClaude(userPrompt: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set on the server');
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2500,
      system: SYSTEM,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });
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

  try {
    while (kept.length < WANT && rounds < MAX_ROUNDS) {
      rounds++;
      const avoid = [...seen].slice(0, 40).join(', ');
      const prompt =
        `Give 25 ${gender} names whose numerology spelling starts with one of: ${starts.join(', ')}.\n` +
        `Target Chaldean total (reduced to a single digit): ${target}.\n` +
        `Chaldean values: 1 A I J Q Y | 2 B K R | 3 C G L S | 4 D M T | 5 E H N X | 6 U V W | 7 O Z | 8 F P (no 9).\n` +
        `Aim for the spelling's letters to add up to ${target} after reducing; we will re-check every name by code.\n` +
        (avoid ? `Do not repeat these: ${avoid}.\n` : '');
      const { text, usage } = await askClaude(prompt);
      inTok += usage.input_tokens || 0;
      outTok += usage.output_tokens || 0;
      const { valid, rejected } = filterCandidates(parseJson(text), rules, seen);
      rejectedCount += rejected.length;
      for (const v of valid) { kept.push(v); seen.add(v.spelling.toUpperCase()); }
    }
  } catch (e: any) {
    return res.status(502).json({ error: e?.message || 'AI request failed' });
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
