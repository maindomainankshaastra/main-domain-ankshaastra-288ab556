import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import { syncPaymentStatus } from "@/lib/sync-payment";
import { storePendingPaymentVerification } from "@/lib/payment-verification";
import {
  EXTENDED_FORM_TYPES,
  getExtendedDefaultValues,
  getExtendedSchema,
  inferExtendedFormType,
  type ExtendedFormType,
} from "@/lib/payment-form-ext";
import { ExtendedPaymentFields } from "@/components/payment/ExtendedPaymentFields";
import { resolveServiceDisplay } from "@/lib/service-display";
import { OrderSummary } from "@/components/payment/OrderSummary";

const KUNDLI_20_ADDON = { id: "kundli-20", label: "Personalised Premium Kundli 2.0", note: "PDF report", price: pricing.addons.kundli20 };
const LUCKY_COLOR_ADDON = { id: "lucky-color", label: "Lucky Color and Number", note: "", price: pricing.addons.luckyColorNumber };
const MISSING_NUMBER_ADDON = { id: "missing-number", label: "Missing Number and Repeating Number Remedy", note: "", price: pricing.addons.missingNumberRemedy };
const LUCKY_VEHICLE_COLOR_ADDON = { id: "lucky-vehicle-color", label: "Lucky Vehicle Color", note: "", price: pricing.luckyNumber.vehicleColor };
const LUCKY_VEHICLE_NUMBER_ADDON = { id: "lucky-vehicle-number", label: "Lucky Vehicle Number", note: "", price: pricing.luckyNumber.vehicle };
const SHUBH_MUHURAT_ADDON = { id: "shubh-muhrat", label: "Shubh Muhrat", note: "", price: pricing.addons.shubhMuhrat };

// Add-ons available at checkout for service-mode orders.
const DEFAULT_ADDONS = [KUNDLI_20_ADDON] as const;

const PYAAR_ADDONS = [
  { id: "kundali-pyaar", label: "Personalized Kundali", note: "150+ page detailed Kundali · WhatsApp PDF", price: pricing.pyaarShastra.kundaliAddon },
] as const;

type Addon = { id: string; label: string; note: string; price: number };

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
type BaseFormType = "kundali" | "kundali-multi" | "consultation" | "name-correction" | "name-correction-couple" | "name-check" | "couple" | "pyaar-shastra" | "default";
type FormType = BaseFormType | ExtendedFormType;

const inferFormType = (service: string | null, hasConsultationType: boolean): BaseFormType => {
  if (hasConsultationType) return "consultation";
  if (!service) return "default";
  const s = service.toLowerCase();
  if (s.includes("call consultation") || s.includes("1:1 call")) return "consultation";
  if (s.includes("pyaar shastra") || s.includes("pyaar shaastra")) return "pyaar-shastra";
  if (s.includes("name check")) return "name-check";
  if (s.includes("complete blueprint") || s.includes("for 2 people")) return "name-correction-couple";
  if (s.includes("name correction")) return "name-correction";
  if ((s.includes("kundali") || s.includes("kundli")) && (s.includes("triple") || s.includes("family") || s.includes("for 3") || s.includes("double") || s.includes("for 2") || s.includes("2 kundli") || s.includes("3 kundli"))) return "kundali-multi";
  if (s.includes("kundali") || s.includes("kundli") || s.includes("varshphal")) return "kundali";
  if (s.includes("relationship analysis")) return "relationship-analysis";
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
  language: z.enum(["english", "hindi", "gujarati"], { required_error: "Select language" }),
});

// Kundali per-person (used inside kundali-multi)
const kundaliPersonSchema = z.object({
  fullName: z.string().trim().min(2, "Full name required").max(100).regex(nameRx, "Letters only"),
  dob: dobField,
  tob: tobField,
  pincode: pincodeField,
  pob: z.string().trim().min(2, "Place of birth required").max(120),
  gender: genderField,
});
const makeKundaliMultiSchema = (count: 2 | 3) => {
  const base: any = {
    person1: kundaliPersonSchema,
    person2: kundaliPersonSchema,
    email: emailField,
    whatsapp: phoneField,
    language: z.enum(["english", "hindi", "gujarati"], { required_error: "Select language" }),
  };
  if (count === 3) base.person3 = kundaliPersonSchema;
  return z.object(base);
};


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
  lastNameChangeOk: z.enum(["yes", "no"], { required_error: "Please select" }),
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
  pob: z.string().trim().min(2, "Place of birth required").max(120),
  gender: genderField,
});

// Couple form — two people's birth details (used for premium Name Correction
// + Complete Numerology Blueprint package and Pyaar Shastra).
const personSchema = z.object({
  fullName: z.string().trim().min(2, "Full name required").max(100).regex(nameRx, "Letters only"),
  gender: genderField,
  dob: dobField,
  tob: tobField,
  pincode: pincodeField,
  pob: z.string().trim().min(2, "Place of birth required").max(120),
});
const coupleSchema = z.object({
  person1: personSchema,
  person2: personSchema,
  email: emailField,
  whatsapp: phoneField,
});
const pyaarShastraSchema = coupleSchema.extend({
  language: z.enum(["english", "hindi", "gujarati"], { required_error: "Select language" }),
});

// Name Correction for 2 people — full name-correction details per person,
// shared contact + reason at the bottom.
const personNameCorrSchema = z.object({
  firstName: z.string().trim().min(1, "First name required").max(50).regex(nameRx, "Letters only"),
  middleName: z.string().trim().max(50).regex(/^[a-zA-Z\s.'-]*$/, "Letters only").optional().or(z.literal("")),
  lastName: z.string().trim().min(1, "Last name required").max(50).regex(nameRx, "Letters only"),
  middleIsFatherName: z.enum(["yes", "no"], { required_error: "Please select" }),
  lastNameChangeOk: z.enum(["yes", "no"], { required_error: "Please select" }),
  dob: dobField,
  tob: tobField,
  pincode: pincodeField,
  pob: z.string().trim().min(2, "Place of birth required").max(120),
  gender: genderField,
  relationFather: relationField,
  relationMother: relationField,
  relationSpouse: z.enum(["good", "neutral", "challenging", "na"], { required_error: "Select" }),
  fatherName: z.string().trim().min(1, "Father's name required").max(100).regex(nameRx, "Letters only"),
  motherName: z.string().trim().min(1, "Mother's name required").max(100).regex(nameRx, "Letters only"),
  spouseName: z.string().trim().max(100).regex(/^[a-zA-Z\s.'-]*$/, "Letters only").optional().or(z.literal("")),
  profession: z.string().trim().min(2, "Profession required").max(120),
});
const nameCorrectionCoupleSchema = z.object({
  person1: personNameCorrSchema,
  person2: personNameCorrSchema,
  email: emailField,
  whatsapp: phoneField,
  reason: z.string().trim().min(10, "Please share (min 10 characters)").max(2000),
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

const GenderRadio = ({ control, name = "gender" }: { control: any; name?: string }) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>Gender *</FormLabel>
        <FormControl>
          <RadioGroup value={field.value ?? ""} onValueChange={field.onChange} className="flex gap-6">
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
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const serviceName = searchParams.get("service");
  const serviceAmount = searchParams.get("amount");
  const consultationType = searchParams.get("type") as keyof typeof consultationPackages;
  const formTypeParam = searchParams.get("formType") as FormType | null;

  const [serviceInfo, setServiceInfo] = useState<{ id: string; title: string; price: number; gst_rate: number } | null>(null);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);

  const isServiceMode = !!serviceName;
  const catalogDisplay = useMemo(() => resolveServiceDisplay(serviceName), [serviceName]);
  const urlPrice = serviceAmount ? parseInt(serviceAmount, 10) : 0;
  const servicePrice = urlPrice > 0 ? urlPrice : (serviceInfo?.price ?? catalogDisplay?.price ?? 0);
  const canSubmitService = isServiceMode && servicePrice > 0 && !serviceLoading;

  const formType: FormType = useMemo(() => {
    if (formTypeParam && EXTENDED_FORM_TYPES.includes(formTypeParam as ExtendedFormType)) {
      return formTypeParam as ExtendedFormType;
    }
    const extended = inferExtendedFormType(serviceName);
    if (extended) return extended;
    if (formTypeParam) return formTypeParam as BaseFormType;
    return inferFormType(serviceName, !!consultationType);
  }, [formTypeParam, serviceName, consultationType]);

  // For multi-person kundali, infer the number of people from the service name.
  const kundaliCount: 2 | 3 = useMemo(() => {
    const s = (serviceName || "").toLowerCase();
    if (s.includes("triple") || s.includes("family") || s.includes("for 3") || s.includes("3 kundli")) return 3;
    return 2;
  }, [serviceName]);

  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAwaitingPayment, setIsAwaitingPayment] = useState(false);
  const paymentCtxRef = useRef<{
    formData: Record<string, unknown>;
    amount: number;
    dbOrderId?: string;
    razorpayOrderId?: string;
  } | null>(null);
  const finalizingRef = useRef(false);
  const paymentCompletedRef = useRef(false);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const availableAddons: Addon[] = useMemo(() => {
    if (formType === "pyaar-shastra") return [...PYAAR_ADDONS];
    if (formType === "kundali" || formType === "kundali-multi") return [];
    if (formType === "office-vastu") return [];
    if (formType === "consultation") return [KUNDLI_20_ADDON];
    if (formType === "name-correction" || formType === "name-check") {
      return [KUNDLI_20_ADDON, LUCKY_COLOR_ADDON, MISSING_NUMBER_ADDON];
    }
    if (formType === "lucky-vehicle") {
      return [LUCKY_VEHICLE_COLOR_ADDON, SHUBH_MUHURAT_ADDON];
    }
    if (formType === "lucky-vehicle-color") {
      return [LUCKY_VEHICLE_NUMBER_ADDON, SHUBH_MUHURAT_ADDON];
    }
    if (formType === "lucky-vehicle-date") {
      return [LUCKY_VEHICLE_NUMBER_ADDON, LUCKY_VEHICLE_COLOR_ADDON];
    }
    if (formType === "lucky-mobile" || formType === "lucky-flat") {
      return [MISSING_NUMBER_ADDON, LUCKY_COLOR_ADDON];
    }
    return [...DEFAULT_ADDONS];
  }, [formType]);

  const addonsTotal = selectedAddons.reduce((sum, id) => {
    const a = availableAddons.find((x) => x.id === id);
    return sum + (a?.price || 0);
  }, 0);
  const selectedAddonObjects = availableAddons.filter((a) => selectedAddons.includes(a.id));
  const toggleAddon = (id: string) =>
    setSelectedAddons((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const currentPackage = isServiceMode ? null : (consultationPackages[consultationType] || consultationPackages.audio);
  const selectedOption = currentPackage?.options.find((opt) => opt.id === selectedPackage);

  useEffect(() => {
    void import("./ThankYou");
  }, []);

  useEffect(() => {
    if (currentPackage && currentPackage.options.length > 0 && !selectedPackage) {
      setSelectedPackage(currentPackage.options[0].id);
    }
  }, [currentPackage, selectedPackage]);

  useEffect(() => {
    if (!serviceName) {
      return;
    }

    const controller = new AbortController();
    setServiceLoading(true);
    setServiceError(null);

    fetch(`/api/services?title=${encodeURIComponent(serviceName)}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load service details");
        }
        return res.json();
      })
      .then((data) => {
        setServiceInfo(data?.service ?? null);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error("Service lookup failed", error);
        if (!serviceAmount && !resolveServiceDisplay(serviceName)?.price) {
          setServiceError("Unable to load service pricing from the service catalog.");
        }
        setServiceInfo(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setServiceLoading(false);
      });

    return () => controller.abort();
  }, [serviceName]);

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
    if (formType === "kundali-multi") {
      const blank = { fullName: "", dob: baseDob, tob: baseTob, pincode: "", pob: "", gender: undefined as any };
      const defaults: any = {
        person1: { ...blank },
        person2: { ...blank },
        email: "", whatsapp: "+91 ", language: undefined as any,
      };
      if (kundaliCount === 3) defaults.person3 = { ...blank };
      return { schema: makeKundaliMultiSchema(kundaliCount), defaults };
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
        defaults: { firstName: "", middleName: "", lastName: "", middleIsFatherName: undefined as any, lastNameChangeOk: undefined as any, email: "", whatsapp: "+91 ", dob: baseDob, tob: baseTob, pob: "", pincode: "", gender: undefined as any, relationFather: undefined as any, relationMother: undefined as any, relationSpouse: undefined as any, fatherName: "", motherName: "", spouseName: "", profession: "", reason: "" },
      };
    }
    if (formType === "name-check") {
      return {
        schema: nameCheckSchema,
        defaults: { firstName: "", middleName: "", lastName: "", middleIsFatherName: undefined as any, whatsapp: "+91 ", email: "", pincode: "", dob: baseDob, pob: "", gender: undefined as any },
      };
    }
    if (formType === "couple") {
      const blankPerson = { fullName: "", gender: undefined as any, dob: baseDob, tob: baseTob, pincode: "", pob: "" };
      return {
        schema: coupleSchema,
        defaults: { person1: { ...blankPerson }, person2: { ...blankPerson }, email: "", whatsapp: "+91 " },
      };
    }
    if (formType === "name-correction-couple") {
      const blankPerson = {
        firstName: "", middleName: "", lastName: "", middleIsFatherName: undefined as any,
        lastNameChangeOk: undefined as any,
        dob: baseDob, tob: baseTob, pincode: "", pob: "", gender: undefined as any,
        relationFather: undefined as any, relationMother: undefined as any, relationSpouse: undefined as any,
        fatherName: "", motherName: "", spouseName: "", profession: "",
      };
      return {
        schema: nameCorrectionCoupleSchema,
        defaults: { person1: { ...blankPerson }, person2: { ...blankPerson }, email: "", whatsapp: "+91 ", reason: "" },
      };
    }
    if (formType === "pyaar-shastra") {
      const blankPerson = { fullName: "", gender: undefined as any, dob: baseDob, tob: baseTob, pincode: "", pob: "" };
      return {
        schema: pyaarShastraSchema,
        defaults: { person1: { ...blankPerson, gender: "male" as any }, person2: { ...blankPerson, gender: "female" as any }, email: "", whatsapp: "+91 ", language: undefined as any },
      };
    }
    if (EXTENDED_FORM_TYPES.includes(formType as ExtendedFormType)) {
      const ext = formType as ExtendedFormType;
      return {
        schema: getExtendedSchema(ext),
        defaults: { ...getExtendedDefaultValues(ext), whatsapp: "+91 " },
      };
    }
    return {
      schema: defaultSchema,
      defaults: { fullName: "", email: "", whatsapp: "+91 ", dob: baseDob, tob: baseTob, pob: "", gender: undefined as any, pincode: "" },
    };
  }, [formType, kundaliCount]);

  const form = useForm<any>({
    resolver: zodResolver(schema as any),
    defaultValues: defaults,
  });

  // Auto-fetch place/city/state from 6-digit Indian pincodes.
  useEffect(() => {
    type PoData = { district: string; state: string; place: string };
    const cache: Record<string, PoData> = {};
    const lookup = async (pin: string): Promise<PoData | null> => {
      if (cache[pin]) return cache[pin];
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await res.json();
        const po = data?.[0]?.PostOffice?.[0];
        if (!po) return null;
        const district = String(po.District || "").trim();
        const state = String(po.State || "").trim();
        const place = [district, state, "India"].filter(Boolean).join(", ");
        const result = { district, state, place };
        cache[pin] = result;
        return result;
      } catch {
        return null;
      }
    };
    const fillIfEmpty = (path: string, next: string) => {
      const current = (form.getValues(path) as string | undefined) || "";
      if (current.trim() === "") form.setValue(path, next, { shouldValidate: true, shouldDirty: true });
    };
    const fillPob = async (pobPath: string, pin: string) => {
      if (!/^\d{6}$/.test(pin)) return;
      const po = await lookup(pin);
      if (!po) return;
      fillIfEmpty(pobPath, po.place);
    };
    const fillOffice = async (pin: string) => {
      if (!/^\d{6}$/.test(pin)) return;
      const po = await lookup(pin);
      if (!po) return;
      if (po.district) fillIfEmpty("officeCity", po.district);
      if (po.state) fillIfEmpty("officeState", po.state);
    };
    const sub = form.watch((value, { name }) => {
      if (!name) return;
      const multi = name.match(/^(person[123])\.pincode$/);
      if (multi) {
        const pin = (value as any)?.[multi[1]]?.pincode || "";
        fillPob(`${multi[1]}.pob`, pin);
      } else if (name === "pincode") {
        fillPob("pob", (value as any)?.pincode || "");
      } else if (name === "officePincode") {
        fillOffice((value as any)?.officePincode || "");
      }
    });
    return () => sub.unsubscribe();
  }, [form, formType]);

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if ((window as unknown as { Razorpay?: unknown }).Razorpay) {
        resolve(true);
        return;
      }
      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(true));
        existing.addEventListener("error", () => resolve(false));
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const goToThankYou = useCallback(
    (
      formData: Record<string, unknown>,
      amount: number,
      paymentId: string,
      orderId: string,
      invoiceNumber: string,
    ) => {
      const params = new URLSearchParams({
        service: isServiceMode ? String(serviceName) : (currentPackage?.name || "Consultation"),
        amount: String(amount),
        payment_id: paymentId,
        order_id: orderId,
        invoice: invoiceNumber,
        name: String(
          formData?.fullName ||
            [formData?.firstName, formData?.lastName].filter(Boolean).join(" ") ||
            "",
        ),
        email: String(formData?.email || ""),
      });
      setIsAwaitingPayment(false);
      paymentCtxRef.current = null;
      navigate(`/thank-you?${params.toString()}`);
    },
    [currentPackage?.name, isServiceMode, navigate, serviceName],
  );

  const finalizePayment = useCallback(
    async (
      response: {
        razorpay_order_id?: string;
        razorpay_payment_id?: string;
        razorpay_signature?: string;
      },
      ctx: { formData: Record<string, unknown>; amount: number; dbOrderId?: string },
    ) => {
      if (paymentCompletedRef.current || finalizingRef.current) return;
      finalizingRef.current = true;

      try {
        const razorpay_order_id = String(response?.razorpay_order_id || "");
        const razorpay_payment_id = String(response?.razorpay_payment_id || "");
        const razorpay_signature = String(response?.razorpay_signature || "");

        paymentCompletedRef.current = true;

        storePendingPaymentVerification({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          dbOrderId: ctx.dbOrderId,
          formData: ctx.formData,
          service: serviceName || undefined,
          amount: ctx.amount,
          userId: user?.id,
        });

        goToThankYou(ctx.formData, ctx.amount, razorpay_payment_id, razorpay_order_id, "");
      } finally {
        finalizingRef.current = false;
      }
    },
    [goToThankYou, serviceName, user?.id],
  );

  const reconcilePendingPayment = useCallback(async (force = false) => {
    if (paymentCompletedRef.current || finalizingRef.current) return false;
    const ctx = paymentCtxRef.current;
    if (!ctx?.razorpayOrderId) return false;
    if (!force && !isAwaitingPayment) return false;

    finalizingRef.current = true;
    try {
      const synced = await syncPaymentStatus({
        razorpay_order_id: ctx.razorpayOrderId,
        dbOrderId: ctx.dbOrderId,
        formData: { ...ctx.formData, userId: user?.id },
        service: serviceName || undefined,
        amount: ctx.amount,
        pollAttempts: 6,
      });

      if (!synced.paid || !synced.razorpay_payment_id) return false;

      paymentCompletedRef.current = true;
      setIsAwaitingPayment(false);

      if (!synced.invoice_ready) {
        toast({
          title: "Payment successful",
          description: "Your invoice is being prepared and will arrive by email shortly.",
        });
      }

      goToThankYou(
        ctx.formData,
        ctx.amount,
        synced.razorpay_payment_id,
        synced.razorpay_order_id || ctx.razorpayOrderId,
        String(synced.invoice_number || ""),
      );
      return true;
    } finally {
      finalizingRef.current = false;
    }
  }, [goToThankYou, isAwaitingPayment, serviceName, toast, user?.id]);

  useEffect(() => {
    if (!isAwaitingPayment) return;

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void reconcilePendingPayment();
      }
    };

    document.addEventListener("visibilitychange", onVisible);
    const pollId = window.setInterval(() => {
      void reconcilePendingPayment();
    }, 8000);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(pollId);
    };
  }, [isAwaitingPayment, reconcilePendingPayment]);

  const handlePayment = async (amount: number, formData: any) => {
    const res = await loadRazorpay();
    if (!res) {
      alert("Razorpay SDK failed to load");
      return;
    }

    const displayPersonName =
      formData.fullName ||
      [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(" ") ||
      formData?.person1?.fullName ||
      "";

    let order: { id: string; amount: number; dbOrderId?: string };
    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          serviceTitle: isServiceMode ? serviceName : currentPackage?.name || "Consultation",
          sourceWebsite: "ankshaastra.com",
          orderType: isServiceMode ? "service" : "consultation",
          userId: user?.id,
          customerName: displayPersonName,
          customerEmail: formData.email,
          customerPhone: formData.whatsapp,
          metadata: {
            formType,
            serviceSlug: serviceName,
            serviceId: serviceInfo?.id,
            addons: selectedAddonObjects.map((a) => ({ id: a.id, label: a.label, price: a.price })),
            formSnapshot: formData,
          },
        }),
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

    const ctx = {
      formData: formData as Record<string, unknown>,
      amount,
      dbOrderId: order.dbOrderId,
      razorpayOrderId: order.id,
    };
    paymentCtxRef.current = ctx;
    setIsAwaitingPayment(true);

    const options = {
      key: razorpayKey,
      amount: order.amount,
      currency: "INR",
      name: "Ankshaastra",
      description: isServiceMode ? serviceName : "Consultation Booking",
      order_id: order.id,
      handler: async function (response: {
        razorpay_order_id?: string;
        razorpay_payment_id?: string;
        razorpay_signature?: string;
      }) {
        try {
          await finalizePayment(response, ctx);
        } catch (e) {
          console.error("Verification failed", e);
          try {
            const synced = await syncPaymentStatus({
              razorpay_order_id: String(response?.razorpay_order_id || ctx.razorpayOrderId),
              dbOrderId: ctx.dbOrderId,
              formData: { ...ctx.formData, userId: user?.id },
              service: serviceName || undefined,
              amount: ctx.amount,
              pollAttempts: 8,
            });
            if (synced.paid && synced.razorpay_payment_id) {
              paymentCompletedRef.current = true;
              if (!synced.invoice_ready) {
                toast({
                  title: "Payment successful",
                  description: "Your invoice is being prepared and will arrive by email shortly.",
                });
              }
              goToThankYou(
                ctx.formData,
                ctx.amount,
                synced.razorpay_payment_id,
                synced.razorpay_order_id || ctx.razorpayOrderId,
                String(synced.invoice_number || ""),
              );
              return;
            }
          } catch (syncErr) {
            console.error("Sync fallback failed", syncErr);
          }

          const recovered = await reconcilePendingPayment(true);
          if (!recovered) {
            toast({
              title: "Confirming your payment",
              description:
                "If money was deducted, stay on this page for a moment or refresh — we are syncing with Razorpay.",
            });
          }
        }
      },
      modal: {
        ondismiss: () => {
          void reconcilePendingPayment();
        },
      },
      prefill: {
        name: displayPersonName,
        email: formData.email,
        contact: formData.whatsapp,
      },
      theme: { color: "#ea580c" },
    };

    const paymentObject = new (window as unknown as { Razorpay: new (o: typeof options) => { open: () => void } }).Razorpay(
      options,
    );
    paymentObject.open();
  };

  const onSubmit = async (data: any) => {
    if (!isServiceMode && !selectedPackage) {
      toast({ title: "Please select a plan", description: "Choose a consultation plan to proceed.", variant: "destructive" });
      return;
    }

    if (isServiceMode && !servicePrice) {
      toast({ title: "Service price unavailable", description: "We could not load the current price for this service. Please refresh or contact support.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const baseAmount = isServiceMode ? servicePrice : (selectedOption?.price || 500);
      const amount = baseAmount + addonsTotal;
      await handlePayment(amount, data);
    } finally {
      setIsProcessing(false);
    }
  };

  const displayName = isServiceMode
    ? (catalogDisplay?.packageName || serviceName)
    : (currentPackage?.name || "Consultation");
  const displaySummary = isServiceMode ? (catalogDisplay?.summary || "") : "";
  const basePrice = isServiceMode ? servicePrice : (selectedOption?.price || 0);
  const displayPrice = basePrice + addonsTotal;
  const heroColor = isServiceMode ? "from-primary to-amber" : (currentPackage?.color || "from-primary to-accent");
  const HeroIcon = isServiceMode ? Sparkles : (currentPackage?.icon || Phone);

  // ───── Order Summary data (shared between desktop sidebar + mobile inline) ─────
  const summaryHub =
    formType === "consultation"
      ? undefined
      : isServiceMode
        ? catalogDisplay?.hubTitle
        : selectedOption?.label;
  const summaryOriginal = isServiceMode ? catalogDisplay?.originalPrice : undefined;
  const summaryAddons = selectedAddonObjects.map((a) => ({ label: a.label, price: a.price }));
  const deliveryNote =
    formType === "consultation"
      ? "Call Consultation with Himansshu Ji will be scheduled within 48-72 hours."
      : "Delivered via Email in 9 Hours";
  const renderOrderSummary = (sticky: boolean) => (
    <OrderSummary
      serviceName={displayName || "Service"}
      hubTitle={summaryHub}
      basePrice={basePrice}
      originalPrice={summaryOriginal}
      addons={summaryAddons}
      deliveryNote={deliveryNote}
      sticky={sticky}
    />
  );
  const renderAddons = () =>
    isServiceMode && availableAddons.length > 0 ? (
      <div className="bg-card border border-border rounded-2xl p-6">
        <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Recommended Add-ons
        </h4>
        <div className="space-y-2">
          {availableAddons.map((a) => {
            const checked = selectedAddons.includes(a.id);
            return (
              <button
                type="button"
                key={a.id}
                onClick={() => toggleAddon(a.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all duration-200 flex items-start gap-3",
                  checked ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                    checked ? "border-primary bg-primary" : "border-muted-foreground",
                  )}
                >
                  {checked && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm text-foreground">{a.label}</span>
                    <span className="font-semibold text-sm text-primary whitespace-nowrap">
                      +₹{a.price.toLocaleString()}
                    </span>
                  </div>
                  {a.note && <div className="text-xs text-muted-foreground mt-0.5">{a.note}</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    ) : null;

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
              <RadioGroup value={field.value ?? ""} onValueChange={field.onChange} className="flex gap-6">
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
        <FormField control={c} name="pincode" render={({ field }) => (
          <FormItem><FormLabel>Birth PIN Code *</FormLabel><FormControl><Input placeholder="6-digit pincode" maxLength={6} inputMode="numeric" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={c} name="pob" render={({ field }) => (
          <FormItem><FormLabel>Place of Birth *</FormLabel><FormControl><Input placeholder="Auto-filled from PIN — edit if needed" {...field} /></FormControl><FormMessage /></FormItem>
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
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="hindi">Hindi</SelectItem>
                    <SelectItem value="gujarati">Gujarati</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </>
      );
    }

    if (formType === "kundali-multi") {
      const persons: Array<"person1" | "person2" | "person3"> = kundaliCount === 3
        ? ["person1", "person2", "person3"]
        : ["person1", "person2"];
      const accents = ["bg-primary", "bg-amber-500", "bg-pink-500"];
      const PersonBlock = ({ name, title, accent }: { name: string; title: string; accent: string }) => (
        <div className="rounded-xl border border-border p-5 bg-background/40 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${accent}`} />{title}
          </h3>
          <FormField control={c} name={`${name}.fullName`} render={({ field }) => (
            <FormItem><FormLabel>Full Name *</FormLabel><FormControl><Input placeholder="As per Aadhar" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DOBPicker control={c} name={`${name}.dob`} />
            <TOBPicker control={c} name={`${name}.tob`} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={c} name={`${name}.pincode`} render={({ field }) => (
              <FormItem><FormLabel>Birth PIN Code *</FormLabel><FormControl><Input placeholder="6-digit pincode" maxLength={6} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={c} name={`${name}.pob`} render={({ field }) => (
              <FormItem><FormLabel>Place of Birth *</FormLabel><FormControl><Input placeholder="City, State, Country" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={c} name={`${name}.gender`} render={({ field }) => (
            <FormItem>
              <FormLabel>Gender *</FormLabel>
              <FormControl>
                <RadioGroup value={field.value ?? ""} onValueChange={field.onChange} className="flex gap-6">
                  {[["male", "Male"], ["female", "Female"], ["other", "Other"]].map(([v, l]) => (
                    <div key={v} className="flex items-center space-x-2">
                      <RadioGroupItem value={v} id={`${name}-g-${v}`} />
                      <Label htmlFor={`${name}-g-${v}`}>{l}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
      );
      return (
        <>
          <div className="rounded-lg bg-primary/10 border border-primary/30 px-4 py-3 text-sm text-foreground">
            This package covers <strong>{kundaliCount} people</strong>. Please provide birth details for each.
          </div>
          {persons.map((p, i) => (
            <PersonBlock key={p} name={p} title={`Person ${i + 1} — Birth Details`} accent={accents[i]} />
          ))}
          <h3 className="font-semibold text-foreground pt-2">Contact & Report Language</h3>
          {ContactRow}
          <FormField control={c} name="language" render={({ field }) => (
            <FormItem>
              <FormLabel>Report Language *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                  <SelectItem value="gujarati">Gujarati</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
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
          <FormField control={c} name="lastNameChangeOk" render={({ field }) => (
            <FormItem>
              <FormLabel>Are you comfortable making a change in your last name (if required)? *</FormLabel>
              <FormControl>
                <RadioGroup value={field.value ?? ""} onValueChange={field.onChange} className="flex gap-6">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="nc-lnc-yes" /><Label htmlFor="nc-lnc-yes">Yes</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="nc-lnc-no" /><Label htmlFor="nc-lnc-no">No</Label></div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
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
          <DOBPicker control={c} />
          {POBPincode}
          <GenderRadio control={c} />
          {ContactRow}
        </>
      );
    }

    if (formType === "name-correction-couple") {
      const PersonNameCorrBlock = ({ name, title, accent }: { name: "person1" | "person2"; title: string; accent: string }) => (
        <div className="rounded-xl border border-border p-5 bg-background/40 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${accent}`} />{title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={c} name={`${name}.firstName`} render={({ field }) => (
              <FormItem><FormLabel>First Name *</FormLabel><FormControl><Input placeholder="First name" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={c} name={`${name}.middleName`} render={({ field }) => (
              <FormItem><FormLabel>Middle Name</FormLabel><FormControl><Input placeholder="Middle name" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={c} name={`${name}.lastName`} render={({ field }) => (
              <FormItem><FormLabel>Last Name *</FormLabel><FormControl><Input placeholder="Last name" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={c} name={`${name}.middleIsFatherName`} render={({ field }) => (
            <FormItem>
              <FormLabel>Is your middle name your father&apos;s name? *</FormLabel>
              <FormControl>
                <RadioGroup value={field.value ?? ""} onValueChange={field.onChange} className="flex gap-6">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id={`${name}-mfn-yes`} /><Label htmlFor={`${name}-mfn-yes`}>Yes</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="no" id={`${name}-mfn-no`} /><Label htmlFor={`${name}-mfn-no`}>No</Label></div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={c} name={`${name}.lastNameChangeOk`} render={({ field }) => (
            <FormItem>
              <FormLabel>Are you comfortable making a change in your last name (if required)? *</FormLabel>
              <FormControl>
                <RadioGroup value={field.value ?? ""} onValueChange={field.onChange} className="flex gap-6">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id={`${name}-lnc-yes`} /><Label htmlFor={`${name}-lnc-yes`}>Yes</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="no" id={`${name}-lnc-no`} /><Label htmlFor={`${name}-lnc-no`}>No</Label></div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DOBPicker control={c} name={`${name}.dob`} />
            <TOBPicker control={c} name={`${name}.tob`} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={c} name={`${name}.pincode`} render={({ field }) => (
              <FormItem><FormLabel>Birth PIN Code *</FormLabel><FormControl><Input placeholder="6-digit pincode" maxLength={6} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={c} name={`${name}.pob`} render={({ field }) => (
              <FormItem><FormLabel>Place of Birth (Auto-Fetched) *</FormLabel><FormControl><Input placeholder="City, State, Country" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={c} name={`${name}.gender`} render={({ field }) => (
            <FormItem>
              <FormLabel>Gender *</FormLabel>
              <FormControl>
                <RadioGroup value={field.value ?? ""} onValueChange={field.onChange} className="flex gap-6">
                  {[["male", "Male"], ["female", "Female"], ["other", "Other"]].map(([v, l]) => (
                    <div key={v} className="flex items-center space-x-2">
                      <RadioGroupItem value={v} id={`${name}-g-${v}`} />
                      <Label htmlFor={`${name}-g-${v}`}>{l}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["relationFather", "relationMother", "relationSpouse"] as const).map((rel) => (
              <FormField key={rel} control={c} name={`${name}.${rel}`} render={({ field }) => (
                <FormItem>
                  <FormLabel>{rel === "relationFather" ? "With Father" : rel === "relationMother" ? "With Mother" : "With Spouse"} *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="challenging">Challenging</SelectItem>
                      {rel === "relationSpouse" && <SelectItem value="na">Not Applicable</SelectItem>}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={c} name={`${name}.fatherName`} render={({ field }) => (
              <FormItem><FormLabel>Father's Name *</FormLabel><FormControl><Input placeholder="Father's full name" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={c} name={`${name}.motherName`} render={({ field }) => (
              <FormItem><FormLabel>Mother's Name *</FormLabel><FormControl><Input placeholder="Mother's full name" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={c} name={`${name}.spouseName`} render={({ field }) => (
              <FormItem><FormLabel>Spouse's Name</FormLabel><FormControl><Input placeholder="If applicable" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={c} name={`${name}.profession`} render={({ field }) => (
            <FormItem><FormLabel>Profession *</FormLabel><FormControl><Input placeholder="Current profession" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
      );
      return (
        <>
          <div className="rounded-lg bg-primary/10 border border-primary/30 px-4 py-3 text-sm text-foreground">
            This package covers <strong>2 people</strong>. Please provide complete name correction details for both.
          </div>
          <PersonNameCorrBlock name="person1" title="Person 1 — Full Details" accent="bg-primary" />
          <PersonNameCorrBlock name="person2" title="Person 2 — Full Details" accent="bg-amber-500" />
          <h3 className="font-semibold text-foreground pt-2">Contact Details</h3>
          {ContactRow}
          <FormField control={c} name="reason" render={({ field }) => (
            <FormItem><FormLabel>Reason for Name Correction *</FormLabel>
              <FormControl><Textarea placeholder="Share your goals, struggles, and what you'd like to improve for both people." className="min-h-[140px] resize-none" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </>
      );
    }

    if (formType === "couple" || formType === "pyaar-shastra") {
      const isPyaar = formType === "pyaar-shastra";
      const PersonBlock = ({ name, title, accent }: { name: "person1" | "person2"; title: string; accent: string }) => (
        <div className="rounded-xl border border-border p-5 bg-background/40 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${accent}`} />{title}
          </h3>
          <FormField control={c} name={`${name}.fullName`} render={({ field }) => (
            <FormItem><FormLabel>Full Name *</FormLabel><FormControl><Input placeholder="Full name" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={c} name={`${name}.gender`} render={({ field }) => (
            <FormItem>
              <FormLabel>Gender *</FormLabel>
              <FormControl>
                <RadioGroup value={field.value ?? ""} onValueChange={field.onChange} className="flex gap-6">
                  {[["male", "Male"], ["female", "Female"], ["other", "Other"]].map(([v, l]) => (
                    <div key={v} className="flex items-center space-x-2">
                      <RadioGroupItem value={v} id={`${name}-g-${v}`} />
                      <Label htmlFor={`${name}-g-${v}`}>{l}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DOBPicker control={c} name={`${name}.dob`} />
            <TOBPicker control={c} name={`${name}.tob`} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={c} name={`${name}.pincode`} render={({ field }) => (
              <FormItem><FormLabel>Birth PIN Code *</FormLabel><FormControl><Input placeholder="6-digit pincode" maxLength={6} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={c} name={`${name}.pob`} render={({ field }) => (
              <FormItem><FormLabel>Place of Birth *</FormLabel><FormControl><Input placeholder="Auto-filled from PIN — edit if needed" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        </div>
      );
      return (
        <>
          <div className="rounded-lg bg-primary/10 border border-primary/30 px-4 py-3 text-sm text-foreground">
            This package covers <strong>2 people</strong>. Please provide birth details for both.
          </div>
          {isPyaar
            ? <PersonBlock name="person1" title="Male Partner Details" accent="bg-blue-500" />
            : <PersonBlock name="person1" title="Person 1 Details" accent="bg-primary" />}
          {isPyaar
            ? <PersonBlock name="person2" title="Female Partner Details" accent="bg-pink-500" />
            : <PersonBlock name="person2" title="Person 2 Details" accent="bg-amber-500" />}
          <h3 className="font-semibold text-foreground pt-2">Contact Details</h3>
          {ContactRow}
          {isPyaar && (
            <FormField control={c} name="language" render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Report Language *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="hindi">Hindi</SelectItem>
                    <SelectItem value="gujarati">Gujarati</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          )}
        </>
      );
    }

    if (EXTENDED_FORM_TYPES.includes(formType as ExtendedFormType)) {
      const EmailField = ({ control: emailControl }: { control: any }) => (
        <FormField control={emailControl} name="email" render={({ field }) => (
          <FormItem><FormLabel>Email ID *</FormLabel><FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      );
      return (
        <ExtendedPaymentFields
          formType={formType as ExtendedFormType}
          serviceName={serviceName ?? undefined}
          control={c}
          DOBPicker={DOBPicker}
          TOBPicker={TOBPicker}
          GenderRadio={GenderRadio}
          WhatsappField={WhatsappField}
          EmailField={EmailField}
        />
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

                    {/* Mobile: Order Summary on top, add-ons below */}
                    <div className="lg:hidden space-y-6">
                      {renderOrderSummary(false)}
                      {renderAddons()}
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing || (!isServiceMode && !selectedPackage) || (isServiceMode && !canSubmitService)}
                      className={`w-full py-4 text-lg rounded-xl font-semibold text-white transition-all duration-300 bg-gradient-to-r ${heroColor} hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isProcessing ? "Processing..." : `Pay ₹${displayPrice.toLocaleString()}`}
                    </button>

                    {isServiceMode && serviceLoading && (
                      <div className="mt-3 text-sm text-muted-foreground">Loading service pricing...</div>
                    )}
                    {isServiceMode && serviceError && (
                      <div className="mt-3 text-sm text-red-500">{serviceError}</div>
                    )}

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 text-secondary" />
                      <span>Your payment is secured with 256-bit SSL encryption</span>
                    </div>
                  </form>
                </Form>
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block space-y-6"
            >
              {/* Plan selector (consultation only) */}
              {!isServiceMode && currentPackage && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-display text-xl font-bold text-foreground mb-4">Select Your Plan</h3>
                  <div className="space-y-3">
                    {currentPackage.options.map((option) => (
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
                </div>
              )}

              {/* Order Summary + add-ons stick together while scrolling */}
              <div className="lg:sticky lg:top-24 space-y-6">
                {renderOrderSummary(false)}
                {renderAddons()}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PaymentPage;
