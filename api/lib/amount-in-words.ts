const ones = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigits(n: number): string {
  if (n < 20) return ones[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return `${tens[t]}${o ? ` ${ones[o]}` : ''}`.trim();
}

function threeDigits(n: number): string {
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  if (!hundred) return twoDigits(rest);
  return `${ones[hundred]} Hundred${rest ? ` ${twoDigits(rest)}` : ''}`.trim();
}

function integerToWords(n: number): string {
  if (n === 0) return 'Zero';

  const parts: string[] = [];

  const crore = Math.floor(n / 10000000);
  if (crore) {
    parts.push(`${threeDigits(crore)} Crore`);
    n %= 10000000;
  }

  const lakh = Math.floor(n / 100000);
  if (lakh) {
    parts.push(`${threeDigits(lakh)} Lakh`);
    n %= 100000;
  }

  const thousand = Math.floor(n / 1000);
  if (thousand) {
    parts.push(`${threeDigits(thousand)} Thousand`);
    n %= 1000;
  }

  if (n) parts.push(threeDigits(n));

  return parts.join(', ');
}

/** Convert INR amount to invoice words (e.g. "INR Four Thousand... Rupees Only"). */
export function amountInWordsInr(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const rupees = Math.floor(rounded);
  const paise = Math.round((rounded - rupees) * 100);

  let words = `INR ${integerToWords(rupees)} Rupee${rupees === 1 ? '' : 's'}`;
  if (paise) {
    words += ` and ${integerToWords(paise)} Paise`;
  }
  return `${words} Only.`;
}
