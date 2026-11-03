const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** "2026-10-14" -> "14th October, 2026" */
export function formatDob(dob: string): string {
  const [y, m, d] = dob.split("-").map(Number);
  return `${ordinal(d)} ${MONTHS[m - 1]}, ${y}`;
}

/** "12:20" -> "12:20 PM" */
export function formatTime12(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`.replace(/^0/, "");
}

/** Short text that goes with the image. */
export function buildImageCaption(): string {
  return [
    "Namaste, 🙏🏻",
    "",
    "Kindly have a quick look at the birth details. If the Date of Birth, Time, and Birth Place are correct, then the following are the recommended swars/first alphabet.",
    "",
    "Please let us know if you’d like numerologically aligned names with these alphabets only or if you have any specific name preference. Once confirmed, will share the name options.",
    "",
    "Warm Regards,",
    "Ankshaastra – Empower Your Name",
  ].join("\n");
}

export interface DetailInput {
  dob: string;
  place: string;
  time: string;
  nakshatra: string;
  pada: number;
  swar: string; // already joined, e.g. "Nee, Ni, N"
  alternatives: string; // e.g. "H, E, X"
}

/** Full text version (no image) - same layout the numerologist writes by hand today. */
export function buildDetailMessage(i: DetailInput): string {
  const lines = [
    "*Namaste,* 🙏🏻",
    "",
    "Kindly have a quick look at the birth details below. If the Date of Birth, Time, and Birth Place are correct, then the following are the",
    "",
    "_Recommended Swar/ Name Initials:_",
    "",
    `🗓 *DOB:* ${formatDob(i.dob)}`,
    `📍 *Place:* ${i.place}`,
    `⏰ *Time:* ${formatTime12(i.time)}`,
    `🌙 *Nakshatra:* ${i.nakshatra}`,
    `➗ *Pada:* ${i.pada}`,
    "",
    `🪷 *Name Initials / Swar (Recommended):* ${i.swar}`,
    "",
  ];
  if (i.alternatives.trim()) lines.push(`🔢 *Alternatives for Swar (Numerology):* ${i.alternatives}`, "");
  lines.push(
    "Please let us know if you’d like numerologically aligned names with these alphabets only and if you have any specific name preference. Once confirmed, will share the name options.",
    "",
    "*Warm Regards,*",
    "*Ankshaastra – Empower Your Name*",
  );
  return lines.join("\n");
}

export function whatsappLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, "");
  const full = digits.length === 10 ? `91${digits}` : digits;
  // Skin-tone modifiers (the light shade on the folded-hands emoji) can break inside WhatsApp links,
  // so they are dropped from the link text only. Copy-message keeps the original emoji.
  const safe = text.replace(/[\u{1F3FB}-\u{1F3FF}]/gu, "");
  const q = `text=${encodeURIComponent(safe)}`;
  const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) return `https://wa.me/${full}?${q}`;
  // Desktop: open WhatsApp Web directly (wa.me shows an extra "Open app / Continue to WhatsApp Web" page).
  return `https://web.whatsapp.com/send?${full ? `phone=${full}&` : ""}${q}`;
}
