// const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// export function ordinal(n: number): string {
//   const s = ["th", "st", "nd", "rd"];
//   const v = n % 100;
//   return n + (s[(v - 20) % 10] || s[v] || s[0]);
// }

// /** "2026-10-14" -> "14th October, 2026" */
// export function formatDob(dob: string): string {
//   const [y, m, d] = dob.split("-").map(Number);
//   return `${ordinal(d)} ${MONTHS[m - 1]}, ${y}`;
// }

// /** "12:20" -> "12:20 PM" */
// export function formatTime12(time: string): string {
//   const [h, m] = time.split(":").map(Number);
//   const ampm = h >= 12 ? "PM" : "AM";
//   const h12 = h % 12 === 0 ? 12 : h % 12;
//   return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`.replace(/^0/, "");
// }

// /** Short text that goes with the image. */
// export function buildImageCaption(): string {
//   return [
//     "*Namaste,*🙏",
//     "",
//     "Kindly have a quick look at the birth details. If the Date of Birth, Time, and Birth Place are correct, then the following are the recommended swars/first alphabet.",
//     "",
//     "Please let us know if you’d like numerologically aligned names with these alphabets only or if you have any specific name preference. *Once confirmed, will share the name options.*",
//     "",
//     "*Warm Regards,*",
//     "*Ankshaastra – Empower Your Name*",
//   ].join("\n");
// }

// export interface DetailInput {
//   dob: string;
//   place: string;
//   time: string;
//   nakshatra: string;
//   pada: number;
//   swar: string; // already joined, e.g. "Nee, Ni, N"
//   alternatives: string; // e.g. "H, E, X"
// }

// /**
//  * Step 1 message - exactly the text the numerologist sends by hand (this is also the caption that goes
//  * with the Swar image). `alternatives` is kept in the input for the image only; it is not part of the text.
//  */
// export function buildDetailMessage(i: DetailInput): string {
//   return [
//     "*Namaste,* 🙏🏻",
//     "",
//     "Kindly have a quick look at the birth details below. If the Date of Birth, Time, and Birth Place are correct, then the following are the _Recommended Swar/ Name Initials:_",
//     "",
//     `🗓 *DOB:* ${formatDob(i.dob)}`,
//     `📍 *Place:* ${i.place}`,
//     `⏰ *Time:* ${formatTime12(i.time)}`,
//     `🌙 *Nakshatra:* ${i.nakshatra}`,
//     `🔢 *Pada:* ${i.pada}`,
//     "",
//     `🪷 *Name Initials / Swar:* ${i.swar}`,
//     "",
//     "Please let us know if you’d like numerologically aligned names with these alphabets only and if you have any specific name preference. Once confirmed, will share the name options.",
//     "",
//     "*Warm Regards,*",
//     "*Ankshaastra – Empower Your Name*",
//   ].join("\n");
// }

// export function whatsappLink(phone: string, text: string): string {
//   const digits = phone.replace(/\D/g, "");
//   const full = digits.length === 10 ? `91${digits}` : digits;
//   // Skin-tone modifiers (the light shade on the folded-hands emoji) can break inside WhatsApp links,
//   // so they are dropped from the link text only. Copy-message keeps the original emoji.
//   const safe = text.replace(/[\u{1F3FB}-\u{1F3FF}]/gu, "");
//   const q = `text=${encodeURIComponent(safe)}`;
//   const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
//   if (isMobile) return `https://wa.me/${full}?${q}`;
//   // Desktop: open WhatsApp Web directly (wa.me shows an extra "Open app / Continue to WhatsApp Web" page).
//   return `https://web.whatsapp.com/send?${full ? `phone=${full}&` : ""}${q}`;
// }

// /**
//  * WhatsApp DESKTOP APP deep link. The app keeps its own login, so the operator never has to scan the QR code
//  * again (WhatsApp Web asks for a fresh scan whenever its browser session is cleared or opened in a new profile).
//  */
// export function whatsappAppLink(phone: string, text: string): string {
//   const digits = phone.replace(/\D/g, "");
//   const full = digits.length === 10 ? `91${digits}` : digits;
//   const safe = text.replace(/[\u{1F3FB}-\u{1F3FF}]/gu, "");
//   return `whatsapp://send?${full ? `phone=${full}&` : ""}text=${encodeURIComponent(safe)}`;
// }

// export type WhatsAppMode = "web" | "app";
// const WA_MODE_KEY = "ankshaastra_wa_mode";

// export function getWhatsAppMode(): WhatsAppMode {
//   try { return localStorage.getItem(WA_MODE_KEY) === "app" ? "app" : "web"; } catch { return "web"; }
// }
// export function setWhatsAppMode(mode: WhatsAppMode): void {
//   try { localStorage.setItem(WA_MODE_KEY, mode); } catch { /* private mode: keep default */ }
// }

// /**
//  * One place that opens WhatsApp for every step. Web mode always reuses the SAME browser tab (named window)
//  * instead of opening a new tab each time, so WhatsApp Web is not reloaded / re-linked on every send.
//  */
// /** Longest WhatsApp link that opens reliably. Longer messages are copied to the clipboard instead. */
// const MAX_LINK_LENGTH = 1900;

// export type WhatsAppResult = "opened" | "copied" | "blocked";

// async function copyQuietly(text: string): Promise<void> {
//   try { await navigator.clipboard.writeText(text); } catch { /* clipboard not allowed: nothing more to do */ }
// }

// /**
//  * One place that opens WhatsApp for every step. Web mode always reuses the SAME browser tab (named window)
//  * instead of opening a new tab each time, so WhatsApp Web is not reloaded / re-linked on every send.
//  *
//  * Returns what happened, so the caller can tell the operator:
//  *  - "opened":  the chat opened with the message typed in.
//  *  - "copied":  the message is too long for a link (long names lists), so it was copied to the clipboard and the
//  *               chat was opened empty. The operator presses Ctrl+V and Send.
//  *  - "blocked": the browser blocked the new tab. The message was copied; allow pop-ups for this site.
//  */
// export function openWhatsApp(phone: string, text: string, mode: WhatsAppMode = getWhatsAppMode()): WhatsAppResult {
//   const open = (t: string): boolean => {
//     if (mode === "app") { window.location.href = whatsappAppLink(phone, t); return true; }
//     return !!window.open(whatsappLink(phone, t), "ankshaastra_whatsapp");
//   };
//   const link = mode === "app" ? whatsappAppLink(phone, text) : whatsappLink(phone, text);
//   if (link.length > MAX_LINK_LENGTH) {
//     void copyQuietly(text);
//     return open("") ? "copied" : "blocked";
//   }
//   if (open(text)) return "opened";
//   void copyQuietly(text);
//   return "blocked";
// }


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
    "*Namaste,*🙏",
    "",
    "Kindly have a quick look at the birth details. If the Date of Birth, Time, and Birth Place are correct, then the following are the recommended swars/first alphabet.",
    "",
    "Please let us know if you’d like numerologically aligned names with these alphabets only or if you have any specific name preference. *Once confirmed, will share the name options.*",
    "",
    "*Warm Regards,*",
    "*Ankshaastra – Empower Your Name*",
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

/**
 * Step 1 message - exactly the text the numerologist sends by hand (this is also the caption that goes
 * with the Swar image). `alternatives` is kept in the input for the image only; it is not part of the text.
 */
export function buildDetailMessage(i: DetailInput): string {
  return [
    "*Namaste,* 🙏🏻",
    "",
    "Kindly have a quick look at the birth details below. If the Date of Birth, Time, and Birth Place are correct, then the following are the _Recommended Swar/ Name Initials:_",
    "",
    `🗓 *DOB:* ${formatDob(i.dob)}`,
    `📍 *Place:* ${i.place}`,
    `⏰ *Time:* ${formatTime12(i.time)}`,
    `🌙 *Nakshatra:* ${i.nakshatra}`,
    `🔢 *Pada:* ${i.pada}`,
    "",
    `🪷 *Name Initials / Swar:* ${i.swar}`,
    "",
    "Please let us know if you’d like numerologically aligned names with these alphabets only and if you have any specific name preference. Once confirmed, will share the name options.",
    "",
    "*Warm Regards,*",
    "*Ankshaastra – Empower Your Name*",
  ].join("\n");
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

/**
 * WhatsApp DESKTOP APP deep link. The app keeps its own login, so the operator never has to scan the QR code
 * again (WhatsApp Web asks for a fresh scan whenever its browser session is cleared or opened in a new profile).
 */
export function whatsappAppLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, "");
  const full = digits.length === 10 ? `91${digits}` : digits;
  const safe = text.replace(/[\u{1F3FB}-\u{1F3FF}]/gu, "");
  return `whatsapp://send?${full ? `phone=${full}&` : ""}text=${encodeURIComponent(safe)}`;
}

/** Link that opens the chat only, with no message in it (used when the message is too long for a link). */
export function whatsappChatLink(phone: string, mode: "web" | "app"): string {
  const digits = phone.replace(/\D/g, "");
  const full = digits.length === 10 ? `91${digits}` : digits;
  if (mode === "app") return full ? `whatsapp://send?phone=${full}` : "whatsapp://";
  const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) return `https://wa.me/${full}`;
  return full ? `https://web.whatsapp.com/send?phone=${full}` : "https://web.whatsapp.com/";
}

export type WhatsAppMode = "web" | "app";
const WA_MODE_KEY = "ankshaastra_wa_mode";

export function getWhatsAppMode(): WhatsAppMode {
  try { return localStorage.getItem(WA_MODE_KEY) === "app" ? "app" : "web"; } catch { return "web"; }
}
export function setWhatsAppMode(mode: WhatsAppMode): void {
  try { localStorage.setItem(WA_MODE_KEY, mode); } catch { /* private mode: keep default */ }
}

/**
 * One place that opens WhatsApp for every step. Web mode always reuses the SAME browser tab (named window)
 * instead of opening a new tab each time, so WhatsApp Web is not reloaded / re-linked on every send.
 */
/** Longest WhatsApp link that opens reliably. Longer messages are copied to the clipboard instead. */
const MAX_LINK_LENGTH = 1900;

export type WhatsAppResult = "opened" | "copied" | "blocked";

async function copyQuietly(text: string): Promise<void> {
  try { await navigator.clipboard.writeText(text); } catch { /* clipboard not allowed: nothing more to do */ }
}

/**
 * One place that opens WhatsApp for every step. Web mode always reuses the SAME browser tab (named window)
 * instead of opening a new tab each time, so WhatsApp Web is not reloaded / re-linked on every send.
 *
 * Returns what happened, so the caller can tell the operator:
 *  - "opened":  the chat opened with the message typed in.
 *  - "copied":  the message is too long for a link (long names lists), so it was copied to the clipboard and the
 *               chat was opened empty. The operator presses Ctrl+V and Send.
 *  - "blocked": the browser blocked the new tab. The message was copied; allow pop-ups for this site.
 */
export function openWhatsApp(phone: string, text: string, mode: WhatsAppMode = getWhatsAppMode()): WhatsAppResult {
  // t === null opens the chat only (no "text=" at all: an empty text= parameter made the desktop app ignore the link)
  const open = (t: string | null): boolean => {
    if (mode === "app") { window.location.href = t === null ? whatsappChatLink(phone, "app") : whatsappAppLink(phone, t); return true; }
    return !!window.open(t === null ? whatsappChatLink(phone, "web") : whatsappLink(phone, t), "ankshaastra_whatsapp");
  };
  const link = mode === "app" ? whatsappAppLink(phone, text) : whatsappLink(phone, text);
  if (link.length > MAX_LINK_LENGTH) {
    void copyQuietly(text);
    return open(null) ? "copied" : "blocked";
  }
  if (open(text)) return "opened";
  void copyQuietly(text);
  return "blocked";
}

/** "A, B, C" -> "A, B and C" (same wording the numerologist types by hand). Meanings that already use "and" stay as they are. */
export function tidyMeaning(m: string): string {
  const t = m.trim();
  const parts = t.split(",").map((x) => x.trim()).filter(Boolean);
  if (parts.length >= 3 && !/\band\b/i.test(t)) return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
  return t;
}

/** Step 3 message: every name of the report, numbered, in the exact layout the numerologist sends. */
export function buildNamesMessage(names: { name: string; meaning: string }[]): string {
  return [
    "Namaskar,",
    "",
    "Please find numerologically curated names specifically designed for your child:",
    "",
    names.map((n, i) => `${i + 1}. *${n.name}* — ${tidyMeaning(n.meaning)}`).join("\n"),
    "",
    "Please share 4–5 names in priority list, basis which I will share the detailed analysis of these names.",
    "",
    "Regards,",
    "Ankshaastra-Empower Your Name",
  ].join("\n");
}
