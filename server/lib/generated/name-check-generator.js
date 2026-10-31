// src/components/NameCheckReportGenerator.tsx
import { PDFDocument, rgb, PDFString, PDFName } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

// src/lib/name-check/friendship-table.ts
var FRIENDSHIP_TABLE = {
  1: { friendly: [1, 2, 3, 5, 6, 9], neutral: [4, 7], enemy: [8] },
  2: { friendly: [1, 2, 3, 5], neutral: [6, 7], enemy: [4, 8, 9] },
  3: { friendly: [1, 2, 3, 5], neutral: [4, 7, 8, 9], enemy: [6] },
  4: { friendly: [1, 5, 6, 7], neutral: [3], enemy: [2, 4, 8, 9] },
  5: { friendly: [1, 2, 3, 5, 6], neutral: [4, 7, 8, 9], enemy: [] },
  6: { friendly: [1, 4, 5, 6, 7], neutral: [2, 8, 9], enemy: [3] },
  7: { friendly: [1, 3, 4, 5, 6], neutral: [2, 7, 8, 9], enemy: [] },
  8: { friendly: [3, 5, 6, 7], neutral: [9], enemy: [1, 2, 4, 8] },
  9: { friendly: [1, 3, 5], neutral: [6, 7, 8, 9], enemy: [2, 4] }
};
function getRelation(coreNumber, nameNumber) {
  const row = FRIENDSHIP_TABLE[coreNumber];
  if (!row) {
    throw new Error(`FRIENDSHIP_TABLE has no row for core number ${coreNumber} (expected 1-9)`);
  }
  if (row.friendly.includes(nameNumber)) return "friendly";
  if (row.enemy.includes(nameNumber)) return "enemy";
  return "neutral";
}

// src/lib/name-check/compound-table.ts
var COMPOUND_TABLE = {
  excellent: [1, 3, 6, 17, 19, 23],
  good: [
    5,
    10,
    15,
    21,
    24,
    25,
    27,
    32,
    35,
    36,
    37,
    39,
    41,
    42,
    45,
    48,
    50,
    51,
    60,
    63,
    66,
    72,
    100
  ],
  neutral: [
    30,
    46,
    54,
    57,
    61,
    65,
    68,
    69,
    73,
    75,
    78,
    81,
    82,
    84,
    86,
    87,
    90,
    91,
    93,
    95,
    96
  ],
  conditional: [
    7,
    8,
    9,
    11,
    14,
    20,
    22,
    28,
    31,
    33,
    34,
    38,
    43,
    47,
    52,
    53,
    55,
    56,
    59,
    62,
    70,
    71,
    74,
    77,
    79,
    83,
    88,
    92,
    97,
    99
  ],
  avoid: [4, 12, 13, 16, 18, 26, 29, 40, 44, 49, 58, 64, 67, 76, 80, 85, 89, 94, 98]
};
function reduceToDoubleDigit(n) {
  let value = n;
  while (value > 99) {
    value = String(value).split("").reduce((sum, ch) => sum + Number(ch), 0);
  }
  return value;
}
function getCompoundTier(compoundNumber) {
  const lookupNumber = compoundNumber > 100 ? reduceToDoubleDigit(compoundNumber) : compoundNumber;
  for (const tier of Object.keys(COMPOUND_TABLE)) {
    if (COMPOUND_TABLE[tier].includes(lookupNumber)) {
      return tier;
    }
  }
  throw new Error(
    `Compound number ${compoundNumber} (reduced to ${lookupNumber}) is not covered by COMPOUND_TABLE \u2014 this shouldn't happen for values 1-100; check the input.`
  );
}

// src/lib/name-check/lo-shu.ts
var OVER_AMPLIFICATION_THRESHOLD = 2;
function reduceToSingleDigit(n) {
  let value = Math.abs(n);
  while (value > 9) {
    value = String(value).split("").reduce((sum, ch) => sum + Number(ch), 0);
  }
  return value;
}
function getMulank(day) {
  return reduceToSingleDigit(day);
}
function getBhagyank(day, month, year) {
  const allDigits = `${day}${month}${year}`.split("").map(Number);
  const sum = allDigits.reduce((a, b) => a + b, 0);
  return reduceToSingleDigit(sum);
}
function buildLoShuGrid(day, month, year) {
  const mulank = getMulank(day);
  const bhagyank = getBhagyank(day, month, year);
  const rawDigits = `${day}${month}${year}${mulank}${bhagyank}`.split("").map(Number).filter((d) => d !== 0);
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  for (const d of rawDigits) {
    counts[d] = (counts[d] ?? 0) + 1;
  }
  const present = [];
  const missing = [];
  const repeating = [];
  for (let digit = 1; digit <= 9; digit++) {
    const count = counts[digit];
    if (count > 0) present.push(digit);
    else missing.push(digit);
    if (count >= OVER_AMPLIFICATION_THRESHOLD) repeating.push(digit);
  }
  return { counts, present, missing, repeating };
}
function isOverAmplified(nameNumber, grid) {
  return grid.repeating.includes(nameNumber);
}
var NEVER_GIVEN_TO_NAME = [9, 4, 8, 2];
var RAJYOG_LINES = [
  { combo: "9-5-1", nums: [9, 5, 1] },
  { combo: "2-5-8", nums: [2, 5, 8] },
  { combo: "4-5-6", nums: [4, 5, 6] }
];
function getRajyogPotential(grid, canSupply = () => true) {
  for (const { combo, nums } of RAJYOG_LINES) {
    const missing = nums.filter((n) => !grid.present.includes(n));
    if (missing.length !== 1) continue;
    const need = missing[0];
    if (NEVER_GIVEN_TO_NAME.includes(need)) continue;
    if (!canSupply(need)) continue;
    return { hasPotential: true, matchedCombo: combo };
  }
  return { hasPotential: false, matchedCombo: null };
}

// src/lib/name-check/numerology.ts
var CHALDEAN_CHART = {
  A: 1,
  I: 1,
  J: 1,
  Q: 1,
  Y: 1,
  B: 2,
  K: 2,
  R: 2,
  C: 3,
  G: 3,
  L: 3,
  S: 3,
  D: 4,
  M: 4,
  T: 4,
  E: 5,
  H: 5,
  N: 5,
  X: 5,
  U: 6,
  V: 6,
  W: 6,
  O: 7,
  Z: 7,
  F: 8,
  P: 8
};
function chaldeanRawSum(name) {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "").split("");
  return letters.reduce((sum, letter) => sum + (CHALDEAN_CHART[letter] ?? 0), 0);
}
function getFirstNameNumber(firstName) {
  return reduceToSingleDigit(chaldeanRawSum(firstName));
}
function getFullNameCompoundNumber(fullName) {
  return chaldeanRawSum(fullName);
}
function getFullNameNumber(fullName) {
  return reduceToSingleDigit(getFullNameCompoundNumber(fullName));
}
var RESTRICTED_NUMBERS = {
  4: "Rahu",
  8: "Saturn",
  9: "Mars"
};
function isRestrictedNumber(nameNumber) {
  return nameNumber in RESTRICTED_NUMBERS;
}

// src/lib/name-check/rule-engine.ts
function computeFacts(input) {
  const { day, month, year } = input.dob;
  const mulank = getMulank(day);
  const bhagyank = getBhagyank(day, month, year);
  const grid = buildLoShuGrid(day, month, year);
  const firstNameNumber = getFirstNameNumber(input.firstName);
  const fullNameNumber = getFullNameNumber(input.fullName);
  const fullNameCompoundNumber = getFullNameCompoundNumber(input.fullName);
  const compoundTier = getCompoundTier(fullNameCompoundNumber);
  return {
    mulank,
    bhagyank,
    firstNameNumber,
    fullNameNumber,
    fullNameCompoundNumber,
    compoundTier,
    firstNameToMulank: getRelation(mulank, firstNameNumber),
    firstNameToBhagyank: getRelation(bhagyank, firstNameNumber),
    fullNameToMulank: getRelation(mulank, fullNameNumber),
    fullNameToBhagyank: getRelation(bhagyank, fullNameNumber),
    firstNameRestricted: isRestrictedNumber(firstNameNumber),
    fullNameRestricted: isRestrictedNumber(fullNameNumber),
    // NOTE: computed for reference/display, but intentionally NOT used in
    // matchRule() anymore — client confirmed Lo Shu repetition no longer
    // affects verdict matching.
    firstNameOverAmplified: isOverAmplified(firstNameNumber, grid),
    fullNameOverAmplified: isOverAmplified(fullNameNumber, grid),
    firstNameEqualsMulank: firstNameNumber === mulank,
    fullNameEqualsBhagyank: fullNameNumber === bhagyank,
    // CONFIRMED: weak friendly = friendly to both Mulank and Bhagyank, AND
    // the name number itself is 2 or 7.
    firstNameIsWeakFriendly: getRelation(mulank, firstNameNumber) === "friendly" && getRelation(bhagyank, firstNameNumber) === "friendly" && WEAK_FRIENDLY_NUMBERS.includes(firstNameNumber),
    fullNameIsWeakFriendly: getRelation(mulank, fullNameNumber) === "friendly" && getRelation(bhagyank, fullNameNumber) === "friendly" && WEAK_FRIENDLY_NUMBERS.includes(fullNameNumber),
    // Kept for reference only — no rule currently consumes this (old
    // HR-22 was dropped in the 18-rule revision).
    isPowerfulNumberMatch: mulank === bhagyank && bhagyank === firstNameNumber && firstNameNumber === fullNameNumber,
    // CONFIRMED (2nd round): Rajyog Potential — see lo-shu.ts for the
    // exact 9-5-1 / 2-5-8 / 4-5-6 present/missing logic. Used by HR-11.
    // 3rd round: potential = one number of 9-5-1 / 2-5-8 / 4-5-6 missing in the
    // birth chart, and that number is not 9/4/8/2 and not an Enemy of
    // Mulank or Bhagyank (see lo-shu.ts -> getRajyogPotential).
    hasRajyogPotential: getRajyogPotential(
      grid,
      (n) => getRelation(mulank, n) !== "enemy" && getRelation(bhagyank, n) !== "enemy"
    ).hasPotential
  };
}
var WEAK_FRIENDLY_NUMBERS = [2, 7];
function code(r) {
  return r === "friendly" ? "F" : r === "neutral" ? "N" : "E";
}
var isBadCompound = (facts) => facts.compoundTier === "avoid";
var isExcellentCompound = (facts) => facts.compoundTier === "excellent";
var isGoodCompound = (facts) => facts.compoundTier === "good";
var isConditionalCompound = (facts) => facts.compoundTier === "conditional";
var RAJYOG_VERDICT_ENABLED = false;
var RELATION_RANK = { enemy: 0, neutral: 1, friendly: 2 };
function weakestRelation(a, b) {
  return RELATION_RANK[a] <= RELATION_RANK[b] ? a : b;
}
function matchRule(facts) {
  const firstRel = weakestRelation(facts.firstNameToMulank, facts.firstNameToBhagyank);
  const fullRel = weakestRelation(facts.fullNameToMulank, facts.fullNameToBhagyank);
  const comboCode = `${code(firstRel)}-${code(fullRel)}`;
  if (facts.firstNameRestricted || facts.fullNameRestricted) {
    const restrictedNumber = facts.firstNameRestricted ? facts.firstNameNumber : facts.fullNameNumber;
    if (restrictedNumber === 4) return { ruleId: "HR-07", verdict: "HR", isFallback: false };
    if (restrictedNumber === 8) return { ruleId: "HR-08", verdict: "HR", isFallback: false };
    if (restrictedNumber === 9) return { ruleId: "HR-09", verdict: "HR", isFallback: false };
  }
  if (comboCode === "E-E") return { ruleId: "HR-01", verdict: "HR", isFallback: false };
  if (comboCode === "E-N") return { ruleId: "HR-02", verdict: "HR", isFallback: false };
  if (comboCode === "N-E") return { ruleId: "HR-03", verdict: "HR", isFallback: false };
  if (comboCode === "F-E") return { ruleId: "HR-04", verdict: "HR", isFallback: false };
  if (comboCode === "E-F") return { ruleId: "HR-05", verdict: "HR", isFallback: false };
  if (comboCode === "F-F") {
    if (isBadCompound(facts)) return { ruleId: "HR-06", verdict: "HR", isFallback: false };
    if (facts.firstNameIsWeakFriendly && facts.fullNameIsWeakFriendly) {
      return { ruleId: "HR-10", verdict: "HR", isFallback: false };
    }
    if (RAJYOG_VERDICT_ENABLED && facts.hasRajyogPotential) return { ruleId: "HR-11", verdict: "HR", isFallback: false };
    if (isExcellentCompound(facts)) return { ruleId: "NR-01", verdict: "NR", isFallback: false };
    if (isGoodCompound(facts)) return { ruleId: "NR-02", verdict: "NR", isFallback: false };
    if (isConditionalCompound(facts)) return { ruleId: "NR-03", verdict: "NR", isFallback: false };
  }
  if (comboCode === "F-N") return { ruleId: "OA-02", verdict: "OA", isFallback: false };
  if (comboCode === "N-F") return { ruleId: "OA-03", verdict: "OA", isFallback: false };
  if (comboCode === "N-N") return { ruleId: "OA-01", verdict: "OA", isFallback: false };
  if (isConditionalCompound(facts)) return { ruleId: "OA-04", verdict: "OA", isFallback: false };
  return { ruleId: "NR-02", verdict: "NR", isFallback: true };
}
function runNameCheck(input) {
  const facts = computeFacts(input);
  const { ruleId, verdict, isFallback } = matchRule(facts);
  return { facts, verdict, matchedRuleId: ruleId, isFallback };
}

// src/lib/name-check/content-blocks.ts
function comboKey(mulankRelation, bhagyankRelation) {
  const code2 = (r) => r === "friendly" ? "F" : r === "neutral" ? "N" : "E";
  return `${code2(mulankRelation)}-${code2(bhagyankRelation)}`;
}
var FIRST_NAME_BLOCKS = {
  "F-F": [
    "Your first name is in complete harmony with your date of birth, aligning naturally with both your Mulank and Bhagyank, the two core pillars of your chart.",
    "This alignment supports your personal confidence, daily expression, and long-term direction, without any internal friction or split energy pulling you toward opposite, conflicting directions in life.",
    "A first name in full harmony with both core numbers creates natural momentum, helping you move forward with real clarity in both personal and professional areas of life."
  ],
  "F-N": [
    "Your first name supports your Mulank, your personal identity number, while your Bhagyank, your destiny number, remains in a neutral, unamplified position within the chart overall.",
    "Daily energy and personal confidence receive a positive boost, but at the destiny level, the name neither strongly supports nor creates real obstacles for you right now.",
    "Upgrading to a name that also resonates with your Bhagyank would unlock a stronger, more complete alignment across both of your important core birth numbers overall."
  ],
  "F-E": [
    "Your first name appears to support your Mulank, but it stands in direct conflict with your Bhagyank, and the Enemy relationship remains the dominant factor here.",
    "This conflict with your Bhagyank creates persistent resistance at the destiny level, so long-term outcomes, career direction, and life path results are consistently undermined.",
    "Correcting the name to be Friendly to both Mulank and Bhagyank is strongly advisable, since the destiny-level damage outweighs any benefit from the partial alignment present."
  ],
  "N-F": [
    "Your first name supports your Bhagyank, your destiny number, while remaining neutral toward your Mulank, your personal identity number, in this particular name configuration overall right now.",
    "Opportunities tend to flow more naturally at the life path level, but your personal daily energy still lacks a strong vibrational anchor from the current chosen name.",
    "Aligning the name with both Mulank and Bhagyank would bring full, complete balance across your personal expression and your long-term destiny direction going forward as well."
  ],
  "N-N": [
    "Your first name neither supports nor conflicts with either your Mulank or Bhagyank, sitting in a completely neutral position toward both of your important core numbers.",
    "The name is not causing active harm, but it also provides no vibrational uplift or amplification, leaving you without any energetic support in your daily life.",
    "Upgrading to a name Friendly to both your Mulank and Bhagyank would introduce meaningful positive energy that is currently entirely absent from your current name choice."
  ],
  "N-E": [
    "Your first name directly conflicts with your Bhagyank, your destiny number, while the neutral Mulank relationship offers no positive energy to counterbalance this ongoing vibrational tension.",
    "The name creates persistent resistance at the life path level, so long-term career growth, financial direction, and major achievements are all consistently hindered by this issue.",
    "Correction is recommended to align the name with your Bhagyank and unlock the natural, unobstructed flow of your life path energy going forward from this point."
  ],
  "E-F": [
    "Your first name appears to align with your Bhagyank, but it stands in direct conflict with your Mulank, and the Enemy relationship remains the dominant factor.",
    "The conflict with your Mulank creates persistent friction at the personal identity level, so daily expression, self-confidence, and personal clarity are all consistently affected by this.",
    "Correcting the name to be Friendly to both Mulank and Bhagyank is strongly advisable, since the identity-level conflict outweighs the destiny-level partial benefit present here today."
  ],
  "E-N": [
    "Your first name is in direct conflict with your Mulank, your personal identity number, while the neutral Bhagyank offers no counterbalance or protection whatsoever in return.",
    "The name actively works against your personal energy and daily momentum every time it is used, with no supportive energy anywhere to offset this ongoing conflict.",
    "Correction is recommended to remove this daily friction and replace it with a name that genuinely supports your core birth energy going forward from this point."
  ],
  "E-E": [
    "Your first name directly conflicts with both your Mulank and Bhagyank, the most critical configuration in name numerology, with no supportive anchor present anywhere in it.",
    "Every time your name is used, it activates a vibration that creates friction at your core, accumulating steadily as inner tension and recurring life obstacles daily.",
    "Immediate correction is essential to stop the daily reinforcement of this conflicting energy across both of your core numbers before it compounds even further over time."
  ]
};
var FULL_NAME_BLOCKS = {
  "F-F": [
    "Your full name is in complete harmony with both your Mulank and Bhagyank, creating a unified, supportive resonance at the most important level of your entire chart.",
    "Since the full name governs your long-term career, finances, relationships, and life direction, this alignment ensures these key important areas receive consistent, active vibrational support daily.",
    "This is the ideal full name configuration, working in your favour at every level, supporting both who you are and where you are truly meant to go."
  ],
  "F-N": [
    "Your full name supports your Mulank but remains fully neutral with your Bhagyank, the destiny number that governs long-term life outcomes and your overall career direction.",
    "A neutral Bhagyank relationship means your full name is not actively opening the doors your destiny is designed to open, though personal support still exists here.",
    "Upgrading the full name to one Friendly to both numbers would unlock a stronger, more complete long-term alignment across every important area of your life ahead."
  ],
  "F-E": [
    "Your full name appears to support the Mulank, but it directly conflicts with your Bhagyank, and the Enemy relationship remains the dominant factor at the destiny level.",
    "Since the full name governs your life path and long-term outcomes, this conflict with the Bhagyank is a genuinely serious misalignment affecting your major life achievements overall.",
    "Correction is necessary, as a full name in conflict with your destiny number, even partially, actively works against your long-term potential and your steady overall progress."
  ],
  "N-F": [
    "Your full name supports your Bhagyank, so destiny-level energy flows more naturally, and long-term opportunities arrive more consistently than with a neutral or conflicting full name.",
    "The neutral Mulank relationship means your personal energy is not actively amplified by the name, though the most consequential layer of your entire chart remains well-supported.",
    "The overall configuration is positive and stable. Upgrading to a name Friendly to both numbers would bring complete balance across every level of your entire chart."
  ],
  "N-N": [
    "Your full name is silent at the most consequential level of your chart, providing no active energy or amplification to either your Mulank or your Bhagyank.",
    "Career, finances, long-term relationships, and life path are all navigated without the real benefit of a name energetically working alongside you toward your intended life goals.",
    "Upgrading to a Friendly full name would meaningfully improve the quality and overall consistency of long-term outcomes across the most important areas of your entire life."
  ],
  "N-E": [
    "Your full name is in direct conflict with your Bhagyank, the destiny number governing your most important outcomes, while the neutral Mulank offers no support here.",
    "This is the most consequential form of misalignment in name numerology, so career direction, financial growth, and major life achievements are all consistently hindered by it.",
    "Correction is strongly recommended. The full name must be aligned with your Bhagyank to unlock the natural flow of your life path and long-term destiny ahead."
  ],
  "E-F": [
    "Your full name appears to align with your Bhagyank, but it is in direct conflict with your Mulank, and the Enemy relationship remains the dominant factor here.",
    "The conflict with the Mulank creates persistent inner friction, a disconnect between your personal identity and the broader energy the full name carries over time daily.",
    "Correction to a full name that is Friendly to both Mulank and Bhagyank is necessary for complete vibrational harmony at the destiny level going forward from here."
  ],
  "E-N": [
    "Your full name is in direct conflict with your Mulank, while the neutral Bhagyank relationship provides no counterbalance, so the name creates resistance without any offset here.",
    "The result is a persistent drag on momentum, a disproportionate amount of effort relative to results, and inconsistency in personal and professional outcomes over time overall.",
    "Correction is recommended to remove this ongoing resistance and replace it with a full name that actively supports your core birth energy instead of working against it."
  ],
  "E-E": [
    "Your full name is in direct conflict with both your Mulank and Bhagyank, a complete dual-layer misalignment at the most important level of your entire numerological chart.",
    "Career obstacles, financial inconsistency, relationship friction, and a recurring gap between effort and outcome are the natural, consistent consequences of this exact configuration over time overall.",
    "Immediate correction is essential. Every day the name remains unchanged, the conflicting vibration is reinforced, progressively limiting access to your chart's true potential going forward."
  ]
};
var COMPOUND_BLOCKS = {
  excellent: [
    "Your name carries an Excellent Compound Number, one of the most auspicious vibrations in Chaldean Numerology, adding a powerful layer of continuous positive background energy daily.",
    "This compound does not simply avoid challenges; it actively enhances opportunities, recognition, success, and favorable outcomes across the most important areas of your entire life.",
    "When combined with a well-aligned Base Name Number, an Excellent Compound creates the strongest possible foundation, and no upgrade or correction is needed \u2014 the name already functions at its highest vibrational potential overall."
  ],
  good: [
    "Your name carries a Good Compound Number, a stable and favorable vibration that provides a reliable secondary layer of positive energy to your overall existing name.",
    "It supports steady growth, consistent opportunities, and a generally smooth life experience, without introducing the hidden limitations or instability tied to weaker compound numbers overall today.",
    "Overall, this is a genuinely positive element in your numerological profile, and it can be confidently retained as is, contributing meaningfully to the overall strength and quality of your name as a complete whole."
  ],
  // Client's doc calls this tier "Moderate" in the copy text (same tier as "Neutral" in the table).
  neutral: [
    "Your name carries a Moderate Compound Number, a vibration containing both strengths and limitations, creating a mixed background influence beneath the surface of the name itself.",
    "While the compound offers some positive qualities, it also creates an invisible ceiling that restricts the full potential of an otherwise well-aligned Base Name Number here.",
    "Upgrading to a stronger, more auspicious compound would remove this hidden limitation, allowing the name's full vibrational potential to express itself fully and clearly without any compromise."
  ],
  conditional: [
    "Your name carries a Conditional Compound Number, a vibration that possesses genuine strengths but also comes with a specific area of caution requiring careful ongoing management.",
    "The positive and cautionary aspects of this compound coexist; if the associated vulnerability is ignored, it can gradually become a recurring, limiting pattern over time overall.",
    "Retaining this compound can still be considered when overall name alignment is strong, though upgrading to an unconditionally auspicious compound remains the generally stronger overall option."
  ],
  // Client's doc calls this tier "Bad" in the copy text (same tier as "Avoid" in the table).
  avoid: [
    "Your name carries an Unfavorable Compound Number that introduces hidden challenges, karmic lessons, or recurring patterns of instability beneath the visible surface of the name itself.",
    "This background vibration continues to influence experiences, relationships, decision-making, and long-term outcomes, even when other visible aspects of the name appear outwardly favorable to you now.",
    "Even if the Base Name Number is friendly and well-aligned, an unfavorable compound acts as a hidden limiting factor that active, timely correction can fully resolve."
  ]
};

// src/lib/name-check/hr-oa-nr-blocks.ts
var HR_RULES = [
  {
    id: "HR-01",
    verdict: "HR",
    conditionLabel: "First Name (Enemy) + Full Name (Enemy)",
    paragraphs: [
      "Both your first name and full name are in direct conflict with your core birth numbers, creating a complete dual-layer misalignment at both identity and destiny levels.",
      "Every interaction with your name activates conflicting vibrations at both levels, accumulating daily friction, persistent obstacles, and a consistent gap between effort and outcome over time.",
      "Immediate, comprehensive name correction is essential. Both the first name and full name must be corrected together, since partial correction leaves the remaining layer undermining progress."
    ]
  },
  {
    id: "HR-02",
    verdict: "HR",
    conditionLabel: "First Name (Enemy) + Full Name (Neutral)",
    paragraphs: [
      "Your first name is in direct conflict with your core birth numbers, while your full name offers no supportive energy to counterbalance this hostile, unchecked vibration.",
      "Since the first name is used most frequently in daily life, its conflicting vibration accumulates a disproportionately large negative impact on confidence and daily momentum overall.",
      "Name correction is highly recommended, with the first name corrected as the priority. Upgrading the full name from neutral to Friendly is also strongly advisable alongside this."
    ]
  },
  {
    id: "HR-03",
    verdict: "HR",
    conditionLabel: "First Name (Neutral) + Full Name (Enemy)",
    paragraphs: [
      "Your full name is in direct conflict with your core birth numbers at the destiny level, while the neutral first name provides no counterbalancing energy at all.",
      "Long-term outcomes across career direction, financial growth, and major life achievements are all being consistently hindered by this vibrational conflict at the full name level itself.",
      "Name correction is highly recommended, with the full name corrected as the first priority. First name upgrade from neutral to Friendly is also strongly advisable alongside it."
    ]
  },
  {
    id: "HR-04",
    verdict: "HR",
    conditionLabel: "First Name (Friendly) + Full Name (Enemy)",
    paragraphs: [
      "Your first name is well-aligned and supportive, but your full name conflicts with your core birth numbers at the destiny level, undermining all long-term outcomes quietly.",
      "This creates a pattern of promising starts that fail to sustain, where personal confidence is present but career trajectory and long-term direction are consistently held back.",
      "Name correction is highly recommended for the full name. Correcting it to a Friendly number will align destiny-level energy with the positive personal energy already present."
    ]
  },
  {
    id: "HR-05",
    verdict: "HR",
    conditionLabel: "First Name (Enemy) + Full Name (Friendly) \u2014 VERDICT UPGRADED from old OA-01",
    paragraphs: [
      "Your full name is well-aligned and actively supports your life path and destiny, the most important layer working well, but your first name creates daily friction.",
      "This creates a subtle disconnect, where your broader life path is supported, but daily personal expression, self-confidence, and everyday interactions are consistently affected by this conflict.",
      "Name correction is highly recommended for the first name, Correcting it to a Friendly number will align destiny-level energy with the positive personal energy already present."
    ]
  },
  {
    id: "HR-06",
    verdict: "HR",
    conditionLabel: "First Name (Friendly) + Full Name (Friendly) + Bad Compound",
    paragraphs: [
      "Both your first name and full name carry Friendly vibrations, a strong foundation, but the compound number carries an unfavorable vibration operating as a hidden background energy.",
      "This compound creates a ceiling on the potential your Friendly name numbers would otherwise fully unlock, like a strong engine with a cracked frame beneath the surface.",
      "Name correction is highly recommended to arrive at both a Friendly base number and an auspicious compound, letting your well-aligned names express their full potential clearly."
    ]
  },
  {
    id: "HR-07",
    verdict: "HR",
    conditionLabel: "Name on Number 4 (Rahu)",
    paragraphs: [
      "Your name vibrates on Number 4, governed by Rahu, whose unpredictable and illusory energy creates instability, confusion, and sudden reversals regardless of the friendship table result.",
      "Carrying Number 4 in the name activates Rahu's energy daily, introducing a persistent undercurrent of uncertainty and a misalignment between effort and outcome across every area.",
      "Name correction is highly recommended. Number 4 is a restricted vibration for both first name and full name without exception, so correction to stability is essential."
    ]
  },
  {
    id: "HR-08",
    verdict: "HR",
    conditionLabel: "Name on Number 8 (Saturn)",
    paragraphs: [
      "Your name vibrates on Number 8, governed by Saturn, whose restrictive energy consistently brings delays, burdens, and slow progress regardless of the combination with your core numbers.",
      "Carrying Number 8 in the name activates Saturn's heavy energy daily, creating a cumulative weight that makes consistent forward movement feel disproportionately difficult over time overall.",
      "Name correction is highly recommended. Number 8 is a restricted vibration for both first name and full name without exception, so correction to a lighter number is essential."
    ]
  },
  {
    id: "HR-09",
    verdict: "HR",
    conditionLabel: "Name on Number 9 (Mars)",
    paragraphs: [
      "Your name vibrates on Number 9, governed by Mars, whose intense energy at the full name level amplifies impulsiveness, emotional extremes, and interpersonal friction over time.",
      "Carrying Mars energy at the name level creates reactive decision-making, emotional volatility, and real difficulty sustaining the consistency that long-term success and relationship harmony genuinely require.",
      "Name correction is highly recommended. Number 9 is a restricted vibration at both the full name and first name level, so correction to a calmer number is essential."
    ]
  },
  {
    id: "HR-10",
    verdict: "HR",
    conditionLabel: "First Name (Friendly & Weak) + Full Name (Friendly & Weak) \u2014 CONFIRMED: weak friendly = number 2 or 7",
    paragraphs: [
      "Your first name and full name both vibrate on friendly numbers, so there is no direct conflict with your core birth energies present anywhere in the chart.",
      "However, the planetary energies these numbers carry are among the weaker expressions of compatibility, so friendly doesn't always translate into genuinely powerful vibrational support for you.",
      "Name correction is recommended. Both names should be elevated to stronger, high-vibration friendly numbers to unlock the full potential your birth chart genuinely holds for you."
    ]
  },
  {
    id: "HR-11",
    verdict: "HR",
    conditionLabel: "First Name (Friendly) + Full Name (Friendly, Rajyog Potential) \u2014 CONFIRMED (2nd round): birth chart Lo Shu grid has 9&1, 2&8, or 4&6 present with 5 missing",
    paragraphs: [
      "Your first name vibrates on a friendly number aligned with your birth energies, and your full name also carries a friendly vibration, a stable, supportive nameprint overall.",
      "However, the full name number holds the potential to form a Rajyog combination, one of the most powerful configurations in numerology, built for accelerated growth and success.",
      "Name correction is recommended. The full name should ideally be adjusted to fully activate the Rajyog, so a good nameprint becomes a genuinely exceptional one instead."
    ]
  }
];
var OA_RULES = [
  {
    id: "OA-01",
    verdict: "OA",
    conditionLabel: "First Name (Neutral) + Full Name (Neutral)",
    paragraphs: [
      "Both your first name and full name are neutral, neither creating active damage nor providing any vibrational support at either the personal identity or destiny level.",
      "The result is a stable but consistently average life trajectory, where you navigate personal and professional areas without a name actively working in your energetic favour.",
      "Name correction is advisable for both layers. Upgrading both to Friendly vibrations would introduce meaningful positive energy at every level and meaningfully accelerate growth and opportunity."
    ]
  },
  {
    id: "OA-02",
    verdict: "OA",
    conditionLabel: "First Name (Friendly) + Full Name (Neutral)",
    paragraphs: [
      "Your first name is well-aligned and provides strong, genuine personal energy, but your full name, the layer governing long-term direction and major outcomes, sits neutral overall.",
      "Personal presence and confidence are well-supported, but long-term results tend to plateau without the boost a Friendly full name would naturally provide to career and financial progress.",
      "Name correction is advisable for the full name. Upgrading to a Friendly vibration will complete the alignment and unlock the potential the first name is already pointing toward."
    ]
  },
  {
    id: "OA-03",
    verdict: "OA",
    conditionLabel: "First Name (Neutral) + Full Name (Friendly)",
    paragraphs: [
      "Your full name actively supports your life path and destiny outcomes, the most consequential layer working well, while your first name sits neutral, creating no conflict.",
      "The overall configuration is genuinely positive and stable. The full name does the most important work effectively, while the neutral first name adds no extra amplification.",
      "Name correction is not urgently required. The full name alignment is strong with no active damage, though upgrading the first name to Friendly remains entirely optional."
    ]
  },
  {
    id: "OA-04",
    verdict: "OA",
    conditionLabel: "Compound Number is Conditional (standalone \u2014 see rule-engine.ts note: this may be unreachable given full Friendly/Neutral/Enemy grid coverage above; flagged for client review)",
    paragraphs: [
      "Your name carries a conditional compound, genuine positive potential that comes alongside a specific area of caution or risk requiring conscious acknowledgment and active management here.",
      "The positive and cautionary elements exist together, so the associated vulnerability is real and, if ignored, tends to become a recurring pattern offsetting some of the gains.",
      "Correction to an unconditionally auspicious compound is the cleaner choice, though retaining this compound with full conscious awareness remains a meaningful alternative when alignment is strong."
    ]
  }
];
var NR_RULES = [
  {
    id: "NR-01",
    verdict: "NR",
    conditionLabel: "First Name (Friendly) + Full Name (Friendly) + Excellent Compound + No Lo Shu Repetition",
    paragraphs: [
      "Both your first name and full name are in complete harmony with your Mulank and Bhagyank, active support present at both the personal identity and destiny levels.",
      "Your compound number is excellent, one of the most auspicious vibrations available, adding a powerfully supportive background energy with no planetary over-amplification anywhere in the chart.",
      "Name correction is not required. Your name works at the highest possible level of vibrational harmony across every layer of the assessment, the gold standard outcome."
    ]
  },
  {
    id: "NR-02",
    verdict: "NR",
    conditionLabel: "First Name (Friendly) + Full Name (Friendly) + Good Compound",
    paragraphs: [
      "Both your first name and full name carry Friendly vibrations well-aligned with your Mulank and Bhagyank, active support present at both the personal and destiny levels.",
      "Your compound number is good, a solid and reliably favorable vibration adding a supportive secondary layer to the overall name energy, with all primary conditions met.",
      "Name correction is not required. Your name provides strong, consistent vibrational support across all primary layers of the assessment, and no adjustment is needed here today."
    ]
  },
  {
    id: "NR-03",
    verdict: "NR",
    conditionLabel: "First Name (Friendly) + Full Name (Friendly) + Conditional Compound",
    paragraphs: [
      "Both your first name and full name are Friendly and well-aligned with your Mulank and Bhagyank, the primary layers strong and working actively in your favour here.",
      "Your compound is conditional, carrying positive potential alongside a specific area of caution, though in the context of your strong overall alignment this remains manageable with awareness.",
      "Name correction is not urgently required. Understanding the caution associated with your compound and approaching that area consciously is recommended, while upgrading the compound stays optional."
    ]
  }
];
var ALL_RULES = [...HR_RULES, ...OA_RULES, ...NR_RULES];

// src/components/NameCheckReportGenerator.tsx
var PRICING_PAGE_PATHS = {
  "baby-name": "/name-check-assets/pricing-page-baby-name.png",
  blueprint: "/name-check-assets/pricing-page-blueprint.png"
};
function computeNameCheckReportContent(input) {
  const split = splitName(input.customerName);
  const firstName = input.firstName ?? split.first;
  const middleName = input.middleName ?? split.middle;
  const lastName = input.lastName ?? split.last;
  const dobDate = new Date(input.dob);
  const excludeMiddleNameFromNumerology = input.isMiddleNameFatherHusband === true;
  const middleNameForNumerology = excludeMiddleNameFromNumerology ? "" : middleName;
  const fullName = [firstName, middleNameForNumerology, lastName].filter(Boolean).join(" ").trim();
  const { facts, verdict, matchedRuleId, isFallback } = runNameCheck({
    dob: { day: dobDate.getDate(), month: dobDate.getMonth() + 1, year: dobDate.getFullYear() },
    firstName,
    fullName
  });
  const rule = ALL_RULES.find((r) => r.id === matchedRuleId);
  const rawBullets = rule?.paragraphs ?? [
    "Name correction guidance could not be determined for this combination \u2014 please review this report manually before sending it to the customer."
  ];
  const verdictBullets = rawBullets.length > 1 ? rawBullets.slice(0, -1) : rawBullets;
  const verdictNote = rawBullets.length > 1 ? rawBullets[rawBullets.length - 1] : rawBullets[0];
  return {
    mulank: facts.mulank,
    bhagyank: facts.bhagyank,
    firstNameNumber: facts.firstNameNumber,
    firstNameSum: chaldeanRawSum(firstName),
    fullNameNumber: facts.fullNameNumber,
    fullNameSum: getFullNameCompoundNumber(fullName),
    fullNameCompound: facts.fullNameCompoundNumber,
    compoundTier: facts.compoundTier,
    firstNameAnalysis: [...FIRST_NAME_BLOCKS[comboKey(facts.firstNameToMulank, facts.firstNameToBhagyank)]],
    fullNameAnalysis: [...FULL_NAME_BLOCKS[comboKey(facts.fullNameToMulank, facts.fullNameToBhagyank)]],
    compoundAnalysis: [...COMPOUND_BLOCKS[facts.compoundTier]],
    verdict,
    matchedRuleId,
    isFallback,
    verdictBullets,
    verdictNote
  };
}
var DEFAULT_BRAND = {
  companyName: "Ankshaastra",
  tagline: "Empower Your Name",
  numerologistName: "Himansshu Agarwal Ji",
  email: "support@ankshaastra.com",
  phone: "+91 98765 43210",
  website: "www.ankshaastra.com"
};
function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", middle: "", last: "" };
  if (parts.length === 1) return { first: parts[0], middle: "", last: "" };
  if (parts.length === 2) return { first: parts[0], middle: "", last: parts[1] };
  return { first: parts[0], middle: parts.slice(1, -1).join(" "), last: parts[parts.length - 1] };
}
var PAGE_WIDTH = 595.28;
var PAGE_HEIGHT = 841.89;
var CANVA_SCALE = PAGE_WIDTH / 1860;
var px = (v) => Math.round(v * CANVA_SCALE * 10) / 10;
var TYPE = {
  bodySize: px(45),
  // ~14.4pt — base paragraph / bullet text size
  lineGap: 5,
  // extra px added to font size for line-height inside a paragraph
  bulletGap: 14,
  // vertical gap BETWEEN bullet items (was inconsistently 4/8/12/16 per page)
  bulletDotOffsetRatio: 0.32,
  // dot's y-offset below the text baseline, as a fraction of font size
  cardPadding: 46
  // standard top padding inside a rounded content box, banner to first line of text
};
var COLOR = {
  blush: rgb(0.988, 0.945, 0.925),
  blushPanel: rgb(0.965, 0.902, 0.89),
  maroon: rgb(0.686, 0.271, 0.259),
  maroonDark: rgb(0.6, 0.22, 0.21),
  ink: rgb(0.686, 0.271, 0.259),
  muted: rgb(0.62, 0.42, 0.4),
  white: rgb(1, 1, 1),
  cream: rgb(0.99, 0.97, 0.95),
  green: rgb(0.15, 0.45, 0.2),
  red: rgb(0.6, 0.15, 0.15),
  black: rgb(0.12, 0.12, 0.12)
};
var ASSET_PATHS = {
  background: "/name-check-assets/background-border.png",
  backCoverBackground: "/name-check-assets/background-back-cover.jpeg",
  logo: "/name-check-assets/logo-ankshaastra.png",
  loshuGrid: "/name-check-assets/loshu-turtle-grid.png",
  starIcon: "/name-check-assets/star-icon.png",
  handsPraying: "/name-check-assets/praying-hands.png",
  socialInstagram: "/name-check-assets/social-instagram.png",
  socialLinkedin: "/name-check-assets/social-linkedin.png",
  socialYoutube: "/name-check-assets/social-youtube.png",
  socialFacebook: "/name-check-assets/social-facebook.png",
  offerIconPen: "/name-check-assets/offer-icon-pen.png",
  offerIconDigits: "/name-check-assets/offer-icon-digits.png",
  fonts: {
    quicksandRegular: "/name-check-assets/fonts/Quicksand-Regular.ttf",
    quicksandBold: "/name-check-assets/fonts/Quicksand-Bold.ttf",
    cinzelDecorativeBold: "/name-check-assets/fonts/CinzelDecorative-Bold.ttf",
    cardoRegular: "/name-check-assets/fonts/Cardo-Regular.ttf"
  }
};
async function fetchAssetBytesOnServer(path) {
  const fsModule = "node:fs/promises";
  const pathModule = "node:path";
  try {
    const fs = await import(
      /* @vite-ignore */
      fsModule
    );
    const nodePath = await import(
      /* @vite-ignore */
      pathModule
    );
    const buf = await fs.readFile(nodePath.join(process.cwd(), "public", path));
    return new Uint8Array(buf);
  } catch {
  }
  const env = typeof process !== "undefined" ? process.env : {};
  const base = (env.NAME_CHECK_ASSET_BASE_URL || env.SITE_URL || env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  if (!base) {
    throw new Error(`Name Check PDF: cannot load asset "${path}" on the server. Set SITE_URL (or NAME_CHECK_ASSET_BASE_URL) to the public site URL.`);
  }
  const res = await fetch(`${base}${path}`);
  if (!res.ok) {
    throw new Error(`Name Check PDF: failed to fetch design asset "${base}${path}" (${res.status}).`);
  }
  return new Uint8Array(await res.arrayBuffer());
}
async function fetchAssetBytes(path) {
  if (typeof window === "undefined") return fetchAssetBytesOnServer(path);
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Name Check PDF: failed to fetch design asset "${path}" (${res.status}). Check it was uploaded to /public${path}.`);
  }
  return new Uint8Array(await res.arrayBuffer());
}
function wrapText(text, font, size, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    const trial = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(trial, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = trial;
    }
  }
  if (current) lines.push(current);
  return lines;
}
function measureWrappedTextHeight(text, font, size, maxWidth, lineHeight) {
  return wrapText(text, font, size, maxWidth).length * lineHeight;
}
function measureBulletListHeight(items, font, size, maxWidth, lineHeight, gap) {
  let total = 0;
  items.forEach((item) => {
    const lineCount = wrapText(item, font, size, maxWidth - 14).length;
    total += lineCount * lineHeight + gap;
  });
  return total;
}
function drawWrappedText(page, text, opts) {
  const lines = wrapText(text, opts.font, opts.size, opts.maxWidth);
  let cursorY = opts.y;
  for (const line of lines) {
    page.drawText(line, { x: opts.x, y: cursorY, size: opts.size, font: opts.font, color: opts.color });
    cursorY -= opts.lineHeight;
  }
  return cursorY;
}
function drawBulletList(page, items, opts) {
  let y = opts.y;
  const dotY = opts.size * TYPE.bulletDotOffsetRatio;
  items.forEach((item) => {
    page.drawCircle({ x: opts.x + 3, y: y + dotY, size: 2.4, color: COLOR.maroon });
    y = drawWrappedText(page, item, {
      x: opts.x + 14,
      y,
      font: opts.font,
      size: opts.size,
      maxWidth: opts.maxWidth - 14,
      lineHeight: opts.lineHeight,
      color: opts.color
    });
    y -= opts.gap;
  });
  return y;
}
function drawRichWrappedTextCentered(page, tokens, opts) {
  const lines = [];
  let currentLine = [];
  let currentWidth = 0;
  const spaceWidth = opts.font.widthOfTextAtSize(" ", opts.size);
  tokens.forEach((tok) => {
    const font = tok.bold ? opts.boldFont : opts.font;
    const wordWidth = font.widthOfTextAtSize(tok.text, opts.size);
    const addWidth = (currentLine.length > 0 ? spaceWidth : 0) + wordWidth;
    if (currentWidth + addWidth > opts.maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = [tok];
      currentWidth = wordWidth;
    } else {
      currentLine.push(tok);
      currentWidth += addWidth;
    }
  });
  if (currentLine.length > 0) lines.push(currentLine);
  let cursorY = opts.y;
  lines.forEach((line) => {
    const lineWidth = line.reduce((sum, tok, i) => {
      const font = tok.bold ? opts.boldFont : opts.font;
      return sum + font.widthOfTextAtSize(tok.text, opts.size) + (i > 0 ? spaceWidth : 0);
    }, 0);
    let x = opts.centerX - lineWidth / 2;
    line.forEach((tok) => {
      const font = tok.bold ? opts.boldFont : opts.font;
      page.drawText(tok.text, { x, y: cursorY, size: opts.size, font, color: opts.color });
      x += font.widthOfTextAtSize(tok.text, opts.size) + spaceWidth;
    });
    cursorY -= opts.lineHeight;
  });
  return cursorY;
}
function drawRichWrappedText(page, tokens, opts) {
  const lines = [];
  let currentLine = [];
  let currentWidth = 0;
  const spaceWidth = opts.font.widthOfTextAtSize(" ", opts.size);
  tokens.forEach((tok) => {
    const font = tok.bold ? opts.boldFont : opts.font;
    const wordWidth = font.widthOfTextAtSize(tok.text, opts.size);
    const addWidth = (currentLine.length > 0 ? spaceWidth : 0) + wordWidth;
    if (currentWidth + addWidth > opts.maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = [tok];
      currentWidth = wordWidth;
    } else {
      currentLine.push(tok);
      currentWidth += addWidth;
    }
  });
  if (currentLine.length > 0) lines.push(currentLine);
  let cursorY = opts.y;
  lines.forEach((line) => {
    let x = opts.x;
    line.forEach((tok) => {
      const font = tok.bold ? opts.boldFont : opts.font;
      page.drawText(tok.text, { x, y: cursorY, size: opts.size, font, color: opts.color });
      x += font.widthOfTextAtSize(tok.text, opts.size) + spaceWidth;
    });
    cursorY -= opts.lineHeight;
  });
  return cursorY;
}
function drawBulletListBoldLead(page, items, opts) {
  let y = opts.y;
  const dotY = opts.size * TYPE.bulletDotOffsetRatio;
  items.forEach((item) => {
    page.drawCircle({ x: opts.x + 3, y: y + dotY, size: 2.4, color: COLOR.maroon });
    const sepIdx = item.indexOf(" \u2014 ");
    const tokens = sepIdx === -1 ? item.split(/\s+/).map((w) => ({ text: w, bold: false })) : buildBoldPhraseTokens(item, item.slice(0, sepIdx));
    y = drawRichWrappedText(page, tokens, {
      x: opts.x + 14,
      y,
      font: opts.font,
      boldFont: opts.boldFont,
      size: opts.size,
      maxWidth: opts.maxWidth - 14,
      lineHeight: opts.lineHeight,
      color: opts.color
    });
    y -= opts.gap;
  });
  return y;
}
function buildBoldPhraseTokens(fullText, boldPhrase) {
  const idx = fullText.indexOf(boldPhrase);
  if (idx === -1) return fullText.split(/\s+/).map((w) => ({ text: w, bold: false }));
  const before = fullText.slice(0, idx);
  const bold = fullText.slice(idx, idx + boldPhrase.length);
  const after = fullText.slice(idx + boldPhrase.length);
  return [
    ...before.split(/\s+/).filter(Boolean).map((w) => ({ text: w, bold: false })),
    ...bold.split(/\s+/).filter(Boolean).map((w) => ({ text: w, bold: true })),
    ...after.split(/\s+/).filter(Boolean).map((w) => ({ text: w, bold: false }))
  ];
}
function drawPageBackground(page, assets) {
  page.drawImage(assets.background, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });
}
function roundedRectSvgPath(width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  return [
    `M ${r} 0`,
    `H ${width - r}`,
    `A ${r} ${r} 0 0 1 ${width} ${r}`,
    `V ${height - r}`,
    `A ${r} ${r} 0 0 1 ${width - r} ${height}`,
    `H ${r}`,
    `A ${r} ${r} 0 0 1 0 ${height - r}`,
    `V ${r}`,
    `A ${r} ${r} 0 0 1 ${r} 0`,
    `Z`
  ].join(" ");
}
function drawRoundedRect(page, opts) {
  page.drawSvgPath(roundedRectSvgPath(opts.width, opts.height, opts.radius), {
    x: opts.x,
    y: opts.y + opts.height,
    scale: 1,
    color: opts.color,
    borderColor: opts.borderColor,
    borderWidth: opts.borderWidth
  });
}
function drawMaroonBanner(page, fonts, text, boxX, boxTopY, boxWidth, height = 34) {
  const label = text.toUpperCase();
  const size = px(45);
  const textWidth = fonts.sansBold.widthOfTextAtSize(label, size);
  const width = Math.min(boxWidth - 16, textWidth + 56);
  const x = boxX + boxWidth / 2 - width / 2;
  const y = boxTopY - height / 2;
  drawRoundedRect(page, { x, y, width, height, radius: height / 2, color: COLOR.maroon });
  page.drawText(label, {
    x: x + width / 2 - textWidth / 2,
    y: y + height / 2 - size * 0.35,
    size,
    font: fonts.sansBold,
    color: COLOR.white
  });
}
function drawContentBox(page, opts) {
  drawRoundedRect(page, {
    x: opts.x,
    y: opts.y - opts.height,
    width: opts.width,
    height: opts.height,
    radius: 18,
    color: COLOR.blushPanel,
    borderColor: COLOR.maroon,
    borderWidth: 1
  });
  return opts.y;
}
function drawWrappedTextCentered(page, text, opts) {
  const lines = wrapText(text, opts.font, opts.size, opts.maxWidth);
  let cursorY = opts.y;
  for (const line of lines) {
    page.drawText(line, {
      x: opts.centerX - opts.font.widthOfTextAtSize(line, opts.size) / 2,
      y: cursorY,
      size: opts.size,
      font: opts.font,
      color: opts.color
    });
    cursorY -= opts.lineHeight;
  }
  return cursorY;
}
function drawStarGlyph(page, cx, cy, r, color) {
  const path = `M ${r} 0 L ${r * 1.32} ${r * 0.68} L ${r * 2} ${r} L ${r * 1.32} ${r * 1.32} L ${r} ${r * 2} L ${r * 0.68} ${r * 1.32} L 0 ${r} L ${r * 0.68} ${r * 0.68} Z`;
  page.drawSvgPath(path, { x: cx - r, y: cy + r, color });
}
function addLinkAnnotation(page, url, rect) {
  const doc = page.doc;
  const linkAnnotRef = doc.context.register(
    doc.context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: [rect.x, rect.y, rect.x + rect.width, rect.y + rect.height],
      Border: [0, 0, 0],
      A: {
        Type: "Action",
        S: "URI",
        URI: PDFString.of(url)
      }
    })
  );
  const existingAnnots = page.node.Annots();
  if (existingAnnots) {
    existingAnnots.push(linkAnnotRef);
  } else {
    page.node.set(PDFName.of("Annots"), doc.context.obj([linkAnnotRef]));
  }
}
function drawPageChrome(page, fonts, assets, opts) {
  drawPageBackground(page, assets);
  const centerX = PAGE_WIDTH / 2;
  const titleLines = opts.title.split("\n");
  let titleY = PAGE_HEIGHT - 96;
  const maxTitleWidth = PAGE_WIDTH - 96;
  const kickerSize = px(50);
  const mainSize = px(80);
  titleLines.forEach((line, i) => {
    const isLast = i === titleLines.length - 1;
    let size = isLast ? mainSize : kickerSize;
    const font = fonts.heading;
    while (font.widthOfTextAtSize(line, size) > maxTitleWidth && size > 11) size -= 1;
    page.drawText(line, {
      x: centerX - font.widthOfTextAtSize(line, size) / 2,
      y: titleY,
      size,
      font,
      color: COLOR.maroon
    });
    titleY -= isLast ? mainSize + 10 : kickerSize + 10;
  });
  const dividerY = titleY + 12;
  page.drawLine({ start: { x: centerX - 165, y: dividerY }, end: { x: centerX - 14, y: dividerY }, thickness: 1, color: COLOR.maroon });
  page.drawLine({ start: { x: centerX + 14, y: dividerY }, end: { x: centerX + 165, y: dividerY }, thickness: 1, color: COLOR.maroon });
  drawStarGlyph(page, centerX, dividerY, 6, COLOR.maroon);
  if (opts.subtitle) {
    const subLabel = opts.subtitle.toUpperCase();
    const subSize = px(45);
    page.drawText(subLabel, {
      x: centerX - fonts.sansBold.widthOfTextAtSize(subLabel, subSize) / 2,
      y: dividerY - subSize - 8,
      size: subSize,
      font: fonts.sansBold,
      color: COLOR.maroonDark
    });
  }
  drawFooterPill(page, fonts, opts.brand);
}
function drawFooterPill(page, fonts, brand) {
  const centerX = PAGE_WIDTH / 2;
  const pill = `WWW.${brand.website.replace(/^www\./i, "").toUpperCase()}`;
  const size = px(45);
  const pillWidth = fonts.sansBold.widthOfTextAtSize(pill, size) + 44;
  const height = size + 18;
  drawRoundedRect(page, { x: centerX - pillWidth / 2, y: 40, width: pillWidth, height, radius: height / 2, color: COLOR.maroon });
  page.drawText(pill, {
    x: centerX - fonts.sansBold.widthOfTextAtSize(pill, size) / 2,
    y: 40 + height / 2 - size * 0.35,
    size,
    font: fonts.sansBold,
    color: COLOR.white
  });
}
function drawDataTable(page, fonts, rows, opts) {
  const size = px(45);
  const rowHeight = opts.rowHeight ?? Math.max(36, size + 26);
  const totalHeight = rowHeight * rows.length;
  const borderTint = rgb(0.82, 0.68, 0.66);
  const labelColCenter = opts.x + opts.width / 4;
  const valueColCenter = opts.x + opts.width * 3 / 4;
  page.drawRectangle({
    x: opts.x,
    y: opts.y - totalHeight,
    width: opts.width,
    height: totalHeight,
    color: COLOR.blushPanel,
    borderColor: COLOR.maroon,
    borderWidth: 1
  });
  let y = opts.y;
  rows.forEach(([label, value], i) => {
    if (i > 0) {
      page.drawLine({ start: { x: opts.x, y }, end: { x: opts.x + opts.width, y }, thickness: 0.5, color: borderTint });
    }
    page.drawText(label, {
      x: labelColCenter - fonts.sansBold.widthOfTextAtSize(label, size) / 2,
      y: y - rowHeight / 2 - size * 0.35,
      size,
      font: fonts.sansBold,
      color: COLOR.maroonDark
    });
    const displayText = value || "\u2014";
    const isPillRow = label === "Date of Birth" || label === "Gender";
    const rowCenterY = y - rowHeight / 2;
    if (isPillRow) {
      const pillW = fonts.sansBold.widthOfTextAtSize(displayText, size) + 26;
      const pillH = size + 12;
      const pillX = valueColCenter - pillW / 2;
      drawRoundedRect(page, {
        x: pillX,
        y: rowCenterY - pillH / 2,
        width: pillW,
        height: pillH,
        radius: pillH / 2,
        color: rgb(0.94, 0.87, 0.85)
      });
    }
    page.drawText(displayText, {
      x: valueColCenter - fonts.sansBold.widthOfTextAtSize(displayText, size) / 2,
      y: y - rowHeight / 2 - size * 0.35,
      size,
      font: fonts.sansBold,
      color: COLOR.ink
    });
    page.drawLine({
      start: { x: opts.x + opts.width / 2, y },
      end: { x: opts.x + opts.width / 2, y: y - rowHeight },
      thickness: 0.5,
      color: borderTint
    });
    y -= rowHeight;
  });
  return opts.y - totalHeight;
}
function formatDate(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
}
function drawCoverFooterPill(page, fonts, brand) {
  const centerX = PAGE_WIDTH / 2;
  const text = `WWW.${brand.website.replace(/^www\./i, "").toUpperCase()}`;
  const size = px(45);
  const tracking = 4;
  const chars = text.split("");
  const textWidth = chars.reduce((sum, ch) => sum + fonts.sans.widthOfTextAtSize(ch, size), 0) + tracking * (chars.length - 1);
  const pillWidth = textWidth + 50;
  const height = size + 18;
  const pillY = 32;
  drawRoundedRect(page, { x: centerX - pillWidth / 2, y: pillY, width: pillWidth, height, radius: height / 2, color: COLOR.maroon });
  let x = centerX - textWidth / 2;
  const baseY = pillY + height / 2 - size * 0.35;
  for (const ch of chars) {
    page.drawText(ch, { x, y: baseY, size, font: fonts.sans, color: COLOR.white });
    x += fonts.sans.widthOfTextAtSize(ch, size) + tracking;
  }
}
function drawCoverPage(page, fonts, data, assets) {
  drawPageBackground(page, assets);
  const centerX = PAGE_WIDTH / 2;
  const LOGO_TARGET_WIDTH = 345;
  const logoScale = LOGO_TARGET_WIDTH / assets.logo.width;
  const logoDims = assets.logo.scale(logoScale);
  let y = PAGE_HEIGHT - 10;
  page.drawImage(assets.logo, { x: centerX - logoDims.width / 2, y: y - logoDims.height, width: logoDims.width, height: logoDims.height });
  y -= logoDims.height + 24;
  const GRID_TARGET_WIDTH = 400;
  const gridScale = GRID_TARGET_WIDTH / assets.loshuGrid.width;
  const gridDims = assets.loshuGrid.scale(gridScale);
  page.drawImage(assets.loshuGrid, { x: centerX - gridDims.width / 2, y: y - gridDims.height, width: gridDims.width, height: gridDims.height });
  y -= gridDims.height + 13;
  const titleSize = px(120);
  page.drawText("NAME CHECK", {
    x: centerX - fonts.heading.widthOfTextAtSize("NAME CHECK", titleSize) / 2,
    y,
    size: titleSize,
    font: fonts.heading,
    color: COLOR.maroon
  });
  y -= titleSize + 18;
  page.drawText("REPORT", {
    x: centerX - fonts.heading.widthOfTextAtSize("REPORT", titleSize) / 2,
    y,
    size: titleSize,
    font: fonts.heading,
    color: COLOR.maroon
  });
  y -= titleSize + 42;
  const bylineSize = px(100);
  const byline = data.brand.numerologistName.replace(/\s+Ji$/i, "").toUpperCase();
  page.drawText(byline, {
    x: centerX - fonts.heading.widthOfTextAtSize(byline, bylineSize) / 2,
    y,
    size: bylineSize,
    font: fonts.heading,
    color: COLOR.maroonDark
  });
  y -= 24;
  page.drawLine({ start: { x: centerX - 112, y }, end: { x: centerX - 11, y }, thickness: 1, color: COLOR.maroon });
  page.drawLine({ start: { x: centerX + 11, y }, end: { x: centerX + 112, y }, thickness: 1, color: COLOR.maroon });
  drawStarGlyph(page, centerX, y, 6, COLOR.maroon);
  drawCoverFooterPill(page, fonts, data.brand);
}
function drawIndexPage(page, fonts, assets, data, pageNumber, totalPages) {
  drawPageBackground(page, assets);
  const centerX = PAGE_WIDTH / 2;
  const titleSize = px(100);
  page.drawText("INDEX", {
    x: centerX - fonts.heading.widthOfTextAtSize("INDEX", titleSize) / 2,
    y: PAGE_HEIGHT - 96,
    size: titleSize,
    font: fonts.heading,
    color: COLOR.maroon
  });
  const dividerY = PAGE_HEIGHT - 96 - titleSize + 10;
  page.drawLine({ start: { x: centerX - 165, y: dividerY }, end: { x: centerX - 14, y: dividerY }, thickness: 1, color: COLOR.maroon });
  page.drawLine({ start: { x: centerX + 14, y: dividerY }, end: { x: centerX + 165, y: dividerY }, thickness: 1, color: COLOR.maroon });
  drawStarGlyph(page, centerX, dividerY, 6, COLOR.maroon);
  drawFooterPill(page, fonts, data.brand);
  const rows = [
    { no: "01", title: "Personal Information & Introduction", items: ["Your Personal Profile", "Welcome Message"] },
    {
      no: "02",
      title: "Understanding Name Numerology",
      items: ["The Science of Name Numbers", "The Chaldean Number Chart", "What We'll Analyze"]
    },
    {
      no: "03",
      title: "Current Name Breakdown",
      items: ["Part 1: First Name Number", "Part 2: Full Name Number", "Part 3: Full Name Compound Number"]
    }
  ];
  const numSize = px(160);
  const bodySize = px(45);
  let y = dividerY - 60;
  const tableX = 44;
  const tableWidth = PAGE_WIDTH - 88;
  const numColW = 84;
  const titleColW = 170;
  const titleInnerWidth = titleColW - 20;
  const itemsTextX = tableX + numColW + titleColW + 10;
  const itemsInnerWidth = tableX + tableWidth - 10 - itemsTextX;
  rows.forEach((row) => {
    const titleLines = wrapText(row.title.toUpperCase(), fonts.sansBold, bodySize, titleInnerWidth);
    const itemLineTotal = row.items.reduce((sum, item) => sum + wrapText(`\u2022 ${item}`, fonts.sans, bodySize, itemsInnerWidth).length, 0);
    const tallerLineCount = Math.max(titleLines.length, itemLineTotal);
    const rowHeight = Math.max(numSize + 20, 26 + tallerLineCount * (bodySize + 6) + 16);
    page.drawRectangle({
      x: tableX,
      y: y - rowHeight,
      width: tableWidth,
      height: rowHeight,
      borderColor: COLOR.maroon,
      borderWidth: 0.75
    });
    page.drawLine({ start: { x: tableX + numColW, y }, end: { x: tableX + numColW, y: y - rowHeight }, thickness: 0.5, color: COLOR.maroon });
    page.drawLine({ start: { x: tableX + numColW + titleColW, y }, end: { x: tableX + numColW + titleColW, y: y - rowHeight }, thickness: 0.5, color: COLOR.maroon });
    const titleBlockHeight = titleLines.length * (bodySize + 6);
    const titleBlockCenterY = y - 10 - titleBlockHeight / 2;
    page.drawText(row.no, {
      x: tableX + numColW / 2 - fonts.heading.widthOfTextAtSize(row.no, numSize) / 2,
      y: titleBlockCenterY - numSize * 0.32,
      size: numSize,
      font: fonts.heading,
      color: COLOR.maroon
    });
    let titleY = y - bodySize - 10;
    titleLines.forEach((line) => {
      page.drawText(line, { x: tableX + numColW + 10, y: titleY, size: bodySize, font: fonts.sansBold, color: COLOR.maroonDark });
      titleY -= bodySize + 6;
    });
    let itemY = y - bodySize - 10;
    row.items.forEach((item) => {
      itemY = drawWrappedText(page, `\u2022 ${item}`, { x: itemsTextX, y: itemY, font: fonts.sans, size: bodySize, maxWidth: itemsInnerWidth, lineHeight: bodySize + 6, color: COLOR.ink });
    });
    y -= rowHeight;
  });
}
function drawWelcomePage(page, fonts, assets, data, pageNumber, totalPages) {
  drawPageBackground(page, assets);
  const centerX = PAGE_WIDTH / 2;
  const LOGO_TARGET_WIDTH = 150;
  const logoScale = LOGO_TARGET_WIDTH / assets.logo.width;
  const logoDims = assets.logo.scale(logoScale);
  let y = PAGE_HEIGHT - 40;
  page.drawImage(assets.logo, { x: centerX - logoDims.width / 2, y: y - logoDims.height, width: logoDims.width, height: logoDims.height });
  y -= logoDims.height + 34;
  const titleSize = px(80);
  const nameStr = data.firstName || data.customerName;
  const line1 = `\u201CNAMASKAR`;
  const line2 = `${nameStr.toUpperCase()} JI\u201D`;
  [line1, line2].forEach((line) => {
    let size = titleSize;
    while (fonts.heading.widthOfTextAtSize(line, size) > PAGE_WIDTH - 96 && size > 14) size -= 1;
    page.drawText(line, { x: centerX - fonts.heading.widthOfTextAtSize(line, size) / 2, y, size, font: fonts.heading, color: COLOR.maroon });
    y -= size + 10;
  });
  const dividerY = y + 6;
  page.drawLine({ start: { x: centerX - 165, y: dividerY }, end: { x: centerX - 14, y: dividerY }, thickness: 1, color: COLOR.maroon });
  page.drawLine({ start: { x: centerX + 14, y: dividerY }, end: { x: centerX + 165, y: dividerY }, thickness: 1, color: COLOR.maroon });
  drawStarGlyph(page, centerX, dividerY, 6, COLOR.maroon);
  drawFooterPill(page, fonts, data.brand);
  let cy = dividerY - 40;
  const bodySize = px(45);
  const boldPhrase = `Astro-Numerologist ${data.brand.numerologistName}.`;
  const message = `"This personalised Name Check Report has been prepared after careful analysis of your birth date and current name by celebrity ${boldPhrase} The name analysis is rooted in the approach of Chaldean Numerology and the Loshu Grid. The purpose of this report is to identify how the cosmic energies influencing your life align with your current name. Please approach these insights with faith, consistency and pure intention. May this guide illuminate your path towards prosperity, peace and spiritual growth."`;
  const tokens = buildBoldPhraseTokens(message, boldPhrase);
  cy = drawRichWrappedTextCentered(page, tokens, {
    centerX,
    y: cy,
    font: fonts.quote,
    boldFont: fonts.sansBold,
    size: bodySize,
    maxWidth: PAGE_WIDTH - 140,
    lineHeight: bodySize + 8,
    color: COLOR.maroonDark
  });
  const HANDS_TARGET_WIDTH = 130;
  const handsScale = HANDS_TARGET_WIDTH / assets.handsPraying.width;
  const handsDims = assets.handsPraying.scale(handsScale);
  const HANDS_BOTTOM_Y = 190;
  const handsTop = Math.min(cy - 30, HANDS_BOTTOM_Y + handsDims.height);
  page.drawImage(assets.handsPraying, {
    x: centerX - handsDims.width / 2,
    y: Math.min(handsTop - handsDims.height, HANDS_BOTTOM_Y),
    width: handsDims.width,
    height: handsDims.height
  });
}
function drawBlueprintPage(page, fonts, assets, data, numbers, pageNumber, totalPages) {
  drawPageBackground(page, assets);
  const centerX = PAGE_WIDTH / 2;
  const titleSize = px(80);
  const title = "Numerological Blueprint";
  page.drawText(title, {
    x: centerX - fonts.heading.widthOfTextAtSize(title, titleSize) / 2,
    y: PAGE_HEIGHT - 96,
    size: titleSize,
    font: fonts.heading,
    color: COLOR.maroon
  });
  const dividerY = PAGE_HEIGHT - 96 - titleSize + 10;
  page.drawLine({ start: { x: centerX - 165, y: dividerY }, end: { x: centerX - 14, y: dividerY }, thickness: 1, color: COLOR.maroon });
  page.drawLine({ start: { x: centerX + 14, y: dividerY }, end: { x: centerX + 165, y: dividerY }, thickness: 1, color: COLOR.maroon });
  drawStarGlyph(page, centerX, dividerY, 6, COLOR.maroon);
  drawFooterPill(page, fonts, data.brand);
  const boxX = 50;
  const boxWidth = PAGE_WIDTH - 100;
  const bannerSize = px(45);
  const bannerY = dividerY - 90;
  const bannerHeight = bannerSize + 26;
  drawRoundedRect(page, { x: boxX, y: bannerY - bannerHeight, width: boxWidth, height: bannerHeight, radius: bannerHeight / 2, color: COLOR.maroon });
  const piLabel = "PERSONAL INFORMATION";
  const piWidth = fonts.sansBold.widthOfTextAtSize(piLabel, bannerSize);
  page.drawText(piLabel, {
    x: boxX + boxWidth / 2 - piWidth / 2,
    y: bannerY - bannerHeight / 2 - bannerSize * 0.35,
    size: bannerSize,
    font: fonts.sansBold,
    color: COLOR.white
  });
  const rows = [
    ["First Name", data.firstName || "\u2014"],
    ["Middle Name", data.middleName || "\u2014"],
    ["Last Name", data.lastName || "\u2014"],
    ["Date of Birth", formatDate(data.dob)],
    ["Gender", data.gender || "\u2014"],
    ["Mulank", String(numbers.mulank)],
    ["Bhagyank", String(numbers.bhagyank)],
    ["First Name Number", String(numbers.firstNameNumber)],
    ["Full Name Number", String(numbers.fullNameNumber)],
    ["Full Name Compound Number", String(numbers.fullNameCompound)]
  ];
  drawDataTable(page, fonts, rows, { x: boxX, y: bannerY - bannerHeight - 12, width: boxWidth });
}
function drawScienceOfNamesPage(page, fonts, assets, data, pageNumber, totalPages) {
  drawPageChrome(page, fonts, assets, { title: "The Science of\nName Numbers", pageNumber, totalPages, brand: data.brand });
  const boxX = 32;
  const boxWidth = PAGE_WIDTH - 64;
  const bodySize = TYPE.bodySize;
  const lineHeight = bodySize + TYPE.lineGap;
  const innerWidth = boxWidth - 36;
  const introText = "Every letter in the alphabet carries a specific numeric vibration. When combined, the letters of a name create unique energy patterns that influence:";
  const bulletItems = [
    "How others perceive you",
    "Your natural talents and abilities",
    "Career and financial opportunities",
    "Relationship dynamics",
    "Mental and emotional patterns",
    "Life challenges and lessons"
  ];
  const introHeight = measureWrappedTextHeight(introText, fonts.sans, bodySize, innerWidth, lineHeight);
  const bulletsHeight = measureBulletListHeight(bulletItems, fonts.sans, bodySize, innerWidth, lineHeight, TYPE.bulletGap);
  const box1Height = TYPE.cardPadding + introHeight + 10 + bulletsHeight + 24;
  let y = PAGE_HEIGHT - 185;
  let boxTop = y;
  drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: box1Height });
  drawMaroonBanner(page, fonts, "What Is Name Numerology", boxX, boxTop, boxWidth);
  let cy = boxTop - TYPE.cardPadding;
  cy = drawWrappedText(page, introText, { x: 62, y: cy, font: fonts.sans, size: bodySize, maxWidth: innerWidth, lineHeight, color: COLOR.ink });
  cy -= 10;
  drawBulletList(page, bulletItems, { x: 62, y: cy, font: fonts.sans, size: bodySize, maxWidth: innerWidth, lineHeight, gap: TYPE.bulletGap, color: COLOR.ink });
  const box2Text = "You hear and respond to your name thousands of times throughout life. Each utterance reinforces the vibrational pattern, making your name a constant affirmation \u2014 positive or negative \u2014 depending on its alignment with your destiny.";
  const box2InnerWidth = boxWidth - 64;
  const box2LineHeight = bodySize + TYPE.lineGap + 2;
  const box2TextHeight = measureWrappedTextHeight(box2Text, fonts.sans, bodySize, box2InnerWidth, box2LineHeight);
  const box2Height = TYPE.cardPadding + 6 + box2TextHeight + 22;
  y = boxTop - box1Height - 32;
  boxTop = y;
  drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: box2Height });
  drawMaroonBanner(page, fonts, "Why Your Name Matters", boxX, boxTop, boxWidth);
  drawWrappedTextCentered(page, box2Text, { centerX: boxX + boxWidth / 2, y: boxTop - TYPE.cardPadding - 6, font: fonts.sans, size: bodySize, maxWidth: box2InnerWidth, lineHeight: box2LineHeight, color: COLOR.ink });
}
function drawChaldeanSystemPage(page, fonts, assets, data, pageNumber, totalPages) {
  drawPageChrome(page, fonts, assets, { title: "Numerological\nSystems Used", subtitle: "This Report Analyzes Your Name Using", pageNumber, totalPages, brand: data.brand });
  const boxX = 32;
  const boxWidth = PAGE_WIDTH - 64;
  const bodySize = TYPE.bodySize;
  const lineHeight = bodySize + TYPE.lineGap;
  let boxTop = PAGE_HEIGHT - 210;
  const chaldeanBullets = [
    "Ancient Babylonian system \u2014 considered the most accurate approach for name analysis.",
    "Values run 1 to 8 (9 is considered sacred and is never assigned to a letter).",
    "Focuses on the sound vibration and energy of each letter, rather than its position in the alphabet."
  ];
  const chaldeanInnerWidth = boxWidth - 36;
  const chaldeanBulletsHeight = measureBulletListHeight(chaldeanBullets, fonts.sans, bodySize, chaldeanInnerWidth, lineHeight, TYPE.bulletGap);
  const boxHeight = TYPE.cardPadding + chaldeanBulletsHeight + 18;
  drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: boxHeight });
  drawMaroonBanner(page, fonts, "Chaldean Numerology", boxX, boxTop, boxWidth);
  drawBulletList(page, chaldeanBullets, { x: 62, y: boxTop - TYPE.cardPadding, font: fonts.sans, size: bodySize, maxWidth: chaldeanInnerWidth, lineHeight, gap: TYPE.bulletGap, color: COLOR.ink });
  const chartTop = boxTop - boxHeight - 32;
  drawMaroonBanner(page, fonts, "The Chaldean Number Chart", boxX, chartTop, boxWidth);
  const columns = [
    ["A", "I", "J", "Q", "Y"],
    ["B", "K", "R"],
    ["C", "G", "L", "S"],
    ["D", "M", "T"],
    ["E", "H", "N", "X"],
    ["U", "V", "W"],
    ["O", "Z"],
    ["F", "P"]
  ];
  const cellSize = px(36.7);
  const gridRows = 1 + Math.max(...columns.map((c) => c.length));
  const gridX = boxX;
  const gridWidth = boxWidth;
  const gridTop = chartTop - 30;
  const rowHeight = 30;
  const colWidth = gridWidth / 8;
  drawRoundedRect(page, { x: gridX, y: gridTop - rowHeight * gridRows, width: gridWidth, height: rowHeight * gridRows, radius: 14, color: COLOR.blushPanel, borderColor: COLOR.maroon, borderWidth: 1 });
  for (let r = 1; r < gridRows; r++) {
    const ly = gridTop - r * rowHeight;
    page.drawLine({ start: { x: gridX, y: ly }, end: { x: gridX + gridWidth, y: ly }, thickness: 0.5, color: rgb(0.82, 0.68, 0.66) });
  }
  for (let c = 1; c < 8; c++) {
    const lx = gridX + c * colWidth;
    page.drawLine({ start: { x: lx, y: gridTop }, end: { x: lx, y: gridTop - rowHeight * gridRows }, thickness: 0.5, color: rgb(0.82, 0.68, 0.66) });
  }
  for (let c = 0; c < 8; c++) {
    const numStr = String(c + 1);
    page.drawText(numStr, {
      x: gridX + c * colWidth + colWidth / 2 - fonts.sansBold.widthOfTextAtSize(numStr, cellSize) / 2,
      y: gridTop - rowHeight / 2 - cellSize * 0.35,
      size: cellSize,
      font: fonts.sansBold,
      color: COLOR.maroon
    });
    columns[c].forEach((letter, r) => {
      page.drawText(letter, {
        x: gridX + c * colWidth + colWidth / 2 - fonts.sans.widthOfTextAtSize(letter, cellSize) / 2,
        y: gridTop - (r + 2) * rowHeight + rowHeight / 2 - cellSize * 0.35,
        size: cellSize,
        font: fonts.sans,
        color: COLOR.maroonDark
      });
    });
    for (let r = columns[c].length; r < gridRows - 1; r++) {
      const placeholder = "-";
      page.drawText(placeholder, {
        x: gridX + c * colWidth + colWidth / 2 - fonts.sans.widthOfTextAtSize(placeholder, cellSize) / 2,
        y: gridTop - (r + 2) * rowHeight + rowHeight / 2 - cellSize * 0.35,
        size: cellSize,
        font: fonts.sans,
        color: COLOR.maroonDark
      });
    }
  }
}
function drawWhatWellAnalyzePage(page, fonts, assets, data, pageNumber, totalPages) {
  drawPageChrome(page, fonts, assets, { title: "Numerological\nSystems Used", pageNumber, totalPages, brand: data.brand });
  const boxX = 32;
  const boxWidth = PAGE_WIDTH - 64;
  const bodySize = TYPE.bodySize;
  const lineHeight = bodySize + TYPE.lineGap + 0.5;
  const innerWidth = boxWidth - 36;
  const items = [
    "First Name Number \u2014 your personal identity and self-expression.",
    "Full Name Number \u2014 your complete destiny and life purpose.",
    "Full Name Compound Number \u2014 hidden influences and karmic patterns.",
    "Complete Date of Birth \u2014 its influence on your name number, via Mulank and Bhagyank."
  ];
  const itemsHeight = measureBulletListHeight(items, fonts.sans, bodySize, innerWidth, lineHeight, TYPE.bulletGap + 2);
  const boxTop = PAGE_HEIGHT - 195;
  const boxHeight = TYPE.cardPadding + itemsHeight + 18;
  drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: boxHeight });
  drawMaroonBanner(page, fonts, "What We'll Analyze", boxX, boxTop, boxWidth);
  drawBulletListBoldLead(page, items, { x: 62, y: boxTop - TYPE.cardPadding, font: fonts.sans, boldFont: fonts.sansBold, size: bodySize, maxWidth: innerWidth, lineHeight, gap: TYPE.bulletGap + 2, color: COLOR.ink });
}
function drawCurrentNameBreakdownPage(page, fonts, assets, data, opts, pageNumber, totalPages) {
  drawPageChrome(page, fonts, assets, {
    title: "Current Name\nBreakdown",
    subtitle: opts.heading,
    pageNumber,
    totalPages,
    brand: data.brand
  });
  const boxX = 32;
  const boxWidth = PAGE_WIDTH - 64;
  const bodySize = 12.5;
  const lineHeight = bodySize + 6;
  const nameRowH = 56;
  const totalsRowH = 56;
  const outerRadius = 16;
  const innerGap = 7;
  const rowGap = 12;
  const headerHeight = nameRowH - innerGap;
  const totalsHeight = totalsRowH - 5;
  let y = PAGE_HEIGHT - 215;
  const headerX = boxX + innerGap;
  const headerY = y - innerGap;
  const headerWidth = boxWidth - innerGap * 2;
  const totalsX = boxX + innerGap;
  const totalsY = y - nameRowH - rowGap;
  const totalsWidth = boxWidth - innerGap * 2;
  const outerHeight = innerGap + headerHeight + rowGap + totalsHeight + innerGap;
  const outerBottom = y - outerHeight;
  drawRoundedRect(page, {
    x: boxX,
    y: outerBottom,
    width: boxWidth,
    height: outerHeight,
    radius: outerRadius,
    color: COLOR.blushPanel,
    borderColor: COLOR.maroon,
    borderWidth: 1
  });
  drawRoundedRect(page, {
    x: headerX,
    y: headerY - headerHeight,
    width: headerWidth,
    height: headerHeight,
    radius: outerRadius - 2,
    color: COLOR.maroon
  });
  const nameLabelSize = 13;
  const nameValueSize = 14;
  const leftCenterX = headerX + headerWidth * 0.25;
  const rightCenterX = headerX + headerWidth * 0.75;
  page.drawText(opts.nameLabel, {
    x: leftCenterX - fonts.sansBold.widthOfTextAtSize(
      opts.nameLabel,
      nameLabelSize
    ) / 2,
    y: headerY - headerHeight / 2 - nameLabelSize * 0.35,
    size: nameLabelSize,
    font: fonts.sansBold,
    color: COLOR.white
  });
  page.drawText(opts.nameValue, {
    x: rightCenterX - fonts.sans.widthOfTextAtSize(
      opts.nameValue,
      nameValueSize
    ) / 2,
    y: headerY - headerHeight / 2 - nameValueSize * 0.35,
    size: nameValueSize,
    font: fonts.sans,
    color: COLOR.white
  });
  const dividerX = headerX + headerWidth / 2;
  page.drawLine({
    start: {
      x: dividerX,
      y: headerY - 8
    },
    end: {
      x: dividerX,
      y: headerY - headerHeight + 8
    },
    thickness: 0.75,
    color: COLOR.white
  });
  if (opts.reducedTo !== void 0) {
    drawRoundedRect(page, {
      x: totalsX,
      y: totalsY - totalsHeight,
      width: totalsWidth,
      height: totalsHeight,
      radius: outerRadius - 2,
      color: COLOR.blushPanel,
      borderColor: COLOR.maroon,
      borderWidth: 1
    });
    const colW = totalsWidth / 4;
    const cells = [
      {
        text: "Total",
        size: 12,
        bold: true
      },
      {
        text: String(opts.total),
        size: 16,
        bold: true
      },
      {
        text: "Reduced To",
        size: 12,
        bold: true
      },
      {
        text: String(opts.reducedTo),
        size: 16,
        bold: false
      }
    ];
    cells.forEach((cell, i) => {
      const centerX = totalsX + colW * i + colW / 2;
      const font = cell.bold ? fonts.sansBold : fonts.sans;
      page.drawText(cell.text, {
        x: centerX - font.widthOfTextAtSize(cell.text, cell.size) / 2,
        y: totalsY - totalsHeight / 2 - cell.size * 0.35,
        size: cell.size,
        font,
        color: COLOR.maroonDark
      });
    });
    for (let i = 1; i < 4; i++) {
      page.drawLine({
        start: {
          x: totalsX + colW * i,
          y: totalsY - 3
        },
        end: {
          x: totalsX + colW * i,
          y: totalsY - totalsHeight + 3
        },
        thickness: 0.5,
        color: COLOR.maroon
      });
    }
  } else {
    drawRoundedRect(page, {
      x: totalsX,
      y: totalsY - totalsHeight,
      width: totalsWidth,
      height: totalsHeight,
      radius: outerRadius - 2,
      color: COLOR.blushPanel,
      borderColor: COLOR.maroon,
      borderWidth: 1
    });
    const colW = totalsWidth / 2;
    const label = "Total";
    const labelSize = 16;
    page.drawText(label, {
      x: totalsX + colW / 2 - fonts.sansBold.widthOfTextAtSize(
        label,
        labelSize
      ) / 2,
      y: totalsY - totalsHeight / 2 - labelSize * 0.35,
      size: labelSize,
      font: fonts.sansBold,
      color: COLOR.maroonDark
    });
    const value = String(opts.total);
    const valueSize = 16;
    page.drawText(value, {
      x: totalsX + colW + colW / 2 - fonts.sans.widthOfTextAtSize(
        value,
        valueSize
      ) / 2,
      y: totalsY - totalsHeight / 2 - valueSize * 0.35,
      size: valueSize,
      font: fonts.sans,
      color: COLOR.maroonDark
    });
    page.drawLine({
      start: {
        x: totalsX + colW,
        y: totalsY - totalsHeight + 3
      },
      end: {
        x: totalsX + colW,
        y: totalsY - 3
      },
      thickness: 0.5,
      color: COLOR.maroon
    });
  }
  y = outerBottom - 34;
  const contentBoxTop = y;
  const innerWidth = boxWidth - 36;
  const bulletsHeight = measureBulletListHeight(
    opts.bullets,
    fonts.sans,
    bodySize,
    innerWidth,
    lineHeight,
    TYPE.bulletGap
  );
  const contentBoxHeight = TYPE.cardPadding + bulletsHeight + 22;
  drawContentBox(page, {
    x: boxX,
    y: contentBoxTop,
    width: boxWidth,
    height: contentBoxHeight
  });
  drawMaroonBanner(
    page,
    fonts,
    "What This Represents",
    boxX,
    contentBoxTop,
    boxWidth
  );
  drawBulletList(page, opts.bullets, {
    x: 62,
    y: contentBoxTop - TYPE.cardPadding,
    font: fonts.sans,
    size: bodySize,
    maxWidth: innerWidth,
    lineHeight,
    gap: TYPE.bulletGap,
    color: COLOR.ink
  });
}
var VERDICT_LABEL = {
  HR: "Highly Recommended",
  OA: "Optional / Advisable",
  NR: "Not Required"
};
function drawWhyCriticalPage(page, fonts, assets, data, matched, pageNumber, totalPages) {
  drawPageChrome(page, fonts, assets, { title: "Current Name\nBreakdown", subtitle: "Why This Is Critical", pageNumber, totalPages, brand: data.brand });
  const boxX = 32;
  const boxWidth = PAGE_WIDTH - 64;
  const bodySize = TYPE.bodySize;
  const lineHeight = bodySize + TYPE.lineGap + 0.5;
  const boxTop = PAGE_HEIGHT - 215;
  const innerWidth = boxWidth - 36;
  const bullets = matched.bullets;
  const verdictNote = matched.verdictNote;
  const bulletsHeight = measureBulletListHeight(bullets, fonts.sans, bodySize, innerWidth, lineHeight, TYPE.bulletGap);
  const boxHeight = TYPE.cardPadding + bulletsHeight + 22;
  drawContentBox(page, { x: boxX, y: boxTop, width: boxWidth, height: boxHeight });
  drawMaroonBanner(page, fonts, "Why This Is Critical", boxX, boxTop, boxWidth);
  drawBulletList(page, bullets, { x: 62, y: boxTop - TYPE.cardPadding, font: fonts.sans, size: bodySize, maxWidth: innerWidth, lineHeight, gap: TYPE.bulletGap, color: COLOR.ink });
  const verdictLabel = `${VERDICT_LABEL[matched.verdict]}${matched.isFallback ? " (fallback \u2014 review recommended)" : ""}`;
  const verdictText = verdictNote ?? verdictLabel;
  const verdictTop = boxTop - boxHeight - 46;
  const verdictTextSize = 13;
  const verdictTextLineHeight = verdictTextSize + 7;
  const verdictTextInnerWidth = boxWidth - 60;
  const verdictTextLines = wrapText(verdictText, fonts.sans, verdictTextSize, verdictTextInnerWidth);
  const verdictTopPadding = 26;
  const verdictBottomPadding = 22;
  const verdictHeight = Math.max(84, verdictTopPadding + verdictTextLines.length * verdictTextLineHeight + verdictBottomPadding);
  drawRoundedRect(page, { x: boxX, y: verdictTop - verdictHeight, width: boxWidth, height: verdictHeight, radius: 18, color: COLOR.maroon, borderColor: COLOR.maroon, borderWidth: 1 });
  const verdictCursorY = verdictTop - verdictTopPadding - (verdictTextLineHeight - 6);
  drawWrappedTextCentered(page, verdictText, {
    centerX: boxX + boxWidth / 2,
    y: verdictCursorY,
    font: fonts.sans,
    size: verdictTextSize,
    maxWidth: verdictTextInnerWidth,
    lineHeight: verdictTextLineHeight,
    color: COLOR.white
  });
  const badgeR = 15;
  page.drawCircle({ x: boxX + boxWidth / 2, y: verdictTop, size: badgeR, color: COLOR.blush, borderColor: COLOR.maroon, borderWidth: 1.5 });
  drawStarGlyph(page, boxX + boxWidth / 2, verdictTop, 7, COLOR.maroon);
}
function drawServicesPage(page, fonts, assets, data, pageNumber, totalPages) {
  drawPageBackground(page, assets);
  const centerX = PAGE_WIDTH / 2;
  const logoDims = assets.logo.scale(0.22);
  page.drawImage(assets.logo, { x: centerX - logoDims.width / 2, y: PAGE_HEIGHT - 56 - logoDims.height, width: logoDims.width, height: logoDims.height });
  const titleSize = px(80);
  const kickerSize = px(50);
  let titleY = PAGE_HEIGHT - 92 - logoDims.height;
  const line1 = "Illuminating Lives";
  const line2 = "Through Ancient Wisdom";
  page.drawText(line1, { x: centerX - fonts.heading.widthOfTextAtSize(line1, kickerSize) / 2, y: titleY, size: kickerSize, font: fonts.heading, color: COLOR.maroon });
  titleY -= kickerSize + 10;
  page.drawText(line2, { x: centerX - fonts.heading.widthOfTextAtSize(line2, titleSize) / 2, y: titleY, size: titleSize, font: fonts.heading, color: COLOR.maroon });
  titleY -= titleSize + 10;
  const dividerY = titleY + 12;
  page.drawLine({ start: { x: centerX - 165, y: dividerY }, end: { x: centerX - 14, y: dividerY }, thickness: 1, color: COLOR.maroon });
  page.drawLine({ start: { x: centerX + 14, y: dividerY }, end: { x: centerX + 165, y: dividerY }, thickness: 1, color: COLOR.maroon });
  drawStarGlyph(page, centerX, dividerY, 6, COLOR.maroon);
  drawFooterPill(page, fonts, data.brand);
  const bannerY = dividerY - 55;
  drawMaroonBanner(page, fonts, "Services Offered", 44, bannerY, PAGE_WIDTH - 88, 34);
  const services = [
    "Complete Numerology Analysis",
    "Name Correction Consultations",
    "Lal Kitab Remedies",
    "C-Section Baby Dates",
    "Business Name Analysis",
    "Child Naming Services",
    "Mobile Numerology",
    "Plot No. / Flat No. Analysis",
    "Management Seating Direction",
    "Lucky Jersey Number",
    "Gemstone & Rudraksha Recommendations"
  ];
  let y = bannerY - 40;
  const dotR = 9;
  const bodySize = TYPE.bodySize;
  services.forEach((service) => {
    page.drawCircle({ x: 44 + dotR, y: y - 5, size: dotR, borderColor: COLOR.maroon, borderWidth: 1 });
    drawStarGlyph(page, 44 + dotR, y - 5, 3.6, COLOR.maroon);
    page.drawText(service, { x: 44 + dotR * 2 + 14, y: y - bodySize * 0.35 - 5, size: bodySize, font: fonts.sans, color: COLOR.ink });
    y -= bodySize + 20;
  });
}
var PRICING_IMAGE_SIZE = { width: 1860, height: 2631 };
var PRICING_LEFT_BUTTON = { x: 181, y: 2181, width: 724, height: 109 };
var PRICING_RIGHT_BUTTON = { x: 953, y: 2181, width: 724, height: 109 };
var PRICING_LINKS = {
  // Name Correction  |  Perfect Baby Name Report
  "baby-name": {
    left: "https://www.ankshaastra.com/services/name-correction",
    right: "https://empower.ankshaastra.com/"
  },
  // Name Correction  |  Complete Blueprint
  blueprint: {
    left: "https://www.ankshaastra.com/services/name-correction",
    right: "https://www.ankshaastra.com/services/name-correction"
  }
};
function drawPricingImagePage(page, image, variant) {
  page.drawImage(image, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });
  const sx = PAGE_WIDTH / PRICING_IMAGE_SIZE.width;
  const sy = PAGE_HEIGHT / PRICING_IMAGE_SIZE.height;
  const toPdfRect = (r) => ({
    x: r.x * sx,
    y: PAGE_HEIGHT - (r.y + r.height) * sy,
    width: r.width * sx,
    height: r.height * sy
  });
  const links = PRICING_LINKS[variant];
  if (links.left) addLinkAnnotation(page, links.left, toPdfRect(PRICING_LEFT_BUTTON));
  if (links.right) addLinkAnnotation(page, links.right, toPdfRect(PRICING_RIGHT_BUTTON));
}
function drawConnectPage(page, fonts, assets, data, pageNumber, totalPages) {
  drawPageBackground(page, assets);
  const centerX = PAGE_WIDTH / 2;
  const titleSize = px(80);
  const title = "Connect With Me";
  page.drawText(title, { x: centerX - fonts.heading.widthOfTextAtSize(title, titleSize) / 2, y: PAGE_HEIGHT - 96, size: titleSize, font: fonts.heading, color: COLOR.maroon });
  const dividerY = PAGE_HEIGHT - 96 - titleSize + 10;
  page.drawLine({ start: { x: centerX - 165, y: dividerY }, end: { x: centerX - 14, y: dividerY }, thickness: 1, color: COLOR.maroon });
  page.drawLine({ start: { x: centerX + 14, y: dividerY }, end: { x: centerX + 165, y: dividerY }, thickness: 1, color: COLOR.maroon });
  drawStarGlyph(page, centerX, dividerY, 6, COLOR.maroon);
  drawFooterPill(page, fonts, data.brand);
  const subtitleSize = px(45);
  const subtitle = "FOLLOW FOR DAILY WISDOM, TIPS, AND INSPIRATION";
  page.drawText(subtitle, { x: centerX - fonts.sansBold.widthOfTextAtSize(subtitle, subtitleSize) / 2, y: dividerY - subtitleSize - 20, size: subtitleSize, font: fonts.sansBold, color: COLOR.maroonDark });
  const platforms = [
    { image: assets.socialInstagram, url: "https://www.instagram.com/ankshaastra/" },
    { image: assets.socialLinkedin, url: "https://www.linkedin.com/company/ankshaastra/?viewAsMember=true" },
    { image: assets.socialYoutube, url: "https://www.youtube.com/@Ankshaastra" },
    { image: assets.socialFacebook, url: "https://www.facebook.com/p/Ankshaastra-61561549995939/" }
  ];
  const colXs = [centerX - 135, centerX + 135];
  const rowYs = [
    dividerY - subtitleSize - 125,
    dividerY - subtitleSize - 260
  ];
  let idx = 0;
  rowYs.forEach((ry) => {
    colXs.forEach((cx) => {
      const { image, url } = platforms[idx++];
      page.drawCircle({
        x: cx,
        y: ry,
        size: 40,
        color: COLOR.maroon,
        borderColor: COLOR.maroon,
        borderWidth: 1.5
      });
      page.drawCircle({
        x: cx,
        y: ry,
        size: 35,
        color: COLOR.maroon,
        borderColor: COLOR.white,
        borderWidth: 1.5
      });
      const iconW = 58;
      const iconH = image.height / image.width * iconW;
      page.drawImage(image, {
        x: cx - iconW / 2,
        y: ry - iconH / 2,
        width: iconW,
        height: iconH
      });
      const btnW = 160;
      const btnH = 36;
      drawRoundedRect(page, {
        x: cx - btnW / 2 + 3,
        y: ry - 87,
        width: btnW,
        height: btnH,
        radius: btnH / 2,
        color: COLOR.maroonDark
      });
      drawRoundedRect(page, {
        x: cx - btnW / 2,
        y: ry - 84,
        width: btnW,
        height: btnH,
        radius: btnH / 2,
        color: COLOR.maroon,
        borderColor: COLOR.white,
        borderWidth: 1.25
      });
      const btnLabel = "CLICK ME";
      const btnLabelSize = 13;
      const btnLabelWidth = fonts.sansBold.widthOfTextAtSize(
        btnLabel,
        btnLabelSize
      );
      const btnLabelX = cx - btnLabelWidth / 2;
      const btnLabelY = ry - 82 + btnH / 2 - 3.4;
      page.drawText(btnLabel, {
        x: btnLabelX,
        y: btnLabelY,
        size: btnLabelSize,
        font: fonts.sansBold,
        color: COLOR.white
      });
      page.drawLine({
        start: {
          x: btnLabelX,
          y: btnLabelY - 2
        },
        end: {
          x: btnLabelX + btnLabelWidth,
          y: btnLabelY - 2
        },
        thickness: 0.75,
        color: COLOR.white
      });
      addLinkAnnotation(page, url, {
        x: cx - btnW / 2,
        y: ry - 84,
        width: btnW,
        height: btnH
      });
    });
  });
  const closingSize = px(60);
  const closingY = rowYs[1] - 125;
  ["STAY CONNECTED FOR", "ONGOING GUIDANCE & SUPPORT"].forEach((line, i) => {
    page.drawText(line, { x: centerX - fonts.sansBold.widthOfTextAtSize(line, closingSize) / 2, y: closingY - i * (closingSize + 6), size: closingSize, font: fonts.sansBold, color: COLOR.maroonDark });
  });
}
function drawBackCoverPage(page, fonts, assets, data) {
  page.drawImage(assets.backCoverBackground, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });
  const centerX = PAGE_WIDTH / 2;
  const reportIdText = `Report ID: ${data.reportId}`;
  page.drawText(reportIdText, { x: centerX - fonts.sans.widthOfTextAtSize(reportIdText, 8) / 2, y: 20, size: 8, font: fonts.sans, color: COLOR.muted });
}
async function generateNameCheckReportPdf(input) {
  const split = splitName(input.customerName);
  const data = {
    generatedDate: (/* @__PURE__ */ new Date()).toISOString(),
    firstName: split.first,
    middleName: split.middle,
    lastName: split.last,
    isMiddleNameFatherHusband: false,
    pricingVariant: "baby-name",
    ...input,
    brand: { ...DEFAULT_BRAND, ...input.brand },
    // Required<> forces this to be present — default to "no override" rather
    // than making callers always pass an (often empty) object.
    contentOverride: input.contentOverride ?? {}
  };
  const excludeMiddleNameFromNumerology = data.isMiddleNameFatherHusband === true;
  const middleNameForNumerology = excludeMiddleNameFromNumerology ? "" : data.middleName;
  const fullName = [
    data.firstName,
    middleNameForNumerology,
    data.lastName
  ].filter(Boolean).join(" ").trim();
  const computed = computeNameCheckReportContent(data);
  const content = { ...computed, ...input.contentOverride };
  if (content.isFallback) {
    console.warn(`Name Check PDF: rule engine hit FALLBACK for "${data.customerName}" (report ${data.reportId}) \u2014 matched ${content.matchedRuleId} by default. Recommend manual review before sending to customer.`);
  }
  const mulank = content.mulank;
  const bhagyank = content.bhagyank;
  const firstNameNumber = content.firstNameNumber;
  const firstNameSum = content.firstNameSum;
  const fullNameNumber = content.fullNameNumber;
  const fullNameSum = content.fullNameSum;
  const fullNameCompound = content.fullNameCompound;
  const compoundTier = content.compoundTier;
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`Name Check Report - ${data.customerName}`);
  pdfDoc.setSubject("Chaldean Numerology Name Check Report");
  pdfDoc.setProducer(data.brand.companyName);
  pdfDoc.setCreator(data.brand.companyName);
  pdfDoc.registerFontkit(fontkit);
  const [
    backgroundBytes,
    backCoverBackgroundBytes,
    logoBytes,
    loshuGridBytes,
    starIconBytes,
    handsPrayingBytes,
    socialInstagramBytes,
    socialLinkedinBytes,
    socialYoutubeBytes,
    socialFacebookBytes,
    offerIconPenBytes,
    offerIconDigitsBytes,
    quicksandRegularBytes,
    quicksandBoldBytes,
    cinzelDecorativeBoldBytes,
    cardoRegularBytes
  ] = await Promise.all([
    fetchAssetBytes(ASSET_PATHS.background),
    fetchAssetBytes(ASSET_PATHS.backCoverBackground),
    fetchAssetBytes(ASSET_PATHS.logo),
    fetchAssetBytes(ASSET_PATHS.loshuGrid),
    fetchAssetBytes(ASSET_PATHS.starIcon),
    fetchAssetBytes(ASSET_PATHS.handsPraying),
    fetchAssetBytes(ASSET_PATHS.socialInstagram),
    fetchAssetBytes(ASSET_PATHS.socialLinkedin),
    fetchAssetBytes(ASSET_PATHS.socialYoutube),
    fetchAssetBytes(ASSET_PATHS.socialFacebook),
    fetchAssetBytes(ASSET_PATHS.offerIconPen),
    fetchAssetBytes(ASSET_PATHS.offerIconDigits),
    fetchAssetBytes(ASSET_PATHS.fonts.quicksandRegular),
    fetchAssetBytes(ASSET_PATHS.fonts.quicksandBold),
    fetchAssetBytes(ASSET_PATHS.fonts.cinzelDecorativeBold),
    fetchAssetBytes(ASSET_PATHS.fonts.cardoRegular)
  ]);
  const assets = {
    background: await pdfDoc.embedPng(backgroundBytes),
    backCoverBackground: await pdfDoc.embedJpg(backCoverBackgroundBytes),
    logo: await pdfDoc.embedPng(logoBytes),
    loshuGrid: await pdfDoc.embedPng(loshuGridBytes),
    starIcon: await pdfDoc.embedPng(starIconBytes),
    handsPraying: await pdfDoc.embedPng(handsPrayingBytes),
    socialInstagram: await pdfDoc.embedPng(socialInstagramBytes),
    socialLinkedin: await pdfDoc.embedPng(socialLinkedinBytes),
    socialYoutube: await pdfDoc.embedPng(socialYoutubeBytes),
    socialFacebook: await pdfDoc.embedPng(socialFacebookBytes),
    offerIconPen: await pdfDoc.embedPng(offerIconPenBytes),
    offerIconDigits: await pdfDoc.embedPng(offerIconDigitsBytes)
  };
  const pricingVariant = data.pricingVariant === "blueprint" ? "blueprint" : "baby-name";
  const pricingImage = await pdfDoc.embedPng(await fetchAssetBytes(PRICING_PAGE_PATHS[pricingVariant]));
  const NO_LIGATURES = { features: { liga: false } };
  const fonts = {
    sans: await pdfDoc.embedFont(quicksandRegularBytes, NO_LIGATURES),
    sansBold: await pdfDoc.embedFont(quicksandBoldBytes, NO_LIGATURES),
    heading: await pdfDoc.embedFont(cinzelDecorativeBoldBytes, NO_LIGATURES),
    quote: await pdfDoc.embedFont(cardoRegularBytes, NO_LIGATURES)
  };
  const TOTAL_PAGES = 15;
  const addPage = () => pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawCoverPage(addPage(), fonts, data, assets);
  drawIndexPage(addPage(), fonts, assets, data, 2, TOTAL_PAGES);
  drawWelcomePage(addPage(), fonts, assets, data, 3, TOTAL_PAGES);
  drawBlueprintPage(addPage(), fonts, assets, data, { mulank, bhagyank, firstNameNumber, fullNameNumber, fullNameCompound }, 4, TOTAL_PAGES);
  drawScienceOfNamesPage(addPage(), fonts, assets, data, 5, TOTAL_PAGES);
  drawChaldeanSystemPage(addPage(), fonts, assets, data, 6, TOTAL_PAGES);
  drawWhatWellAnalyzePage(addPage(), fonts, assets, data, 7, TOTAL_PAGES);
  drawCurrentNameBreakdownPage(
    addPage(),
    fonts,
    assets,
    data,
    { heading: "First Name Number", nameLabel: "First Name", nameValue: data.firstName, total: firstNameSum, reducedTo: firstNameNumber, bullets: content.firstNameAnalysis },
    8,
    TOTAL_PAGES
  );
  drawCurrentNameBreakdownPage(
    addPage(),
    fonts,
    assets,
    data,
    { heading: "Full Name Number", nameLabel: "Full Name", nameValue: fullName, total: fullNameSum, reducedTo: fullNameNumber, bullets: content.fullNameAnalysis },
    9,
    TOTAL_PAGES
  );
  drawCurrentNameBreakdownPage(
    addPage(),
    fonts,
    assets,
    data,
    { heading: "Full Name Compound Number", nameLabel: "Full Name", nameValue: fullName, total: fullNameCompound, bullets: content.compoundAnalysis },
    10,
    TOTAL_PAGES
  );
  drawWhyCriticalPage(addPage(), fonts, assets, data, { verdict: content.verdict, isFallback: content.isFallback, bullets: content.verdictBullets, verdictNote: content.verdictNote }, 11, TOTAL_PAGES);
  drawPricingImagePage(addPage(), pricingImage, pricingVariant);
  drawConnectPage(addPage(), fonts, assets, data, 13, TOTAL_PAGES);
  drawServicesPage(addPage(), fonts, assets, data, 14, TOTAL_PAGES);
  drawBackCoverPage(addPage(), fonts, assets, data);
  return pdfDoc.save();
}
export {
  computeNameCheckReportContent,
  generateNameCheckReportPdf
};
