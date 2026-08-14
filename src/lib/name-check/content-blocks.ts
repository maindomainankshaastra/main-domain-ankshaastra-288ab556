
/**
 * CONTENT BLOCKS
 * Exact wording transcribed from the client's "Name Check Output" reference
 * doc (Himansshu Agarwal, Ankshaastra). Each block is 3 paragraphs, in the
 * same order as the source doc. Do NOT paraphrase/edit these — the client
 * wrote this copy specifically to be used verbatim in the PDF.
 *
 * This file only covers Part 1, 2, 3 (First Name combos, Full Name combos,
 * Compound tiers). The 39 HR/OA/NR rule blocks (Part 4.1, 4.2, 5) live in
 * a separate file: hr-oa-nr-blocks.ts (kept separate because that file is
 * also where the rule-engine priority logic will live).
 */

export type FirstFullCombo =
  | "F-F" | "F-N" | "F-E"
  | "N-F" | "N-N" | "N-E"
  | "E-F" | "E-N" | "E-E";

/** F = Friendly, N = Neutral, E = Enemy. First letter = Mulank relation, second = Bhagyank relation. */
export function comboKey(mulankRelation: "friendly" | "neutral" | "enemy", bhagyankRelation: "friendly" | "neutral" | "enemy"): FirstFullCombo {
  const code = (r: "friendly" | "neutral" | "enemy") => (r === "friendly" ? "F" : r === "neutral" ? "N" : "E");
  return `${code(mulankRelation)}-${code(bhagyankRelation)}` as FirstFullCombo;
}

// ---------------------------------------------------------------------------
// PART 1 — FIRST NAME COMBINATIONS
// ---------------------------------------------------------------------------
export const FIRST_NAME_BLOCKS: Record<FirstFullCombo, [string, string, string]> = {
  "F-F": [
    "Your first name is in complete harmony with your date of birth, aligning naturally with both your Mulank and Bhagyank, the two core pillars of your chart.",
    "This alignment supports your personal confidence, daily expression, and long-term direction, without any internal friction or split energy pulling you toward opposite, conflicting directions in life.",
    "A first name in full harmony with both core numbers creates natural momentum, helping you move forward with real clarity in both personal and professional areas of life.",
  ],
  "F-N": [
    "Your first name supports your Mulank, your personal identity number, while your Bhagyank, your destiny number, remains in a neutral, unamplified position within the chart overall.",
    "Daily energy and personal confidence receive a positive boost, but at the destiny level, the name neither strongly supports nor creates real obstacles for you right now.",
    "Upgrading to a name that also resonates with your Bhagyank would unlock a stronger, more complete alignment across both of your important core birth numbers overall.",
  ],
  "F-E": [
    "Your first name appears to support your Mulank, but it stands in direct conflict with your Bhagyank, and the Enemy relationship remains the dominant factor here.",
    "This conflict with your Bhagyank creates persistent resistance at the destiny level, so long-term outcomes, career direction, and life path results are consistently undermined.",
    "Correcting the name to be Friendly to both Mulank and Bhagyank is strongly advisable, since the destiny-level damage outweighs any benefit from the partial alignment present.",
  ],
  "N-F": [
    "Your first name supports your Bhagyank, your destiny number, while remaining neutral toward your Mulank, your personal identity number, in this particular name configuration overall right now.",
    "Opportunities tend to flow more naturally at the life path level, but your personal daily energy still lacks a strong vibrational anchor from the current chosen name.",
    "Aligning the name with both Mulank and Bhagyank would bring full, complete balance across your personal expression and your long-term destiny direction going forward as well.",
  ],
  "N-N": [
    "Your first name neither supports nor conflicts with either your Mulank or Bhagyank, sitting in a completely neutral position toward both of your important core numbers.",
    "The name is not causing active harm, but it also provides no vibrational uplift or amplification, leaving you without any energetic support in your daily life.",
    "Upgrading to a name Friendly to both your Mulank and Bhagyank would introduce meaningful positive energy that is currently entirely absent from your current name choice.",
  ],
  "N-E": [
    "Your first name directly conflicts with your Bhagyank, your destiny number, while the neutral Mulank relationship offers no positive energy to counterbalance this ongoing vibrational tension.",
    "The name creates persistent resistance at the life path level, so long-term career growth, financial direction, and major achievements are all consistently hindered by this issue.",
    "Correction is recommended to align the name with your Bhagyank and unlock the natural, unobstructed flow of your life path energy going forward from this point.",
  ],
  "E-F": [
    "Your first name appears to align with your Bhagyank, but it stands in direct conflict with your Mulank, and the Enemy relationship remains the dominant factor.",
    "The conflict with your Mulank creates persistent friction at the personal identity level, so daily expression, self-confidence, and personal clarity are all consistently affected by this.",
    "Correcting the name to be Friendly to both Mulank and Bhagyank is strongly advisable, since the identity-level conflict outweighs the destiny-level partial benefit present here today.",
  ],
  "E-N": [
    "Your first name is in direct conflict with your Mulank, your personal identity number, while the neutral Bhagyank offers no counterbalance or protection whatsoever in return.",
    "The name actively works against your personal energy and daily momentum every time it is used, with no supportive energy anywhere to offset this ongoing conflict.",
    "Correction is recommended to remove this daily friction and replace it with a name that genuinely supports your core birth energy going forward from this point.",
  ],
  "E-E": [
    "Your first name directly conflicts with both your Mulank and Bhagyank, the most critical configuration in name numerology, with no supportive anchor present anywhere in it.",
    "Every time your name is used, it activates a vibration that creates friction at your core, accumulating steadily as inner tension and recurring life obstacles daily.",
    "Immediate correction is essential to stop the daily reinforcement of this conflicting energy across both of your core numbers before it compounds even further over time.",
  ],
};

export const LOSHU_OVERAMP_FIRST_NAME_BLOCK: [string, string, string] = [
  "Your first name vibrates on a number whose governing planet already appears multiple times in your date of birth, making it a dominant energy in your chart.",
  "When the same planetary energy is already in excess and the name also vibrates on that number, the planet becomes over-amplified, creating its own set of challenges.",
  "A different Friendly number for the first name would introduce better overall planetary balance rather than further intensifying what is already strong in your existing chart.",
];

// ---------------------------------------------------------------------------
// PART 2 — FULL NAME COMBINATIONS
// ---------------------------------------------------------------------------
export const FULL_NAME_BLOCKS: Record<FirstFullCombo, [string, string, string]> = {
  "F-F": [
    "Your full name is in complete harmony with both your Mulank and Bhagyank, creating a unified, supportive resonance at the most important level of your entire chart.",
    "Since the full name governs your long-term career, finances, relationships, and life direction, this alignment ensures these key important areas receive consistent, active vibrational support daily.",
    "This is the ideal full name configuration, working in your favour at every level, supporting both who you are and where you are truly meant to go.",
  ],
  "F-N": [
    "Your full name supports your Mulank but remains fully neutral with your Bhagyank, the destiny number that governs long-term life outcomes and your overall career direction.",
    "A neutral Bhagyank relationship means your full name is not actively opening the doors your destiny is designed to open, though personal support still exists here.",
    "Upgrading the full name to one Friendly to both numbers would unlock a stronger, more complete long-term alignment across every important area of your life ahead.",
  ],
  "F-E": [
    "Your full name appears to support the Mulank, but it directly conflicts with your Bhagyank, and the Enemy relationship remains the dominant factor at the destiny level.",
    "Since the full name governs your life path and long-term outcomes, this conflict with the Bhagyank is a genuinely serious misalignment affecting your major life achievements overall.",
    "Correction is necessary, as a full name in conflict with your destiny number, even partially, actively works against your long-term potential and your steady overall progress.",
  ],
  "N-F": [
    "Your full name supports your Bhagyank, so destiny-level energy flows more naturally, and long-term opportunities arrive more consistently than with a neutral or conflicting full name.",
    "The neutral Mulank relationship means your personal energy is not actively amplified by the name, though the most consequential layer of your entire chart remains well-supported.",
    "The overall configuration is positive and stable. Upgrading to a name Friendly to both numbers would bring complete balance across every level of your entire chart.",
  ],
  "N-N": [
    "Your full name is silent at the most consequential level of your chart, providing no active energy or amplification to either your Mulank or your Bhagyank.",
    "Career, finances, long-term relationships, and life path are all navigated without the real benefit of a name energetically working alongside you toward your intended life goals.",
    "Upgrading to a Friendly full name would meaningfully improve the quality and overall consistency of long-term outcomes across the most important areas of your entire life.",
  ],
  "N-E": [
    "Your full name is in direct conflict with your Bhagyank, the destiny number governing your most important outcomes, while the neutral Mulank offers no support here.",
    "This is the most consequential form of misalignment in name numerology, so career direction, financial growth, and major life achievements are all consistently hindered by it.",
    "Correction is strongly recommended. The full name must be aligned with your Bhagyank to unlock the natural flow of your life path and long-term destiny ahead.",
  ],
  "E-F": [
    "Your full name appears to align with your Bhagyank, but it is in direct conflict with your Mulank, and the Enemy relationship remains the dominant factor here.",
    "The conflict with the Mulank creates persistent inner friction, a disconnect between your personal identity and the broader energy the full name carries over time daily.",
    "Correction to a full name that is Friendly to both Mulank and Bhagyank is necessary for complete vibrational harmony at the destiny level going forward from here.",
  ],
  "E-N": [
    "Your full name is in direct conflict with your Mulank, while the neutral Bhagyank relationship provides no counterbalance, so the name creates resistance without any offset here.",
    "The result is a persistent drag on momentum, a disproportionate amount of effort relative to results, and inconsistency in personal and professional outcomes over time overall.",
    "Correction is recommended to remove this ongoing resistance and replace it with a full name that actively supports your core birth energy instead of working against it.",
  ],
  "E-E": [
    "Your full name is in direct conflict with both your Mulank and Bhagyank, a complete dual-layer misalignment at the most important level of your entire numerological chart.",
    "Career obstacles, financial inconsistency, relationship friction, and a recurring gap between effort and outcome are the natural, consistent consequences of this exact configuration over time overall.",
    "Immediate correction is essential. Every day the name remains unchanged, the conflicting vibration is reinforced, progressively limiting access to your chart's true potential going forward.",
  ],
};

export const LOSHU_OVERAMP_FULL_NAME_BLOCK: [string, string, string] = [
  "Your full name vibrates on a number whose governing planet is already appearing multiple times in your date of birth, over-amplifying that planetary energy even further.",
  "This compounded imbalance at the destiny level creates a self-reinforcing cycle that affects the quality of long-term outcomes the longer it remains unchanged going forward.",
  "A different Friendly number for the full name would introduce the complementary planetary energy needed for genuine balance, rather than intensifying an existing excess in the chart.",
];

// ---------------------------------------------------------------------------
// PART 3 — COMPOUND NUMBER
// ---------------------------------------------------------------------------
import type { CompoundTier } from "./compound-table";

export const COMPOUND_BLOCKS: Record<CompoundTier, [string, string, string]> = {
  excellent: [
    "Your name carries an Excellent Compound Number, one of the most auspicious vibrations in Chaldean Numerology, adding a powerful layer of continuous positive background energy daily.",
    "This compound does not simply avoid challenges; it actively enhances opportunities, recognition, success, and favorable outcomes across the most important areas of your entire life.",
    "When combined with a well-aligned Base Name Number, an Excellent Compound creates the strongest possible foundation, and no upgrade or correction is needed — the name already functions at its highest vibrational potential overall.",
  ],
  good: [
    "Your name carries a Good Compound Number, a stable and favorable vibration that provides a reliable secondary layer of positive energy to your overall existing name.",
    "It supports steady growth, consistent opportunities, and a generally smooth life experience, without introducing the hidden limitations or instability tied to weaker compound numbers overall today.",
    "Overall, this is a genuinely positive element in your numerological profile, and it can be confidently retained as is, contributing meaningfully to the overall strength and quality of your name as a complete whole.",
  ],
  // Client's doc calls this tier "Moderate" in the copy text (same tier as "Neutral" in the table).
  neutral: [
    "Your name carries a Moderate Compound Number, a vibration containing both strengths and limitations, creating a mixed background influence beneath the surface of the name itself.",
    "While the compound offers some positive qualities, it also creates an invisible ceiling that restricts the full potential of an otherwise well-aligned Base Name Number here.",
    "Upgrading to a stronger, more auspicious compound would remove this hidden limitation, allowing the name's full vibrational potential to express itself fully and clearly without any compromise.",
  ],
  conditional: [
    "Your name carries a Conditional Compound Number, a vibration that possesses genuine strengths but also comes with a specific area of caution requiring careful ongoing management.",
    "The positive and cautionary aspects of this compound coexist; if the associated vulnerability is ignored, it can gradually become a recurring, limiting pattern over time overall.",
    "Retaining this compound can still be considered when overall name alignment is strong, though upgrading to an unconditionally auspicious compound remains the generally stronger overall option.",
  ],
  // Client's doc calls this tier "Bad" in the copy text (same tier as "Avoid" in the table).
  avoid: [
    "Your name carries an Unfavorable Compound Number that introduces hidden challenges, karmic lessons, or recurring patterns of instability beneath the visible surface of the name itself.",
    "This background vibration continues to influence experiences, relationships, decision-making, and long-term outcomes, even when other visible aspects of the name appear outwardly favorable to you now.",
    "Even if the Base Name Number is friendly and well-aligned, an unfavorable compound acts as a hidden limiting factor that active, timely correction can fully resolve.",
  ],
};
