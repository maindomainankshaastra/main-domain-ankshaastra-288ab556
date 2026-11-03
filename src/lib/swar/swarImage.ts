/**
 * Draws the "Recommended Swar / Name Initials" card (1600 x 1600) on a canvas.
 *
 * - public/swar-bg.jpg (or .png) = ART ONLY (night sky, moon, baby). NO text at all.
 * - public/swar-logo.png = optional Ankshaastra logo (transparent PNG), drawn at the top.
 * Title, panel, labels, Swar pill and all values are always drawn by code, so spelling is never wrong.
 * Without swar-bg.png a built-in dark-gold background is used.
 */
export const IMG_SIZE = 1600;
const SERIF = '"Playfair Display", "Times New Roman", Georgia, serif';
const CREAM = "#F8E7C8";
const GOLD = "#C9A25A";
const BG_SKY = "#04050a";
const BG_OFFSET_Y = 110; // px the background art is pushed down

export interface SwarImageData {
  dob: string;        // already formatted: "14th October, 2026"
  place: string;
  time: string;       // "12:20 PM"
  nakshatra: string;
  pada: string;
  swar: string;       // "Nee, Ni, N"
  alternatives: string; // "H, E, X" (may be empty)
}

function fit(ctx: CanvasRenderingContext2D, text: string, maxW: number, size: number, weight: string, min = 24) {
  let s = size;
  do {
    ctx.font = `${weight} ${s}px ${SERIF}`;
    if (ctx.measureText(text).width <= maxW) break;
    s -= 2;
  } while (s > min);
  return s;
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawFallbackArt(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, 0, IMG_SIZE);
  g.addColorStop(0, "#07070c"); g.addColorStop(0.7, "#14100a"); g.addColorStop(1, "#2a1d0c");
  ctx.fillStyle = g; ctx.fillRect(0, 0, IMG_SIZE, IMG_SIZE);
  const m = ctx.createRadialGradient(800, 1500, 40, 800, 1500, 420);
  m.addColorStop(0, "rgba(255,214,130,0.95)"); m.addColorStop(1, "rgba(255,214,130,0)");
  ctx.fillStyle = m; ctx.beginPath(); ctx.arc(800, 1500, 420, 0, Math.PI * 2); ctx.fill();
}

/** Everything that is text / frame: logo, title, detail panel, labels, Swar pill. Always drawn by code. */
function drawFrame(ctx: CanvasRenderingContext2D, logo?: CanvasImageSource | null) {
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  if (logo) {
    const w = (logo as HTMLImageElement).naturalWidth || 600, h = (logo as HTMLImageElement).naturalHeight || 120;
    const scale = Math.min(520 / w, 120 / h);
    ctx.drawImage(logo, 800 - (w * scale) / 2, 30, w * scale, h * scale);
  } else {
    ctx.fillStyle = "#fff"; ctx.font = `600 84px ${SERIF}`; ctx.fillText("ankshaastra", 800, 90);
    ctx.fillStyle = GOLD; ctx.font = `500 26px ${SERIF}`; ctx.fillText("E M P O W E R   Y O U R   N A M E", 800, 140);
  }
  ctx.fillStyle = CREAM; ctx.font = `bold 74px ${SERIF}`; ctx.fillText("Recommended Swar/ Name Initials", 800, 248);
  ctx.strokeStyle = GOLD; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(480, 305); ctx.lineTo(1120, 305); ctx.stroke();

  rr(ctx, 333, 347, 932, 366, 40); ctx.lineWidth = 3; ctx.stroke();
  ctx.textAlign = "left"; ctx.fillStyle = CREAM; ctx.font = `bold 40px ${SERIF}`;
  [["DOB:", 385], ["Place:", 457], ["Time:", 525], ["Nakshatra:", 595], ["Pada:", 666]].forEach(([l, y]) => ctx.fillText(l as string, 528, y as number));
  ctx.strokeStyle = "rgba(201,162,90,0.45)"; ctx.lineWidth = 1;
  [421, 491, 560, 630].forEach((y) => { ctx.beginPath(); ctx.moveTo(400, y); ctx.lineTo(1200, y); ctx.stroke(); });

  ctx.textAlign = "center"; ctx.fillStyle = CREAM; ctx.font = `bold 54px ${SERIF}`; ctx.fillText("Recommended Swar", 800, 772);
  rr(ctx, 428, 815, 744, 150, 75);
  ctx.fillStyle = "#F6DDB6"; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 4; ctx.stroke();
}

export function renderSwarImage(
  canvas: HTMLCanvasElement,
  d: SwarImageData,
  bg?: CanvasImageSource | null,
  logo?: CanvasImageSource | null,
) {
  canvas.width = IMG_SIZE; canvas.height = IMG_SIZE;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, IMG_SIZE, IMG_SIZE);
  if (bg) {
    // Shift the art down so the moon sits below the "Numerology Alternatives" line,
    // and blend the top strip into the dark sky.
    ctx.fillStyle = BG_SKY; ctx.fillRect(0, 0, IMG_SIZE, IMG_SIZE);
    ctx.drawImage(bg, 0, BG_OFFSET_Y, IMG_SIZE, IMG_SIZE);
    const fade = ctx.createLinearGradient(0, BG_OFFSET_Y - 2, 0, BG_OFFSET_Y + 170);
    fade.addColorStop(0, BG_SKY); fade.addColorStop(1, "rgba(4,5,10,0)");
    ctx.fillStyle = fade; ctx.fillRect(0, 0, IMG_SIZE, BG_OFFSET_Y + 170);
    ctx.fillStyle = BG_SKY; ctx.fillRect(0, 0, IMG_SIZE, BG_OFFSET_Y - 2);
    // soft dark band behind the title so zodiac icons don't clash with the text
    const band = ctx.createLinearGradient(0, 175, 0, 335);
    band.addColorStop(0, "rgba(4,5,10,0)"); band.addColorStop(0.3, "rgba(4,5,10,0.88)");
    band.addColorStop(0.7, "rgba(4,5,10,0.88)"); band.addColorStop(1, "rgba(4,5,10,0)");
    ctx.fillStyle = band; ctx.fillRect(0, 175, IMG_SIZE, 160);
  } else drawFallbackArt(ctx);
  drawFrame(ctx, logo);

  ctx.textBaseline = "middle";
  // detail rows (values start at x = 802, max width up to the panel edge)
  ctx.textAlign = "left"; ctx.fillStyle = CREAM;
  const rows: [string, number][] = [[d.dob, 385], [d.place, 457], [d.time, 525], [d.nakshatra, 595], [d.pada, 666]];
  for (const [text, y] of rows) {
    const size = fit(ctx, text, 400, 42, "normal", 22);
    ctx.font = `normal ${size}px ${SERIF}`;
    ctx.fillText(text, 802, y);
  }
  // swar text inside the pill
  ctx.textAlign = "center"; ctx.fillStyle = "#3B1A0B";
  const sz = fit(ctx, d.swar, 680, 112, "bold", 40);
  ctx.font = `bold ${sz}px ${SERIF}`;
  ctx.fillText(d.swar, 800, 890);
  // alternatives
  if (d.alternatives.trim()) {
    ctx.fillStyle = CREAM; ctx.font = `normal 50px ${SERIF}`;
    ctx.fillText("Numerology Alternatives", 800, 1027);
    const az = fit(ctx, d.alternatives, 900, 84, "bold", 36);
    ctx.font = `bold ${az}px ${SERIF}`;
    ctx.fillText(d.alternatives, 800, 1105);
  }
}

export function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
