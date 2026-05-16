import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Shield, Check, MessageSquare, Phone, Video, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import {
  Form,
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
import CountryCodeSelect from "@/components/ui/CountryCodeSelect";
import { pricing } from "@/config/pricing";

// Consultation packages (only used when type= param is present)
const consultationPackages = {
  whatsapp: {
    name: "WhatsApp Notes",
    icon: MessageSquare,
    color: "from-green-500 to-green-600",
    options: [
      { id: "whatsapp-3", label: "3 Questions", price: pricing.whatsapp.q3 },
      { id: "whatsapp-6", label: "6 Questions", price: pricing.whatsapp.q6 },
      { id: "whatsapp-10", label: "10 Questions", price: pricing.whatsapp.q10 },
    ],
  },
  audio: {
    name: "1:1 Audio Call",
    icon: Phone,
    color: "from-primary to-accent",
    options: [
      { id: "audio-45", label: "45 Minutes", price: pricing.audioCall.min45 },
      { id: "audio-60", label: "60 Minutes", price: pricing.audioCall.min60 },
      { id: "audio-75", label: "75 Minutes", price: pricing.audioCall.min75 },
    ],
  },
  video: {
    name: "1:1 Video Call",
    icon: Video,
    color: "from-blue-500 to-purple-500",
    options: [
      { id: "video-45", label: "45 Minutes", price: pricing.videoCall.min45 },
      { id: "video-60", label: "60 Minutes", price: pricing.videoCall.min60 },
      { id: "video-75", label: "75 Minutes", price: pricing.videoCall.min75 },
    ],
  },
};

// ───── form types ─────
type FormType = "kundali" | "consultation" | "name-correction" | "name-check" | "default";

const inferFormType = (service: string | null, hasConsultationType: boolean): FormType => {
  if (hasConsultationType) return "consultation";
  if (!service) return "default";
  const s = service.toLowerCase();
  if (s.includes("name check")) return "name-check";
  if (s.includes("name correction")) return "name-correction";
  if (s.includes("kundali") || s.includes("kundli") || s.includes("varshphal")) return "kundali";
  return "default";
};

// ───── shared field validators ─────
const nameRx = /^[a-zA-Z\s.'-]+$/;
const phoneField = z.string().trim().min(7, "Enter a valid WhatsApp number").max(20).regex(/^[+]?[0-9\s-]{7,20}$/, "Enter a valid number");
const emailField = z.string().trim().min(1, "Email is required").email("Enter a valid email").max(100);
const pincodeField = z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode");
const dobField = z.object({
  day: z.string().min(1, "Day required"),
  month: z.string().min(1, "Month required"),
  year: z.string().min(1, "Year required"),
});
const tobField = z.object({
  hour: z.string().min(1, "Hour required"),
  minute: z.string().min(1, "Minute required"),
  meridiem: z.enum(["AM", "PM"], { required_error: "AM/PM required" }),
});
const genderField = z.enum(["male", "female", "other"], { required_error: "Select gender" });
const relationField = z.enum(["good", "neutral", "challenging"], { required_error: "Select" });

// ───── per-type schemas ─────
const defaultSchema = z.object({
  fullName: z.string().trim().min(2, "Full name required").max(100).regex(nameRx, "Letters only"),
  email: emailField,
  whatsapp: phoneField,
  dob: dobField,
  tob: tobField,
  pob: z.string().trim().min(2, "Place of birth required").max(120),
  gender: genderField,
  pincode: pincodeField,
});

const kundaliSchema = defaultSchema.extend({
  language: z.enum(["hindi", "english"], { required_error: "Select language" }),
});

const consultationSchema = z.object({
  firstName: z.string().trim().min(1, "First name required").max(50).regex(nameRx, "Letters only"),
  middleName: z.string().trim().max(50).regex(/^[a-zA-Z\s.'-]*$/, "Letters only").optional().or(z.literal("")),
  lastName: z.string().trim().min(1, "Last name required").max(50).regex(nameRx, "Letters only"),
  middleIsFatherName: z.enum(["yes", "no"], { required_error: "Please select" }),
  email: emailField,
  whatsapp: phoneField,
  dob: dobField,
  tob: tobField,
  pob: z.string().trim().min(2, "Place of birth required").max(120),
  pincode: pincodeField,
  gender: genderField,
  issues: z.string().trim().min(10, "Please describe (min 10 characters)").max(2000),
});

const nameCorrectionSchema = z.object({
  firstName: z.string().trim().min(1, "First name required").max(50).regex(nameRx, "Letters only"),
  middleName: z.string().trim().max(50).regex(/^[a-zA-Z\s.'-]*$/, "Letters only").optional().or(z.literal("")),
  lastName: z.string().trim().min(1, "Last name required").max(50).regex(nameRx, "Letters only"),
  middleIsFatherName: z.enum(["yes", "no"], { required_error: "Please select" }),
  email: emailField,
  whatsapp: phoneField,
  dob: dobField,
  tob: tobField,
  pob: z.string().trim().min(2, "Place of birth required").max(120),
  pincode: pincodeField,
  gender: genderField,
  relationFather: relationField,
  relationMother: relationField,
  relationSpouse: z.enum(["good", "neutral", "challenging", "na"], { required_error: "Select" }),
  fatherName: z.string().trim().min(1, "Father's name required").max(100).regex(nameRx, "Letters only"),
  motherName: z.string().trim().min(1, "Mother's name required").max(100).regex(nameRx, "Letters only"),
  spouseName: z.string().trim().max(100).regex(/^[a-zA-Z\s.'-]*$/, "Letters only").optional().or(z.literal("")),
  profession: z.string().trim().min(2, "Profession required").max(120),
  reason: z.string().trim().min(10, "Please share (min 10 characters)").max(2000),
});

// Quick "Name Check" form — minimal fields
const nameCheckSchema = z.object({
  firstName: z.string().trim().min(1, "First name required").max(50).regex(nameRx, "Letters only"),
  middleName: z.string().trim().max(50).regex(/^[a-zA-Z\s.'-]*$/, "Letters only").optional().or(z.literal("")),
  lastName: z.string().trim().min(1, "Last name required").max(50).regex(nameRx, "Letters only"),
  middleIsFatherName: z.enum(["yes", "no"], { required_error: "Please select" }),
  whatsapp: phoneField,
  email: emailField,
  pincode: pincodeField,
  dob: dobField,
  tob: tobField,
});

// ───── dropdown helpers ─────
const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => String(currentYear - i));
const hours12 = Array.from({ length: 12 }, (_, i) => String(i + 1));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

// ───── reusable field blocks ─────
const DOBPicker = ({ control, name = "dob" }: { control: any; name?: string }) => (
  <FormItem>
    <FormLabel>Date of Birth *</FormLabel>
    <div className="grid grid-cols-3 gap-2">
      {(["day", "month", "year"] as const).map((part) => (
        <FormField
          key={part}
          control={control}
          name={`${name}.${part}`}
          render={({ field }) => (
            <FormItem>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder={part.charAt(0).toUpperCase() + part.slice(1)} /></SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  {(part === "day" ? days : part === "month" ? months.map((m, i) => ({ label: m, val: String(i + 1) })) : years).map((opt: any) =>
                    typeof opt === "string"
                      ? <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      : <SelectItem key={opt.val} value={opt.val}>{opt.label}</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  </FormItem>
);

const TOBPicker = ({ control, name = "tob" }: { control: any; name?: string }) => (
  <FormItem>
    <FormLabel>Time of Birth *</FormLabel>
    <div className="grid grid-cols-3 gap-2">
      <FormField control={control} name={`${name}.hour`} render={({ field }) => (
        <FormItem>
          <Select value={field.value} onValueChange={field.onChange}>
            <FormControl><SelectTrigger><SelectValue placeholder="Hour" /></SelectTrigger></FormControl>
            <SelectContent className="max-h-60">
              {hours12.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={control} name={`${name}.minute`} render={({ field }) => (
        <FormItem>
          <Select value={field.value} onValueChange={field.onChange}>
            <FormControl><SelectTrigger><SelectValue placeholder="Minute" /></SelectTrigger></FormControl>
            <SelectContent className="max-h-60">
              {minutes.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={control} name={`${name}.meridiem`} render={({ field }) => (
        <FormItem>
          <Select value={field.value} onValueChange={field.onChange}>
            <FormControl><SelectTrigger><SelectValue placeholder="AM/PM" /></SelectTrigger></FormControl>
            <SelectContent>
              <SelectItem value="AM">AM</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} />
    </div>
  </FormItem>
);

// WhatsApp number with separate searchable country-code dropdown.
// Stores combined string ("+91 9876543210") in the form field.
const WhatsappField = ({ control }: { control: any }) => (
  <FormField
    control={control}
    name="whatsapp"
    render={({ field }) => {
      // Split current value into dial + number
      const raw = field.value || "+91 ";
      const m = raw.match(/^(\+\d{1,4})\s?(.*)$/);
      const dial = m ? m[1] : "+91";
      const number = m ? m[2] : raw;
      return (
        <FormItem>
          <FormLabel>WhatsApp Number *</FormLabel>
          <div className="flex gap-2">
            <CountryCodeSelect
              value={dial}
              onChange={(d) => field.onChange(`${d} ${number}`.trim())}
            />
            <FormControl>
              <Input
                inputMode="tel"
                placeholder="98765 43210"
                value={number}
                onChange={(e) => field.onChange(`${dial} ${e.target.value}`.trim())}
                className="flex-1"
              />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      );
    }}
  />
);

const GenderRadio = ({ control }: { control: any }) => (
  <FormField
    control={control}
    name="gender"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Gender *</FormLabel>
        <FormControl>
          <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-6">
            {[["male", "Male"], ["female", "Female"], ["other", "Other"]].map(([v, l]) => (
              <div key={v} className="flex items-center space-x-2">
                <RadioGroupItem value={v} id={`g-${v}`} />
                <Label htmlFor={`g-${v}`}>{l}</Label>
              </div>
            ))}
          </RadioGroup>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

const PaymentPage = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const serviceName = searchParams.get("service");
  const serviceAmount = searchParams.get("amount");
  const consultationType = searchParams.get("type") as keyof typeof consultationPackages;
  const formTypeParam = searchParams.get("formType") as FormType | null;

  const isServiceMode = !!(serviceName && serviceAmount);
  const servicePrice = serviceAmount ? parseInt(serviceAmount, 10) : 0;

  const formType: FormType = formTypeParam || inferFormType(serviceName, !!consultationType);

  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPackage = isServiceMode ? null : (consultationPackages[consultationType] || consultationPackages.audio);
  const selectedOption = currentPackage?.options.find((opt) => opt.id === selectedPackage);

  useEffect(() => {
    if (currentPackage && currentPackage.options.length > 0 && !selectedPackage) {
      setSelectedPackage(currentPackage.options[0].id);
    }
  }, [currentPackage, selectedPackage]);

  // Pick schema/defaults by form type
  const { schema, defaults } = useMemo(() => {
    const baseDob = { day: "", month: "", year: "" };
    const baseTob = { hour: "", minute: "", meridiem: "" as any };
    if (formType === "kundali") {
      return {
        schema: kundaliSchema,
        defaults: { fullName: "", email: "", whatsapp: "+91 ", dob: baseDob, tob: baseTob, pob: "", gender: undefined as any, pincode: "", language: undefined as any },
      };
    }
    if (formType === "consultation") {
      return {
        schema: consultationSchema,
        defaults: { firstName: "", middleName: "", lastName: "", middleIsFatherName: undefined as any, email: "", whatsapp: "+91 ", dob: baseDob, tob: baseTob, pob: "", pincode: "", gender: undefined as any, issues: "" },
      };
    }
    if (formType === "name-correction") {
      return {
        schema: nameCorrectionSchema,
        defaults: { firstName: "", middleName: "", lastName: "", middleIsFatherName: undefined as any, email: "", whatsapp: "+91 ", dob: baseDob, tob: baseTob, pob: "", pincode: "", gender: undefined as any, relationFather: undefined as any, relationMother: undefined as any, relationSpouse: undefined as any, fatherName: "", motherName: "", spouseName: "", profession: "", reason: "" },
      };
    }
    if (formType === "name-check") {
      return {
        schema: nameCheckSchema,
        defaults: { firstName: "", middleName: "", lastName: "", middleIsFatherName: undefined as any, whatsapp: "+91 ", email: "", pincode: "", dob: baseDob, tob: baseTob },
      };
    }
    return {
      schema: defaultSchema,
      defaults: { fullName: "", email: "", whatsapp: "+91 ", dob: baseDob, tob: baseTob, pob: "", gender: undefined as any, pincode: "" },
    };
  }, [formType]);

  const form = useForm<any>({
    resolver: zodResolver(schema as any),
    defaultValues: defaults,
  });

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayment = async (amount: number, formData: any) => {
    const res = await loadRazorpay();
    if (!res) { alert("Razorpay SDK failed to load"); return; }

    let order;
    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) throw new Error("Order API failed");
      order = await response.json();
    } catch (error) {
      console.error(error);
      alert("Payment initialization failed ❌");
      return;
    }

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;
    if (!razorpayKey) {
      alert("Razorpay publishable key is missing (VITE_RAZORPAY_KEY_ID). Please contact admin.");
      return;
    }

    const displayPersonName =
      formData.fullName ||
      [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(" ");

    const options = {
      key: razorpayKey,
      amount: order.amount,
      currency: "INR",
      name: "Ankshaastra",
      description: isServiceMode ? serviceName : "Consultation Booking",
      order_id: order.id,
      handler: async function (response: any) {
        try {
          await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, formData, service: serviceName, amount }),
          });
        } catch (e) {
          console.error("Verification failed", e);
        }
      },
      prefill: {
        name: displayPersonName,
        email: formData.email,
        contact: formData.whatsapp,
      },
      theme: { color: "#ea580c" },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  };

  const onSubmit = async (data: any) => {
    if (!isServiceMode && !selectedPackage) {
      toast({ title: "Please select a plan", description: "Choose a consultation plan to proceed.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    try {
      const amount = isServiceMode ? servicePrice : (selectedOption?.price || 500);
      await handlePayment(amount, data);
    } finally {
      setIsProcessing(false);
    }
  };

  const displayName = isServiceMode ? serviceName : (currentPackage?.name || "Consultation");
  const displayPrice = isServiceMode ? servicePrice : (selectedOption?.price || 0);
  const heroColor = isServiceMode ? "from-primary to-amber" : (currentPackage?.color || "from-primary to-accent");
  const HeroIcon = isServiceMode ? Sparkles : (currentPackage?.icon || Phone);

  // ───── per-type field renderer ─────
  const renderFields = () => {
    const c = form.control;

    const FullName = (
      <FormField control={c} name="fullName" render={({ field }) => (
        <FormItem><FormLabel>Full Name *</FormLabel><FormControl><Input placeholder="As per Aadhar" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
    );

    const NameTriplet = (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField control={c} name="firstName" render={({ field }) => (
            <FormItem><FormLabel>First Name *</FormLabel><FormControl><Input placeholder="First name" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={c} name="middleName" render={({ field }) => (
            <FormItem><FormLabel>Middle Name</FormLabel><FormControl><Input placeholder="Middle name" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={c} name="lastName" render={({ field }) => (
            <FormItem><FormLabel>Last Name *</FormLabel><FormControl><Input placeholder="Last name" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={c} name="middleIsFatherName" render={({ field }) => (
          <FormItem>
            <FormLabel>Is the middle name your father's name? *</FormLabel>
            <FormControl>
              <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-6">
                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="mfn-yes" /><Label htmlFor="mfn-yes">Yes</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="mfn-no" /><Label htmlFor="mfn-no">No</Label></div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </>
    );

    const ContactRow = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField control={c} name="email" render={({ field }) => (
          <FormItem><FormLabel>Email *</FormLabel><FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <WhatsappField control={c} />
      </div>
    );

    const BirthRow = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DOBPicker control={c} />
        <TOBPicker control={c} />
      </div>
    );

    const POBPincode = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField control={c} name="pob" render={({ field }) => (
          <FormItem><FormLabel>Place of Birth *</FormLabel><FormControl><Input placeholder="City, State, Country" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={c} name="pincode" render={({ field }) => (
          <FormItem><FormLabel>Pincode *</FormLabel><FormControl><Input placeholder="6-digit pincode" maxLength={6} {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      </div>
    );

    if (formType === "kundali") {
      return (
        <>
          {FullName}
          {ContactRow}
          {BirthRow}
          {POBPincode}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GenderRadio control={c} />
            <FormField control={c} name="language" render={({ field }) => (
              <FormItem>
                <FormLabel>Report Language *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="hindi">Hindi</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </>
      );
    }

    if (formType === "consultation") {
      return (
        <>
          {NameTriplet}
          {ContactRow}
          {BirthRow}
          {POBPincode}
          <GenderRadio control={c} />
          <FormField control={c} name="issues" render={({ field }) => (
            <FormItem><FormLabel>Issues to Discuss *</FormLabel>
              <FormControl><Textarea placeholder="Describe what you'd like to discuss in this consultation (career, health, relationships, finance, etc.)" className="min-h-[140px] resize-none" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </>
      );
    }

    if (formType === "name-correction") {
      const RelationSelect = ({ name, label, withNA = false }: { name: string; label: string; withNA?: boolean }) => (
        <FormField control={c} name={name} render={({ field }) => (
          <FormItem>
            <FormLabel>{label} *</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="challenging">Challenging</SelectItem>
                {withNA && <SelectItem value="na">Not Applicable</SelectItem>}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
      );
      return (
        <>
          {NameTriplet}
          {ContactRow}
          {BirthRow}
          {POBPincode}
          <GenderRadio control={c} />
          <div>
            <h3 className="font-semibold text-foreground mb-3">Relationship Quality</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <RelationSelect name="relationFather" label="With Father" />
              <RelationSelect name="relationMother" label="With Mother" />
              <RelationSelect name="relationSpouse" label="With Spouse" withNA />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={c} name="fatherName" render={({ field }) => (
              <FormItem><FormLabel>Father's Name *</FormLabel><FormControl><Input placeholder="Father's full name" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={c} name="motherName" render={({ field }) => (
              <FormItem><FormLabel>Mother's Name *</FormLabel><FormControl><Input placeholder="Mother's full name" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={c} name="spouseName" render={({ field }) => (
              <FormItem><FormLabel>Spouse's Name</FormLabel><FormControl><Input placeholder="If applicable" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={c} name="profession" render={({ field }) => (
            <FormItem><FormLabel>Profession *</FormLabel><FormControl><Input placeholder="Your current profession" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={c} name="reason" render={({ field }) => (
            <FormItem><FormLabel>Reason for Name Correction *</FormLabel>
              <FormControl><Textarea placeholder="Why are you considering a name correction? Share your goals, struggles, and what you'd like to improve." className="min-h-[140px] resize-none" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </>
      );
    }

    if (formType === "name-check") {
      return (
        <>
          {NameTriplet}
          {ContactRow}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={c} name="pincode" render={({ field }) => (
              <FormItem><FormLabel>Pincode *</FormLabel><FormControl><Input placeholder="6-digit pincode" maxLength={6} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          {BirthRow}
        </>
      );
    }

    // default
    return (
      <>
        {FullName}
        {ContactRow}
        {BirthRow}
        {POBPincode}
        <GenderRadio control={c} />
      </>
    );
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-12 pb-8 bg-gradient-to-br from-brown-dark via-brown to-brown-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${heroColor} mb-4`}>
              <HeroIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Book <span className="text-gradient-amber">{displayName}</span>
            </h1>
            <p className="font-body text-lg text-white/80">
              Complete your booking with your personal details
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 bg-gradient-to-b from-brown-dark to-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Booking Form */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">Your Details</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {renderFields()}

                    <button
                      type="submit"
                      disabled={isProcessing || (!isServiceMode && !selectedPackage)}
                      className={`w-full py-4 text-lg rounded-xl font-semibold text-white transition-all duration-300 bg-gradient-to-r ${heroColor} hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isProcessing ? "Processing..." : `Pay ₹${displayPrice.toLocaleString()}`}
                    </button>

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 text-secondary" />
                      <span>Your payment is secured with 256-bit SSL encryption</span>
                    </div>
                  </form>
                </Form>
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
              <div className="bg-card border border-border rounded-2xl p-8 sticky top-24">
                {isServiceMode ? (
                  <>
                    <h3 className="font-display text-xl font-bold text-foreground mb-4">Order Summary</h3>
                    <div className="border-b border-border pb-4 mb-4">
                      <p className="text-foreground font-semibold text-lg">{serviceName}</p>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2">
                      <span className="text-foreground">Total</span>
                      <span className="text-gradient-amber">₹{servicePrice.toLocaleString()}</span>
                    </div>
                    <div className="mt-6 pt-6 border-t border-border">
                      <h4 className="font-medium text-foreground mb-3">What you'll get:</h4>
                      <ul className="space-y-2">
                        {["Detailed numerology analysis", "Personalized guidance", "Report within 48-72 hours", "Email/WhatsApp follow-up"].map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-secondary flex-shrink-0" />{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-display text-xl font-bold text-foreground mb-6">Select Your Plan</h3>
                    <div className="space-y-3 mb-6">
                      {currentPackage?.options.map((option) => (
                        <button
                          type="button"
                          key={option.id}
                          onClick={() => setSelectedPackage(option.id)}
                          className={cn(
                            "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                            selectedPackage === option.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", selectedPackage === option.id ? "border-primary bg-primary" : "border-muted-foreground")}>
                              {selectedPackage === option.id && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <span className="font-medium text-foreground">{option.label}</span>
                          </div>
                          <span className="font-bold text-primary">₹{option.price}</span>
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-border pt-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Consultation Type</span>
                        <span className="text-foreground">{currentPackage?.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Selected Plan</span>
                        <span className="text-foreground">{selectedOption?.label || "-"}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-3 border-t border-border">
                        <span className="text-foreground">Total</span>
                        <span className="text-gradient-amber">₹{selectedOption?.price || 0}</span>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-border">
                      <h4 className="font-medium text-foreground mb-3">What you'll get:</h4>
                      <ul className="space-y-2">
                        {["Lal Kitab Remedies Included", "Personalized guidance", "Consultation within 48-72 hours", "Email follow-up support"].map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-secondary flex-shrink-0" />{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PaymentPage;
