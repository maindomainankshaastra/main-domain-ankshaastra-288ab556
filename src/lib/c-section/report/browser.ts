/** Browser wiring: fetches the fonts and images from /public and embeds the real fonts with fontkit. */
import { STATIC_PAGE_COUNT } from "./static-pages.ts";
import fontkit from "@pdf-lib/fontkit";
import { generateCSectionReport, type ReportInput } from "./generator.ts";

const ASSET_BASE = "/c-section-assets";
const STATIC_BASE = "/c-section-static";
const FONT_BASE = "/name-check-assets/fonts";

async function fetchBytes(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url} (${res.status})`);
  return new Uint8Array(await res.arrayBuffer());
}

export function generateCSectionReportInBrowser(input: ReportInput): Promise<Uint8Array> {
  return generateCSectionReport(input, {
    loadBytes: (file) => fetchBytes(file.startsWith("static/") ? `${STATIC_BASE}/${file.slice(7)}?v=${STATIC_PAGE_COUNT}` : `${ASSET_BASE}/${file}`),
    async makeFonts(doc) {
      doc.registerFontkit(fontkit);
      const [heading, body, bold, serif] = await Promise.all([
        fetchBytes(`${FONT_BASE}/Cinzel-Bold.ttf`),
        fetchBytes(`${FONT_BASE}/Quicksand-Regular.ttf`),
        fetchBytes(`${FONT_BASE}/Quicksand-Bold.ttf`),
        fetchBytes(`${FONT_BASE}/Cardo-Regular.ttf`),
      ]);
      return {
        heading: await doc.embedFont(heading, { subset: true }),
        body: await doc.embedFont(body, { subset: true }),
        bold: await doc.embedFont(bold, { subset: true }),
        serif: await doc.embedFont(serif, { subset: true }),
      };
    },
  });
}
