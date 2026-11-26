import { getUserFromAuthHeader, isAdminUser } from '../lib/auth-api.js';
import {
  filterCandidates, variantsForTarget, chaldeanTotal, reduceToSingleDigit,
  type Candidate, type Rules,
} from '../lib/chaldean-names.js';

type Req = {
  method?: string;
  headers?: { authorization?: string; Authorization?: string };
  body?: {
    gender?: string;
    /** The baby's chosen name the nick name is for, e.g. "Shanvi". */
    name?: string;
    /** Lucky numbers (1-9). Every nick name returned adds up (Chaldean, reduced) to one of these. */
    numbers?: (number | string)[];
    /** Optional allowed starting alphabets; defaults to the first letter of `name`. */
    starts?: string[] | string;
    count?: number; preference?: string; avoid?: string[]; feedback?: string;
  };
};
type Res = { status: (n: number) => { json: (o: unknown) => void; end: () => void } };

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';
const PRICE_IN = Number(process.env.ANTHROPIC_PRICE_IN_PER_MTOK || 2);
const PRICE_OUT = Number(process.env.ANTHROPIC_PRICE_OUT_PER_MTOK || 10);
const BUDGET_MS = 45_000;
const MIN_NICKS = 8;
const POOL = 40; // nick names asked from the AI per call

/** The AI only picks good nick names. Spelling variants and the lucky-number arithmetic are done by code. */
const SYSTEM = `You are a premium Indian baby-naming expert working for "Ankshaastra".
Suggest affectionate NICK NAMES (pet names, "ghar ke naam") for a baby, the kind Indian families really use today: short (1-3 syllables), cute, easy to say and spell, positive.

STRICT QUALITY RULES:
- A nick name should feel connected to the baby's name (a shortened form, a sweet variation, or a sound-alike), e.g. Shanvi -> Shanu, Shani, Shanvu; Aarav -> Aaru, Ravi.
- Real, usable nick names only. No fragments, no random words, no old-fashioned or embarrassing nick names, nothing that sounds awkward in English or Hindi.
- NORMAL spelling only (no odd spellings). Do NOT worry about numerology; it is checked separately by code.

For every nick name return: "name" (normal spelling), "meaning" (2-5 words: how it connects to the name, or a sweet meaning), "score" (1-10: how cute, natural and family-friendly it feels).
Return ONLY a JSON array, no markdown, no commentary. Start your reply with [ immediately.`;

type Pick = { name: string; meaning: string; score: number };

function parsePicks(text: string): Pick[] {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const out: Pick[] = [];
  for (const o of cleaned.match(/\{[^{}]*\}/g) || []) {
    try {
      const x = JSON.parse(o);
      const name = String(x?.name ?? x?.base ?? '').trim();
      if (/^[A-Za-z]{2,10}$/.test(name)) out.push({ name, meaning: String(x.meaning || ''), score: Number(x.score) || 5 });
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
        max_tokens: 2500,
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
 * body: { gender, name, numbers: [3,5], starts?, count?, preference?, feedback?, avoid?: string[] }
 */
export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = await getUserFromAuthHeader(req.headers?.authorization || req.headers?.Authorization);
  if (!user) return res.status(401).json({ error: 'Not signed in' });
  if (!(await isAdminUser(user.id))) return res.status(403).json({ error: 'Access Denied' });

  const body = req.body || {};
  const gender = body.gender === 'girl' ? 'girl' : 'boy';
  const clean = (v: unknown, max: number) =>
    String(v || '').replace(/[^\p{L}\p{N} ,.&'/-]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
  const name = clean(body.name, 40);
  const targets = [...new Set((Array.isArray(body.numbers) ? body.numbers : []).map((n) => Number(n)).filter((n) => Number.isInteger(n) && n >= 1 && n <= 9))];
  if (!targets.length) return res.status(400).json({ error: 'at least one lucky number (1-9) is required' });

  let starts = (Array.isArray(body.starts) ? body.starts : String(body.starts || '').split(/[ ,]+/))
    .map((s) => String(s).trim()).filter((s) => /^[A-Za-z]{1,5}$/.test(s));
  if (!starts.length && /^[A-Za-z]/.test(name)) starts = [name.charAt(0).toUpperCase()];
  if (!starts.length) return res.status(400).json({ error: 'enter the name (or starting alphabets) for the nick name' });

  const preference = clean(body.preference, 120);
  const feedback = clean(body.feedback, 300);
  const want = Math.min(24, Math.max(3, Math.round(Number(body.count) || MIN_NICKS)));
  const avoidList = (Array.isArray(body.avoid) ? body.avoid : []).map((x) => String(x).trim()).filter(Boolean).slice(0, 100);

  const kept: (Candidate & { lucky: number })[] = [];
  const seenSpelling = new Set<string>();
  const seenBase = new Set<string>();
  for (const a of avoidList) { seenSpelling.add(a.toUpperCase()); seenBase.add(a.toUpperCase()); }
  const allPicks: Pick[] = [];
  let inTok = 0, outTok = 0, rounds = 0, rejectedCount = 0, aiError = '';
  const startedAt = Date.now();

  /** Code, not the AI, finds a spelling of the nick name that adds up to one of the lucky numbers. */
  const fit = (pk: Pick, perBase: number, consonants: boolean, penalty: number) => {
    for (const t of targets) {
      const rules: Rules = { target: t, prefixes: starts, maxLength: 9 };
      const variants = variantsForTarget({ base: pk.name, spelling: pk.name, meaning: pk.meaning, score: pk.score - penalty }, rules, perBase, { consonants });
      const { valid } = filterCandidates(variants, rules, seenSpelling);
      for (const v of valid) { kept.push({ ...v, lucky: t }); seenSpelling.add(v.spelling.toUpperCase()); }
      if (valid.length) return true;
    }
    return false;
  };

  const ANGLES = [
    'Mix of the sweetest short pet names and soft variations.',
    'Prefer unique but natural, modern nick names that are not overused.',
    'Prefer very short (1-2 syllable) cute names, with a gentle ending sound like -u, -i, -o, -ie.',
  ];

  try {
    while (kept.length < want && rounds < 3) {
      const remaining = BUDGET_MS - (Date.now() - startedAt);
      if (remaining < 8_000) break;
      const angleA = ANGLES[(rounds * 2) % ANGLES.length];
      const angleB = ANGLES[(rounds * 2 + 1) % ANGLES.length];
      rounds++;
      const avoidNow = [...new Set([...avoidList, ...kept.map((k) => k.base)])].slice(0, 100).join(', ');
      const basePrompt =
        `Give ${POOL} nick names for a baby ${gender}` + (name ? ` whose name is "${name}"` : '') + `.\n` +
        `Every nick name must START with one of these letters: ${starts.join(', ')}.\n` +
        (preference ? `Family preference (follow it): ${preference}.\n` : '') +
        (feedback ? `The operator is not happy with the earlier nick names and asks for this change (follow it strictly): ${feedback}.\n` : '') +
        (avoidNow ? `Do not suggest any of these: ${avoidNow}.\n` : '');
      const results = await Promise.all([angleA, angleB].map((a) => askClaude(basePrompt + a, remaining)));
      for (const { text, usage } of results) {
        inTok += usage.input_tokens || 0;
        outTok += usage.output_tokens || 0;
        for (const pk of parsePicks(text)) {
          if (seenBase.has(pk.name.toUpperCase())) continue;
          seenBase.add(pk.name.toUpperCase());
          allPicks.push(pk);
          if (!fit(pk, 1, false, 0)) rejectedCount++;
        }
      }
    }
  } catch (e: any) {
    aiError = e?.message || 'AI request failed';
    if (!kept.length) return res.status(502).json({ error: aiError });
  }
  // Still short: allow a second (vowel-doubled) spelling of the picked nick names.
  if (kept.length < want) {
    for (const pk of allPicks) {
      if (kept.length >= want) break;
      fit(pk, 2, false, 1);
    }
  }

  const stats = (cost = 0) => ({ rounds, rejected: rejectedCount, inputTokens: inTok, outputTokens: outTok, costUsd: cost, model: MODEL });
  if (!kept.length) {
    return res.status(200).json({
      nicknames: [], stats: stats(),
      note: 'No nick name fits these lucky numbers and alphabets. Try another lucky number or add starting alphabets.',
    });
  }
  const rank = (c: Candidate) => (c.score || 0) + (c.spelling.toUpperCase() === c.base.toUpperCase() ? 0.5 : 0);
  kept.sort((a, b) => rank(b) - rank(a));
  const nicknames = kept.slice(0, want).map((c) => ({
    name: c.spelling, base: c.base, meaning: c.meaning,
    total: chaldeanTotal(c.spelling), number: reduceToSingleDigit(chaldeanTotal(c.spelling)),
  }));
  const costUsd = (inTok * PRICE_IN + outTok * PRICE_OUT) / 1_000_000;
  const note = nicknames.length < want
    ? `Only ${nicknames.length} nick names fit these lucky numbers. Generate again for more.`
    : aiError ? `Stopped early: ${aiError}` : undefined;
  return res.status(200).json({ nicknames, stats: stats(Number(costUsd.toFixed(5))), ...(note ? { note } : {}) });
}
