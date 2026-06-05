import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { ExtendedFormType } from "@/lib/payment-form-ext";

type Props = {
  formType: ExtendedFormType;
  serviceName?: string;
  control: any;
  DOBPicker: React.ComponentType<{ control: any; name?: string }>;
  TOBPicker: React.ComponentType<{ control: any; name?: string }>;
  GenderRadio: React.ComponentType<{ control: any; name?: string }>;
  WhatsappField: React.ComponentType<{ control: any }>;
  EmailField: React.ComponentType<{ control: any }>;
};

const ContactBlock = ({ EmailField, WhatsappField, control }: Pick<Props, "EmailField" | "WhatsappField" | "control">) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <EmailField control={control} />
    <WhatsappField control={control} />
  </div>
);

export function ExtendedPaymentFields({
  formType,
  serviceName,
  control,
  DOBPicker,
  TOBPicker,
  GenderRadio,
  WhatsappField,
  EmailField,
}: Props) {
  const FullName = (
    <FormField control={control} name="fullName" render={({ field }) => (
      <FormItem><FormLabel>Full Name *</FormLabel><FormControl><Input placeholder="Full name as per records" {...field} /></FormControl><FormMessage /></FormItem>
    )} />
  );

  if (formType === "lucky-vehicle") {
    return (
      <>
        {FullName}
        <DOBPicker control={control} />
        <GenderRadio control={control} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={control} name="vehicleType" render={({ field }) => (
            <FormItem><FormLabel>Preferred Vehicle Type *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                <SelectContent><SelectItem value="car">Car</SelectItem><SelectItem value="bike">Bike</SelectItem></SelectContent>
              </Select>
              <FormMessage /></FormItem>
          )} />
          <FormField control={control} name="vehicleUsage" render={({ field }) => (
            <FormItem><FormLabel>Vehicle Usage *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField control={control} name="purchaseAmount" render={({ field }) => (
            <FormItem><FormLabel>Tentative Purchase Amount (INR) *</FormLabel><FormControl><Input inputMode="numeric" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name="stateCode" render={({ field }) => (
            <FormItem><FormLabel>Vehicle State Code *</FormLabel><FormControl><Input placeholder="DL / UP / HR" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name="rtoCode" render={({ field }) => (
            <FormItem><FormLabel>RTO / District Code *</FormLabel><FormControl><Input placeholder="e.g. 81" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={control} name="numberOptions" render={({ field }) => (
          <FormItem><FormLabel>Preferred Vehicle Number Options</FormLabel><FormControl><Input placeholder="e.g. 8778" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <ContactBlock control={control} EmailField={EmailField} WhatsappField={WhatsappField} />
      </>
    );
  }

  if (formType === "lucky-vehicle-color") {
    return (
      <>
        {FullName}
        <DOBPicker control={control} />
        <GenderRadio control={control} />
        <FormField control={control} name="colorOptions" render={({ field }) => (
          <FormItem><FormLabel>Vehicle Color Options *</FormLabel><FormControl><Textarea className="min-h-[100px]" placeholder="Share your preferred colors" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <ContactBlock control={control} EmailField={EmailField} WhatsappField={WhatsappField} />
      </>
    );
  }

  if (formType === "lucky-vehicle-date") {
    return (
      <>
        {FullName}
        <DOBPicker control={control} />
        <GenderRadio control={control} />
        <FormField control={control} name="purchaseWindow" render={({ field }) => (
          <FormItem><FormLabel>Tentative Purchase Window *</FormLabel><FormControl><Textarea className="min-h-[100px]" placeholder="e.g. March 2026, next 2 weeks" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <ContactBlock control={control} EmailField={EmailField} WhatsappField={WhatsappField} />
      </>
    );
  }

  if (formType === "lucky-mobile") {
    return (
      <>
        {FullName}
        <DOBPicker control={control} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={control} name="currentCity" render={({ field }) => (
            <FormItem><FormLabel>Current City *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name="currentState" render={({ field }) => (
            <FormItem><FormLabel>Current State *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <GenderRadio control={control} />
        <FormField control={control} name="currentMobile" render={({ field }) => (
          <FormItem><FormLabel>Current Mobile Number (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={control} name="preferredSeries" render={({ field }) => (
            <FormItem><FormLabel>Preferred Series</FormLabel><FormControl><Input placeholder="98 / 99 / 88" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name="preferredDigits" render={({ field }) => (
            <FormItem><FormLabel>Preferred Digits *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={control} name="avoidDigits" render={({ field }) => (
          <FormItem><FormLabel>Numbers To Avoid (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={control} name="purpose" render={({ field }) => (
          <FormItem><FormLabel>Purpose *</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select purpose" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="professional">Professional Growth</SelectItem>
                <SelectItem value="financial">Financial Growth</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage /></FormItem>
        )} />
        <ContactBlock control={control} EmailField={EmailField} WhatsappField={WhatsappField} />
      </>
    );
  }

  if (formType === "lucky-flat") {
    return (
      <>
        {FullName}
        <DOBPicker control={control} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={control} name="currentCity" render={({ field }) => (
            <FormItem><FormLabel>Current City *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name="currentState" render={({ field }) => (
            <FormItem><FormLabel>Current State *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <GenderRadio control={control} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={control} name="towerBlock" render={({ field }) => (
            <FormItem><FormLabel>Tower / Wing / Block Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name="floorNumber" render={({ field }) => (
            <FormItem><FormLabel>Floor Number *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={control} name="propertyPurpose" render={({ field }) => (
          <FormItem><FormLabel>Purpose of Property *</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="self">Self Living</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="rental">Rental</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={control} name="facingDirection" render={({ field }) => (
            <FormItem><FormLabel>Facing Direction (if known)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name="connectedNumber" render={({ field }) => (
            <FormItem><FormLabel>Number You Feel Connected To</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <ContactBlock control={control} EmailField={EmailField} WhatsappField={WhatsappField} />
      </>
    );
  }

  if (formType === "relationship-analysis" || formType === "business-partner") {
    const PartnerBlock = ({ name, title }: { name: "person1" | "person2"; title: string }) => (
      <div className="rounded-xl border border-border p-5 bg-background/40 space-y-4">
        <h3 className="font-semibold">{title}</h3>
        <FormField control={control} name={`${name}.fullName`} render={({ field }) => (
          <FormItem><FormLabel>Full Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <GenderRadio control={control} name={`${name}.gender`} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DOBPicker control={control} name={`${name}.dob`} />
          <TOBPicker control={control} name={`${name}.tob`} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={control} name={`${name}.pincode`} render={({ field }) => (
            <FormItem><FormLabel>Birth PIN Code *</FormLabel><FormControl><Input maxLength={6} {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name={`${name}.pob`} render={({ field }) => (
            <FormItem><FormLabel>Place of Birth *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
      </div>
    );

    return (
      <>
        <PartnerBlock name="person1" title="Partner 1 Details" />
        <PartnerBlock name="person2" title="Partner 2 Details" />
        {formType === "relationship-analysis" ? (
          <FormField control={control} name="purpose" render={({ field }) => (
            <FormItem><FormLabel>Purpose *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="friendship">Friendship</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage /></FormItem>
          )} />
        ) : (
          <FormField control={control} name="industry" render={({ field }) => (
            <FormItem><FormLabel>Business Industry *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        )}
        <ContactBlock control={control} EmailField={EmailField} WhatsappField={WhatsappField} />
      </>
    );
  }

  if (formType === "business-brand") {
    const isBusinessMobile = serviceName?.toLowerCase().includes("business mobile") ?? false;
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["firstName", "middleName", "lastName"] as const).map((f) => (
            <FormField key={f} control={control} name={f} render={({ field }) => (
              <FormItem><FormLabel>{f === "firstName" ? "First Name *" : f === "middleName" ? "Middle Name" : "Last Name *"}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          ))}
        </div>
        <FormField control={control} name="middleIsFatherName" render={({ field }) => (
          <FormItem><FormLabel>Is your middle name your father's name? *</FormLabel>
            <FormControl>
              <RadioGroup value={field.value ?? ""} onValueChange={field.onChange} className="flex gap-6">
                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="mfn-yes" /><Label htmlFor="mfn-yes">Yes</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="mfn-no" /><Label htmlFor="mfn-no">No</Label></div>
              </RadioGroup>
            </FormControl>
            <FormMessage /></FormItem>
        )} />
        <GenderRadio control={control} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={control} name="brandName" render={({ field }) => (
            <FormItem><FormLabel>Business Brand Name *</FormLabel><FormControl><Input placeholder="Ankshaastra" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name="legalName" render={({ field }) => (
            <FormItem><FormLabel>Business Legal Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={control} name="tagline" render={({ field }) => (
          <FormItem><FormLabel>Business Tagline</FormLabel><FormControl><Input placeholder="Empower Your Name" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={control} name="industry" render={({ field }) => (
            <FormItem><FormLabel>Business Industry *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name="entityType" render={({ field }) => (
            <FormItem><FormLabel>Type of Entity *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="pvt_ltd">Pvt Ltd</SelectItem>
                  <SelectItem value="llp">LLP</SelectItem>
                  <SelectItem value="pub_ltd">Pub Ltd</SelectItem>
                  <SelectItem value="partnership">Partnership Deed</SelectItem>
                  <SelectItem value="other">Others</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={control} name="incorporationDate" render={({ field }) => (
            <FormItem><FormLabel>Date of Incorporation</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name="mobileNumber" render={({ field }) => (
            <FormItem><FormLabel>{isBusinessMobile ? "Business Mobile Number" : "Contact Number"}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={control} name="reason" render={({ field }) => (
          <FormItem><FormLabel>Reason for Analysis *</FormLabel><FormControl><Textarea className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <ContactBlock control={control} EmailField={EmailField} WhatsappField={WhatsappField} />
      </>
    );
  }

  if (formType === "business-dates") {
    return (
      <>
        {FullName}
        <DOBPicker control={control} />
        <GenderRadio control={control} />
        <FormField control={control} name="reason" render={({ field }) => (
          <FormItem><FormLabel>Reason / Explanation *</FormLabel><FormControl><Textarea className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <ContactBlock control={control} EmailField={EmailField} WhatsappField={WhatsappField} />
      </>
    );
  }

  if (formType === "business-property") {
    return (
      <>
        {FullName}
        <DOBPicker control={control} />
        <GenderRadio control={control} />
        <FormField control={control} name="numberOptions" render={({ field }) => (
          <FormItem><FormLabel>Shop / Office / Plot / Exhibition Number Options *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={control} name="floorNumber" render={({ field }) => (
            <FormItem><FormLabel>Floor Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name="businessType" render={({ field }) => (
            <FormItem><FormLabel>Business Type *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={control} name="facingDirection" render={({ field }) => (
          <FormItem><FormLabel>Facing Direction</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <ContactBlock control={control} EmailField={EmailField} WhatsappField={WhatsappField} />
      </>
    );
  }

  if (formType === "office-vastu") {
    return (
      <>
        {FullName}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DOBPicker control={control} />
          <TOBPicker control={control} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={control} name="pincode" render={({ field }) => (
            <FormItem><FormLabel>Birth PIN Code *</FormLabel><FormControl><Input maxLength={6} {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name="pob" render={({ field }) => (
            <FormItem><FormLabel>Place of Birth *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <GenderRadio control={control} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField control={control} name="officePincode" render={({ field }) => (
            <FormItem><FormLabel>Office Location Pincode *</FormLabel><FormControl><Input maxLength={6} {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name="officeCity" render={({ field }) => (
            <FormItem><FormLabel>Office City (Auto-Fetched) *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name="officeState" render={({ field }) => (
            <FormItem><FormLabel>Office State (Auto-Fetched) *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={control} name="layoutAvailable" render={({ field }) => (
          <FormItem><FormLabel>Office Layout Availability *</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="optional">Optional Upload</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={control} name="businessIndustry" render={({ field }) => (
            <FormItem><FormLabel>Business Industry *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name="companyLegalName" render={({ field }) => (
            <FormItem><FormLabel>Company Full Legal Name (as per PAN / GST / MSME / COI) *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <ContactBlock control={control} EmailField={EmailField} WhatsappField={WhatsappField} />
      </>
    );
  }

  return null;
}
