/**
 * NAME FINDER LOGIC ENGINE (client doc: Name_Finder_Logic_Engine.docx)
 * Pure functions only - no UI, no network. Used by the Swar Calculator (Step 3) and the
 * "Numerologically Aligned Baby Name" report.
 *
 *  - Kua number (gender based)
 *  - Lucky-number pool (friendly to every core number; neutral/enemy status overrides friend)
 *  - Step 5: surname block (reverse calc)
 *  - Step 6: combination table  (first-name number n + surname = full-name total T)
 */

import { FRIENDSHIP_TABLE, getRelation, type Relation } from "@/lib/name-check/friendship-table";
import { chaldeanRawSum, RESTRICTED_NUMBERS } from "@/lib/name-check/numerology";
import { getBhagyank, getMulank, reduceToSingleDigit } from "@/lib/name-check/lo-shu";

export type Gender = "boy" | "girl";

// ---------------------------------------------------------------- Kua

/** Kua Number: birth-year digits -> single digit -> gender formula -> single digit; 5 => 2 (male) / 8 (female). */
export function kuaNumber(year: number, gender: Gender): number {
  const d = reduceToSingleDigit(String(year).split("").reduce((a, c) => a + Number(c), 0));
  const raw = gender === "boy" ? 11 - d : d + 4;
  const kua = reduceToSingleDigit(raw);
  if (kua === 5) return gender === "boy" ? 2 : 8;
  return kua;
}

// ---------------------------------------------------------------- Lucky numbers

/**
 * Lucky pool: a number stays only if it is FRIENDLY to every core number.
 * Neutral or enemy to ANY core number removes it (conflict rule).
 */
export function luckyPool(coreNumbers: number[]): number[] {
  const pool: number[] = [];
  for (let n = 1; n <= 9; n++) {
    if (coreNumbers.every((c) => getRelation(c, n) === "friendly")) pool.push(n);
  }
  return pool;
}

// ---------------------------------------------------------------- Step 5: surname block

export interface SurnameBlock {
  /** Text that was added up: last name (+ middle name when flagged "not father/husband"). */
  text: string;
  /** Un-reduced Chaldean total, e.g. 16. */
  total: number;
  /** Single digit, e.g. 7. */
  number: number;
  /** "16/7" or "7" when the total is already a single digit. */
  display: string;
}

export function surnameBlock(lastName: string, middleName = "", middleIsNotFatherHusband = false): SurnameBlock | null {
  const parts = [middleIsNotFatherHusband ? middleName : "", lastName]
    .map((s) => s.replace(/[^A-Za-z ]/g, "").trim())
    .filter(Boolean);
  const text = parts.join(" ");
  if (!text) return null;
  const total = chaldeanRawSum(text);
  const number = reduceToSingleDigit(total);
  return { text, total, number, display: total > 9 ? `${total}/${number}` : String(number) };
}

// ---------------------------------------------------------------- Step 6: combination table

export type ComboMark = "cross" | "circle" | "tick";

export interface ComboRow {
  /** First-name number n (1-9). */
  n: number;
  /** Surname number added. */
  surname: number;
  /** Full-name total T = n + surname, reduced to one digit. */
  total: number;
  mark: ComboMark;
  /** Best available option (first AND full name on 5/6, not crossed). */
  star: boolean;
  reason: string;
}

const REL_WORD: Record<Relation, string> = { friendly: "Friendly", neutral: "Neutral", enemy: "Enemy" };

/**
 * Marking rule (worst status wins):
 *  cross  - n or T is 4/8/9, or n/T is Enemy to Mulank or Bhagyank
 *  circle - no cross, but n or T is Neutral to Mulank or Bhagyank
 *  tick   - everything Friendly (or same number)
 *  star   - not crossed, and first name and full name both on 5/6
 */
export function combinationTable(mulank: number, bhagyank: number, surnameNumber: number): ComboRow[] {
  const rows: ComboRow[] = [];
  for (let n = 1; n <= 9; n++) {
    const total = reduceToSingleDigit(n + surnameNumber);
    const base = { n, surname: surnameNumber, total };

    // 1) restricted numbers (Rahu / Saturn / Mars)
    const restricted =
      RESTRICTED_NUMBERS[total] !== undefined
        ? `Full name number ${total} is on number ${total} (${RESTRICTED_NUMBERS[total]})`
        : RESTRICTED_NUMBERS[n] !== undefined
          ? `First name number ${n} is on number ${n} (${RESTRICTED_NUMBERS[n]})`
          : null;
    // doc worked example reports the first name's restricted number first when both are restricted
    const restrictedReason =
      RESTRICTED_NUMBERS[n] !== undefined && RESTRICTED_NUMBERS[total] === undefined
        ? `First name number ${n} is on number ${n} (${RESTRICTED_NUMBERS[n]})`
        : restricted;
    if (restrictedReason) {
      rows.push({ ...base, mark: "cross", star: false, reason: restrictedReason });
      continue;
    }

    // 2) enemy to Mulank / Bhagyank
    const checks: { who: string; num: number; core: string; coreNum: number }[] = [
      { who: "First name", num: n, core: "Mulank", coreNum: mulank },
      { who: "First name", num: n, core: "Bhagyank", coreNum: bhagyank },
      { who: "Full name", num: total, core: "Mulank", coreNum: mulank },
      { who: "Full name", num: total, core: "Bhagyank", coreNum: bhagyank },
    ];
    const enemy = checks.find((c) => getRelation(c.coreNum, c.num) === "enemy");
    if (enemy) {
      rows.push({ ...base, mark: "cross", star: false, reason: `${enemy.who} number ${enemy.num} is Enemy to ${enemy.core} ${enemy.coreNum}` });
      continue;
    }

    // 3) neutral -> circle
    const neutral = checks.find((c) => getRelation(c.coreNum, c.num) === "neutral");
    if (neutral) {
      rows.push({
        ...base, mark: "circle", star: false,
        reason: `${neutral.who} number ${neutral.num} is ${REL_WORD.neutral} to ${neutral.core} ${neutral.coreNum}`,
      });
      continue;
    }

    // 4) all friendly
    const star = [5, 6].includes(n) && [5, 6].includes(total);
    rows.push({
      ...base, mark: "tick", star,
      reason: star ? "Top combination: first and full name both on 5/6, all Friendly" : "All Friendly to Mulank and Bhagyank",
    });
  }
  return rows;
}

/** First-name numbers worth aiming for: every row that is not crossed, best (star, then tick, then circle) first. */
export function eligibleFirstNameNumbers(rows: ComboRow[]): number[] {
  const score = (r: ComboRow) => (r.star ? 0 : r.mark === "tick" ? 1 : 2);
  return rows.filter((r) => r.mark !== "cross").sort((a, b) => score(a) - score(b) || a.n - b.n).map((r) => r.n);
}

// ---------------------------------------------------------------- one call for a DOB

export interface NameFinderProfile {
  mulank: number;
  bhagyank: number;
  kua: number;
  luckyPool: number[];
  surname: SurnameBlock | null;
  table: ComboRow[] | null;
  /** n values the generator should target (from the table when a surname is given). */
  targets: number[];
}

export function buildNameFinderProfile(
  dob: string,
  gender: Gender,
  lastName = "",
  middleName = "",
  middleIsNotFatherHusband = false,
): NameFinderProfile | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return null;
  const year = Number(m[1]), month = Number(m[2]), day = Number(m[3]);
  const mulank = getMulank(day);
  const bhagyank = getBhagyank(day, month, year);
  const pool = luckyPool([mulank, bhagyank]);
  const surname = surnameBlock(lastName, middleName, middleIsNotFatherHusband);
  const table = surname ? combinationTable(mulank, bhagyank, surname.number) : null;
  // No surname yet: aim for the lucky pool without the restricted 4/8/9.
  const targets = table ? eligibleFirstNameNumbers(table) : pool.filter((n) => ![4, 8, 9].includes(n));
  return { mulank, bhagyank, kua: kuaNumber(year, gender), luckyPool: pool, surname, table, targets };
}

export { FRIENDSHIP_TABLE };
