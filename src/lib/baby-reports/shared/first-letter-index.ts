/**
 * FIRST LETTER SIGNIFICANCE — merged index.
 * Combines first-letter-a-i.ts + first-letter-j-r.ts + first-letter-s-z.ts
 * into a single A-Z lookup. Import THIS file everywhere else in the report
 * engine — don't import the individual batch files directly.
 */

import { LETTER_BLOCKS as A_I, type LetterBlock } from "./first-letter-a-i";
import { LETTER_BLOCKS_J_R as J_R } from "./first-letter-j-r";
import { LETTER_BLOCKS_S_Z as S_Z } from "./first-letter-s-z";

export type { LetterBlock };

export const LETTER_BLOCKS: Record<string, LetterBlock> = {
  ...A_I,
  ...J_R,
  ...S_Z,
};

/** Look up the significance block for a name's first letter (case-insensitive). */
export function getLetterBlock(firstLetter: string): LetterBlock | undefined {
  return LETTER_BLOCKS[firstLetter.toUpperCase()];
}
