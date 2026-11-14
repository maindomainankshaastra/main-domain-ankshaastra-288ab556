import { buildStandardLoShuGrid } from "@/lib/baby-reports/shared/loshu-grid";

/** Where each digit sits in the Lo Shu square (same layout as the Lo Shu page of the report). */
const LAYOUT = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];
const WORD = ["", "once", "twice", "three times", "four times", "five times", "six times", "seven times", "eight times", "nine times"];

/** The baby's Lo Shu grid, worked out from the date of birth ("yyyy-mm-dd"). Shows nothing until the date is valid. */
export function LoShuGrid({ dob }: { dob: string }) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return null;
  const grid = buildStandardLoShuGrid(Number(m[3]), Number(m[2]), Number(m[1]));
  const counts = grid.counts as Record<number, number>;
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const present = digits.filter((d) => (counts[d] ?? 0) > 0);
  const missing = digits.filter((d) => !counts[d]);
  const repeated = present.filter((d) => counts[d] > 1).map((d) => `${d} (${WORD[Math.min(counts[d], 9)]})`);

  return (
    <div className="rounded-md border p-3">
      <div className="mb-2 text-sm font-medium">Lo Shu grid</div>
      <div className="grid grid-cols-3 gap-1">
        {LAYOUT.flat().map((d) => {
          const n = counts[d] ?? 0;
          return n > 0 ? (
            <div key={d} className="flex aspect-square items-center justify-center rounded bg-[#FFA500] text-lg font-bold text-white">
              {String(d).repeat(n)}
            </div>
          ) : (
            <div key={d} className="flex aspect-square flex-col items-center justify-center rounded border text-xs font-semibold text-[#FFA500]">
              <span className="text-base">{d}</span>
              <span className="font-normal">Missing</span>
            </div>
          );
        })}
      </div>
      <dl className="mt-3 space-y-1 text-xs">
        <div><dt className="inline font-medium">Present: </dt><dd className="inline text-muted-foreground">{present.join(", ") || "-"}</dd></div>
        <div><dt className="inline font-medium">Repeated: </dt><dd className="inline text-muted-foreground">{repeated.join(", ") || "None"}</dd></div>
        <div><dt className="inline font-medium">Missing: </dt><dd className="inline text-muted-foreground">{missing.join(", ") || "None"}</dd></div>
      </dl>
    </div>
  );
}
