/**
 * HR / OA / NR RULE TEXT BLOCKS
 * Exact wording transcribed from the client's "Name Check Output" doc,
 * Part 4.1 (Highly Recommended), Part 4.2 (Optional/Advisable), Part 5
 * (Not Required). Do NOT paraphrase/edit — verbatim client copy.
 *
 * Each rule also carries a short `condition` description (in comments,
 * taken directly from the rule's docx heading) — this is what the actual
 * matching logic in rule-engine.ts will need to check for. The condition
 * is NOT auto-evaluated here; this file is text + metadata only.
 *
 * CLIENT CONFIRMATIONS (received):
 *  - HR-16 "weak friendly" = friendly relation on number 2 or 7.
 *  - HR-20 "Rajyog Potential" — client said SKIP this rule for now, not implemented.
 *  - HR-22 "powerful number" = Mulank, Bhagyank, First Name Number, and
 *    Full Name Number are all the same number.
 *  - Priority order: client confirmed a single customer will only ever
 *    match ONE rule in practice (conditions don't overlap in real data),
 *    so the tiered priority order in rule-engine.ts is a safety net only.
 *  - NR fallback: client confirmed this should never trigger — NR only
 *    applies to exactly these 4 defined conditions. rule-engine.ts still
 *    has a defensive fallback, but it logs a warning if hit since that
 *    would indicate a genuine gap worth investigating.
 *  - Restricted numbers (4/8/9): CONFIRMED to override every other rule —
 *    already implemented as Tier 1 (checked first) in rule-engine.ts.
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
// PART 4.1 — HIGHLY RECOMMENDED (HR) — 22 rules
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
    id: "HR-05",
    verdict: "HR",
    conditionLabel: "First Name (Enemy) + Lo Shu Repetition",
    paragraphs: [
      "Your first name conflicts with your core birth numbers and simultaneously over-amplifies a planetary energy already dominant in your Lo Shu Grid, compounding the vibrational problem.",
      "The negative influence of the conflicting name number is not just present, it is intensified through additional amplification of the same planet already in chart excess.",
      "Name correction is highly recommended. The first name must move to a Friendly number that also introduces planetary energy not already dominant in your Lo Shu Grid.",
    ],
  },
  {
    id: "HR-06",
    verdict: "HR",
    conditionLabel: "Full Name (Enemy) + Lo Shu Repetition",
    paragraphs: [
      "Your full name conflicts with your core birth numbers and over-amplifies a planetary energy already dominant in your Lo Shu Grid, creating a self-reinforcing destiny imbalance.",
      "Since the full name governs the long-term life path, this combination of vibrational conflict and planetary over-amplification operates at the most consequential layer of your chart.",
      "Name correction is highly recommended. The full name must move to a Friendly number that also introduces genuine planetary balance to your existing Lo Shu Grid.",
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
    conditionLabel: "Name on 4 + Number 4 Repeating in Lo Shu",
    paragraphs: [
      "Your name vibrates on Number 4, a Rahu restriction, and Number 4 is also repeating in your Lo Shu Grid, activating Rahu's shadow energy through both channels.",
      "This double amplification creates a compounded effect, where confusion, sudden reversals, and persistent misalignment between effort and outcome intensify at every single level of the chart.",
      "Immediate correction is essential. The name must move to a stable, Friendly number not already overrepresented in the Lo Shu Grid, breaking both problems together at once.",
    ],
  },
  {
    id: "HR-11",
    verdict: "HR",
    conditionLabel: "Name on 8 + Number 8 Repeating in Lo Shu",
    paragraphs: [
      "Your name vibrates on Number 8, a Saturn restriction, and Number 8 is also repeating in your Lo Shu Grid, activating Saturn's restrictive energy through both channels.",
      "This double amplification creates a compounded burden, where delays, persistent obstacles, and an unusually heavy sense of personal responsibility intensify well beyond the birth chart alone.",
      "Immediate correction is essential. The name must move to a lighter, Friendly number not already dominant in the Lo Shu Grid, reducing the Saturn burden at both levels.",
    ],
  },
  {
    id: "HR-12",
    verdict: "HR",
    conditionLabel: "Full Name on 9 + Number 9 Repeating in Lo Shu",
    paragraphs: [
      "Your full name vibrates on Number 9, a Mars restriction at the full name level, and Number 9 is also repeating in your Lo Shu Grid simultaneously.",
      "This extreme Mars amplification at the destiny level creates heightened emotional volatility, reactive decision-making, and interpersonal intensity that makes long-term stability significantly harder to reach here.",
      "Immediate correction is essential. The full name must move to a balanced, Friendly number introducing calmer planetary energy not already overrepresented in your Lo Shu Grid.",
    ],
  },
  {
    id: "HR-13",
    verdict: "HR",
    conditionLabel: "Both Names on the Same Restricted Number",
    paragraphs: [
      "Both your first name and full name vibrate on the same restricted number, activating the same problematic planetary energy at both the identity and destiny levels together.",
      "This complete dominance by a single restricted planetary energy leaves no room for complementary vibrational influence, creating a consistently challenging energetic environment across every area of life.",
      "Immediate correction is essential for both name layers. Ideally both should be corrected to different Friendly numbers, introducing complementary energies rather than one energy continuing to dominate.",
    ],
  },
  {
    id: "HR-14",
    verdict: "HR",
    conditionLabel: "First Name (Friendly) + Full Name (Friendly) + Bad Compound",
    paragraphs: [
      "Both your first name and full name carry Friendly vibrations, a strong foundation, but the compound number carries an unfavorable vibration operating as a hidden background energy.",
      "This compound creates a ceiling on the potential your Friendly name numbers would otherwise fully unlock, like a strong engine with a cracked frame beneath the surface.",
      "Name correction is highly recommended to arrive at both a Friendly base number and an auspicious compound, letting your well-aligned names express their full potential clearly.",
    ],
  },
  {
    id: "HR-15",
    verdict: "HR",
    conditionLabel: "First Name (Neutral) + Full Name (Enemy) + Bad Compound",
    paragraphs: [
      "Your full name conflicts with your core birth numbers, your first name offers no counterbalance, and the bad compound adds a further hidden layer of difficulty overall.",
      "Each layer compounds the others, where the Enemy full name creates destiny-level resistance, the neutral first name offers no protection, and the bad compound amplifies the effect.",
      "Immediate and comprehensive correction is essential. All three elements, first name, full name, and compound number, must be addressed together for complete vibrational harmony overall ahead.",
    ],
  },
  {
    id: "HR-16",
    verdict: "HR",
    conditionLabel: "First Name (Friendly & Weak) + Full Name (Friendly & Weak) — CONFIRMED: weak friendly = number 2 or 7",
    paragraphs: [
      "Your first name and full name both vibrate on friendly numbers, so there is no direct conflict with your core birth energies present anywhere in the chart.",
      "However, the planetary energies these numbers carry are among the weaker expressions of compatibility, so friendly doesn't always translate into genuinely powerful vibrational support for you.",
      "Name correction is recommended. Both names should be elevated to stronger, high-vibration friendly numbers to unlock the full potential your birth chart genuinely holds for you.",
    ],
  },
  {
    id: "HR-17",
    verdict: "HR",
    conditionLabel: "First Name (Friendly) + Full Name (Neutral, Bad Compound Number)",
    paragraphs: [
      "Your first name carries a friendly vibration aligned with your core birth numbers, but your full name lands on a neutral number carrying a damaging compound energy.",
      "A bad compound number at the full name level acts as a ceiling, so no matter how well your personal energy starts, outcomes are pulled downward overall.",
      "Name correction is recommended. The full name must be recalibrated to a friendly number with a strong, positive compound to match the foundation your first name offers.",
    ],
  },
  {
    id: "HR-18",
    verdict: "HR",
    conditionLabel: "First Name (Friendly) + Full Name (Friendly, Repetition)",
    paragraphs: [
      "Your first name and full name both vibrate on friendly numbers, a positive foundation, but the full name repeats the same planetary energy as the first name.",
      "A single planet dominating both name layers leaves other supportive energies completely absent from your overall nameprint, narrowing the vibrational spectrum genuinely available to you here.",
      "Name correction is recommended. The full name should shift to a different friendly number introducing a complementary planetary energy and broadening your overall vibrational balance ahead.",
    ],
  },
  {
    id: "HR-19",
    verdict: "HR",
    conditionLabel: "First Name (Enemy) + Full Name (Neutral, Bad Compound Number)",
    paragraphs: [
      "Your first name conflicts directly with your core birth numbers, and the full name compounds this by landing on a neutral number with a damaging compound energy.",
      "The enemy first name creates active resistance at the personal level, while the bad compound on the full name ensures even neutral ground offers no relief.",
      "Name correction is strongly recommended. Both the first name and full name require correction, to a friendly number with a clean vibration and a strong compound.",
    ],
  },
  {
    id: "HR-20",
    verdict: "HR",
    conditionLabel: "First Name (Friendly) + Full Name (Friendly, Rajyog Potential) — SKIPPED per client instruction, not matched by rule-engine.ts",
    paragraphs: [
      "Your first name vibrates on a friendly number aligned with your birth energies, and your full name also carries a friendly vibration, a stable, supportive nameprint overall.",
      "However, the full name number holds the potential to form a Rajyog combination, one of the most powerful configurations in numerology, built for accelerated growth and success.",
      "Name correction is recommended. The full name should ideally be adjusted to fully activate the Rajyog, so a good nameprint becomes a genuinely exceptional one instead.",
    ],
  },
  {
    id: "HR-21",
    verdict: "HR",
    conditionLabel: "First Name & Full Name on Two Different Restricted Numbers (Rahu, Saturn, Mars)",
    paragraphs: [
      "Your first name and full name fall on two different restricted numbers among 4 (Rahu), 8 (Saturn), and 9 (Mars), whichever pairing and whichever order occurs.",
      "Each restricted number brings its own core problem, Rahu's instability, Saturn's delay, or Mars's volatility, so carrying two together compounds distinct difficulties across both name layers daily.",
      "Name correction is highly recommended for both layers. Each restricted number should move to a stable, Friendly number, removing both conflicting planetary influences from your nameprint together.",
    ],
  },
  {
    id: "HR-22",
    verdict: "HR",
    conditionLabel: "First Name & Full Name Friendly on the Same Powerful Number, Repeating in Lo Shu — CONFIRMED: 'powerful number' = Mulank, Bhagyank, First Name Number and Full Name Number all equal",
    paragraphs: [
      "Your first name and full name both vibrate on the same powerful Friendly number, which is a genuinely strong foundation for your chart on its own merit.",
      "However, this exact planetary energy already repeats more than twice in your Lo Shu Grid, pushing an otherwise strong number into over-amplification and overall chart imbalance.",
      "Name correction is recommended to shift to a different Friendly number, preserving the strength of your name while genuinely restoring balance across your entire numerological chart.",
    ],
  },
];

// ---------------------------------------------------------------------------
// PART 4.2 — OPTIONAL / ADVISABLE (OA) — 13 rules
// ---------------------------------------------------------------------------
export const OA_RULES: RuleBlock[] = [
  {
    id: "OA-01",
    verdict: "OA",
    conditionLabel: "First Name (Enemy) + Full Name (Friendly)",
    paragraphs: [
      "Your full name is well-aligned and actively supports your life path and destiny, the most important layer working well, but your first name creates daily friction.",
      "This creates a subtle disconnect, where your broader life path is supported, but daily personal expression, self-confidence, and everyday interactions are consistently affected by this conflict.",
      "Name correction is advisable for the first name. Bringing it will let the full name's positive energy be fully expressed at the personal level too.",
    ],
  },
  {
    id: "OA-02",
    verdict: "OA",
    conditionLabel: "First Name (Neutral) + Full Name (Neutral)",
    paragraphs: [
      "Both your first name and full name are neutral, neither creating active damage nor providing any vibrational support at either the personal identity or destiny level.",
      "The result is a stable but consistently average life trajectory, where you navigate personal and professional areas without a name actively working in your energetic favour.",
      "Name correction is advisable for both layers. Upgrading both to Friendly vibrations would introduce meaningful positive energy at every level and meaningfully accelerate growth and opportunity.",
    ],
  },
  {
    id: "OA-03",
    verdict: "OA",
    conditionLabel: "First Name (Friendly) + Full Name (Neutral)",
    paragraphs: [
      "Your first name is well-aligned and provides strong, genuine personal energy, but your full name, the layer governing long-term direction and major outcomes, sits neutral overall.",
      "Personal presence and confidence are well-supported, but long-term results tend to plateau without the boost a Friendly full name would naturally provide to career and financial progress.",
      "Name correction is advisable for the full name. Upgrading to a Friendly vibration will complete the alignment and unlock the potential the first name is already pointing toward.",
    ],
  },
  {
    id: "OA-04",
    verdict: "OA",
    conditionLabel: "First Name (Neutral) + Full Name (Friendly)",
    paragraphs: [
      "Your full name actively supports your life path and destiny outcomes, the most consequential layer working well, while your first name sits neutral, creating no conflict.",
      "The overall configuration is genuinely positive and stable. The full name does the most important work effectively, while the neutral first name adds no extra amplification.",
      "Name correction is not urgently required. The full name alignment is strong with no active damage, though upgrading the first name to Friendly remains entirely optional.",
    ],
  },
  {
    id: "OA-05",
    verdict: "OA",
    conditionLabel: "First Name (Enemy) + Full Name (Friendly) + Moderate Compound",
    paragraphs: [
      "Your full name is aligned at the destiny level, which is positive, but your first name conflicts with your core numbers, creating daily personal identity friction here.",
      "Two out of three key elements create drag alongside the one positive element, so the overall name energy is significantly limited despite the full name's alignment.",
      "Name correction is advisable. Correcting the first name is the primary step, and addressing the compound number alongside this would bring the name to a strong position.",
    ],
  },
  {
    id: "OA-06",
    verdict: "OA",
    conditionLabel: "First Name (Friendly) + Full Name (Neutral) + Good Compound",
    paragraphs: [
      "Your first name is well-aligned and your compound number is positive, two out of three elements working in your favour, while your full name sits neutral.",
      "The good compound provides a meaningful additional layer of positive energy that softens the impact of the neutral full name, though its long-term potential stays unlocked.",
      "Name correction is advisable for the full name. This is not urgent given the strong first name and good compound, but upgrading would let all elements align.",
    ],
  },
  {
    id: "OA-07",
    verdict: "OA",
    conditionLabel: "First Name (Friendly) + Full Name (Friendly) + Moderate Compound",
    paragraphs: [
      "Both your first name and full name are well-aligned, the primary layers genuinely strong, but the moderate compound number introduces a limiting background vibration beneath it.",
      "The compound operates beneath the surface as a persistent secondary influence, so results tend to be uneven and the name doesn't reach its full auspicious potential.",
      "Name correction is advisable specifically to improve the compound number. Both base numbers are already strong, so a more auspicious compound is the only refinement needed.",
    ],
  },
  {
    id: "OA-08",
    verdict: "OA",
    conditionLabel: "Lo Shu Repetition on a Friendly Number",
    paragraphs: [
      "Your name vibrates on a Friendly number, so the vibrational direction is correct, but this planet already appears multiple times in your Lo Shu Grid, over-amplifying it.",
      "When a planet already dominant in the birth chart is further amplified by the name, the excess gradually creates its own challenges through intensification of its qualities.",
      "Name correction is advisable. A different Friendly number would introduce an equally supportive vibration while also bringing better overall planetary balance to your existing birth chart.",
    ],
  },
  {
    id: "OA-09",
    verdict: "OA",
    conditionLabel: "Lo Shu Repetition on a Neutral Number",
    paragraphs: [
      "Your name vibrates on a number whose governing planet already appears multiple times in your Lo Shu Grid, amplifying a neutral energy that is already in excess.",
      "This over-amplification of a neutral planet creates a subtle but genuinely persistent imbalance, where unfocused energy, lack of clarity, and inconsistency accumulate quietly over time overall.",
      "Name correction is advisable. Moving to a Friendly number not already overrepresented in the Lo Shu Grid would replace neutral excess with genuinely supportive, balanced energy.",
    ],
  },
  {
    id: "OA-10",
    verdict: "OA",
    conditionLabel: "Compound Number is Moderate",
    paragraphs: [
      "Your name carries a moderate compound number, a vibration containing both positive elements and limiting factors that exist simultaneously, creating mixed background energy beneath the surface.",
      "This compound tends to create inconsistency in outcomes and a ceiling on potential, so progress happens but stays uneven, without the reliable support a stronger compound brings.",
      "Name correction is advisable. Adjusting to arrive at a cleaner, more auspicious compound would remove this ceiling and let the name's positive alignment express fully and consistently.",
    ],
  },
  {
    id: "OA-11",
    verdict: "OA",
    conditionLabel: "Compound Number is Conditional",
    paragraphs: [
      "Your name carries a conditional compound, genuine positive potential that comes alongside a specific area of caution or risk requiring conscious acknowledgment and active management here.",
      "The positive and cautionary elements exist together, so the associated vulnerability is real and, if ignored, tends to become a recurring pattern offsetting some of the gains.",
      "Correction to an unconditionally auspicious compound is the cleaner choice, though retaining this compound with full conscious awareness remains a meaningful alternative when alignment is strong.",
    ],
  },
  {
    id: "OA-12",
    verdict: "OA",
    conditionLabel: "Name Number equals Mulank",
    paragraphs: [
      "Your name number and Mulank are identical, so the name vibrates on the same planetary energy that already governs your personal identity, a strong but narrow concentration.",
      "When the same energy dominates both the birth number and the name, other important planetary influences remain underrepresented, and the chart lacks well-rounded vibrational diversity here.",
      "This configuration is acceptable when the shared number is positive and unrestricted, though a different Friendly number would introduce complementary energy for a more balanced profile.",
    ],
  },
  {
    id: "OA-13",
    verdict: "OA",
    conditionLabel: "Name Number equals Bhagyank",
    paragraphs: [
      "Your name number and Bhagyank are identical, so the name vibrates on the same planetary energy that governs your destiny, a strong but singular vibrational alignment.",
      "When both the Bhagyank and the name carry identical energy without diversity, the chart remains concentrated on one vibration, lacking the balance complementary energies would bring.",
      "This configuration is acceptable when the shared number is positive and unrestricted, though a different Friendly number would support the destiny path while adding new richness.",
    ],
  },
];

// ---------------------------------------------------------------------------
// PART 5 — NOT REQUIRED (NR) — 4 rules
// ---------------------------------------------------------------------------
export const NR_RULES: RuleBlock[] = [
  {
    id: "NR-01",
    verdict: "NR",
    conditionLabel: "First Name (Friendly) + Full Name (Friendly) + Excellent Compound + No Lo Shu Repetition",
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
    conditionLabel: "First Name (Neutral) + Full Name (Friendly) + Good Compound",
    paragraphs: [
      "Your full name is fully aligned with your Mulank and Bhagyank, the most consequential layer working strongly in your favour, while the neutral first name creates no conflict.",
      "Your compound number is good, adding a further layer of reliable positive energy, so the combination of a strong full name and good compound genuinely supports outcomes.",
      "Name correction is not required. Upgrading the first name to Friendly is entirely optional, since the name already works well at the levels that matter most.",
    ],
  },
  {
    id: "NR-04",
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
