



// import { getUserFromAuthHeader, isAdminUser } from '../lib/auth-api.js';
// import {
//   filterCandidates, variantsForTarget, chaldeanTotal, reduceToSingleDigit,
//   type Candidate, type Rules,
// } from '../lib/chaldean-names.js';

// type Req = {
//   method?: string;
//   headers?: { authorization?: string; Authorization?: string };
//   body?: {
//     gender?: string; number?: number | string; starts?: string[] | string; count?: number; preference?: string;
//     /** Names already shown (or rejected) that must not come back. */
//     avoid?: string[];
//     /** What the operator wants changed, e.g. "more modern, shorter, no Shiva names". */
//     feedback?: string;
//   };
// };
// type Res = { status: (n: number) => { json: (o: unknown) => void; end: () => void } };

// const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';
// const PRICE_IN = Number(process.env.ANTHROPIC_PRICE_IN_PER_MTOK || 2);
// const PRICE_OUT = Number(process.env.ANTHROPIC_PRICE_OUT_PER_MTOK || 10);
// const BUDGET_MS = 45_000;
// /** Every normal request returns at least this many names (when enough exist for the number + alphabets). */
// const MIN_NAMES = 12;
// const POOL = 40; // real names asked from the AI per call

// /**
//  * The AI only picks good REAL names. The numerology spelling and the arithmetic are done by code
//  * (spellingVariants + the Chaldean check), so the AI never has to invent odd words to hit a number.
//  */
// const SYSTEM = `You are a premium Indian baby-naming expert working for "Ankshaastra".
// Suggest REAL, authentic baby names that urban Indian parents are actually choosing today (2026): modern, fresh, short (2-3 syllables preferred), easy to say and spell, with a clear positive meaning.

// STRICT QUALITY RULES:
// - Only names that are really in use as first names in India. Never invent words, never use fragments, never use a word that is not a given name.
// - No old-fashioned or dated names (the kind grandparents have, e.g. heavy, rural or archaic names). No names that sound harsh or awkward in English or Hindi.
// - No names of villains or negative characters. No unusual or hard-to-pronounce spellings: give the NORMAL spelling only.
// - Mix tradition and trend: Sanskrit/Vedic, Hindi, and Gurmukhi/regional names are all fine if they sound current.
// - Do NOT worry about numerology; it is checked separately by code.

// For every name return: "name" (normal spelling), "meaning" (3-6 words, elegant), "score" (1-10: how modern, premium and parent-friendly it feels).
// Return ONLY a JSON array, no markdown, no commentary. Start your reply with [ immediately.`;

// type Pick = { name: string; meaning: string; score: number };

// function parsePicks(text: string): Pick[] {
//   const cleaned = text.replace(/```json|```/g, '').trim();
//   const out: Pick[] = [];
//   const objs = cleaned.match(/\{[^{}]*\}/g) || [];
//   for (const o of objs) {
//     try {
//       const x = JSON.parse(o);
//       const name = String(x?.name ?? x?.base ?? '').trim();
//       if (/^[A-Za-z]{2,12}$/.test(name)) out.push({ name, meaning: String(x.meaning || ''), score: Number(x.score) || 5 });
//     } catch { /* skip broken object */ }
//   }
//   return out;
// }

// async function askClaude(userPrompt: string, timeoutMs: number) {
//   const apiKey = process.env.ANTHROPIC_API_KEY;
//   if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set on the server');
//   const ctrl = new AbortController();
//   const timer = setTimeout(() => ctrl.abort(), timeoutMs);
//   let resp: Response;
//   try {
//     resp = await fetch('https://api.anthropic.com/v1/messages', {
//       signal: ctrl.signal,
//       method: 'POST',
//       headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
//       body: JSON.stringify({
//         model: MODEL,
//         max_tokens: 3000,
//         thinking: { type: 'disabled' },
//         system: SYSTEM,
//         messages: [{ role: 'user', content: userPrompt }],
//       }),
//     });
//   } catch (e: any) {
//     if (e?.name === 'AbortError') throw new Error('AI took too long. Try again, or add more starting alphabets.');
//     throw e;
//   } finally { clearTimeout(timer); }
//   if (!resp.ok) {
//     const t = await resp.text();
//     throw new Error(`Claude API error ${resp.status}: ${t.slice(0, 300)}`);
//   }
//   const data: any = await resp.json();
//   const text = (data.content || []).map((b: any) => (b.type === 'text' ? b.text : '')).join('');
//   const debug = `stop=${data.stop_reason}; blocks=${(data.content || []).map((b: any) => b.type).join(',') || 'none'}; text="${text.slice(0, 160).replace(/\s+/g, ' ')}"`;
//   return { text, debug, usage: data.usage || { input_tokens: 0, output_tokens: 0 } };
// }

// /**
//  * POST /api/admin/generate-names   (admin only)
//  * body: { gender, number 1-9, starts: ["Ni","Nee","N"], count?, preference?, feedback?, avoid?: string[] }
//  */
// export default async function handler(req: Req, res: Res) {
//   if (req.method !== 'POST') return res.status(405).end();

//   const user = await getUserFromAuthHeader(req.headers?.authorization || req.headers?.Authorization);
//   if (!user) return res.status(401).json({ error: 'Not signed in' });
//   if (!(await isAdminUser(user.id))) return res.status(403).json({ error: 'Access Denied' });

//   const body = req.body || {};
//   const gender = body.gender === 'girl' ? 'girl' : 'boy';
//   const target = Number(body.number);
//   const starts = (Array.isArray(body.starts) ? body.starts : String(body.starts || '').split(/[ ,]+/))
//     .map((s) => String(s).trim()).filter((s) => /^[A-Za-z]{1,5}$/.test(s));
//   if (!Number.isInteger(target) || target < 1 || target > 9) {
//     return res.status(400).json({ error: 'number must be 1-9' });
//   }
//   if (!starts.length) return res.status(400).json({ error: 'at least one starting alphabet is required' });

//   const clean = (v: unknown, max: number) =>
//     String(v || '').replace(/[^\p{L}\p{N} ,.&'/-]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
//   const preference = clean(body.preference, 120);
//   const feedback = clean(body.feedback, 300);

//   // count: how many names are wanted. 1-3 = "replace this name" (exact count back); otherwise at least MIN_NAMES.
//   const asked = Math.round(Number(body.count) || MIN_NAMES);
//   const small = asked <= 3;
//   const want = small ? Math.max(1, asked) : Math.min(36, Math.max(MIN_NAMES, asked));
//   const maxRounds = want > 15 ? 4 : 3;

//   const avoidList = (Array.isArray(body.avoid) ? body.avoid : []).map((x) => String(x).trim()).filter(Boolean).slice(0, 150);
//   const rules: Rules = { target, prefixes: starts };
//   const kept: Candidate[] = [];
//   const seenSpelling = new Set<string>();
//   const seenBase = new Set<string>();
//   for (const a of avoidList) { seenSpelling.add(a.toUpperCase()); seenBase.add(a.toUpperCase()); }
//   let inTok = 0, outTok = 0, rounds = 0, rejectedCount = 0;
//   const startedAt = Date.now();
//   let aiError = '';
//   let lastDebug = '';
//   const allPicks: Pick[] = [];

//   const ANGLES = [
//     'Mix of modern favourites and fresh classics.',
//     'Prefer unique but easy, modern names that are not yet overused.',
//     'Prefer short, trendy, celebrity-style names (2 syllables).',
//     'Prefer meaningful Sanskrit/Vedic names that still sound current.',
//   ];

//   try {
//     while (kept.length < want && rounds < maxRounds) {
//       const remaining = BUDGET_MS - (Date.now() - startedAt);
//       if (remaining < 8_000) break;
//       const angleA = ANGLES[(rounds * 2) % ANGLES.length];
//       const angleB = ANGLES[(rounds * 2 + 1) % ANGLES.length];
//       rounds++;
//       const avoidNow = [...new Set([...avoidList, ...kept.map((k) => k.base)])].slice(0, 150).join(', ');
//       const basePrompt =
//         `Give ${POOL} ${gender} baby names (normal spelling) that START with one of these letters: ${starts.join(', ')}.\n` +
//         (preference ? `Family preference (follow it): ${preference}.\n` : '') +
//         (feedback ? `The operator is not happy with the earlier names and asks for this change (follow it strictly): ${feedback}.\n` : '') +
//         (avoidNow ? `Do not suggest any of these: ${avoidNow}.\n` : '');
//       const results = await Promise.all([angleA, angleB].map((a) => askClaude(basePrompt + a, remaining)));
//       for (const { text, usage, debug } of results) {
//         lastDebug = debug;
//         inTok += usage.input_tokens || 0;
//         outTok += usage.output_tokens || 0;
//         const picks = parsePicks(text);
//         if (!picks.length) console.error('generate-names: no parsable names. Reply started with:', text.slice(0, 300));
//         for (const pk of picks) {
//           if (seenBase.has(pk.name.toUpperCase())) continue;
//           seenBase.add(pk.name.toUpperCase());
//           allPicks.push(pk);
//           // code, not the AI, finds the spelling(s) that add up to the target
//           const variants = variantsForTarget({ base: pk.name, spelling: pk.name, meaning: pk.meaning, score: pk.score }, rules);
//           if (!variants.length) { rejectedCount++; continue; }
//           const { valid } = filterCandidates(variants, rules, seenSpelling);
//           for (const v of valid) { kept.push(v); seenSpelling.add(v.spelling.toUpperCase()); }
//         }
//       }
//     }
//   } catch (e: any) {
//     aiError = e?.message || 'AI request failed';
//     if (!kept.length) return res.status(502).json({ error: aiError });
//   }
//   // Still short of the minimum? Allow the less natural doubled-consonant spellings of the names already found.
//   if (kept.length < want) {
//     for (const pk of allPicks) {
//       if (kept.length >= want) break;
//       const variants = variantsForTarget({ base: pk.name, spelling: pk.name, meaning: pk.meaning, score: pk.score - 2 }, rules, 1, { consonants: true });
//       const { valid } = filterCandidates(variants, rules, seenSpelling);
//       for (const v of valid) { kept.push(v); seenSpelling.add(v.spelling.toUpperCase()); }
//     }
//   }
//   if (!kept.length && rejectedCount === 0) {
//     console.error('generate-names: unreadable AI reply:', lastDebug);
//     return res.status(502).json({ error: `AI reply could not be read. ${lastDebug}` });
//   }
//   const stats = (cost = 0) => ({ rounds, rejected: rejectedCount, inputTokens: inTok, outputTokens: outTok, costUsd: cost, model: MODEL });
//   if (!kept.length) {
//     return res.status(200).json({
//       names: [], stats: stats(),
//       note: 'No valid names found for this combination. Try more starting alphabets or a different number.',
//     });
//   }

//   // best first; a name spelled normally ranks above one with a doubled letter
//   const rank = (c: Candidate) => (c.score || 0) + (c.spelling.toUpperCase() === c.base.toUpperCase() ? 0.5 : 0);
//   kept.sort((a, b) => rank(b) - rank(a));
//   const names = kept.slice(0, small ? want : Math.max(15, want)).map((c) => ({
//     name: c.spelling, base: c.base, meaning: c.meaning,
//     total: chaldeanTotal(c.spelling), number: reduceToSingleDigit(chaldeanTotal(c.spelling)),
//   }));
//   const costUsd = (inTok * PRICE_IN + outTok * PRICE_OUT) / 1_000_000;
//   const note = !small && names.length < want
//     ? `Only ${names.length} names fit this number and these alphabets. Add more starting alphabets, or press "Add more names".`
//     : aiError ? `Stopped early: ${aiError}` : undefined;
//   return res.status(200).json({ names, stats: stats(Number(costUsd.toFixed(5))), ...(note ? { note } : {}) });
// }


import { getUserFromAuthHeader, isAdminUser } from '../lib/auth-api.js';
import {
  filterCandidates, variantsForTarget, chaldeanTotal, reduceToSingleDigit,
  type Candidate, type Rules,
} from '../lib/chaldean-names.js';

type Req = {
  method?: string;
  headers?: { authorization?: string; Authorization?: string };
  body?: {
    gender?: string; number?: number | string; starts?: string[] | string; count?: number; preference?: string; exact?: boolean;
    /** Names already shown (or rejected) that must not come back. */
    avoid?: string[];
    /** What the operator wants changed, e.g. "more modern, shorter, no Shiva names". */
    feedback?: string;
  };
};
type Res = { status: (n: number) => { json: (o: unknown) => void; end: () => void } };

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';
const PRICE_IN = Number(process.env.ANTHROPIC_PRICE_IN_PER_MTOK || 2);
const PRICE_OUT = Number(process.env.ANTHROPIC_PRICE_OUT_PER_MTOK || 10);
const BUDGET_MS = 45_000;
/** Every normal request returns at least this many names (when enough exist for the number + alphabets). */
const MIN_NAMES = 12;
const POOL = 40; // real names asked from the AI per call

/**
 * The AI only picks good REAL names. The numerology spelling and the arithmetic are done by code
 * (spellingVariants + the Chaldean check), so the AI never has to invent odd words to hit a number.
 */
const SYSTEM = `You are a premium Indian baby-naming expert working for "Ankshaastra".
Suggest REAL, authentic baby names that urban Indian parents are actually choosing today (2026): modern, fresh, short (2-3 syllables preferred), easy to say and spell, with a clear positive meaning.

STRICT QUALITY RULES:
- Only names that are really in use as first names in India. Never invent words, never use fragments, never use a word that is not a given name.
- No old-fashioned or dated names (the kind grandparents have, e.g. heavy, rural or archaic names). No names that sound harsh or awkward in English or Hindi.
- No names of villains or negative characters. No unusual or hard-to-pronounce spellings: give the NORMAL spelling only.
- Mix tradition and trend: Sanskrit/Vedic, Hindi, and Gurmukhi/regional names are all fine if they sound current.
- Do NOT worry about numerology; it is checked separately by code.

For every name return: "name" (normal spelling), "meaning" (3-6 words, elegant), "score" (1-10: how modern, premium and parent-friendly it feels).
Return ONLY a JSON array, no markdown, no commentary. Start your reply with [ immediately.`;

type Pick = { name: string; meaning: string; score: number };

function parsePicks(text: string): Pick[] {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const out: Pick[] = [];
  const objs = cleaned.match(/\{[^{}]*\}/g) || [];
  for (const o of objs) {
    try {
      const x = JSON.parse(o);
      const name = String(x?.name ?? x?.base ?? '').trim();
      if (/^[A-Za-z]{2,12}$/.test(name)) out.push({ name, meaning: String(x.meaning || ''), score: Number(x.score) || 5 });
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
    if (e?.name === 'AbortError') throw new Error('AI took too long. Try again, or add more starting alphabets.');
    throw e;
  } finally { clearTimeout(timer); }
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Claude API error ${resp.status}: ${t.slice(0, 300)}`);
  }
  const data: any = await resp.json();
  const text = (data.content || []).map((b: any) => (b.type === 'text' ? b.text : '')).join('');
  const debug = `stop=${data.stop_reason}; blocks=${(data.content || []).map((b: any) => b.type).join(',') || 'none'}; text="${text.slice(0, 160).replace(/\s+/g, ' ')}"`;
  return { text, debug, usage: data.usage || { input_tokens: 0, output_tokens: 0 } };
}

/**
 * POST /api/admin/generate-names   (admin only)
 * body: { gender, number 1-9, starts: ["Ni","Nee","N"], count?, preference?, feedback?, avoid?: string[] }
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

  const clean = (v: unknown, max: number) =>
    String(v || '').replace(/[^\p{L}\p{N} ,.&'/-]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
  const preference = clean(body.preference, 120);
  const feedback = clean(body.feedback, 300);

  // count: how many names are wanted. 1-3 = "replace this name" (exact count back); otherwise at least MIN_NAMES.
  const asked = Math.round(Number(body.count) || MIN_NAMES);
  const small = body.exact === true || asked <= 3;
  const want = small ? Math.min(36, Math.max(1, asked)) : Math.min(36, Math.max(MIN_NAMES, asked));
  const maxRounds = want > 15 ? 4 : 3;

  const avoidList = (Array.isArray(body.avoid) ? body.avoid : []).map((x) => String(x).trim()).filter(Boolean).slice(0, 150);
  const rules: Rules = { target, prefixes: starts };
  const kept: Candidate[] = [];
  const seenSpelling = new Set<string>();
  const seenBase = new Set<string>();
  for (const a of avoidList) { seenSpelling.add(a.toUpperCase()); seenBase.add(a.toUpperCase()); }
  let inTok = 0, outTok = 0, rounds = 0, rejectedCount = 0;
  const startedAt = Date.now();
  let aiError = '';
  let lastDebug = '';
  const allPicks: Pick[] = [];

  const ANGLES = [
    'Mix of modern favourites and fresh classics.',
    'Prefer unique but easy, modern names that are not yet overused.',
    'Prefer short, trendy, celebrity-style names (2 syllables).',
    'Prefer meaningful Sanskrit/Vedic names that still sound current.',
  ];

  try {
    while (kept.length < want && rounds < maxRounds) {
      const remaining = BUDGET_MS - (Date.now() - startedAt);
      if (remaining < 8_000) break;
      const angleA = ANGLES[(rounds * 2) % ANGLES.length];
      const angleB = ANGLES[(rounds * 2 + 1) % ANGLES.length];
      rounds++;
      const avoidNow = [...new Set([...avoidList, ...kept.map((k) => k.base)])].slice(0, 150).join(', ');
      const basePrompt =
        `Give ${POOL} ${gender} baby names (normal spelling) that START with one of these letters: ${starts.join(', ')}.\n` +
        (preference ? `Family preference (follow it): ${preference}.\n` : '') +
        (feedback ? `The operator is not happy with the earlier names and asks for this change (follow it strictly): ${feedback}.\n` : '') +
        (avoidNow ? `Do not suggest any of these: ${avoidNow}.\n` : '');
      const results = await Promise.all([angleA, angleB].map((a) => askClaude(basePrompt + a, remaining)));
      for (const { text, usage, debug } of results) {
        lastDebug = debug;
        inTok += usage.input_tokens || 0;
        outTok += usage.output_tokens || 0;
        const picks = parsePicks(text);
        if (!picks.length) console.error('generate-names: no parsable names. Reply started with:', text.slice(0, 300));
        for (const pk of picks) {
          if (seenBase.has(pk.name.toUpperCase())) continue;
          seenBase.add(pk.name.toUpperCase());
          allPicks.push(pk);
          // code, not the AI, finds the spelling(s) that add up to the target
          const variants = variantsForTarget({ base: pk.name, spelling: pk.name, meaning: pk.meaning, score: pk.score }, rules, 1); // ONE spelling per name
          if (!variants.length) { rejectedCount++; continue; }
          const { valid } = filterCandidates(variants, rules, seenSpelling);
          for (const v of valid) { kept.push(v); seenSpelling.add(v.spelling.toUpperCase()); }
        }
      }
    }
  } catch (e: any) {
    aiError = e?.message || 'AI request failed';
    if (!kept.length) return res.status(502).json({ error: aiError });
  }
  // Still short of the minimum? First allow a second spelling of the same names (vowel doubled), then, as the very
  // last resort, the less natural doubled-consonant spellings.
  if (kept.length < want) {
    const passes = [{ perBase: 2, consonants: false, penalty: 1 }, { perBase: 1, consonants: true, penalty: 3 }];
    for (const ps of passes) {
      for (const pk of allPicks) {
        if (kept.length >= want) break;
        const variants = variantsForTarget({ base: pk.name, spelling: pk.name, meaning: pk.meaning, score: pk.score - ps.penalty }, rules, ps.perBase, { consonants: ps.consonants });
        const { valid } = filterCandidates(variants, rules, seenSpelling);
        for (const v of valid) { kept.push(v); seenSpelling.add(v.spelling.toUpperCase()); }
      }
    }
  }
  if (!kept.length && rejectedCount === 0) {
    console.error('generate-names: unreadable AI reply:', lastDebug);
    return res.status(502).json({ error: `AI reply could not be read. ${lastDebug}` });
  }
  const stats = (cost = 0) => ({ rounds, rejected: rejectedCount, inputTokens: inTok, outputTokens: outTok, costUsd: cost, model: MODEL });
  if (!kept.length) {
    return res.status(200).json({
      names: [], stats: stats(),
      note: 'No valid names found for this combination. Try more starting alphabets or a different number.',
    });
  }

  // best first; a name spelled normally ranks above one with a doubled letter
  const rank = (c: Candidate) => (c.score || 0) + (c.spelling.toUpperCase() === c.base.toUpperCase() ? 0.5 : 0);
  kept.sort((a, b) => rank(b) - rank(a));
  const names = kept.slice(0, want).map((c) => ({
    name: c.spelling, base: c.base, meaning: c.meaning,
    total: chaldeanTotal(c.spelling), number: reduceToSingleDigit(chaldeanTotal(c.spelling)),
  }));
  const costUsd = (inTok * PRICE_IN + outTok * PRICE_OUT) / 1_000_000;
  const note = !small && names.length < want
    ? `Only ${names.length} names fit this number and these alphabets. Add more starting alphabets, or generate again.`
    : aiError ? `Stopped early: ${aiError}` : undefined;
  return res.status(200).json({ names, stats: stats(Number(costUsd.toFixed(5))), ...(note ? { note } : {}) });
}
