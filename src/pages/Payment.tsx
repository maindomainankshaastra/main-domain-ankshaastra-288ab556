import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { useSearchParams } from "react-router-dom";
import { Shield, Check, MessageSquare, Phone, Video, CalendarIcon, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

// Consultation packages (only used when type= param is present)
const consultationPackages = {
  whatsapp: {
    name: "WhatsApp Notes",
    icon: MessageSquare,
    color: "from-green-500 to-green-600",
    options: [
      { id: "whatsapp-3", label: "3 Questions", price: 497 },
      { id: "whatsapp-6", label: "6 Questions", price: 777 },
      { id: "whatsapp-10", label: "10 Questions", price: 1111 },
    ],
  },
  audio: {
    name: "1:1 Audio Call",
    icon: Phone,
    color: "from-primary to-accent",
    options: [
      { id: "audio-45", label: "45 Minutes", price: 1987 },
      { id: "audio-60", label: "60 Minutes", price: 2496 },
      { id: "audio-75", label: "75 Minutes", price: 3108 },
    ],
  },
  video: {
    name: "1:1 Video Call",
    icon: Video,
    color: "from-blue-500 to-purple-500",
    options: [
      { id: "video-45", label: "45 Minutes", price: 3648 },
      { id: "video-60", label: "60 Minutes", price: 4297 },
      { id: "video-75", label: "75 Minutes", price: 4986 },
    ],
  },
};

// Validation schema
const bookingSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50).regex(/^[a-zA-Z\s]+$/, "First name can only contain letters"),
  middleName: z.string().trim().max(50).regex(/^[a-zA-Z\s]*$/, "Middle name can only contain letters").optional().or(z.literal("")),
  lastName: z.string().trim().min(1, "Last name is required").max(50).regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters"),
  dateOfBirth: z.date({ required_error: "Date of birth is required" }),
  timeOfBirth: z.string().trim().min(1, "Time of birth is required").regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time (HH:MM)"),
  mobileNumber: z.string().trim().min(10, "Mobile number must be at least 10 digits").max(15).regex(/^[+]?[0-9]{10,15}$/, "Please enter a valid mobile number"),
  email: z.string().trim().min(1, "Email is required").email("Please enter a valid email address").max(100),
  placeOfBirth: z.string().trim().min(1, "Place of birth is required").max(100),
  problemAreas: z.string().trim().min(10, "Please describe your problem areas (at least 10 characters)").max(1000),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const PaymentPage = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // Determine mode: "service" (generic) or "consultation"
  const serviceName = searchParams.get("service");
  const serviceAmount = searchParams.get("amount");
  const consultationType = searchParams.get("type") as keyof typeof consultationPackages;
  
  const isServiceMode = !!(serviceName && serviceAmount);
  const servicePrice = serviceAmount ? parseInt(serviceAmount, 10) : 0;
  
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPackage = isServiceMode ? null : (consultationPackages[consultationType] || consultationPackages.audio);
  const selectedOption = currentPackage?.options.find(opt => opt.id === selectedPackage);

  useEffect(() => {
    if (currentPackage && currentPackage.options.length > 0 && !selectedPackage) {
      setSelectedPackage(currentPackage.options[0].id);
    }
  }, [currentPackage, selectedPackage]);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: "", middleName: "", lastName: "", timeOfBirth: "",
      mobileNumber: "", email: "", placeOfBirth: "", problemAreas: "",
    },
  });

  const loadRazorpay = () => {
    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (amount: number, formData: BookingFormData) => {
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

    const options = {
      key: "YOUR_KEY_ID",
      amount: order.amount,
      currency: "INR",
      name: "Ankshaastra",
      description: isServiceMode ? serviceName : "Consultation Booking",
      order_id: order.id,
      handler: async function (response: any) {
        console.log("Payment Success:", response);
        try {
          await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
        } catch (e) {
          console.error("Verification failed", e);
        }
      },
      prefill: {
        name: formData.firstName,
        email: formData.email,
        contact: formData.mobileNumber,
      },
      theme: { color: "#ea580c" },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  };

  const onSubmit = async (data: BookingFormData) => {
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
          <div className={`grid grid-cols-1 ${isServiceMode ? 'lg:grid-cols-3' : 'lg:grid-cols-3'} gap-8 max-w-6xl mx-auto`}>
            {/* Booking Form */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">Your Details</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField control={form.control} name="firstName" render={({ field }) => (
                        <FormItem><FormLabel>First Name (As per Aadhar) *</FormLabel><FormControl><Input placeholder="First name" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="middleName" render={({ field }) => (
                        <FormItem><FormLabel>Middle Name (Optional)</FormLabel><FormControl><Input placeholder="Middle name" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="lastName" render={({ field }) => (
                        <FormItem><FormLabel>Last Name (As per Aadhar) *</FormLabel><FormControl><Input placeholder="Last name" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>

                    {/* Date and Time of Birth */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date of Birth *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus className={cn("p-3 pointer-events-auto")} />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="timeOfBirth" render={({ field }) => (
                        <FormItem><FormLabel>Time of Birth *</FormLabel><FormControl><Input type="time" placeholder="HH:MM" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="mobileNumber" render={({ field }) => (
                        <FormItem><FormLabel>Mobile Number *</FormLabel><FormControl><Input placeholder="+91 98765 43210" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email Address *</FormLabel><FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>

                    {/* Place of Birth */}
                    <FormField control={form.control} name="placeOfBirth" render={({ field }) => (
                      <FormItem><FormLabel>Place of Birth *</FormLabel><FormControl><Input placeholder="City, State, Country" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />

                    {/* Problem Areas */}
                    <FormField control={form.control} name="problemAreas" render={({ field }) => (
                      <FormItem><FormLabel>Problem Areas *</FormLabel><FormControl>
                        <Textarea placeholder="Please describe the areas you need guidance with (career, health, relationships, finance, etc.)" className="min-h-[120px] resize-none" {...field} />
                      </FormControl><FormMessage /></FormItem>
                    )} />

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
