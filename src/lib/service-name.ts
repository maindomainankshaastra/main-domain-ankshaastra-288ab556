/**
 * Slug jaisa service naam (name-check, perfect-baby-name-report)
 * ko sahi dikhne wale naam me badalta hai.
 * Jo naam pehle se sahi hai (jaise "Name Check"), usko waise hi chhod deta hai.
 */
export function formatServiceName(value?: string | null): string {
  const raw = (value || "").trim();
  if (!raw) return "";

  // Agar space ya capital letter hai to naam pehle se sahi hai
  if (/\s/.test(raw) || /[A-Z]/.test(raw)) return raw;

  // Slug hai: - ya _ hatao aur har word ka pehla akshar capital karo
  return raw
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
