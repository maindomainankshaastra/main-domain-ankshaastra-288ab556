import type { LucideIcon } from "lucide-react";
import {
  Phone, ScrollText, Baby, Calendar, Star, Car, Palette, Smartphone, Home, Heart,
  Building2, Tag, Landmark, MapPin, Grid3X3, Store, Building, Users, Sparkles,
} from "lucide-react";

export type NavItem = {
  name: string;
  path: string;
  description?: string;
  icon?: LucideIcon;
  external?: boolean;
};

export const reportsNavItems: NavItem[] = [
  {
    name: "Varshphal Report",
    path: "/reports/varshphal-report",
    icon: Calendar,
    description: "Your complete yearly numerology guide for 2026",
  },
  {
    name: "Pyaar Shaastra Report",
    path: "/reports/pyaar-shastra",
    icon: ScrollText,
    description: "Love & life quality compatibility report",
  },
];

export const servicesNavItems: NavItem[] = [
  { name: "1:1 Call Consultation", path: "/services/call-consultation", icon: Phone, description: "Audio or video consultation" },
  { name: "Premium Personalised Kundli 2.0", path: "/reports/personalized-kundali", icon: Star, description: "Personalized kundli report" },
  { name: "Name Correction", path: "/services/name-correction", icon: ScrollText, description: "Align your name vibration" },
  { name: "Perfect Baby Name", path: "https://empower.ankshaastra.com", icon: Baby, description: "Auspicious baby naming", external: true },
  { name: "C-Section Dates", path: "https://miraclebaby.ankshaastra.com", icon: Calendar, description: "Auspicious birth dates", external: true },
  { name: "Lucky Vehicle Number", path: "/services/lucky-vehicle-number", icon: Car, description: "₹1,097" },
  { name: "Lucky Vehicle Color", path: "/services/lucky-vehicle-color", icon: Palette, description: "₹497" },
  { name: "Lucky Vehicle Purchase Date", path: "/services/lucky-vehicle-purchase-date", icon: Calendar, description: "₹1,097" },
  { name: "Lucky Mobile Number", path: "/services/lucky-mobile-number", icon: Smartphone, description: "₹1,097" },
  { name: "Lucky Flat Number", path: "/services/lucky-flat-number", icon: Home, description: "₹1,097" },
  { name: "Relationship Analysis", path: "/services/relationship-analysis", icon: Heart, description: "₹917" },
  { name: "Business Name Correction", path: "/services/business-name-correction", icon: Building2, description: "₹4,967" },
  { name: "Business Mobile Number", path: "/services/business-mobile-number", icon: Phone, description: "₹1,457" },
  { name: "Business Tagline Analysis", path: "/services/business-tagline-analysis", icon: Tag, description: "₹1,457" },
  { name: "Company Registration Date", path: "/services/company-registration-date", icon: Landmark, description: "₹1,997" },
  { name: "Company Bank Account Opening Date", path: "/services/company-bank-account-opening-date", icon: Landmark, description: "₹1,997" },
  { name: "Land Purchase Date", path: "/services/land-purchase-date", icon: MapPin, description: "₹1,997" },
  { name: "Plot Number Analysis", path: "/services/plot-number-analysis", icon: Grid3X3, description: "₹1,457" },
  { name: "Exhibition Stall Number", path: "/services/exhibition-stall-number", icon: Store, description: "₹917" },
  { name: "Commercial Space Analysis", path: "/services/commercial-space-analysis", icon: Building, description: "₹2,447" },
  { name: "Business Partner Compatibility", path: "/services/business-partner-compatibility", icon: Users, description: "₹1,997" },
  { name: "Office Vastu Services", path: "/services/office-vastu", icon: Sparkles, description: "Remote & onsite packages" },
];
