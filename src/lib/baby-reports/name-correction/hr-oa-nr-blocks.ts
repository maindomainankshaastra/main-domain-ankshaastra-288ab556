/**
 * NAME CORRECTION REPORT — HR / OA / NR RULE TEXT BLOCKS
 * Source: client's "Name_Correction_Output_File.docx", Part 4.1 (Highly
 * Recommended), Part 4.2 (Optional/Advisable), Part 4.3 (Not Required).
 * Verbatim client copy — do NOT paraphrase/edit.
 *
 * CLIENT CONFIRMATIONS (received 13 Sept 2026):
 *  - This is a deliberately trimmed set: 11 HR + 4 OA + 3 NR = 18 rules
 *    total (down from the older 39-rule "Name Check" reference). The
 *    dropped rules (Lo Shu repetition combos, restricted-number overlaps,
 *    "Name Number = Mulank/Bhagyank" OA cases, etc.) were removed on
 *    purpose — CONFIRMED, do not re-add them.
 *  - HR-05 "First Name (Enemy) + Full Name (Friendly)" was OA in the old
 *    reference; client CONFIRMED it is intentionally upgraded to HR here.
 *  - Nick Name Analysis (used elsewhere in the baby-report family, not in
 *    this file) is manual: just the Chaldean single-digit number, no
 *    prose block — see ../shared/ for the reusable Chaldean helpers.
 */

export type Verdict = "HR" | "OA" | "NR";

export interface RuleBlock {
  id: string;
  verdict: Verdict;
  /** Short human-readable label of the condition, from the docx heading. */
  conditionLabel: string;
  paragraphs: string[];
}

// ---------------------------------------------------------------------------
// PART 4.1 — HIGHLY RECOMMENDED (HR) — 11 rules
// ---------------------------------------------------------------------------
export const HR_RULES: RuleBlock[] = [
  {
    id: "HR-01",
    verdict: "HR",
    conditionLabel: "First Name (Enemy) + Full Name (Enemy)",
    paragraphs: [
      "Both your first name and full name are in direct conflict with your core birth numbers, creating a complete dual-layer misalignment at both identity and destiny levels.",
      "Every interaction with your name activates conflicting vibrations at both levels, accumulating daily friction, persistent obstacles, and a consistent gap between effort and outcome over time.",
      "Immediate, comprehensive name correction is essential. Both the first name and full name must be corrected together, since partial correction leaves the remaining layer undermining progress.",
    ],
  },
  {
    id: "HR-02",
    verdict: "HR",
    conditionLabel: "First Name (Enemy) + Full Name (Neutral)",
    paragraphs: [
      "Your first name is in direct conflict with your core birth numbers, while your full name offers no supportive energy to counterbalance this hostile, unchecked vibration.",
      "Since the first name is used most frequently in daily life, its conflicting vibration accumulates a disproportionately large negative impact on confidence and daily momentum overall.",
      "Name correction is highly recommended, with the first name corrected as the priority. Upgrading the full name from neutral to Friendly is also strongly advisable alongside this.",
    ],
  },
  {
    id: "HR-03",
    verdict: "HR",
    conditionLabel: "First Name (Neutral) + Full Name (Enemy)",
    paragraphs: [
      "Your full name is in direct conflict with your core birth numbers at the destiny level, while the neutral first name provides no counterbalancing energy at all.",
      "Long-term outcomes across career direction, financial growth, and major life achievements are all being consistently hindered by this vibrational conflict at the full name level itself.",
      "Name correction is highly recommended, with the full name corrected as the first priority. First name upgrade from neutral to Friendly is also strongly advisable alongside it.",
    ],
  },
  {
    id: "HR-04",
    verdict: "HR",
    conditionLabel: "First Name (Friendly) + Full Name (Enemy)",
    paragraphs: [
      "Your first name is well-aligned and supportive, but your full name conflicts with your core birth numbers at the destiny level, undermining all long-term outcomes quietly.",
      "This creates a pattern of promising starts that fail to sustain, where personal confidence is present but career trajectory and long-term direction are consistently held back.",
      "Name correction is highly recommended for the full name. Correcting it to a Friendly number will align destiny-level energy with the positive personal energy already present.",
    ],
  },
  {
    // CONFIRMED 13 Sept 2026: intentionally upgraded from OA -> HR.
    id: "HR-05",
    verdict: "HR",
    conditionLabel: "First Name (Enemy) + Full Name (Friendly)",
    paragraphs: [
      "Your full name is well-aligned and actively supports your life path and destiny, the most important layer working well, but your first name creates daily friction.",
      "This creates a subtle disconnect, where your broader life path is supported, but daily personal expression, self-confidence, and everyday interactions are consistently affected by this conflict.",
      "Name correction is highly recommended for the first name. Correcting it to a Friendly number will align destiny-level energy with the positive personal energy already present.",
    ],
  },
  {
    id: "HR-06",
    verdict: "HR",
    conditionLabel: "First Name (Friendly) + Full Name (Friendly) + Bad Compound",
    paragraphs: [
      "Both your first name and full name carry Friendly vibrations, a strong foundation, but the compound number carries an unfavorable vibration operating as a hidden background energy.",
      "This compound creates a ceiling on the potential your Friendly name numbers would otherwise fully unlock, like a strong engine with a cracked frame beneath the surface.",
      "Name correction is highly recommended to arrive at both a Friendly base number and an auspicious compound, letting your well-aligned names express their full potential clearly.",
    ],
  },
  {
    id: "HR-07",
    verdict: "HR",
    conditionLabel: "Name on Number 4 (Rahu)",
    paragraphs: [
      "Your name vibrates on Number 4, governed by Rahu, whose unpredictable and illusory energy creates instability, confusion, and sudden reversals regardless of the friendship table result.",
      "Carrying Number 4 in the name activates Rahu's energy daily, introducing a persistent undercurrent of uncertainty and a misalignment between effort and outcome across every area.",
      "Name correction is highly recommended. Number 4 is a restricted vibration for both first name and full name without exception, so correction to stability is essential.",
    ],
  },
  {
    id: "HR-08",
    verdict: "HR",
    conditionLabel: "Name on Number 8 (Saturn)",
    paragraphs: [
      "Your name vibrates on Number 8, governed by Saturn, whose restrictive energy consistently brings delays, burdens, and slow progress regardless of the combination with your core numbers.",
      "Carrying Number 8 in the name activates Saturn's heavy energy daily, creating a cumulative weight that makes consistent forward movement feel disproportionately difficult over time overall.",
      "Name correction is highly recommended. Number 8 is a restricted vibration for both first name and full name without exception, so correction to a lighter number is essential.",
    ],
  },
  {
    id: "HR-09",
    verdict: "HR",
    conditionLabel: "Name on Number 9 (Mars)",
    paragraphs: [
      "Your name vibrates on Number 9, governed by Mars, whose intense energy at the full name level amplifies impulsiveness, emotional extremes, and interpersonal friction over time.",
      "Carrying Mars energy at the name level creates reactive decision-making, emotional volatility, and real difficulty sustaining the consistency that long-term success and relationship harmony genuinely require.",
      "Name correction is highly recommended. Number 9 is a restricted vibration at both the full name and first name level, so correction to a calmer number is essential.",
    ],
  },
  {
    id: "HR-10",
    verdict: "HR",
    conditionLabel: "First Name (Friendly & Weak) + Full Name (Friendly & Weak)",
    paragraphs: [
      "Your first name and full name both vibrate on friendly numbers, so there is no direct conflict with your core birth energies present anywhere in the chart.",
      "However, the planetary energies these numbers carry are among the weaker expressions of compatibility, so friendly doesn't always translate into genuinely powerful vibrational support for you.",
      "Name correction is recommended. Both names should be elevated to stronger, high-vibration friendly numbers to unlock the full potential your birth chart genuinely holds for you.",
    ],
  },
  {
    id: "HR-11",
    verdict: "HR",
    conditionLabel: "First Name (Friendly) + Full Name (Friendly, Rajyog Potential)",
    paragraphs: [
      "Your first name vibrates on a friendly number aligned with your birth energies, and your full name also carries a friendly vibration, a stable, supportive nameprint overall.",
      "However, the full name number holds the potential to form a Rajyog combination, one of the most powerful configurations in numerology, built for accelerated growth and success.",
      "Name correction is recommended. The full name should ideally be adjusted to fully activate the Rajyog, so a good nameprint becomes a genuinely exceptional one instead.",
    ],
  },
];

// ---------------------------------------------------------------------------
// PART 4.2 — OPTIONAL / ADVISABLE (OA) — 4 rules
// ---------------------------------------------------------------------------
export const OA_RULES: RuleBlock[] = [
  {
    id: "OA-01",
    verdict: "OA",
    conditionLabel: "First Name (Neutral) + Full Name (Neutral)",
    paragraphs: [
      "Both your first name and full name are neutral, neither creating active damage nor providing any vibrational support at either the personal identity or destiny level.",
      "The result is a stable but consistently average life trajectory, where you navigate personal and professional areas without a name actively working in your energetic favour.",
      "Name correction is advisable for both layers. Upgrading both to Friendly vibrations would introduce meaningful positive energy at every level and meaningfully accelerate growth and opportunity.",
    ],
  },
  {
    id: "OA-02",
    verdict: "OA",
    conditionLabel: "First Name (Friendly) + Full Name (Neutral)",
    paragraphs: [
      "Your first name is well-aligned and provides strong, genuine personal energy, but your full name, the layer governing long-term direction and major outcomes, sits neutral overall.",
      "Personal presence and confidence are well-supported, but long-term results tend to plateau without the boost a Friendly full name would naturally provide to career and financial progress.",
      "Name correction is advisable for the full name. Upgrading to a Friendly vibration will complete the alignment and unlock the potential the first name is already pointing toward.",
    ],
  },
  {
    id: "OA-03",
    verdict: "OA",
    conditionLabel: "First Name (Neutral) + Full Name (Friendly)",
    paragraphs: [
      "Your full name actively supports your life path and destiny outcomes, the most consequential layer working well, while your first name sits neutral, creating no conflict.",
      "The overall configuration is genuinely positive and stable. The full name does the most important work effectively, while the neutral first name adds no extra amplification.",
      "Name correction is not urgently required. The full name alignment is strong with no active damage, though upgrading the first name to Friendly remains entirely optional.",
    ],
  },
  {
    id: "OA-04",
    verdict: "OA",
    conditionLabel: "Compound Number is Conditional",
    paragraphs: [
      "Your name carries a conditional compound, genuine positive potential that comes alongside a specific area of caution or risk requiring conscious acknowledgment and active management here.",
      "The positive and cautionary elements exist together, so the associated vulnerability is real and, if ignored, tends to become a recurring pattern offsetting some of the gains.",
      "Correction to an unconditionally auspicious compound is the cleaner choice, though retaining this compound with full conscious awareness remains a meaningful alternative when alignment is strong.",
    ],
  },
];

// ---------------------------------------------------------------------------
// PART 4.3 — NOT REQUIRED (NR) — 3 rules
// ---------------------------------------------------------------------------
export const NR_RULES: RuleBlock[] = [
  {
    id: "NR-01",
    verdict: "NR",
    conditionLabel:
      "First Name (Friendly) + Full Name (Friendly) + Excellent Compound + No Lo Shu Repetition",
    paragraphs: [
      "Both your first name and full name are in complete harmony with your Mulank and Bhagyank, active support present at both the personal identity and destiny levels.",
      "Your compound number is excellent, one of the most auspicious vibrations available, adding a powerfully supportive background energy with no planetary over-amplification anywhere in the chart.",
      "Name correction is not required. Your name works at the highest possible level of vibrational harmony across every layer of the assessment, the gold standard outcome.",
    ],
  },
  {
    id: "NR-02",
    verdict: "NR",
    conditionLabel: "First Name (Friendly) + Full Name (Friendly) + Good Compound",
    paragraphs: [
      "Both your first name and full name carry Friendly vibrations well-aligned with your Mulank and Bhagyank, active support present at both the personal and destiny levels.",
      "Your compound number is good, a solid and reliably favorable vibration adding a supportive secondary layer to the overall name energy, with all primary conditions met.",
      "Name correction is not required. Your name provides strong, consistent vibrational support across all primary layers of the assessment, and no adjustment is needed here today.",
    ],
  },
  {
    id: "NR-03",
    verdict: "NR",
    conditionLabel: "First Name (Friendly) + Full Name (Friendly) + Conditional Compound",
    paragraphs: [
      "Both your first name and full name are Friendly and well-aligned with your Mulank and Bhagyank, the primary layers strong and working actively in your favour here.",
      "Your compound is conditional, carrying positive potential alongside a specific area of caution, though in the context of your strong overall alignment this remains manageable with awareness.",
      "Name correction is not urgently required. Understanding the caution associated with your compound and approaching that area consciously is recommended, while upgrading the compound stays optional.",
    ],
  },
];

export const ALL_RULES: RuleBlock[] = [...HR_RULES, ...OA_RULES, ...NR_RULES];
