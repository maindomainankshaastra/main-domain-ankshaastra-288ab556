import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BABY_NAME_PREFERENCE_OPTIONS, normaliseAlphabet, type BabyNamePreference, type BabyReportFormValues } from "@/lib/baby-reports/perfect-baby-name/form";

/** The same fields as the Perfect Baby Name / Complete Baby Blueprint "Create report" form (status is always draft here). */
export function BabyReportForm({ values, onChange }: {
  values: BabyReportFormValues;
  onChange: (v: BabyReportFormValues) => void;
}) {
  const set = <K extends keyof BabyReportFormValues>(key: K, value: BabyReportFormValues[K]) =>
    onChange({ ...values, [key]: value });
  const hasMiddle = values.middle_name.trim().length > 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="pbn_first_name">First Name</Label>
        <Input id="pbn_first_name" value={values.first_name} onChange={(e) => set("first_name", e.target.value)} placeholder="First name" />
      </div>
      <div>
        <Label htmlFor="pbn_middle_name">Middle Name</Label>
        <Input
          id="pbn_middle_name"
          value={values.middle_name}
          onChange={(e) => {
            const next = e.target.value;
            onChange({ ...values, middle_name: next, is_middle_name_father_husband: next.trim() ? values.is_middle_name_father_husband : false });
          }}
          placeholder="Middle name"
        />
      </div>
      {hasMiddle && (
        <div className="sm:col-span-2">
          <Label htmlFor="pbn_is_father">Is Middle Name Father's / Husband's Name?</Label>
          <Select value={values.is_middle_name_father_husband ? "yes" : "no"} onValueChange={(v) => set("is_middle_name_father_husband", v === "yes")}>
            <SelectTrigger id="pbn_is_father"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <Label htmlFor="pbn_last_name">Last Name</Label>
        <Input id="pbn_last_name" value={values.last_name} onChange={(e) => set("last_name", e.target.value)} placeholder="Last name" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="pbn_father_name">Father's Name</Label>
        <Input id="pbn_father_name" value={values.father_name} onChange={(e) => set("father_name", e.target.value)} placeholder="Father's name (shown on the Personal Information page)" />
      </div>
      <div>
        <Label htmlFor="pbn_gender">Gender</Label>
        <Select value={values.gender} onValueChange={(v) => set("gender", v)}>
          <SelectTrigger id="pbn_gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="pbn_email">Email</Label>
        <Input id="pbn_email" type="email" value={values.email} onChange={(e) => set("email", e.target.value)} placeholder="name@example.com" />
      </div>
      <div>
        <Label htmlFor="pbn_phone">WhatsApp Number</Label>
        <Input id="pbn_phone" value={values.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91..." />
      </div>
      <div>
        <Label htmlFor="pbn_dob">DOB</Label>
        <Input id="pbn_dob" type="date" value={values.dob} onChange={(e) => set("dob", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="pbn_first_alphabet">First Alphabet</Label>
        <Input
          id="pbn_first_alphabet"
          value={values.first_alphabet}
          maxLength={1}
          onChange={(e) => set("first_alphabet", normaliseAlphabet(e.target.value))}
          placeholder="A–Z"
          className="uppercase"
        />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="pbn_option1">Option 1: First Name + Middle &amp; Last Name</Label>
        <Input id="pbn_option1" value={values.option1_name} onChange={(e) => set("option1_name", e.target.value)} placeholder="One or more names separated by /  e.g. Navishaa / Naviisha / Sanvvii Mishra" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="pbn_option2">Option 2: First Name + Middle &amp; Last Name (type NA if none)</Label>
        <Input id="pbn_option2" value={values.option2_name} onChange={(e) => set("option2_name", e.target.value)} placeholder="e.g. Krisha Mishra — or NA (any starting letter; use / for multiple names)" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="pbn_nick_name">Nick Name (optional)</Label>
        <Input id="pbn_nick_name" value={values.nick_name} onChange={(e) => set("nick_name", e.target.value)} placeholder="e.g. Shanu — leave empty to skip the Nick Name page" />
        <p className="mt-1 text-xs text-muted-foreground">If filled, the report includes the Nick Name Recommendation page (page 22). If empty, that page is left out.</p>
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="pbn_preference">Preference</Label>
        <Select value={values.preference} onValueChange={(v) => set("preference", v as BabyNamePreference)}>
          <SelectTrigger id="pbn_preference"><SelectValue placeholder="Select preference" /></SelectTrigger>
          <SelectContent>
            {BABY_NAME_PREFERENCE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
