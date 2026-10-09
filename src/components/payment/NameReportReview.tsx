import { Button } from "@/components/ui/button";
import { Check, Lock, Pencil } from "lucide-react";
import { nameReportOffers } from "@/data/nameReportOffers";

const labels: Record<string, string> = { firstName: "First Name", middleName: "Middle Name", lastName: "Last Name", email: "Email", whatsapp: "WhatsApp", currentPincode: "PIN Code", currentCity: "City", currentState: "State", pob: "Place of Birth", gender: "Gender", profession: "Profession", fatherName: "Father's Name", motherName: "Mother's Name", spouseName: "Spouse's Name", reason: "Reason for Name Correction", purchaserName: "Purchaser", middleIsFatherName: "Father's / Husband's Middle Name", lastNameChangeOk: "Last Name Change", relationFather: "With Father", relationMother: "With Mother", relationSpouse: "With Spouse", dob: "Date of Birth", tob: "Time of Birth" };

function rows(data: Record<string, unknown>, prefix = ""): Array<[string, string]> {
  return Object.entries(data).flatMap(([key, value]) => {
    if (!value || key === "pincode" || key.startsWith("customer")) return [];
    if (typeof value === "object") {
      const object = value as Record<string, unknown>;
      if (key === "dob") return [[`${prefix}Date of Birth`, [object.day, object.month, object.year].join(" / ")]];
      if (key === "tob") return [[`${prefix}Time of Birth`, `${object.hour}:${object.minute} ${object.meridiem}`]];
      return rows(object, `${key === "person1" ? "Person 1" : "Person 2"} — `);
    }
    return labels[key] ? [[`${prefix}${labels[key]}`, String(value)]] : [];
  });
}

export default function NameReportReview({ data, service, amount, processing, onEdit, onPay }: { data: Record<string, unknown>; service: string; amount: number; processing: boolean; onEdit: () => void; onPay: () => void }) {
  const offer = nameReportOffers.find(item => item.serviceTitle === service);
  return <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
    <div><div className="mb-4 flex items-center justify-between"><h3 className="font-display text-2xl font-bold text-report-ink">Review Your Details</h3><Button variant="ghost" onClick={onEdit}><Pencil className="h-4 w-4" />Edit</Button></div><dl className="name-package-card divide-y divide-border rounded-lg border border-border px-5"><div className="flex justify-between gap-4 py-4 text-sm"><dt className="name-package-muted">Package</dt><dd className="text-right font-semibold">{offer?.title || service}</dd></div>{rows(data).map(([label, value]) => <div key={label} className="grid grid-cols-[minmax(90px,1fr)_minmax(0,1.5fr)] gap-4 py-3 text-sm"><dt className="name-package-muted">{label}</dt><dd className="break-words text-right font-medium">{value}</dd></div>)}</dl></div>
    <aside className="name-package-card self-start rounded-lg border border-border p-5 lg:sticky lg:top-20"><h3 className="font-display text-2xl font-bold">Order Summary</h3><div className="mt-5 flex justify-between gap-4 text-sm"><span>{offer?.title || service}</span><span>₹{amount.toLocaleString("en-IN")}</span></div><div className="my-5 flex justify-between border-y border-border py-5 font-bold"><span>Total <small className="block text-xs font-normal name-package-muted">Incl. GST</small></span><span className="text-2xl text-report-gold">₹{amount.toLocaleString("en-IN")}</span></div><Button onClick={onPay} disabled={processing} className="h-12 w-full bg-report-gold text-report-gold-foreground hover:bg-report-gold/90">{processing ? "Processing…" : `Pay ₹${amount.toLocaleString("en-IN")}`}</Button><p className="mt-3 flex items-center justify-center gap-2 text-xs name-package-muted"><Lock className="h-3 w-3" />Secure payment via Razorpay</p><p className="mt-5 border-t border-border pt-4 text-sm name-package-muted">Delivery: {offer?.delivery}</p><h4 className="mt-5 text-sm font-semibold">What's Included</h4><ul className="mt-3 space-y-2 text-xs name-package-muted">{offer?.inclusions.map(item => <li key={item} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-report-saving" />{item}</li>)}</ul></aside>
  </div>;
}